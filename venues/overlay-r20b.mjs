/**
 * D3D-R20B — public, purely illustrative venue overlay configuration.
 * POI positions are SCHEMATIC coordinates for the district prototype.
 * Never infer live attendance, congestion, staffing or round-74 readiness.
 */
export const LAYER_DEFAULTS=Object.freeze({
 labels:true,historical:true,points:false
});
export const LAYER_KEYS=Object.freeze(['labels','historical','points']);
export function normalizeVenueLayers(raw){
 const result={...LAYER_DEFAULTS};
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
  for(const key of LAYER_KEYS)if(typeof raw[key]==='boolean')result[key]=raw[key];
 }
 return result;
}
export function withVenueLayer(state,key,checked){
 if(!LAYER_KEYS.includes(key))return normalizeVenueLayers(state);
 return {...normalizeVenueLayers(state),[key]:Boolean(checked)};
}
export function historyOverlaySummary(rows){
 if(!Array.isArray(rows))return {edition:73,activities:0,buildings:0,verified:false};
 const keys=new Set();
 for(const row of rows){
  const key=String(row?.building||'ไม่ระบุอาคาร').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
  keys.add(key);
 }
 return {edition:73,activities:rows.length,buildings:keys.size,verified:false};
}
export const DISTRICT_SCHEMATIC_POINTS=Object.freeze([
 Object.freeze({id:'registration',label:'จุดลงทะเบียน (จำลอง)',icon:'📝',x:5.5,y:6.6,z:-5.75}),
 Object.freeze({id:'dropoff',label:'จุดรับ–ส่งนักเรียน (จำลอง)',icon:'🚐',x:7,y:4.6,z:16.52}),
 Object.freeze({id:'restroom',label:'ห้องน้ำ (จำลอง)',icon:'🚻',x:8.8,y:4.3,z:7.2}),
 Object.freeze({id:'parking-front',label:'ที่จอดรถด้านหน้า (จำลอง)',icon:'🅿',x:-5.3,y:5.4,z:36}),
 Object.freeze({id:'parking-rear',label:'ที่จอดรถด้านหลัง (จำลอง)',icon:'🅿',x:0,y:5.5,z:-35})
]);
export function schematicPointsForVenue(venueId){
 // No unverified Anuban POI coordinates have been locked.
 return venueId==='kanchanaburi-pesa4'?DISTRICT_SCHEMATIC_POINTS:[];
}
