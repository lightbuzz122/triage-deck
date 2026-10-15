/* Triage Deck engine: shared player, monitor, viewers and debrief. Cases register in window.CASEDEFS. */
(function(){
"use strict";
const DEFS=window.CASEDEFS||[];
const $=id=>document.getElementById(id);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const val=(x,S)=>typeof x==="function"?x(S):x;

/* ---------------- shared definitions ---------------- */
const DEVICES={
  ecg:{name:"Monitor leads",short:"ECG",on:2,off:1,col:"var(--ecg)"},
  spo2:{name:"SpO₂ probe",short:"SpO₂",on:2,off:1,col:"var(--spo2)"},
  nibp:{name:"BP cuff",short:"NIBP",on:2,off:1,col:"var(--nibp)"},
  temp:{name:"Thermometer",short:"Temp",on:1,off:0,col:"var(--resp)"},
  o2:{name:"O₂ mask",short:"O₂",on:2,off:1,col:"#8fd1b5"},
  iv:{name:"IV cannula",short:"IV",on:2,off:null,col:"#f2c94c"}
};
const S_=(p)=>`<svg class="ti" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const TECH={
  inspect:{name:"Inspect",verb:"Look",icon:S_('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>')},
  palpate:{name:"Palpate",verb:"Feel",icon:S_('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10.5V4a1.5 1.5 0 0 1 3 0v7"/><path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 11a1.5 1.5 0 0 1 3 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4 15.5a1.5 1.5 0 0 1 2.3-1.9L8 15"/>')},
  percuss:{name:"Percuss",verb:"Percuss",icon:S_('<path d="M4 15h11"/><path d="M15 10l4-4"/><path d="M13.5 11.5l-1 3.5"/><circle cx="19.5" cy="5.5" r="1.5"/>')},
  auscultate:{name:"Auscultate",verb:"Listen",icon:S_('<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v3a5 5 0 0 0 10 0v-1"/><circle cx="20" cy="11.5" r="2"/>')},
  otoscope:{name:"Otoscope",verb:"Look",icon:S_('<circle cx="7" cy="8" r="4"/><path d="M10 10.5l6 6"/><path d="M14.5 15l3-3 4 4-3 3z"/>')},
  hammer:{name:"Reflex hammer",verb:"Tap",icon:S_('<path d="M14 4l6 6-3 1-4-4z"/><path d="M14.5 8.5L4 19"/>')},
  torch:{name:"Pen torch",verb:"Shine",icon:S_('<rect x="3" y="10" width="11" height="4" rx="1" transform="rotate(-30 8.5 12)"/><path d="M16 6l2-2M18 9l3-1M15 3l1-2"/>')},
  pin:{name:"Sensation",verb:"Test",icon:S_('<path d="M12 3v13"/><circle cx="12" cy="18.5" r="2.5"/>')},
  motor:{name:"Tone & power",verb:"Test",icon:S_('<path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/>')},
  special:{name:"Bedside tests",verb:"Do",icon:S_('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>')}
};
const TRAYICON={
  ecg:`<svg viewBox="0 0 34 34"><circle cx="9" cy="10" r="5" fill="#f4f6f7"/><circle cx="25" cy="10" r="5" fill="#f4f6f7"/><circle cx="17" cy="24" r="5" fill="#f4f6f7"/><g fill="#e04f4f"><circle cx="9" cy="10" r="1.6"/><circle cx="25" cy="10" r="1.6"/><circle cx="17" cy="24" r="1.6"/></g></svg>`,
  spo2:`<svg viewBox="0 0 34 34"><rect x="8" y="10" width="18" height="14" rx="5" fill="#2a3a8a"/><circle cx="17" cy="17" r="4" fill="#ff4d4d"/><path d="M26 17 h6" stroke="#9aa6aa" stroke-width="2"/></svg>`,
  nibp:`<svg viewBox="0 0 34 34"><rect x="5" y="9" width="24" height="14" rx="4" fill="#2b4e7a"/><path d="M17 23 C17 30 26 30 28 26" stroke="#4d6a8f" stroke-width="2.5" fill="none"/><circle cx="28" cy="26" r="3" fill="#4d6a8f"/></svg>`,
  temp:`<svg viewBox="0 0 34 34"><rect x="8" y="12" width="20" height="10" rx="5" fill="#dfe5e8"/><rect x="4" y="15" width="6" height="4" rx="2" fill="#9aa6aa"/><rect x="14" y="14" width="10" height="6" rx="1" fill="#3b4a4f"/></svg>`,
  iv:`<svg viewBox="0 0 34 34"><path d="M6 28 L20 14" stroke="#c9d3d6" stroke-width="2"/><rect x="18" y="6" width="10" height="12" rx="2" fill="#f2c94c" transform="rotate(45 23 12)"/></svg>`,
  o2:`<svg viewBox="0 0 34 34"><path d="M9 10 q8 -6 16 0 q4 10 -8 16 q-12 -6 -8 -16z" fill="#bfe8d6" opacity=".7" stroke="#8fd1b5"/><path d="M17 26 v6" stroke="#8fd1b5" stroke-width="2"/></svg>`,
  ecg12:`<svg viewBox="0 0 34 34"><rect x="3" y="7" width="28" height="20" rx="2" fill="#fbf1ef"/><path d="M5 19 h6 l2 -7 l2 11 l2 -6 h12" stroke="#1b1b1b" stroke-width="1.6" fill="none"/></svg>`,
  xray:`<svg viewBox="0 0 34 34"><rect x="5" y="4" width="24" height="26" rx="2" fill="#0b0b0b" stroke="#55656a"/><ellipse cx="13" cy="17" rx="5" ry="9" fill="#3a3a3a"/><ellipse cx="21" cy="17" rx="5" ry="9" fill="#3a3a3a"/><ellipse cx="19" cy="21" rx="5" ry="4" fill="#bdbdbd"/></svg>`,
  ct:`<svg viewBox="0 0 34 34"><rect x="3" y="3" width="28" height="28" rx="3" fill="#0b0b0b" stroke="#55656a"/><ellipse cx="17" cy="17" rx="10" ry="12" fill="#6d6d6d" stroke="#eee" stroke-width="2"/><path d="M8.5 9 q-2 8 0 16" stroke="#ddd" stroke-width="2.5" fill="none"/></svg>`,
  glucose:`<svg viewBox="0 0 34 34"><rect x="9" y="5" width="16" height="24" rx="3" fill="#dfe5e8"/><rect x="12" y="8" width="10" height="7" rx="1" fill="#2c3a4a"/><rect x="15" y="27" width="4" height="5" fill="#9aa6aa"/></svg>`,
  labs:`<svg viewBox="0 0 34 34"><rect x="10" y="4" width="6" height="24" rx="3" fill="#dfe5e8"/><rect x="10" y="16" width="6" height="12" rx="3" fill="#b3261e"/><rect x="19" y="4" width="6" height="24" rx="3" fill="#dfe5e8"/><rect x="19" y="18" width="6" height="10" rx="3" fill="#6b4fb3"/></svg>`
};
const HAMMER=`<svg class="hammer" viewBox="0 0 70 70" aria-hidden="true"><path d="M60 8 L14 54" stroke="#c9d3d6" stroke-width="4" stroke-linecap="round"/><path d="M0 62 L14 44 L24 58 Z" fill="#d94f3d" stroke="#8a2c20" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

/* ---------------- state ---------------- */
let C=null,S=null,curRegion=null,examTool="all",rTab="talk",midTab="chart",orderCat=null,talkWho="pt",soundOn=false,magOn=false,editing=false,toastFor=null,LAYOUT={};
const actById=id=>C.actions.find(a=>a.id===id);
function newState(){
  return{t:0,v:{...C.vitals},done:{},at:{},count:{},results:{},keys:{},flags:{},log:[],pending:[],
    attach:{ecg:false,spo2:false,nibp:false,temp:false,o2:false,iv:false},toggles:{},bp:null,bpAt:null,chat:[],ended:false,hints:0,outcome:"",
    res:{used:0,items:[],overNoted:false},view:Object.keys(C.views)[0],transient:null};
}
const api={
  say:(t,who)=>say(t,who),
  log:(a,b,f,x)=>addLog(a,b,f,x),
  transient:(st,ms)=>{S.transient={state:st,until:performance.now()+ms};renderStage();setTimeout(()=>{if(S)renderStage();},ms+30);},
  toast:(t,v)=>showToast(t,v),
  fmt:t=>fmt(t),
  draw:{}
};

/* ---------------- navigation (homepage lives in home.js) ---------------- */
document.addEventListener("click",e=>{const p=e.target.closest("[data-play]");if(p){e.preventDefault();startCase(p.dataset.play);}});
function jump(id){const el=$(id);if(el)el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});}
function show(view){
  ["viewLib","viewPlay","viewDebrief"].forEach(v=>$(v).hidden=v!==view);
  document.querySelector("header.top").hidden=view==="viewLib";
  $("btnLib").hidden=view==="viewLib";
  $("crumb").textContent=view==="viewLib"?"":(C?C.title:"");
  closeViewer();$("toast").hidden=true;window.scrollTo(0,0);
}
window.TD={DEFS,startCase:id=>startCase(id),show:v=>show(v),jump:id=>jump(id),onScore:null,onHome:null};

/* ---------------- start ---------------- */
function startCase(id){
  C=DEFS.find(c=>c.id===id);S=newState();C.init&&C.init(S,api);
  curRegion=null;examTool="all";rTab="talk";midTab="chart";orderCat=null;talkWho=C.talkTo[0].who;
  $("ptName").textContent=C.patient.name;$("ptMeta").textContent=C.patient.meta;$("monTitle").textContent=C.bed||"BED · ADULT";
  $("transfer").hidden=true;
  $("viewSeg").innerHTML=Object.entries(C.views).map(([k,v])=>`<button data-view="${k}" aria-pressed="${k===S.view}">${v.label}</button>`).join("");
  $("viewSeg").hidden=Object.keys(C.views).length<2;
  setView(S.view);hideCloseup();
  addLog("Arrival",C.arrival,"");
  show("viewPlay");setTabs();renderAll();
  traces.forEach(t=>{t.ctx=null;t.x=0;t.last=null;});
  setTimeout(()=>say(C.patient.cc,"pt"),450);
}
function renderAll(){renderStage();renderMarkers();renderRegion();renderVitals();renderRes();renderLog();renderFindings();renderTalk();renderExam();renderTray();renderOrders();}
function fmt(t){const m=Math.floor(t),s=Math.round((t-m)*60);return `T+${String(m).padStart(2,"0")}:${String(s===60?59:s).padStart(2,"0")}`;}
function addLog(title,body,flag,extra={}){S.log.push({title,body,flag,t:S.t,...extra});}

let bubbleTimer;
function say(txt,who="pt"){
  if(!txt)return;
  if(S)S.chat.push({who,txt});
  if(who!=="pt"){renderTalk();return;}
  $("bubbleWho").textContent=C.patient.first;$("bubbleTxt").textContent=txt;$("bubble").classList.add("on");
  clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>$("bubble").classList.remove("on"),Math.max(4500,txt.length*65));
  renderTalk();
}

/* ---------------- resources ---------------- */
function spend(n,label){
  if(!n)return;
  S.res.used+=n;S.res.items.push({label,n,t:S.t});
  if(!S.res.overNoted&&S.res.used>C.budget){S.res.overNoted=true;
    addLog("Past the resource budget",`You've used more than this case's ${C.budget} tokens. Nothing is blocked; the debrief shows where they went.`,"warn",{resnote:true});}
}
function renderRes(){
  const u=S.res.used,b=C.budget,max=Math.max(b*1.5,u),r=u/b,c1=Math.floor(b*.6);
  $("resNum").innerHTML=`${u}<small> / ${b} tokens</small>`;
  const [col,txt]=r<=.6?["var(--ecg)","Comfortable"]:r<=1?["var(--resp)","Getting tight"]:["var(--warn)",`Over by ${u-b}`];
  $("resFill").style.width=(u/max*100)+"%";$("resFill").style.background=col;$("resTick").style.left=`calc(${b/max*100}% - 1px)`;
  $("resState").innerHTML=`${txt}<br>Study mode · never blocks`;
  $("resLegend").innerHTML=`<span>Comfortable 0–${c1}</span><span>Tight ${c1+1}–${b}</span><span>Over ${b+1}+</span>`;
  $("resLast").textContent=S.res.items.slice(-3).reverse().map(i=>`−${i.n} ${i.label}`).join(" · ")||"Talking and examining are free. Tests and kit cost tokens.";
}

/* ---------------- time ---------------- */
function cycleBp(){S.bp={s:Math.round(S.v.sbp),d:Math.round(S.v.dbp)};S.bpAt=S.t;}
function advance(mins){
  const steps=Math.round(mins*2);
  for(let i=0;i<steps;i++){
    S.t+=.5;C.tick&&C.tick(S,api);
    if(S.attach.nibp&&S.t-S.bpAt>=5)cycleBp();
  }
  S.pending.filter(p=>!p.ready&&S.t>=p.due).forEach(p=>{
    p.ready=true;S.done[p.a.id+"_res"]=true;
    const r=p.a.run?p.a.run(S,api):{b:val(p.a.b,S),f:p.a.f};S.results[p.a.id]=r.b;
    const e=S.log.find(l=>l.pid===p.a.id);if(e){e.body=r.b;e.flag=r.f||"";e.pending=false;e.view=p.a.viewer||"labs";e.t=S.t;}
    showToast(`${p.a.short||p.a.t} resulted`,p.a.viewer||"labs");
  });
}

/* ---------------- actions ---------------- */
function toggleDevice(key){
  if(!S||S.ended)return;
  const d=DEVICES[key],a=C.actions.find(x=>x.device===key);
  if(S.attach[key]){
    if(d.off==null)return;
    advance(.5);S.attach[key]=false;spend(d.off,`remove ${d.short}`);S.toggles[key]=(S.toggles[key]||0)+1;
    if(key==="nibp")S.bp=null;
    addLog(`${d.name} removed`,key==="o2"?"Mask off. Back on room air.":"Channel off the monitor.","");
  }else{
    advance(Math.max(.5,a&&a.cost||.5));S.attach[key]=true;spend(d.on,`${S.done[a.id]?"re-attach":"attach"} ${d.short}`);
    if(!S.done[a.id]){S.done[a.id]=true;S.at[a.id]=S.t;}
    if(key==="nibp")cycleBp();
    addLog(`${d.name} on`,val(C.deviceText[key],S)||"Attached.",a.f||"");
  }
  C.after&&C.after(S,a,api);
  renderAll();
}
function doAction(a,opts={}){
  if(!S||S.ended||!a)return;
  if(a.device)return toggleDevice(a.device);
  if(a.req&&!S.done[a.req]){addLog(a.t,a.reqMsg||"Do the prerequisite first.","warn");renderLog();setMid("chart");return;}
  if(a.needIv&&!S.attach.iv){addLog(a.t,"No IV access yet. Site a cannula first (Equipment).","warn");renderLog();setMid("chart");return;}
  if(S.done[a.id]&&!a.repeat){if(a.viewer)openViewer(a.viewer);else if(a.fx&&a.region)playFx(a,S.keys[a.id]);return;}
  if(a.block){const r=a.block(S,api);if(r){S.flags["blocked_"+a.id]=true;addLog(a.t,r.b,r.f||"warn");if(r.say)say(r.say,"pt");renderAll();setMid("chart");return;}}
  advance(a.cost||0);
  S.done[a.id]=true;S.count[a.id]=(S.count[a.id]||0)+1;if(S.at[a.id]==null)S.at[a.id]=S.t;
  spend(a.tok||0,a.short||a.t);
  if(a.cat==="Talk")S.chat.push({who:"you",txt:a.t,to:a.who||"pt"});
  if(a.delay){
    S.pending.push({a,due:S.t+a.delay,ready:false});
    addLog(a.t,`Sent. Result in about ${a.delay} min.`,"",{pending:true,pid:a.id});
  }else{
    const r=a.run?a.run(S,api):{b:val(a.b,S),f:a.f};
    S.results[a.id]=r.b;S.keys[a.id]=r.k||val(a.k,S)||"";
    const said=r.say||val(a.say,S);if(said)say(said,a.who||"pt");
    addLog(a.logT||a.t,r.b,r.f||"",a.viewer?{view:a.viewer}:{});
    if(a.viewer&&!opts.silent)openViewer(a.viewer,true);
  }
  if(a.region&&!opts.noZoom){
    const already=curRegion===a.region;
    if(!already)zoomTo(a.region,true);
    if(a.fx)setTimeout(()=>playFx(a,S.keys[a.id]),already||reduce?60:560);
  }
  if(a.sound)playSound(a.sound);
  if(a.end){S.outcome=a.id;return transferOut(a);}
  C.after&&C.after(S,a,api);
  renderAll();
}
function transferOut(a){
  zoomOut();renderAll();
  $("transfer").textContent=val(C.transferText[a.id],S)||"Transferring…";$("transfer").hidden=false;
  setTimeout(endCase,reduce?300:1800);
}

/* ---------------- stage ---------------- */
function layoutFor(v){return Object.assign({},C.views[v].markers,store.get(`td-${C.id}-${v}`)||{});}
function setView(v){
  S.view=v;const V=C.views[v];
  $("stage").style.aspectRatio=V.aspect;
  $("stateImgs").innerHTML=V.states?Object.entries(V.states).map(([k,src])=>`<img src="${src}" data-state="${k}" alt="${C.patient.name}, ${k}" class="off">`).join(""):`<img src="${V.img}" data-state="*" alt="${C.patient.name}, ${V.label.toLowerCase()} view">`;
  LAYOUT=layoutFor(v);
  $("viewSeg").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===v));
  if(S)renderStage();renderMarkers();
}
$("viewSeg").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(!b||!S)return;zoomOut();setView(b.dataset.view);});
function appearance(){
  const ap=C.appearance(S);
  if(S.transient&&performance.now()<S.transient.until)ap.state=S.transient.state;
  return ap;
}
function renderStage(){
  const ap=appearance();
  document.querySelectorAll("#stateImgs img").forEach(i=>i.classList.toggle("off",i.dataset.state!=="*"&&i.dataset.state!==ap.state));
  $("ptLook").textContent=ap.look;$("clock").textContent=fmt(S.t);$("hudExtra").innerHTML=C.hud?C.hud(S):"";
}
function regionHasTool(k){return examTool==="all"||C.actions.some(a=>a.region===k&&a.tech===examTool);}
function renderMarkers(){
  if(!S)return;
  $("markers").innerHTML=Object.keys(LAYOUT).filter(k=>C.regions[k]).map(k=>{
    const p=LAYOUT[k],devs=Object.keys(DEVICES).filter(d=>C.deviceRegion[d]===k&&S.attach[d]);
    return `<button class="mk${regionHasTool(k)?"":" dim"}" data-r="${k}" style="left:${p.x}%;top:${p.y}%" aria-label="${C.regions[k].name}"><span class="lbl">${C.regions[k].name}</span></button>
      ${devs.length?`<div class="badges" style="left:${p.x}%;top:${p.y}%">${devs.map(d=>`<span class="badge" style="color:${DEVICES[d].col};border-color:${DEVICES[d].col}">${DEVICES[d].short}</span>`).join("")}</div>`:""}`;
  }).join("");
}
function zoomTo(k,fromAction){
  if(!LAYOUT[k]){const v=Object.keys(C.views).find(v=>layoutFor(v)[k]);if(v)setView(v);else return;}
  const p=LAYOUT[k],s=reduce?1:(C.regions[k].scale||2.4);
  const cl=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  const tx=cl(.5-p.x/100*s,1-s,0),ty=cl(.5-p.y/100*s,1-s,0);
  const z=$("zoomer");z.style.setProperty("--s",s);z.style.transform=`translate(${tx*100}%,${ty*100}%) scale(${s})`;
  curRegion=k;$("btnZoomOut").hidden=false;
  showCloseup(k);renderRegion();renderMarkers();
  $("sceneHint").textContent=magActive()?"Move over the photo to magnify.":`At the ${C.regions[k].name.toLowerCase()}.`;
}
function zoomOut(){
  hideCloseup();const z=$("zoomer");z.style.setProperty("--s",1);z.style.transform="";
  curRegion=null;$("btnZoomOut").hidden=true;
  $("sceneHint").textContent=editing?"Drag markers onto the body.":"Tap a marker to move in closer.";
  if(S){renderRegion();renderMarkers();}
}
let closeTimer;
function showCloseup(k){
  const R=C.regions[k];clearTimeout(closeTimer);
  $("closeImg").src=R.close;$("closeImg").alt=`Close-up: ${R.name}`;$("closeLbl").textContent=R.name;
  renderCloseChips();
  closeTimer=setTimeout(()=>{$("closeup").classList.add("on");$("markers").style.visibility="hidden";},reduce?0:480);
  $("closeup").classList.toggle("mag",magActive());
}
function renderCloseChips(){
  if(!curRegion)return;
  $("closeChips").innerHTML=Object.keys(DEVICES).filter(d=>C.deviceRegion[d]===curRegion&&S.attach[d]).map(d=>`<span class="badge" style="color:${DEVICES[d].col};border-color:${DEVICES[d].col}">${DEVICES[d].short} attached</span>`).join("");
}
function hideCloseup(){clearTimeout(closeTimer);$("closeup").classList.remove("on");$("markers").style.visibility="";$("loupe").style.display="none";$("fxLayer").innerHTML="";}
$("btnZoomOut").onclick=zoomOut;$("btnCloseBack").onclick=zoomOut;
$("markers").addEventListener("click",e=>{const m=e.target.closest("[data-r]");if(!m||editing||!S||S.ended)return;zoomTo(m.dataset.r);});

/* hover: highlight the body area a list row or marker refers to */
let hoverKey=null;
function setHover(k){
  if(k===hoverKey)return;hoverKey=k;
  document.querySelectorAll("#markers .mk").forEach(m=>m.classList.toggle("hl",m.dataset.r===k));
  if(editing)return;
  if(k&&C&&C.regions[k])$("sceneHint").innerHTML=`<b style="color:var(--accent)">${C.regions[k].name}</b>${C.regions[k].hint?` · ${C.regions[k].hint}`:""}`;
  else $("sceneHint").textContent=curRegion?`At the ${C.regions[curRegion].name.toLowerCase()}.`:"Tap a marker to move in closer.";
}
["regionBody","examList","markers"].forEach(id=>{
  $(id).addEventListener("pointerover",e=>{const el=e.target.closest("[data-hr],[data-r]");setHover(el?(el.dataset.hr||el.dataset.r):null);});
  $(id).addEventListener("pointerleave",()=>setHover(null));
});

/* magnifier */
function magActive(){return magOn||examTool==="inspect";}
$("btnMag").onclick=()=>{magOn=!magOn;$("btnMag").setAttribute("aria-pressed",magOn);$("closeup").classList.toggle("mag",magActive());if(!magActive())$("loupe").style.display="none";};
$("closeup").addEventListener("pointermove",e=>{
  if(!magActive()||e.target.closest("button"))return $("loupe").style.display="none";
  const img=$("closeImg"),r=$("closeup").getBoundingClientRect();if(!img.naturalWidth)return;
  const sc=Math.max(r.width/img.naturalWidth,r.height/img.naturalHeight),dw=img.naturalWidth*sc,dh=img.naturalHeight*sc,ox=(r.width-dw)/2,oy=(r.height-dh)/2;
  const px=e.clientX-r.left,py=e.clientY-r.top,Z=2.6,L=$("loupe");
  L.style.display="block";L.style.left=px+"px";L.style.top=py+"px";
  L.style.backgroundImage=`url("${img.src}")`;L.style.backgroundSize=`${dw*Z}px ${dh*Z}px`;
  L.style.backgroundPosition=`${-((px-ox)*Z-75)}px ${-((py-oy)*Z-75)}px`;
});
$("closeup").addEventListener("pointerleave",()=>$("loupe").style.display="none");

/* effects on the close-up */
function playFx(a,key){
  if(curRegion!==a.region||!a.at)return;
  const fx=document.createElement("div");fx.className="fx";fx.style.left=a.at.x+"%";fx.style.top=a.at.y+"%";
  const label=key?`${a.side?a.side+" · ":""}${key}`:"";
  if(a.fx==="hammer")fx.innerHTML=`${HAMMER}<span class="ripple"></span>${label?`<span class="res">${label}</span>`:""}`;
  else if(a.fx==="torch"){const f=document.createElement("div");f.className="flashlight";f.style.setProperty("--fx",a.at.x+"%");f.style.setProperty("--fy",a.at.y+"%");$("fxLayer").appendChild(f);setTimeout(()=>f.remove(),1300);fx.innerHTML=label?`<span class="res">${label}</span>`:"";}
  else fx.innerHTML=`<span class="ripple"></span>${label?`<span class="res">${label}</span>`:""}`;
  $("fxLayer").appendChild(fx);setTimeout(()=>fx.remove(),2800);
}

/* marker editing */
$("btnEdit").onclick=()=>{editing=!editing;zoomOut();$("stage").classList.toggle("editing",editing);
  $("btnEdit").setAttribute("aria-pressed",editing);$("btnEdit").textContent=editing?"Done editing":"Edit markers";$("btnCopy").hidden=!editing;
  $("sceneHint").textContent=editing?"Drag markers onto the body.":"Tap a marker to move in closer.";};
let drag=null;
$("markers").addEventListener("pointerdown",e=>{if(!editing)return;const m=e.target.closest("[data-r]");if(!m)return;drag=m.dataset.r;m.setPointerCapture(e.pointerId);e.preventDefault();});
$("markers").addEventListener("pointermove",e=>{if(!drag)return;const r=$("stage").getBoundingClientRect();
  LAYOUT[drag]={x:Math.round(Math.min(98,Math.max(2,(e.clientX-r.left)/r.width*100))*10)/10,y:Math.round(Math.min(97,Math.max(3,(e.clientY-r.top)/r.height*100))*10)/10};
  const m=$("markers").querySelector(`[data-r="${drag}"]`);m.style.left=LAYOUT[drag].x+"%";m.style.top=LAYOUT[drag].y+"%";});
$("markers").addEventListener("pointerup",()=>{if(!drag)return;drag=null;store.set(`td-${C.id}-${S.view}`,LAYOUT);renderMarkers();});
$("btnCopy").onclick=()=>{const txt=JSON.stringify({case:C.id,view:S.view,markers:LAYOUT},null,2);
  const fallback=()=>{$("vTitle").textContent="Marker layout";$("vBody").innerHTML=`<p class="sub" style="margin:0">Select all and copy.</p><textarea class="code" readonly>${txt}</textarea>`;$("viewer").hidden=false;$("vBody").querySelector("textarea").select();};
  try{navigator.clipboard.writeText(txt).then(()=>{$("btnCopy").textContent="Copied";setTimeout(()=>$("btnCopy").textContent="Copy layout",1500);},fallback);}catch(e){fallback();}};
$("btnLabels").onclick=()=>{const on=$("stage").classList.toggle("labels-on");$("btnLabels").setAttribute("aria-pressed",on);};

/* ---------------- action lists ---------------- */
function meta(a){return `${a.cost||0} min · ${a.tok?a.tok+" tok":"free"}`;}
function rowHTML(a){
  const done=S.done[a.id]&&!a.repeat,res=S.results[a.id];
  const btn=done?(a.viewer?`<button class="btn xs" data-view="${a.viewer}">View</button>`:a.sound?`<button class="btn xs" data-sound="${a.sound}">▶ Play</button>`:a.fx?`<button class="btn xs" data-a="${a.id}">Replay</button>`:"")
    :`<button class="btn xs primary" data-a="${a.id}">${a.verb||TECH[a.tech]?.verb||"Do"}</button>`;
  return `<div class="arow${done?" done":""}"${a.region?` data-hr="${a.region}"`:""}><div class="nm">${TECH[a.tech]?.icon||""}<span>${a.t}<small>${meta(a)}</small></span></div><div>${btn}</div>${res&&S.done[a.id]?`<div class="res">${res}</div>`:""}</div>`;
}
function pairHTML(g,list){
  const first=list[0];
  const sides=["R","L"].map(sd=>{const a=list.find(x=>x.side===sd);if(!a)return"";const k=S.keys[a.id];
    return S.done[a.id]?`<button class="btn xs got" data-a="${a.id}" title="Replay">${sd} ${k||"✓"}</button>`:`<button class="btn xs primary" data-a="${a.id}">${sd==="R"?"Right":"Left"}</button>`;}).join("");
  const res=["R","L"].map(sd=>{const a=list.find(x=>x.side===sd);return a&&S.done[a.id]?`<div><b>${sd==="R"?"Right":"Left"}:</b> ${S.results[a.id]}</div>`:"";}).join("");
  return `<div class="arow${list.every(a=>S.done[a.id])?" done":""}" data-hr="${first.region}"><div class="nm">${TECH[first.tech]?.icon||""}<span>${g}<small>${meta(first)} each side</small></span></div><div class="sides">${sides}</div>${res?`<div class="res">${res}</div>`:""}</div>`;
}
function listHTML(list,groupByTech){
  const out=[];const seen=new Set();
  const techs=groupByTech?Object.keys(TECH).filter(t=>list.some(a=>a.tech===t)):[null];
  techs.forEach(t=>{
    const sub=t?list.filter(a=>a.tech===t):list;
    if(t)out.push(`<div class="agroup-t">${TECH[t].name}</div>`);
    sub.forEach(a=>{
      if(a.group){if(seen.has(a.group))return;seen.add(a.group);out.push(pairHTML(a.group,sub.filter(x=>x.group===a.group)));}
      else out.push(rowHTML(a));
    });
  });
  return out.join("");
}
function bindList(el){
  el.addEventListener("click",e=>{
    const v=e.target.closest("[data-view]");if(v)return openViewer(v.dataset.view);
    const s=e.target.closest("[data-sound]");if(s)return playSound(s.dataset.sound);
    const d=e.target.closest("[data-dev]");if(d)return toggleDevice(d.dataset.dev);
    const r=e.target.closest("[data-zoom]");if(r)return zoomTo(r.dataset.zoom);
    const t=e.target.closest("[data-gotalk]");if(t){setRTab("talk");return;}
    const b=e.target.closest("[data-a]");if(b)doAction(actById(b.dataset.a));
  });
}
function renderRegion(){
  if(!S)return;
  if(!curRegion){
    $("regionTitle").textContent="Patient overview";$("regionSub").textContent="Tap a body area to examine it";
    $("regionBody").innerHTML=`<div class="alist">${C.regionOrder.map(k=>{const acts=C.actions.filter(a=>a.region===k);const n=acts.filter(a=>S.done[a.id]).length;
      return `<div class="arow hov" data-hr="${k}" data-zoom="${k}"><div class="nm"><span>${C.regions[k].name}<small>${n} of ${acts.length} done${C.regions[k].hint?` · ${C.regions[k].hint}`:""}</small></span></div><div><button class="btn xs" data-zoom="${k}">Examine</button></div></div>`;}).join("")}</div>`;
    return;
  }
  const R=C.regions[curRegion];
  $("regionTitle").textContent=R.name;$("regionSub").textContent=examTool==="all"?"All techniques":`Showing: ${TECH[examTool].name}`;
  const acts=C.actions.filter(a=>a.region===curRegion&&(examTool==="all"||a.tech===examTool));
  const devs=Object.keys(DEVICES).filter(d=>C.deviceRegion[d]===curRegion);
  let html=`<div class="alist">`;
  if(R.talk)html+=`<div class="arow"><div class="nm"><span>Talk to ${C.patient.first}<small>History questions are on the right, in Talk</small></span></div><div><button class="btn xs primary" data-gotalk>Open Talk</button></div></div>`;
  html+=listHTML(acts,true);
  if(examTool!=="all"&&!acts.length)html+=`<p class="sub" style="margin:4px 0">No ${TECH[examTool].name.toLowerCase()} technique here. <button class="btn xs" id="showAll">Show all</button></p>`;
  if(devs.length){html+=`<div class="agroup-t">Equipment here</div>`+devs.map(k=>{const d=DEVICES[k],on=S.attach[k],locked=on&&d.off==null;
    return `<div class="arow"><div class="nm">${TRAYICON[k].replace("<svg","<svg class=\"ti\"")}<span>${d.name}<small>${on?"Attached":"Not attached"}</small></span></div><div><button class="btn xs${on?"":" primary"}" data-dev="${k}" ${locked?"disabled":""}>${locked?"In place":on?`Remove · ${d.off} tok`:`Attach · ${d.on} tok`}</button></div></div>`;}).join("");}
  $("regionBody").innerHTML=html+`</div>`;
  const sa=$("showAll");if(sa)sa.onclick=()=>{setTool("all");};
}
bindList($("regionBody"));

/* ---------------- right panel ---------------- */
function setTabs(){
  document.querySelectorAll("#rTabs [data-rt]").forEach(b=>b.setAttribute("aria-selected",b.dataset.rt===rTab));
  ["talk","exam","equip","orders"].forEach(k=>$("r"+k[0].toUpperCase()+k.slice(1)).hidden=k!==rTab);
  document.querySelectorAll("#midTabs [data-mt]").forEach(b=>b.setAttribute("aria-selected",b.dataset.mt===midTab));
  $("log").hidden=midTab!=="chart";$("findings").hidden=midTab!=="find";
}
function setRTab(t){rTab=t;setTabs();}
function setMid(t){midTab=t;setTabs();}
$("rTabs").addEventListener("click",e=>{const b=e.target.closest("[data-rt]");if(b)setRTab(b.dataset.rt);});
$("midTabs").addEventListener("click",e=>{const b=e.target.closest("[data-mt]");if(b)setMid(b.dataset.mt);});

function renderTalk(){
  if(!S)return;
  const names=Object.fromEntries(C.talkTo.map(t=>[t.who,t.name]));
  $("chat").innerHTML=(S.chat.length?S.chat:[{who:"pt",txt:C.patient.cc}]).map(m=>`<div class="msg ${m.who}">${m.who!=="you"?`<small>${names[m.who]||""}</small>`:m.to&&m.to!=="pt"?`<small>To ${names[m.to]}</small>`:""}${m.txt}</div>`).join("");
  $("chatScroll").scrollTop=1e6;
  $("qwho").innerHTML=C.talkTo.length>1?C.talkTo.map(t=>`<button class="btn xs" data-who="${t.who}" aria-pressed="${t.who===talkWho}">${t.name}</button>`).join(""):`<span class="label">Ask ${C.patient.first} · costs time, not tokens</span>`;
  const qs=C.actions.filter(a=>a.cat==="Talk"&&(a.who||"pt")===talkWho);
  $("qlist").innerHTML=qs.map(a=>`<button class="q" data-a="${a.id}" ${S.done[a.id]&&!a.repeat?"disabled":""}>${a.t}</button>`).join("");
}
$("qwho").addEventListener("click",e=>{const b=e.target.closest("[data-who]");if(b){talkWho=b.dataset.who;renderTalk();}});
$("qlist").addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b)doAction(actById(b.dataset.a));});

function setTool(t){examTool=t;renderExam();renderMarkers();renderRegion();$("closeup").classList.toggle("mag",magActive());}
function renderExam(){
  if(!S)return;
  const techs=Object.keys(TECH).filter(t=>C.actions.some(a=>a.tech===t));
  $("toolbar").innerHTML=`<button class="tool-chip" data-tool="all" aria-pressed="${examTool==="all"}">All</button>`+techs.map(t=>`<button class="tool-chip" data-tool="${t}" aria-pressed="${examTool===t}">${TECH[t].icon}${TECH[t].name}</button>`).join("");
  const html=C.regionOrder.map(k=>{
    const acts=C.actions.filter(a=>a.region===k&&a.cat==="Exam"&&(examTool==="all"||a.tech===examTool));
    if(!acts.length)return"";
    return `<div class="agroup-t" data-hr="${k}" style="display:flex;justify-content:space-between;align-items:center">${C.regions[k].name}<button class="btn xs" data-zoom="${k}">Go to</button></div>${listHTML(acts,false)}`;
  }).join("");
  $("examList").innerHTML=`<div class="alist">${html||'<p class="sub">Nothing for this tool.</p>'}</div>`;
}
$("toolbar").addEventListener("click",e=>{const b=e.target.closest("[data-tool]");if(b)setTool(b.dataset.tool);});
bindList($("examList"));

function renderTray(){
  if(!S)return;
  const devs=Object.keys(DEVICES).filter(k=>C.deviceRegion[k]);
  $("tray").innerHTML=devs.map(k=>{const d=DEVICES[k],on=S.attach[k],locked=on&&d.off==null;
      const cost=locked?"stays in":on?(d.off?`remove −${d.off}`:"remove · free"):`attach −${d.on}`;
      return `<button class="toolbtn" data-dev="${k}" aria-pressed="${on}" ${locked?"disabled":""}>${TRAYICON[k]}<span>${d.name}</span><span class="st">${on?"attached":"off"}</span><span class="cost">${cost}</span></button>`;}).join("")+
    (C.tray||[]).map(x=>{const a=actById(x.id),done=S.done[a.id];
      return `<button class="toolbtn" data-a="${a.id}" aria-pressed="${!!done}">${TRAYICON[x.icon]}<span>${a.short||a.t}</span><span class="st">${done?(a.viewer?"view":"done"):"order"}</span><span class="cost">${done?"":`−${a.tok||0}`}</span></button>`;}).join("");
}
bindList($("tray"));

const ORDER_CATS=["Monitoring","Diagnostics","Treatment","Disposition"];
function renderOrders(){
  if(!S)return;
  const cats=ORDER_CATS.filter(c=>C.actions.some(a=>a.cat===c));if(!orderCat||!cats.includes(orderCat))orderCat=cats[0];
  $("subtabs").innerHTML=cats.map(c=>`<button class="btn xs" data-cat="${c}" aria-pressed="${c===orderCat}">${c}</button>`).join("");
  const q=$("search").value.trim().toLowerCase();
  const list=C.actions.filter(a=>q?(ORDER_CATS.includes(a.cat)&&a.t.toLowerCase().includes(q)):a.cat===orderCat);
  $("orders").innerHTML=list.map(a=>{
    if(a.device){const d=DEVICES[a.device],on=S.attach[a.device],locked=on&&d.off==null;const tok=on?d.off:d.on;
      return `<button class="order${on?" on":""}" data-a="${a.id}" aria-pressed="${on}" ${locked?"disabled":""}><span class="t">${a.t}</span><span class="d">${locked?"In place":on?"Remove":"Attach"}${!locked?` · <b>${tok} tok</b>`:""}${on?" · on":""}</span></button>`;}
    const done=S.done[a.id]&&!a.repeat;
    const cost=(a.delay?`${a.cost} min · ~${a.delay} min result`:`${a.cost||0} min`)+` · <b>${a.tok?a.tok+" tok":"free"}</b>`;
    return `<button class="order${done?" done":""}" data-a="${a.id}" ${done&&!a.viewer?"disabled":""}><span class="t">${a.t}</span><span class="d">${q?a.cat+" · ":""}${cost}</span></button>`;
  }).join("")||`<p class="sub">No orders match “${q}”.</p>`;
}
$("subtabs").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(b){orderCat=b.dataset.cat;$("search").value="";renderOrders();}});
$("search").addEventListener("input",renderOrders);
bindList($("orders"));

/* ---------------- vitals ---------------- */
function renderVitals(){
  const v=S.v,a=S.attach;
  $("vHr").textContent=a.ecg?Math.round(v.hr):"---";$("offEcg").hidden=a.ecg;
  $("vSpo2").textContent=a.spo2?Math.round(v.spo2):"---";$("offSpo2").hidden=a.spo2;
  $("vBp").textContent=a.nibp&&S.bp?`${S.bp.s}/${S.bp.d}`:"---/---";$("offNibp").hidden=a.nibp;
  $("bpAge").textContent=a.nibp&&S.bp?`· ${fmt(S.bpAt).slice(2)}`:"";
  $("vRr").textContent=`${a.ecg?Math.round(v.rr):"--"} · ${a.temp?v.temp.toFixed(1):"--.-"}`;
  $("vBp").classList.toggle("alarm",!!(a.nibp&&S.bp&&(S.bp.s<90||S.bp.s>185)));
  $("vHr").classList.toggle("alarm",a.ecg&&(v.hr>110||v.hr<50));
}
$("btnCycle").onclick=()=>{if(!S)return;if(!S.attach.nibp){setRTab("equip");return;}cycleBp();renderVitals();};

/* ---------------- chart & findings ---------------- */
function renderLog(){
  $("log").innerHTML=[...S.log].reverse().map(l=>`<div class="entry${l.flag?" flag-"+l.flag:""}${l.pending?" pending":""}${l.hint?" hint":""}${l.resnote?" resnote":""}">
    <div class="h"><b>${l.hint?"Hint":l.title}</b><span>${fmt(l.t)}</span></div><p>${l.body}</p>${l.view?`<button class="btn xs view" data-view="${l.view}">Open</button>`:""}</div>`).join("");
}
$("log").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b)openViewer(b.dataset.view);});
function renderFindings(){
  const extra=C.findingsExtra?C.findingsExtra(S):"";
  const byRegion=C.regionOrder.map(k=>{const acts=C.actions.filter(a=>a.region===k&&S.done[a.id]&&S.results[a.id]);
    return acts.length?`<div class="fgroup"><h4>${C.regions[k].name}</h4>${acts.map(a=>`<p><b>${a.group?a.group+" ("+(a.side==="L"?"left":"right")+")":a.t}:</b> ${S.results[a.id]}</p>`).join("")}</div>`:"";}).join("");
  const tests=C.actions.filter(a=>["Diagnostics","Monitoring"].includes(a.cat)&&!a.device&&S.done[a.id]&&S.results[a.id]);
  $("findings").innerHTML=extra+(byRegion||`<p class="sub" style="margin:0">Examination findings appear here as you go.</p>`)+
    (tests.length?`<div class="fgroup"><h4>Investigations</h4>${tests.map(a=>`<p><b>${a.short||a.t}:</b> ${S.results[a.id]}</p>`).join("")}</div>`:"");
}
$("findings").addEventListener("click",e=>{const b=e.target.closest("[data-view]");if(b)openViewer(b.dataset.view);});

$("btnWait").onclick=()=>{if(!S||S.ended)return;advance(5);addLog("Waited 5 min","Reassessed at the bedside.","");C.onWait&&C.onWait(S,api);renderAll();};
$("btnHint").onclick=()=>{if(!S||S.ended)return;S.hints++;const h=C.hints.map(f=>f(S)).find(Boolean)||"You've covered the key steps. Decide on disposition.";addLog("Hint",h,"",{hint:true});setMid("chart");renderLog();};
$("btnEnd").onclick=()=>{if(!S)return;S.outcome="ended";endCase();};

/* ---------------- toast & viewer ---------------- */
let toastTimer;
function showToast(txt,view){$("toastTxt").textContent=txt;toastFor=view;$("toast").hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").hidden=true,6000);}
$("toastBtn").onclick=()=>{$("toast").hidden=true;openViewer(toastFor);};
let lastFocus=null;
function openViewer(kind,fresh){
  if(!S)return;lastFocus=document.activeElement;
  const body=$("vBody");body.innerHTML="";body.onclick=null;
  if(kind==="labs")$("vTitle").textContent=labsViewer(body);
  else if(C.viewers&&C.viewers[kind])$("vTitle").textContent=C.viewers[kind](body,S,api,!!fresh);
  else return;
  $("viewer").hidden=false;$("vClose").focus();
}
function labsViewer(body){
  const ready=Object.keys(C.labs).filter(k=>S.done[k+"_res"]),pend=Object.keys(C.labs).filter(k=>S.done[k]&&!S.done[k+"_res"]);
  body.innerHTML=`<div class="slip"><div class="hdr"><b>${C.patient.label}</b><span>${ready.length?"Collected "+fmt(Math.min(...ready.map(k=>S.at[k]))):"Awaiting samples"} · ${C.setting}</span></div>
    <table><thead><tr><th>Test</th><th>Result</th><th>Units</th><th>Reference</th></tr></thead><tbody>
    ${ready.flatMap(k=>C.labs[k].rows).map(r=>`<tr><td>${r[0]}</td><td class="${r[4]?"hi":""}">${r[1]}${r[4]?" "+(r[4]===-1?"L":"H"):""}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")||`<tr><td colspan="4">No results yet.</td></tr>`}
    ${pend.map(k=>`<tr><td>${C.labs[k].name}</td><td colspan="3" style="color:#8a7a77">Pending…</td></tr>`).join("")}
    </tbody></table></div>`;
  return "Laboratory results";
}
function closeViewer(){if($("viewer").hidden)return;$("viewer").hidden=true;$("vBody").onclick=null;if(lastFocus&&lastFocus.focus)lastFocus.focus();if(S&&!S.ended)renderAll();}
$("vClose").onclick=closeViewer;
$("viewer").addEventListener("click",e=>{if(e.target===$("viewer"))closeViewer();});
addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("viewer").hidden)closeViewer();else if(curRegion)zoomOut();}});

/* ---------------- waveforms ---------------- */
const g=(x,m,w)=>Math.exp(-((x-m)**2)/(2*w*w));
function beat(ph,p){
  let y=(p.p??.12)*g(ph,.1,.02)-(p.q??.08)*g(ph,.2,.006)+p.r*g(ph,.22,.008)-(p.s??.22)*g(ph,.24,.007)+(p.t??.3)*g(ph,.4,.04);
  if(ph>.245&&ph<.42)y+=(p.st||0)*Math.sqrt(Math.sin(Math.PI*(ph-.245)/.175));
  return p.inv?-y:y;
}
const fib=t=>.035*Math.sin(2*Math.PI*5.3*t)+.022*Math.sin(2*Math.PI*7.7*t+1.3)+.015*Math.sin(2*Math.PI*3.1*t+.4);
api.draw.ecg=function(cv,o){
  const mm=5,W=1250,H=650,d=Math.min(2,devicePixelRatio||1);
  cv.width=W*d;cv.height=H*d;const c=cv.getContext("2d");c.scale(d,d);
  const P=60/o.hr,pxs=mm*25,mv=mm*10,rowH=150,colW=W/4;
  let beats=[];if(o.af){let t=-1;let seed=7;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280;};while(t<11){beats.push(t);t+=P*(.62+rnd()*.76);}}
  const val=(t,L)=>{
    if(!o.af){const ph=((t+.15)/P)%1;return beat(ph,L);}
    let tb=beats[0];for(const b of beats){if(b<=t)tb=b;else break;}
    const ph=(t-tb)/P+.18;return (ph<1?beat(ph,{...L,p:0}):0)+fib(t);
  };
  const rows=[...o.grid.map((r,i)=>r.map((n,j)=>({n,x0:j*colW,x1:(j+1)*colW,y:40+rowH*(i+.55)}))).flat(),{n:o.rhythm||"II",x0:0,x1:W,y:40+rowH*3.5,rhythm:true}];
  let prog=o.animate?0:W;
  const paint=()=>{
    c.fillStyle="#fbf1ef";c.fillRect(0,0,W,H);
    for(let x=0;x<=W;x+=mm){c.strokeStyle=x%(mm*5)?"#f5d3cf":"#eba7a0";c.lineWidth=x%(mm*5)?.5:1;c.beginPath();c.moveTo(x,40);c.lineTo(x,H);c.stroke();}
    for(let y=40;y<=H;y+=mm){c.strokeStyle=(y-40)%(mm*5)?"#f5d3cf":"#eba7a0";c.lineWidth=(y-40)%(mm*5)?.5:1;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
    c.fillStyle="#1b1b1b";c.font="600 14px 'JetBrains Mono', monospace";c.fillText(o.title,10,18);
    c.font="12px 'JetBrains Mono', monospace";c.fillText(o.sub,10,34);
  };
  const draw=()=>{
    paint();c.strokeStyle="#1b1b1b";c.lineWidth=1.4;
    rows.forEach(r=>{
      if(r.x0===0){c.beginPath();c.moveTo(2,r.y);c.lineTo(6,r.y);c.lineTo(6,r.y-mv);c.lineTo(16,r.y-mv);c.lineTo(16,r.y);c.lineTo(20,r.y);c.stroke();}
      c.beginPath();const start=r.x0===0?22:r.x0,end=Math.min(r.x1,prog);
      for(let x=start;x<end;x++){const y=r.y-val(x/pxs,o.leads[r.n])*mv;x===start?c.moveTo(x,y):c.lineTo(x,y);}
      c.stroke();
      c.fillStyle="#1b1b1b";c.font="600 13px 'JetBrains Mono', monospace";c.fillText(r.n,r.x0+(r.x0===0?26:6),r.y-mv*.9);
      if(r.x0>0&&!r.rhythm){c.beginPath();c.moveTo(r.x0,r.y-12);c.lineTo(r.x0,r.y+12);c.stroke();}
    });
    if(prog<W){prog+=30;requestAnimationFrame(draw);}
  };
  draw();
};
function noise(c,W,H,amt){const img=c.getImageData(0,0,W,H),dt=img.data;let s=11;for(let i=0;i<dt.length;i+=4){s=(s*16807)%2147483647;const n=((s/2147483647)-.5)*amt;dt[i]+=n;dt[i+1]+=n;dt[i+2]+=n;}c.putImageData(img,0,0);}
api.draw.cxr=function(cv,o){
  const W=560,H=560,c=cv.getContext("2d");cv.width=W;cv.height=H;
  const blur=(px,fn)=>{c.save();c.filter=`blur(${px}px)`;fn();c.restore();};
  c.fillStyle="#050505";c.fillRect(0,0,W,H);
  // soft tissue torso
  blur(14,()=>{c.fillStyle="#3c3c3c";c.beginPath();c.moveTo(40,560);c.bezierCurveTo(30,330,40,150,120,95);c.quadraticCurveTo(200,60,280,62);c.quadraticCurveTo(360,60,440,95);c.bezierCurveTo(520,150,530,330,520,560);c.closePath();c.fill();});
  // lungs
  const lung=(side)=>{c.beginPath();if(side<0){c.moveTo(258,100);c.bezierCurveTo(180,95,112,170,96,300);c.bezierCurveTo(88,380,92,430,100,470);c.quadraticCurveTo(180,420,250,452);c.lineTo(252,300);c.closePath();}else{c.moveTo(302,100);c.bezierCurveTo(380,95,448,170,464,300);c.bezierCurveTo(472,380,468,440,460,478);c.quadraticCurveTo(380,430,310,462);c.lineTo(308,300);c.closePath();}};
  blur(5,()=>{[-1,1].forEach(s=>{const gr=c.createRadialGradient(280+s*95,300,20,280+s*120,300,190);gr.addColorStop(0,"#262626");gr.addColorStop(.6,"#131313");gr.addColorStop(1,"#0c0c0c");c.fillStyle=gr;lung(s);c.fill();});});
  // vascular markings from hila
  blur(1.2,()=>{c.strokeStyle="rgba(150,150,150,.35)";let sd=3;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    for(let i=0;i<46;i++){const s=i%2?1:-1,len=.35+rnd()*.65,ang=(-.9+rnd()*1.9);c.lineWidth=2.2*(1-len*.6);c.beginPath();const hx=280+s*58,hy=270+rnd()*30;c.moveTo(hx,hy);
      c.quadraticCurveTo(hx+s*60*len,hy+ang*40,hx+s*150*len,hy+ang*120*len);c.stroke();}});
  // spine
  blur(3,()=>{c.fillStyle="rgba(190,190,190,.22)";c.fillRect(262,40,36,520);for(let y=50;y<540;y+=27){c.fillStyle="rgba(220,220,220,.12)";c.fillRect(258,y,44,18);}});
  // trachea
  blur(3,()=>{c.fillStyle="#141414";c.beginPath();c.moveTo(270,40);c.lineTo(290,40);c.lineTo(288,230);c.lineTo(310,265);c.lineTo(302,272);c.lineTo(280,240);c.lineTo(258,272);c.lineTo(250,265);c.lineTo(272,230);c.closePath();c.fill();});
  // mediastinum + heart
  blur(4,()=>{c.fillStyle="#b9b9b9";c.beginPath();c.moveTo(250,120);c.lineTo(310,120);c.bezierCurveTo(330,160,340,190,330,215);c.bezierCurveTo(352,212,362,230,348,248);c.bezierCurveTo(410,290,425,380,400,430);c.quadraticCurveTo(320,470,236,440);c.bezierCurveTo(205,410,215,330,240,300);c.bezierCurveTo(235,250,240,180,250,120);c.fill();});
  // diaphragms + gastric bubble
  blur(3,()=>{c.fillStyle="#a8a8a8";c.beginPath();c.moveTo(60,560);c.lineTo(84,470);c.quadraticCurveTo(170,395,262,450);c.lineTo(262,560);c.fill();
    c.beginPath();c.moveTo(298,560);c.lineTo(298,465);c.quadraticCurveTo(390,410,476,482);c.lineTo(500,560);c.fill();
    c.fillStyle="#2a2a2a";c.beginPath();c.ellipse(390,505,34,18,0,0,Math.PI*2);c.fill();});
  // ribs
  blur(1.6,()=>{c.lineWidth=7;c.strokeStyle="rgba(235,235,235,.26)";
    for(let i=0;i<10;i++){const y=105+i*34;c.beginPath();c.moveTo(268,y);c.bezierCurveTo(200,y-34,120,y-6,96,y+52);c.stroke();c.beginPath();c.moveTo(292,y);c.bezierCurveTo(360,y-34,440,y-6,464,y+52);c.stroke();}
    c.lineWidth=5;c.strokeStyle="rgba(235,235,235,.12)";
    for(let i=0;i<6;i++){const y=150+i*40;c.beginPath();c.moveTo(120,y);c.quadraticCurveTo(180,y+30,250,y+48);c.stroke();c.beginPath();c.moveTo(440,y);c.quadraticCurveTo(380,y+30,310,y+48);c.stroke();}});
  // clavicles, scapulae
  blur(1.8,()=>{c.lineWidth=11;c.strokeStyle="rgba(240,240,240,.55)";c.beginPath();c.moveTo(262,112);c.quadraticCurveTo(170,82,82,98);c.stroke();c.beginPath();c.moveTo(298,112);c.quadraticCurveTo(390,82,478,98);c.stroke();
    c.lineWidth=3;c.strokeStyle="rgba(220,220,220,.2)";c.beginPath();c.moveTo(70,130);c.quadraticCurveTo(100,220,82,300);c.stroke();c.beginPath();c.moveTo(490,130);c.quadraticCurveTo(460,220,478,300);c.stroke();});
  noise(c,W,H,16);
  const v=c.createRadialGradient(280,280,200,280,280,400);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.55)");c.fillStyle=v;c.fillRect(0,0,W,H);
  c.fillStyle="#fff";c.font="600 22px 'JetBrains Mono', monospace";c.fillText("R",22,40);
  c.font="12px 'JetBrains Mono', monospace";c.fillStyle="rgba(255,255,255,.75)";c.fillText(o.label,22,540);
};
api.draw.ct=function(cv,o){
  const W=560,H=560,c=cv.getContext("2d");cv.width=W;cv.height=H;
  const blur=(px,fn)=>{c.save();c.filter=`blur(${px}px)`;fn();c.restore();};
  const cx=280,cy=290;
  c.fillStyle="#000";c.fillRect(0,0,W,H);
  // scalp + right frontal swelling (patient right = viewer left)
  blur(2,()=>{c.fillStyle="#4b4b4b";c.beginPath();c.ellipse(cx,cy,206,236,0,0,Math.PI*2);c.fill();
    if(o.swelling){c.beginPath();c.ellipse(cx-120,cy-178,46,26,-.75,0,Math.PI*2);c.fill();}});
  // skull
  c.fillStyle="#f2f2f2";c.beginPath();c.ellipse(cx,cy,194,224,0,0,Math.PI*2);c.fill();
  // brain
  const inner=()=>{c.beginPath();c.ellipse(cx,cy,180,210,0,0,Math.PI*2);};
  c.save();inner();c.clip();
  c.fillStyle="#7c7c7c";c.fillRect(0,0,W,H);
  blur(10,()=>{c.fillStyle="#6c6c6c";c.beginPath();c.ellipse(cx+o.shift*.5,cy+8,128,158,0,0,Math.PI*2);c.fill();});
  // sulci (effaced on the haematoma side)
  blur(1,()=>{c.strokeStyle="#2c2c2c";c.lineWidth=2.2;let sd=5;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    for(let i=0;i<70;i++){const a=rnd()*Math.PI*2,side=Math.cos(a)<0?-1:1;if(o.sdh&&side<0&&rnd()<.8)continue;const r1=.82+rnd()*.12;
      const x=cx+Math.cos(a)*176*r1,y=cy+Math.sin(a)*206*r1;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a)*(10+rnd()*14),y-Math.sin(a)*(10+rnd()*14));c.stroke();}});
  // falx (shifted to viewer right)
  blur(1,()=>{c.strokeStyle="#a6a6a6";c.lineWidth=2.4;c.beginPath();c.moveTo(cx,cy-206);c.quadraticCurveTo(cx+o.shift*2,cy,cx,cy+206);c.stroke();});
  // ventricles
  blur(1.5,()=>{c.fillStyle="#1c1c1c";const s=o.shift;
    c.beginPath();c.moveTo(cx+s-6,cy-70);c.bezierCurveTo(cx+s-30,cy-74,cx+s-40,cy-30,cx+s-22,cy+30);c.bezierCurveTo(cx+s-30,cy+60,cx+s-22,cy+78,cx+s-10,cy+70);c.lineTo(cx+s-6,cy-70);c.fill();
    c.beginPath();c.moveTo(cx+s+6,cy-74);c.bezierCurveTo(cx+s+44,cy-80,cx+s+56,cy-24,cx+s+36,cy+34);c.bezierCurveTo(cx+s+48,cy+66,cx+s+40,cy+90,cx+s+14,cy+82);c.lineTo(cx+s+6,cy-74);c.fill();
    c.fillRect(cx+s-2,cy+10,4,26);});
  // subdural haematoma crescent along viewer-left
  if(o.sdh){blur(1.4,()=>{c.fillStyle="#d8d8d8";c.beginPath();
    for(let a=Math.PI*.58;a<=Math.PI*1.42;a+=.02){c.lineTo(cx+Math.cos(a)*181,cy+Math.sin(a)*211);}
    for(let a=Math.PI*1.42;a>=Math.PI*.58;a-=.02){const th=o.sdh*Math.sin((a-Math.PI*.58)/(Math.PI*.84)*Math.PI);c.lineTo(cx+Math.cos(a)*(181-th),cy+Math.sin(a)*(211-th));}
    c.closePath();c.fill();});}
  c.restore();
  noise(c,W,H,12);
  c.fillStyle="#fff";c.font="600 20px 'JetBrains Mono', monospace";c.fillText("R",18,36);c.fillText("L",W-34,36);
  c.font="12px 'JetBrains Mono', monospace";c.fillStyle="rgba(255,255,255,.75)";c.fillText(o.label,18,H-18);c.fillText("W 80  L 40",W-104,H-18);
  if(o.annotate&&o.sdh){
    c.strokeStyle="#F6B73C";c.fillStyle="#F6B73C";c.lineWidth=2;c.font="600 13px 'Inter', sans-serif";
    c.beginPath();c.moveTo(60,200);c.lineTo(cx-168,cy-60);c.stroke();c.beginPath();c.arc(cx-168,cy-60,3,0,Math.PI*2);c.fill();c.fillText("Acute subdural haematoma",14,190);
    c.setLineDash([5,4]);c.beginPath();c.moveTo(cx,cy-40);c.lineTo(cx,cy+40);c.stroke();c.setLineDash([]);
    c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+o.shift*2,cy);c.stroke();c.fillText(`Midline shift ≈ ${o.shiftMm} mm`,cx+o.shift*2+8,cy+4);
  }
};

/* ---------------- live monitor ---------------- */
function plethY(ph){return .9*g(ph,.3,.07)+.35*g(ph,.5,.05);}
function setupCanvas(cv){const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;cv.width=Math.max(1,r.width*d);cv.height=Math.max(1,r.height*d);return cv.getContext("2d");}
const traces=[{c:$("cvEcg"),col:"#22C55E",key:"ecg",x:0,last:null},{c:$("cvPleth"),col:"#06B6D4",key:"spo2",x:0,last:null}];
let phase=0,factor=1,lastT=performance.now(),clockT=0;
function frame(now){
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;clockT+=dt;
  if(S&&C&&!$("viewPlay").hidden){
    const af=C.vitals.rhythm==="af";
    const prev=phase;phase+=dt*S.v.hr/60/factor;
    if(soundOn&&S.attach.ecg&&prev<.22&&phase>=.22)beep();
    if(phase>=1){phase-=1;factor=af?.62+Math.random()*.76:1;}
    traces.forEach(tr=>{
      const ctx=tr.ctx||(tr.ctx=setupCanvas(tr.c));const W=tr.c.width,H=tr.c.height,d=devicePixelRatio||1;
      const nx=(tr.x+dt*W/4)%W,on=S.attach[tr.key];
      let y=H*.6;
      if(on){if(tr.key==="ecg")y=H*.7-(beat(phase,af?{...C.monitorLead,p:0}:C.monitorLead)+(af?fib(clockT):0))*H*.55;
        else y=H*.72-plethY(phase)*H*.55*(S.v.sbp<90?.45:1);}
      ctx.fillStyle="#060c14";const gap=14*d;
      if(nx<tr.x){ctx.fillRect(tr.x,0,W-tr.x,H);ctx.fillRect(0,0,nx+gap,H);tr.last=null;}else ctx.fillRect(tr.x,0,nx-tr.x+gap,H);
      ctx.strokeStyle=on?tr.col:"#33445a";ctx.lineWidth=1.8*d;ctx.beginPath();
      if(tr.last!=null){ctx.moveTo(tr.x,tr.last);ctx.lineTo(nx,y);ctx.stroke();}
      tr.x=nx;tr.last=y;
    });
    if(S.transient&&performance.now()>S.transient.until){S.transient=null;renderStage();}
  }
  requestAnimationFrame(frame);
}
addEventListener("resize",()=>traces.forEach(t=>{t.ctx=null;t.x=0;t.last=null;}));
requestAnimationFrame(frame);

/* ---------------- audio ---------------- */
let AC=null;
function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();}catch(e){AC=null;}return AC;}
function beep(){const a=ac();if(!a)return;const f=S.attach.spo2?500+(S.v.spo2-85)*30:700;
  const o=a.createOscillator(),gn=a.createGain();o.type="sine";o.frequency.value=f;gn.gain.setValueAtTime(.0001,a.currentTime);gn.gain.exponentialRampToValueAtTime(.12,a.currentTime+.01);gn.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.09);o.connect(gn).connect(a.destination);o.start();o.stop(a.currentTime+.1);}
function thump(t,f,vol){const a=AC,o=a.createOscillator(),gn=a.createGain(),lp=a.createBiquadFilter();lp.type="lowpass";lp.frequency.value=180;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.6,t+.12);
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+.015);gn.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(lp).connect(gn).connect(a.destination);o.start(t);o.stop(t+.16);}
function noiseBurst(t,dur,freq,q,vol){const a=AC,len=Math.ceil(dur*a.sampleRate),buf=a.createBuffer(1,len,a.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<len;i++)ch[i]=Math.random()*2-1;
  const src=a.createBufferSource(),bp=a.createBiquadFilter(),gn=a.createGain();src.buffer=buf;bp.type="bandpass";bp.frequency.value=freq;bp.Q.value=q;
  gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(vol,t+dur*.35);gn.gain.exponentialRampToValueAtTime(.0001,t+dur*.95);src.connect(bp).connect(gn).connect(a.destination);src.start(t);src.stop(t+dur);}
function playSound(kind){const a=ac();if(!a||!S)return;const t0=a.currentTime+.05;
  if(kind==="heart"){let t=t0;const P=60/S.v.hr,af=C.vitals.rhythm==="af";for(let i=0;i<7;i++){thump(t,70,.9);thump(t+.3*Math.min(P,.8),90,.6);t+=P*(af?.62+Math.random()*.76:1);}}
  else if(kind==="breath"){const per=60/S.v.rr;for(let i=0;i<3;i++)noiseBurst(t0+i*per,per*.95,500,.6,.35);}
  else if(kind==="bowel"){for(let i=0;i<6;i++)noiseBurst(t0+i*.55+Math.random()*.3,.18+Math.random()*.2,260+Math.random()*300,4,.4);}
  else if(kind==="percuss"){thump(t0,140,.7);thump(t0+.45,140,.7);}
}
$("btnSound").onclick=()=>{soundOn=!soundOn;if(soundOn)ac();$("btnSound").textContent=soundOn?"Sound on":"Sound off";$("btnSound").setAttribute("aria-pressed",soundOn);};

/* ---------------- debrief ---------------- */
function endCase(){
  S.ended=true;zoomOut();
  const sc=C.score(S);let score=sc.rows.reduce((a,r)=>a+r.pts,0);const ded=sc.ded||[];
  if(S.hints){score-=S.hints*2;ded.push(`−${S.hints*2} for ${S.hints} hint${S.hints>1?"s":""}`);}
  score=Math.max(0,Math.min(100,score));
  $("dbScore").innerHTML=`${score}<small>/100</small>`;
  $("dbVerdict").textContent=score>=85?sc.great:score>=60?"Safe, with room to tighten the sequence.":"Key steps were missed. Review the teaching points and run it again.";
  $("dbOutcome").textContent=[sc.outcome,`Case ended at ${fmt(S.t)}.`,...ded].filter(Boolean).join(" ");
  $("dbDx").textContent=C.dx;
  const icon={ok:"✓",no:"✗",meh:"~"};
  $("dbCrit").innerHTML=sc.rows.map(r=>`<li><span class="i ${r.ok}">${icon[r.ok]}</span><div><div>${r.label}</div><div class="sub">${r.detail}</div></div><span class="pts">${r.pts}/${r.max}</span></li>`).join("");
  $("dbTeach").innerHTML=C.teaching.map(t=>`<li>${t}</li>`).join("");
  const u=S.res.used,b=C.budget,r=u/b;
  const [lab,col]=r<=.75?["Lean","var(--good)"]:r<=1?["On budget","var(--resp)"]:["Over budget","var(--warn)"];
  const low=C.actions.filter(a=>a.low&&(S.done[a.id]||S.flags["blocked_"+a.id]));
  const churn=Object.entries(S.toggles).filter(([k,n])=>n>0);
  const churnTok=churn.reduce((a,[k,n])=>a+n*((DEVICES[k].off||0)+DEVICES[k].on),0);
  $("dbRes").innerHTML=`<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span class="res-num">${u}<small> / ${b}</small></span><span class="pill" style="color:${col};border-color:${col}">${lab}</span></div>
    <p class="sub" style="margin:8px 0 0">Feedback only. It doesn't change your clinical score.</p>
    ${low.length?`<div class="label" style="margin:12px 0 6px">Lower-yield or unsafe choices</div>${low.map(a=>`<p style="margin:0 0 6px;font-size:13px"><b>${a.short||a.t}</b> · ${a.low}</p>`).join("")}`:""}
    ${churn.length?`<p style="margin:8px 0 0;font-size:13px">Removing and re-attaching ${churn.map(([k,n])=>`${DEVICES[k].short} ×${n}`).join(", ")} cost about ${churnTok} tokens. Leave monitoring on in an unstable patient.</p>`:""}`;
  const groups={};S.res.items.forEach(i=>{groups[i.label]=(groups[i.label]||0)+i.n;});
  const sorted=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  $("dbSpend").innerHTML=sorted.length?`<table class="spend"><tbody>${sorted.map(([l,n])=>`<tr><td>${l}</td><td>${n} tok</td></tr>`).join("")}<tr><td><b>Total</b></td><td><b>${u} tok</b></td></tr></tbody></table>`:`<p class="sub" style="margin:0">No tokens spent.</p>`;
  show("viewDebrief");$("crumb").textContent=C.title+" · debrief";
  try{window.TD.onScore&&window.TD.onScore(C,score,S);}catch(e){console.error(e);}
}
$("btnRetry").onclick=()=>startCase(C.id);
$("btnLogo").onclick=()=>{show("viewLib");window.TD.onHome&&window.TD.onHome();};
$("btnBack").onclick=$("btnLib").onclick=()=>{show("viewLib");window.TD.onHome&&window.TD.onHome();jump("cases");};

show("viewLib");
})();
