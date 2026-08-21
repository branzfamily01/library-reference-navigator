let BOOKS=[];

const CLASS_LABELS={
  '0':'総記・情報','1':'哲学・心理・生き方','2':'歴史・地理・伝記','3':'社会・教育・仕事','4':'自然科学・医学','5':'技術・工学','6':'産業・農林水産','7':'芸術・スポーツ','8':'言語','9':'文学','E':'絵本','other':'その他'
};

const CONCEPTS=[
  {id:'friendship',label:'友情・人間関係',query:['友達','友情','人間関係','仲間','孤独','ひとり','クラス','部活','関係'],book:['友','友情','仲間','孤独','ひとり','人間関係','関係','青春','学校'],classes:['1','3','9']},
  {id:'career',label:'進路・仕事・未来',query:['進路','将来','仕事','職業','キャリア','働く','未来','大学','生き方'],book:['進路','仕事','職業','働','キャリア','未来','大学','人生','生き方'],classes:['3','1','2']},
  {id:'hope',label:'前向き・希望',query:['前向き','元気','希望','立ち直','励ま','明る','幸せ','幸福','救い'],book:['希望','幸福','幸せ','生きる','人生','光','未来','笑','再生','旅'],classes:['1','9']},
  {id:'mystery',label:'謎・ミステリー',query:['ミステリー','ミステリ','謎','推理','事件','探偵','サスペンス'],book:['ミステリ','謎','推理','事件','探偵','殺人','秘密','真相'],classes:['9']},
  {id:'romance',label:'恋愛・愛',query:['恋愛','恋','愛','好き','失恋'],book:['恋','愛','好き','ラブ','恋人'],classes:['9','1']},
  {id:'adventure',label:'冒険・旅',query:['冒険','旅','異世界','非日常','没頭','わくわく'],book:['冒険','旅','世界','島','海','山','物語'],classes:['9','2']},
  {id:'ai',label:'AI・情報社会',query:['AI','人工知能','生成AI','チャットGPT','chatgpt','情報社会','デジタル','スマホ','SNS'],book:['AI','人工知能','生成AI','機械学習','デジタル','スマホ','SNS','ネット','メディア','テクノロジー','ロボット'],classes:['0','3','5']},
  {id:'science',label:'科学・宇宙',query:['科学','宇宙','物理','化学','生物','数学','実験','自然科学'],book:['科学','宇宙','物理','化学','生物','数学','実験','自然','地球','生命'],classes:['4','0']},
  {id:'history',label:'歴史・戦争・平和',query:['歴史','戦争','平和','昔','時代','日本史','世界史'],book:['歴史','戦争','平和','時代','日本','世界','近代','古代','昭和','江戸'],classes:['2']},
  {id:'society',label:'社会・政治・教育',query:['社会','政治','教育','学校','格差','貧困','ジェンダー','差別','法律'],book:['社会','政治','教育','学校','格差','貧困','ジェンダー','差別','法律','憲法'],classes:['3']},
  {id:'psychology',label:'心理・こころ',query:['心理','こころ','心','悩み','ストレス','不安','自信','自己肯定'],book:['心理','こころ','心','不安','自信','自己','カウンセリング','精神'],classes:['1','3']},
  {id:'philosophy',label:'哲学・人生',query:['哲学','人生','生き方','意味','幸福','死','生きる','考えたい'],book:['哲学','人生','生きる','幸福','思想','考える','問い'],classes:['1','9']},
  {id:'school',label:'学校・青春',query:['高校生','中学生','学校','青春','部活','クラス','学生'],book:['高校','中学','学校','青春','部活','クラス','学生','少女','少年'],classes:['9','3']},
  {id:'nature',label:'自然・環境',query:['自然','環境','気候','地球','動物','植物','生態'],book:['自然','環境','気候','地球','動物','植物','生態','森','海'],classes:['4','6']},
  {id:'art',label:'芸術・音楽',query:['音楽','美術','芸術','映画','写真','デザイン','絵'],book:['音楽','美術','芸術','映画','写真','デザイン','絵','歌'],classes:['7']},
  {id:'language',label:'ことば・言語',query:['言葉','ことば','日本語','英語','言語','文章','書く','読む'],book:['言葉','ことば','日本語','英語','言語','文章','読む','書く'],classes:['8','9']},
  {id:'food',label:'食・料理',query:['食','料理','農業','食べ物','栄養'],book:['食','料理','農業','食料','栄養','農'],classes:['5','6']},
  {id:'sports',label:'スポーツ',query:['スポーツ','運動','サッカー','野球','陸上','体育'],book:['スポーツ','運動','サッカー','野球','陸上','体育'],classes:['7']}
];

function normalize(s=''){
  return String(s).normalize('NFKC').toLowerCase().replace(/[\s　・,，。．、:：;；!！?？「」『』（）()\[\]【】<>＜＞\/\\\-—―_]+/g,'');
}
function parsePages(s=''){
  const m=String(s).replace(/,/g,'').match(/(\d{1,4})/);return m?Number(m[1]):null;
}
function parseYear(s=''){
  const m=String(s).match(/(19|20)\d{2}/);return m?Number(m[0]):null;
}
function getClass(call=''){
  const s=String(call).trim().normalize('NFKC');
  const m=s.match(/\d/); if(m) return m[0]; if(/^E/i.test(s)) return 'E'; return 'other';
}
function isFiction(b){const c=getClass(b.call);return c==='9'||c==='E';}
function isNovel(b){
  const call=String(b.call||'').normalize('NFKC');
  if(/^E(?:-|$)/i.test(call))return false;
  const m=call.match(/(9\d3)(?:\.|-|$)/);
  return !!m;
}
function textOf(b){return normalize([b.title,b.author,b.publisher,b.call].join(' '));}
function detectConcepts(q){
  const nq=normalize(q); const out=[];
  for(const c of CONCEPTS){if(c.query.some(t=>nq.includes(normalize(t)))) out.push(c);}
  return out;
}
function buildReason(b,concepts,opts,score){
  const matches=[]; const t=textOf(b); const c=getClass(b.call);
  for(const x of concepts){if(x.book.some(k=>t.includes(normalize(k)))||x.classes.includes(c)) matches.push(x.label);}
  const pages=parsePages(b.pages),year=parseYear(b.year);
  if(opts.type==='fiction'&&isFiction(b))matches.push('小説・文学');
  if(opts.type==='nonfiction'&&!isFiction(b))matches.push('知識・ノンフィクション');
  if((opts.length==='short'||/短|読みやす/.test(opts.query))&&pages&&pages<=280)matches.push('短め');
  if((opts.year==='recent'||/新し|最近/.test(opts.query))&&year&&year>=2015)matches.push('比較的新しい');
  const unique=[...new Set(matches)].slice(0,4);
  let reason='相談内容と、書名・分類・書誌情報の一致度が高い候補です。';
  if(unique.length) reason=`「${unique.slice(0,3).join('・')}」の条件に近い候補です。`;
  if(!concepts.length) reason='入力された言葉と、書名・著者・出版社・請求記号の一致を中心に選びました。';
  return {reason,tags:unique.length?unique:[CLASS_LABELS[c]||'蔵書候補']};
}
function scoreBook(b,opts,concepts){
  const q=normalize(opts.query); const raw=String(opts.query||'').toLowerCase(); const t=textOf(b);
  let score=0; let lexical=0;
  if(q){
    if(t.includes(q)){score+=18;lexical+=18;}
    const parts=String(opts.query).normalize('NFKC').split(/[\s　、。,.，。!！?？・/]+/).filter(x=>x.length>=2);
    for(const p0 of parts){const p=normalize(p0);if(!p)continue;if(t.includes(p)){score+=5;lexical+=5;}else{
      const grams=[];for(let i=0;i<p.length-1;i++)grams.push(p.slice(i,i+2));
      const hit=grams.filter(g=>t.includes(g)).length;score+=Math.min(2.5,hit*.45);
    }}
  }
  const cls=getClass(b.call);
  let conceptHits=0,primaryHit=false;
  for(let ci=0;ci<concepts.length;ci++){const c=concepts[ci];let hit=false;
    if(c.book.some(k=>t.includes(normalize(k)))){score+=7;hit=true;}
    if(c.classes.includes(cls))score+=0.8;
    for(const k of c.query){const nk=normalize(k);if(nk && q.includes(nk) && t.includes(nk)){score+=10;hit=true;}}
    if(hit){conceptHits++;if(ci===0)primaryHit=true;}
  }
  const pages=parsePages(b.pages),year=parseYear(b.year),fiction=isFiction(b),novel=isNovel(b);
  if(/小説/.test(raw)&&!novel)return {score:-999,lexical,pages,year,cls,fiction,novel,conceptHits,primaryHit};
  if((opts.type==='fiction'||/物語|フィクション/.test(raw))&&!fiction)return {score:-999,lexical,pages,year,cls,fiction,novel,conceptHits,primaryHit};
  if(opts.type==='nonfiction'&&fiction)return {score:-999,lexical,pages,year,cls,fiction,novel,conceptHits,primaryHit};
  if(opts.type==='fiction') score += fiction?5:-4;
  if(opts.type==='nonfiction') score += !fiction?5:-4;
  if(opts.length==='short') score += pages? (pages<=250?5:pages<=350?1:-2):0;
  if(opts.length==='medium') score += pages? (pages<=450?2:-1):0;
  if(opts.year==='recent') score += year? (year>=2015?4:year>=2005?1:-2):0;
  if(opts.year==='classic') score += year&&year<2015?1:0;
  if(/小説|物語|フィクション/.test(raw))score+=fiction?10:-18;
  if(/ノンフィクション|実用|具体的|現実的/.test(raw))score+=!fiction?7:-6;
  if(/短い|短め|すぐ読|読みやす/.test(raw))score+=pages?(pages<=260?4:pages<=380?1:-1):0;
  if(/新しい|最近|近年/.test(raw))score+=year?(year>=2015?3:-1):0;
  if(/古典|昔|名作/.test(raw))score+=year&&year<2005?2:0;
  if(/意外/.test(raw))score-=lexical*.2;
  const callNorm=String(b.call||'').normalize('NFKC');
  if(/^\d{1,3}-20\d{2}$/.test(callNorm)&&!/大学|進路|受験|入試/.test(raw))score-=16;
  if(/教学社|河合出版|駿台|代々木ゼミ|赤本/.test(String(b.publisher||''))&&!/大学|進路|受験|入試/.test(raw))score-=12;
  return {score,lexical,pages,year,cls,fiction,novel,conceptHits,primaryHit};
}
function diversify(sorted){
  const top=sorted.slice(0,60); if(!top.length)return {direct:null,easy:null,surprise:null};
  const direct=top[0];
  let easy=top.find(x=>x!==direct && x.meta.primaryHit && x.meta.pages && x.meta.pages<=280 && x.score>=direct.score*.34) || top.find(x=>x!==direct && x.meta.pages && x.meta.pages<=280 && x.score>=direct.score*.38) || top[1] || direct;
  let surprise=top.find(x=>x!==direct && x!==easy && x.meta.primaryHit && x.meta.cls!==direct.meta.cls && x.score>=Math.max(1,direct.score*.22));
  if(!surprise) surprise=top.find(x=>x!==direct && x!==easy && x.meta.lexical<direct.meta.lexical && x.score>=Math.max(1,direct.score*.25));
  if(!surprise) surprise=top.find(x=>x!==direct && x!==easy)||direct;
  return {direct,easy,surprise};
}
function search(opts){
  const concepts=detectConcepts(opts.query||'');
  const rawScored=BOOKS.map(b=>{const meta=scoreBook(b,opts,concepts);return {book:b,score:meta.score,meta};})
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  const seenTitles=new Set();
  const scored=rawScored.filter(x=>{const k=normalize(x.book.title);if(seenTitles.has(k))return false;seenTitles.add(k);return true;});
  if(!scored.length){
    BOOKS.slice(0,50).forEach((b,i)=>scored.push({book:b,score:1/(i+1),meta:scoreBook(b,opts,concepts)}));
  }
  const topScore=scored[0]?.score||1;
  const results=scored.slice(0,40).map(x=>{
    const exp=buildReason(x.book,concepts,opts,x.score);
    return {...x.book,score:x.score,match:Math.max(12,Math.min(99,Math.round(55+(x.score/topScore)*44))),reason:exp.reason,tags:exp.tags,classLabel:CLASS_LABELS[x.meta.cls]||'その他',pagesNum:x.meta.pages,yearNum:x.meta.year,fiction:x.meta.fiction};
  });
  const picks0=diversify(scored);
  function pack(x){if(!x)return null; const exp=buildReason(x.book,concepts,opts,x.score);return {...x.book,score:x.score,match:Math.max(12,Math.min(99,Math.round(55+(x.score/topScore)*44))),reason:exp.reason,tags:exp.tags,classLabel:CLASS_LABELS[x.meta.cls]||'その他',pagesNum:x.meta.pages,yearNum:x.meta.year,fiction:x.meta.fiction};}
  const intent=concepts.length?concepts.map(c=>c.label).slice(0,4):['入力語との一致'];
  return {results,picks:{direct:pack(picks0.direct),easy:pack(picks0.easy),surprise:pack(picks0.surprise)},intent};
}

self.onmessage=e=>{
  const {type,payload}=e.data||{};
  if(type==='setBooks'){BOOKS=payload||[];self.postMessage({type:'ready',count:BOOKS.length});}
  if(type==='search')self.postMessage({type:'results',data:search(payload)});
};
