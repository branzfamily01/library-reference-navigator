function parseCSV(text){
  const rows=[];let row=[],field='',q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(q){
      if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}
      else if(ch==='"'){q=false;}
      else field+=ch;
    }else{
      if(ch==='"')q=true;
      else if(ch===','){row.push(field);field='';}
      else if(ch==='\n'){row.push(field);rows.push(row);row=[];field='';}
      else if(ch!=='\r')field+=ch;
    }
  }
  if(field.length||row.length){row.push(field);rows.push(row);}
  return rows;
}
self.onmessage=e=>{
  const text=e.data?.text||'';
  self.postMessage({type:'progress',percent:15,label:'CSVを解析しています…'});
  const rows=parseCSV(text);
  self.postMessage({type:'progress',percent:55,label:'モンスターライブラリー形式を認識しています…'});
  const books=[];const seen=new Set();
  for(let i=0;i<rows.length;i++){
    const r=rows[i];
    if(r.length<41)continue;
    const id=(r[30]||'').trim(),title=(r[31]||'').trim();
    if(!id||!title||seen.has(id))continue;seen.add(id);
    books.push({id,title,author:(r[32]||'').trim(),publisher:(r[33]||'').trim(),year:(r[34]||'').trim(),pages:(r[36]||'').trim(),call:(r[39]||'').trim(),received:(r[29]||'').trim()});
    if(i%6000===0)self.postMessage({type:'progress',percent:55+Math.round((i/rows.length)*35),label:`蔵書を整理しています… ${books.length.toLocaleString()}冊`});
  }
  self.postMessage({type:'progress',percent:95,label:'検索データを準備しています…'});
  self.postMessage({type:'done',books});
};
