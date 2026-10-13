const toggle=document.querySelector('.mobile-toggle');const nav=document.querySelector('.nav');if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}
const traces=[
  '[domain] sealed market state instantiated',
  '[strategy] 3 competing models retained',
  '[experiment] choose intervention: news × history',
  '[experiment] paired seed 0042 launched',
  '[validation] discovery result recorded',
  '[validation] holdout remains sealed',
  '[knowledge] claim status: provisional',
  '[workbench] next discriminating test proposed'
];
let ti=0;const tr=document.querySelector('.trace');if(tr){setInterval(()=>{const line=document.createElement('div');line.className='trace-line hot';line.textContent=traces[ti%traces.length];tr.appendChild(line);[...tr.children].forEach((x,i,a)=>x.className='trace-line'+(i===a.length-1?' hot':''));while(tr.children.length>6)tr.removeChild(tr.firstChild);ti++;},1450)}
const q=document.querySelector('[data-query]');const claim=document.querySelector('[data-claim]');const layerEls=[...document.querySelectorAll('.layer')];let step=0;if(q){setInterval(()=>{step=(step+1)%6;q.textContent=['24','20','16','12','8','4'][step];if(claim)claim.textContent=['candidate','candidate','provisional','provisional','validated','validated'][step];layerEls.forEach((x,i)=>x.classList.toggle('active',i===step));},1700)}
