/**
 * D3D-R18 — schematic campus pedestrian wayfinding.
 *
 * Pure graph and interpolation functions only. Coordinates reflect the
 * illustrative Sillapa 74 3D scene, NOT a verified site survey or route
 * approved for real-world access, traffic safety or accessibility.
 *
 * The connected walking spine is deliberately on the east-side shoulder,
 * outside the R17B vehicle-only bay. It reuses the R17B dome-to-Building 1
 * handoff rather than drawing a new shortcut across road/room geometry.
 */
export const WAYFINDING_STOPS=Object.freeze([
 Object.freeze({id:'dropoff',label:'จุดลงรถ (ทางเท้า)',short:'จุดลงรถ',icon:'🚶'}),
 Object.freeze({id:'registration',label:'โดมลงทะเบียน (จำลอง)',short:'โดมลงทะเบียน',icon:'📝'}),
 Object.freeze({id:'building1',label:'อาคาร 1 (ทางเข้า)',short:'อาคาร 1',icon:'🏫'}),
 Object.freeze({id:'building2',label:'อาคาร 2 (จุดหน้าอาคาร)',short:'อาคาร 2',icon:'🏢'}),
 Object.freeze({id:'meeting2',label:'ห้องประชุมชั้น 2 (จำลอง)',short:'ห้องประชุมชั้น 2',icon:'👥'})
]);

// [world-X, world-Z, elevation]. Position approximations are in 3D scene
// units; users must never interpret their length as real metres or walking ETA.
const NODES=Object.freeze({
 dropoff: [7,16.52,0],
 shoulder: [6.12,16.52,0],
 walk16: [6.12,16.0,0],
 east118: [6.12,11.8,0],
 east50: [6.12,5.0,0],
 eastMinus115: [6.12,-1.15,0],
 domeApproach: [5.18,-1.15,0],
 domeLine: [5.18,-5.75,0],
 registration: [4.407,-5.75,0],
 building1: [5.15,10.8,0],
 b1Stairs: [5.15,10.8,2.6],
 b1Corridor: [3.60,10.8,2.6],
 meeting2: [2.70,9.75,2.6],
 rearEast: [6.12,-11.5,0],
 building2: [5.45,-11.5,0]
});
const LINKS=Object.freeze([
 ['dropoff','shoulder'],['shoulder','walk16'],['walk16','east118'],
 ['east118','east50'],['east50','eastMinus115'],
 ['eastMinus115','domeApproach'],['domeApproach','domeLine'],
 ['domeLine','registration'],['east118','building1'],
 ['building1','b1Stairs'],['b1Stairs','b1Corridor'],
 ['b1Corridor','meeting2'],['eastMinus115','rearEast'],
 ['rearEast','building2']
]);
const STOP_LOOKUP=Object.fromEntries(WAYFINDING_STOPS.map(s=>[s.id,s]));
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const GRAPH=Object.fromEntries(Object.keys(NODES).map(id=>[id,[]]));
for(const [a,b] of LINKS){
 const d=distance(NODES[a],NODES[b]);
 GRAPH[a].push({id:b,d});
 GRAPH[b].push({id:a,d});
}
export function isWayfindingStop(id){return Object.hasOwn(STOP_LOOKUP,id)}
export function wayfindingStop(id){return STOP_LOOKUP[id]||null}
export function buildingWayfindingStop(label){
 const key=String(label||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
 if(key==='อาคาร1')return 'building1';
 if(key==='อาคาร2')return 'building2';
 if(key==='อาคารโดม')return 'registration';
 return null;
}
export function planWayfindingRoute(from,to){
 if(!isWayfindingStop(from)||!isWayfindingStop(to))
  throw new RangeError('Unsupported simulated wayfinding stop');
 const dist=Object.fromEntries(Object.keys(NODES).map(id=>[id,Infinity]));
 const previous={},pending=new Set(Object.keys(NODES));
 dist[from]=0;
 while(pending.size){
  let current=null;
  for(const key of pending)if(current===null||dist[key]<dist[current])current=key;
  if(current===null||!Number.isFinite(dist[current]))break;
  pending.delete(current);
  if(current===to)break;
  for(const edge of GRAPH[current]){
   if(!pending.has(edge.id))continue;
   const candidate=dist[current]+edge.d;
   if(candidate<dist[edge.id]){
    dist[edge.id]=candidate;previous[edge.id]=current;
   }
  }
 }
 if(!Number.isFinite(dist[to]))throw new Error('No schematic pedestrian route');
 const ids=[to];
 while(ids[0]!==from){
  if(!previous[ids[0]])throw new Error('Incomplete schematic route');
  ids.unshift(previous[ids[0]]);
 }
 const points=ids.map(id=>[...NODES[id]]);
 return {
  from,to,fromLabel:STOP_LOOKUP[from].label,toLabel:STOP_LOOKUP[to].label,
  nodeIds:ids,points,sceneDistance:dist[to],
  schematic:true,
  note:'เส้นทางจำลองเท่านั้น ไม่ใช่ผังนำทางที่ตรวจรับหรือระยะทางจริง'
 };
}
export function sampleWayfindingRoute(points,progress){
 if(!Array.isArray(points)||!points.length)
  throw new TypeError('Route points required');
 const u=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 if(points.length===1)return {x:points[0][0],z:points[0][1],y:points[0][2]||0};
 const lengths=points.slice(1).map((p,i)=>distance(p,points[i]));
 const total=lengths.reduce((sum,len)=>sum+len,0);
 if(total<=0)return {x:points[0][0],z:points[0][1],y:points[0][2]||0};
 let remaining=total*u;
 for(let i=0;i<lengths.length;i++){
  const len=lengths[i];
  if(remaining<=len||i===lengths.length-1){
   const v=Math.min(1,remaining/len),a=points[i],b=points[i+1];
   return {x:a[0]+(b[0]-a[0])*v,z:a[1]+(b[1]-a[1])*v,
    y:(a[2]||0)+((b[2]||0)-(a[2]||0))*v};
  }
  remaining-=len;
 }
 const last=points.at(-1);return {x:last[0],z:last[1],y:last[2]||0};
}
export function wayfindingHash(from,to){
 if(!isWayfindingStop(from)||!isWayfindingStop(to))return '';
 return '#wayfinding='+from+':'+to;
}
export function parseWayfindingHash(hash){
 const match=String(hash||'').match(/^#wayfinding=([a-z0-9]+):([a-z0-9]+)$/);
 if(!match||!isWayfindingStop(match[1])||!isWayfindingStop(match[2]))
  return null;
 return {from:match[1],to:match[2]};
}
export const WAYFINDING_NODE_COORDINATES=NODES;
