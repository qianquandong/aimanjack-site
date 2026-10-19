// Browser-side submission key for the quote forms (PR02, 2026-10-19). Inlined into the page scripts of src/pages/contact.mjs
// and src/quick-quote.mjs; tests/intake-v2.test.mjs runs this exact string in Node with a fake sessionStorage.
//   * one random key per submission attempt; a retry of the same content reuses it, also after a reload of the page
//     (sessionStorage), so a lost response cannot turn into a second request;
//   * changed content gets a new key; success or a conflict clears it;
//   * sessionStorage holds only { k: random key, s: random salt, h: SHA-256(salt | content) } — never the form values.
//     Without Web Crypto it falls back to an in-memory comparison for this page view.
export const SUBMISSION_KEY_JS = `var SKM=function(id){var K='amj_sk_'+id,cf=false,mem=null,
uuid=function(){if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();var b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;var h=[].map.call(b,function(x){return(x+256).toString(16).slice(1)}).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)},
content=function(o){return JSON.stringify(Object.keys(o).filter(function(k){return!/^(ft_|fill_ms$|submission_key$|confirm$)/.test(k)}).sort().map(function(k){return[k,o[k]]}))},
hex=function(d){return[].map.call(new Uint8Array(d),function(x){return(x+256).toString(16).slice(1)}).join('')},
load=function(){try{return JSON.parse(sessionStorage.getItem(K)||'null')}catch(_){return null}},
save=function(v){try{sessionStorage.setItem(K,JSON.stringify(v))}catch(_){}};
return{key:function(o){var c=content(o),s=load(),salt=(s&&s.s)||uuid(),sub=window.crypto&&crypto.subtle&&window.TextEncoder;
 var h=sub?crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+'|'+c)).then(hex,function(){return null}):Promise.resolve(null);
 return h.then(function(hh){if(hh){if(s&&s.h===hh&&s.k)return s.k;var k=uuid();cf=false;save({k:k,s:salt,h:hh});return k}
  if(mem&&mem.c===c)return mem.k;cf=false;mem={c:c,k:uuid()};return mem.k})},
 needConfirm:function(){cf=true},confirming:function(){return cf},
 clear:function(){cf=false;mem=null;try{sessionStorage.removeItem(K)}catch(_){}}}};`;
