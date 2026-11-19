(()=>{
const $=id=>document.getElementById(id);
const STORE='hunter_system_singlepage_v1';
const p2=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
const today=iso(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d};
const dayDiff=(a,b)=>Math.floor((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
let state;
try{state={start:today,completed:[],meals:{},...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(e){state={start:today,completed:[],meals:{}}}
if(!state.start)state.start=today;if(!state.meals)state.meals={};
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){}};
const offset=dayDiff(today,state.start),inPlan=offset>=0&&offset<90;
const dayNo=Math.max(0,Math.min(89,offset))+1,phase=offset<30?0:offset<60?1:2;
const k=offset%7,isW=inPlan,isDone=state.completed.includes(today);
// [name, base sets, reps, rest seconds, hint]
const W_OLD=[
{n:'Push + Legs',ex:[['Warm-up',0,'3 min',0,'Bike or brisk walk. Get warm.'],['Leg press',3,'10–12',60,'Push through your heels.'],['Chest press',3,'10',60,'Slow down, fast up.'],['Shoulder press',3,'10',60,'Dumbbells. Don’t arch your back.'],['Triceps pushdown',3,'12',45,'Elbows glued to your sides.'],['Plank',3,'30 sec',30,'Tight core. Breathe.'],['Stretch',0,'2 min',0,'Chest and quads.']]},
{n:'Pull + Core',ex:[['Warm-up',0,'3 min',0,'Row machine, easy pace.'],['Lat pulldown',3,'10',60,'Pull to your chest.'],['Cable row',3,'10–12',60,'Squeeze your shoulder blades.'],['Romanian deadlift',3,'10',60,'Light. Hinge at the hips.'],['Dumbbell curl',3,'12',45,'No swinging.'],['Dead bug',3,'8 / side',30,'Lower back stays flat.'],['Stretch',0,'2 min',0,'Back and hamstrings.']]},
{n:'Full Body',ex:[['Warm-up',0,'3 min',0,'Incline walk.'],['Goblet squat',3,'10',60,'Chest up, sit deep.'],['Incline DB press',3,'10',60,'Control the way down.'],['Supported row',3,'12',60,'Chest on the pad.'],['Lateral raise',3,'15',45,'Light weight, lead with elbows.'],['Leg curl',3,'12',45,'Slow squeeze.'],['Stretch',0,'2 min',0,'Full body.']]}];
const W=[
{n:'Push',s:'PUSH',ex:[['Warm-up',0,'3 min',0,'Bike or brisk walk.'],['Chest press',3,'10',60,'Slow down, fast up.'],['Incline DB press',3,'10',60,'Control the way down.'],['Shoulder press',3,'10',60,'Don’t arch your back.'],['Lateral raise',3,'15',45,'Lead with your elbows.'],['Triceps pushdown',3,'12',45,'Elbows glued to your sides.'],['Stretch',0,'2 min',0,'Chest and shoulders.']]},
{n:'Pull',s:'PULL',ex:[['Warm-up',0,'3 min',0,'Row machine, easy pace.'],['Lat pulldown',3,'10',60,'Pull to your chest.'],['Cable row',3,'10–12',60,'Squeeze your shoulder blades.'],['Face pull',3,'15',45,'Light. Pull to your eyes.'],['Dumbbell curl',3,'12',45,'No swinging.'],['Hammer curl',3,'12',45,'Slow on the way down.'],['Stretch',0,'2 min',0,'Back and biceps.']]},
{n:'Legs',s:'LEGS',ex:[['Warm-up',0,'3 min',0,'Bike, easy pace.'],['Leg press',3,'12',60,'Push through your heels.'],['Goblet squat',3,'10',60,'Chest up, sit deep.'],['Leg curl',3,'12',45,'Slow squeeze.'],['Glute bridge',3,'12',45,'Pause at the top.'],['Calf raise',3,'15',30,'Full stretch, full squeeze.'],['Stretch',0,'2 min',0,'Quads and hamstrings.']]},
{n:'Core + Cardio',s:'CORE',ex:[['Warm-up',0,'3 min',0,'Easy walk.'],['Plank',3,'30 sec',30,'Tight core. Breathe.'],['Dead bug',3,'8 / side',30,'Lower back stays flat.'],['Leg raise',3,'10',30,'Slow and controlled.'],['Bird dog',3,'8 / side',30,'Hold 2 seconds.'],['Bike intervals',0,'8 min',0,'30 sec hard, 30 sec easy.'],['Stretch',0,'2 min',0,'Hips and back.']]},
{n:'Upper Body',s:'UPPER',ex:[['Warm-up',0,'3 min',0,'Arm circles, light row.'],['Chest press',3,'10',60,'Controlled reps.'],['Lat pulldown',3,'10',60,'Chest up.'],['Shoulder press',3,'10',60,'Core tight.'],['Cable row',3,'10',60,'Pause at your ribs.'],['Curl + pushdown',3,'12',45,'Back to back, no rest.'],['Stretch',0,'2 min',0,'Upper body.']]},
{n:'Lower Body',s:'LOWER',ex:[['Warm-up',0,'3 min',0,'Bike, easy pace.'],['Romanian deadlift',3,'10',60,'Light. Hinge at the hips.'],['Leg press',3,'12',60,'Full range.'],['Walking lunge',3,'10 / leg',60,'Long steps.'],['Leg curl',3,'12',45,'Slow squeeze.'],['Calf raise',3,'15',30,'Pause at the top.'],['Stretch',0,'2 min',0,'Glutes and calves.']]},
{n:'Full Body',s:'FULL',ex:[['Warm-up',0,'3 min',0,'Incline walk.'],['Goblet squat',3,'10',60,'Chest up, sit deep.'],['Incline push-up',3,'10',45,'Straight line, head to heels.'],['Cable row',3,'12',45,'Smooth and slow.'],['Plank',3,'30 sec',30,'Breathe.'],['Easy walk',0,'8 min',0,'Light pace, loosen up.'],['Stretch',0,'2 min',0,'Full body mobility.']]}];
const sets=b=>b?Math.max(2,b-(phase===0?1:0)):0;
const total=state.completed.length,xp=total*20;
const T=[[0,'Rookie'],[200,'Rising'],[600,'Strong'],[1100,'Elite'],[1600,'Beast']];
let li=0;T.forEach((t,i)=>{if(xp>=t[0])li=i});
const lv=T[li][1],lo=T[li][0],hi=T[li+1]?T[li+1][0]:1800;
$('xLv').textContent=lv;$('xTx').textContent=xp+' / '+hi+' XP';$('xNx').textContent=T[li+1]?(hi-xp)+' XP to '+T[li+1][1]:'Max level';
const wk=state.completed.filter(d=>{const o=dayDiff(d,state.start);return o>=Math.floor(offset/7)*7&&o<Math.floor(offset/7)*7+7}).length;
// today
$('dateLbl').textContent=new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}).toUpperCase();
$('dayNum').textContent=inPlan?p2(dayNo):'90';
$('mq').textContent=('30 MIN  ●  BUILD MUSCLE  ●  NO EXCUSES  ●  ').repeat(8);
$('tk').textContent=isW?`SESSION ${k+1} OF 7 · ${['FOUNDATION','BUILDING','PROGRESSION'][phase]}`:'RECOVERY';
$('tname').textContent=isW?W[k].n:(inPlan?'Rest\nday':'Plan\ncomplete');
$('tname').style.whiteSpace='pre-line';
$('tchips').innerHTML=isW?`<span>30 MIN</span><span>${W[k].ex.filter(x=>x[1]).length} LIFTS</span><span>3 REPS LEFT</span>`:'<span>WALK 20 MIN</span><span>EAT</span><span>SLEEP 8H</span>';
const sb=$('startBtn');sb.disabled=!isW||isDone;sb.textContent=isDone?'Completed ✓':isW?'Start workout →':'Recover today';
$('sLvl').textContent=lv;
const nOff=offset+1,nIn=nOff>=0&&nOff<90,nk=nOff%7,nW=nIn;
$('nxDay').textContent=nIn?'DAY '+p2(nOff+1):'END';
$('nxName').textContent=nW?W[nk].n:(nIn?'Rest day':'Plan complete');
$('nxList').innerHTML=nW?W[nk].ex.map(x=>`<div class="ex"><span>${x[0]}</span><span>${x[1]?sets(x[1])+' × '+x[2]:x[2]}</span></div>`).join(''):'<div class="ex"><span>Walk 20 min · eat · sleep</span><span>Recover</span></div>';$('phLbl').textContent=['FOUNDATION','BUILDING','PROGRESSION'][phase];$('fLbl').textContent='EAT TO GROW';
function cu(el,to,fmt,ms){const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/ms);el.textContent=fmt(Math.round(to*(1-Math.pow(1-p,4))));if(p<1)requestAnimationFrame(f)})(t0)}
// plan
const wn=['SUN','MON','TUE','WED','THU','FRI','SAT'];
const o0=Math.max(0,offset),wb=o0-o0%7;$('week').innerHTML=Array.from({length:7},(_,i)=>{const d=addDays(state.start,wb+i),ds=iso(d);return `<div class="wd ${ds===today?'t':''} ${state.completed.includes(ds)?'dn':''}">${wn[d.getDay()][0]}<b>${W[i].s}</b></div>`}).join('');
$('plans').innerHTML=W.map((w,i)=>`<details ${i===k?'open':''}><summary>D${i+1} · ${w.n}<i>+</i></summary><div>${w.ex.map(x=>`<div class="ex"><span>${x[0]}</span><span>${x[1]?sets(x[1])+' × '+x[2]:x[2]}</span></div>`).join('')}</div></details>`).join('');
$('cal').innerHTML=Array.from({length:90},(_,i)=>{const d=iso(addDays(state.start,i));return `<div class="dc ${state.completed.includes(d)?'d':''} ${d===today?'n':''}">${i+1}</div>`}).join('');
// fuel
const M=[['07:30','Milk + oats + banana',12],['10:30','2–3 eggs',14],['13:30','Dal, rice, roti + curd',16],['17:00','Peanut butter toast',8],['20:30','Paneer or soy + veg',18]];
function meals(){const t=state.meals[today]||[];
$('meals').innerHTML=M.map((m,i)=>`<button class="meal ${t.includes(i)?'on':''}" data-i="${i}" type="button"><span class="tm">${m[0]}</span><b>${m[1]}</b><span class="g">${m[2]}g</span><span class="ck">✓</span></button>`).join('');
const g=t.reduce((a,i)=>a+M[i][2],0);$('fb').style.width=Math.min(100,g/68*100)+'%';$('fTxt').textContent=`${g} / 68 g eaten`}
meals();
$('meals').addEventListener('click',e=>{const b=e.target.closest('.meal');if(!b)return;const i=+b.dataset.i,t=(state.meals[today]||[]).slice(),j=t.indexOf(i);j>-1?t.splice(j,1):t.push(i);state.meals={[today]:t};save();meals()});
// tabs
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{
document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));
document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+b.dataset.v));
window.scrollTo({top:0});if(b.dataset.v==='fuel')meals();if(b.dataset.v==='plan'){const c=$('week').querySelector('.t');if(c)$('week').scrollLeft=c.offsetLeft-22}}));
// player
let ei=0,si=0,rt=null;const P=$('player');
function items(){return W[k].ex}
function paint(){
const it=items()[ei],s=sets(it[1]);
$('pStep').textContent=`${ei+1} / ${items().length}`;
$('pBar').style.width=(ei/items().length*100)+'%';
$('pName').textContent=it[0];$('pFig').dataset.n=it[0];$('pTarget').textContent=s?`${s} × ${it[2]}`:it[2];
$('pSet').textContent=s?`SET ${si+1} OF ${s}`:'TIMED BLOCK';
$('pDots').innerHTML=s?Array.from({length:s},(_,i)=>`<i class="${i<si?'d':i===si?'c':''}"></i>`).join(''):'';
$('pHint').textContent=it[4];$('pBtn').textContent=s?'Set done':'Done';
}
function rest(sec,label){
$('rNext').textContent=label;$('rest').classList.add('on');let left=sec;
const arc=$('rArc');arc.style.transition='none';arc.style.strokeDashoffset=0;void arc.getBoundingClientRect();
arc.style.transition=`stroke-dashoffset ${sec}s linear`;arc.style.strokeDashoffset=691;$('rNum').textContent=left;
clearInterval(rt);rt=setInterval(()=>{left--;$('rNum').textContent=Math.max(0,left);if(left<=0)endRest(true)},1000);
}
function endRest(buzz){clearInterval(rt);$('rest').classList.remove('on');if(buzz&&'vibrate'in navigator)try{navigator.vibrate([150,80,150])}catch(e){}paint()}
$('skip').addEventListener('click',()=>endRest(false));
$('pBtn').addEventListener('click',()=>{
const it=items()[ei],s=sets(it[1]);
if(s&&si<s-1){si++;paint();rest(it[3],`NEXT · SET ${si+1} OF ${s}`);return}
if(ei>=items().length-1){finish();return}
const rs=it[3];ei++;si=0;
if(rs){rest(rs,`NEXT · ${items()[ei][0].toUpperCase()}`);paint()}else paint();
});
function finish(){
if(today!==iso(new Date())||!isW||state.completed.includes(today))return;
state.completed.push(today);save();$('pBar').style.width='100%';$('fin').classList.add('on');
}
$('finBtn').addEventListener('click',()=>location.reload());
sb.addEventListener('click',()=>{if(!isW||isDone)return;ei=0;si=0;paint();P.classList.add('open')});
$('pClose').addEventListener('click',()=>{clearInterval(rt);$('rest').classList.remove('on');P.classList.remove('open')});
// exercise figures: side-view stick figure, 2 poses [hipX,hipY,torso,upperArm,foreArm,thigh,shin,footPitch,thigh2,shin2]
const ST=[90,56,0,0,0,0,0],R=Math.PI/180;
const Wk=[[90,56,0,-35,-10,30,10,0,-20,-35],[90,56,0,35,60,-20,-35,0,30,10]],Cu=[ST,[90,56,0,0,155,0,0]];
const E={
'Warm-up':[...Wk,''],'Easy walk':[...Wk,''],
'Chest press':[[120,84,-90,100,190,95,-5],[120,84,-90,180,180,95,-5],'BD'],
'Incline DB press':[[110,82,-55,100,175,95,-5],[110,82,-55,145,145,95,-5],'D'],
'Shoulder press':[[90,56,0,20,170,0,0],[90,56,0,175,180,0,0],'D'],
'Lateral raise':[ST,[90,56,0,90,90,0,0],'D'],
'Triceps pushdown':[[88,56,8,0,120,0,0],[88,56,8,0,0,0,0],'T'],
'Lat pulldown':[[90,76,-8,175,178,90,0],[90,76,-8,25,115,90,0],'T'],
'Cable row':[[70,76,0,90,90,88,82],[70,76,-4,-30,90,88,82],'F'],
'Face pull':[[90,56,0,90,90,0,0],[90,56,0,60,150,0,0],'F'],
'Dumbbell curl':[...Cu,'D'],'Hammer curl':[...Cu,'D'],'Curl + pushdown':[...Cu,'D'],
'Leg press':[[75,88,-55,60,60,125,40],[75,88,-55,60,60,125,125],'P'],
'Goblet squat':[[90,56,0,30,165,0,0],[72,84,35,50,170,95,-5],'D'],
'Leg curl':[[110,86,-90,-90,-90,90,90],[110,86,-90,-90,-90,90,170],'B'],
'Glute bridge':[[110,98,-90,90,90,125,0],[110,84,-105,90,90,100,0],''],
'Calf raise':[[90,56,0,0,0,0,0,0],[90,52,0,0,0,0,0,30],'D'],
'Plank':[[75,94,80,0,90,-98,-98,-10],[75,92,84,0,90,-98,-98,-10],''],
'Dead bug':[[110,98,-90,180,180,180,90],[110,98,-90,-90,-90,95,95],''],
'Leg raise':[[100,98,-90,90,90,95,95],[100,98,-90,90,90,180,180],''],
'Bird dog':[[70,82,80,0,0,0,-90],[70,82,80,90,90,-90,-90],''],
'Bike intervals':[[80,70,30,70,80,25,-5],[80,70,30,70,80,95,10],'K'],
'Romanian deadlift':[ST,[75,58,75,0,0,8,-8],'D'],
'Walking lunge':[ST,[80,76,0,0,0,90,0,0,-45,-90],''],
'Incline push-up':[[80,80,70,25,25,-110,-110],[80,86,80,60,10,-110,-110],'N'],
'Stretch':[ST,[90,56,-10,170,175,0,0],'']
};
const pt=(o,a,l,up)=>[o[0]+l*Math.sin(a*R),o[1]+(up?-1:1)*l*Math.cos(a*R)];
const mix=(a,b,k)=>{const r=[];for(let i=0;i<10;i++){const x=a[i]??(i>7?a[i-3]:0),y=b[i]??(i>7?b[i-3]:0);r.push(x+(y-x)*k)}return r};
function geo(q){const H=[q[0],q[1]],S=pt(H,q[2],34,1),K=pt(H,q[5],24),K2=pt(H,q[8],24),El=pt(S,q[3],18);return{H,S,hd:pt(S,q[2],13,1),El,Wr:pt(El,q[4],17),K,A:pt(K,q[6],24),K2,A2:pt(K2,q[9],24)}}
function draw(s,n,k){
const e=E[n]||[ST,ST,''],q=mix(e[0],e[1],k),g=geo(q),w0=geo(mix(e[0],e[0],0)).Wr,eq=e[2],c='#f4f3ee',f='#5b5b52',m='#c8ff3c';
const L=(a,b,col,w)=>`<line x1='${a[0].toFixed(1)}' y1='${a[1].toFixed(1)}' x2='${b[0].toFixed(1)}' y2='${b[1].toFixed(1)}' stroke='${col}' stroke-width='${w}' stroke-linecap='round'/>`;
const ft=(P,a)=>{const r=(a-q[7])*R;return[P[0]+9*Math.cos(r),P[1]-9*Math.sin(r)]};
let o=L([10,108.5],[190,108.5],'#262622',2);
if(eq.includes('B'))o+=`<rect x='${g.H[0]-52}' y='${g.H[1]+6}' width='68' height='6' rx='3' fill='#3b3b35'/>`;
if(eq==='N')o+=`<rect x='118' y='98' width='36' height='10' rx='3' fill='#3b3b35'/>`;
if(eq==='K')o+=`<circle cx='36' cy='94' r='14' fill='none' stroke='#3b3b35' stroke-width='3'/><circle cx='124' cy='94' r='14' fill='none' stroke='#3b3b35' stroke-width='3'/>`+L([36,94],[80,78],'#3b3b35',3)+L([80,78],[128,56],'#3b3b35',3)+L([128,56],[124,94],'#3b3b35',3)+L([72,76],[88,76],'#3b3b35',4);
o+=L(g.H,g.K2,f,6)+L(g.K2,g.A2,f,6)+L(g.A2,ft(g.A2,q[9]),f,5);
o+=L(g.H,g.K,c,6.5)+L(g.K,g.A,c,6.5)+L(g.A,ft(g.A,q[6]),c,5);
o+=L(g.H,g.S,c,8)+L(g.S,g.El,c,5.5)+L(g.El,g.Wr,c,5.5)+`<circle cx='${g.hd[0].toFixed(1)}' cy='${g.hd[1].toFixed(1)}' r='7.5' fill='${c}'/>`;
if(eq.includes('D'))o+=`<rect x='${(g.Wr[0]-9).toFixed(1)}' y='${(g.Wr[1]-4).toFixed(1)}' width='18' height='8' rx='3' fill='${m}'/>`;
if(eq==='T')o+=L(g.Wr,[w0[0]+4,0],'#8a8a80',1.5)+`<circle cx='${g.Wr[0].toFixed(1)}' cy='${g.Wr[1].toFixed(1)}' r='4' fill='${m}'/>`;
if(eq==='F')o+=L(g.Wr,[198,w0[1]],'#8a8a80',1.5)+`<circle cx='${g.Wr[0].toFixed(1)}' cy='${g.Wr[1].toFixed(1)}' r='4' fill='${m}'/>`;
if(eq==='P')o+=L([g.A[0]+5,g.A[1]-16],[g.A[0]+5,g.A[1]+16],m,6);
s.innerHTML=o}
document.querySelectorAll('#plans .ex,#nxList .ex').forEach(r=>{const n=r.firstElementChild.textContent;r.firstElementChild.classList.add('nm');r.insertAdjacentHTML('afterbegin',`<svg class="fig th" viewBox="0 0 200 120" data-n="${n}"></svg>`)});
const T0=performance.now(),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
(function loop(now){const k=still?1:.5-.5*Math.cos((now-T0)/2800*2*Math.PI);document.querySelectorAll('.fig').forEach(s=>{if(s.dataset.n&&s.getClientRects().length)draw(s,s.dataset.n,k)});requestAnimationFrame(loop)})(T0);
// preloader
let n=0;const pf=$('pf'),pn=$('pn');
const iv=setInterval(()=>{n=Math.min(100,n+Math.random()*11+4);pf.style.width=n+'%';pn.textContent=Math.floor(n);
if(n>=100){clearInterval(iv);setTimeout(()=>{$('pre').classList.add('out');$('app').classList.add('go');document.body.classList.add('go');
cu($('sCount'),total,v=>v,1400);$('xFill').style.width=Math.min(100,(xp-lo)/(hi-lo)*100)+'%';cu($('sWeek'),wk,v=>v+'/7',1400)},400)}},100);
})();

// offline support
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').then(reg=>{
      reg.addEventListener('updatefound',()=>{
        const w=reg.installing;
        if(!w)return;
        w.addEventListener('statechange',()=>{
          if(w.state==='installed'&&!navigator.serviceWorker.controller){
            const t=document.getElementById('toast');
            if(t){t.textContent='Ready offline \u2713';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
          }
        });
      });
    }).catch(()=>{});
  });
}
