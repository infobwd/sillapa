// D3D-R17 — small pure helpers for the illustrative drop-off and dome flow.
// Schematic coordinates only; neither an official traffic nor check-in plan.
export const DROP_OFF_BAY=Object.freeze({x:7,z:18.55,vehicleLength:4.4,vehicleWidth:1.92});
export const BUILDING_DROPOFF_TIMING=Object.freeze({
 arrivalEnd:.38,dwellEnd:.465,departEnd:.665
});
export const FRONT_PARK_TIMING=Object.freeze({
 arrivalEnd:.29,reverseStart:.39,reverseEnd:.47,departEnd:.62
});
export const DOME_QUEUES=Object.freeze([
 Object.freeze({z:-5.75,deskX:3.21}),
 Object.freeze({z:-2.25,deskX:3.21})
]);

// R17B: passengers alight SOUTH of the van and never enter its occupied
// parking strip (vehicle bay is x≈3..10.2, z≈17.28..19.83).
// Keep visual pedestrian spacing even with the two trees removed.
export const SAFE_ALIGHT_Z=16.52;
export const PEDESTRIAN_EXCLUSION=Object.freeze({
 minX:3.0,maxX:10.35,minZ:17.24,maxZ:24.45
});
export function inVehicleOnlyArea(point){
 return !!point&&point[0]>=PEDESTRIAN_EXCLUSION.minX
  &&point[0]<=PEDESTRIAN_EXCLUSION.maxX
  &&point[1]>=PEDESTRIAN_EXCLUSION.minZ
  &&point[1]<=PEDESTRIAN_EXCLUSION.maxZ;
}
export function fromVanToRegistrationWaypoints(personIndex=0){
 const j=Math.max(0,Math.min(3,personIndex));
 const startX=7+(j-1.5)*.36;
 const destination=registrationQueuePoint(j%2,Math.floor(j/2));
 // Start on the protected landing, move to the EAST sign bypass, then
 // reach the dome counter from the accessible schematic east aisle.
 return [[startX,SAFE_ALIGHT_Z],[6.12,16.0],[6.12,14.5],
  [6.12,11.8],[6.12,8.0],[6.12,5.0],[6.12,-1.15],
  [5.18,-1.15],[5.18,destination[1]],destination];
}
export function shouldHoldFollowerAtDropoff(actorRoute,current,wanted,
 vanProgress,vanPose,vanDepartStart,vanDepartEnd){
 if(actorRoute!=='front-park'||!current?.visible||!wanted?.visible
  ||!vanPose?.visible)return false;
 if(vanProgress<vanDepartStart||vanProgress>=vanDepartEnd)return false;
 // A front-lot car that has NOT entered the junction waits before X=-2.
 // A car already in the intersection has priority to CLEAR it; the van
 // still checks its full footprint before entering the same space.
 const approaching=current.point.x<=-2;
 return approaching&&wanted.point.x>-2
  &&wanted.point.z>=19.4&&wanted.point.z<=24.6;
}
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

// R17A: positive values indicate a separating axis has physical space.
// If both positions still overlap, the candidate is allowed ONLY when
// the departing vehicle increases BOTH center distance and body clearance.
// This prevents an existing too-close pair from being permanently frozen,
// without granting a free pass to drive deeper into another vehicle.
export function vehicleFootprintMargin(a,b,aLength=3.7,bLength=3.7,
 aWidth=1.8,bWidth=1.8,clearance=.85) {
 if(!a?.visible||!b?.visible)return Infinity;
 const ax=rectAxis(a.yaw),bx=rectAxis(b.yaw);
 const dx=b.point.x-a.point.x,dz=b.point.z-a.point.z;
 let best=-Infinity;
 for(const axis of [...ax,...bx]){
  const project=(u)=>Math.abs(u[0]*axis[0]+u[1]*axis[1]);
  const rA=(aLength/2+clearance/2)*project(ax[0])
    +(aWidth/2+clearance/2)*project(ax[1]);
  const rB=(bLength/2+clearance/2)*project(bx[0])
    +(bWidth/2+clearance/2)*project(bx[1]);
  best=Math.max(best,Math.abs(dx*axis[0]+dz*axis[1])-rA-rB);
 }
 return best;
}
export function vehicleOverlapDepth(a,b,aLength=3.7,bLength=3.7,
 aWidth=1.8,bWidth=1.8,clearance=.85) {
 if(!a?.visible||!b?.visible)return 0;
 const ax=rectAxis(a.yaw),bx=rectAxis(b.yaw);
 const dx=b.point.x-a.point.x,dz=b.point.z-a.point.z;
 let overlap=0;
 for(const axis of [...ax,...bx]){
  const dot=(u)=>Math.abs(u[0]*axis[0]+u[1]*axis[1]);
  const ra=(aLength/2+clearance/2)*dot(ax[0])
   +(aWidth/2+clearance/2)*dot(ax[1]);
  const rb=(bLength/2+clearance/2)*dot(bx[0])
   +(bWidth/2+clearance/2)*dot(bx[1]);
  overlap+=Math.max(0,ra+rb-Math.abs(dx*axis[0]+dz*axis[1]));
 }
 return overlap;
}
export function shouldHoldDropoffRelease(current,wanted,other,
 aLength,bLength,aWidth=1.8,bWidth=1.8,isDeparting=false) {
 if(!mustYieldAtDropoff(wanted,other,aLength,bLength,aWidth,bWidth))return false;
 if(!isDeparting||!current?.visible)return true;
 const before=vehicleFootprintMargin(current,other,aLength,bLength,aWidth,bWidth);
 if(before>=0)return true; // newly entering someone else's safety margin
 // A lateral body overlap can remain constant while a departing
 // vehicle moves longitudinally away. A maximum-SAT-axis comparison alone
 // would still freeze it, so require decreasing TOTAL penetration instead.
 const oldDepth=vehicleOverlapDepth(current,other,aLength,bLength,aWidth,bWidth);
 const newDepth=vehicleOverlapDepth(wanted,other,aLength,bLength,aWidth,bWidth);
 const oldDistance=Math.hypot(current.point.x-other.point.x,current.point.z-other.point.z);
 const newDistance=Math.hypot(wanted.point.x-other.point.x,wanted.point.z-other.point.z);
 return !(newDepth<oldDepth-0.00001&&newDistance>oldDistance+0.00001);
}

export function registrationQueuePoint(queueIndex,personIndex){
 const queue=DOME_QUEUES[Math.abs(queueIndex)%DOME_QUEUES.length];
 // Dome group rotates +90° about Y with local Z scaled to .78. The
 // queue marks at local Z=5.0,5.65,6.30 map to WORLD X=3.90,4.407,4.914.
 return [3.90+Math.max(0,Math.min(3,personIndex))*.507,queue.z];
}
export function toRegistrationWaypoints(startX,queueIndex,personIndex){
 const queue=DOME_QUEUES[Math.abs(queueIndex)%DOME_QUEUES.length];
 const destination=registrationQueuePoint(queueIndex,personIndex);
 return [[startX,35.2],[startX,30],[startX,25],[startX,19],
  [-11.38,18],[-11.38,14.7],[-11.38,10.8],[-11.38,5],
  // Southern aisle at z=-7.5 stays outside the stage/chair footprint
  // (southern-most content z≈-6.8), then turns to the EAST reception desks.
  [-11.38,-7.45],[-6.35,-7.45],[-5.15,-7.50],
  [4.95,-7.50],[5.18,-7.0],[5.18,queue.z],destination];
}
export function fromRegistrationToBuildingWaypoints(queueIndex,personIndex){
 const destination=registrationQueuePoint(queueIndex,personIndex);
 const lane=DOME_QUEUES[Math.abs(queueIndex)%DOME_QUEUES.length];
 // After check-in, leave via the EAST opening and keep x=6.12
 // between the host buildings and the right-side toilets. This avoids
 // re-crossing the stage, chairs or the restroom on the western approach.
 return [destination,[5.35,lane.z],[6.12,lane.z],
  [6.12,-1.15],[6.12,5.0],[6.12,11.8],[5.15,10.8],
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
