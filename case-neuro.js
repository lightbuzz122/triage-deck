/* Case: 81-year-old on rivaroxaban, found after a fall, confused. Acute right subdural haematoma. */
(window.CASEDEFS=window.CASEDEFS||[]).push((function(){
const IMG="img/neuro/";
const LEADS={I:{r:.6,s:.1,t:.15},II:{r:1,t:.25},III:{r:.45,t:.12},aVR:{r:.7,t:.2,inv:1},aVL:{r:.3,s:.15,t:.08},aVF:{r:.7,t:.2},
  V1:{r:.15,s:.9,q:0,t:-.05},V2:{r:.3,s:1,q:0,t:.25},V3:{r:.6,s:.6,t:.3},V4:{r:1.1,s:.35,t:.3},V5:{r:1,s:.2,t:.28},V6:{r:.8,s:.1,t:.22}};
const gcsTotal=g=>g.e+g.v+g.m;
const F=t=>`T+${String(Math.floor(t)).padStart(2,"0")}:${String(Math.round((t%1)*60)).padStart(2,"0")}`;

/* reflex/power grid helpers */
const side=(id,group,tech,region,sd,at,b,k,extra={})=>({id,cat:"Exam",group,tech,region,side:sd,at,b,k,cost:.5,fx:tech==="hammer"?"hammer":"touch",...extra});
const pair=(base,group,tech,region,at,R,L,extra={})=>[side(base+"_R",group,tech,region,"R",at,R[0],R[1],extra),side(base+"_L",group,tech,region,"L",at,L[0],L[1],extra)];

/* patient speech: he keeps asking the same thing */
const loop=["Sorry… where am I?","What happened to me?","Why am I here? Is Elena coming?","Where am I, son?"];
const ptSay=(txt)=>S=>{S.flags.q=(S.flags.q||0)+1;return S.flags.q%2===0?`${txt} … ${loop[(S.flags.q/2)%loop.length|0]}`:txt;};

function ecgViewer(body,S,api,fresh){
  body.innerHTML=`<div class="paperwrap"><canvas id="ecgC"></canvas></div><div class="interp"><div class="label">Your read</div>Rate, rhythm, axis, intervals, ST segments. <button class="btn xs" id="rev">Show interpretation</button><p id="int" hidden>Atrial fibrillation with a ventricular rate around ${Math.round(S.v.hr)}. Normal axis. No acute ST changes. No evidence of a primary cardiac cause for the fall, but syncope can't be excluded.</p></div>`;
  api.draw.ecg(document.getElementById("ecgC"),{leads:LEADS,hr:S.v.hr,af:true,animate:fresh,grid:[["I","aVR","V1","V4"],["II","aVL","V2","V5"],["III","aVF","V3","V6"]],
    title:`ILIEV, STEFAN · 81 M · ${api.fmt(S.at.dx_ecg??S.t)}`,sub:`Vent rate ${Math.round(S.v.hr)} bpm · 25 mm/s · 10 mm/mV · STANDARD 12-LEAD`});
  body.querySelector("#rev").onclick=e=>{body.querySelector("#int").hidden=false;e.target.hidden=true;};
  return "12-lead ECG";
}
function ctViewer(body,S,api){
  body.innerHTML=`<div class="imgwrap"><canvas id="ctC"></canvas><div class="interp"><div class="label">Axial CT head · non-contrast</div>
    <p>Images are viewed from the feet: the patient's right is on your left.</p>
    <p style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn xs" id="ann" aria-pressed="false">Annotate</button><button class="btn xs" id="rev">Show report</button></p>
    <p id="int" hidden>Acute right-sided subdural haematoma, up to 12 mm thick, along the right convexity. Effacement of right-sided sulci and compression of the right lateral ventricle with about 6 mm of midline shift to the left. Right frontal scalp haematoma. No skull fracture.</p></div></div>`;
  const draw=a=>api.draw.ct(document.getElementById("ctC"),{sdh:22,shift:7,shiftMm:6,swelling:true,annotate:a,label:"ILIEV S · CT HEAD · AXIAL 5 mm"});
  draw(false);let on=false;
  body.querySelector("#ann").onclick=e=>{on=!on;e.target.setAttribute("aria-pressed",on);draw(on);};
  body.querySelector("#rev").onclick=e=>{body.querySelector("#int").hidden=false;e.target.hidden=true;};
  return "CT head";
}
function cxrViewer(body,S,api){
  body.innerHTML=`<div class="imgwrap"><canvas id="cxrC"></canvas><div class="interp"><div class="label">Systematic review</div><p>Airway · Breathing · Cardiac · Diaphragm · Everything else.</p><button class="btn xs" id="rev" style="margin-top:8px">Show report</button><p id="int" hidden>Heart size at the upper limit of normal. Clear lungs. No rib fractures or pneumothorax seen.</p></div></div>`;
  api.draw.cxr(document.getElementById("cxrC"),{label:"AP · PORTABLE · RESUS 4"});
  body.querySelector("#rev").onclick=e=>{body.querySelector("#int").hidden=false;e.target.hidden=true;};
  return "Chest X-ray · AP portable";
}
function pupilViewer(body,S,api){
  const P=S.pupils;
  const eye=(id,mm,lbl)=>`<div class="eye"><svg viewBox="0 0 200 120" aria-hidden="true"><path d="M10 60 Q100 -10 190 60 Q100 130 10 60Z" fill="#efe6dc" stroke="#9c8a7b" stroke-width="2"/><circle cx="100" cy="60" r="34" fill="#6f8fa3"/><circle cx="100" cy="60" r="34" fill="none" stroke="#3d5566" stroke-width="2"/><circle id="${id}" class="pupil" cx="100" cy="60" r="8" fill="#0b0b0b" style="transform:scale(${mm/2})"/><circle cx="88" cy="48" r="5" fill="#fff" opacity=".7"/></svg><div class="label">${lbl}</div><div class="mm" id="${id}t">${mm} mm</div></div>`;
  body.innerHTML=`<img src="${IMG}z_pupils.jpg" alt="Close-up of the eyes" style="width:100%;max-height:220px;object-fit:cover;border-radius:8px">
    <div class="eyes">${eye("pR",P.R.mm,"Patient's right eye")}${eye("pL",P.L.mm,"Patient's left eye")}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm primary" data-shine="R">Shine light in right eye</button><button class="btn sm primary" data-shine="L">Shine light in left eye</button></div>
    <div class="interp" id="pres"><div class="label">Technique</div><p>Dim the light, shine into each eye from the side, and watch both pupils: the lit eye (direct) and the other eye (consensual).</p></div>`;
  const seen={};
  body.onclick=e=>{const b=e.target.closest("[data-shine]");if(!b)return;const lit=b.dataset.shine;
    ["R","L"].forEach(sd=>{const el=document.getElementById("p"+sd),p=P[sd],to=p.react==="brisk"?Math.max(1.5,p.mm-1.2):p.mm-.4;
      el.classList.toggle("slow",p.react!=="brisk");el.style.transform=`scale(${to/2})`;document.getElementById("p"+sd+"t").textContent=`${p.mm} → ${to.toFixed(1)} mm`;
      setTimeout(()=>{el.style.transform=`scale(${p.mm/2})`;},1500);});
    seen[lit]=true;
    const txt=`Right ${P.R.mm} mm, ${P.R.react}; left ${P.L.mm} mm, ${P.L.react}. Direct and consensual responses present.`;
    document.getElementById("pres").innerHTML=`<div class="label">Finding</div><p>${seen.R&&seen.L?txt:"Now test the other eye."}</p>`;
    if(seen.R&&seen.L){S.results.ex_pupils=txt;S.keys.ex_pupils=`${P.R.mm}/${P.L.mm}`;S.pupilRec={t:S.t,txt};}
  };
  return "Pupils · pen torch";
}
function gcsViewer(body,S,api){
  const obs=[];
  const g=S.gcs;
  obs.push(g.e===3?"His eyes are closed until you speak to him, then open.":g.e===2?"His eyes stay closed when you speak; they open only to a painful stimulus.":"Eyes open spontaneously.");
  if(S.flags.talked)obs.push(g.v===4?"He talks in sentences but is disoriented and repeats questions.":"His words are inappropriate, not conversational.");
  else obs.push("You haven't spoken with him yet (Talk tab).");
  if(S.done.ex_cmd)obs.push(g.m===6?"He squeezes and releases your fingers on command.":"He no longer follows commands.");
  else obs.push("You haven't tested whether he obeys commands (Hands › Squeeze my fingers).");
  if(S.done.ex_pain)obs.push(g.m===6?"To trapezius pressure he pushes your hand away and complains.":"To trapezius pressure he brings his hand up to your arm (localises).");
  const grp=(k,title,opts)=>`<fieldset><legend>${title}</legend>${opts.map(([v,t])=>`<label><input type="radio" name="g${k}" value="${v}"><b>${v}</b>${t}</label>`).join("")}</fieldset>`;
  body.innerHTML=`<div class="interp"><div class="label">What you've observed</div><ul class="obs">${obs.map(o=>`<li>${o}</li>`).join("")}</ul></div>
    <div class="gcs">${grp("e","Eyes",[[4,"Spontaneous"],[3,"To sound"],[2,"To pressure"],[1,"None"]])}${grp("v","Verbal",[[5,"Oriented"],[4,"Confused"],[3,"Words"],[2,"Sounds"],[1,"None"]])}${grp("m","Motor",[[6,"Obeys commands"],[5,"Localising"],[4,"Normal flexion"],[3,"Abnormal flexion"],[2,"Extension"],[1,"None"]])}</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn primary" id="rec">Record GCS</button><span class="sub" id="gmsg">Score from what you've actually seen.</span></div>`;
  body.querySelector("#rec").onclick=()=>{
    const v=k=>{const r=body.querySelector(`input[name=g${k}]:checked`);return r?+r.value:null;};
    const e=v("e"),vv=v("v"),m=v("m");if(e==null||vv==null||m==null){body.querySelector("#gmsg").textContent="Pick one option in each column.";return;}
    const tot=e+vv+m,ok=e===g.e&&vv===g.v&&m===g.m;
    S.recGcs={e,v:vv,m,tot,t:S.t,ok};S.gcsLog=(S.gcsLog||[]).concat([{t:S.t,tot,e,v:vv,m,ok,true:gcsTotal(g)}]);S.done.ex_gcs=true;S.at.ex_gcs=S.at.ex_gcs??S.t;
    const fb=ok?"Matches the bedside findings.":`Bedside findings support E${g.e} V${g.v} M${g.m} = ${gcsTotal(g)}.`;
    S.results.ex_gcs=`E${e} V${vv} M${m} = ${tot}. ${fb}`;
    api.log("GCS recorded",`E${e} V${vv} M${m} = ${tot}. ${fb}`,ok?"good":"warn");
    body.querySelector("#gmsg").innerHTML=`<b style="color:${ok?"var(--good)":"var(--warn)"}">${ok?"Correct.":"Not quite."}</b> ${fb}`;
  };
  return "Glasgow Coma Scale";
}

function figure(S){
  const k=id=>S.keys[id]||"";
  const site=(x,y,id,anchor)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11" font-family="JetBrains Mono, monospace" fill="${k(id)?"#E6EDF3":"#4b5b6c"}">${k(id)||"·"}</text>`;
  const pl=id=>{const v=k(id);return v==="↑"?"↑":v==="↓"?"↓":"·";};
  return `<svg viewBox="0 0 190 300" role="img" aria-label="Reflex chart">
    <g fill="none" stroke="#5c6f84" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="95" cy="28" r="16"/><path d="M95 44v12M70 60h50l-6 90H76z"/><path d="M70 62L48 120 40 168M120 62l22 58 8 48"/><path d="M80 150l-6 70-4 64M110 150l6 70 4 64"/><path d="M70 284h-14M120 284h14"/>
    </g>
    <text x="8" y="14" font-size="10" fill="#A7B4C2" font-family="JetBrains Mono, monospace">R</text><text x="175" y="14" font-size="10" fill="#A7B4C2" font-family="JetBrains Mono, monospace">L</text>
    ${site(34,108,"rf_bic_R","end")}${site(156,108,"rf_bic_L","start")}
    ${site(34,128,"rf_tri_R","end")}${site(156,128,"rf_tri_L","start")}
    ${site(34,168,"rf_sup_R","end")}${site(156,168,"rf_sup_L","start")}
    ${site(64,222,"rf_knee_R","end")}${site(126,222,"rf_knee_L","start")}
    ${site(62,270,"rf_ank_R","end")}${site(128,270,"rf_ank_L","start")}
    <text x="56" y="298" text-anchor="middle" font-size="14" fill="${k("rf_pl_R")?"#E6EDF3":"#4b5b6c"}">${pl("rf_pl_R")}</text><text x="134" y="298" text-anchor="middle" font-size="14" fill="${k("rf_pl_L")?"#F6B73C":"#4b5b6c"}">${pl("rf_pl_L")}</text>
  </svg>`;
}

return {
  id:"neuro-01",title:"Confused after a fall",specialty:"Neurology",setting:"Emergency dept",acuity:2,mins:"15–20",
  blurb:"An 81-year-old on anticoagulation is found on the floor, now drowsy and repeating questions.",
  thumb:IMG+"base.jpg",bed:"RESUS 4 · ADULT",
  patient:{name:"Stefan Iliev",first:"Stefan",meta:"81 M · found on floor · ambulance",label:"ILIEV, Stefan · 81 M",cc:"Where… where am I? What's happened?"},
  arrival:"Ambulance handover: found on his kitchen floor by his daughter at 08:00. Confused, repeating questions. Takes a blood thinner. Moved to resus 4.",
  dx:"Acute right subdural haematoma on rivaroxaban, with left-sided upper motor neuron signs",budget:55,
  vitals:{hr:88,sbp:168,dbp:92,rr:16,spo2:96,temp:36.1,rhythm:"af"},
  monitorLead:LEADS.II,
  views:{
    bedside:{label:"Bedside",aspect:"416/314",states:{base:IMG+"base.jpg",drowsy:IMG+"drowsy.jpg",distressed:IMG+"distressed.jpg",settled:IMG+"settled.jpg"},
      markers:{head:{x:33,y:12},eyes:{x:37,y:22},ear:{x:27,y:25},mouth:{x:38,y:32},neck:{x:41,y:42},chest:{x:50,y:54},arm:{x:18,y:68},abd:{x:62,y:62},hand:{x:50,y:90}}},
    full:{label:"Full length",aspect:"561/379",img:IMG+"full.jpg",
      markers:{head:{x:15.6,y:10.2},eyes:{x:19.2,y:16.3},neck:{x:24.3,y:27.7},chest:{x:35.5,y:40.7},arm:{x:14.7,y:44.8},abd:{x:43.6,y:49.4},hand:{x:33.3,y:65},legs:{x:64,y:62},feet:{x:81.5,y:83.9}}}
  },
  regions:{
    head:{name:"Scalp & forehead",close:IMG+"z_head.jpg",scale:2.8,hint:"injury, GCS"},
    eyes:{name:"Eyes",close:IMG+"z_pupils.jpg",scale:3,hint:"pupils, movements"},
    ear:{name:"Ears & mastoid",close:IMG+"z_scalp.jpg",scale:3,hint:"basal skull signs"},
    mouth:{name:"Face & speech",close:IMG+"z_mouth.jpg",scale:3,talk:true,hint:"cranial nerves"},
    neck:{name:"Neck & C-spine",close:IMG+"z_neck.jpg",scale:2.6},
    chest:{name:"Chest",close:IMG+"z_chest.jpg",scale:2.4},
    arm:{name:"Arms",close:IMG+"z_arm.jpg",scale:2.6,hint:"tone, power, reflexes"},
    hand:{name:"Hands",close:IMG+"z_hand.jpg",scale:2.8,hint:"commands, pulse"},
    abd:{name:"Abdomen",close:IMG+"z_abd.jpg",scale:2.4},
    legs:{name:"Legs & hips",close:IMG+"z_knee.jpg",scale:2.4,hint:"tone, power, knee jerks"},
    feet:{name:"Feet",close:IMG+"z_foot.jpg",scale:2.6,hint:"ankle jerks, plantars"}
  },
  regionOrder:["head","eyes","ear","mouth","neck","chest","arm","hand","abd","legs","feet"],
  deviceRegion:{ecg:"chest",spo2:"hand",nibp:"arm",temp:"ear",o2:"mouth",iv:"arm"},
  deviceText:{ecg:"3-lead monitoring attached. Irregularly irregular rhythm.",spo2:"Finger probe on.",nibp:"Cuff on the left arm, cycling every 5 min.",temp:S=>`Tympanic temperature ${S.v.temp.toFixed(1)} °C. Mildly cold after the time on the floor.`,
    o2:"Mask applied. SpO₂ was 96% on air, so oxygen isn't needed.",iv:"18G cannula in the left antecubital fossa. Fragile veins."},
  talkTo:[{who:"pt",name:"Stefan"},{who:"co",name:"Elena · daughter (phone)"}],
  tray:[{id:"dx_bsl",icon:"glucose"},{id:"dx_ecg",icon:"ecg12"},{id:"dx_ct",icon:"ct"},{id:"dx_fbc",icon:"labs"},{id:"dx_cxr",icon:"xray"}],
  actions:[
    /* talk to the patient */
    {id:"pt_what",cat:"Talk",t:"What happened to you?",cost:1,say:ptSay("I… I don't know. I was in the kitchen? Why am I here?"),b:"Can't recall the fall. Amnestic for the event."},
    {id:"pt_orient",cat:"Talk",t:"Where are you, and what day is it?",cost:1,say:ptSay("Is this… the post office? It's Sunday. March, I think."),b:"Disoriented to place and time (it's Thursday, October)."},
    {id:"pt_head",cat:"Talk",t:"Does your head hurt?",cost:.5,say:ptSay("My head… yes, here. Did someone hit me?"),b:"Right frontal headache."},
    {id:"pt_limbs",cat:"Talk",t:"Any neck pain? How do your arms and legs feel?",cost:1,say:ptSay("My neck's fine. My left hand feels… clumsy. Heavy."),b:"No neck pain. Says the left hand feels clumsy and heavy."},
    {id:"pt_vomit",cat:"Talk",t:"Have you been sick, or had a fit?",cost:.5,say:ptSay("Sick? Maybe… I don't know. Where's Elena?"),b:"Unreliable. Can't recall vomiting or seizure."},
    {id:"pt_before",cat:"Talk",t:"Did you feel dizzy or have chest pain before you fell?",cost:.5,say:ptSay("I don't remember falling."),b:"No recollection; syncope can't be excluded."},
    {id:"pt_thin",cat:"Talk",t:"Do you take a blood thinner?",cost:.5,say:ptSay("The heart pills… a small red one. Elena does the box."),b:"Takes 'a small red pill' for his heart. Can't name it."},
    /* collateral */
    {id:"co_last",cat:"Talk",who:"co",t:"When was he last seen well?",cost:1,say:"I spoke to him at nine last night. He was completely himself.",b:"Last seen well 21:00 yesterday, about 11 hours before arrival."},
    {id:"co_found",cat:"Talk",who:"co",t:"How did you find him?",cost:1,say:"On the kitchen floor at eight this morning, still in his pyjamas. He'd wet himself and he was freezing.",b:"Found on the kitchen floor at 08:00, incontinent of urine, cold. Possible long lie."},
    {id:"co_base",cat:"Talk",who:"co",t:"What is he normally like?",cost:1,say:"Sharp as anything. Lives alone, does the crossword, still drives to the market. No memory problems at all.",b:"Independent with intact cognition at baseline. The confusion is new."},
    {id:"co_meds",cat:"Talk",who:"co",t:"What medicines does he take?",cost:1,say:"Rivaroxaban for his AF, ramipril, atorvastatin and metformin. I fill his dosette box.",b:"Rivaroxaban, ramipril, atorvastatin, metformin."},
    {id:"co_dose",cat:"Talk",who:"co",t:"When did he last take the rivaroxaban, and what dose?",cost:.5,say:"With dinner yesterday, about six. Twenty milligrams.",b:"Rivaroxaban 20 mg, last dose around 18:00 yesterday (about 14 hours ago)."},
    {id:"co_pmh",cat:"Talk",who:"co",t:"Any other medical problems?",cost:.5,say:"AF, blood pressure, diabetes, and a small stroke three years ago. He recovered completely.",b:"AF, hypertension, type 2 diabetes, minor stroke 3 years ago with full recovery."},
    {id:"co_allergy",cat:"Talk",who:"co",t:"Any allergies?",cost:.5,say:"None that I know of.",b:"No known drug allergies."},

    /* head */
    {id:"ex_gcs",cat:"Exam",region:"head",tech:"special",t:"Glasgow Coma Scale",verb:"Score",cost:1,repeat:true,viewer:"gcs",run:S=>({b:"GCS chart opened."})},
    {id:"nh_insp",cat:"Exam",region:"head",tech:"inspect",t:"Inspect scalp & forehead",cost:.5,fx:"touch",at:{x:55,y:52},b:"Right frontal haematoma about 4 cm across, with bruising. No laceration."},
    {id:"nh_palp",cat:"Exam",region:"head",tech:"palpate",t:"Palpate the skull",cost:.5,fx:"touch",at:{x:52,y:55},b:"Boggy, tender swelling over the right frontal bone. No step or depression felt."},
    /* ears */
    {id:"ne_insp",cat:"Exam",region:"ear",tech:"inspect",t:"Signs of basal skull fracture",cost:.5,fx:"touch",at:{x:55,y:50},b:"No bruising behind the ears (Battle's sign). No blood or clear fluid from the ear canals."},
    /* eyes */
    {id:"ex_pupils",cat:"Exam",region:"eyes",tech:"torch",t:"Pupils: direct & consensual",verb:"Shine",cost:.5,repeat:true,fx:"torch",at:{x:32,y:50},viewer:"pupils",run:S=>({b:"Pen torch: test each eye in turn."})},
    {id:"ex_eom",cat:"Exam",region:"eyes",tech:"special",t:"Eye movements",cost:.5,fx:"touch",at:{x:50,y:50},b:"Full range of movement, no nystagmus. No double vision reported."},
    {id:"ex_fields",cat:"Exam",region:"eyes",tech:"special",t:"Visual fields to confrontation",cost:1,b:"Grossly full; cooperation limited by confusion."},
    {id:"ex_racoon",cat:"Exam",region:"eyes",tech:"inspect",t:"Periorbital bruising",cost:.5,fx:"touch",at:{x:30,y:62},b:"No periorbital bruising."},
    /* face & speech */
    {id:"ex_face",cat:"Exam",region:"mouth",tech:"special",t:"Face: raise eyebrows, shut eyes, smile",cost:.5,fx:"touch",at:{x:50,y:60},k:"L UMN",b:"Flattened left nasolabial fold and weaker left smile. Forehead wrinkles symmetrically: upper motor neuron pattern."},
    {id:"ex_tongue",cat:"Exam",region:"mouth",tech:"special",t:"Tongue & palate",cost:.5,b:"Tongue protrudes in the midline; palate rises symmetrically."},
    {id:"ex_speech",cat:"Exam",region:"mouth",tech:"special",t:"Speech & language",cost:1,b:"Fluent, with normal naming and repetition. No dysarthria. Content tangential and repetitive."},
    /* neck */
    {id:"ex_cspine",cat:"Exam",region:"neck",tech:"palpate",t:"C-spine midline tenderness",cost:.5,fx:"touch",at:{x:50,y:45},b:"No midline tenderness or step. Over 65 after a fall: image the cervical spine rather than clear it clinically."},
    {id:"ex_pain",cat:"Exam",region:"neck",tech:"special",t:"Trapezius squeeze (central pain)",cost:.5,run:(S,api)=>{api.transient("distressed",3500);
      return S.gcs.m===6?{b:"Opens his eyes, pushes your hand away and complains. Only needed when a patient doesn't obey commands.",say:"Ow! Stop that! What are you doing?"}:{b:"Localises: brings his left hand up towards your arm. Eyes open briefly.",say:"Mmh… no…"};}},
    /* chest */
    {id:"ex_heart",cat:"Exam",region:"chest",tech:"auscultate",t:"Heart sounds",cost:1,fx:"touch",at:{x:56,y:62},sound:"heart",b:"Irregularly irregular. Heart sounds I + II, soft ejection systolic murmur at the right upper sternal edge."},
    {id:"ex_lungs",cat:"Exam",region:"chest",tech:"auscultate",t:"Breath sounds",cost:1,fx:"touch",at:{x:36,y:66},sound:"breath",b:"Clear, vesicular breath sounds throughout."},
    {id:"ex_ribs",cat:"Exam",region:"chest",tech:"palpate",t:"Chest wall & ribs",cost:.5,fx:"touch",at:{x:45,y:55},b:"No tenderness, crepitus or bony deformity."},
    /* arms */
    {id:"ex_arm_i",cat:"Exam",region:"arm",tech:"inspect",t:"Inspect arms",cost:.5,fx:"touch",at:{x:52,y:52},b:"Fresh bruising over the right upper arm and elbow from the fall. No deformity. Thin skin."},
    ...pair("tone_arm","Tone (arms)","motor","arm",{x:55,y:55},["Normal tone.","N"],["Slightly increased tone.","↑"]),
    ...pair("pow_arm","Power: shoulder & elbow (MRC)","motor","arm",{x:55,y:45},["5/5 throughout.","5"],["4/5 shoulder abduction and elbow extension.","4"]),
    ...pair("rf_bic","Biceps jerk (C5–6)","hammer","arm",{x:62,y:58},["2+ normal.","2+"],["3+ brisk.","3+"]),
    ...pair("rf_tri","Triceps jerk (C7)","hammer","arm",{x:40,y:35},["2+ normal.","2+"],["3+ brisk.","3+"]),
    ...pair("rf_sup","Supinator jerk (C5–6)","hammer","arm",{x:78,y:70},["2+ normal.","2+"],["3+ brisk.","3+"]),
    {id:"ex_drift",cat:"Exam",region:"arm",tech:"special",t:"Pronator drift",cost:.5,fx:"touch",at:{x:50,y:50},k:"L drift",b:"Left arm drifts down and pronates within 10 seconds. Right arm holds steady."},
    {id:"ex_sens_arm",cat:"Exam",region:"arm",tech:"pin",t:"Sensation (arms)",cost:1,fx:"touch",at:{x:60,y:60},b:"Light touch and pinprick grossly intact in both arms; answers are inconsistent."},
    /* hands */
    {id:"ex_cmd",cat:"Exam",region:"hand",tech:"special",t:"“Squeeze my fingers” (obeys commands)",cost:.5,fx:"touch",at:{x:60,y:55},run:S=>S.gcs.m===6?{b:"Squeezes and releases on command. Grip weaker on the left."}:{b:"Doesn't follow the command."}},
    {id:"ex_pulse",cat:"Exam",region:"hand",tech:"palpate",t:"Radial pulse",cost:.5,fx:"touch",at:{x:32,y:40},run:S=>({b:`Irregularly irregular, about ${Math.round(S.v.hr)} per minute.`})},
    {id:"ex_hand_i",cat:"Exam",region:"hand",tech:"inspect",t:"Hands & skin",cost:.5,b:"Thin skin with old bruises and a small fresh skin tear on the right forearm."},
    {id:"ex_fn",cat:"Exam",region:"hand",tech:"special",t:"Finger–nose test",cost:.5,b:"Slow and slightly clumsy on the left, in keeping with weakness. No intention tremor."},
    ...pair("rf_hof","Hoffmann's sign","hammer","hand",{x:70,y:62},["Negative.","−"],["Positive: thumb flexes.","+"]),
    /* abdomen */
    {id:"ex_abd_i",cat:"Exam",region:"abd",tech:"inspect",t:"Inspect abdomen",cost:.5,b:"Not distended. No bruising."},
    {id:"ex_abd_p",cat:"Exam",region:"abd",tech:"palpate",t:"Palpate abdomen & bladder",cost:1,fx:"touch",at:{x:50,y:55},b:"Soft, non-tender. Bladder not palpable."},
    {id:"ex_abd_pc",cat:"Exam",region:"abd",tech:"percuss",t:"Percuss abdomen",cost:.5,fx:"touch",at:{x:45,y:55},sound:"percuss",b:"Resonant; no suprapubic dullness."},
    {id:"ex_abd_a",cat:"Exam",region:"abd",tech:"auscultate",t:"Bowel sounds",cost:.5,fx:"touch",at:{x:50,y:50},sound:"bowel",b:"Normal bowel sounds."},
    /* legs */
    {id:"ex_leg_i",cat:"Exam",region:"legs",tech:"inspect",t:"Inspect legs",cost:.5,fx:"touch",at:{x:52,y:45},b:"Bruising over the right knee. Legs equal in length, no external rotation."},
    {id:"ex_hips",cat:"Exam",region:"legs",tech:"special",t:"Hips: gentle passive rotation",cost:1,b:"Pain-free rotation of both hips, no shortening. A hip fracture is unlikely."},
    ...pair("tone_leg","Tone (legs)","motor","legs",{x:50,y:50},["Normal tone.","N"],["Slightly increased tone.","↑"]),
    ...pair("pow_leg","Power: hip, knee, ankle (MRC)","motor","legs",{x:50,y:45},["5/5 throughout.","5"],["4/5 hip flexion and ankle dorsiflexion.","4"]),
    ...pair("rf_knee","Knee jerk (L3–4)","hammer","legs",{x:58,y:62},["2+ normal.","2+"],["3+ brisk, spreading to the adductors.","3+"]),
    {id:"ex_sens_leg",cat:"Exam",region:"legs",tech:"pin",t:"Sensation (legs)",cost:1,b:"Light touch and pinprick grossly intact in both legs."},
    /* feet */
    ...pair("rf_ank","Ankle jerk (S1)","hammer","feet",{x:30,y:35},["1+ reduced (common at his age).","1+"],["3+ brisk.","3+"]),
    ...pair("rf_pl","Plantar response","hammer","feet",{x:62,y:58},["Flexor: toes curl down.","↓"],["Extensor: great toe goes up, toes fan.","↑"],{verb:"Stroke"}),
    ...pair("rf_clon","Ankle clonus","motor","feet",{x:35,y:45},["None.","0"],["3 beats, not sustained.","3 beats"]),
    {id:"ex_heels",cat:"Exam",region:"feet",tech:"inspect",t:"Heels & pressure areas",cost:.5,fx:"touch",at:{x:40,y:60},b:"Early non-blanching redness over the right heel from lying on the floor."},
    {id:"ex_jps",cat:"Exam",region:"feet",tech:"pin",t:"Joint position sense (great toe)",cost:.5,b:"Unreliable because of confusion."},

    /* monitoring */
    {id:"mo_ecg",cat:"Monitoring",device:"ecg",t:"Cardiac monitor leads",cost:.5},
    {id:"mo_spo2",cat:"Monitoring",device:"spo2",t:"SpO₂ probe",cost:.5},
    {id:"mo_nibp",cat:"Monitoring",device:"nibp",t:"BP cuff (NIBP)",cost:.5},
    {id:"mo_temp",cat:"Monitoring",device:"temp",t:"Tympanic temperature",cost:.5},
    {id:"dx_bsl",cat:"Monitoring",t:"Capillary glucose",short:"Glucose",cost:.5,tok:1,b:"Capillary glucose 6.8 mmol/L. Hypoglycaemia excluded.",f:"good"},
    {id:"mo_neuro",cat:"Monitoring",t:"Neuro obs every 15 min",short:"Neuro obs",cost:.5,tok:1,f:"good",b:"Nursing GCS and pupil observations every 15 minutes, escalate any drop of 1 point or more."},

    /* diagnostics */
    {id:"dx_ecg",cat:"Diagnostics",t:"12-lead ECG",short:"12-lead ECG",cost:3,tok:3,viewer:"ecg12",b:"Atrial fibrillation, rate about 88. No acute ST changes."},
    {id:"dx_ct",cat:"Diagnostics",t:"CT head (non-contrast)",short:"CT head",cost:12,tok:12,viewer:"ct",f:"warn",b:"Acute right subdural haematoma up to 12 mm, 6 mm midline shift to the left. No skull fracture."},
    {id:"dx_ctc",cat:"Diagnostics",t:"CT cervical spine",short:"CT C-spine",cost:4,tok:6,b:"No fracture or malalignment. Degenerative changes only."},
    {id:"dx_fbc",cat:"Diagnostics",t:"FBC",short:"FBC",cost:1,tok:2,delay:15,b:"Hb 128, WCC 10.4, Plt 212."},
    {id:"dx_ue",cat:"Diagnostics",t:"U&E",short:"U&E",cost:1,tok:2,delay:15,b:"Urea 11.2, creatinine 132, eGFR 44."},
    {id:"dx_coag",cat:"Diagnostics",t:"Coagulation",short:"Coag",cost:1,tok:2,delay:20,b:"PT 17.8 s, APTT 34 s. Routine clotting tests don't reliably measure rivaroxaban effect."},
    {id:"dx_xa",cat:"Diagnostics",t:"Anti-Xa (rivaroxaban level)",short:"Anti-Xa",cost:1,tok:4,delay:40,b:"Rivaroxaban level 142 ng/mL: clinically significant anticoagulation."},
    {id:"dx_ck",cat:"Diagnostics",t:"CK",short:"CK",cost:1,tok:2,delay:20,f:"warn",b:"CK 2,450 U/L: muscle breakdown from a long lie."},
    {id:"dx_gs",cat:"Diagnostics",t:"Group & save",short:"Group & save",cost:1,tok:2,delay:30,b:"Group O positive, antibody screen negative."},
    {id:"dx_cxr",cat:"Diagnostics",t:"Portable chest X-ray",short:"Chest X-ray",cost:6,tok:10,viewer:"cxr",low:"No chest signs or symptoms; it didn't change management and took 6 minutes.",b:"No acute chest findings."},
    {id:"dx_mri",cat:"Diagnostics",t:"MRI brain",short:"MRI brain",cost:0,tok:0,low:"MRI isn't the first-line test for acute head injury: it is slow, and unsafe for a deteriorating patient.",block:()=>({b:"Radiology suggests CT: MRI isn't appropriate for acute head injury or an unstable patient.",f:"warn"})},
    {id:"dx_lp",cat:"Diagnostics",t:"Lumbar puncture",short:"Lumbar puncture",cost:0,tok:0,low:"Dangerous here: suspected raised intracranial pressure and active anticoagulation.",block:()=>({b:"Your senior stops you. An LP is contraindicated with suspected raised intracranial pressure and active anticoagulation.",f:"bad"})},

    /* treatment */
    {id:"tx_iv",cat:"Treatment",device:"iv",t:"IV access",cost:2,f:"good"},
    {id:"tx_pcc",cat:"Treatment",t:"Prothrombin complex concentrate 50 units/kg IV",short:"PCC",cost:10,tok:6,needIv:true,run:S=>{S.flags.reversed=true;
      return{b:S.done.dx_ct?"Four-factor PCC infused over 10 minutes per local major-bleeding protocol. Rivaroxaban effect reversed.":"PCC given before imaging on strong clinical suspicion. Confirm the bleed on CT.",f:"good"};}},
    {id:"tx_andex",cat:"Treatment",t:"Andexanet alfa IV",short:"Andexanet",cost:10,tok:10,needIv:true,low:"In the UK, NICE (TA697) recommends andexanet for intracranial bleeds only within research. PCC is the usual choice.",
      run:S=>{S.flags.reversed=true;S.flags.andex=true;return{b:"Andexanet given. Check local policy: in the UK it is only recommended for intracranial haemorrhage within research.",f:"warn"};}},
    {id:"tx_vitk",cat:"Treatment",t:"Vitamin K 10 mg IV",short:"Vitamin K",cost:1,tok:1,needIv:true,low:"Vitamin K reverses warfarin, not rivaroxaban.",b:"Given. Vitamin K has no effect on factor Xa inhibitors.",f:"warn"},
    {id:"tx_prot",cat:"Treatment",t:"Protamine",short:"Protamine",cost:1,tok:1,needIv:true,low:"Protamine reverses heparin, not DOACs.",b:"Given. Protamine has no effect on rivaroxaban.",f:"warn"},
    {id:"tx_txa",cat:"Treatment",t:"Tranexamic acid 2 g IV",short:"Tranexamic acid",cost:1,tok:2,needIv:true,low:"Trial benefit in head injury is within 3 hours of injury; his fall was probably more than 8 hours ago.",b:"Given. Time of injury is unknown and likely beyond the window where benefit was shown.",f:"warn"},
    {id:"tx_hold",cat:"Treatment",t:"Withhold rivaroxaban",short:"Hold rivaroxaban",cost:.5,tok:0,f:"good",b:"Rivaroxaban suspended on the drug chart and flagged at handover."},
    {id:"tx_head",cat:"Treatment",t:"Head of bed up 30°",short:"Head up 30°",cost:.5,tok:0,f:"good",b:"Head of the trolley raised to 30°, neck kept neutral."},
    {id:"tx_fluids",cat:"Treatment",t:"0.9% saline 1 L (long lie, raised CK)",short:"IV fluids",cost:1,tok:2,needIv:true,repeat:true,f:"good",b:"Fluids running. Monitor urine output."},
    {id:"tx_para",cat:"Treatment",t:"Paracetamol 1 g IV",short:"Paracetamol",cost:1,tok:1,needIv:true,run:S=>{S.flags.analgesia=true;return{b:"Headache eases a little.",say:"That's… a bit better. Thank you."};}},
    {id:"tx_warm",cat:"Treatment",t:"Warm blankets",short:"Warming",cost:.5,tok:0,run:S=>{S.v.temp=Math.min(36.8,S.v.temp+.3);return{b:"Warm blankets on."};}},

    /* disposition */
    {id:"dp_ns",cat:"Disposition",t:"Refer to neurosurgery for evacuation",cost:3,end:true,f:"good",b:"Neurosurgery accept for urgent evacuation.",
      block:S=>!S.done.dx_ct&&{b:"The neurosurgical registrar asks for the CT before they can accept.",f:"warn"}},
    {id:"dp_ward",cat:"Disposition",t:"Admit to medical ward with neuro obs",cost:2,end:true,f:"bad",b:"Admitted to a general ward."},
    {id:"dp_home",cat:"Disposition",t:"Discharge home with his daughter",cost:2,end:true,f:"bad",b:"Discharged."}
  ],
  labs:{
    dx_fbc:{name:"Full blood count",rows:[["Haemoglobin","128","g/L","130–175",-1],["White cells","10.4","×10⁹/L","4.0–11.0"],["Platelets","212","×10⁹/L","150–400"]]},
    dx_ue:{name:"Urea & electrolytes",rows:[["Sodium","136","mmol/L","133–146"],["Potassium","4.8","mmol/L","3.5–5.3"],["Urea","11.2","mmol/L","2.5–7.8",1],["Creatinine","132","µmol/L","59–104",1],["eGFR","44","mL/min/1.73m²","> 60",-1]]},
    dx_coag:{name:"Coagulation",rows:[["PT","17.8","s","10–13",1],["APTT","34","s","25–36"],["Fibrinogen","3.1","g/L","1.5–4.0"]]},
    dx_xa:{name:"Anti-Xa",rows:[["Rivaroxaban (anti-Xa)","142","ng/mL","< 30 for surgery",1]]},
    dx_ck:{name:"Creatine kinase",rows:[["CK","2450","U/L","40–320",1]]},
    dx_gs:{name:"Group & save",rows:[["ABO / Rh","O pos","",""],["Antibody screen","Negative","",""]]}
  },
  viewers:{ecg12:ecgViewer,ct:ctViewer,cxr:cxrViewer,pupils:pupilViewer,gcs:gcsViewer},
  init(S){S.gcs={e:3,v:4,m:6};S.pupils={R:{mm:3,react:"brisk"},L:{mm:3,react:"brisk"}};S.det=0;},
  tick(S,api){
    if(S.flags.reversed||S.ended)return;
    if(S.t>=40&&S.det<1){S.det=1;S.gcs={e:3,v:3,m:6};S.v.sbp=180;S.v.dbp=96;
      api.log("Nurse",`“He's harder to wake and he's not making sense any more.”`,"bad");api.say("Mmh… the… the bus…","pt");}
    if(S.t>=55&&S.det<2){S.det=2;S.gcs={e:2,v:3,m:5};S.pupils.R={mm:5,react:"sluggish"};S.v.sbp=194;S.v.dbp=98;S.v.hr=58;S.v.rr=12;
      api.log("Nurse",`“His right pupil looks bigger and his heart rate's dropping.”`,"bad");}
  },
  after(S,a){if(a&&a.cat==="Talk"&&(a.who||"pt")==="pt")S.flags.talked=true;},
  appearance(S){
    const st=S.det>=1?"drowsy":S.flags.reversed&&S.flags.analgesia?"settled":"base";
    return{state:st,look:{drowsy:S.det>=2?"Barely rousable, right pupil enlarging":"Drowsy, rousable to voice",base:"Confused, repeating questions",settled:"More settled, still confused",distressed:"Agitated, pulling away"}[st]};
  },
  hud(S){return S.recGcs?`GCS ${S.recGcs.tot} recorded ${F(S.recGcs.t).slice(2)}`:"GCS not yet recorded";},
  findingsExtra(S){
    const k=id=>S.keys[id]||"–";
    const g=S.gcsLog||[];
    return `<div class="fgroup"><h4>Neurological chart</h4><div class="nfig">${figure(S)}<div>
      <table class="power"><thead><tr><th></th><th>Right</th><th>Left</th></tr></thead><tbody>
      <tr><td>Tone, arms</td><td>${k("tone_arm_R")}</td><td>${k("tone_arm_L")}</td></tr>
      <tr><td>Power, arms</td><td>${k("pow_arm_R")}</td><td>${k("pow_arm_L")}</td></tr>
      <tr><td>Tone, legs</td><td>${k("tone_leg_R")}</td><td>${k("tone_leg_L")}</td></tr>
      <tr><td>Power, legs</td><td>${k("pow_leg_R")}</td><td>${k("pow_leg_L")}</td></tr>
      <tr><td>Hoffmann's</td><td>${k("rf_hof_R")}</td><td>${k("rf_hof_L")}</td></tr>
      <tr><td>Clonus</td><td>${k("rf_clon_R")}</td><td>${k("rf_clon_L")}</td></tr>
      </tbody></table>
      <p class="sub" style="margin:8px 0 0;font-size:12px">Reflexes: 0 absent · 1+ reduced · 2+ normal · 3+ brisk · 4+ with clonus. Plantars ↑ extensor, ↓ flexor.</p>
      <p style="margin:8px 0 0;font-size:13px"><b style="color:var(--muted);font-weight:500">GCS:</b> ${g.length?g.map(x=>`${x.tot} at ${F(x.t).slice(2)}`).join(" · "):"not recorded"}</p>
      <p style="margin:4px 0 0;font-size:13px"><b style="color:var(--muted);font-weight:500">Pupils:</b> ${S.pupilRec?S.pupilRec.txt:"not checked"}</p>
      ${S.done.dx_ct?`<p style="margin:6px 0 0"><button class="btn xs" data-view="ct">Open CT head</button></p>`:""}
    </div></div></div>`;
  },
  hints:[
    S=>!S.done.dx_bsl&&"Confusion after a fall: rule out the quickest reversible cause first.",
    S=>!S.recGcs&&"Score his conscious level formally: Examine › Scalp & forehead › Glasgow Coma Scale.",
    S=>!S.pupilRec&&"Check both pupils with the pen torch, direct and consensual.",
    S=>!S.done.co_dose&&"He can't give a reliable history. Who else can tell you which blood thinner he takes, and when he last took it?",
    S=>!(S.done.rf_pl_L&&S.done.rf_pl_R)&&"Look for lateralising signs on both sides: tone, power, reflexes and plantars.",
    S=>!S.done.dx_ct&&"Anticoagulated, confused, with a focal deficit. What imaging, and how fast?",
    S=>S.done.dx_ct&&!S.flags.reversed&&"The CT shows a bleed in an anticoagulated patient. Reverse the anticoagulant.",
    S=>!S.done.dp_ns&&"Who needs to see this scan?"
  ],
  teaching:[
    "Check capillary glucose in every confused patient. Hypoglycaemia is common, quick to find and quick to fix.",
    "NICE head injury guidance: CT head within 1 hour for GCS below 13 on first assessment, GCS below 15 at 2 hours, suspected open, depressed or basal skull fracture, post-traumatic seizure, a focal neurological deficit, or more than one episode of vomiting. Consider CT for anyone on anticoagulants with a head injury even without these features.",
    "Upper motor neuron signs lateralise the lesion: pronator drift, increased tone, brisk reflexes, clonus, positive Hoffmann's, an extensor plantar, and facial weakness that spares the forehead. A right-sided bleed gives left-sided signs.",
    "Reflex grades: 0 absent, 1+ reduced, 2+ normal, 3+ brisk, 4+ very brisk with clonus. Roots: biceps and supinator C5–6, triceps C7, knee L3–4, ankle S1. Reduced ankle jerks are common in older adults, so asymmetry matters more than the absolute grade.",
    "For rivaroxaban- or apixaban-associated intracranial haemorrhage in the UK, give four-factor PCC per local protocol. NICE recommends andexanet alfa for intracranial bleeds only within research. Vitamin K and protamine don't reverse factor Xa inhibitors.",
    "A falling GCS, a dilating pupil on the side of the haematoma, rising blood pressure and a falling heart rate point to rising intracranial pressure. Involve neurosurgery as soon as the scan shows a significant subdural with midline shift.",
    "A long lie needs a CK, a pressure-area check and a hip examination. Ask the family when the patient was last seen well.",
    "With an anticoagulated patient, the collateral history should pin down the drug, the dose and the time of the last dose. It guides reversal."
  ],
  transferText:{dp_ns:"Neurosurgery accept. Stefan is transferred for urgent evacuation of the haematoma…",dp_ward:"Transferring to a general medical ward…",dp_home:"Elena is asked to take her father home…"},
  score(S){
    const d=S.done,at=S.at,rows=[];const add=(ok,label,detail,pts,max)=>rows.push({ok,label,detail,pts,max});
    add(d.dx_bsl?"ok":"no","Capillary glucose checked",d.dx_bsl?`At ${F(at.dx_bsl)}`:"Not checked",d.dx_bsl?10:0,10);
    const anyOk=(S.gcsLog||[]).some(x=>x.ok);
    add(S.recGcs?(anyOk?"ok":"meh"):"no","GCS formally scored",S.recGcs?(anyOk?"Scored correctly":"Scored, but not matching the findings"):"Not recorded",S.recGcs?(anyOk?10:5):0,10);
    add(S.pupilRec?"ok":"no","Pupils checked",S.pupilRec?`At ${F(S.pupilRec.t)}`:"Not checked",S.pupilRec?10:0,10);
    const pl=d.rf_pl_L&&d.rf_pl_R,motor=d.ex_drift||(d.pow_arm_L&&d.pow_arm_R)||(d.pow_leg_L&&d.pow_leg_R);
    add(pl&&motor?"ok":(pl||motor?"meh":"no"),"Looked for lateralising signs",[pl&&"plantars both sides",motor&&"drift or power both sides"].filter(Boolean).join(", ")||"Not examined",pl&&motor?10:(pl||motor?5:0),10);
    add(d.co_dose?"ok":(d.co_meds?"meh":"no"),"Collateral: anticoagulant and last dose",d.co_dose?"Rivaroxaban 20 mg, last dose 18:00":d.co_meds?"Drug known, dose timing not asked":"Not obtained",d.co_dose?10:(d.co_meds?5:0),10);
    if(d.dx_ct){const ok=at.dx_ct<=60;add(ok?"ok":"meh","CT head within 1 hour",`Scanned at ${F(at.dx_ct)}`,ok?20:10,20);}else add("no","CT head within 1 hour","No CT",0,20);
    const rev=d.tx_pcc?["ok","PCC given",15]:d.tx_andex?["meh","Andexanet given (research-only for ICH in the UK)",12]:["no",d.tx_vitk||d.tx_prot?"Ineffective agent given":"Not reversed",0];
    add(rev[0],"Anticoagulation reversed",rev[1],rev[2],15);
    add(S.outcome==="dp_ns"?"ok":"no","Neurosurgical referral",S.outcome==="dp_ns"?`At ${F(at.dp_ns)}`:S.outcome==="dp_ward"?"Admitted to a general ward":S.outcome==="dp_home"?"Discharged":"Not referred",S.outcome==="dp_ns"?15:0,15);
    return{rows,great:"Strong run. Found the bleed, reversed the anticoagulant and got him to neurosurgery.",
      outcome:S.det>=2?"He deteriorated with signs of raised intracranial pressure before reversal.":S.det===1?"His GCS dropped before reversal.":""};
  }
};
})());
