/* Triage Deck homepage: live hero, specialty case files, carousel, leaderboard */
(function(){
"use strict";
const TD=window.TD,DEFS=TD.DEFS,$=id=>document.getElementById(id);
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const homeVisible=()=>!$("viewLib").hidden;

/* ---------------- data ---------------- */
const sv=p=>`<svg viewBox="0 0 32 32" aria-hidden="true" stroke="currentColor">${p}</svg>`;
const SPECS=[
  {k:"em",name:"Emergency Medicine",col:"var(--accent)",icon:sv('<rect x="5" y="5" width="22" height="22" rx="5"/><path d="M16 10v12M10 16h12"/>'),blurb:"Acute presentations, resus, trauma and critical care.",planned:["Major trauma: fall from height","Anaphylaxis at triage","Sepsis in the frail older adult"]},
  {k:"neuro",name:"Neurology",col:"#A78BFA",icon:sv('<path d="M14 7a4 4 0 0 0-5 3 4 4 0 0 0-3 6 4 4 0 0 0 2 6 4 4 0 0 0 6 3V7z"/><path d="M18 7a4 4 0 0 1 5 3 4 4 0 0 1 3 6 4 4 0 0 1-2 6 4 4 0 0 1-6 3V7z"/><path d="M10 14h4M18 18h4"/>'),blurb:"Stroke, seizures, altered mental state and neurological emergencies.",planned:["Thunderclap headache","First seizure","Acute stroke in the thrombolysis window"]},
  {k:"cardio",name:"Cardiology",col:"var(--nibp)",icon:sv('<path d="M16 27s-10-6-10-13a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7-10 13-10 13z"/><path d="M7 16h5l2-4 3 7 2-3h6"/>'),blurb:"Chest pain, arrhythmias, heart failure and acute coronary syndromes.",planned:["Broad complex tachycardia","Acute pulmonary oedema","Bradycardia after a beta-blocker overdose"]},
  {k:"resp",name:"Respiratory",col:"var(--spo2)",icon:sv('<path d="M16 5v11"/><path d="M16 14c-2 0-3 2-4 4M16 14c2 0 3 2 4 4"/><path d="M12 9C8 9 5 16 5 22c0 3 2 4 4 4 3 0 4-2 4-5v-9"/><path d="M20 9c4 0 7 7 7 13 0 3-2 4-4 4-3 0-4-2-4-5v-9"/>'),blurb:"Breathlessness, infection, COPD, asthma and respiratory failure.",planned:["Acute severe asthma","Infective exacerbation of COPD","Tension pneumothorax"]},
  {k:"peds",name:"Pediatrics",col:"var(--ecg)",icon:sv('<circle cx="16" cy="14" r="7"/><circle cx="10" cy="8" r="2.5"/><circle cx="22" cy="8" r="2.5"/><path d="M13.5 18c1.5 1.2 3.5 1.2 5 0"/><path d="M8 28c1-4 4-6 8-6s7 2 8 6"/>'),blurb:"Unwell children, from croup to the febrile infant.",planned:["Barking cough at 2 a.m.","Bronchiolitis in a 3-month-old","The febrile infant"]},
  {k:"tox",name:"Toxicology",col:"var(--resp)",icon:sv('<path d="M12 4h8M13 4v8L6 24a3 3 0 0 0 2.6 4.5h14.8A3 3 0 0 0 26 24l-7-12V4"/><path d="M9 20h14"/>'),blurb:"Overdose, poisoning and the antidotes that matter.",planned:["Found with an empty blister pack","Opioid toxicity","Tricyclic overdose"]},
  {k:"obgyn",name:"OB/GYN",col:"#F472B6",icon:sv('<circle cx="16" cy="7" r="3"/><path d="M16 10c-3 0-5 3-5 7v10h4M16 10c2 0 3 2 3 4 3 1 4 3 4 6s-2 5-5 5h-3"/>'),blurb:"Pregnancy emergencies and acute gynaecology.",planned:["Bleeding at 34 weeks","Pre-eclampsia","Ruptured ectopic pregnancy"]}
];
const CASE_SPECS={"chest-01":["em","cardio"],"neuro-01":["em","neuro"]};
const CODES={"chest-01":"TD-CAR-001","neuro-01":"TD-NEU-001"};
const SHORT={"chest-01":"Chest pain","neuro-01":"Head injury"};
const DISCIPLINES=[{k:"medicine",name:"Medicine",live:true},{k:"dentistry",name:"Dentistry"},{k:"vet",name:"Veterinary"}];
const LEVELS=[{k:"explore",name:"Explore",live:false},{k:"student",name:"Student",live:true},{k:"specialist",name:"Specialist",live:true}];
const UNI=`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 12L16 5l12 7z"/><path d="M7 13v10M12 13v10M20 13v10M25 13v10M4 26h24M5 23h22"/></svg>`;
const SYS=`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4l10 4v7c0 7-4.5 11-10 13C10.5 26 6 22 6 15V8z"/><path d="M16 11v9M11.5 15.5h9"/></svg>`;
const BUILT=[
  {sys:1,b:"NHS",s:"NHS-style clinical workflows"},
  {b:"University College Dublin",s:"Dublin · Ireland"},
  {b:"Medical University of Plovdiv",s:"Plovdiv · Bulgaria"},
  {b:"University of Edinburgh",s:"Edinburgh · UK"},
  {sys:1,b:"HSE",s:"Irish acute care pathways"},
  {b:"Trinity College Dublin",s:"Dublin · Ireland"},
  {b:"Medical University of Sofia",s:"Sofia · Bulgaria"},
  {b:"King's College London",s:"London · UK"},
  {sys:1,b:"NHIF (НЗОК)",s:"Bulgarian hospital practice"},
  {b:"RCSI",s:"Dublin · Ireland"},
  {b:"Medical University of Varna",s:"Varna · Bulgaria"},
  {b:"University College Cork",s:"Cork · Ireland"}
];

/* ---------------- state ---------------- */
let disc="medicine",level="student",spec="em";
const bests=()=>store.get("td-best")||{};

/* ---------------- carousel ---------------- */
function renderStrip(){
  const item=b=>`<div class="mq${b.sys?" sys":""}">${b.sys?SYS:UNI}<span class="tx"><b>${b.b}</b><small>${b.s}</small></span></div>`;
  $("track").innerHTML=BUILT.map(item).join("")+BUILT.map(item).join("").replace(/class="mq/g,'aria-hidden="true" class="mq');
}

/* ---------------- specialties & case files ---------------- */
function renderControls(){
  $("discSeg").innerHTML=DISCIPLINES.map(d=>`<button data-disc="${d.k}" aria-pressed="${d.k===disc}">${d.name}${d.live?"":"<small>Soon</small>"}</button>`).join("");
  $("levelSeg").innerHTML=LEVELS.map(l=>`<button data-level="${l.k}" aria-pressed="${l.k===level}">${l.name}${l.live?"":"<small>Soon</small>"}</button>`).join("");
}
function casesFor(k){return DEFS.filter(c=>(CASE_SPECS[c.id]||[]).includes(k));}
function renderSpecs(){
  $("specs").innerHTML=SPECS.map(s=>{const n=casesFor(s.k).length;
    return `<button class="spec spot" data-spec="${s.k}" aria-pressed="${s.k===spec}">
      <span class="si" style="color:${s.col};background:color-mix(in srgb,${s.col} 14%,var(--panel-2))">${s.icon}</span>
      <h3>${s.name}</h3><p>${s.blurb}</p>
      <span class="sf"><span>${n?`<span class="live">${n} free</span> · `:""}${s.planned.length} in development</span><span class="go">→</span></span></button>`;}).join("");
}
const LOCK=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`;
function renderFiles(){
  const D=DISCIPLINES.find(d=>d.k===disc),L=LEVELS.find(l=>l.k===level);
  if(!D.live){$("files").innerHTML=`<div class="empty-state"><h3>${D.name} is coming soon</h3><p>The same bedside engine, with ${disc==="vet"?"species-specific examination and monitoring":"dental emergencies and medical emergencies in the chair"}. Medicine cases are free to play now.</p><button class="btn sm" data-disc="medicine" style="margin-top:12px">Show medicine</button></div>`;return;}
  if(!L.live){$("files").innerHTML=`<div class="empty-state"><h3>Explore track coming soon</h3><p>Simpler cases in plain language for secondary-school students who are curious about medicine.</p><button class="btn sm" data-level="student" style="margin-top:12px">Show student cases</button></div>`;return;}
  const S=SPECS.find(s=>s.k===spec),cs=casesFor(spec),B=bests();
  const acu={1:"ESI 1 · resus",2:"ESI 2 · emergent",3:"ESI 3 · urgent"};
  const live=cs.map(c=>`<article class="file spot"><div class="ftab"><span>Case file · ${CODES[c.id]}</span><span style="color:var(--good)">Free</span></div>
    <div class="fth" style="background-image:url('${c.thumb}')" role="img" aria-label="${c.patient.name}"></div>
    <div class="fin"><div class="meta"><span class="tag acuity-${c.acuity}">${acu[c.acuity]}</span><span class="tag">${c.specialty}</span><span class="tag">${level==="specialist"?"Specialist":"Student"}</span></div>
    <h4>${c.title}</h4><p>${c.blurb}</p>
    <div class="ffoot"><span class="best">${B[c.id]?`Your best · ${B[c.id].score}`:`${c.mins} min · ${c.budget} tokens`}</span><button class="btn primary sm arrow" data-play="${c.id}">Start case</button></div></div></article>`);
  const locked=S.planned.map((t,i)=>`<article class="file locked"><div class="ftab"><span>Case file · ${S.name.slice(0,3).toUpperCase()}-${String(i+2).padStart(3,"0")}</span><span>Locked</span></div>
    <div class="fth">${LOCK}</div><div class="fin"><h4>${t}</h4><p>In development for the full library.</p><div class="ffoot"><span class="status">Coming soon</span></div></div></article>`);
  $("files").innerHTML=`<div class="files-head"><h3>${S.name} · case files</h3><span class="label">${cs.length} playable · ${S.planned.length} in development</span></div><div class="fgrid">${live.join("")}${locked.join("")}</div>`;
}
function renderLibrary(){renderControls();renderSpecs();renderFiles();renderMyBest();}

/* ---------------- delegated clicks ---------------- */
document.addEventListener("click",e=>{
  if(!homeVisible())return;
  const sp=e.target.closest("[data-spec]");if(sp){spec=sp.dataset.spec;renderSpecs();renderFiles();return;}
  const d=e.target.closest("[data-disc]");if(d){disc=d.dataset.disc;renderLibrary();return;}
  const l=e.target.closest("[data-level]");if(l){level=l.dataset.level;renderLibrary();if(!l.closest("#cases"))TD.jump("cases");return;}
  const t=e.target.closest("[data-board]");if(t){boardTab=t.dataset.board;renderBoard();return;}
  const j=e.target.closest("[data-jump]");if(j){e.preventDefault();TD.jump(j.dataset.jump);return;}
});
/* cursor spotlight */
document.addEventListener("pointermove",e=>{const el=e.target.closest&&e.target.closest(".spot");if(!el)return;const r=el.getBoundingClientRect();el.style.setProperty("--mx",(e.clientX-r.left)+"px");el.style.setProperty("--my",(e.clientY-r.top)+"px");},{passive:true});

/* ---------------- live hero ---------------- */
const FIND=[
  {x:33,y:11,tool:"Inspect",t:"Right frontal haematoma",p:"Boggy, tender, about 4 cm across."},
  {x:37,y:22,tool:"Pen torch",t:"Pupils 3 mm, brisk",p:"Equal. Direct and consensual responses present."},
  {x:50,y:56,tool:"Stethoscope",t:"Irregularly irregular",p:"Atrial fibrillation, rate around 88."},
  {x:18,y:70,tool:"Reflex hammer",t:"Left biceps · 3+ brisk",p:"Right is 2+. Asymmetry is what matters."},
  {x:50,y:88,tool:"Bedside test",t:"Grip weaker on the left",p:"Obeys commands: motor score 6."}
];
const TOOLCHIPS=[["Reflex hammer","Left knee · 3+ brisk"],["Plantar response","Left · extensor ↑"],["Pen torch","Pupils 3 mm · brisk"],["Glasgow Coma Scale","E3 V4 M6 = 13"],["Pronator drift","Left arm drifts"]];
const CHAT=[["dr","Hi Stefan, I'm one of the doctors. Do you know where you are?"],["pt","Is this… the post office?"],["dr","Does your head hurt anywhere?"],["pt","Here… did someone hit me?"],["dr","Can you squeeze my fingers for me?"],["pt","Like this? … Sorry, where am I?"]];
const ORDERS=[["Monitor leads",2],["Glucose",1],["12-lead ECG",3],["CT head",12],["PCC",6],["Neuro obs",1]];
let hvHover=false,findIdx=-1,chatIdx=2,toolIdx=0,orderIdx=0,tok=0;
function renderHeroMarkers(){$("hvMarkers").innerHTML=FIND.map((f,i)=>`<button class="hmk" data-f="${i}" style="left:${f.x}%;top:${f.y}%" aria-label="${f.tool}: ${f.t}"></button>`).join("");}
function showFind(i){
  findIdx=i;const f=FIND[i],pop=$("hvPop");
  document.querySelectorAll(".hmk").forEach((m,j)=>m.classList.toggle("on",j===i));
  pop.innerHTML=`<span class="label">${f.tool}</span><b>${f.t}</b><p>${f.p}</p>`;
  pop.style.left=Math.min(f.x+4,46)+"%";pop.style.top=Math.max(f.y-6,4)+"%";if(f.y>60){pop.style.top=(f.y-30)+"%";}
  pop.hidden=false;pop.style.animation="none";void pop.offsetWidth;pop.style.animation="";
}
$("hvMarkers").addEventListener("click",e=>{const m=e.target.closest("[data-f]");if(m)showFind(+m.dataset.f);});
$("hv").addEventListener("pointerenter",()=>hvHover=true);$("hv").addEventListener("pointerleave",()=>hvHover=false);
function bubble(who,txt){return `<div class="bub ${who}"><small>${who==="dr"?"You":"Stefan"}</small>${txt}</div>`;}
function chatStep(){
  const box=$("hvChat"),[who,txt]=CHAT[chatIdx%CHAT.length];chatIdx++;
  const trim=()=>{while(box.children.length>3)box.removeChild(box.firstChild);};
  if(who==="pt"&&!reduce){box.insertAdjacentHTML("beforeend",`<div class="bub pt typing"><i></i><i></i><i></i></div>`);trim();
    setTimeout(()=>{const t=box.querySelector(".typing");if(t)t.remove();box.insertAdjacentHTML("beforeend",bubble(who,txt));trim();},900);}
  else{box.insertAdjacentHTML("beforeend",bubble(who,txt));trim();}
}
function toolStep(){const [a,b]=TOOLCHIPS[toolIdx++%TOOLCHIPS.length];$("hvToolT").textContent=a;$("hvToolB").textContent=b;const el=$("hvTool");el.classList.remove("swap");void el.offsetWidth;el.classList.add("swap");}
function orderStep(){
  if(orderIdx>=ORDERS.length){orderIdx=0;tok=0;}
  const [n,c]=ORDERS[orderIdx++];tok+=c;
  $("hvTok").textContent=tok;$("hvBar").style.width=(tok/55*100)+"%";$("hvBar").style.background=tok/55>.6?"var(--resp)":"var(--ecg)";
  const sp=$("hvSpend");sp.textContent=`−${c} ${n}`;sp.classList.remove("go");void sp.offsetWidth;sp.classList.add("go");
}
let hr=88,spo2=96;
function flash(el){el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");}
function vitalsStep(){
  hr=Math.max(78,Math.min(99,hr+Math.round((Math.random()-.5)*8)));$("hvHr").textContent=hr;
  const ns=Math.random()<.75?96:Math.random()<.5?95:97;if(ns!==spo2){spo2=ns;$("hvSpo2").textContent=spo2;flash($("hvSpo2"));}
}
function bpStep(){
  $("hvCyc").textContent="inflating…";$("hvBp").style.opacity=".35";
  setTimeout(()=>{const s=162+Math.round(Math.random()*12),d=88+Math.round(Math.random()*6);$("hvBp").textContent=`${s}/${d}`;$("hvBp").style.opacity="";flash($("hvBp"));$("hvCyc").textContent="auto 5 min";},1400);
}
/* waveform canvases */
const g=(x,m,w)=>Math.exp(-((x-m)**2)/(2*w*w));
const ecg=ph=>-.08*g(ph,.2,.006)+1*g(ph,.22,.008)-.22*g(ph,.24,.007)+.25*g(ph,.4,.04);
const pleth=ph=>.9*g(ph,.3,.07)+.35*g(ph,.5,.05);
const W={ecg:{c:$("hvEcg"),col:"#22C55E",fn:ecg,x:0,last:null},pl:{c:$("hvPleth"),col:"#06B6D4",fn:pleth,x:0,last:null}};
let ph=0,fac=1,lt=performance.now(),clk=0;
function sizeC(cv){const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;cv.width=Math.max(1,r.width*d);cv.height=Math.max(1,r.height*d);return cv.getContext("2d");}
function drawStatic(){Object.values(W).forEach(w=>{const c=sizeC(w.c);if(!c)return;const Wd=w.c.width,H=w.c.height;c.strokeStyle=w.col;c.lineWidth=1.6*(devicePixelRatio||1);c.beginPath();for(let x=0;x<Wd;x++){const p=(x/Wd*2.6)%1,y=H*.75-w.fn(p)*H*.6;x?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();});}
function wave(now){
  const dt=Math.min(.05,(now-lt)/1000);lt=now;clk+=dt;
  if(homeVisible()){
    ph+=dt*hr/60/fac;if(ph>=1){ph-=1;fac=.65+Math.random()*.7;}
    Object.values(W).forEach(w=>{
      const c=w.ctx||(w.ctx=sizeC(w.c));if(!c)return;const Wd=w.c.width,H=w.c.height,d=devicePixelRatio||1;
      const nx=(w.x+dt*Wd/2.6)%Wd,fib=w===W.ecg?.03*Math.sin(clk*33)+.02*Math.sin(clk*48+1):0;
      const y=H*.75-(w.fn(ph)+fib)*H*.6;
      c.fillStyle="#060c14";const gap=10*d;
      if(nx<w.x){c.fillRect(w.x,0,Wd-w.x,H);c.fillRect(0,0,nx+gap,H);w.last=null;}else c.fillRect(w.x,0,nx-w.x+gap,H);
      c.strokeStyle=w.col;c.lineWidth=1.6*d;c.beginPath();if(w.last!=null){c.moveTo(w.x,w.last);c.lineTo(nx,y);c.stroke();}
      w.x=nx;w.last=y;
    });
  }
  requestAnimationFrame(wave);
}
addEventListener("resize",()=>Object.values(W).forEach(w=>{w.ctx=null;w.x=0;w.last=null;}));
function startHero(){
  renderHeroMarkers();showFind(3);
  $("hvChat").innerHTML=bubble("dr",CHAT[0][1])+bubble("pt",CHAT[1][1]);
  orderStep();orderStep();orderStep();
  if(reduce){drawStatic();return;}
  requestAnimationFrame(wave);
  let tick=0;
  setInterval(()=>{if(!homeVisible())return;tick++;
    vitalsStep();
    if(tick%3===0)chatStep();
    if(tick%4===1&&!hvHover)showFind((findIdx+1)%FIND.length);
    if(tick%4===3)toolStep();
    if(tick%3===2)orderStep();
    if(tick%9===0)bpStep();
  },1100);
}

/* ---------------- leaderboard ---------------- */
let db=null,user=null,uid=null,rows=[],boardTab="all",boardState="loading";
function renderBoard(){
  const tabs=[["all","Overall"],...DEFS.map(c=>[c.id,SHORT[c.id]||c.title])];
  $("boardTabs").innerHTML=tabs.map(([k,n])=>`<button data-board="${k}" aria-pressed="${k===boardTab}">${n}</button>`).join("");
  const el=$("boardList");
  if(boardState==="loading"){el.innerHTML=`<div class="empty-state"><h3>Loading the leaderboard…</h3></div>`;return;}
  if(boardState==="off"){el.innerHTML=`<div class="empty-state"><h3>Leaderboard unavailable</h3><p>Your personal bests are still saved on this device.</p></div>`;return;}
  const score=r=>boardTab==="all"?Number(r.total)||0:Number(r.best&&r.best[boardTab]&&r.best[boardTab].score)||0;
  const list=rows.filter(r=>score(r)>0).sort((a,b)=>score(b)-score(a)).slice(0,10);
  if(!list.length){el.innerHTML=`<div class="empty-state"><h3>The board is empty. Claim #1.</h3><p>Finish a case, then post your score from the debrief.</p><button class="btn sm primary arrow" data-jump="cases" style="margin-top:12px">Play a case</button></div>`;return;}
  el.innerHTML=list.map((r,i)=>{const n=Object.keys(r.best||{}).length;
    return `<div class="brow r${i+1}${r.id===uid?" me":""}"><span class="rk">${i+1}</span><span class="nm">${esc(String(r.alias||"Anonymous").slice(0,24))}${r.id===uid?" · you":""}<small>${boardTab==="all"?`${n} case${n===1?"":"s"} played`:"Best score"}</small></span><span class="ch">${boardTab==="all"?"total":"/100"}</span><span class="sc">${score(r)}</span></div>`;}).join("");
}
function renderMyBest(){
  const B=bests(),ks=DEFS.filter(c=>B[c.id]);
  $("myBest").innerHTML=ks.length?`<span class="label">Your personal bests</span>${ks.map(c=>`<div><span>${SHORT[c.id]||c.title}</span><b>${B[c.id].score}/100</b></div>`).join("")}`:`<span class="label">Your personal bests</span><span class="sub">Play a case to set one.</span>`;
}
async function initBoard(){
  const cl=window.claude;
  if(!cl||typeof cl.use!=="function"){goLocal();return;}
  try{user=await cl.use("user");}catch(e){user=null;}
  try{db=await cl.use("db");}catch(e){db=null;}
  if(user){try{uid=await user.id();}catch(e){uid=null;}}
  if(!db){goLocal();return;}
  db.collection("leaderboard").orderBy("total","desc").limit(200).onSnapshot(s=>{rows=s.docs.filter(d=>d.exists).map(d=>({id:d.id,...d.data()}));boardState="ready";renderBoard();},()=>{boardState="off";renderBoard();});
}

/* Device leaderboard: used on the public website until an online backend is connected.
   Several people can post on one shared device (a classroom computer), keyed by display name. */
let local=false;
function goLocal(){local=true;boardState="ready";loadLocal();renderBoard();}
function loadLocal(){const b=store.get("td-board")||{};rows=Object.entries(b).map(([k,v])=>({id:"local:"+k,...v}));const a=store.get("td-alias");uid=a?"local:"+a.toLowerCase():null;}
function postLocal(name,C,score){
  const b=store.get("td-board")||{},k=name.toLowerCase(),cur=b[k]||{alias:name,best:{}};
  const ob=cur.best[C.id]&&Number(cur.best[C.id].score);if(!(ob>=score))cur.best[C.id]={score,at:Date.now()};
  cur.alias=name;cur.total=Object.values(cur.best).reduce((a,x)=>a+(Number(x.score)||0),0);cur.updated=Date.now();
  b[k]=cur;store.set("td-board",b);loadLocal();renderBoard();
  return rows.filter(r=>r.id!=="local:"+k&&(Number(r.total)||0)>cur.total).length+1;
}

/* ---------------- debrief hook ---------------- */
TD.onScore=(C,score)=>{
  const B=bests(),prev=B[C.id]?B[C.id].score:null,isBest=score>0&&(prev==null||score>prev);
  if(isBest){B[C.id]={score,at:Date.now()};store.set("td-best",B);}
  const alias=store.get("td-alias")||"";
  const el=$("dbBoard");
  el.innerHTML=`<p style="margin:0">${isBest?`<span class="newbest">New personal best</span> `:""}Score <b>${score}</b>${prev!=null?` · previous best ${prev}`:""}</p>
    ${(db&&uid)||local?`<div class="post"><input id="alias" maxlength="24" placeholder="Display name" value="${esc(alias)}" aria-label="Display name for the leaderboard"><button class="btn primary" id="postBtn">Post score</button></div><p class="sub" id="postMsg" style="margin:8px 0 0;font-size:12.5px">Only your best score for each case counts.${local?" Scores are kept on this device for now.":""}</p>`
      :`<p class="sub" style="margin:8px 0 0;font-size:12.5px">The leaderboard isn't available right now. Your best is saved on this device.</p>`}`;
  const btn=$("postBtn");if(!btn)return;
  btn.onclick=async()=>{
    const name=$("alias").value.replace(/[<>]/g,"").trim().slice(0,24);
    if(name.length<2){$("postMsg").textContent="Pick a display name of at least 2 characters.";return;}
    btn.disabled=true;$("postMsg").textContent="Posting…";store.set("td-alias",name);
    if(local){const rank=postLocal(name,C,score);$("postMsg").innerHTML=`Posted as <b>${esc(name)}</b>. You're <b>#${rank}</b> on this device.`;return;}
    try{
      const ref=db.doc("leaderboard/"+uid),cur=await ref.get(),old=cur.exists?cur.data():{};
      const best={...(old.best||{})};const ob=best[C.id]&&Number(best[C.id].score);
      if(!(ob>=score))best[C.id]={score,at:Date.now()};
      const total=Object.values(best).reduce((a,b)=>a+(Number(b.score)||0),0);
      await ref.set({alias:name,best,total,updated:Date.now()});
      const rank=rows.filter(r=>r.id!==uid&&(Number(r.total)||0)>total).length+1;
      $("postMsg").innerHTML=`Posted as <b>${esc(name)}</b>. You're <b>#${rank}</b> overall.`;
    }catch(e){
      $("postMsg").textContent=e&&e.code==="invalid_argument"?"This page's sharing level doesn't let you post scores. Ask the owner for Contributor access.":"Couldn't post just now. Try again in a moment.";
      btn.disabled=false;
    }
  };
  renderMyBest();
};
TD.onHome=()=>{renderFiles();renderMyBest();};

/* ---------------- boot ---------------- */
renderStrip();renderLibrary();renderBoard();startHero();initBoard();
$("factCases").textContent=DEFS.length;
})();
