// R20A: schematic visual-only palette. Not official venue readiness.
// R20C: forecourt is a matte, muted sage-grey field behind the flagpole.
export const VISUAL_R20A=Object.freeze({
 sky:'#e5f2fa',ground:'#cde4cf',parcel:'#e4e9df',forecourt:'#a7bbb5',
 campusRoad:'#869caa',highway:'#63788b',roof:'#47769a',
 buildingWall:'#f0f3ee',buildingBlue:'#e2eef6',
 buildingMint:'#e4f2ee',buildingWarm:'#f3e9db',
 labelBlue:'#175e9f',labelTeal:'#0e756e',labelAmber:'#966120',
 historical:'#0f7166'
});
export function getSceneCameraPreset(isDistrict,isMobile){
 if(!isDistrict)return [25,29,33];
 return isMobile?[46,59,73]:[54,66,79];
}
export function getVenueLabelStyle(label){
 const text=String(label||'');
 if(/จุดรับ|ลงทะเบียน|จำลอง|สาธิต/.test(text))return {background:VISUAL_R20A.labelAmber,accent:'#ffde98'};
 if(/โดม|ห้องประชุม/.test(text))return {background:VISUAL_R20A.labelTeal,accent:'#9ff6db'};
 return {background:VISUAL_R20A.labelBlue,accent:'#a0dbff'};
}
