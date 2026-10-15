/* Case: 24-year-old with acute severe asthma (viral trigger, ran out of preventer). Respiratory. */
(window.CASEDEFS=window.CASEDEFS||[]).push((function(){
const IMG="img/resp/";
const BEST=480;
const LEADS={I:{r:.6,s:.1,t:.15},II:{r:1,t:.22},III:{r:.5,t:.12},aVR:{r:.7,t:.2,inv:1},aVL:{r:.3,s:.15,t:.08},aVF:{r:.75,t:.2},
  V1:{r:.15,s:.9,q:0,t:-.05},V2:{r:.3,s:1,q:0,t:.25},V3:{r:.6,s:.6,t:.3},V4:{r:1.1,s:.35,t:.3},V5:{r:1,s:.2,t:.28},V6:{r:.8,s:.1,t:.22}};
const F=t=>`T+${String(Math.floor(t)).padStart(2,"0")}:${String(Math.round((t%1)*60)).padStart(2,"0")}`;
const pct=S=>S.pef/BEST;
const lastPef=S=>(S.pefLog||[]).slice(-1)[0];

/* true clinical class from the hidden state */
function trueClass(S){
  if(S.stage>=2)return"near";
  if(S.stage===1)return"life";
  const p=pct(S);
  if(p>=.5&&S.v.rr<25&&S.v.hr<110)return p>=.75?"none":"moderate";
  return"severe";
}
const CLASS_NAME={moderate:"Moderate",severe:"Acute severe",life:"Life-threatening",near:"Near-fatal",none:"Mild / resolving"};

/* vitals follow the hidden state */
function vitals(S){
  const p=pct(S),o2=S.attach.o2;
  if(S.stage===0){
    S.v.rr=Math.round(Math.max(18,Math.min(32,30-(p-.375)*40)));
    S.v.hr=Math.round(Math.max(92,Math.min(135,122-(p-.375)*90+Math.min(12,4*(S.salbRecent||0)))));
    S.v.spo2=o2?96:Math.round(Math.min(97,93+(p-.375)*12));
  }else if(S.stage===1){
    S.v.rr=S.flags.tiring?22:34;S.v.hr=132;S.v.spo2=o2?92:89;
  }else{
    S.v.rr=14;S.v.hr=138;S.v.spo2=o2?89:84;
  }
  if(S.flags.bagUntil&&S.t<S.flags.bagUntil)S.v.spo2-=3;
}
function toStage(S,api,n,why){
  if(S.stage>=n)return;
  S.stage=n;S.maxStage=Math.max(S.maxStage||0,n);
  if(n===1){S.stage1At=S.t;S.pef=Math.min(S.pef,150);api.log("Nurse",why||"“He's working much harder and his sats are dropping.”","bad");api.say("Can't… can't…","pt");}
  if(n===2){S.pef=Math.min(S.pef,110);api.log("Nurse",why||"“He's gone very drowsy and his breathing's getting shallow.”","bad");}
  vitals(S);
}

/* ---------- peak flow meter ---------- */
function meterSVG(S,val){
  const x=v=>20+Math.min(800,v)/800*560;
  const z=(a,b,c)=>`<rect x="${x(a*BEST)}" y="38" width="${x(b*BEST)-x(a*BEST)}" height="16" fill="${c}" opacity=".85"/>`;
  return `<svg viewBox="0 0 600 110" style="width:100%;display:block" aria-label="Peak flow meter scale">
    <rect x="20" y="30" width="560" height="32" rx="16" fill="#e8edf1" stroke="#9aa7b3"/>
    ${z(0,.33,"#FF6B6B")}${z(.33,.5,"#F6B73C")}${z(.5,.75,"#FACC15")}${z(.75,1.67,"#22C55E")}
    ${Array.from({length:9},(_,i)=>i*100).map(v=>`<line x1="${x(v)}" y1="62" x2="${x(v)}" y2="72" stroke="#7d8b9b"/><text x="${x(v)}" y="88" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" fill="#A7B4C2">${v}</text>`).join("")}
    <g id="pfNeedle" style="transform:translateX(${x(val||60)-20}px);transition:transform .9s cubic-bezier(.2,.9,.2,1)"><polygon points="20,22 14,10 26,10" fill="#F6B73C"/><line x1="20" y1="24" x2="20" y2="66" stroke="#0B1420" stroke-width="3"/></g>
    <text x="580" y="104" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="#7D8B9B">L/min · best ${BEST}</text>
  </svg>`;
}
function pefViewer(body,S,api){
  const tries=[];
  body.innerHTML=`<div style="display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:16px;align-items:start" class="pfwrap">
    <img src="${IMG}peakflow.jpg" alt="Viktor blowing into a peak flow meter" style="width:100%;border-radius:10px;display:block">
    <div class="interp"><div class="label">Coach the technique</div>
      <p style="display:flex;gap:6px;flex-wrap:wrap" id="coach">
        <button class="btn xs" data-c="0">Sit upright</button><button class="btn xs" data-c="1">Slider to zero</button><button class="btn xs" data-c="2">Deep breath in, seal lips</button><button class="btn xs" data-c="3">Blast out hard and fast</button></p>
      <div id="meter">${meterSVG(S,60)}</div>
      <p style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn primary sm" id="blow">Blow (1 of 3)</button><span class="sub" id="pfMsg">Best of three counts.</span></p>
      <p id="pfRes"></p></div></div>`;
  const coached=new Set();
  body.querySelector("#coach").onclick=e=>{const b=e.target.closest("[data-c]");if(!b)return;coached.add(b.dataset.c);b.setAttribute("aria-pressed","true");};
  body.querySelector("#blow").onclick=()=>{
    if(S.stage>=2){body.querySelector("#pfMsg").textContent="He's too drowsy to do a peak flow. That itself is a life-threatening sign.";return;}
    if(tries.length>=3)return;
    const tech=coached.size>=4?1:.85;
    const r=Math.max(60,Math.round((S.pef*tech+(Math.random()-.5)*20)/10)*10);tries.push(r);
    const n=body.querySelector("#pfNeedle");n.style.transform=`translateX(${Math.min(800,r)/800*560}px)`;
    api.transient(S.stage>=1?"exhausted":"base",1600);
    body.querySelector("#pfMsg").textContent=`Blow ${tries.length}: ${r} L/min`+(tech<1&&tries.length===1?" (technique not fully coached, may under-read)":"");
    body.querySelector("#blow").textContent=tries.length<3?`Blow (${tries.length+1} of 3)`:"Done";
    if(tries.length===3){
      const best=Math.max(...tries),pc=Math.round(best/BEST*100);
      S.pefLog=(S.pefLog||[]).concat([{t:S.t,v:best,pc}]);
      const band=pc<33?"under 33%: life-threatening range":pc<50?"33–50%: acute severe range":pc<75?"50–75%: moderate range":"over 75%";
      S.results.mo_pef=`Best ${best} L/min, ${pc}% of his best (${band}).`;S.keys.mo_pef=`${pc}%`;
      api.log("Peak flow",S.results.mo_pef,pc<50?"warn":"");
      body.querySelector("#pfRes").innerHTML=`<b>${best} L/min · ${pc}% of best.</b> ${band.charAt(0).toUpperCase()+band.slice(1)}.`;
    }
  };
  return "Peak expiratory flow";
}

/* ---------- respiratory rate: tap along with each breath ---------- */
function rrViewer(body,S,api){
  const per=60/S.v.rr;
  body.innerHTML=`<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,280px);gap:16px;align-items:start">
    <div style="position:relative;border-radius:10px;overflow:hidden;aspect-ratio:684/508;background:#000">
      <img src="${IMG}z_chest.jpg" alt="Viktor's chest rising and falling" style="width:100%;height:100%;object-fit:cover;display:block;animation:breathe ${per}s ease-in-out infinite;transform-origin:50% 100%">
      <span id="rrRing" style="position:absolute;left:50%;top:55%;width:120px;height:120px;margin:-60px 0 0 -60px;border:3px solid var(--accent);border-radius:50%;opacity:.0;animation:breathRing ${per}s ease-in-out infinite"></span>
    </div>
    <div class="interp"><div class="label">Count for 15 seconds</div><p>Watch his chest. Press <b>Start</b>, then tap <b>Breath</b> each time it rises.</p>
      <p style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" id="rrStart">Start</button><button class="btn primary sm" id="rrTap" disabled>Breath</button></p>
      <p class="hud-clock" id="rrClock" style="font-size:28px">15.0</p><p id="rrRes"></p></div></div>
    <style>@keyframes breathe{0%,100%{transform:scale(1)}45%{transform:scale(1.035)}}@keyframes breathRing{0%,100%{opacity:0;transform:scale(.8)}45%{opacity:.9;transform:scale(1.05)}}
    @media (prefers-reduced-motion:reduce){[style*="breathe"]{animation-duration:${per}s!important}}</style>`;
  let taps=0,timer=null,end=0;
  body.querySelector("#rrStart").onclick=()=>{
    taps=0;end=performance.now()+15000;body.querySelector("#rrTap").disabled=false;body.querySelector("#rrRes").textContent="";
    clearInterval(timer);timer=setInterval(()=>{const left=Math.max(0,(end-performance.now())/1000);body.querySelector("#rrClock").textContent=left.toFixed(1);
      if(left<=0){clearInterval(timer);body.querySelector("#rrTap").disabled=true;
        const counted=taps*4,truth=Math.round(S.v.rr),ok=Math.abs(counted-truth)<=4;
        S.flags.rrCounted=true;S.results.ex_rr=`Counted ${counted}/min (actual ${truth}).`;S.keys.ex_rr=`${truth}/min`;
        let note=truth>=25?"25 or more is a severe feature.":"";
        if(S.flags.tiring)note="A falling rate here means he's tiring, not improving: look at his SpO₂, effort and peak flow.";
        body.querySelector("#rrRes").innerHTML=`<b style="color:${ok?"var(--good)":"var(--warn)"}">${ok?"Good count.":"Off the mark."}</b> You counted ${counted}/min; his rate is ${truth}/min. ${note}`;
        api.log("Respiratory rate",`${truth}/min. ${note}`,truth>=25||S.flags.tiring?"warn":"");}},100);
  };
  body.querySelector("#rrTap").onclick=()=>{taps++;};
  return "Respiratory rate";
}

/* ---------- arterial blood gas ---------- */
function gasNow(S){
  const o2=S.attach.o2,p=pct(S);
  if(S.stage>=2)return{ph:"7.24",co2:"7.2",o2:o2?"8.1":"6.9",hco3:"23",lac:"2.4",k:S.k,cls:"near"};
  if(S.stage===1)return{ph:"7.40",co2:"5.6",o2:o2?"8.9":"7.8",hco3:"25",lac:"1.9",k:S.k,cls:"life"};
  if(p>=.55)return{ph:"7.44",co2:"4.5",o2:o2?"13.2":"10.8",hco3:"24",lac:"1.3",k:S.k,cls:"ok"};
  return{ph:"7.46",co2:"4.2",o2:o2?"12.4":"9.1",hco3:"24",lac:"1.6",k:S.k,cls:"severe"};
}
function abgViewer(body,S,api){
  const g=S.lastGas||gasNow(S);
  body.innerHTML=`<div class="slip"><div class="hdr"><b>STOYANOV, Viktor · 24 M · ARTERIAL</b><span>${api.fmt(S.at.dx_abg??S.t)} · ${S.attach.o2?"on oxygen":"on air"}</span></div>
    <table><thead><tr><th>Test</th><th>Result</th><th>Units</th><th>Reference</th></tr></thead><tbody>
    <tr><td>pH</td><td class="${+g.ph<7.35?"hi":""}">${g.ph}</td><td></td><td>7.35–7.45</td></tr>
    <tr><td>PaCO₂</td><td class="${+g.co2>6?"hi":""}">${g.co2}</td><td>kPa</td><td>4.7–6.0</td></tr>
    <tr><td>PaO₂</td><td class="${+g.o2<10?"hi":""}">${g.o2}</td><td>kPa</td><td>10–13 (air)</td></tr>
    <tr><td>HCO₃⁻</td><td>${g.hco3}</td><td>mmol/L</td><td>22–26</td></tr>
    <tr><td>Lactate</td><td class="${+g.lac>2?"hi":""}">${g.lac}</td><td>mmol/L</td><td>&lt; 2</td></tr>
    <tr><td>K⁺</td><td class="${S.k<3.5?"hi":""}">${S.k.toFixed(1)}</td><td>mmol/L</td><td>3.5–5.3</td></tr>
    </tbody></table></div>
    <div class="interp"><div class="label">Your interpretation</div>
    <p style="display:flex;gap:6px;flex-wrap:wrap" id="gq">
      <button class="btn xs" data-g="ok">Reassuring: CO₂ is normal</button>
      <button class="btn xs" data-g="severe">Low CO₂: he's breathing fast, expected in acute severe asthma</button>
      <button class="btn xs" data-g="life">“Normal” CO₂ in a breathless asthmatic: life-threatening</button>
      <button class="btn xs" data-g="near">Raised CO₂ with acidosis: near-fatal</button></p><p id="gres"></p></div>`;
  body.querySelector("#gq").onclick=e=>{const b=e.target.closest("[data-g]");if(!b)return;
    const ans=b.dataset.g,truth=g.cls==="ok"?"severe":g.cls;
    const ok=ans===truth||(g.cls==="ok"&&ans==="ok");S.flags.gasRead=true;if(ok)S.flags.gasOK=true;
    const why={severe:"In acute asthma he should be blowing off CO₂, so a low value is expected.",life:"He's breathing fast but CO₂ is no longer low: he's tiring. Treat as life-threatening and get senior and ICU help.",near:"Rising CO₂ with acidosis means ventilatory failure. He needs ICU now.",ok:"He's improving; CO₂ is settling as his work of breathing falls."}[g.cls];
    body.querySelector("#gres").innerHTML=`<b style="color:${ok?"var(--good)":"var(--warn)"}">${ok?"Correct.":"Not quite."}</b> ${why}`;};
  return "Arterial blood gas";
}

/* ---------- severity classification ---------- */
function sevViewer(body,S,api){
  const got=[];
  if(S.done.pt_speech)got.push(["Speech",S.results.pt_speech]);
  got.push(["Respiratory rate",S.flags.rrCounted||S.attach.ecg?`${S.v.rr}/min`:"not measured"]);
  got.push(["Heart rate",S.attach.ecg||S.done.ex_pulse?`${S.v.hr}/min`:"not measured"]);
  got.push(["SpO₂",S.attach.spo2?`${S.v.spo2}%${S.attach.o2?" on oxygen":" on air"}`:"not measured"]);
  const lp=lastPef(S);got.push(["Peak flow",lp?`${lp.v} L/min (${lp.pc}% of best) at ${api.fmt(lp.t)}`:"not measured"]);
  if(S.done.ex_ausc)got.push(["Chest",S.results.ex_ausc]);
  if(S.lastGas)got.push(["Blood gas",`PaCO₂ ${S.lastGas.co2} kPa, pH ${S.lastGas.ph}`]);
  body.innerHTML=`<div class="interp"><div class="label">What you've measured</div><ul class="obs">${got.map(([k,v])=>`<li><b>${k}:</b> ${v}</li>`).join("")}</ul></div>
    <div class="interp"><div class="label">Classify this attack now</div><p style="display:flex;gap:6px;flex-wrap:wrap" id="sq">
    ${["moderate","severe","life","near"].map(k=>`<button class="btn xs" data-k="${k}">${CLASS_NAME[k]}</button>`).join("")}</p><p id="sres"></p>
    <p class="sub" style="font-size:12.5px">Acute severe: PEF 33–50% of best, RR ≥ 25, HR ≥ 110, can't complete sentences. Life-threatening: PEF &lt; 33%, SpO₂ &lt; 92%, PaO₂ &lt; 8 kPa, “normal” PaCO₂, silent chest, cyanosis, poor effort, exhaustion, confusion, arrhythmia, hypotension. Near-fatal: raised PaCO₂ or needing ventilation.</p></div>`;
  body.querySelector("#sq").onclick=e=>{const b=e.target.closest("[data-k]");if(!b)return;
    const t=trueClass(S),ans=b.dataset.k,ok=ans===t||(t==="none"&&ans==="moderate");
    S.flags.classified=true;if(ok)S.flags.classOK=true;S.results.ex_sev=`Classified as ${CLASS_NAME[ans]}${ok?"":` (bedside picture: ${CLASS_NAME[t]})`}.`;S.keys.ex_sev=CLASS_NAME[ans];
    api.log("Severity",S.results.ex_sev,ok?"good":"warn");
    body.querySelector("#sres").innerHTML=`<b style="color:${ok?"var(--good)":"var(--warn)"}">${ok?"Agreed.":"Look again."}</b> The bedside picture is <b>${CLASS_NAME[t]}</b>.`;};
  return "Severity assessment";
}
function inhViewer(body,S,api){
  body.innerHTML=`<img src="${IMG}inhalers.jpg" alt="Blue reliever and empty brown preventer inhaler on the bedside table" style="width:100%;max-width:640px;border-radius:10px;display:block;margin:0 auto">
    <div class="interp"><div class="label">What you notice</div><p>A well-used blue reliever (salbutamol) and an <b>empty brown preventer</b> (inhaled steroid) with its cap off. Running out of preventer and overusing reliever are both risk factors for a severe attack.</p></div>`;
  S.results.ex_inh="Empty brown preventer inhaler; heavily used blue reliever.";
  return "His inhalers";
}
function ecgViewer(body,S,api,fresh){
  body.innerHTML=`<div class="paperwrap"><canvas id="ecgC"></canvas></div><div class="interp"><div class="label">Your read</div><button class="btn xs" id="rev">Show interpretation</button><p id="int" hidden>Sinus tachycardia, rate ${Math.round(S.v.hr)}. Normal axis, no ST changes. Tall, slightly peaked P waves can appear in acute asthma.</p></div>`;
  api.draw.ecg(body.querySelector("#ecgC"),{leads:LEADS,hr:S.v.hr,animate:fresh,grid:[["I","aVR","V1","V4"],["II","aVL","V2","V5"],["III","aVF","V3","V6"]],title:`STOYANOV, VIKTOR · 24 M · ${api.fmt(S.at.dx_ecg??S.t)}`,sub:`Vent rate ${Math.round(S.v.hr)} bpm · 25 mm/s · 10 mm/mV`});
  body.querySelector("#rev").onclick=e=>{body.querySelector("#int").hidden=false;e.target.hidden=true;};
  return "12-lead ECG";
}
function cxrViewer(body,S,api){
  body.innerHTML=`<div class="imgwrap"><canvas id="cxrC"></canvas><div class="interp"><div class="label">Systematic review</div><p>Count ribs above the diaphragm, look at the diaphragm shape, check both lung edges for a pneumothorax.</p><button class="btn xs" id="rev">Show report</button><p id="int" hidden>Hyperinflated lungs (more than 6 anterior ribs above the diaphragm), flattened diaphragms. No pneumothorax, no consolidation.</p></div></div>`;
  api.draw.cxr(body.querySelector("#cxrC"),{label:"AP · PORTABLE · RESUS 1"});
  body.querySelector("#rev").onclick=e=>{body.querySelector("#int").hidden=false;e.target.hidden=true;};
  return "Chest X-ray · AP portable";
}

/* ---------- treatments ---------- */
function salb(S,api){
  S.salb=(S.salb||0)+1;S.firstSalbAt=S.firstSalbAt??S.t;S.salbRecent=3;S.flags.nebUntil=S.t+6;
  const gain=[40,30,25,15,10][Math.min(4,S.salb-1)];
  let note="";
  if(!S.attach.o2){S.flags.airNeb=true;note=" Air-driven: in acute severe asthma, drive nebulisers with oxygen.";}
  if(S.stage===0)S.pef+=gain;else S.pef=Math.min(150,S.pef+gain/2);
  if(S.salb===1)S.pefAfter1=S.pef;
  S.k=Math.max(3.0,+(S.k-.25).toFixed(2));
  vitals(S);
  return{b:`Salbutamol 5 mg nebulised (dose ${S.salb}).${note}`,f:S.flags.airNeb&&!S.attach.o2?"warn":"good",say:S.stage?"…":"Bit… better…"};
}
function maybeRescue(S,api){
  if(S.stage===1&&S.salb>=2&&S.flags.ipra&&S.flags.mag){S.stage=0;S.pef=Math.max(S.pef,210);S.flags.tiring=false;api.log("Reassessment","He's responding: more air movement, less effort.","good");vitals(S);}
}

return {
  id:"resp-01",title:"Three nebulisers deep",specialty:"Respiratory",setting:"Emergency dept",acuity:1,mins:"15–20",
  blurb:"A 24-year-old with asthma, brought in at 2 a.m. after twenty puffs of his blue inhaler, speaking in single words.",
  thumb:IMG+"base.jpg",bed:"RESUS 1 · ADULT",
  patient:{name:"Viktor Stoyanov",first:"Viktor",meta:"24 M · Erasmus student · flatmate brought him",label:"STOYANOV, Viktor · 24 M",cc:"Can't… breathe…"},
  arrival:"02:10. Flatmate drove him in. Known asthmatic, wheezy for hours, used his blue inhaler repeatedly. Straight to resus 1.",
  dx:"Acute severe asthma: viral trigger and missed preventer treatment",budget:50,
  vitals:{hr:122,sbp:128,dbp:76,rr:30,spo2:93,temp:37.1,rhythm:"sinus"},
  monitorLead:LEADS.II,
  views:{bedside:{label:"Bedside",aspect:"684/508",
    states:{base:IMG+"base.jpg",neb:IMG+"neb.jpg",exhausted:IMG+"exhausted.jpg",settled:IMG+"settled.jpg"},
    markers:{face:{x:52,y:20},lips:{x:52,y:33},neck:{x:52,y:44},chest:{x:52,y:58},hands:{x:32,y:86},back:{x:77,y:48}}}},
  regions:{
    face:{name:"Face & general",close:IMG+"z_face.jpg",scale:2.4,talk:true,hint:"look, speech, severity"},
    lips:{name:"Lips & colour",close:IMG+"z_lips.jpg",scale:3,hint:"cyanosis, oxygen mask"},
    neck:{name:"Neck",close:IMG+"z_neck.jpg",scale:2.8,hint:"accessory muscles, trachea"},
    chest:{name:"Chest",close:IMG+"z_chest.jpg",scale:2.2,hint:"rate, percussion, wheeze"},
    back:{name:"Back of chest",close:IMG+"z_back.jpg",scale:2,hint:"listen at the back"},
    hands:{name:"Hands & inhalers",close:IMG+"z_hands.jpg",scale:2.6,hint:"tremor, pulse, his inhalers"}
  },
  regionOrder:["face","lips","neck","chest","back","hands"],
  deviceRegion:{ecg:"chest",spo2:"hands",nibp:"chest",temp:"face",o2:"lips",iv:"hands"},
  deviceText:{ecg:"Monitoring on: sinus tachycardia.",spo2:"Finger probe on.",nibp:"Cuff on, cycling every 5 min.",temp:S=>`Temperature ${S.v.temp.toFixed(1)} °C.`,
    o2:"Oxygen via mask, titrated to SpO₂ 94–98%. Nebulisers can now be oxygen-driven.",iv:"20G cannula in the left forearm. Bloods drawn."},
  talkTo:[{who:"pt",name:"Viktor"},{who:"co",name:"Tomás · flatmate"}],
  tray:[{id:"mo_pef",icon:"glucose"},{id:"dx_abg",icon:"labs"},{id:"dx_cxr",icon:"xray"},{id:"dx_ecg",icon:"ecg12"}],
  actions:[
    /* talk: answers shrink to single words when he's worse */
    {id:"pt_speech",cat:"Talk",t:"Tell me your name and where you live",short:"Speech test",cost:.5,run:S=>{
      const p=pct(S);let b,say,k;
      if(S.stage>=2){say="…mm…";b="Barely responds, too breathless and drowsy to speak.";k="none";}
      else if(S.stage===1||p<.45){say="Vik… tor… Dub… lin…";b="Single words only.";k="words";}
      else if(p<.6){say="Viktor… Stoyanov… I live… in Rathmines…";b="Short phrases.";k="phrases";}
      else{say="Viktor Stoyanov. I live in Rathmines, with Tomás.";b="Full sentences.";k="sentences";}
      return{b,say,k};}},
    {id:"pt_how",cat:"Talk",t:"How long has it been this bad?",cost:.5,say:S=>S.stage?"…":"Cold… three days… tonight… worse.",b:"Three days of a cold; much worse tonight."},
    {id:"pt_inh",cat:"Talk",t:"Which inhalers do you use?",cost:.5,say:S=>S.stage?"…blue…":"Blue one… loads. Brown… ran out.",b:"Overusing his blue reliever; brown preventer ran out."},
    {id:"pt_adm",cat:"Talk",t:"Ever been in hospital with your asthma?",cost:.5,say:"Once… last winter… ward.",b:"One previous admission last winter."},
    {id:"pt_icu",cat:"Talk",t:"Ever needed intensive care or a breathing tube?",cost:.5,say:"No.",b:"Never in ICU, never intubated."},
    {id:"pt_pain",cat:"Talk",t:"Any chest pain?",cost:.5,say:"Tight… all over.",b:"Generalised tightness. No sharp or one-sided pain (pneumothorax less likely)."},
    {id:"pt_all",cat:"Talk",t:"Any allergies?",cost:.5,say:"Nuts… no medicines.",b:"Nut allergy. No drug allergies."},
    {id:"pt_smoke",cat:"Talk",t:"Do you smoke or vape?",cost:.5,say:"Vape… sometimes.",b:"Vapes occasionally."},
    {id:"co_puffs",cat:"Talk",who:"co",t:"How much has he used his blue inhaler?",cost:.5,say:"Every few minutes since midnight. Twenty puffs at least, it wasn't doing anything.",b:"At least 20 puffs of salbutamol since midnight without relief."},
    {id:"co_prev",cat:"Talk",who:"co",t:"What about his brown inhaler?",cost:.5,say:"It ran out two weeks ago. He kept saying he'd get more.",b:"Preventer ran out two weeks ago."},
    {id:"co_hist",cat:"Talk",who:"co",t:"Has this happened before?",cost:.5,say:"He was admitted last winter in Sofia. Not intensive care, I don't think.",b:"Admitted last winter in Sofia; no ICU that Tomás knows of."},
    {id:"co_cold",cat:"Talk",who:"co",t:"Has he been unwell otherwise?",cost:.5,say:"A cold and a cough for three days. No fever that I know of.",b:"Viral URTI for three days, no fever."},
    {id:"co_other",cat:"Talk",who:"co",t:"Any other medical problems or medicines?",cost:.5,say:"Not that I know. A nose spray in hay-fever season.",b:"Seasonal rhinitis; intranasal steroid in summer."},

    /* examination */
    {id:"ex_gen",cat:"Exam",region:"face",tech:"inspect",t:"General appearance",cost:.5,fx:"touch",at:{x:50,y:45},run:S=>({b:S.stage>=2?"Slumped, drowsy, poor respiratory effort.":S.stage===1?"Exhausted, sweaty, struggling to keep going.":pct(S)>=.55?"Sitting back, talking, much more comfortable.":"Sitting bolt upright in the tripod position, sweaty, frightened, every breath an effort."})},
    {id:"ex_sev",cat:"Exam",region:"face",tech:"special",t:"Classify severity",verb:"Classify",cost:.5,repeat:true,viewer:"sev",run:()=>({b:"Severity checklist opened."})},
    {id:"ex_lips",cat:"Exam",region:"lips",tech:"inspect",t:"Lip and tongue colour",cost:.5,fx:"touch",at:{x:50,y:55},run:S=>({b:S.stage>=1?"Dusky lips: central cyanosis.":"Pink lips. No swelling of the lips or tongue (not anaphylaxis)."})},
    {id:"ex_access",cat:"Exam",region:"neck",tech:"inspect",t:"Accessory muscles & tracheal tug",cost:.5,fx:"touch",at:{x:50,y:55},run:S=>({b:pct(S)>=.55&&!S.stage?"Much less accessory muscle use.":"Sternocleidomastoids working hard, tracheal tug, suprasternal recession."})},
    {id:"ex_trach",cat:"Exam",region:"neck",tech:"palpate",t:"Trachea",cost:.5,b:"Trachea central: no tension pneumothorax."},
    {id:"ex_chest_i",cat:"Exam",region:"chest",tech:"inspect",t:"Inspect chest",cost:.5,fx:"touch",at:{x:50,y:60},run:S=>({b:"Hyperinflated chest, intercostal and subclavicular recession, prolonged expiration."})},
    {id:"ex_rr",cat:"Exam",region:"chest",tech:"special",t:"Count the respiratory rate",verb:"Count",cost:.5,repeat:true,viewer:"rr",run:()=>({b:"Counting breaths for 15 seconds."})},
    {id:"ex_perc",cat:"Exam",region:"chest",tech:"percuss",t:"Percuss both sides",cost:1,fx:"touch",at:{x:40,y:62},sound:"percuss",b:"Hyper-resonant and equal on both sides."},
    {id:"ex_ausc",cat:"Exam",region:"chest",tech:"auscultate",t:"Listen to the chest",cost:1,repeat:true,fx:"touch",at:{x:58,y:62},
      sound:S=>S.stage>=1?"silent":pct(S)>=.55?"wheezesoft":"wheeze",
      run:S=>({b:S.stage>=1?"Very little air movement: a near-silent chest. Life-threatening.":pct(S)>=.55?"Scattered wheeze, much better air entry.":"Widespread polyphonic expiratory wheeze, equal on both sides, prolonged expiration.",f:S.stage>=1?"bad":""})},
    {id:"ex_heart",cat:"Exam",region:"chest",tech:"auscultate",t:"Heart sounds",cost:.5,sound:"heart",run:S=>({b:`Tachycardic, regular, ${Math.round(S.v.hr)}/min. Normal heart sounds.`})},
    {id:"ex_back",cat:"Exam",region:"back",tech:"auscultate",t:"Listen at the back",cost:1,repeat:true,fx:"touch",at:{x:50,y:45},sound:S=>S.stage>=1?"silent":pct(S)>=.55?"wheezesoft":"wheeze",
      run:S=>({b:S.stage>=1?"Barely audible breath sounds at both bases.":"Wheeze throughout, equal on both sides. No focal crackles or bronchial breathing."})},
    {id:"ex_tremor",cat:"Exam",region:"hands",tech:"inspect",t:"Hands: tremor & colour",cost:.5,fx:"touch",at:{x:50,y:55},run:S=>({b:S.salb?"Fine tremor from salbutamol. Warm, sweaty hands.":"Warm, sweaty hands. No tremor yet."})},
    {id:"ex_pulse",cat:"Exam",region:"hands",tech:"palpate",t:"Radial pulse (and with breathing)",cost:.5,fx:"touch",at:{x:40,y:45},run:S=>({b:`Regular, ${Math.round(S.v.hr)}/min.${pct(S)<.5||S.stage?" Volume drops noticeably when he breathes in (pulsus paradoxus).":""}`})},
    {id:"ex_inh",cat:"Exam",region:"hands",tech:"inspect",t:"Look at his inhalers",cost:.5,viewer:"inh",run:()=>({b:"Empty brown preventer; heavily used blue reliever."})},

    /* monitoring */
    {id:"mo_ecg",cat:"Monitoring",device:"ecg",t:"Cardiac monitor leads",cost:.5},
    {id:"mo_spo2",cat:"Monitoring",device:"spo2",t:"SpO₂ probe",cost:.5},
    {id:"mo_nibp",cat:"Monitoring",device:"nibp",t:"BP cuff (NIBP)",cost:.5},
    {id:"mo_temp",cat:"Monitoring",device:"temp",t:"Temperature",cost:.5},
    {id:"mo_pef",cat:"Monitoring",t:"Peak expiratory flow",short:"Peak flow",cost:1,tok:0,repeat:true,viewer:"pef",run:()=>({b:"Peak flow meter ready."})},

    /* diagnostics */
    {id:"dx_abg",cat:"Diagnostics",t:"Arterial blood gas",short:"ABG",cost:2,tok:3,repeat:true,viewer:"abg",run:S=>{S.lastGas=gasNow(S);S.flags.abgAt=S.t;if(S.stage>=1)S.flags.abgWhenIndicated=true;return{b:`pH ${S.lastGas.ph}, PaCO₂ ${S.lastGas.co2} kPa, PaO₂ ${S.lastGas.o2} kPa, K⁺ ${S.k.toFixed(1)}.`,f:S.stage?"bad":""};}},
    {id:"dx_ue",cat:"Diagnostics",t:"U&E (potassium)",short:"U&E",cost:1,tok:2,delay:12,run:S=>{S.flags.kSeen=S.k;return{b:`K⁺ ${S.k.toFixed(1)} mmol/L${S.k<3.5?" (low: salbutamol drives potassium into cells)":""}. Renal function normal.`,f:S.k<3.5?"warn":""};}},
    {id:"dx_fbc",cat:"Diagnostics",t:"FBC",short:"FBC",cost:1,tok:2,delay:12,b:"WCC 11.8 (mild rise: stress and salbutamol), eosinophils 0.6. Hb 151."},
    {id:"dx_crp",cat:"Diagnostics",t:"CRP",short:"CRP",cost:1,tok:2,delay:12,b:"CRP 8 mg/L."},
    {id:"dx_ecg",cat:"Diagnostics",t:"12-lead ECG",short:"12-lead ECG",cost:3,tok:3,viewer:"ecg12",b:"Sinus tachycardia, no ischaemic changes."},
    {id:"dx_cxr",cat:"Diagnostics",t:"Portable chest X-ray",short:"Chest X-ray",cost:6,tok:10,viewer:"cxr",b:"Hyperinflation, flattened diaphragms. No pneumothorax or consolidation."},
    {id:"dx_dd",cat:"Diagnostics",t:"D-dimer",short:"D-dimer",cost:1,tok:2,delay:20,low:"Wheeze, a viral trigger and a known asthmatic: pulmonary embolism isn't the question here.",b:"Mildly raised: non-specific in an acutely unwell patient."},
    {id:"dx_bc",cat:"Diagnostics",t:"Blood cultures",short:"Blood cultures",cost:1,tok:2,low:"Afebrile with a viral trigger; cultures don't change management.",b:"Taken."},

    /* treatment */
    {id:"tx_o2",cat:"Treatment",device:"o2",t:"Oxygen via mask (target 94–98%)",cost:.5},
    {id:"tx_iv",cat:"Treatment",device:"iv",t:"IV access & bloods",cost:2,f:"good"},
    {id:"tx_salb",cat:"Treatment",t:"Salbutamol 5 mg nebulised",short:"Salbutamol neb",cost:1,tok:2,repeat:true,run:salb},
    {id:"tx_ipra",cat:"Treatment",t:"Ipratropium 500 µg nebulised",short:"Ipratropium neb",cost:1,tok:2,run:(S,api)=>{S.flags.ipra=true;S.flags.nebUntil=S.t+6;if(S.stage===0)S.pef+=25;vitals(S);maybeRescue(S,api);return{b:"Ipratropium added to the nebuliser.",f:"good"};}},
    {id:"tx_pred",cat:"Treatment",t:"Prednisolone 40–50 mg orally",short:"Prednisolone",cost:.5,tok:1,run:S=>{S.flags.steroid=true;S.steroidAt=S.t;return{b:"Prednisolone given. Takes a few hours to work fully, but prevents worsening.",f:"good",say:S.stage?"":"Swallowed… ok."};}},
    {id:"tx_hydro",cat:"Treatment",t:"Hydrocortisone 100 mg IV",short:"Hydrocortisone",cost:.5,tok:2,needIv:true,run:S=>{S.flags.steroid=true;S.steroidAt=S.steroidAt??S.t;return{b:"IV hydrocortisone given (for when he can't swallow tablets).",f:"good"};}},
    {id:"tx_mag",cat:"Treatment",t:"Magnesium sulfate 2 g IV over 20 min",short:"IV magnesium",cost:2,tok:3,needIv:true,run:(S,api)=>{S.flags.mag=true;S.magAt=S.t;if(S.stage===0)S.pef+=50;S.v.sbp-=6;vitals(S);maybeRescue(S,api);return{b:"Magnesium infusing over 20 minutes. Watch the blood pressure.",f:"good"};}},
    {id:"tx_k",cat:"Treatment",t:"Potassium replacement",short:"Potassium",cost:1,tok:1,needIv:true,req:"dx_ue",reqMsg:"Check the potassium first.",run:S=>{S.flags.kReplaced=true;const low=S.k<3.5;S.k=Math.max(S.k,3.8);return{b:low?"Potassium replaced. K⁺ back in range.":"Potassium given, but it wasn't low.",f:low?"good":"warn"};}},
    {id:"tx_fluids",cat:"Treatment",t:"IV fluids 500 mL",short:"IV fluids",cost:1,tok:2,needIv:true,b:"Fluids running."},
    {id:"tx_senior",cat:"Treatment",t:"Escalate: senior and ICU review",short:"Senior/ICU review",cost:2,tok:0,run:(S,api)=>{S.flags.senior=true;S.seniorAt=S.t;
      if(S.stage===1){S.flags.seniorRescue=true;}
      return{b:S.stage>=1?"Senior and ICU outreach at the bedside. Plan: continue back-to-back nebulisers, IV magnesium, consider IV bronchodilators, ICU bed requested.":"Senior aware. Continue treatment and reassess with peak flow.",f:"good"};}},
    {id:"tx_amino",cat:"Treatment",t:"Aminophylline IV",short:"Aminophylline",cost:2,tok:3,needIv:true,low:"Aminophylline needs senior discussion: narrow therapeutic window, arrhythmias, interactions.",run:S=>{S.flags.amino=true;if(S.stage===0)S.pef+=15;S.v.hr+=10;return{b:S.flags.senior?"Given after senior discussion. Heart rate up.":"Given without senior discussion. Heart rate up, extra beats on the monitor.",f:S.flags.senior?"":"warn"};}},
    {id:"tx_ivsalb",cat:"Treatment",t:"IV salbutamol infusion",short:"IV salbutamol",cost:2,tok:3,needIv:true,low:"IV salbutamol is a senior/ICU decision; nebulised is first-line.",run:S=>{S.flags.ivsalb=true;S.v.hr+=12;S.k=Math.max(3,S.k-.3);return{b:S.flags.senior?"Started on senior advice.":"Started without senior input. Marked tachycardia and falling potassium.",f:S.flags.senior?"":"warn"};}},
    {id:"tx_loraz",cat:"Treatment",t:"Lorazepam 1 mg for anxiety",short:"Lorazepam",cost:.5,tok:1,low:"Never sedate an acute asthmatic outside ICU: it suppresses the breathing he's relying on.",run:(S,api)=>{S.flags.sedated=true;toStage(S,api,2,"“He's suddenly very drowsy. His breathing has slowed right down.”");return{b:"Sedative given. His breathing slows and he becomes drowsy.",f:"bad"};}},
    {id:"tx_bag",cat:"Treatment",t:"Breathe into a paper bag",short:"Paper bag",cost:.5,low:"This isn't anxiety hyperventilation. Rebreathing lowers his oxygen.",run:S=>{S.flags.bag=true;S.flags.bagUntil=S.t+3;vitals(S);return{b:"His oxygen saturation drops while he rebreathes. This is asthma, not anxiety.",f:"bad"};}},
    {id:"tx_abx",cat:"Treatment",t:"Antibiotics (co-amoxiclav)",short:"Antibiotics",cost:.5,tok:2,low:"Viral trigger, no fever, no consolidation: antibiotics aren't indicated.",b:"Given."},

    /* disposition */
    {id:"dp_ward",cat:"Disposition",t:"Admit to the respiratory ward",cost:2,end:true,b:"Admitted for nebulisers, steroids and monitoring."},
    {id:"dp_icu",cat:"Disposition",t:"Admit to ICU",cost:2,end:true,b:"Accepted by ICU."},
    {id:"dp_home",cat:"Disposition",t:"Discharge with steroids and a new preventer",cost:2,end:true,f:"bad",b:"Discharged."}
  ],
  labs:{
    dx_fbc:{name:"Full blood count",rows:[["White cells","11.8","×10⁹/L","4.0–11.0",1],["Eosinophils","0.6","×10⁹/L","0.0–0.5",1],["Haemoglobin","151","g/L","130–175"]]},
    dx_crp:{name:"CRP",rows:[["CRP","8","mg/L","< 5",1]]},
    dx_dd:{name:"D-dimer",rows:[["D-dimer","0.72","mg/L FEU","< 0.5",1]]}
  },
  viewers:{pef:pefViewer,rr:rrViewer,abg:abgViewer,sev:sevViewer,inh:inhViewer,ecg12:ecgViewer,cxr:cxrViewer},
  init(S){S.pef=180;S.stage=0;S.maxStage=0;S.k=3.9;S.salb=0;S.pefLog=[];},
  tick(S,api){
    if(S.ended)return;
    if(S.salbRecent)S.salbRecent=Math.max(0,S.salbRecent-.1);
    if(S.flags.steroid&&!S.flags.steroidEffect&&S.t>=S.steroidAt+20){S.flags.steroidEffect=true;if(S.stage===0)S.pef+=15;}
    if(S.stage===0){
      if(!S.salb&&S.t>=10)toStage(S,api,1,"“He's tiring. Sats are dropping and he can barely speak.”");
      else if(S.t>=25&&!S.flags.steroid&&!S.flags.ipra&&pct(S)<.5)toStage(S,api,1);
      else if(!S.flags.steroid&&S.t>30&&Math.random()<.5)S.pef=Math.max(150,S.pef-1);
    }else if(S.stage===1){
      if(!S.flags.tiring&&S.t-S.stage1At>=8){S.flags.tiring=true;api.log("Nurse","“His breathing rate's come down… is that better?”","warn");}
      if(S.t-S.stage1At>=15&&!(S.flags.mag||S.flags.seniorRescue))toStage(S,api,2);
    }
    vitals(S);
  },
  after(S,a,api){vitals(S);},
  appearance(S){
    let st="base";
    if(S.stage>=2||(S.stage===1&&S.flags.tiring))st="exhausted";
    else if(S.flags.nebUntil&&S.t<S.flags.nebUntil)st="neb";
    else if(S.stage===0&&pct(S)>=.55)st="settled";
    const look={base:"Tripod position, can't finish words",neb:"Nebuliser running, working hard",exhausted:S.stage>=2?"Drowsy, poor effort, dusky":"Tiring, sweaty, quieter",settled:"Talking, colour back"}[st];
    return{state:st,look};
  },
  hud(S){const l=lastPef(S);return l?`PEF ${l.v} (${l.pc}%) at ${F(l.t).slice(2)}`:"PEF not measured";},
  findingsExtra(S){
    const L=S.pefLog||[];const W=320,H=150,x=t=>30+Math.min(60,t)/60*(W-40),y=v=>H-20-(v/BEST)*(H-30);
    const line=(p,c,l)=>`<line x1="30" x2="${W-10}" y1="${y(p*BEST)}" y2="${y(p*BEST)}" stroke="${c}" stroke-dasharray="4 3"/><text x="${W-10}" y="${y(p*BEST)-3}" text-anchor="end" font-size="10" fill="${c}" font-family="JetBrains Mono, monospace">${l}</text>`;
    const pts=L.map(p=>`${x(p.t)},${y(p.v)}`).join(" ");
    return `<div class="fgroup"><h4>Peak flow chart</h4>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:420px" role="img" aria-label="Peak flow over time">
        <rect x="30" y="10" width="${W-40}" height="${H-30}" fill="none" stroke="#2B3A4A"/>
        ${line(.75,"#22C55E","75%")}${line(.5,"#FACC15","50%")}${line(.33,"#FF6B6B","33%")}
        ${L.length>1?`<polyline points="${pts}" fill="none" stroke="#06B6D4" stroke-width="2"/>`:""}
        ${L.map(p=>`<circle cx="${x(p.t)}" cy="${y(p.v)}" r="4" fill="#06B6D4"/>`).join("")}
        <text x="30" y="${H-4}" font-size="10" fill="#7D8B9B" font-family="JetBrains Mono, monospace">0</text><text x="${W-10}" y="${H-4}" text-anchor="end" font-size="10" fill="#7D8B9B" font-family="JetBrains Mono, monospace">60 min</text>
      </svg>
      <p class="sub" style="margin:4px 0 0;font-size:12px">${L.length?L.map(p=>`${p.v} L/min (${p.pc}%) at ${F(p.t).slice(2)}`).join(" · "):"No readings yet. Monitoring › Peak expiratory flow."}</p>
      ${S.results.ex_sev?`<p style="margin:6px 0 0;font-size:13px"><b style="color:var(--muted);font-weight:500">Severity:</b> ${S.results.ex_sev}</p>`:""}</div>`;
  },
  onWait(S,api){if(S.stage>=1)api.say("…","pt");},
  hints:[
    S=>!S.attach.spo2&&"Get objective numbers: oxygen saturation first.",
    S=>!S.salb&&"He's in the tripod position, speaking single words. What goes in the nebuliser first?",
    S=>S.salb&&!S.attach.o2&&S.v.spo2<94&&"His sats are under 94%, and the nebuliser should be driven by something.",
    S=>!(S.pefLog||[]).length&&"How bad is it, objectively? He has a personal best of 480.",
    S=>!S.flags.steroid&&"Every acute asthmatic needs one early medicine that takes hours to work.",
    S=>!S.flags.ipra&&"In severe asthma, what do you add to the salbutamol?",
    S=>S.pefAfter1&&S.pefAfter1/BEST<.5&&!S.flags.mag&&"Peak flow still under 50% after the first nebuliser. What's the next drug?",
    S=>S.stage>=1&&!S.done.dx_abg&&"He's tiring. A blood gas will tell you how close he is to the edge.",
    S=>S.stage>=1&&!S.flags.senior&&"Life-threatening features: who needs to be here now?",
    S=>!S.flags.classified&&"Classify the attack: Face & general › Classify severity."
  ],
  teaching:[
    "Severity is judged on objective features. Acute severe: PEF 33–50% of best or predicted, RR 25 or more, HR 110 or more, or unable to complete sentences. Life-threatening: PEF under 33%, SpO₂ under 92%, PaO₂ under 8 kPa, a “normal” PaCO₂, silent chest, cyanosis, poor effort, exhaustion, confusion, arrhythmia or hypotension. Near-fatal: raised PaCO₂ or needing ventilation.",
    "A falling respiratory rate or a quietening chest can mean exhaustion, not recovery. Always pair it with SpO₂, peak flow and how he looks.",
    "Give oxygen to a target of 94–98% and drive nebulisers with oxygen. Salbutamol 5 mg nebulised first, repeated or back to back if the response is poor; add ipratropium 500 µg in severe or life-threatening asthma.",
    "Give steroids early to every acute asthmatic: prednisolone 40–50 mg orally, or IV hydrocortisone if he can't swallow.",
    "IV magnesium sulfate (a single dose of 1.2–2 g over 20 minutes) is for a poor response to initial nebulisers or life-threatening features. Aminophylline and IV salbutamol are senior and ICU decisions.",
    "In acute asthma the CO₂ should be low. A normal PaCO₂ in a breathless asthmatic means he's tiring; a raised one means ventilatory failure and ICU.",
    "Never sedate an acute asthmatic outside intensive care, and don't treat it as anxiety: a paper bag lowers his oxygen.",
    "Repeated salbutamol lowers potassium. Check it and replace it.",
    "Chest X-ray isn't routine: get one for suspected pneumothorax or consolidation, life-threatening asthma, or failure to respond.",
    "Risk factors here: previous admission, heavy reliever use and an empty preventer. Before discharge: inhaler technique, preventer adherence, a written asthma action plan and early follow-up."
  ],
  transferText:{dp_ward:"Viktor goes up to the respiratory ward…",dp_icu:"ICU take Viktor upstairs…",dp_home:"Viktor is sent home…"},
  score(S){
    const d=S.done,f=S.flags,rows=[];const add=(ok,l,det,p,m)=>rows.push({ok,label:l,detail:det,pts:p,max:m});
    const L=S.pefLog||[];
    const measured=[d.pt_speech&&"speech",(f.rrCounted||S.attach.ecg)&&"RR",S.attach.ecg&&"HR",S.attach.spo2&&"SpO₂",L.length&&"peak flow"].filter(Boolean);
    const sevPts=Math.min(8,Math.round(measured.length/5*8))+(f.classOK?7:0);
    add(sevPts>=13?"ok":sevPts>=6?"meh":"no","Severity assessed objectively and classified",`${measured.join(", ")||"Nothing measured"}${f.classified?(f.classOK?" · classified correctly":" · classified incorrectly"):" · not classified"}`,sevPts,15);
    add(d.tx_o2?"ok":"no","Oxygen titrated to 94–98%",d.tx_o2?`Started ${F(S.at.tx_o2)}`:"No oxygen",d.tx_o2?5:0,5);
    const sa=S.firstSalbAt;add(sa!=null?(sa<=10?"ok":"meh"):"no","Salbutamol nebulised early",sa!=null?`First dose ${F(sa)}${f.airNeb?" (air-driven at least once)":""}`:"Not given",sa!=null?(sa<=10?15:8):0,15);
    add(f.ipra?"ok":"no","Ipratropium added",f.ipra?"Given":"Not given",f.ipra?10:0,10);
    add(f.steroid?(S.steroidAt<=60?"ok":"meh"):"no","Steroid within 1 hour",f.steroid?`At ${F(S.steroidAt)}`:"Not given",f.steroid?(S.steroidAt<=60?15:8):0,15);
    const after=L.filter(p=>sa!=null&&p.t>sa).length;
    add(after>=2?"ok":after===1?"meh":"no","Reassessed with peak flow",`${L.length} reading${L.length===1?"":"s"}, ${after} after treatment`,after>=2?10:after===1?5:0,10);
    const gasNeeded=S.maxStage>=1;
    add(!gasNeeded?(d.dx_abg&&f.gasOK===false?"meh":"ok"):(f.abgWhenIndicated&&f.gasOK?"ok":f.abgWhenIndicated?"meh":"no"),"Blood gas when indicated, read correctly",!gasNeeded?(d.dx_abg?(f.gasOK?"Taken and read correctly":"Taken"):"Not indicated"):(f.abgWhenIndicated?(f.gasOK?"Life-threatening gas recognised":"Taken, not interpreted correctly"):"Not taken despite life-threatening features"),!gasNeeded?10:(f.abgWhenIndicated&&f.gasOK?10:f.abgWhenIndicated?5:0),10);
    const magNeeded=(S.pefAfter1&&S.pefAfter1/BEST<.5)||S.maxStage>=1;
    add(!magNeeded?"ok":(f.mag?"ok":"no"),"Magnesium for poor response",magNeeded?(f.mag?`Given ${F(S.magAt)}`:"Indicated, not given"):"Not needed",!magNeeded||f.mag?10:0,10);
    const harm=[f.sedated&&"sedative",f.bag&&"paper bag"].filter(Boolean);
    add(harm.length?"no":"ok","Avoided harmful treatments",harm.length?`Gave: ${harm.join(", ")}`:"No sedation, no rebreathing",harm.length?0:5,5);
    const right=S.maxStage>=2?"dp_icu":"dp_ward";
    add(S.outcome===right?"ok":(S.outcome==="dp_icu"||S.outcome==="dp_ward")?"meh":"no","Safe disposition",S.outcome==="dp_home"?"Discharged with PEF under 75%: unsafe":S.outcome==="dp_icu"?"ICU":S.outcome==="dp_ward"?"Respiratory ward":"None",S.outcome===right?5:(S.outcome==="dp_icu"||S.outcome==="dp_ward")?3:0,5);
    return{rows,great:"Strong run. Objective severity, the right drugs in the right order, and reassessment by numbers.",outcome:S.maxStage>=2?"He reached near-fatal asthma.":S.maxStage===1?"He developed life-threatening features.":""};
  }
};
})());
