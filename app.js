import * as THREE from 'three/webgpu';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {texture,uv,positionWorld,cameraPosition,normalWorldGeometry,normalize,uniform,color,vec3,vec4,mix,max,step,output,bumpMap} from 'three/tsl';
import {gsap} from 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/index.js';

const canvas=document.querySelector('#globe'), loader=document.querySelector('#loader'), percent=loader.querySelector('b'), fallback=document.querySelector('#fallback');
let renderer,scene,camera,controls,globe,clock;

async function init(){
 if(!navigator.gpu){fallback.hidden=false;loader.classList.add('loader-out');return;}
 try{
  renderer=new THREE.WebGPURenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); await renderer.init();
  scene=new THREE.Scene(); scene.background=new THREE.Color(0x020205);
  camera=new THREE.PerspectiveCamera(25,innerWidth/innerHeight,.1,100); camera.position.set(4.5,2,3.2);
  const sun=new THREE.DirectionalLight('#fff',2); sun.position.set(0,0,3); scene.add(sun);
  const dayColor=uniform(color('#4db2ff')), twilight=uniform(color('#bc490b'));
  const tl=new THREE.TextureLoader();
  const day=tl.load('https://threejs.org/examples/textures/planets/earth_day_4096.jpg');
  const night=tl.load('https://threejs.org/examples/textures/planets/earth_night_4096.jpg');
  const bump=tl.load('https://threejs.org/examples/textures/planets/earth_bump_roughness_clouds_4096.jpg');
  day.colorSpace=THREE.SRGBColorSpace; night.colorSpace=THREE.SRGBColorSpace; day.anisotropy=8; night.anisotropy=8; bump.anisotropy=8;
  const view=positionWorld.sub(cameraPosition).normalize();
  const fresnel=view.dot(normalWorldGeometry).abs().oneMinus().toVar();
  const sunOrientation=normalWorldGeometry.dot(normalize(sun.position)).toVar();
  const atmosphere=mix(twilight,dayColor,sunOrientation.smoothstep(-.25,.75));
  const mat=new THREE.MeshStandardNodeMaterial();
  const clouds=texture(bump,uv()).b.smoothstep(.2,1);
  mat.colorNode=mix(texture(day),vec3(1),clouds.mul(2));
  mat.roughnessNode=max(texture(bump).g,step(.01,clouds)).remap(0,1,.25,.35);
  const dayStrength=sunOrientation.smoothstep(-.25,.5);
  let out=mix(texture(night).rgb,output.rgb,dayStrength);
  out=mix(out,atmosphere,sunOrientation.smoothstep(-.5,1).mul(fresnel.pow(2)).clamp(0,1));
  mat.outputNode=vec4(out,output.a); mat.normalNode=bumpMap(max(texture(bump).r,clouds));
  const geo=new THREE.SphereGeometry(1,64,64); globe=new THREE.Mesh(geo,mat); scene.add(globe);
  const am=new THREE.MeshBasicNodeMaterial({side:THREE.BackSide,transparent:true}); let alpha=fresnel.remap(.73,1,1,0).pow(3); alpha=alpha.mul(sunOrientation.smoothstep(-.5,1)); am.outputNode=vec4(atmosphere,alpha);
  const atm=new THREE.Mesh(geo,am); atm.scale.setScalar(1.045); scene.add(atm);
  addStars(); addKathmandu();
  controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.enablePan=false; controls.minDistance=2; controls.maxDistance=8;
  addEventListener('resize',resize); clock=new THREE.Timer(); clock.connect(document); renderer.setAnimationLoop(animate); animateLoader();
 }catch(e){console.error(e);fallback.hidden=false;loader.classList.add('loader-out');}
}
function addStars(){const p=new Float32Array(2600*3);for(let i=0;i<p.length;i+=3){const r=18+Math.random()*22,t=Math.random()*Math.PI*2,f=Math.acos(2*Math.random()-1);p[i]=r*Math.sin(f)*Math.cos(t);p[i+1]=r*Math.cos(f);p[i+2]=r*Math.sin(f)*Math.sin(t)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:.025,transparent:true,opacity:.75})))}
function addKathmandu(){const m=new THREE.Mesh(new THREE.SphereGeometry(.026,16,16),new THREE.MeshBasicMaterial({color:0xe4ba14}));const lat=27.7172*Math.PI/180,lon=85.324*Math.PI/180;m.position.set(Math.cos(lat)*Math.cos(lon),Math.sin(lat),Math.cos(lat)*Math.sin(lon));globe.add(m)}
function animateLoader(){const o={v:0};gsap.to(o,{v:100,duration:1.3,ease:'power2.out',onUpdate:()=>percent.textContent=`${Math.round(o.v).toString().padStart(2,'0')}%`,onComplete:()=>loader.classList.add('loader-out')})}
function animate(){clock.update();globe.rotation.y+=clock.getDelta()*.018;controls.update();renderer.render(scene,camera)}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
init();
