/**
 * D3D-R16B — geometry & vehicle regressions, no GitHub Actions required.
 * Run: node --test tests/d3d-r16-traffic-parking.test.mjs tests/d3d-r16b-vehicles-parking-paths.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {computeHighwayProgress} from '../venues/traffic-r16.mjs';

const scene=readFileSync(new URL('../venues/schematic-3d.html',import.meta.url),'utf8');
const models=readFileSync(new URL('../venues/vehicle-models-r16b.mjs',import.meta.url),'utf8');
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');

function minimumSeparation(route,rect){
 const [xmin,xmax,zmin,zmax]=rect;
 let nearest=Infinity;
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i];
  for(let n=0;n<=200;n++){
   const t=n/200,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   const dx=Math.max(xmin-x,0,x-xmax),dz=Math.max(zmin-z,0,z-zmax);
   nearest=Math.min(nearest,Math.hypot(dx,dz));
  }
 }
 return nearest;
}
const wcBypass=[
 [-8.5,19],[-11.38,18],[-11.38,14.7],[-11.38,10.8],
 [-11.38,5],[-11.38,-7.45],[-6.65,-7.45],[-5.0,-6.9],[-4.3,-6.2]
];
test('marked pedestrian shoulder clears Building 1 and dome restrooms',()=>{
 // Both toilet boxes (center -8.75, outer width 3.5, depth 4.2).
 assert.ok(minimumSeparation(wcBypass,[-10.5,-7,5.9,10.1])>.30);
 assert.ok(minimumSeparation(wcBypass,[-10.5,-7,-6.1,-1.9])>.30);
 assert.match(scene,/slab\(\.58,25\.5,-11\.38,4\.7/);
 assert.match(scene,/const bypass=isDistrict&&\(routeIndex===0\|\|routeIndex===1\)/);
 assert.match(scene,/toRegistrationWaypoints\(b\.bay\[0\]-1\.4-j\*\.34,line,j\)/);
});
test('extension parking sits at photographed rear frontage, not east wall',()=>{
 const match=scene.match(/const epX=([\d.]+),epZ=(-?[\d.]+),epW=([\d.]+),epL=([\d.]+)/);
 assert.ok(match);
 const [x,z,width,depth]=match.slice(1).map(Number);
 assert.ok(Math.abs(z+depth/2-(-19.2))<.02,'attached at rear wall');
 assert.ok(z-depth/2> -25,'does not intersect road z=-27 width 4');
 assert.ok(Math.abs(x)+width/2<=5.4,'within extension footprint');
 assert.match(scene,/\{x:-3\.50,z:-21\.30,angle:0\}/);
 assert.match(scene,/\{x:0,z:-21\.30,angle:0\}/);
 assert.match(scene,/\{x:3\.50,z:-21\.30,angle:0\}/);
 assert.doesNotMatch(scene,/epX=7\.87,epZ=-17/);
});
test('low-poly reference vehicles are modeled distinctly',()=>{
 for(const signature of ['makeModernSedan','makeModernVan','makeModernBlueBus','makeTenWheelFreightTruck']){
  assert.match(models,new RegExp('export function '+signature+'\\('));
  assert.match(scene,new RegExp(signature));
 }
 for(const kind of ['sedan','van','bus','truck10'])
  assert.match(models,new RegExp("vehicleKind='"+kind+"'"));
 assert.match(models,/wheels\(g,1\.10,\[1\.18,2\.82\],\.47,true\)/);
 assert.match(models,/panoramic windscreen/);
 assert.match(models,/sliding-door vertical seam/);
 assert.match(models,/dark sculpted grille/);
});
test('10 vehicles on highway have two freight trucks and two blue buses',()=>{
 const start=scene.indexOf('function addMainRoadTraffic(root){');
 const end=scene.indexOf('\n// D3D-R7:',start);
 assert.ok(start>=0&&end>start);
 const fleet=scene.slice(start,end);
 assert.equal((fleet.match(/lane:49\.25/g)||[]).length,5);
 assert.equal((fleet.match(/lane:54\.75/g)||[]).length,5);
 assert.equal((fleet.match(/makeTenWheelFreightTruck\(\)/g)||[]).length,2);
 assert.equal((fleet.match(/makeRoadBus\('#/g)||[]).length,2);
 const cars=[49.25,54.75].flatMap((lane,i)=>[0,.2,.4,.6,.8].map(phase=>({
  lane,direction:i===0?1:-1,travel:114,speed:2.9,highwayProgress:phase*114
 })));
 const travel=[0,0];
 for(let frame=0;frame<300*60;frame++){
  const t=frame/60,occupant=t>40&&t<60?[{x:18+(t-40)*2,z:49.25}]:[];
  const changes=computeHighwayProgress(cars,occupant,1/60);
  for(let i=0;i<cars.length;i++){
   const c=cars[i],old=c.highwayProgress,next=changes.get(c);
   c.highwayProgress=next;
   travel[i<5?0:1]+=(next-old+114)%114;
  }
  for(let side=0;side<2;side++){
   const positions=cars.slice(side*5,side*5+5).map(c=>c.highwayProgress).sort((a,b)=>a-b);
   for(let k=0;k<5;k++)
    assert.ok((positions[(k+1)%5]-positions[k]+114)%114>=9.999,'minimum headway');
  }
 }
 assert.ok(travel[0]/5>300,'eastbound buses circulate');
 assert.ok(travel[1]/5>300,'westbound buses circulate');
});
test('R16C PWA retains R16B models and refreshes venue links',()=>{
 assert.match(sw,/sillapa-public-v24-3d-r17b-20261017/);
 assert.match(sw,/venues\/traffic-r16\.mjs/);
 assert.match(sw,/venues\/vehicle-models-r16b\.mjs/);
 assert.match(sw,/m\?js/);
 assert.match(index,/venue=kanchanaburi-pesa4&v=r17b/);
 assert.match(index,/venue=anuban-bophloi&v=r17b/);
});
