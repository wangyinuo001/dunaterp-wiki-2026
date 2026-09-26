/*
 * iGEM Flat-Panel Airlift PBR — live browser widget
 * Pure JavaScript, no external libraries.
 * Double-sided symmetric illumination is fixed by design.
 */
(function(global){
'use strict';

function mountIGEMPBRModel(containerId){
const root=document.getElementById(containerId);
if(!root)throw new Error('Container not found: '+containerId);

root.innerHTML=`
<style>
.pbrw{font-family:Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#17202a;background:linear-gradient(180deg,#fff 0%,#fbfcfe 100%);border:1px solid #e6e9ee;border-radius:18px;padding:20px;box-shadow:0 12px 36px rgba(20,40,80,.08)}
.pbrw h2{margin:0 0 6px;font-size:26px;letter-spacing:-.02em}.pbrw .sub{color:#667085;margin-bottom:16px;font-size:14px;line-height:1.5}
.pbrw-grid{display:grid;grid-template-columns:minmax(260px,330px) 1fr;gap:18px}.pbrw-controls{background:linear-gradient(180deg,#f8fbff 0%,#f6f8fc 100%);border:1px solid #eef2f7;border-radius:14px;padding:14px}
.pbrw-control{margin:10px 0 14px}.pbrw-control label{display:flex;justify-content:space-between;gap:10px;font-size:13px;font-weight:650;margin-bottom:6px}.pbrw-control input[type=range]{width:100%}
.pbrw-plots{display:grid;grid-template-columns:1fr;gap:16px}.pbrw-card{border:1px solid #edf0f5;border-radius:14px;padding:12px 12px 8px;background:linear-gradient(180deg,#fff 0%,#fcfdff 100%);box-shadow:0 6px 20px rgba(30,64,175,.04)}.pbrw-card h3{font-size:16px;margin:2px 0 10px;color:#0f172a;letter-spacing:-.01em}.pbrw canvas{width:100%;height:300px;display:block}
.pbrw-metrics{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:10px;margin-top:14px}.pbrw-metric{background:linear-gradient(180deg,#f8fbff 0%,#f6f8fc 100%);border:1px solid #edf2f7;border-radius:12px;padding:10px 12px}.pbrw-metric b{font-size:18px;display:block}.pbrw-metric span{font-size:12px;color:#667085}
.pbrw-note{font-size:12px;color:#667085;margin-top:10px;line-height:1.6}
@media(max-width:820px){.pbrw-grid{grid-template-columns:1fr}.pbrw-metrics{grid-template-columns:repeat(2,1fr)}}
</style>
<div class="pbrw">
<h2>Live PBR Model — Double-Sided Illumination</h2>
<div class="sub">Drag any slider. Curves update continuously in the browser on every input event — no server round trip.</div>
<div class="pbrw-grid">
<div class="pbrw-controls">
${slider('Xdemo','Optical-profile biomass X','g/L',0.05,3.0,1.0,0.05)}
${slider('Idemo','Per-face optical irradiance','µmol m⁻² s⁻¹',50,2000,500,10)}
${slider('Lmm','Light path L','mm',4,30,10,1)}
${slider('kabs','Absorption coefficient kₐ','m²/kg',50,600,350,10)}
${slider('kscat','Scattering coefficient kₛ','m²/kg',0,500,220,10)}
${slider('Ig','Growth-stage irradiance per face','µmol m⁻² s⁻¹',50,1200,500,10)}
${slider('Ip','Production-stage irradiance per face','µmol m⁻² s⁻¹',200,2500,1600,25)}
${slider('ts','Switching time tₛ','day',0.5,9.0,4.0,0.1)}
</div>
<div class="pbrw-plots">
<div class="pbrw-card"><h3>Optical field G(z) across the panel</h3><canvas id="pbrw-optical"></canvas></div>
<div class="pbrw-card"><h3>Two-stage cultivation response</h3><canvas id="pbrw-culture"></canvas></div>
</div>
</div>
<div class="pbrw-metrics">
<div class="pbrw-metric"><b id="m-center">–</b><span>Center irradiance</span></div>
<div class="pbrw-metric"><b id="m-mean">–</b><span>Mean irradiance</span></div>
<div class="pbrw-metric"><b id="m-xfinal">–</b><span>Final biomass (g/L)</span></div>
<div class="pbrw-metric"><b id="m-pfinal">–</b><span>Final product (mg/L)</span></div>
</div>
<div class="pbrw-note">Scenario-analysis model only. Nominal parameters are illustrative, not experimentally calibrated. Incident-light values are defined per illuminated face; the model applies the same value from the front and rear faces.</div>
</div>`;

function slider(id,label,unit,min,max,value,step){return `<div class="pbrw-control"><label><span>${label}</span><span><b id="${id}-v">${value}</b> ${unit}</span></label><input id="${id}" type="range" min="${min}" max="${max}" value="${value}" step="${step}"></div>`;}

const ids=['Xdemo','Idemo','Lmm','kabs','kscat','Ig','Ip','ts'];
const el=Object.fromEntries(ids.map(id=>[id,root.querySelector('#'+id)]));
ids.forEach(id=>el[id].addEventListener('input',scheduleUpdate));

let scheduled=false;
function scheduleUpdate(){
if(scheduled)return;
scheduled=true;
requestAnimationFrame(()=>{scheduled=false;update();});
}

function values(){
const v={};
ids.forEach(id=>{
v[id]=parseFloat(el[id].value);
root.querySelector('#'+id+'-v').textContent=formatValue(v[id]);
});
return v;
}

function formatValue(v){
return Math.abs(v-Math.round(v))<1e-8?String(Math.round(v)):v.toFixed(v<1?2:1);
}

function tickValue(v){
if(Math.abs(v)>=100)return Math.round(v).toString();
if(Math.abs(v)>=10)return v.toFixed(1).replace(/\.0$/,'');
if(Math.abs(v)>=1)return v.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
return v.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
}

const base={
b:0.10,KI:50,Kinh:400,muMax:0.65,kd:0.03,
KN:0.05,YXN:5.0,alpha:5.0,betaG:0.5,betaP:4.0,
kp:0.01,T:10.0,X0:0.10,N0:0.50,P0:0.0
};

function twoFlux(X,I0,Lm,kabs,kscat,n=81){
const b=base.b,s=b*kscat*X,k=kabs*X,a=k+s;
const lam=Math.sqrt(Math.max(a*a-s*s,0)),z=[],G=[];
if(X<1e-12||I0<=0){
for(let i=0;i<n;i++){z.push(Lm*i/(n-1));G.push(2*I0);}
return{z,G};
}
if(lam<1e-12){
for(let i=0;i<n;i++){
const zz=Lm*i/(n-1);
z.push(zz);
G.push(I0*Math.exp(-k*zz)+I0*Math.exp(-k*(Lm-zz)));
}
return{z,G};
}
const cL=Math.cosh(lam*Lm),hL=Math.sinh(lam*Lm)/lam;
const E21=-s*hL,E22=cL+a*hL,Im0=(I0-E21*I0)/E22;
for(let i=0;i<n;i++){
const zz=Lm*i/(n-1),c=Math.cosh(lam*zz),h=Math.sinh(lam*zz)/lam;
const Ip=Math.max(0,(c-a*h)*I0+s*h*Im0);
const Im=Math.max(0,-s*h*I0+(c+a*h)*Im0);
z.push(zz);
G.push(Ip+Im);
}
return{z,G};
}

function meanLight(X,I0,Lm,kabs,kscat){
const o=twoFlux(X,I0,Lm,kabs,kscat,41);
let area=0;
for(let i=1;i<o.z.length;i++)area+=0.5*(o.G[i-1]+o.G[i])*(o.z[i]-o.z[i-1]);
return area/Lm;
}

function rawLight(I){return I<=0?0:I/(base.KI+I+I*I/base.Kinh);}
function lightFactor(I){const opt=Math.sqrt(base.KI*base.Kinh);return Math.max(0,Math.min(1,rawLight(I)/rawLight(opt)));}
function nutrientFactor(N){return N<=0?0:N/(base.KN+N);}

function deriv(t,y,v){
const X=Math.max(0,y[0]),N=Math.max(0,y[1]),P=Math.max(0,y[2]);
const I0=t<v.ts?v.Ig:v.Ip,beta=t<v.ts?base.betaG:base.betaP;
const Im=meanLight(X,I0,v.Lmm/1000,v.kabs,v.kscat);
const mu=base.muMax*lightFactor(Im)*nutrientFactor(N);
const dX=(mu-base.kd)*X;
let dN=-(mu*X)/base.YXN;
if(N<=0&&dN<0)dN=0;
const dP=(base.alpha*mu+beta)*X-base.kp*P;
return[dX,dN,dP];
}

function add(y,k,scale){return y.map((v,i)=>v+scale*k[i]);}

function culture(v){
const dt=0.04,n=Math.round(base.T/dt),t=[],X=[],P=[];
let y=[base.X0,base.N0,base.P0];
for(let i=0;i<=n;i++){
const tt=i*dt;
t.push(tt);X.push(y[0]);P.push(y[2]);
if(i===n)break;
const k1=deriv(tt,y,v);
const k2=deriv(tt+dt/2,add(y,k1,dt/2),v);
const k3=deriv(tt+dt/2,add(y,k2,dt/2),v);
const k4=deriv(tt+dt,add(y,k3,dt),v);
y=y.map((vv,j)=>Math.max(0,vv+dt*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6));
}
return{t,X,P};
}

function setupCanvas(canvas){
const dpr=window.devicePixelRatio||1;
const rect=canvas.getBoundingClientRect();
const w=Math.max(320,rect.width),h=300;
const targetW=Math.round(w*dpr),targetH=Math.round(h*dpr);
if(canvas.width!==targetW||canvas.height!==targetH){
canvas.width=targetW;
canvas.height=targetH;
}
const ctx=canvas.getContext('2d');
ctx.setTransform(dpr,0,0,dpr,0,0);
ctx.clearRect(0,0,w,h);
return{ctx,w,h};
}

function roundRect(ctx,x,y,w,h,r){
ctx.beginPath();
ctx.moveTo(x+r,y);
ctx.arcTo(x+w,y,x+w,y+h,r);
ctx.arcTo(x+w,y+h,x,y+h,r);
ctx.arcTo(x,y+h,x,y,r);
ctx.arcTo(x,y,x+w,y,r);
ctx.closePath();
}

function mapPoint(x,y,xmin,xmax,ymin,ymax,w,h,m){
return[
m.l+(x-xmin)/(xmax-xmin)*(w-m.l-m.r),
h-m.b-(y-ymin)/(ymax-ymin)*(h-m.t-m.b)
];
}

function drawFrame(ctx,w,h,m){
const x=m.l,y=m.t,pw=w-m.l-m.r,ph=h-m.t-m.b;
roundRect(ctx,x,y,pw,ph,12);
const bg=ctx.createLinearGradient(0,y,0,y+ph);
bg.addColorStop(0,'#fcfdff');
bg.addColorStop(1,'#f8fbff');
ctx.fillStyle=bg;
ctx.fill();
ctx.strokeStyle='#e7edf5';
ctx.lineWidth=1;
ctx.stroke();
}

function drawAxes(ctx,w,h,m,xlabel,ylabel){
ctx.strokeStyle='#cbd5e1';
ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(m.l,m.t);
ctx.lineTo(m.l,h-m.b);
ctx.lineTo(w-m.r,h-m.b);
ctx.stroke();

ctx.fillStyle='#64748b';
ctx.font='12px system-ui';
ctx.textAlign='center';
ctx.fillText(xlabel,(m.l+w-m.r)/2,h-8);

ctx.save();
ctx.translate(14,(m.t+h-m.b)/2);
ctx.rotate(-Math.PI/2);
ctx.fillText(ylabel,0,0);
ctx.restore();
}

function drawGrid(ctx,w,h,m,bounds){
const[xmin,xmax,ymin,ymax]=bounds;
ctx.strokeStyle='#e9eef5';
ctx.lineWidth=1;

for(let i=0;i<=4;i++){
const x=xmin+(xmax-xmin)*i/4;
const p=mapPoint(x,ymin,...bounds,w,h,m);
ctx.beginPath();
ctx.moveTo(p[0],m.t);
ctx.lineTo(p[0],h-m.b);
ctx.stroke();
}

for(let i=0;i<=4;i++){
const y=ymin+(ymax-ymin)*i/4;
const p=mapPoint(xmin,y,...bounds,w,h,m);
ctx.beginPath();
ctx.moveTo(m.l,p[1]);
ctx.lineTo(w-m.r,p[1]);
ctx.stroke();
}
}

function drawTicks(ctx,w,h,m,bounds){
const[xmin,xmax,ymin,ymax]=bounds;
ctx.fillStyle='#64748b';
ctx.font='11px system-ui';

for(let i=0;i<=4;i++){
const x=xmin+(xmax-xmin)*i/4;
const p=mapPoint(x,ymin,...bounds,w,h,m);
ctx.textAlign='center';
ctx.fillText(tickValue(x),p[0],h-m.b+16);
}

for(let i=0;i<=4;i++){
const y=ymin+(ymax-ymin)*i/4;
const p=mapPoint(xmin,y,...bounds,w,h,m);
ctx.textAlign='right';
ctx.fillText(tickValue(y),m.l-8,p[1]+4);
}
}

function drawArea(ctx,xs,ys,bounds,w,h,m,topColor,bottomColor){
const[xmin,xmax,ymin,ymax]=bounds;
const baseY=mapPoint(xs[0],ymin,xmin,xmax,ymin,ymax,w,h,m)[1];
ctx.beginPath();
const p0=mapPoint(xs[0],ys[0],xmin,xmax,ymin,ymax,w,h,m);
ctx.moveTo(p0[0],baseY);
ctx.lineTo(p0[0],p0[1]);

for(let i=1;i<xs.length;i++){
const p=mapPoint(xs[i],ys[i],xmin,xmax,ymin,ymax,w,h,m);
ctx.lineTo(p[0],p[1]);
}

const pLast=mapPoint(xs[xs.length-1],ys[ys.length-1],xmin,xmax,ymin,ymax,w,h,m);
ctx.lineTo(pLast[0],baseY);
ctx.closePath();

const grad=ctx.createLinearGradient(0,m.t,0,h-m.b);
grad.addColorStop(0,topColor);
grad.addColorStop(1,bottomColor);
ctx.fillStyle=grad;
ctx.fill();
}

function drawLine(ctx,xs,ys,bounds,w,h,m,color,width=2.8,shadow='rgba(37,99,235,.16)'){
ctx.save();
ctx.strokeStyle=color;
ctx.lineWidth=width;
ctx.lineJoin='round';
ctx.lineCap='round';
ctx.shadowColor=shadow;
ctx.shadowBlur=8;
ctx.beginPath();

for(let i=0;i<xs.length;i++){
const p=mapPoint(xs[i],ys[i],...bounds,w,h,m);
if(i===0)ctx.moveTo(p[0],p[1]);
else ctx.lineTo(p[0],p[1]);
}

ctx.stroke();
ctx.restore();
}

function drawMarker(ctx,x,y,bounds,w,h,m,color,label){
const[px,py]=mapPoint(x,y,...bounds,w,h,m);
ctx.fillStyle='#fff';
ctx.beginPath();
ctx.arc(px,py,4.5,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle=color;
ctx.lineWidth=2;
ctx.stroke();

if(label){
ctx.fillStyle=color;
ctx.font='11px system-ui';
ctx.textAlign='center';
ctx.fillText(label,px,py-10);
}
}

function drawBand(ctx,x0,x1,bounds,w,h,m,fill,label){
const[xmin,xmax,ymin,ymax]=bounds;
const p0=mapPoint(x0,ymin,xmin,xmax,ymin,ymax,w,h,m);
const p1=mapPoint(x1,ymax,xmin,xmax,ymin,ymax,w,h,m);
const left=Math.min(p0[0],p1[0]),right=Math.max(p0[0],p1[0]);

ctx.fillStyle=fill;
ctx.fillRect(left,m.t,right-left,h-m.t-m.b);

if(label){
ctx.fillStyle='rgba(71,85,105,.85)';
ctx.font='11px system-ui';
ctx.textAlign='center';
ctx.fillText(label,(left+right)/2,m.t+14);
}
}

function drawOptical(v){
const c=root.querySelector('#pbrw-optical');
const{ctx,w,h}=setupCanvas(c);
const o=twoFlux(v.Xdemo,v.Idemo,v.Lmm/1000,v.kabs,v.kscat,121);
const x=o.z.map(z=>z*1000);

const dataMax=Math.max(...o.G);
const ymax=Math.max(dataMax*1.12,1);
const bounds=[0,v.Lmm,0,ymax];
const m={l:58,r:18,t:14,b:42};

drawFrame(ctx,w,h,m);

const edge=Math.max(v.Lmm*.08,.6);
drawBand(ctx,0,Math.min(edge,v.Lmm/2),bounds,w,h,m,'rgba(59,130,246,.05)','front');
drawBand(ctx,Math.max(v.Lmm-edge,v.Lmm/2),v.Lmm,bounds,w,h,m,'rgba(59,130,246,.05)','rear');

drawGrid(ctx,w,h,m,bounds);
drawAxes(ctx,w,h,m,'Depth z (mm)','Irradiance G');
drawTicks(ctx,w,h,m,bounds);
drawArea(ctx,x,o.G,bounds,w,h,m,'rgba(37,99,235,.24)','rgba(37,99,235,.03)');
drawLine(ctx,x,o.G,bounds,w,h,m,'#2563eb',2.8,'rgba(37,99,235,.18)');

const mean=meanLight(v.Xdemo,v.Idemo,v.Lmm/1000,v.kabs,v.kscat);
const mid=Math.floor(o.G.length/2);
const center=o.G[mid];

ctx.save();
ctx.strokeStyle='rgba(59,130,246,.42)';
ctx.setLineDash([6,4]);
const p1=mapPoint(0,mean,...bounds,w,h,m);
const p2=mapPoint(v.Lmm,mean,...bounds,w,h,m);
ctx.beginPath();
ctx.moveTo(p1[0],p1[1]);
ctx.lineTo(p2[0],p2[1]);
ctx.stroke();
ctx.restore();

drawMarker(ctx,x[mid],center,bounds,w,h,m,'#1d4ed8','center');

root.querySelector('#m-center').textContent=center.toFixed(1);
root.querySelector('#m-mean').textContent=mean.toFixed(1);
}

function drawCulture(v){
const c=root.querySelector('#pbrw-culture');
const{ctx,w,h}=setupCanvas(c);
const o=culture(v);

const dataMax=Math.max(...o.P);
const ymax=Math.max(dataMax*1.12,1);
const bounds=[0,base.T,0,ymax];
const m={l:58,r:18,t:14,b:42};

drawFrame(ctx,w,h,m);
drawBand(ctx,0,v.ts,bounds,w,h,m,'rgba(14,165,233,.05)','growth stage');
drawBand(ctx,v.ts,base.T,bounds,w,h,m,'rgba(217,70,239,.05)','production stage');

drawGrid(ctx,w,h,m,bounds);
drawAxes(ctx,w,h,m,'Time (day)','Product P (mg/L)');
drawTicks(ctx,w,h,m,bounds);
drawArea(ctx,o.t,o.P,bounds,w,h,m,'rgba(217,70,239,.25)','rgba(217,70,239,.03)');
drawLine(ctx,o.t,o.P,bounds,w,h,m,'#d946ef',2.8,'rgba(217,70,239,.16)');

const sx=mapPoint(v.ts,0,...bounds,w,h,m)[0];
ctx.save();
ctx.strokeStyle='#94a3b8';
ctx.setLineDash([5,4]);
ctx.beginPath();
ctx.moveTo(sx,m.t);
ctx.lineTo(sx,h-m.b);
ctx.stroke();
ctx.restore();

ctx.fillStyle='#64748b';
ctx.font='11px system-ui';
ctx.textAlign='left';
ctx.fillText('tₛ',sx+6,m.t+18);

const finalP=o.P[o.P.length-1];
drawMarker(ctx,base.T,finalP,bounds,w,h,m,'#c026d3','final');

root.querySelector('#m-xfinal').textContent=o.X[o.X.length-1].toFixed(3);
root.querySelector('#m-pfinal').textContent=finalP.toFixed(2);
}

function update(){
const v=values();
drawOptical(v);
drawCulture(v);
}

window.addEventListener('resize',scheduleUpdate);
update();
}

global.mountIGEMPBRModel=mountIGEMPBRModel;
})(window);