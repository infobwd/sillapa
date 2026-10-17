// D3D-R17 — small pure helpers for the illustrative drop-off and dome flow.
// Schematic coordinates only; neither an official traffic nor check-in plan.
export const DROP_OFF_BAY=Object.freeze({x:7,z:18.55,vehicleLength:4.4,vehicleWidth:1.92});
export const DOME_QUEUES=Object.freeze([
 Object.freeze({z:-5.75,deskX:-4.1}),
 Object.freeze({z:-2.25,deskX:-4.1})
]);

export function inDropoffZone(point){
 return !!point&&point.x>=-12&&point.x<=12&&point.z>=16&&point.z<=25.5;
}
function rectAxis(yaw){
 const angle=Number.isFinite(yaw)?yaw:0;
 return [[Math.sin(angle),Math.cos(angle)],[Math.cos(angle),-Math.sin(angle)]];
}
// Separating-axis theorem using each vehicle's schematic body rectangle.
// Extra clearance applies to BOTH longitudinal and lateral spacing, so
// vehicles can pass a distinct curbside bay without stopping unnecessarily.
export function vehicleFootprintsConflict(a,b,aLength=3.7,bLength=3.7,aWidth=1.8,bWidth=1.8,clearance=.8){
 if(!a?.visible||!b?.visible)return false;
 const ax=rectAxis(a.yaw),bx=rectAxis(b.yaw);
 const dx=b.point.x-a.point.x,dz=b.point.z-a.point.z;
 const axes=[...ax,...bx];
 for(const u of axes){
  const gap=Math.abs(dx*u[0]+dz*u[1]);
  const ae=(aLength/2+clearance/2)*Math.abs(ax[0][0]*u[0]+ax[0][1]*u[1])
   +(aWidth/2+clearance/2)*Math.abs(ax[1][0]*u[0]+ax[1][1]*u[1]);
  const be=(bLength/2+clearance/2)*Math.abs(bx[0][0]*u[0]+bx[0][1]*u[1])
   +(bWidth/2+clearance/2)*Math.abs(bx[1][0]*u[0]+bx[1][1]*u[1]);
  if(gap>ae+be)return false;
 }
 return true;
}
export function mustYieldAtDropoff(wanted,other,aLength,bLength,aWidth=1.8,bWidth=1.8){
 return !!(inDropoffZone(wanted?.point)&&inDropoffZone(other?.point)
  &&vehicleFootprintsConflict(wanted,other,aLength,bLength,aWidth,bWidth,.85));
}
export function registrationQueuePoint(queueIndex,personIndex){
 const queue=DOME_QUEUES[Math.abs(queueIndex)%DOME_QUEUES.length];
 return [-5.0-Math.max(0,Math.min(3,personIndex))*.65,queue.z];
}
export function toRegistrationWaypoints(startX,queueIndex,personIndex){
 const queue=DOME_QUEUES[Math.abs(queueIndex)%DOME_QUEUES.length];
 const destination=registrationQueuePoint(queueIndex,personIndex);
 return [[startX,35.2],[startX,30],[startX,25],[startX,19],
  [-11.38,18],[-11.38,14.7],[-11.38,10.8],[-11.38,5],
  [-11.38,-7.45],[-6.35,-7.45],[-6.35,queue.z],destination];
}
export function fromRegistrationToBuildingWaypoints(queueIndex,personIndex){
 const destination=registrationQueuePoint(queueIndex,personIndex);
 const lane=DOME_QUEUES[Math.abs(queueIndex)%DOME_QUEUES.length];
 return [destination,[-6.52,lane.z],[-6.52,-7.1],[-6.8,-7.45],
  [-11.38,-7.45],[-11.38,10.8],[-11.38,15.5],
  [-6.5,16.65],[6.12,16.65],[6.12,11.8],[5.15,10.8],
  [5.15,10.8,2.6],[3.60,10.8,2.6],[2.70,9.75,2.6]];
}
// q is the vehicle's normalized simulation progress. Every passenger
// visits the dome and dwells long enough to be visible in its queue before
// walking toward the indicative Building 1 upper-floor entrance.
export function registrationPhase(q,start){
 const arrivalEnd=.70,checkinEnd=.78,finish=.925;
 if(q<start)return {step:'not-unloaded',u:0};
 if(q<arrivalEnd)return {step:'to-dome',u:Math.min(1,(q-start)/(arrivalEnd-start))};
 if(q<checkinEnd)return {step:'queue',u:1};
 if(q<finish)return {step:'to-building',u:(q-checkinEnd)/(finish-checkinEnd)};
 return {step:'arrived',u:1};
}
