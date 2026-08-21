let BOOKS=[];

const CLASS_LABELS={
  '0':'総記・情報','1':'哲学・心理・生き方','2':'歴史・地理・伝記','3':'社会・教育・仕事','4':'自然科学・医学','5':'技術・工学','6':'産業・農林水産','7':'芸術・スポーツ','8':'言語','9':'文学','E':'絵本','other':'その他'
};

const CONCEPTS=[
  {id:'friendship',label:'友情・人間関係',query:['友達','友情','人間関係','仲間','孤独','ひとり','クラス','部活','関係','居場所'],book:['友','友人','友情','仲間','孤独','ひとり','人間関係','関係','青春','学校','居場所'],classes:['1','3','9']},
  {id:'career',label:'進路・仕事・未来',query:['進路','将来','仕事','職業','キャリア','働く','未来','大学','生き方','夢'],book:['進路','仕事','職業','働','キャリア','未来','大学','人生','生き方','夢'],classes:['3','1','2']},
  {id:'hope',label:'前向き・希望',query:['前向き','元気','希望','立ち直','励ま','明る','幸せ','幸福','救い','再生'],book:['希望','幸福','幸せ','生きる','人生','光','未来','笑','再生','旅'],classes:['1','9']},
  {id:'mystery',label:'謎・ミステリー',query:['ミステリー','ミステリ','謎','推理','事件','探偵','サスペンス'],book:['ミステリ','謎','推理','事件','探偵','殺人','秘密','真相'],classes:['9']},
  {id:'romance',label:'恋愛・愛',query:['恋愛','恋','愛','好き','失恋'],book:['恋','愛','好き','ラブ','恋人'],classes:['9','1']},
  {id:'adventure',label:'冒険・旅',query:['冒険','旅','異世界','非日常','没頭','わくわく'],book:['冒険','旅','世界','島','海','山','物語'],classes:['9','2']},
  {id:'ai',label:'AI・情報社会',query:['AI','人工知能','生成AI','チャットGPT','chatgpt','情報社会','デジタル','スマホ','SNS'],book:['AI','人工知能','生成AI','機械学習','デジタル','スマホ','SNS','ネット','メディア','テクノロジー','ロボット'],classes:['0','3','5']},
  {id:'science',label:'科学・宇宙',query:['科学','宇宙','物理','化学','生物','数学','実験','自然科学'],book:['科学','宇宙','物理','化学','生物','数学','実験','自然','地球','生命'],classes:['4','0']},
  {id:'history',label:'歴史・戦争・平和',query:['歴史','戦争','平和','昔','時代','日本史','世界史'],book:['歴史','戦争','平和','時代','日本','世界','近代','古代','昭和','江戸'],classes:['2']},
  {id:'society',label:'社会・政治・教育',query:['社会','政治','教育','学校','格差','貧困','ジェンダー','差別','法律'],book:['社会','政治','教育','学校','格差','貧困','ジェンダー','差別','法律','憲法'],classes:['3']},
  {id:'psychology',label:'心理・こころ',query:['心理','こころ','心','悩み','ストレス','不安','自信','自己肯定','しんどい','疲れ'],book:['心理','こころ','心','不安','自信','自己','カウンセリング','精神','感情'],classes:['1','3']},
  {id:'philosophy',label:'哲学・人生',query:['哲学','人生','生き方','意味','幸福','死','生きる','考えたい','問い'],book:['哲学','人生','生きる','幸福','思想','考える','問い'],classes:['1','9']},
  {id:'school',label:'学校・青春',query:['高校生','中学生','学校','青春','部活','クラス','学生','10代','十代'],book:['高校','中学','学校','青春','部活','クラス','学生','少女','少年'],classes:['9','3']},
  {id:'nature',label:'自然・環境',query:['自然','環境','気候','地球','動物','植物','生態'],book:['自然','環境','気候','地球','動物','植物','生態','森','海'],classes:['4','6']},
  {id:'art',label:'芸術・音楽',query:['音楽','美術','芸術','映画','写真','デザイン','絵'],book:['音楽','美術','芸術','映画','写真','デザイン','絵','歌'],classes:['7']},
  {id:'language',label:'ことば・言語',query:['言葉','ことば','日本語','英語','言語','文章','書く','読む'],book:['言葉','ことば','日本語','英語','言語','文章','読む','書く'],classes:['8','9']},
  {id:'food',label:'食・料理',query:['食','料理','農業','食べ物','栄養'],book:['食','料理','農業','食料','栄養','農'],classes:['5','6']},
  {id:'sports',label:'スポーツ',query:['スポーツ','運動','サッカー','野球','陸上','体育'],book:['スポーツ','運動','サッカー','野球','陸上','体育'],classes:['7']}
];

const MOODS=[
  {id:'hopeful',label:'希望的',query:['前向き','希望','元気','救い','明るい','幸せ','幸福','立ち直','励ま','再生'],book:['希望','再生','成長','未来','光','幸せ','幸福','勇気','あたたか','温か','優し','やさし','笑顔','立ち直']},
  {id:'light',label:'重すぎない',query:['重すぎない','重すぎず','重くない','暗すぎず','軽め','気軽','さらっと','しんどくない','暗すぎない'],book:['軽快','ユーモア','笑い','ほのぼの','日常','爽やか','さわやか','心温まる','温かい','楽しい']},
  {id:'reflective',label:'考えさせられる',query:['考えたい','考えさせ','余韻','深い','じっくり','問い','自分を見つめ'],book:['問い','考える','内省','葛藤','選択','生き方','価値観','哲学','余韻','成長']},
  {id:'relaxing',label:'穏やか・癒やし',query:['癒やし','癒され','穏やか','落ち着','安心','ほっと','やさしい'],book:['癒','穏やか','静か','日常','ゆったり','優し','やさし','温か','ほのぼの','心温まる']},
  {id:'tense',label:'緊張感',query:['ハラハラ','緊張感','先が気になる','スリル','ドキドキ'],book:['事件','危機','謎','サスペンス','緊迫','追跡','犯罪','秘密','真相','戦い']},
  {id:'emotional',label:'感情を動かす',query:['泣ける','感動','胸にくる','切ない','感情','心に残る'],book:['感動','涙','切な','喪失','別れ','家族','愛','友情','絆','心']},
  {id:'immersive',label:'没頭・世界観',query:['没頭','世界観','現実を忘れ','夢中','異世界','非日常'],book:['世界','冒険','旅','幻想','ファンタジー','魔法','異世界','宇宙','物語']},
  {id:'easy',label:'読みやすい',query:['読みやすい','難しくない','簡単','入門','初心者','すぐ読める'],book:['入門','図解','わかる','やさしい','10代','中学生','高校生','はじめて','マンガ','イラスト']},
  {id:'practical',label:'実用的',query:['実用','具体的','役立つ','方法','コツ','やり方','実践'],book:['方法','コツ','実践','入門','ガイド','ハウツー','術','教科書','図解']},
  {id:'not_preachy',label:'説教っぽくない',query:['説教っぽくない','説教っぽくなく','押しつけない','自己啓発っぽくない','ハウツーじゃない','直接的じゃない'],book:['小説','物語','エッセイ','随筆','文学','ストーリー']}
];

function normalize(s=''){
  return String(s).normalize('NFKC').toLowerCase().replace(/[\s　・,，。．、:：;；!！?？「」『』（）()\[\]【】<>＜＞\/\\\-—―_]+/g,'');
}
function tokenize(s=''){
  return String(s).normalize('NFKC').toLowerCase().split(/[\s　、。,.，。!！?？・/：:;；（）()「」『』【】\[\]]+/).map(x=>x.trim()).filter(x=>x.length>=2);
}
function parsePages(s=''){
  const m=String(s).replace(/,/g,'').match(/(\d{1,4})/);return m?Number(m[1]):null;
}
function parseYear(s=''){
  const m=String(s).match(/(19|20)\d{2}/);return m?Number(m[0]):null;
}
function getClass(call=''){
  const s=String(call).trim().normalize('NFKC');const m=s.match(/\d/);if(m)return m[0];if(/^E/i.test(s))return'E';return'other';
}
function isFiction(b){const c=getClass(b.call);return c==='9'||c==='E';}
function isNovel(b){const call=String(b.call||'').normalize('NFKC');if(/^E(?:-|$)/i.test(call))return false;const m=call.match(/(9\d{2})/);if(!m)return false;return /^(913|923|933|943|953|963|973|983|989)$/.test(m[1]);}
function textOf(b,extra=''){return normalize([b.title,b.author,b.publisher,b.call,extra].join(' '));}
function detectByQuery(list,q){const nq=normalize(q);return list.filter(item=>item.query.some(t=>nq.includes(normalize(t))));}
function detectConcepts(q){return detectByQuery(CONCEPTS,q);}
function detectMoods(q){return detectByQuery(MOODS,q);}

function baseScoreBook(b,opts,concepts,moods){
  const q=normalize(opts.query),raw=String(opts.query||'').toLowerCase(),t=textOf(b);let score=0,lexical=0,conceptHits=0,moodHits=0;
  if(q&&t.includes(q)){score+=20;lexical+=20;}
  for(const p0 of tokenize(opts.query)){
    const p=normalize(p0);if(!p)continue;
    if(t.includes(p)){score+=5;lexical+=5;}else{
      if(p.length<=8){let hit=0,total=Math.max(1,p.length-1);for(let i=0;i<p.length-1;i++)if(t.includes(p.slice(i,i+2)))hit++;const ratio=hit/total;if(ratio>=.5)score+=Math.min(1.5,ratio*1.5);}
    }
  }
  const cls=getClass(b.call);
  concepts.forEach((c,ci)=>{
    let hit=false;
    if(c.book.some(k=>t.includes(normalize(k)))){score+=7;hit=true;}
    for(const k of c.query){const nk=normalize(k);if(nk&&q.includes(nk)&&t.includes(nk)){score+=10;lexical+=4;hit=true;break;}}
    if(c.classes.includes(cls))score+=ci===0?.8:.35;
    if(hit)conceptHits++;
  });
  moods.forEach(m=>{if(m.book.some(k=>t.includes(normalize(k)))){score+=4;moodHits++;}});
  const pages=parsePages(b.pages),year=parseYear(b.year),fiction=isFiction(b),novel=isNovel(b);
  if(/小説/.test(raw)&&!novel)return {score:-999,lexical,pages,year,cls,fiction,novel,conceptHits,moodHits};
  if((opts.type==='fiction'||/物語|フィクション/.test(raw))&&!fiction)return {score:-999,lexical,pages,year,cls,fiction,novel,conceptHits,moodHits};
  if(opts.type==='nonfiction'&&fiction)return {score:-999,lexical,pages,year,cls,fiction,novel,conceptHits,moodHits};
  if(opts.type==='fiction')score+=fiction?6:-5;
  if(opts.type==='nonfiction')score+=!fiction?6:-5;
  if(opts.length==='short')score+=pages?(pages<=250?5:pages<=350?1:-2):0;
  if(opts.length==='medium')score+=pages?(pages<=450?2:-1):0;
  if(opts.year==='recent')score+=year?(year>=2015?4:year>=2005?1:-2):0;
  if(opts.year==='classic')score+=year&&year<2015?1:0;
  const callNorm=String(b.call||'').normalize('NFKC');
  if(/小説|物語|フィクション/.test(raw))score+=fiction?9:-14;
  if(/ノンフィクション|実用|具体的|現実的/.test(raw))score+=!fiction?7:-5;
  if(/短い|短め|すぐ読|読みやす/.test(raw))score+=pages?(pages<=260?4:pages<=380?1:-1):0;
  if(/新しい|最近|近年/.test(raw))score+=year?(year>=2015?3:-1):0;
  if(/古典|昔|名作/.test(raw))score+=year&&year<2005?2:0;
  if(/説教っぽくな|自己啓発っぽくな|押しつけな|ハウツーじゃな|直接的じゃな/.test(raw)){
    score+=fiction?6:0;
    if(/^B?-?159(?:\.|-|$)/.test(callNorm)||/(成功する|後悔しない|幸せな生き方|人生.*方法|\d+の方法|\d+の習慣|自己啓発)/.test(String(b.title||'')))score-=12;
  }
  if(!concepts.length&&moods.length&&fiction)score+=2.3;
  if(/意外/.test(raw))score-=lexical*.2;
  if(/^\d{1,3}-20\d{2}$/.test(callNorm)&&!/大学|進路|受験|入試/.test(raw))score-=16;
  if(/教学社|河合出版|駿台|代々木ゼミ|赤本/.test(String(b.publisher||''))&&!/大学|進路|受験|入試/.test(raw))score-=12;
  return {score,lexical,pages,year,cls,fiction,novel,conceptHits,moodHits};
}

function buildLocalReason(b,concepts,moods,meta){
  const labels=[];const t=textOf(b);const cls=meta.cls;
  for(const c of concepts){if(c.book.some(k=>t.includes(normalize(k))))labels.push(c.label);}
  for(const m of moods){if(m.book.some(k=>t.includes(normalize(k))))labels.push(m.label);}
  if(meta.pages&&meta.pages<=280)labels.push('比較的短め');
  const tags=[...new Set(labels)].slice(0,4);
  const reason=tags.length?`書名などの蔵書情報から「${tags.slice(0,3).join('・')}」の手がかりがある候補です。`:(concepts.length||moods.length?'相談テーマに近い分類から広めに抽出した候補です。':'書名・著者・出版社・請求記号と相談内容を照合した候補です。');
  return {reason,tags:tags.length?tags:[CLASS_LABELS[cls]||'蔵書候補']};
}

function asResult(x,concepts,moods){
  const rr=buildLocalReason(x.book,concepts,moods,x.meta);
  return {...x.book,baseScore:x.score,score:x.score,match:Math.max(1,Math.min(99,Math.round(50+x.score*1.25))),reason:rr.reason,tags:rr.tags,meta:x.meta,enriched:false};
}

function diversify(results){
  const top=results.slice(0,60);if(!top.length)return{direct:null,easy:null,surprise:null};
  const direct=top[0];
  let easy=top.find(x=>x.id!==direct.id&&((x.meta?.pages&&x.meta.pages<=280)||(x.tags||[]).includes('読みやすい'))&&x.score>=direct.score*.38)||top[1]||direct;
  let surprise=top.find(x=>x.id!==direct.id&&x.id!==easy.id&&x.meta?.cls!==direct.meta?.cls&&x.score>=Math.max(1,direct.score*.25));
  if(!surprise)surprise=top.find(x=>x.id!==direct.id&&x.id!==easy.id&&x.meta?.lexical<direct.meta?.lexical&&x.score>=Math.max(1,direct.score*.28));
  if(!surprise)surprise=top.find(x=>x.id!==direct.id&&x.id!==easy.id)||direct;
  return{direct,easy,surprise};
}

function localSearch(opts){
  const concepts=detectConcepts(opts.query||''),moods=detectMoods(opts.query||'');
  const raw=BOOKS.map(b=>{const meta=baseScoreBook(b,opts,concepts,moods);return{book:b,score:meta.score,meta};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  const seen=new Set(),results=[];
  for(const x of raw){const k=normalize(x.book.title);if(!k||seen.has(k))continue;seen.add(k);results.push(asResult(x,concepts,moods));if(results.length>=80)break;}
  const intent=[...concepts.map(x=>x.label),...moods.map(x=>x.label)];
  if(!intent.length)intent.push('入力語を中心に検索');
  return{results,picks:diversify(results),intent,conceptIds:concepts.map(x=>x.id),moodIds:moods.map(x=>x.id),seq:opts.seq||0};
}

function semanticText(meta={}){
  meta=meta||{};
  return normalize([meta.description,(meta.categories||[]).join(' '),meta.subtitle,meta.title,meta.authors?.join(' ')].join(' '));
}
function enrichedScore(result,meta,opts,concepts,moods){
  let add=0,semanticHits=0;const t=semanticText(meta),raw=String(opts.query||'').toLowerCase();
  if(!meta||!t)return{add:0,semanticHits:0,moodTags:[],conceptTags:[]};
  const conceptTags=[],moodTags=[];
  for(const c of concepts){if(c.book.some(k=>t.includes(normalize(k)))||c.query.some(k=>t.includes(normalize(k)))){add+=7;semanticHits++;conceptTags.push(c.label);}}
  for(const m of moods){if(m.book.some(k=>t.includes(normalize(k)))){add+=8;semanticHits++;moodTags.push(m.label);}}
  for(const token of tokenize(opts.query)){
    const n=normalize(token);if(n&&t.includes(n))add+=2.5;
  }
  if(/小説|物語/.test(raw)&&/fiction|小説|文学|物語/.test(String((meta.categories||[]).join(' ')).toLowerCase()))add+=5;
  if(/読みやす|短い|短め/.test(raw)&&meta.pageCount&&meta.pageCount<=280)add+=4;
  if(/新しい|最近|近年/.test(raw)&&meta.publishedDate&&parseYear(meta.publishedDate)>=2015)add+=2;
  add+=Math.min(3,Number(meta.matchConfidence||0)/35);
  return{add,semanticHits,moodTags,conceptTags};
}
function rerank(payload){
  const opts=payload.opts||{},base=payload.results||[],enrichments=payload.enrichments||{};
  const concepts=detectConcepts(opts.query||''),moods=detectMoods(opts.query||'');
  const reranked=base.map(r=>{
    const meta=enrichments[String(r.id)]||null;const sem=enrichedScore(r,meta,opts,concepts,moods);const score=(r.baseScore??r.score??0)+sem.add;
    const tags=[...(sem.conceptTags||[]),...(sem.moodTags||[]),...(r.tags||[])];
    const unique=[...new Set(tags)].slice(0,5);
    let reason=r.reason;
    if(meta?.description&&sem.semanticHits){
      const supported=[...new Set([...(sem.conceptTags||[]),...(sem.moodTags||[])])].slice(0,3);
      reason=supported.length?`外部書誌の紹介文も照合し、「${supported.join('・')}」の要素が確認できた候補です。`:'外部書誌の紹介文・カテゴリまで照合して順位を調整しました。';
    }
    return{...r,score,match:Math.max(1,Math.min(99,Math.round(52+score*1.2))),reason,tags:unique,enriched:!!meta,bookMeta:meta,semanticHits:sem.semanticHits};
  }).sort((a,b)=>b.score-a.score);
  return{results:reranked,picks:diversify(reranked),intent:[...concepts.map(x=>x.label),...moods.map(x=>x.label)],enrichedCount:reranked.filter(x=>x.enriched).length,seq:payload.seq||0};
}

self.onmessage=e=>{
  const d=e.data||{};
  if(d.type==='setBooks'){BOOKS=d.payload||[];self.postMessage({type:'ready',count:BOOKS.length});}
  if(d.type==='search')self.postMessage({type:'results',data:localSearch(d.payload||{})});
  if(d.type==='rerank')self.postMessage({type:'reranked',data:rerank(d.payload||{})});
};
