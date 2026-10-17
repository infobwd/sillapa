// D3D-R16B — lightweight procedural low-poly vehicle silhouettes.
// Artist references provided 17 Oct 2026: blue sedan, blue city bus,
// white passenger van and white ten-wheel freight truck. No image files used.
import * as THREE from 'three';

function material(hex,metalness=0){
 return new THREE.MeshStandardMaterial({color:hex,roughness:.64,metalness,flatShading:true});
}
function piece(group,geo,mat,x,y,z){
 const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;
}
function box(group,w,h,l,mat,x,y,z){
 return piece(group,new THREE.BoxGeometry(w,h,l),mat,x,y,z);
}
function wheel(group,x,z,r=.36,duals=false){
 const tire=material('#252b33'),hub=material('#9aa6ae',.3);
 function addWheel(xx,rr){
  const a=piece(group,new THREE.CylinderGeometry(rr,rr,.20,10),tire,xx,rr+.08,z);
  a.rotation.z=Math.PI/2;
  const side=Math.sign(xx)||1;
  const b=piece(group,new THREE.CylinderGeometry(rr*.57,rr*.57,.218,10),hub,xx+side*.008,rr+.08,z);
  b.rotation.z=Math.PI/2;
 }
 addWheel(x,r);
 if(duals)addWheel(x-Math.sign(x)*.245,r);
}
function wheels(group,x,zs,r=.36,duals=false){
 for(const side of [-1,1])for(const z of zs)wheel(group,side*x,z,r,duals);
}
function polygon(group,verts,mat){
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(verts.flat(),3));
 geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();
 const face=new THREE.Mesh(geo,mat);face.material.side=THREE.DoubleSide;
 group.add(face);return face;
}
// Extrude a car silhouette (world z,y profile) across the world x axis.
// Local -Z is the front of every vehicle, preserving existing path rotations.
function silhouette(group,profile,width,paint){
 const shape=new THREE.Shape();
 profile.forEach(([z,y],i)=>i?shape.lineTo(-z,y):shape.moveTo(-z,y));
 shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:width,steps:1,bevelEnabled:false});
 geo.rotateY(Math.PI/2);geo.translate(-width/2,0,0);
 return piece(group,geo,paint,0,0,0);
}
function lights(group,width,frontZ,backZ,frontY,backY){
 const white=material('#e8f6ff'),red=material('#dd4550'),amber=material('#eaa84c');
 for(const sign of [-1,1]){
  box(group,.31,.12,.045,white,sign*(width/2-.24),frontY,frontZ);
  box(group,.32,.13,.055,red,sign*(width/2-.23),backY,backZ);
  box(group,.08,.11,.055,amber,sign*(width/2-.44),frontY,frontZ);
 }
}

export function makeModernSedan(color='#3375b7'){
 const g=new THREE.Group(),paint=material(color,.12),trim=material('#1c2630'),
  glass=material('#283a48',.14),chrome=material('#b7c7d0',.3);
 silhouette(g,[
  [-1.72,.57],[-1.72,.89],[-1.00,1.08],[-.49,1.75],
  [.60,1.78],[1.21,1.07],[1.70,.97],[1.70,.57]
 ],1.67,paint);
 // Slanted windscreen and rear glass reproduce the reference's low-poly cabin.
 polygon(g,[[-.70,1.13,-.98],[.70,1.13,-.98],[.67,1.71,-.48],[-.67,1.71,-.48]],glass);
 polygon(g,[[-.66,1.70,.63],[.66,1.70,.63],[.72,1.12,1.20],[-.72,1.12,1.20]],glass);
 for(const side of [-1,1]){
  polygon(g,[
   [side*.845,1.12,-.89],[side*.845,1.68,-.42],
   [side*.845,1.68,.51],[side*.845,1.12,1.10]
  ],glass);
  box(g,.035,.46,.055,trim,side*.86,1.43,.10);
  box(g,.10,.10,.21,trim,side*.91,1.27,-.65); // mirror
  for(const z of [-.15,.78])box(g,.06,.07,.17,chrome,side*.86,.95,z);
 }
 box(g,1.39,.23,.12,trim,0,.66,-1.75); // dark sculpted grille
 box(g,1.30,.05,.12,chrome,0,.60,-1.78);
 box(g,1.53,.18,.10,trim,0,.59,1.70);
 lights(g,1.67,-1.77,1.74,.94,.95);
 wheels(g,.85,[-1.05,1.08],.36);
 g.userData.vehicleKind='sedan';g.userData.vehicleLength=3.50;
 return g;
}

export function makeModernVan(color='#eff1f0'){
 const g=new THREE.Group(),paint=material(color,.07),glass=material('#26313b',.12),
 trim=material('#242b32'),chrome=material('#c3ccd0',.2);
 silhouette(g,[
  [-2.15,.52],[-2.15,.96],[-1.70,2.18],[-1.28,2.46],
  [1.79,2.48],[2.12,2.25],[2.12,.52]
 ],1.92,paint);
 polygon(g,[[-.84,1.18,-2.15],[.84,1.18,-2.15],
  [.83,2.19,-1.66],[-.83,2.19,-1.66]],glass);
 for(const side of [-1,1]){
  // Dark tinted panoramic side windows and sliding-door vertical seam.
  for(const [z,len] of [[-.94,.98],[.24,1.06],[1.30,.72]]){
   box(g,.035,.79,len,glass,side*.972,1.86,z);
  }
  box(g,.045,1.38,.045,trim,side*.988,1.30,-.25);
  box(g,.045,.90,.045,trim,side*.989,1.26,.90);
  box(g,.18,.17,.28,trim,side*1.08,1.40,-1.42); // wing mirror
  box(g,.05,.07,.23,trim,side*.984,1.07,.19); // door handle
  box(g,.11,.46,.08,material('#df5051'),side*.83,1.12,2.16);
 }
 box(g,1.59,.44,.08,trim,0,.80,-2.18);
 box(g,1.22,.10,.084,chrome,0,.71,-2.24);
 box(g,1.74,.20,.13,trim,0,.56,2.19);
 lights(g,1.9,-2.22,2.19,1.08,1.11);
 wheels(g,.95,[-1.31,1.34],.39);
 g.userData.vehicleKind='van';g.userData.vehicleLength=4.4;
 return g;
}

export function makeModernBlueBus(color='#2670b8'){
 const g=new THREE.Group(),paint=material(color),glass=material('#202b33',.14),
 trim=material('#1c262e'),chrome=material('#b7c5cf',.25),yellow=material('#d8b46c');
 silhouette(g,[
  [-3.46,.53],[-3.46,2.37],[-3.25,2.74],[3.21,2.74],
  [3.45,2.48],[3.45,.53]
 ],2.16,paint);
 box(g,1.95,1.45,.055,glass,0,1.82,-3.475); // panoramic windscreen
 box(g,1.88,.28,.07,trim,0,.83,-3.48);
 for(const side of [-1,1]){
  // Continuous dark-tinted side glazing, panes and two tall entry doors.
  box(g,.044,.97,5.90,glass,side*1.096,1.91,.06);
  for(const z of [-2.19,-1.06,.07,1.18,2.25])
   box(g,.065,1.05,.052,trim,side*1.128,1.89,z);
  for(const z of [-1.78,.94]){
   box(g,.075,1.85,.90,glass,side*1.138,1.26,z);
   box(g,.090,1.86,.060,chrome,side*1.152,1.24,z);
   box(g,.084,.07,.93,chrome,side*1.155,.38,z);
  }
  box(g,.19,.28,.31,trim,side*1.21,2.02,-3.13);
  for(const z of [-1.95,2.12])box(g,.07,.11,.23,yellow,side*1.11,.96,z);
 }
 for(const side of [-1,1]){
  box(g,.32,.13,.06,material('#e7f5ff'),side*.79,.94,-3.50);
  box(g,.24,.18,.06,material('#d95654'),side*.83,1.00,3.51);
 }
 box(g,1.86,.32,.10,trim,0,.63,-3.51);
 box(g,1.82,.13,.08,chrome,0,.53,-3.56);
 box(g,1.93,.12,6.50,chrome,0,2.77,0); // streamlined roof highlight
 wheels(g,1.1,[-2.10,2.20],.48);
 g.userData.vehicleKind='bus';g.userData.vehicleLength=7.10;
 return g;
}

export function makeTenWheelFreightTruck(){
 const g=new THREE.Group(),white=material('#e8ebec'),silver=material('#c5c9ca'),
  metal=material('#848f96',.2),glass=material('#293640',.15),trim=material('#242c35');
 // Forward white cab, long ribbed grey cargo body and distinct double rear axles.
 silhouette(g,[[-3.80,.65],[-3.80,1.30],[-3.42,2.35],
  [-2.19,2.60],[-1.48,2.60],[-1.48,.65]],2.20,white);
 polygon(g,[[-.98,1.42,-3.77],[.98,1.42,-3.77],
  [.96,2.29,-3.42],[-.96,2.29,-3.42]],glass);
 for(const side of [-1,1]){
  box(g,.04,.68,.64,glass,side*1.112,1.94,-2.24);
  box(g,.12,.24,.24,trim,side*1.18,1.87,-3.14);
 }
 box(g,2.20,.27,5.15,metal,0,.77,.88); // continuous load-bearing chassis
 box(g,2.19,1.62,4.82,silver,0,1.75,1.16); // rear cargo
 for(const side of [-1,1]){
  for(let z=-.96;z<=3.15;z+=.77)
   box(g,.045,1.44,.075,metal,side*1.12,1.77,z);
  box(g,.08,.13,4.65,metal,side*1.16,1.07,1.16);
 }
 for(let z=-1.10;z<=3.26;z+=.89){
  box(g,2.22,.08,.065,metal,0,2.51,z);
 }
 box(g,2.16,.22,.14,trim,0,.75,-3.87);
 box(g,1.64,.43,.11,trim,0,1.04,-3.87); // grille
 for(const side of [-1,1]){
  box(g,.31,.13,.07,material('#e7f4fb'),side*.79,1.16,-3.88);
  box(g,.27,.24,.065,material('#bd4f50'),side*.86,1.11,3.61);
 }
 wheels(g,1.08,[-2.78],.48,false);
 wheels(g,1.10,[1.18,2.82],.47,true); // 2 singles + 8 dual wheels
 g.userData.vehicleKind='truck10';g.userData.vehicleLength=7.7;
 return g;
}
