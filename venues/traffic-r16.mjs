// D3D-R16: deterministic, dependency-free highway right-of-way helpers.
// Shared by the Three.js scene and local Node regression tests.
export function computeHighwayProgress(vehicles, mergedOccupants, dt, safeHeadway=10) {
  const updates = new Map();
  const roadX = (car,progress) => car.direction===1 ? -car.travel/2+progress : car.travel/2-progress;
  for (const car of vehicles) {
    const current=car.highwayProgress;
    let clearance=Infinity;
    for (const other of vehicles) {
      if (other===car||other.lane!==car.lane||other.direction!==car.direction) continue;
      const ahead=(other.highwayProgress-current+car.travel)%car.travel;
      clearance=Math.min(clearance,ahead);
    }
    const x=roadX(car,current);
    for (const occupant of mergedOccupants) {
      if (Math.abs(occupant.z-car.lane)>2.1) continue;
      const ahead=(occupant.x-x)*car.direction;
      if (ahead>=0&&ahead<car.travel/2) clearance=Math.min(clearance,ahead);
    }
    const permitted=Math.max(0,Math.min(Math.max(0,dt)*car.speed,clearance-safeHeadway));
    updates.set(car,(current+permitted)%car.travel);
  }
  return updates;
}

export function canEnterMainRoad(currentPose, wantedPose, highway, gateX=15.5, safeGap=10) {
  if (!wantedPose.visible||!wantedPose.onHighway) return true;
  // Once committed beyond the junction, the exit vehicle must clear the lane.
  if (currentPose.visible&&currentPose.onHighway&&currentPose.point.x>=15.2&&currentPose.point.z>=48.6) return true;
  // Before the junction, yield to moving eastbound traffic; never hold that traffic.
  if (wantedPose.point.z<46.5&&(!currentPose.visible||currentPose.point.z<46.5)) return true;
  for (const car of highway) {
    if (car.direction!==1||Math.abs(car.lane-49.25)>2) continue;
    const x=-car.travel/2+car.highwayProgress;
    if (Math.abs(x-gateX)<safeGap+Math.min(1,car.speed*.1)) return false;
  }
  return true;
}
