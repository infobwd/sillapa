// R19B: single-owner junction lease, for illustrative vehicle animation only.
import {BUILDING_DROPOFF_TIMING,FRONT_PARK_TIMING,DROPOFF_LINK_LIMITS} from './dropoff-r17.mjs';

// Do not mistake front cars approaching their parking bays for outbound traffic.
export function occupiesDropoffJunction(car,q,pose){
 if(!pose?.visible)return false;
 const {x,z}=pose.point;
 if(car.route==='front-park')return q>=FRONT_PARK_TIMING.reverseEnd&&q<FRONT_PARK_TIMING.departEnd
  &&((x>DROPOFF_LINK_LIMITS.frontStopX&&z>=20&&z<=28)
   ||(x>=11&&z>28&&z<DROPOFF_LINK_LIMITS.clearZ));
 if(car.route==='rear-parking')return q>=.64&&q<.78
  &&x>=10.2&&z>DROPOFF_LINK_LIMITS.rearStopZ&&z<DROPOFF_LINK_LIMITS.clearZ;
 if(car.route==='building-dropoff')return q>BUILDING_DROPOFF_TIMING.dwellEnd+1e-8
  &&q<BUILDING_DROPOFF_TIMING.departEnd
  &&!(x>=12&&z>=DROPOFF_LINK_LIMITS.clearZ);
 return false;
}
export function dropoffJunctionEntry(car,currentQ,nextQ,currentPose,nextPose){
 return !occupiesDropoffJunction(car,currentQ,currentPose)
  &&occupiesDropoffJunction(car,nextQ,nextPose);
}
export function selectDropoffJunctionOwner(vehicles,previous,poseAt){
 // The active owner retains priority until its vehicle clears the turn.
 if(previous&&vehicles.includes(previous)
  &&occupiesDropoffJunction(previous,previous.progress,poseAt(previous)))return previous;
 // Respect any car already committed before a van attempts to leave its bay.
 const inside=vehicles.filter(c=>occupiesDropoffJunction(c,c.progress,poseAt(c)));
 if(inside.length)return inside.sort((a,b)=>b.progress-a.progress)[0];
 // A tiny early reservation avoids a race at the precise dwell-end frame.
 return vehicles.find(c=>c.route==='building-dropoff'
  &&c.progress>=BUILDING_DROPOFF_TIMING.dwellEnd-.0003
  &&c.progress<BUILDING_DROPOFF_TIMING.departEnd)||null;
}
