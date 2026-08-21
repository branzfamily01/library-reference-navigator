const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const els={
  query:$('#queryInput'),search:$('#searchBtn'),results:$('#resultsSection'),loading:$('#loading'),loadingText:$('#loadingText'),signature:$('#signatureGrid'),list:$('#resultList'),count:$('#resultCount'),intent:$('#intentSummary'),status:$('#libraryStatus'),dataDialog:$('#dataDialog'),bookDialog:$('#bookDialog'),csv:$('#csvInput'),progress:$('#importProgress'),bar:$('#progressBar'),progressLabel:$('#progressLabel'),statBooks:$('#statBooks'),statMode:$('#statMode'),statEnriched:$('#statEnriched'),quality:$('#searchQuality'),enrichmentBanner:$('#enrichmentBanner'),enrichmentText:$('#enrichmentText'),enrichToggle:$('#enrichToggle')
};
let books=self.PROTOTYPE_BOOKS||[];let mode='試用データ';let lastResults=[];let lastResultData=null;let searchWorker;let searchSeq=0;let activeOptions=null;let enrichmentCache={};let enrichmentSaveTimer=null;
const MAX_LIVE_ENRICH=8;

function initWorker(){
  searchWorker=new Worker('js/search-worker.js');
  searchWorker.onmessage=e=>{
    const d=e.data||{};
    if(d.type==='results')handleLocalResults(d.data);
    if(d.type==='reranked')handleReranked(d.data);
  };
  searchWorker.postMessage({type:'setBooks',payload:books});
}
function idbOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open('library-reference-navigator',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('state'))r.result.createObjectStore('state')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});}
async function idbGet(k){try{const db=await idbOpen();return await new Promise((res,rej)=>{const t=db.transaction('state','readonly').objectStore('state').get(k);t.onsuccess=()=>res(t.result);t.onerror=()=>rej(t.error)})}catch{return null}}
async function idbSet(k,v){try{const db=await idbOpen();return await new Promise((res,rej)=>{const t=db.transaction('state','readwrite').objectStore('state').put(v,k);t.onsuccess=()=>res();t.onerror=()=>rej(t.error)})}catch{}}
async function idbDelete(k){try{const db=await idbOpen();return await new Promise((res,rej)=>{const t=db.transaction('state','readwrite').objectStore('state').delete(k);t.onsuccess=()=>res();t.onerror=()=>rej(t.error)})}catch{}}

function scheduleCacheSave(){clearTimeout(enrichmentSaveTimer);enrichmentSaveTimer=setTimeout(()=>idbSet('enrichmentCache',enrichmentCache),500);}
function setLibrary(newBooks,newMode){books=newBooks;mode=newMode;searchWorker?.postMessage({type:'setBooks',payload:books});updateStatus();}
function updateStatus(){els.status.textContent=`${mode} ${books.length.toLocaleString()}冊`;els.statBooks.textContent=`${books.length.toLocaleString()}冊`;els.statMode.textContent=mode;updateEnrichmentStat();}
function updateEnrichmentStat(){const n=Object.values(enrichmentCache).filter(x=>x&&!x.notFound).length;if(els.statEnriched)els.statEnriched.textContent=`${n.toLocaleString()}冊`;}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function metaLine(b){return [b.author,b.publisher,b.year].filter(Boolean).map(escapeHtml).join(' ｜ ')||'書誌情報なし';}
function sourceBadge(b){if(b.enriched&&b.bookMeta?.description)return'<span class="evidence-badge strong">紹介文照合</span>';if(b.enriched)return'<span class="evidence-badge">書誌補完</span>';return'<span class="evidence-badge local">蔵書情報</span>';}
function bookCard(b,label){if(!b)return'';return `<article class="book-card signature-card"><div class="card-topline"><div class="pick-label">${escapeHtml(label)}</div>${sourceBadge(b)}</div><h3>${escapeHtml(b.title)}</h3><div class="meta">${metaLine(b)}</div><div class="reason">${escapeHtml(b.reason)}</div><div class="match-tags">${(b.tags||[]).map(t=>`<span class="match-tag">${escapeHtml(t)}</span>`).join('')}</div><div class="callno">請求記号<br><strong>${escapeHtml(b.call||'未登録')}</strong></div><button class="card-btn" data-book-id="${escapeHtml(b.id)}">詳しく見る</button></article>`;}
function renderResults(data,phase='local'){
  els.loading.classList.add('hidden');els.results.classList.remove('hidden');lastResultData=data;lastResults=data.results||[];
  const intents=(data.intent||[]).filter(Boolean);els.intent.textContent=`読み取った条件：${intents.length?intents.join(' / '):'入力語を中心に検索'}`;
  els.signature.innerHTML=bookCard(data.picks?.direct,'① ど真ん中')+bookCard(data.picks?.surprise,'② 意外な一冊')+bookCard(data.picks?.easy,'③ 読みやすい入口');
  els.list.innerHTML=lastResults.slice(3,18).map(b=>`<button class="list-card" data-book-id="${escapeHtml(b.id)}"><div><div class="list-title-row"><h4>${escapeHtml(b.title)}</h4>${sourceBadge(b)}</div><p>${metaLine(b)}<br>請求記号：${escapeHtml(b.call||'未登録')}</p></div><span class="score-pill">適合 ${b.match}%</span></button>`).join('');
  els.count.textContent=`上位 ${Math.min(lastResults.length,18)}冊を表示`;
  if(els.quality){els.quality.textContent=phase==='enriched'?`第二段階：書誌補完済み ${data.enrichedCount||0}冊`:'第一段階：ローカル候補抽出';els.quality.classList.toggle('done',phase==='enriched');}
  $$('[data-book-id]').forEach(btn=>btn.addEventListener('click',()=>openBook(btn.dataset.bookId)));
  if(phase==='local')els.results.scrollIntoView({behavior:'smooth',block:'start'});
}
function currentOptions(){return{query:els.query.value.trim(),type:$('#typeFilter').value,length:$('#lengthFilter').value,year:$('#yearFilter').value,seq:searchSeq};}
function doSearch(){
  if(!els.query.value.trim()){els.query.focus();els.query.placeholder='どんな本を探したいか、ひとこと書いてください';return;}
  searchSeq++;activeOptions=currentOptions();activeOptions.seq=searchSeq;
  els.results.classList.add('hidden');els.loading.classList.remove('hidden');hideEnrichmentBanner();els.loadingText.textContent=`${books.length.toLocaleString()}冊から、テーマ・Mood・分類を照合しています…`;
  setTimeout(()=>searchWorker.postMessage({type:'search',payload:activeOptions}),90);
}
function handleLocalResults(data){
  renderResults(data,'local');
  if(!els.enrichToggle?.checked){hideEnrichmentBanner();return;}
  startEnrichment(data,activeOptions,searchSeq);
}
function showEnrichmentBanner(text,busy=true){if(!els.enrichmentBanner)return;els.enrichmentBanner.classList.remove('hidden');els.enrichmentBanner.classList.toggle('busy',busy);els.enrichmentText.textContent=text;}
function hideEnrichmentBanner(){els.enrichmentBanner?.classList.add('hidden');}

function normalizeLoose(s=''){return String(s).normalize('NFKC').toLowerCase().replace(/著|編|訳|監修|原作|作/g,'').replace(/[^\p{L}\p{N}]+/gu,'');}
function dice(a,b){a=normalizeLoose(a);b=normalizeLoose(b);if(!a||!b)return 0;if(a===b)return 1;const grams=x=>{const out=[];for(let i=0;i<x.length-1;i++)out.push(x.slice(i,i+2));return out};const ga=grams(a),gb=grams(b);if(!ga.length||!gb.length)return a.includes(b)||b.includes(a)?0.8:0;const bag=new Map();gb.forEach(g=>bag.set(g,(bag.get(g)||0)+1));let hit=0;ga.forEach(g=>{const n=bag.get(g)||0;if(n){hit++;bag.set(g,n-1)}});return 2*hit/(ga.length+gb.length);}
function firstAuthor(author=''){return String(author).split(/[／/∥,，;]/)[0].replace(/\s*(著|編|訳|監修|原作|作)$/,'').trim().slice(0,40);}
function cleanTitle(title=''){return String(title).replace(/[［\[].*?[］\]]/g,' ').replace(/\s+/g,' ').trim().slice(0,100);}
function stripHtml(s=''){const tmp=document.createElement('div');tmp.innerHTML=String(s);return (tmp.textContent||tmp.innerText||'').replace(/\s+/g,' ').trim();}
function candidateScore(book,info){
  const titleScore=dice(book.title,info.title||'');const authors=(info.authors||[]).join(' ');const authorScore=book.author?Math.max(...String(book.author).split(/[／/∥,，;]/).map(a=>dice(a,authors)),0):0;const publisherScore=book.publisher&&info.publisher?dice(book.publisher,info.publisher):0;
  let score=titleScore*70+authorScore*22+publisherScore*6;
  const y1=String(book.year||'').match(/(19|20)\d{2}/)?.[0],y2=String(info.publishedDate||'').match(/(19|20)\d{2}/)?.[0];if(y1&&y2&&y1===y2)score+=4;
  return score;
}
async function fetchGoogleMetadata(book){
  const cached=enrichmentCache[String(book.id)];if(cached){if(cached.notFound&&Date.now()-(cached.fetchedAt||0)<7*864e5)return null;if(!cached.notFound)return cached;}
  const title=cleanTitle(book.title),author=firstAuthor(book.author);if(!title)return null;
  const q=`intitle:${title}${author?` inauthor:${author}`:''}`;const url=`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&langRestrict=ja&projection=full`;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try{
    const resp=await fetch(url,{signal:controller.signal,mode:'cors',credentials:'omit'});if(!resp.ok)throw new Error(`HTTP ${resp.status}`);const json=await resp.json();const items=json.items||[];
    let best=null,bestScore=0;
    for(const item of items){const info=item.volumeInfo||{};const s=candidateScore(book,info);if(s>bestScore){bestScore=s;best={item,info};}}
    if(!best||bestScore<48){enrichmentCache[String(book.id)]={notFound:true,fetchedAt:Date.now()};scheduleCacheSave();return null;}
    const ids=best.info.industryIdentifiers||[];const isbn13=ids.find(x=>x.type==='ISBN_13')?.identifier||'';const isbn10=ids.find(x=>x.type==='ISBN_10')?.identifier||'';
    const meta={source:'Google Books',googleId:best.item.id||'',title:best.info.title||'',subtitle:best.info.subtitle||'',authors:best.info.authors||[],publisher:best.info.publisher||'',publishedDate:best.info.publishedDate||'',description:stripHtml(best.info.description||'').slice(0,1800),categories:best.info.categories||[],pageCount:best.info.pageCount||null,isbn13,isbn10,infoLink:best.info.infoLink||'',matchConfidence:Math.round(Math.min(99,bestScore)),fetchedAt:Date.now()};
    enrichmentCache[String(book.id)]=meta;scheduleCacheSave();return meta;
  }catch(err){return null;}finally{clearTimeout(timer);}
}
async function mapLimit(items,limit,fn,onProgress){let index=0,done=0;const out=new Array(items.length);async function runner(){while(true){const i=index++;if(i>=items.length)return;out[i]=await fn(items[i],i);done++;onProgress?.(done,items.length);}}await Promise.all(Array.from({length:Math.min(limit,items.length)},runner));return out;}
async function startEnrichment(data,opts,seq){
  if(!navigator.onLine){showEnrichmentBanner('オフラインのため、今回は端末内の蔵書情報だけで検索しました。',false);return;}
  const candidates=(data.results||[]).slice(0,18);if(!candidates.length)return;
  const existing={};const missing=[];
  for(const b of candidates){const c=enrichmentCache[String(b.id)];if(c&&!c.notFound)existing[String(b.id)]=c;else if(!c||Date.now()-(c.fetchedAt||0)>7*864e5)missing.push(b);}
  const live=missing.slice(0,MAX_LIVE_ENRICH);showEnrichmentBanner(Object.keys(existing).length?`保存済み書誌 ${Object.keys(existing).length}冊を使い、追加候補を補完しています…`:`候補本の紹介文・カテゴリを照合しています…`);
  await mapLimit(live,4,fetchGoogleMetadata,(done,total)=>showEnrichmentBanner(`書誌情報を補完中… ${done}/${total}冊`));
  if(seq!==searchSeq)return;
  const enrichments={};for(const b of candidates){const c=enrichmentCache[String(b.id)];if(c&&!c.notFound)enrichments[String(b.id)]=c;}
  updateEnrichmentStat();
  if(!Object.keys(enrichments).length){showEnrichmentBanner('外部書誌を取得できなかったため、ローカル検索結果を維持しています。',false);return;}
  showEnrichmentBanner(`${Object.keys(enrichments).length}冊の紹介文・カテゴリを使って最終順位を調整しています…`);
  searchWorker.postMessage({type:'rerank',payload:{results:data.results,opts,seq,enrichments}});
}
function handleReranked(data){if(!data)return;renderResults({...data,intent:data.intent?.length?data.intent:lastResultData?.intent||[]},'enriched');showEnrichmentBanner(`書誌補完を使って ${data.enrichedCount||0}冊を再評価しました。検索文そのものは外部送信していません。`,false);}

function openBook(id){const b=lastResults.find(x=>String(x.id)===String(id))||books.find(x=>String(x.id)===String(id));if(!b)return;const m=b.bookMeta||enrichmentCache[String(b.id)]||null;
  const summary=m?.description?`<div class="summary-box"><span class="eyebrow">BOOK SUMMARY</span><p>${escapeHtml(m.description)}</p></div>`:'';
  const cats=m?.categories?.length?`<div class="detail-item"><span>カテゴリ</span><strong>${escapeHtml(m.categories.join(' / '))}</strong></div>`:'';
  const isbn=m?.isbn13||m?.isbn10?`<div class="detail-item"><span>ISBN（書誌補完）</span><strong>${escapeHtml(m.isbn13||m.isbn10)}</strong></div>`:'';
  const source=m?`<div class="source-note">書誌補完：${escapeHtml(m.source)} ／ 照合信頼度 ${escapeHtml(m.matchConfidence||'—')}%</div>`:'<div class="source-note">この本は現在、モンスターライブラリーCSVの情報だけで判定しています。</div>';
  $('#bookDialogTitle').textContent=b.title;$('#bookDialogBody').innerHTML=`<div class="detail-grid"><div class="detail-item"><span>著者</span><strong>${escapeHtml(b.author||m?.authors?.join('、')||'未登録')}</strong></div><div class="detail-item"><span>出版社</span><strong>${escapeHtml(b.publisher||m?.publisher||'未登録')}</strong></div><div class="detail-item"><span>出版年</span><strong>${escapeHtml(b.year||m?.publishedDate||'未登録')}</strong></div><div class="detail-item"><span>ページ</span><strong>${escapeHtml(b.pages||m?.pageCount||'未登録')}</strong></div><div class="detail-item"><span>請求記号</span><strong>${escapeHtml(b.call||'未登録')}</strong></div><div class="detail-item"><span>登録番号</span><strong>${escapeHtml(b.id||'未登録')}</strong></div>${cats}${isbn}</div>${b.reason?`<div class="explain-box"><strong>今回の検索で出た理由</strong><br>${escapeHtml(b.reason)}</div>`:''}${summary}${source}<div class="warning-box">紹介文・カテゴリは外部書誌情報を照合して補完します。Moodはその記述から推定した検索用指標であり、作品評価そのものではありません。</div>`;els.bookDialog.showModal();}

$$('#exampleChips .chip').forEach(b=>b.addEventListener('click',()=>{els.query.value=b.dataset.query;doSearch();}));
$('#refineChips').addEventListener('click',e=>{const b=e.target.closest('[data-refine]');if(!b)return;els.query.value=`${els.query.value}。${b.dataset.refine}`;doSearch();});
els.search.addEventListener('click',doSearch);els.query.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')doSearch();});
$('#editSearchBtn').addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});els.query.focus();});
$('#openDataBtn').addEventListener('click',()=>els.dataDialog.showModal());

els.csv.addEventListener('change',async()=>{
  const file=els.csv.files?.[0];if(!file)return;
  els.progress.classList.remove('hidden');els.bar.style.width='4%';els.progressLabel.textContent='ファイルを読み込んでいます…';
  try{
    const text=await file.text();const worker=new Worker('js/csv-worker.js');
    worker.onmessage=async e=>{const d=e.data;if(d.type==='progress'){els.bar.style.width=`${d.percent}%`;els.progressLabel.textContent=d.label;}
      if(d.type==='done'){if(!d.books?.length){els.progressLabel.textContent='蔵書データを認識できませんでした。';return;}els.bar.style.width='100%';els.progressLabel.textContent=`${d.books.length.toLocaleString()}冊を読み込みました。端末に保存しています…`;setLibrary(d.books,'モンスターCSV');await idbSet('library',{books:d.books,mode:'モンスターCSV',savedAt:Date.now()});setTimeout(()=>{els.progressLabel.textContent=`完了：${d.books.length.toLocaleString()}冊を検索できます。`;},200);worker.terminate();}
    };worker.postMessage({text});
  }catch(err){els.progressLabel.textContent='読み込みに失敗しました。CSV形式を確認してください。';}
});
$('#resetDataBtn').addEventListener('click',async()=>{await idbDelete('library');setLibrary(self.PROTOTYPE_BOOKS||[],'試用データ');els.progress.classList.add('hidden');els.csv.value='';});
$('#clearMetadataBtn')?.addEventListener('click',async()=>{enrichmentCache={};await idbDelete('enrichmentCache');updateEnrichmentStat();$('#metadataMessage').textContent='書誌補完キャッシュを削除しました。';});

(async function init(){
  initWorker();enrichmentCache=await idbGet('enrichmentCache')||{};const saved=await idbGet('library');if(saved?.books?.length)setLibrary(saved.books,saved.mode||'モンスターCSV');else updateStatus();
  if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
