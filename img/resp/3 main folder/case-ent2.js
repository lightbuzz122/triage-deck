/* Case: 72-year-old on warfarin with an anterior epistaxis from Little's area. ENT syllabus topic 7. */
(window.CASEDEFS=window.CASEDEFS||[]).push((function(){
const IMG="img/ent2/";
const EXT=".jpg";
const LEADS={I:{r:.6,s:.1,t:.15},II:{r:1,t:.25},III:{r:.45,t:.12},aVR:{r:.7,t:.2,inv:1},aVL:{r:.3,s:.15,t:.08},aVF:{r:.7,t:.2},
  V1:{r:.15,s:.9,q:0,t:-.05},V2:{r:.3,s:1,q:0,t:.25},V3:{r:.6,s:.6,t:.3},V4:{r:1.1,s:.35,t:.3},V5:{r:1,s:.2,t:.28},V6:{r:.8,s:.1,t:.22}};
const F=t=>`T+${String(Math.floor(t)).padStart(2,"0")}:${String(Math.round((t%1)*60)).padStart(2,"0")}`;

/* anterior rhinoscopy of the LEFT nostril, on the photo. Bleeding point at about (42%,44%). */
const BP={x:42,y:44};
function noseSVG(o){
  return `<div style="position:relative;max-width:460px;margin:0 auto;aspect-ratio:562/656;border-radius:10px;overflow:hidden;background:#000">
    <img src="${IMG}z_nostril.jpg" alt="View into the left nostril" style="width:100%;height:100%;object-fit:cover;display:block;filter:${o.speculum?"none":"blur(3px)"};transition:filter .4s">
    ${o.suctioned?"":`<span style="position:absolute;left:${BP.x}%;top:${BP.y}%;width:34%;height:30%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,#3d0707 0 45%,rgba(61,7,7,.85) 60%,rgba(61,7,7,0) 72%)"></span>`}
    ${!o.cauterised&&o.suctioned?`<span style="position:absolute;left:${BP.x}%;top:${BP.y}%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#d21f1f;box-shadow:0 0 0 0 rgba(210,31,31,.7);animation:beacon 1.2s ease-out infinite"></span>`:""}
    ${o.cauterised?`<span style="position:absolute;left:${BP.x}%;top:${BP.y}%;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:radial-gradient(circle,#9c9696 0 30%,#3b3434 55%,rgba(59,52,52,0) 75%)"></span>`:""}
    ${o.mark?`<span style="position:absolute;left:${o.mark.x}%;top:${o.mark.y}%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;border:3px solid ${o.mark.ok?"#22C55E":"#F6B73C"}"></span>`:""}
    <div style="position:absolute;inset:0;pointer-events:none;background:${o.light?`radial-gradient(circle at ${o.lx??45}% ${o.ly??45}%,rgba(255,246,220,.16),rgba(0,0,0,0) 40%,rgba(0,0,0,.3))`:"rgba(0,0,0,.86)"}"></div>
  </div>`;
}
function rhinoViewer(body,S,api){
  const st={light:!!S.flags.headlight,speculum:!!S.flags.speculum,suctioned:!!S.flags.suctioned,lx:52,ly:48};
  let mark=null;
  const draw=()=>{
    body.querySelector("#nv").innerHTML=noseSVG({...st,cauterised:S.flags.cauterised,mark});
    body.querySelectorAll("[data-step]").forEach(b=>b.setAttribute("aria-pressed",!!S.flags[b.dataset.step]));
    body.querySelector("#nhint").textContent=!st.light?"Put on the headlight.":!st.speculum?"Open the nostril with the speculum.":!S.flags.cophen?"Spray topical anaesthetic and vasoconstrictor, then wait.":!st.suctioned?"Clot fills the view. Ask him to blow it out, then suction.":S.flags.cauterised?"Bleeding point cauterised.":"Find the bleeding point. Click it to apply silver nitrate.";
  };
  body.innerHTML=`<div class="interp"><div class="label">Steps</div><p style="display:flex;gap:6px;flex-wrap:wrap">
    <button class="btn xs" data-step="headlight">Headlight on</button><button class="btn xs" data-step="speculum">Nasal speculum</button>
    <button class="btn xs" data-step="cophen">Topical anaesthetic + vasoconstrictor</button><button class="btn xs" data-step="suctioned">Blow nose, then suction clot</button></p></div>
    <div id="nv" style="cursor:crosshair"></div><p class="sub" id="nhint" style="margin:0"></p><p id="nres" style="margin:0"></p>`;
  body.querySelector(".interp").onclick=e=>{const b=e.target.closest("[data-step]");if(!b)return;const k=b.dataset.step;
    if(k==="suctioned"&&!S.flags.cophen){body.querySelector("#nres").innerHTML=`<b style="color:var(--warn)">Wait.</b> Spray first: it shrinks the mucosa and numbs it, so you can see and he can tolerate it.`;return;}
    S.flags[k]=true;st.light=!!S.flags.headlight;st.speculum=!!S.flags.speculum;st.suctioned=!!S.flags.suctioned;
    if(k==="speculum")api.transient("distressed",2500);
    if(k==="cophen")api.say("Ugh, that tastes horrible… my teeth have gone numb.","pt");
    if(k==="suctioned"){api.transient("distressed",2500);api.say("That's a lot of blood… is it still coming?","pt");}
    draw();};
  body.querySelector("#nv").addEventListener("pointermove",e=>{if(!st.light)return;const box=e.currentTarget.firstElementChild,r=box.getBoundingClientRect();st.lx=Math.round((e.clientX-r.left)/r.width*100);st.ly=Math.round((e.clientY-r.top)/r.height*100);
    box.lastElementChild.style.background=`radial-gradient(circle at ${st.lx}% ${st.ly}%,rgba(255,246,220,.16),rgba(0,0,0,0) 40%,rgba(0,0,0,.3))`;});
  body.querySelector("#nv").onclick=e=>{
    if(!(st.light&&st.speculum&&S.flags.cophen&&st.suctioned)||S.flags.cauterised)return;
    const r=body.querySelector("#nv>div").getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
    S.flags.cautTries=(S.flags.cautTries||0)+1;
    const ok=Math.hypot(x-BP.x,y-BP.y)<=8;mark={x,y,ok};
    if(ok){S.flags.cauterised=true;S.flags.bleeding=false;S.results.ex_rhino="Bleeding point on the anterior septum (Little's area), left side. Cauterised with silver nitrate.";S.keys.ex_rhino="Little's area";
      api.log("Silver nitrate cautery","Bleeding point at Little's area cauterised. Bleeding stopped.","good");api.say("Has it stopped? Oh, thank God.","pt");
      body.querySelector("#nres").innerHTML=`<b style="color:var(--good)">Bleeding stopped.</b> Little's area on the anterior septum. Cauterise one side of the septum only, to avoid a septal perforation.`;}
    else body.querySelector("#nres").innerHTML=`<b style="color:var(--warn)">Not quite.</b> Find where the fresh blood is coming from: low and forward on the septum, where the vessels converge.`;
    draw();};
  draw();
  return "Anterior rhinoscopy · left nostril";
}

return {
  id:"ent-02",title:"The nosebleed that won't stop",specialty:"ENT",setting:"Emergency dept",acuity:2,mins:"12–15",
  blurb:"A 72-year-old on warfarin, bleeding from the left nostril for 40 minutes, holding a bowl of bloody tissues.",
  thumb:IMG+"base"+EXT,bed:"MAJORS 3 · ADULT",
  patient:{name:"Patrick Doyle",first:"Patrick",meta:"72 M · on warfarin · by ambulance",label:"DOYLE, Patrick · 72 M",cc:"It just won't stop. I've gone through a whole box of tissues."},
  arrival:"Ambulance handover: left-sided nosebleed for 40 minutes, not settling with pressure at home. On warfarin for AF. Sitting up with a bowl.",
  dx:"Anterior epistaxis from Little's area, with a supratherapeutic INR on warfarin",budget:45,
  vitals:{hr:104,sbp:168,dbp:94,rr:18,spo2:97,temp:36.7,rhythm:"af"},
  monitorLead:LEADS.II,
  views:{bedside:{label:"Bedside",aspect:"718/874",
    states:{base:IMG+"base"+EXT,distressed:IMG+"distressed"+EXT,worse:IMG+"worse"+EXT,settled:IMG+"settled"+EXT},
    markers:{face:{x:47,y:16},nose:{x:50,y:33},mouth:{x:47,y:41},neck:{x:44,y:50},hand:{x:38,y:68},chest:{x:56,y:80}}}},
  regions:{
    face:{name:"Face & general",close:IMG+"z_face"+EXT,scale:2.2,talk:true,hint:"look, talk, first aid"},
    nose:{name:"Nose",close:IMG+"z_nose"+EXT,scale:3,hint:"headlight, speculum, cautery"},
    mouth:{name:"Mouth & throat",close:IMG+"z_mouth"+EXT,scale:3,hint:"posterior bleeding?"},
    neck:{name:"Neck",close:IMG+"z_neck"+EXT,scale:2.6},
    hand:{name:"Hands",close:IMG+"z_hand"+EXT,scale:2.6,hint:"perfusion, bruising"},
    chest:{name:"Chest & arms",close:IMG+"z_chest"+EXT,scale:2,hint:"monitoring, IV"}
  },
  regionOrder:["face","nose","mouth","neck","hand","chest"],
  deviceRegion:{ecg:"chest",spo2:"hand",nibp:"chest",temp:"face",o2:"mouth",iv:"chest"},
  deviceText:{ecg:"3-lead monitoring: atrial fibrillation.",spo2:"Finger probe on.",nibp:"Cuff on the right arm, cycling every 5 min.",temp:S=>`Temperature ${S.v.temp.toFixed(1)} °C.`,
    o2:"Mask applied. SpO₂ was 97% on air; oxygen isn't needed.",iv:"18G cannula in the left antecubital fossa. Bloods drawn."},
  talkTo:[{who:"pt",name:"Patrick"}],
  tray:[{id:"ex_rhino",icon:"ecg12"},{id:"dx_inr",icon:"labs"},{id:"tx_pack",icon:"iv"}],
  actions:[
    {id:"pt_onset",cat:"Talk",t:"When did it start, and which side?",cost:.5,say:"About forty minutes ago, watching the telly. Left side mostly, but it's coming out the right now too.",b:"Started 40 min ago at rest. Mainly left-sided."},
    {id:"pt_throat",cat:"Talk",t:"Is blood running down the back of your throat?",cost:.5,say:"A bit at first, when I leaned back. My wife said to tip my head back.",b:"Some blood swallowed after tipping his head back; none now."},
    {id:"pt_before",cat:"Talk",t:"Have you had nosebleeds before?",cost:.5,say:"A couple of small ones this month. Nothing like this.",b:"Two minor nosebleeds this month."},
    {id:"pt_meds",cat:"Talk",t:"What medicines do you take?",cost:.5,say:"Warfarin for my heart rhythm, a water tablet, and a blood pressure one. They changed my antibiotics last week for a chest infection.",b:"Warfarin for AF, bendroflumethiazide, ramipril. Recent course of clarithromycin."},
    {id:"pt_inr",cat:"Talk",t:"When was your INR last checked?",cost:.5,say:"Three weeks ago. It was 2.6, they said that's fine.",b:"INR 2.6 three weeks ago. Since then started clarithromycin, which raises the INR."},
    {id:"pt_dizzy",cat:"Talk",t:"Do you feel dizzy or faint?",cost:.5,say:"A bit light-headed when I stood up for the ambulance.",b:"Postural light-headedness."},
    {id:"pt_other",cat:"Talk",t:"Any bruising, blood in your urine or stools?",cost:.5,say:"I bruise easily, but no, nothing else.",b:"Easy bruising; no other bleeding."},

    {id:"ex_firstaid",cat:"Exam",region:"face",tech:"special",t:"First aid: sit forward, pinch the soft nose 15 min",short:"First aid",cost:1,f:"good",fx:"touch",at:{x:50,y:55},run:(S,api)=>{S.flags.firstaid=true;S.flags.lostRate=.5;api.transient("distressed",2000);return{b:"Sitting upright, leaning forward, firm pressure on the soft part of the nose, ice on the bridge. Bleeding slows but doesn't stop.",say:"Leaning forward… like this? Not back?"};}},
    {id:"ex_gen",cat:"Exam",region:"face",tech:"inspect",t:"General appearance",cost:.5,fx:"touch",at:{x:50,y:45},b:"Pale, anxious, blood on his shirt. Alert and talking. Spitting blood into a bowl."},
    {id:"ex_rhino",cat:"Exam",region:"nose",tech:"torch",t:"Anterior rhinoscopy & cautery",short:"Rhinoscopy",verb:"Look",cost:2,tok:2,viewer:"rhino",fx:"torch",at:{x:50,y:55},run:()=>({b:"Headlight, speculum and cautery sticks ready."})},
    {id:"ex_post",cat:"Exam",region:"mouth",tech:"torch",t:"Look for blood in the oropharynx",cost:.5,fx:"torch",at:{x:50,y:55},run:S=>({b:S.flags.cauterised||S.flags.packed?"No fresh blood trickling down the back of the throat.":"A little fresh blood at the back of the throat from the anterior bleed. No brisk posterior stream."})},
    {id:"ex_neck",cat:"Exam",region:"neck",tech:"palpate",t:"Neck",cost:.5,b:"No lymphadenopathy. JVP not raised."},
    {id:"ex_hand",cat:"Exam",region:"hand",tech:"inspect",t:"Hands & perfusion",cost:.5,fx:"touch",at:{x:50,y:45},b:"Cool hands, capillary refill 3 s, bloody tissue in hand, bruises on the backs of the hands."},
    {id:"ex_arms",cat:"Exam",region:"chest",tech:"inspect",t:"Arms & skin",cost:.5,fx:"touch",at:{x:50,y:60},b:"Thin skin with scattered purple bruises on the forearms and backs of the hands: easy bruising on warfarin."},
    {id:"ex_post_bp",cat:"Exam",region:"chest",tech:"special",t:"Postural blood pressure",cost:2,run:S=>({b:`Lying ${Math.round(S.v.sbp)}/${Math.round(S.v.dbp)}; standing drop of 24 mmHg with light-headedness.`,f:"warn"})},
    {id:"ex_lungs",cat:"Exam",region:"chest",tech:"auscultate",t:"Breath sounds",cost:1,sound:"breath",b:"A few coarse crackles at the right base, clearing on coughing."},

    {id:"mo_ecg",cat:"Monitoring",device:"ecg",t:"Cardiac monitor leads",cost:.5},
    {id:"mo_spo2",cat:"Monitoring",device:"spo2",t:"SpO₂ probe",cost:.5},
    {id:"mo_nibp",cat:"Monitoring",device:"nibp",t:"BP cuff (NIBP)",cost:.5},
    {id:"mo_temp",cat:"Monitoring",device:"temp",t:"Temperature",cost:.5},

    {id:"dx_fbc",cat:"Diagnostics",t:"FBC",short:"FBC",cost:1,tok:2,delay:15,b:"Hb 112 (baseline 138), Plt 205."},
    {id:"dx_inr",cat:"Diagnostics",t:"INR / clotting",short:"INR",cost:1,tok:2,delay:20,f:"warn",b:"INR 4.6."},
    {id:"dx_gs",cat:"Diagnostics",t:"Group & save",short:"Group & save",cost:1,tok:2,delay:30,b:"Group A positive, antibody screen negative."},
    {id:"dx_ue",cat:"Diagnostics",t:"U&E",short:"U&E",cost:1,tok:2,delay:15,b:"Urea 9.1, creatinine 96."},
    {id:"dx_ct",cat:"Diagnostics",t:"CT sinuses",short:"CT sinuses",cost:30,tok:12,low:"Imaging doesn't help an anterior bleed you can see and treat.",b:"No mass. Mucosal thickening only."},

    {id:"tx_iv",cat:"Treatment",device:"iv",t:"IV access & bloods",cost:2,f:"good"},
    {id:"tx_fluids",cat:"Treatment",t:"IV fluids 500 mL",short:"IV fluids",cost:1,tok:2,needIv:true,repeat:true,f:"good",run:S=>{S.flags.fluids=true;S.v.hr=Math.max(88,S.v.hr-6);return{b:"Fluids running."};}},
    {id:"tx_txa",cat:"Treatment",t:"Topical tranexamic acid on a pledget",short:"Topical TXA",cost:2,tok:1,run:S=>{S.flags.txa=true;return{b:"Pledget soaked in tranexamic acid placed in the left nostril. Bleeding slows."};}},
    {id:"tx_pack",cat:"Treatment",t:"Anterior nasal pack (inflatable, left)",short:"Nasal pack",cost:5,tok:4,req:"ex_rhino",reqMsg:"Look first: a visible bleeding point can often be cauterised instead of packed.",run:(S,api)=>{S.flags.packed=true;S.flags.bleeding=false;api.transient("distressed",3000);
      return{b:"Inflatable anterior pack inserted along the floor of the left nostril and inflated. Bleeding controlled.",f:"good",say:"Ow… that's uncomfortable, but it's stopped."};}},
    {id:"tx_hold",cat:"Treatment",t:"Withhold warfarin",short:"Hold warfarin",cost:.5,f:"good",run:S=>{S.flags.held=true;return{b:"Warfarin withheld. Anticoagulation clinic to be informed."};}},
    {id:"tx_vitk",cat:"Treatment",t:"Vitamin K 1 mg IV",short:"Vitamin K 1 mg",cost:1,tok:1,needIv:true,f:"good",run:S=>{S.flags.vitk=true;return{b:"Low-dose vitamin K given: brings the INR down over hours without blocking re-anticoagulation."};}},
    {id:"tx_pcc",cat:"Treatment",t:"Prothrombin complex concentrate",short:"PCC",cost:10,tok:6,needIv:true,low:"PCC is for life-threatening bleeding. A controlled anterior bleed with stable observations usually needs only warfarin withheld and low-dose vitamin K.",run:S=>{S.flags.pcc=true;return{b:"PCC given. INR corrected.",f:"warn"};}},
    {id:"tx_amlo",cat:"Treatment",t:"Treat blood pressure (IV labetalol)",short:"IV labetalol",cost:1,tok:2,needIv:true,low:"High blood pressure during a nosebleed is usually pain and anxiety. Control the bleed first; treat persisting hypertension later.",run:S=>{S.v.sbp-=24;return{b:`BP ${Math.round(S.v.sbp)}/${Math.round(S.v.dbp)}.`,f:"warn"};}},

    {id:"dp_ent",cat:"Disposition",t:"Admit under ENT for observation",cost:2,end:true,f:"good",b:"ENT accept for observation, pack care and INR monitoring."},
    {id:"dp_home",cat:"Disposition",t:"Discharge with advice",cost:2,end:true,f:"warn",b:"Discharged."},
    {id:"dp_theatre",cat:"Disposition",t:"Theatre for sphenopalatine artery ligation",cost:2,end:true,f:"bad",b:"Listed for theatre."}
  ],
  labs:{
    dx_fbc:{name:"Full blood count",rows:[["Haemoglobin","112","g/L","130–175",-1],["Platelets","205","×10⁹/L","150–400"]]},
    dx_inr:{name:"Clotting",rows:[["INR","4.6","","Target 2–3",1],["APTT","38","s","25–36",1]]},
    dx_gs:{name:"Group & save",rows:[["ABO / Rh","A pos","",""],["Antibody screen","Negative","",""]]},
    dx_ue:{name:"Urea & electrolytes",rows:[["Urea","9.1","mmol/L","2.5–7.8",1],["Creatinine","96","µmol/L","59–104"]]}
  },
  viewers:{rhino:rhinoViewer},
  init(S){S.flags.bleeding=true;S.flags.lostRate=1;},
  tick(S,api){
    if(S.ended)return;
    if(S.flags.bleeding){S.v.hr=Math.min(128,S.v.hr+.25*S.flags.lostRate);if(S.t>8)S.v.sbp=Math.max(96,S.v.sbp-.6*S.flags.lostRate);}
    if(S.flags.bleeding&&S.t>=35&&!S.flags.worse){S.flags.worse=true;api.log("Nurse","“He's gone very pale and clammy, and he's still bleeding.”","bad");}
  },
  appearance(S){const st=!S.flags.bleeding?"settled":S.flags.worse?"worse":"base";
    return{state:st,look:{settled:"Bleeding controlled, colour returning",worse:"Pale, clammy, still bleeding",base:"Anxious, bleeding into a bowl",distressed:"Wincing"}[st]};},
  hud(S){return S.flags.bleeding?`<span style="color:var(--bad)">Active bleeding</span>`:`<span style="color:var(--good)">Bleeding controlled</span>`;},
  hints:[
    S=>!S.flags.firstaid&&"First aid first: how should he be sitting, and where should the pressure go?",
    S=>!S.attach.iv&&"He's anticoagulated and tachycardic. Access and bloods.",
    S=>!S.flags.cauterised&&!S.flags.packed&&"Can you see where it's coming from? Headlight, speculum, spray.",
    S=>!S.done.dx_inr&&"Something changed recently that affects warfarin. Check the INR.",
    S=>S.done.dx_inr&&!S.flags.held&&"INR 4.6 with bleeding. What happens to the warfarin?",
    S=>!S.done.dp_ent&&"Where should he go now?"
  ],
  teaching:[
    "Most nosebleeds are anterior, from Little's area (Kiesselbach's plexus) on the anterior septum. Posterior bleeds are rarer, heavier and more common in older, anticoagulated or hypertensive patients.",
    "First aid: sit upright and lean forward, pinch the soft part of the nose firmly for 10 to 15 minutes without letting go, and spit out blood rather than swallowing it. Tipping the head back makes patients swallow blood and hides ongoing loss.",
    "Assess for shock (pulse, blood pressure including postural, capillary refill), get IV access, FBC, clotting and a group and save in anticoagulated or unwell patients.",
    "To find the bleeding point: headlight, nasal speculum, topical anaesthetic with vasoconstrictor, clear the clot, then look low and forward on the septum. Cauterise one side of the septum only, with silver nitrate, to avoid perforation.",
    "If cautery fails or no point is seen, place an anterior pack (inflatable or nasal tampon). Bleeding that continues despite a well-placed anterior pack suggests a posterior source and needs ENT.",
    "Supratherapeutic INR with a controlled, non-life-threatening bleed: withhold warfarin and consider low-dose IV vitamin K. Keep prothrombin complex concentrate for major or life-threatening bleeding.",
    "Check for interactions: macrolides such as clarithromycin raise the INR in patients on warfarin.",
    "High blood pressure during a nosebleed is usually from pain and anxiety. Stop the bleeding first; treat sustained hypertension afterwards."
  ],
  transferText:{dp_ent:"ENT accept. Patrick goes to the ward for observation…",dp_home:"Patrick is sent home…",dp_theatre:"Patrick is listed for theatre…"},
  score(S){
    const d=S.done,f=S.flags,rows=[];const add=(ok,l,det,p,m)=>rows.push({ok,label:l,detail:det,pts:p,max:m});
    add(f.firstaid?"ok":"no","Correct first aid",f.firstaid?"Leaning forward, pressure on the soft nose":"Not given",f.firstaid?10:0,10);
    add(d.mo_nibp&&d.mo_ecg?"ok":(d.mo_nibp||d.mo_ecg?"meh":"no"),"Haemodynamic assessment",[d.mo_nibp&&"blood pressure",d.mo_ecg&&"monitoring",d.ex_post_bp&&"postural BP"].filter(Boolean).join(", ")||"Not done",d.mo_nibp&&d.mo_ecg?10:(d.mo_nibp||d.mo_ecg?5:0),10);
    add(d.tx_iv&&d.dx_fbc&&d.dx_gs?"ok":(d.tx_iv?"meh":"no"),"IV access, FBC and group & save",[d.tx_iv&&"IV",d.dx_fbc&&"FBC",d.dx_gs&&"G&S"].filter(Boolean).join(", ")||"Not done",d.tx_iv&&d.dx_fbc&&d.dx_gs?10:(d.tx_iv?5:0),10);
    add(d.dx_inr?"ok":"no","INR checked",d.dx_inr?"INR 4.6":"Not checked",d.dx_inr?10:0,10);
    add(f.cauterised?"ok":(f.packed?"meh":"no"),"Bleeding point found and treated",f.cauterised?`Little's area cauterised${f.cautTries>1?` (${f.cautTries} attempts)`:""}`:f.packed?"Packed without finding the point":"Not controlled",f.cauterised?25:(f.packed?18:0),25);
    add(f.held&&f.vitk&&!f.pcc?"ok":(f.held||f.vitk||f.pcc?"meh":"no"),"Anticoagulation managed proportionately",[f.held&&"warfarin held",f.vitk&&"low-dose vitamin K",f.pcc&&"PCC (more than needed)"].filter(Boolean).join(", ")||"Not addressed",f.held&&f.vitk&&!f.pcc?15:(f.held||f.vitk?8:f.pcc?5:0),15);
    add(d.pt_meds?"ok":"no","Drug interaction identified",d.pt_meds?"Recent clarithromycin":"Medication history not taken",d.pt_meds?5:0,5);
    add(S.outcome==="dp_ent"?"ok":(S.outcome==="dp_home"?"meh":"no"),"Safe disposition",S.outcome==="dp_ent"?"Admitted under ENT":S.outcome==="dp_home"?"Discharged with a raised INR":S.outcome==="dp_theatre"?"Theatre for an anterior bleed":"None",S.outcome==="dp_ent"?15:(S.outcome==="dp_home"?5:0),15);
    return{rows,great:"Strong run. Calm first aid, found the point, and handled the warfarin proportionately.",outcome:f.worse&&f.bleeding?"He became shocked while still bleeding.":""};
  }
};
})());
