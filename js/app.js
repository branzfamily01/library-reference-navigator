const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const els={query:$('#queryInput'),search:$('#searchBtn'),results:$('#resultsSection'),loading:$('#loading'),loadingText:$('#loadingText'),signature:$('#signatureGrid'),list:$('#resultList'),count:$('#resultCount'),intent:$('#intentSummary'),status:$('#libraryStatus'),dataDialog:$('#dataDialog'),bookDialog:$('#bookDialog'),csv:$('#csvInput'),progress:$('#importProgress'),bar:$('#progressBar'),progressLabel:$('#progressLabel'),statBooks:$('#statBooks'),statMode:$('#statMode')};
let books=self.PROTOTYPE_BOOKS||[];let mode='試用データ';let lastResults=[];let searchWorker;

function initWorker(){
  searchWorker=new Worker('js/search-worker.js');
  searchWorker.onmessage=e=>{if(e.data.type==='results')renderResults(e.data.data);};
  searchWorker.postMessage({type:'setBooks',payload:books});
}
function idbOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open('library-reference-navigator',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('state'))r.result.createObjectStore('state')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});}
async function idbGet(k){try{const db=await idbOpen();return await new Promise((res,rej)=>{const t=db.transaction('state','readonly').objectStore('state').get(k);t.onsuccess=()=>res(t.result);t.onerror=()=>rej(t.error)})}catch{return null}}
async function idbSet(k,v){try{const db=await idbOpen();return await new Promise((res,rej)=>{const t=db.transaction('state','readwrite').objectStore('state').put(v,k);t.onsuccess=()=>res();t.onerror=()=>rej(t.error)})}catch{}}
async function idbDelete(k){try{const db=await idbOpen();return await new Promise((res,rej)=>{const t=db.transaction('state','readwrite').objectStore('state').delete(k);t.onsuccess=()=>res();t.onerror=()=>rej(t.error)})}catch{}}

function setLibrary(newBooks,newMode){books=newBooks;mode=newMode;searchWorker?.postMessage({type:'setBooks',payload:books});updateStatus();}
function updateStatus(){els.status.textContent=`${mode} ${books.length.toLocaleString()}冊`;els.statBooks.textContent=`${books.length.toLocaleString()}冊`;els.statMode.textContent=mode;}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function metaLine(b){return [b.author,b.publisher,b.year].filter(Boolean).map(escapeHtml).join(' ｜ ')||'書誌情報なし';}
function bookCard(b,label){if(!b)return'';return `<article class="book-card signature-card"><div class="pick-label">${escapeHtml(label)}</div><h3>${escapeHtml(b.title)}</h3><div class="meta">${metaLine(b)}</div><div class="reason">${escapeHtml(b.reason)}</div><div class="match-tags">${(b.tags||[]).map(t=>`<span class="match-tag">${escapeHtml(t)}</span>`).join('')}</div><div class="callno">請求記号<br><strong>${escapeHtml(b.call||'未登録')}</strong></div><button class="card-btn" data-book-id="${escapeHtml(b.id)}">詳しく見る</button></article>`;}
function renderResults(data){
  els.loading.classList.add('hidden');els.results.classList.remove('hidden');lastResults=data.results||[];
  els.intent.textContent=`読み取った条件：${(data.intent||[]).join(' / ')}　※試作版は書名・分類・書誌情報から推定`;
  els.signature.innerHTML=bookCard(data.picks.direct,'① ど真ん中')+bookCard(data.picks.surprise,'② 意外な一冊')+bookCard(data.picks.easy,'③ 読みやすい入口');
  els.list.innerHTML=lastResults.slice(3,18).map(b=>`<button class="list-card" data-book-id="${escapeHtml(b.id)}"><div><h4>${escapeHtml(b.title)}</h4><p>${metaLine(b)}<br>請求記号：${escapeHtml(b.call||'未登録')}</p></div><span class="score-pill">候補 ${b.match}%</span></button>`).join('');
  els.count.textContent=`上位 ${Math.min(lastResults.length,18)}冊を表示`;
  $$('[data-book-id]').forEach(btn=>btn.addEventListener('click',()=>openBook(btn.dataset.bookId)));
  els.results.scrollIntoView({behavior:'smooth',block:'start'});
}
function currentOptions(){return{query:els.query.value.trim(),type:$('#typeFilter').value,length:$('#lengthFilter').value,year:$('#yearFilter').value};}
function doSearch(){
  const opts=currentOptions(); if(!opts.query){els.query.focus();els.query.placeholder='どんな本を探したいか、ひとこと書いてください';return;}
  els.results.classList.add('hidden');els.loading.classList.remove('hidden');els.loadingText.textContent=`${books.length.toLocaleString()}冊から、テーマと分類を照合しています…`;
  setTimeout(()=>searchWorker.postMessage({type:'search',payload:opts}),120);
}
function openBook(id){const b=lastResults.find(x=>String(x.id)===String(id))||books.find(x=>String(x.id)===String(id));if(!b)return;
  $('#bookDialogTitle').textContent=b.title;$('#bookDialogBody').innerHTML=`<div class="detail-grid"><div class="detail-item"><span>著者</span><strong>${escapeHtml(b.author||'未登録')}</strong></div><div class="detail-item"><span>出版社</span><strong>${escapeHtml(b.publisher||'未登録')}</strong></div><div class="detail-item"><span>出版年</span><strong>${escapeHtml(b.year||'未登録')}</strong></div><div class="detail-item"><span>ページ</span><strong>${escapeHtml(b.pages||'未登録')}</strong></div><div class="detail-item"><span>請求記号</span><strong>${escapeHtml(b.call||'未登録')}</strong></div><div class="detail-item"><span>登録番号</span><strong>${escapeHtml(b.id||'未登録')}</strong></div></div>${b.reason?`<div class="explain-box"><strong>今回の検索で出た理由</strong><br>${escapeHtml(b.reason)}</div>`:''}<div class="warning-box">このプロトタイプは、モンスターライブラリーCSVに含まれる書名・著者・出版社・出版年・ページ・請求記号などを使った検索です。あらすじやMoodの本格的な意味検索は次段階で書誌情報を補完して精度検証します。</div>`;els.bookDialog.showModal();}

$$('#exampleChips .chip').forEach(b=>b.addEventListener('click',()=>{els.query.value=b.dataset.query;doSearch();}));
$('#refineChips').addEventListener('click',e=>{const b=e.target.closest('[data-refine]');if(!b)return;els.query.value=`${els.query.value}。${b.dataset.refine}`;doSearch();});
els.search.addEventListener('click',doSearch);els.query.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')doSearch();});
$('#editSearchBtn').addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});els.query.focus();});
$('#openDataBtn').addEventListener('click',()=>els.dataDialog.showModal());

els.csv.addEventListener('change',async()=>{
  const file=els.csv.files?.[0];if(!file)return;
  els.progress.classList.remove('hidden');els.bar.style.width='4%';els.progressLabel.textContent='ファイルを読み込んでいます…';
  try{
    const text=await file.text();
    const worker=new Worker('js/csv-worker.js');
    worker.onmessage=async e=>{
      const d=e.data;if(d.type==='progress'){els.bar.style.width=`${d.percent}%`;els.progressLabel.textContent=d.label;}
      if(d.type==='done'){
        if(!d.books?.length){els.progressLabel.textContent='蔵書データを認識できませんでした。';return;}
        els.bar.style.width='100%';els.progressLabel.textContent=`${d.books.length.toLocaleString()}冊を読み込みました。端末に保存しています…`;
        setLibrary(d.books,'モンスターCSV');await idbSet('library',{books:d.books,mode:'モンスターCSV',savedAt:Date.now()});
        setTimeout(()=>{els.progressLabel.textContent=`完了：${d.books.length.toLocaleString()}冊を検索できます。`;},200);worker.terminate();
      }
    };worker.postMessage({text});
  }catch(err){els.progressLabel.textContent='読み込みに失敗しました。CSV形式を確認してください。';}
});
$('#resetDataBtn').addEventListener('click',async()=>{await idbDelete('library');setLibrary(self.PROTOTYPE_BOOKS||[],'試用データ');els.progress.classList.add('hidden');els.csv.value='';});

(async function init(){
  initWorker();const saved=await idbGet('library');if(saved?.books?.length)setLibrary(saved.books,saved.mode||'モンスターCSV');else updateStatus();
  if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
