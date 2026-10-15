/* Case: inferior STEMI with RV involvement */
(window.CASEDEFS=window.CASEDEFS||[]).push((function(){
const LEADS={I:{r:.55,s:.1,t:.12,st:-.12},II:{r:1,t:.25,st:.28},III:{r:.85,t:.3,st:.36},aVR:{r:.7,t:.2,st:.08,inv:1},aVL:{r:.35,s:.15,t:-.1,st:-.2},aVF:{r:.9,t:.28,st:.32},
  V1:{r:.15,s:.9,q:0,t:-.05},V2:{r:.3,s:1,q:0,t:.3,st:.05},V3:{r:.6,s:.6,t:.35,st:.03},V4:{r:1.1,s:.35,t:.35},V5:{r:1,s:.2,t:.3},V6:{r:.8,s:.1,t:.25}};
const RLEADS={...LEADS,V1R:{r:.15,s:.8,q:0,t:.1,st:.08},V2R:{r:.2,s:.7,q:0,t:.12,st:.1},V3R:{r:.25,s:.5,t:.15,st:.14},V4R:{r:.3,s:.4,t:.18,st:.2},V5R:{r:.3,s:.35,t:.15,st:.16},V6R:{r:.3,s:.3,t:.12,st:.12}};
const say=(s,t)=>{};
function ecgViewer(right){return (body,S,api,fresh)=>{
  body.innerHTML=`<div class="paperwrap"><canvas id="ecgC"></canvas></div><div class="interp"><div class="label">Your read</div>Look at where the ST segments sit relative to the baseline, lead by lead. <button class="btn xs" id="rev">Show interpretation</button><p id="int" hidden>${right?"ST elevation in V4R (and V3R–V6R). Right ventricular involvement: preload dependent.":"Sinus rhythm 96. ST elevation in II, III and aVF, greater in III than II. Reciprocal ST depression in I and aVL. Inferior STEMI."}</p></div>`;
  api.draw.ecg(document.getElementById("ecgC"),{leads:right?RLEADS:LEADS,hr:S.v.hr,animate:fresh,
    grid:right?[["I","aVR","V1R","V4R"],["II","aVL","V2R","V5R"],["III","aVF","V3R","V6R"]]:[["I","aVR","V1","V4"],["II","aVL","V2","V5"],["III","aVF","V3","V6"]],
    title:`PETROV, GEORGI · 58 M · ${api.fmt(S.at[right?"dx_recg":"dx_ecg"]??S.t)}`,sub:`Vent rate ${Math.round(S.v.hr)} bpm · 25 mm/s · 10 mm/mV · ${right?"RIGHT-SIDED":"STANDARD"} 12-LEAD`});
  body.querySelector("#rev").onclick=e=>{body.querySelector("#int").hidden=false;e.target.hidden=true;};
  return right?"Right-sided ECG":"12-lead ECG";
};}

return {
  id:"chest-01",title:"Crushing chest pain at triage",specialty:"Cardiology",setting:"Emergency dept",acuity:1,mins:"10–15",
  blurb:"A 58-year-old walks in grey and sweaty with 40 minutes of central chest pain.",
  thumb:"img/distressed.jpg",bed:"RESUS 2 · ADULT",
  patient:{name:"Georgi Petrov",first:"Georgi",meta:"58 M · 92 kg · walked in",label:"PETROV, Georgi · 58 M",cc:"It's like an elephant sitting on my chest. Please, it's bad."},
  arrival:"Triage puts him on a trolley in resus bay 2. Nothing attached yet.",
  dx:"Inferior STEMI with right ventricular involvement",budget:40,
  vitals:{hr:96,sbp:128,dbp:78,rr:20,spo2:95,temp:36.8,rhythm:"sinus"},
  monitorLead:LEADS.II,
  views:{bedside:{label:"Bedside",aspect:"414/308",
    states:{base:"img/base.jpg",distressed:"img/distressed.jpg",shocked:"img/shocked.jpg",settled:"img/settled.jpg"},
    markers:{face:{x:30,y:27},neck:{x:36,y:42},chest:{x:45,y:54},arm:{x:24,y:73},abd:{x:55,y:68},hand:{x:68,y:90}}}},
  regions:{
    face:{name:"Face & general",close:"img/z_face.jpg",talk:true,scale:2.4,hint:"look, talk, temperature"},
    neck:{name:"Neck",close:"img/z_neck.jpg",scale:2.6,hint:"JVP, thyroid, trachea"},
    chest:{name:"Chest",close:"img/z_chest.jpg",scale:2.2,hint:"heart and lungs"},
    arm:{name:"Arms",close:"img/z_arm.jpg",scale:2.4,hint:"BP cuff, IV access"},
    abd:{name:"Abdomen",close:"img/z_abd.jpg",scale:2.2},
    hand:{name:"Hands",close:"img/z_hand.jpg",scale:2.6,hint:"pulse, SpO₂"}
  },
  regionOrder:["face","neck","chest","arm","abd","hand"],
  deviceRegion:{ecg:"chest",spo2:"hand",nibp:"arm",temp:"face",o2:"face",iv:"arm"},
  deviceText:{ecg:"3-lead monitoring attached.",spo2:"Finger probe on.",nibp:"Cuff on left arm, cycling every 5 min.",temp:S=>`Temperature ${S.v.temp.toFixed(1)} °C.`,
    o2:"Mask applied at 15 L. SpO₂ was already 95% on air, so supplemental oxygen is not indicated.",iv:"Two 18G cannulae sited in the antecubital fossae."},
  talkTo:[{who:"pt",name:"Georgi"}],
  tray:[{id:"dx_ecg",icon:"ecg12"},{id:"dx_bsl",icon:"glucose"},{id:"dx_trop",icon:"labs"},{id:"dx_cxr",icon:"xray"}],
  actions:[
    {id:"hx_onset",cat:"Talk",t:"When did it start? What's it like?",cost:1,say:"About forty minutes ago, watching TV. Heavy, like a weight pressing down. Goes up into my jaw. Eight out of ten.",b:"Onset at rest 40 min ago. Heavy central pressure radiating to the jaw, 8/10. Not pleuritic or positional."},
    {id:"hx_assoc",cat:"Talk",t:"Any other symptoms?",cost:1,say:"I feel sick, and I'm sweating like crazy. A bit short of breath.",b:"Nausea, diaphoresis, mild dyspnoea. No syncope."},
    {id:"hx_back",cat:"Talk",t:"Does it go through to your back?",cost:.5,say:"No… it's here, in the middle. Not my back.",b:"No tearing pain, no radiation to the back."},
    {id:"hx_pmh",cat:"Talk",t:"Any medical problems?",cost:1,say:"Blood pressure and diabetes. I smoke, a pack a day. My father had a heart attack at sixty.",b:"HTN, T2DM, 35 pack-years. FHx: father MI at 60."},
    {id:"hx_meds",cat:"Talk",t:"What medicines do you take?",cost:1,say:"Metformin and amlodipine. Nothing else. No blood thinners, no erection pills.",b:"Metformin 1 g BD, amlodipine 5 mg OD. No anticoagulants or PDE5 inhibitors."},
    {id:"hx_allergy",cat:"Talk",t:"Any allergies?",cost:.5,say:"No, nothing I know of.",b:"NKDA."},

    {id:"ex_gen",cat:"Exam",region:"face",tech:"inspect",t:"General appearance",cost:1,fx:"touch",at:{x:50,y:40},b:"Pale, diaphoretic and anxious. Speaking full sentences. Alert, GCS 15."},
    {id:"ex_neck_i",cat:"Exam",region:"neck",tech:"inspect",t:"Inspect neck (JVP, thyroid)",cost:1,fx:"touch",at:{x:58,y:55},b:"JVP visible 6 cm above the sternal angle at 45°. No goitre; nothing rises on swallowing."},
    {id:"ex_neck_p",cat:"Exam",region:"neck",tech:"palpate",t:"Trachea & thyroid",cost:1,fx:"touch",at:{x:52,y:62},b:"Trachea central. Thyroid not enlarged, no nodules. No lymphadenopathy."},
    {id:"ex_ch_i",cat:"Exam",region:"chest",tech:"inspect",t:"Inspect chest",cost:.5,fx:"touch",at:{x:50,y:50},b:"No scars or deformity. Symmetrical expansion, no accessory muscle use."},
    {id:"ex_ch_p",cat:"Exam",region:"chest",tech:"palpate",t:"Apex beat & chest wall",cost:1,fx:"touch",at:{x:62,y:72},b:"Apex 5th intercostal space, mid-clavicular line, not displaced. No heaves or thrills. Chest wall non-tender; pain not reproducible."},
    {id:"ex_ch_pc",cat:"Exam",region:"chest",tech:"percuss",t:"Percuss chest",cost:1,fx:"touch",at:{x:38,y:62},sound:"percuss",b:"Resonant throughout, both sides."},
    {id:"ex_heart",cat:"Exam",region:"chest",tech:"auscultate",t:"Heart sounds",cost:1.5,fx:"touch",at:{x:56,y:66},sound:"heart",b:"Heart sounds I + II, regular, no added sounds or murmurs. No pericardial rub."},
    {id:"ex_lungs",cat:"Exam",region:"chest",tech:"auscultate",t:"Breath sounds",cost:1.5,fx:"touch",at:{x:36,y:70},sound:"breath",b:"Vesicular breath sounds throughout, no crackles or wheeze."},
    {id:"ex_arm_p",cat:"Exam",region:"arm",tech:"palpate",t:"Brachial pulses, both arms",cost:1,fx:"touch",at:{x:45,y:60},b:"Brachial pulses equal and synchronous. No radio-radial delay."},
    {id:"ex_arm_bp",cat:"Exam",region:"arm",tech:"special",t:"Blood pressure in both arms",cost:2,fx:"touch",at:{x:40,y:45},b:"Right 128/78, left 126/76. No significant difference, which makes aortic dissection less likely."},
    {id:"ex_abd_i",cat:"Exam",region:"abd",tech:"inspect",t:"Inspect abdomen",cost:.5,fx:"touch",at:{x:50,y:50},b:"Flat, not distended, no scars."},
    {id:"ex_abd",cat:"Exam",region:"abd",tech:"palpate",t:"Palpate abdomen",cost:2,fx:"touch",at:{x:55,y:55},b:"Soft, non-tender. No organomegaly. No pulsatile, expansile mass."},
    {id:"ex_abd_pc",cat:"Exam",region:"abd",tech:"percuss",t:"Percuss abdomen",cost:1,fx:"touch",at:{x:45,y:55},sound:"percuss",b:"Tympanic centrally, no shifting dullness."},
    {id:"ex_abd_a",cat:"Exam",region:"abd",tech:"auscultate",t:"Bowel sounds",cost:1,fx:"touch",at:{x:50,y:52},sound:"bowel",b:"Bowel sounds present and normal."},
    {id:"ex_hand_i",cat:"Exam",region:"hand",tech:"inspect",t:"Inspect hands",cost:.5,fx:"touch",at:{x:60,y:50},b:"Cool and clammy. Nicotine staining of the index and middle fingers. No clubbing."},
    {id:"ex_periph",cat:"Exam",region:"hand",tech:"palpate",t:"Radial pulse & capillary refill",cost:1,fx:"touch",at:{x:40,y:55},b:"Radial pulse 96, regular, equal both sides. Peripheries cool, capillary refill 3 s."},

    {id:"mo_ecg",cat:"Monitoring",device:"ecg",t:"Cardiac monitor leads",cost:.5},
    {id:"mo_spo2",cat:"Monitoring",device:"spo2",t:"SpO₂ probe",cost:.5},
    {id:"mo_nibp",cat:"Monitoring",device:"nibp",t:"BP cuff (NIBP)",cost:.5},
    {id:"mo_temp",cat:"Monitoring",device:"temp",t:"Tympanic temperature",cost:.5},
    {id:"dx_bsl",cat:"Monitoring",t:"Capillary glucose",short:"Glucose",cost:.5,tok:1,b:"Capillary glucose 11.2 mmol/L."},
    {id:"dx_ecg",cat:"Diagnostics",t:"12-lead ECG",short:"12-lead ECG",cost:3,tok:3,viewer:"ecg12",f:"warn",b:"Sinus rhythm 96. ST elevation in II, III and aVF (III > II). Reciprocal ST depression in I and aVL."},
    {id:"dx_recg",cat:"Diagnostics",t:"Right-sided ECG (V4R)",short:"Right-sided ECG",cost:3,tok:3,req:"dx_ecg",reqMsg:"Do the standard 12-lead first.",viewer:"recg",f:"warn",b:"ST elevation in V4R. Right ventricular involvement: preload dependent."},
    {id:"dx_trop",cat:"Diagnostics",t:"hs-Troponin",short:"Troponin",cost:1,tok:4,delay:25,f:"warn",b:"hs-Troponin T 186 ng/L (ref < 14)."},
    {id:"dx_fbc",cat:"Diagnostics",t:"FBC",short:"FBC",cost:1,tok:2,delay:15,b:"Hb 148, WCC 9.8, Plt 241."},
    {id:"dx_ue",cat:"Diagnostics",t:"U&E / glucose",short:"U&E",cost:1,tok:2,delay:15,b:"Na 138, K 4.2, Cr 88, glucose 11.4."},
    {id:"dx_coag",cat:"Diagnostics",t:"Coagulation",short:"Coag",cost:1,tok:2,delay:20,low:"Rarely changes immediate STEMI management in a patient not on anticoagulants.",b:"INR 1.0, APTT 29 s."},
    {id:"dx_cxr",cat:"Diagnostics",t:"Portable chest X-ray",short:"Chest X-ray",cost:6,tok:10,viewer:"cxr",low:"Doesn't change STEMI management here and took 6 minutes before reperfusion.",b:"Normal heart size, clear lung fields, mediastinum not widened."},

    {id:"tx_iv",cat:"Treatment",device:"iv",t:"IV access ×2",cost:2,f:"good"},
    {id:"tx_asa",cat:"Treatment",t:"Aspirin 300 mg PO (chewed)",short:"Aspirin",cost:1,tok:1,f:"good",say:"Chew it? Okay… tastes awful.",b:"Aspirin 300 mg chewed."},
    {id:"tx_p2y",cat:"Treatment",t:"Ticagrelor 180 mg PO",short:"Ticagrelor",cost:1,tok:3,f:"good",b:"Ticagrelor loading dose given."},
    {id:"tx_hep",cat:"Treatment",t:"Unfractionated heparin IV",short:"Heparin",cost:1,tok:3,needIv:true,f:"good",b:"Weight-based heparin bolus given."},
    {id:"tx_o2",cat:"Treatment",device:"o2",t:"Oxygen 15 L via mask",cost:1,f:"warn",low:"SpO₂ was 95% on air; oxygen is only indicated below 90%."},
    {id:"tx_gtn",cat:"Treatment",t:"GTN 400 µg sublingual",short:"GTN",cost:1,tok:1,low:"Nitrates are harmful in a preload-dependent RV infarct.",run:(S,api)=>{
      if(!S.flags.fluids){S.v.sbp=76;S.v.dbp=44;S.v.hr=118;S.flags.crash=true;return{b:"He becomes grey and drowsy. BP 76/44. Nitrates dropped preload in an RV infarct.",f:"bad",say:"I… I don't feel right. Everything's going grey…"};}
      S.v.sbp-=18;S.v.dbp-=10;return{b:`BP falls to ${S.v.sbp}/${S.v.dbp}. Pain unchanged.`,f:"bad"};}},
    {id:"tx_fluid",cat:"Treatment",t:"0.9% saline 250 mL bolus",short:"Fluid bolus",cost:2,tok:2,repeat:true,needIv:true,run:S=>{S.flags.fluids=(S.flags.fluids||0)+1;
      S.v.sbp=Math.min(132,S.v.sbp+16);S.v.dbp=Math.min(80,S.v.dbp+8);let say="";if(S.v.sbp>90){if(S.flags.crash)say="That's… a bit better.";S.flags.crash=false;}S.v.hr=Math.max(92,S.v.hr-8);
      return{b:`Bolus given. BP now ${S.v.sbp}/${S.v.dbp}. Chest remains clear.`,f:"good",say};}},
    {id:"tx_morph",cat:"Treatment",t:"Morphine 2.5 mg IV",short:"Morphine",cost:1,tok:2,repeat:true,needIv:true,run:S=>{S.v.sbp-=6;S.pain=Math.max(3,S.pain-2);
      return{b:`Pain eases to ${S.pain}/10. BP ${S.v.sbp}/${S.v.dbp}. Opioids can delay oral P2Y12 absorption.`,f:"warn",say:"Ah. That takes the edge off."};}},
    {id:"tx_ondan",cat:"Treatment",t:"Ondansetron 4 mg IV",short:"Ondansetron",cost:1,tok:1,needIv:true,b:"Nausea settles."},

    {id:"dp_cath",cat:"Disposition",t:"Activate cath lab (primary PCI)",cost:2,end:true,f:"good",b:"Interventional cardiology accepts. Transferred for primary PCI."},
    {id:"dp_ccu",cat:"Disposition",t:"Admit to CCU, observe",cost:2,end:true,f:"bad",b:"Admitted to CCU without reperfusion."},
    {id:"dp_home",cat:"Disposition",t:"Discharge with GP follow-up",cost:2,end:true,f:"bad",b:"Discharged."}
  ],
  labs:{
    dx_trop:{name:"hs-Troponin T",rows:[["hs-Troponin T","186","ng/L","< 14",1]]},
    dx_fbc:{name:"Full blood count",rows:[["Haemoglobin","148","g/L","130–175"],["White cells","9.8","×10⁹/L","4.0–11.0"],["Platelets","241","×10⁹/L","150–400"]]},
    dx_ue:{name:"Urea & electrolytes",rows:[["Sodium","138","mmol/L","133–146"],["Potassium","4.2","mmol/L","3.5–5.3"],["Creatinine","88","µmol/L","59–104"],["Glucose","11.4","mmol/L","4.0–7.8",1]]},
    dx_coag:{name:"Coagulation",rows:[["INR","1.0","","0.8–1.2"],["APTT","29","s","25–36"]]}
  },
  viewers:{
    ecg12:ecgViewer(false),recg:ecgViewer(true),
    cxr:(body,S,api)=>{
      body.innerHTML=`<div class="imgwrap"><canvas id="cxrC"></canvas><div class="interp"><div class="label">Systematic review</div><p>Airway · Breathing · Cardiac · Diaphragm · Everything else.</p><button class="btn xs" id="rev" style="margin-top:8px">Show report</button><p id="int" hidden>Normal heart size, clear lung fields, mediastinum not widened. No pneumothorax.</p></div></div>`;
      api.draw.cxr(document.getElementById("cxrC"),{label:"AP · PORTABLE · RESUS 2"});
      body.querySelector("#rev").onclick=e=>{body.querySelector("#int").hidden=false;e.target.hidden=true;};
      return "Chest X-ray · AP portable";
    }
  },
  init(S){S.pain=8;},
  tick(S){if(!S.done.dp_cath){if(Math.random()<.35)S.v.hr+=1;if(Math.random()<.25)S.v.sbp-=1;}if(S.flags.crash)S.v.spo2=Math.max(89,S.v.spo2-.2);},
  onWait(S,api){if(S.flags.crash)api.say("Please… I feel like I'm going to pass out.");},
  appearance(S){
    const crash=S.flags.crash&&S.v.sbp<90;
    const st=crash?"shocked":S.pain>=7?"distressed":S.pain>=5?"base":"settled";
    return{state:st,look:{shocked:"Grey, drowsy, clammy",distressed:"Pale, sweaty, distressed",base:"Anxious, still in pain",settled:"Settling, colour improving"}[st]};
  },
  hud(S){return `Pain ${S.pain}/10`;},
  hints:[
    S=>!S.attach.ecg&&"He's on a trolley with nothing attached. Start with monitoring (Equipment).",
    S=>!S.done.dx_ecg&&"Chest pain at triage: what single test should happen within 10 minutes of arrival?",
    S=>S.done.dx_ecg&&!S.done.dx_recg&&!S.done.tx_gtn&&"Inferior ST elevation. Before any vasodilator, check whether the right ventricle is involved.",
    S=>!S.done.tx_asa&&"Antiplatelet therapy is cheap, fast and time-critical here.",
    S=>S.done.dx_ecg&&!S.done.dp_cath&&"This ECG meets STEMI criteria. Who needs to know right now?"
  ],
  teaching:[
    "Get a 12-lead ECG within 10 minutes of arrival for anyone with suspected ACS. Do not wait for troponin to diagnose a STEMI.",
    "Inferior STEMI (II, III, aVF) with ST elevation greater in III than II should prompt a right-sided ECG. ST elevation ≥1 mm in V4R suggests RV infarction.",
    "RV infarcts are preload dependent. Nitrates, opioids and diuretics can cause profound hypotension; treat hypotension with cautious fluid boluses.",
    "Before antithrombotics, a quick check for aortic dissection (tearing back pain, unequal arm pulses or pressures, wide mediastinum) costs almost nothing.",
    "Give aspirin early, add a P2Y12 inhibitor and anticoagulation per local protocol, and activate primary PCI. Door-to-balloon target is under 90 minutes.",
    "Only give oxygen for SpO₂ below 90%. Routine oxygen in normoxic MI offers no benefit."
  ],
  transferText:{dp_cath:"Cath lab team is on the way. Porters wheeling Georgi upstairs for primary PCI…",dp_ccu:"Transferring to CCU for observation…",dp_home:"Discharge paperwork printed. Georgi heads for the exit…"},
  score(S){
    const d=S.done,at=S.at,rows=[],F=t=>`T+${String(Math.floor(t)).padStart(2,"0")}:${String(Math.round((t%1)*60)).padStart(2,"0")}`;
    const add=(ok,label,detail,pts,max)=>rows.push({ok,label,detail,pts,max});
    add(d.mo_ecg?(at.mo_ecg<=3?"ok":"meh"):"no","Cardiac monitoring on arrival",d.mo_ecg?`Leads on at ${F(at.mo_ecg)}`:"Never attached",d.mo_ecg?(at.mo_ecg<=3?10:5):0,10);
    if(d.dx_ecg){const ok=at.dx_ecg<=10;add(ok?"ok":"meh","12-lead ECG within 10 min",`Done at ${F(at.dx_ecg)}`,ok?20:10,20);}else add("no","12-lead ECG within 10 min","Never obtained",0,20);
    add(d.tx_asa?"ok":"no","Aspirin given",d.tx_asa?`At ${F(at.tx_asa)}`:"Not given",d.tx_asa?10:0,10);
    add(d.tx_p2y&&d.tx_hep?"ok":(d.tx_p2y||d.tx_hep?"meh":"no"),"P2Y12 inhibitor + anticoagulation",[d.tx_p2y&&"Ticagrelor",d.tx_hep&&"Heparin"].filter(Boolean).join(", ")||"Neither given",(d.tx_p2y?5:0)+(d.tx_hep?5:0),10);
    add(d.dx_recg?"ok":"no","Right-sided ECG for inferior STEMI",d.dx_recg?`At ${F(at.dx_recg)}`:"Not done",d.dx_recg?10:0,10);
    add(!d.tx_gtn?"ok":"no","Avoided nitrates in RV infarct",d.tx_gtn?"GTN given and caused hypotension":"No nitrates given",d.tx_gtn?0:15,15);
    const cath=S.outcome==="dp_cath";
    add(cath?(at.dp_cath<=30?"ok":"meh"):"no","Activated primary PCI",cath?`At ${F(at.dp_cath)}`:(S.outcome==="dp_ccu"?"Admitted without reperfusion":S.outcome==="dp_home"?"Discharged":"Not activated"),cath?(at.dp_cath<=30?25:15):0,25);
    return{rows,great:"Strong run. Reperfused fast and safely.",outcome:S.flags.crash&&S.v.sbp<90?"Patient left the bay hypotensive.":""};
  }
};
})());
