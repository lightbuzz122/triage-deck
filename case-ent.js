/* Case: 23-year-old with a left peritonsillar abscess (quinsy). ENT syllabus topic 12. */
(window.CASEDEFS=window.CASEDEFS||[]).push((function(){
const IMG="img/ent/";
const LEADS={I:{r:.6,s:.1,t:.15},II:{r:1,t:.25},III:{r:.45,t:.12},aVR:{r:.7,t:.2,inv:1},aVL:{r:.3,s:.15,t:.08},aVF:{r:.7,t:.2},
  V1:{r:.15,s:.9,q:0,t:-.05},V2:{r:.3,s:1,q:0,t:.25},V3:{r:.6,s:.6,t:.3},V4:{r:1.1,s:.35,t:.3},V5:{r:1,s:.2,t:.28},V6:{r:.8,s:.1,t:.22}};
const F=t=>`T+${String(Math.floor(t)).padStart(2,"0")}:${String(Math.round((t%1)*60)).padStart(2,"0")}`;

/* ---------- oropharynx (photo): viewer faces the patient, so the patient's left is on the viewer's right ---------- */
function oroPhoto(o){
  const filt=o.depressor?"none":"blur(6px) brightness(.55)";
  return `<div style="position:relative;max-width:640px;margin:0 auto;border-radius:10px;overflow:hidden;aspect-ratio:876/562;background:#000">
    <img src="${IMG}oro.jpg" alt="View into the mouth" style="width:100%;height:100%;object-fit:cover;display:block;filter:${filt};transition:filter .5s">
    ${o.depressor?"":`<div style="position:absolute;inset:auto 0 18% 0;text-align:center;color:#fff;font-family:var(--mono);font-size:12px;opacity:${o.torch?1:0}">The tongue is in the way</div>`}
    <div style="position:absolute;inset:0;background:${o.torch?`radial-gradient(circle at ${o.lx??55}% ${o.ly??40}%,rgba(255,246,220,.18),rgba(0,0,0,0) 45%,rgba(0,0,0,.35))`:"rgba(0,0,0,.86)"};transition:background .4s;pointer-events:none"></div>
    ${o.mark?`<span style="position:absolute;left:${o.mark.x}%;top:${o.mark.y}%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:3px solid ${o.mark.ok?"#22C55E":"#F6B73C"};box-shadow:0 0 0 3px rgba(0,0,0,.35)"></span>`:""}
  </div>
  <div style="display:flex;justify-content:space-between;max-width:640px;margin:6px auto 0;font-family:var(--mono);font-size:12px;color:var(--muted)"><span>← patient's right</span><span>patient's left →</span></div>`;
}
function oroViewer(body,S,api){
  const st={torch:false,depressor:false,lx:55,ly:40};
  const draw=()=>{
    body.querySelector("#oro").innerHTML=oroPhoto(st);
    body.querySelector("#bTorch").textContent=st.torch?"Torch off":"Shine torch";
    body.querySelector("#bDep").textContent=st.depressor?"Remove tongue depressor":"Insert tongue depressor";
    body.querySelector("#quiz").hidden=!(st.torch&&st.depressor);
    body.querySelector("#hint").textContent=!st.torch?"It's dark in there. Shine the torch.":!st.depressor?"The tongue hides the tonsils. Use the tongue depressor.":"Move the torch over the view. Look at the soft palate, the uvula and both tonsils.";
  };
  body.innerHTML=`<div id="oro" style="cursor:crosshair"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn sm primary" id="bTorch">Shine torch</button><button class="btn sm primary" id="bDep">Insert tongue depressor</button><span class="sub" id="hint"></span></div>
    <div class="interp" id="quiz" hidden><div class="label">Your read</div><p>Which side is the swelling on?</p>
      <p style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn xs" data-side="R">Patient's right</button><button class="btn xs" data-side="L">Patient's left</button><button class="btn xs" data-side="B">Both / neither</button></p><p id="qres"></p></div>`;
  body.querySelector("#oro").addEventListener("pointermove",e=>{if(!st.torch)return;const r=e.currentTarget.firstElementChild.getBoundingClientRect();st.lx=Math.round((e.clientX-r.left)/r.width*100);st.ly=Math.round((e.clientY-r.top)/r.height*100);
    const ov=e.currentTarget.querySelector("div>div:last-of-type");const L=e.currentTarget.firstElementChild.lastElementChild;if(L)L.style.background=`radial-gradient(circle at ${st.lx}% ${st.ly}%,rgba(255,246,220,.18),rgba(0,0,0,0) 45%,rgba(0,0,0,.35))`;});
  body.querySelector("#bTorch").onclick=()=>{st.torch=!st.torch;draw();};
  body.querySelector("#bDep").onclick=()=>{
    st.depressor=!st.depressor;
    if(st.depressor&&!S.flags.gagged){S.flags.gagged=true;api.transient("distressed",3500);api.say("Aagh… careful… it hurts to open.","pt");}
    draw();
  };
  body.querySelector("#quiz").onclick=e=>{const b=e.target.closest("[data-side]");if(!b)return;
    const ok=b.dataset.side==="L";S.flags.sideAnswered=true;if(ok)S.flags.sideRight=true;
    const txt="Red, bulging soft palate above the left tonsil, which is swollen and pushed towards the midline. Uvula displaced slightly to the right, away from the swelling. Exudate on both tonsils. Mouth opening limited by trismus.";
    S.results.ex_oro=txt;S.keys.ex_oro="L quinsy";
    body.querySelector("#qres").innerHTML=ok?`<b style="color:var(--good)">Correct.</b> ${txt}`:`<b style="color:var(--warn)">Look again.</b> Compare the soft palate above each tonsil. Viewed from the front, the patient's left is on your right, and the uvula is pushed away from the swelling.`;
    if(ok)api.log("Oropharynx",txt,"warn");
  };
  draw();
  return "Oropharynx · torch and tongue depressor";
}

/* ---------- otoscopy (photos) ---------- */
function otoViewer(body,S,api){
  let ear="R";const seen={};
  body.innerHTML=`<div style="display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:16px;align-items:start">
    <div id="otoWin" style="position:relative;width:100%;max-width:340px;aspect-ratio:1;border-radius:50%;overflow:hidden;background:#000;cursor:crosshair;box-shadow:0 0 0 6px #111,0 12px 30px rgba(0,0,0,.6)">
      <img id="otoImg" src="${IMG}tm_right.jpg" alt="Right eardrum through the otoscope" style="position:absolute;inset:-8%;width:116%;height:116%;object-fit:cover;transition:transform .12s ease-out">
      <div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(0,0,0,0) 58%,rgba(0,0,0,.9) 72%);pointer-events:none"></div>
    </div>
    <div class="interp"><div class="label" id="earLbl">Right ear</div><p>Move the pointer over the view to angle the speculum. Find the handle of the malleus and the cone of light.</p>
    <p style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn xs" data-ear="R" aria-pressed="true">Right ear</button><button class="btn xs" data-ear="L" aria-pressed="false">Left ear</button></p>
    <p id="ores" class="sub"></p></div></div>`;
  const win=body.querySelector("#otoWin"),img=body.querySelector("#otoImg");
  win.addEventListener("pointermove",e=>{const r=win.getBoundingClientRect();const x=((e.clientX-r.left)/r.width-.5)*-14,y=((e.clientY-r.top)/r.height-.5)*-14;img.style.transform=`translate(${x}%,${y}%) scale(1.04)`;});
  win.addEventListener("pointerleave",()=>img.style.transform="");
  const mark=()=>{seen[ear]=true;
    body.querySelector("#ores").textContent=seen.R&&seen.L?"Both drums intact and pearly grey, handle of the malleus visible, normal light reflex. Her ear pain is referred from the throat.":"Now look at the other ear.";
    if(seen.R&&seen.L){S.results.ex_oto="Both tympanic membranes intact, pearly grey, normal light reflex. Otalgia is referred (glossopharyngeal nerve).";S.keys.ex_oto="normal";S.flags.otoDone=true;}};
  body.querySelector(".interp").onclick=e=>{const b=e.target.closest("[data-ear]");if(!b)return;ear=b.dataset.ear;
    body.querySelectorAll("[data-ear]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.ear===ear));
    img.src=IMG+(ear==="R"?"tm_right.jpg":"tm_left.jpg");img.alt=(ear==="R"?"Right":"Left")+" eardrum through the otoscope";
    body.querySelector("#earLbl").textContent=ear==="R"?"Right ear":"Left ear";mark();};
  mark();
  return "Otoscopy";
}

/* ---------- needle aspiration (photo) ---------- */
function aspViewer(body,S,api){
  const prep={consent:!!S.flags.consent,la:!!S.flags.la,needle:!!S.flags.needle};
  let mark=null;
  const ready=()=>prep.consent&&prep.la&&prep.needle;
  const draw=()=>{
    body.querySelector("#asp").innerHTML=oroPhoto({torch:true,depressor:true,mark});
    body.querySelectorAll("[data-prep]").forEach(b=>b.setAttribute("aria-pressed",prep[b.dataset.prep]));
    body.querySelector("#ahint").textContent=S.flags.drained?"Drained.":ready()?"Click the point you'd aspirate.":"Complete the preparation first.";
  };
  body.innerHTML=`<div class="interp"><div class="label">Prepare</div><p style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn xs" data-prep="consent">Explain and consent</button><button class="btn xs" data-prep="la">Topical anaesthetic spray</button><button class="btn xs" data-prep="needle">Guarded 18G needle on a 10 mL syringe</button></p></div>
    <div id="asp" style="cursor:crosshair"></div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="sub" id="ahint"></span><span id="syr" style="flex:1;min-width:160px;height:14px;border-radius:7px;background:var(--panel-2);border:1px solid var(--line);overflow:hidden"><i style="display:block;height:100%;width:${S.flags.drained?70:0}%;background:#d9c35a;transition:width 1.4s"></i></span></div>
    <p id="ares" style="margin:0"></p>`;
  body.querySelector(".interp").onclick=e=>{const b=e.target.closest("[data-prep]");if(!b)return;const k=b.dataset.prep;prep[k]=true;S.flags[k]=true;
    if(k==="consent")api.say("Okay… just please be quick.","pt");if(k==="la")api.say("Tastes like bananas… my throat's gone numb.","pt");draw();};
  body.querySelector("#asp").onclick=e=>{
    if(S.flags.drained||!ready())return;
    const box=body.querySelector("#asp>div"),r=box.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
    S.flags.aspTries=(S.flags.aspTries||0)+1;api.transient("distressed",3000);
    const d=Math.hypot((x-61)/9,(y-32)/9);
    let msg,ok=false;
    if(d<=1){ok=true;S.flags.drained=true;S.pain=4;msg=`<b style="color:var(--good)">Pus.</b> 4 mL of thick, foul-smelling pus from the superior pole. Sent for culture.`;
      api.say("Oh… that's so much better already.","pt");api.log("Needle aspiration","4 mL pus aspirated from the left superior pole. Sent for culture.","good");
      setTimeout(()=>{const i=body.querySelector("#syr i");if(i)i.style.width="70%";},30);}
    else if(x>77){S.flags.unsafe=true;msg=`<b style="color:var(--bad)">Stop.</b> Too lateral: the internal carotid artery lies posterolateral to the tonsil. Your senior stops you. Aim medially, at the point of maximal swelling.`;api.log("Needle aspiration","Unsafe lateral approach stopped by senior.","bad");}
    else if(x<46){msg=`<b style="color:var(--warn)">Dry tap.</b> That's the midline or the less affected side.`;}
    else if(y>48){msg=`<b style="color:var(--warn)">Dry tap.</b> Too low, into the tonsil itself. Pus usually sits at the superior pole of the bulge.`;}
    else{msg=`<b style="color:var(--warn)">Dry tap.</b> Close. Aim at the point of maximal bulge in the soft palate above the tonsil.`;}
    mark={x,y,ok};draw();body.querySelector("#ares").innerHTML=msg;
  };
  draw();
  return "Needle aspiration · left peritonsillar space";
}

return {
  id:"ent-01",title:"Can't swallow her own saliva",specialty:"ENT",setting:"Emergency dept",acuity:2,mins:"12–15",
  blurb:"A 23-year-old with five days of sore throat, now worse on one side, drooling and struggling to open her mouth.",
  thumb:IMG+"base.jpg",bed:"MAJORS 6 · ADULT",
  patient:{name:"Mia Byrne",first:"Mia",meta:"23 F · walk-in, GP letter",label:"BYRNE, Mia · 23 F",cc:"(muffled) My throat… I can't swallow anything. Not even my spit."},
  arrival:"Walked in with a GP letter: 'tonsillitis, not improving on penicillin V'. Talking in a muffled voice and holding tissues. Moved to majors 6.",
  dx:"Left peritonsillar abscess (quinsy)",budget:45,
  vitals:{hr:108,sbp:118,dbp:72,rr:18,spo2:98,temp:38.6,rhythm:"sinus"},
  monitorLead:LEADS.II,
  views:{bedside:{label:"Bedside",aspect:"718/700",
    states:{base:IMG+"base.jpg",distressed:IMG+"distressed.jpg",worse:IMG+"worse.jpg",settled:IMG+"settled.jpg"},
    markers:{face:{x:50,y:22},ear:{x:67,y:45},nose:{x:49,y:42},mouth:{x:50,y:54},neck:{x:65,y:61},chest:{x:72,y:86}}}},
  regions:{
    face:{name:"Face & airway",close:IMG+"z_face.jpg",scale:2.2,talk:true,hint:"look, listen, airway"},
    ear:{name:"Ears",close:IMG+"z_ear.jpg",scale:3,hint:"otoscope, tuning fork"},
    nose:{name:"Nose",close:IMG+"z_nose.jpg",scale:3,hint:"anterior rhinoscopy"},
    mouth:{name:"Mouth & throat",close:IMG+"z_mouth.jpg",scale:3,hint:"torch, tongue depressor"},
    neck:{name:"Neck",close:IMG+"z_neck.jpg",scale:2.6,hint:"lymph nodes"},
    chest:{name:"Chest & arms",close:IMG+"z_chest.jpg",scale:2,hint:"lungs, monitoring, IV"}
  },
  regionOrder:["face","mouth","ear","nose","neck","chest"],
  deviceRegion:{ecg:"chest",spo2:"chest",nibp:"chest",temp:"ear",o2:"mouth",iv:"chest"},
  deviceText:{ecg:"3-lead monitoring attached. Sinus tachycardia.",spo2:"Finger probe on.",nibp:"Cuff on the left arm, cycling every 5 min.",temp:S=>`Tympanic temperature ${S.v.temp.toFixed(1)} °C.`,
    o2:"Mask applied. SpO₂ was 98% on air; oxygen isn't needed.",iv:"20G cannula in the right antecubital fossa. Bloods drawn."},
  talkTo:[{who:"pt",name:"Mia"}],
  tray:[{id:"ex_oro",icon:"ecg12"},{id:"dx_fbc",icon:"labs"},{id:"dx_ct",icon:"ct"}],
  actions:[
    {id:"pt_hist",cat:"Talk",t:"How long has your throat been sore?",cost:1,say:"Five days. It was both sides, now it's much worse on the left.",b:"Five days of sore throat, now predominantly left-sided."},
    {id:"pt_swallow",cat:"Talk",t:"Can you swallow?",cost:.5,say:"Not really. I can't even swallow my spit. I haven't eaten in two days.",b:"Odynophagia and dysphagia to saliva. Poor oral intake for two days."},
    {id:"pt_ear",cat:"Talk",t:"Any pain anywhere else?",cost:.5,say:"My left ear is killing me too.",b:"Left otalgia."},
    {id:"pt_open",cat:"Talk",t:"Can you open your mouth wide for me?",cost:.5,say:"It hurts to open… this is as far as it goes.",b:"Painful, limited mouth opening."},
    {id:"pt_breath",cat:"Talk",t:"Any trouble breathing, or noisy breathing?",cost:.5,say:"No, it just feels like something's stuck back there.",b:"No breathlessness or noisy breathing reported."},
    {id:"pt_gp",cat:"Talk",t:"Have you seen anyone about it already?",cost:.5,say:"The GP gave me penicillin tablets two days ago. They haven't helped and I can barely get them down.",b:"Penicillin V from the GP for 2 days, without improvement."},
    {id:"pt_pmh",cat:"Talk",t:"Any medical problems, medicines or allergies?",cost:.5,say:"No, I'm healthy. Just the pill. No allergies.",b:"Fit and well. Combined oral contraceptive. No known drug allergies."},
    {id:"pt_prev",cat:"Talk",t:"Have you had anything like this before?",cost:.5,say:"Tonsillitis loads of times. Never this bad.",b:"Recurrent tonsillitis; no previous quinsy."},
    {id:"pt_soc",cat:"Talk",t:"Do you smoke, vape or drink?",cost:.5,say:"I vape a bit. Drink at weekends.",b:"Vapes. Alcohol at weekends."},

    {id:"ex_gen",cat:"Exam",region:"face",tech:"inspect",t:"General appearance & voice",cost:.5,fx:"touch",at:{x:50,y:62},b:"Flushed and unwell. Sitting upright, leaning slightly forward, catching saliva in a tissue. Muffled 'hot potato' voice."},
    {id:"ex_airway",cat:"Exam",region:"face",tech:"special",t:"Airway: stridor, drooling, posture",cost:1,f:"good",b:"No stridor or stertor. Speaking in full (muffled) sentences, lying back is tolerated, SpO₂ normal. Airway currently safe; drooling is from painful swallowing."},
    {id:"ex_trismus",cat:"Exam",region:"face",tech:"special",t:"Measure mouth opening",cost:.5,fx:"touch",at:{x:50,y:78},k:"2 cm",b:"Interincisal opening about 2 cm (two fingers): trismus."},
    {id:"ex_oro",cat:"Exam",region:"mouth",tech:"torch",t:"Oropharynx: torch & tongue depressor",short:"Oropharynx",verb:"Look",cost:1,viewer:"oro",fx:"torch",at:{x:50,y:52},run:()=>({b:"Torch and tongue depressor ready."})},
    {id:"ex_teeth",cat:"Exam",region:"mouth",tech:"inspect",t:"Teeth & floor of mouth",cost:.5,fx:"touch",at:{x:50,y:60},b:"Good dentition. Floor of mouth soft, no submandibular swelling: not Ludwig's angina."},
    {id:"ex_oto",cat:"Exam",region:"ear",tech:"otoscope",t:"Otoscopy, both ears",cost:1,viewer:"oto",fx:"torch",at:{x:45,y:48},run:()=>({b:"Otoscope ready."})},
    {id:"ex_ear_i",cat:"Exam",region:"ear",tech:"inspect",t:"Pinnae & mastoids",cost:.5,fx:"touch",at:{x:45,y:48},b:"Pinnae normal. No mastoid tenderness, swelling or redness."},
    {id:"ex_tf",cat:"Exam",region:"ear",tech:"special",t:"Rinne & Weber (512 Hz)",cost:1,b:"Rinne positive both sides; Weber central. No conductive hearing loss."},
    {id:"ex_nose",cat:"Exam",region:"nose",tech:"torch",t:"Anterior rhinoscopy",cost:.5,fx:"torch",at:{x:50,y:62},b:"Septum midline, healthy mucosa, no discharge or bleeding."},
    {id:"ex_nodes",cat:"Exam",region:"neck",tech:"palpate",t:"Cervical lymph nodes",cost:1,fx:"touch",at:{x:62,y:42},k:"L II",b:"Tender, enlarged left jugulodigastric (level II) node. No fluctuant neck swelling."},
    {id:"ex_neck_i",cat:"Exam",region:"neck",tech:"inspect",t:"Neck swelling & movement",cost:.5,fx:"touch",at:{x:50,y:45},b:"No external neck swelling and full neck movement, no torticollis. Deep neck space spread is less likely."},
    {id:"ex_trachea",cat:"Exam",region:"neck",tech:"palpate",t:"Trachea",cost:.5,b:"Trachea central."},
    {id:"ex_lungs",cat:"Exam",region:"chest",tech:"auscultate",t:"Breath sounds",cost:1,fx:"touch",at:{x:40,y:50},sound:"breath",b:"Clear, no added sounds."},
    {id:"ex_heart",cat:"Exam",region:"chest",tech:"auscultate",t:"Heart sounds",cost:1,fx:"touch",at:{x:58,y:50},sound:"heart",b:"Tachycardic, regular, heart sounds normal, no murmurs."},

    {id:"mo_ecg",cat:"Monitoring",device:"ecg",t:"Cardiac monitor leads",cost:.5},
    {id:"mo_spo2",cat:"Monitoring",device:"spo2",t:"SpO₂ probe",cost:.5},
    {id:"mo_nibp",cat:"Monitoring",device:"nibp",t:"BP cuff (NIBP)",cost:.5},
    {id:"mo_temp",cat:"Monitoring",device:"temp",t:"Tympanic temperature",cost:.5},

    {id:"dx_fbc",cat:"Diagnostics",t:"FBC",short:"FBC",cost:1,tok:2,delay:15,b:"WCC 18.2, neutrophils 15.1. Hb 132, Plt 310."},
    {id:"dx_crp",cat:"Diagnostics",t:"CRP",short:"CRP",cost:1,tok:2,delay:15,b:"CRP 142 mg/L."},
    {id:"dx_ue",cat:"Diagnostics",t:"U&E",short:"U&E",cost:1,tok:2,delay:15,b:"Urea 7.9 (raised: dehydration), creatinine 72, Na 137, K 3.9."},
    {id:"dx_mono",cat:"Diagnostics",t:"Monospot (glandular fever)",short:"Monospot",cost:1,tok:2,delay:20,b:"Negative."},
    {id:"dx_bc",cat:"Diagnostics",t:"Blood cultures",short:"Blood cultures",cost:1,tok:2,b:"Taken before antibiotics. Results will follow after admission."},
    {id:"dx_vbg",cat:"Diagnostics",t:"Venous blood gas + lactate",short:"VBG",cost:1,tok:2,b:"pH 7.39, lactate 1.4 mmol/L, glucose 5.8."},
    {id:"dx_ct",cat:"Diagnostics",t:"CT neck with contrast",short:"CT neck",cost:30,tok:12,low:"Not needed when the diagnosis is clear on examination and drainage is possible. Keep CT for doubt, failed drainage or suspected deep neck space spread.",
      b:"2.6 cm rim-enhancing collection in the left peritonsillar space. No parapharyngeal or retropharyngeal extension. Airway patent."},
    {id:"dx_fne",cat:"Diagnostics",t:"Flexible nasendoscopy (ENT)",short:"Nasendoscopy",cost:5,tok:4,b:"Nasopharynx, supraglottis and larynx normal. Airway patent; no epiglottitis."},

    {id:"tx_iv",cat:"Treatment",device:"iv",t:"IV access & bloods",cost:2,f:"good"},
    {id:"tx_fluids",cat:"Treatment",t:"IV fluids: Hartmann's 1 L",short:"IV fluids",cost:1,tok:2,needIv:true,repeat:true,f:"good",run:S=>{S.flags.fluids=true;S.v.hr=Math.max(92,S.v.hr-6);return{b:"Fluids running."};}},
    {id:"tx_benpen",cat:"Treatment",t:"Benzylpenicillin 1.2 g IV + metronidazole 500 mg IV",short:"IV penicillin + metronidazole",cost:1,tok:4,needIv:true,f:"good",run:S=>{S.flags.abx="ok";return{b:"First doses given. Covers streptococci and anaerobes."};}},
    {id:"tx_coamox",cat:"Treatment",t:"Co-amoxiclav 1.2 g IV",short:"IV co-amoxiclav",cost:1,tok:4,needIv:true,f:"good",run:S=>{S.flags.abx="ok";return{b:"First dose given. Covers streptococci and anaerobes. Check local policy and the Monospot: amoxicillin can cause a rash in glandular fever."};}},
    {id:"tx_penv",cat:"Treatment",t:"Continue oral penicillin V",short:"Oral penicillin V",cost:.5,tok:1,low:"She's failing oral treatment and can't swallow; she needs IV antibiotics.",run:S=>{if(!S.flags.abx)S.flags.abx="oral";return{b:"She can't get the tablets down.",f:"warn",say:"I can't swallow these…"};}},
    {id:"tx_para",cat:"Treatment",t:"Paracetamol 1 g IV",short:"Paracetamol",cost:1,tok:1,needIv:true,run:S=>{S.flags.analgesia=true;S.pain=Math.max(S.flags.drained?3:6,S.pain-2);return{b:`Pain ${S.pain}/10.`};}},
    {id:"tx_dex",cat:"Treatment",t:"Dexamethasone 8 mg IV (single dose)",short:"Dexamethasone",cost:.5,tok:1,needIv:true,f:"good",run:S=>{S.flags.dex=true;return{b:"Given. A single steroid dose can reduce pain and trismus."};}},
    {id:"tx_spray",cat:"Treatment",t:"Benzydamine throat spray",short:"Throat spray",cost:.5,tok:1,run:S=>{S.flags.analgesia=true;S.pain=Math.max(S.flags.drained?3:6,S.pain-1);return{b:"Some relief swallowing."};}},
    {id:"tx_asp",cat:"Treatment",t:"Needle aspiration of the abscess",short:"Needle aspiration",cost:5,tok:4,viewer:"aspir",req:"ex_oro",reqMsg:"Examine the oropharynx first so you know where to aspirate.",run:()=>({b:"Aspiration kit set up."})},
    {id:"tx_id",cat:"Treatment",t:"ENT registrar: incision & drainage",short:"Incision & drainage",cost:20,tok:6,req:"ex_oro",reqMsg:"ENT ask what you found in the oropharynx first.",run:(S,api)=>{S.flags.drained=true;S.flags.id=true;S.pain=4;return{b:"ENT incise the left peritonsillar bulge; 6 mL of pus drained and sent for culture.",f:"good",say:"Ugh… but I can actually swallow now."};}},

    {id:"dp_ent",cat:"Disposition",t:"Admit under ENT",cost:2,end:true,f:"good",b:"ENT accept for IV antibiotics, fluids, analgesia and review."},
    {id:"dp_tons",cat:"Disposition",t:"List for emergency tonsillectomy",cost:2,end:true,f:"warn",b:"Listed for quinsy tonsillectomy."},
    {id:"dp_home",cat:"Disposition",t:"Discharge with oral antibiotics",cost:2,end:true,f:"bad",b:"Discharged."}
  ],
  labs:{
    dx_fbc:{name:"Full blood count",rows:[["White cells","18.2","×10⁹/L","4.0–11.0",1],["Neutrophils","15.1","×10⁹/L","2.0–7.5",1],["Haemoglobin","132","g/L","115–165"],["Platelets","310","×10⁹/L","150–400"]]},
    dx_crp:{name:"CRP",rows:[["CRP","142","mg/L","< 5",1]]},
    dx_ue:{name:"Urea & electrolytes",rows:[["Sodium","137","mmol/L","133–146"],["Potassium","3.9","mmol/L","3.5–5.3"],["Urea","7.9","mmol/L","2.5–7.8",1],["Creatinine","72","µmol/L","45–84"]]},
    dx_mono:{name:"Monospot",rows:[["Heterophile antibody","Negative","",""]]}
  },
  viewers:{oro:oroViewer,oto:otoViewer,aspir:aspViewer},
  init(S){S.pain=8;},
  tick(S,api){
    if(S.ended)return;
    if(!S.flags.abx&&!S.flags.drained&&S.t>=40&&!S.flags.worse){S.flags.worse=true;S.v.temp=39.2;S.v.hr=118;
      api.log("Nurse","“She's spiking a temperature and can't keep anything down.”","bad");}
    if(S.flags.abx==="ok"&&S.v.temp>37.6)S.v.temp=Math.max(37.6,S.v.temp-.03);
    if(S.flags.drained&&S.v.hr>96)S.v.hr-=.5;
  },
  after(S,a){},
  appearance(S){const st=S.flags.drained?"settled":S.flags.worse&&!S.flags.abx?"worse":"base";return{state:st,look:S.flags.drained?"More comfortable, swallowing sips":S.flags.worse?"Rigoring, drooling, miserable":"Flushed, drooling, sitting forward"};},
  hud(S){return `Pain ${S.pain}/10 · ${S.v.temp.toFixed(1)} °C`;},
  hints:[
    S=>!S.done.ex_airway&&"Before anything else: is her airway safe?",
    S=>!S.done.ex_oro&&"Look in her mouth properly: torch and tongue depressor.",
    S=>S.done.ex_oro&&!S.flags.sideRight&&"Which side is bulging, and which way does the uvula point?",
    S=>!S.flags.abx&&"She can't swallow tablets. How will she get antibiotics and fluids?",
    S=>!S.flags.drained&&"Antibiotics alone rarely fix a collection. What drains it?",
    S=>!S.done.dp_ent&&"Who should she be admitted under?"
  ],
  teaching:[
    "A peritonsillar abscess (quinsy) is pus between the tonsil capsule and the superior constrictor muscle, usually after acute tonsillitis in teenagers and young adults.",
    "Classic signs: one-sided throat pain, fever, trismus, a muffled 'hot potato' voice, drooling, referred ear pain, and a bulging soft palate above the tonsil with the uvula pushed away from the swollen side.",
    "Assess the airway first. Stridor, inability to lie flat, neck swelling or torticollis suggest spread into the parapharyngeal or retropharyngeal space and need urgent ENT and anaesthetic input.",
    "Management: IV fluids, analgesia, IV antibiotics covering streptococci and anaerobes (for example benzylpenicillin with metronidazole, or co-amoxiclav per local policy) and drainage by needle aspiration or incision. A single steroid dose is often given to ease pain and trismus.",
    "Needle aspiration: topical anaesthetic, a guarded needle no deeper than about 1 cm, aimed at the point of maximal swelling at the superior pole. Never go lateral: the internal carotid artery lies posterolateral to the tonsil.",
    "Ear pain with normal ears is referred pain via the glossopharyngeal nerve. A normal drum is pearly grey, with the handle of the malleus and a cone of light anteroinferiorly (5 o'clock in the right ear, 7 o'clock in the left).",
    "CT neck with contrast is for diagnostic doubt, failed drainage or suspected deep neck space spread, not routine quinsy.",
    "Amoxicillin can cause a rash in glandular fever, so check the Monospot or prefer penicillin. Tonsillectomy is usually considered later, after recurrent quinsy, rather than as an emergency."
  ],
  transferText:{dp_ent:"ENT accept. Mia goes up to the ward with IV antibiotics running…",dp_tons:"Mia is listed for theatre…",dp_home:"Mia is sent home with a prescription…"},
  score(S){
    const d=S.done,at=S.at,f=S.flags,rows=[];const add=(ok,label,detail,pts,max)=>rows.push({ok,label,detail,pts,max});
    add(d.ex_airway?"ok":"no","Airway assessed",d.ex_airway?`At ${F(at.ex_airway)}`:"Not formally assessed",d.ex_airway?10:0,10);
    add(d.mo_temp&&d.mo_nibp?"ok":(d.mo_temp||d.mo_nibp?"meh":"no"),"Observations including temperature",[d.mo_temp&&"temperature",d.mo_nibp&&"blood pressure"].filter(Boolean).join(", ")||"Not done",d.mo_temp&&d.mo_nibp?5:(d.mo_temp||d.mo_nibp?3:0),5);
    add(f.sideRight?"ok":(d.ex_oro?"meh":"no"),"Oropharynx examined, side identified",f.sideRight?"Left quinsy identified":d.ex_oro?"Examined, side not identified":"Not examined",f.sideRight?15:(d.ex_oro?8:0),15);
    add(f.otoDone?"ok":"no","Ears examined (referred otalgia)",f.otoDone?"Both drums normal":"Not examined",f.otoDone?5:0,5);
    add(d.ex_nodes?"ok":"no","Neck nodes palpated",d.ex_nodes?"Left level II node":"Not done",d.ex_nodes?5:0,5);
    add(d.tx_iv&&f.fluids?"ok":(d.tx_iv?"meh":"no"),"IV access and fluids",d.tx_iv&&f.fluids?"Cannulated, fluids running":d.tx_iv?"Cannulated, no fluids":"Not done",d.tx_iv&&f.fluids?10:(d.tx_iv?5:0),10);
    add(f.abx==="ok"?"ok":(f.abx==="oral"?"meh":"no"),"IV antibiotics",f.abx==="ok"?"Streptococcal and anaerobic cover":f.abx==="oral"?"Oral only":"None given",f.abx==="ok"?15:(f.abx==="oral"?3:0),15);
    add(f.drained?(f.unsafe?"meh":"ok"):"no","Abscess drained",f.drained?(f.id?"Incision and drainage":`Needle aspiration${f.aspTries>1?` (${f.aspTries} attempts)`:""}`)+(f.unsafe?", after an unsafe lateral attempt":""):"Not drained",f.drained?(f.unsafe?12:20):0,20);
    add(f.analgesia?"ok":"no","Analgesia",f.analgesia?"Given":"None given",f.analgesia?5:0,5);
    add(S.outcome==="dp_ent"?"ok":(S.outcome==="dp_tons"?"meh":"no"),"Admitted under ENT",S.outcome==="dp_ent"?`At ${F(at.dp_ent)}`:S.outcome==="dp_tons"?"Listed for emergency tonsillectomy":S.outcome==="dp_home"?"Discharged":"Not admitted",S.outcome==="dp_ent"?10:(S.outcome==="dp_tons"?4:0),10);
    return{rows,great:"Strong run. Safe airway, the right side, drained and admitted.",outcome:f.worse&&!f.abx?"She became septic waiting for treatment.":""};
  }
};
})());
