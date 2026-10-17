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
      // R16C: a vehicle that has committed to leaving the gate occupies
      // the eastbound merge zone BEFORE its center reaches lane Z=49.25.
      // Protect its full turning body from rear traffic, but never make
      // public traffic yield for a car that is still WAITING at the stop line.
      const inLane=Math.abs(occupant.z-car.lane)<=2.1;
      const entering=(occupant.exitMerge===true||occupant.inboundRoad===true)
        &&car.direction===1&&car.lane===49.25;
      if (!inLane&&!entering) continue;
      const ahead=(occupant.x-x)*car.direction;
      if (ahead>=0&&ahead<car.travel/2) clearance=Math.min(clearance,ahead);
    }
    const permitted=Math.max(0,Math.min(Math.max(0,dt)*car.speed,clearance-safeHeadway));
    updates.set(car,(current+permitted)%car.travel);
  }
  return updates;
}

// R16C: only the FIRST transition from the internal approach into the
// committed exit curve requests a gap. Once the exit is committed, it must
// keep moving through the junction while road users behind follow it.
// Keeping the stop center upstream ensures the longest internal van does
// not stick its nose into the eastbound traffic lane while waiting.
export function canEnterMainRoad(currentPose, wantedPose, highway, gateX=15.5, safeGap=10) {
  if (!wantedPose.visible||!wantedPose.onHighway) return true;
  if (currentPose.visible&&currentPose.onHighway) return true;
  const rearClearance=safeGap+3;   // approaching traffic must have room to brake
  const frontClearance=safeGap-1;  // eastbound traffic ahead continues away
  for (const car of highway) {
    if (car.direction!==1||Math.abs(car.lane-49.25)>2) continue;
    const x=-car.travel/2+car.highwayProgress;
    const behind=gateX-x;
    const ahead=x-gateX;
    if ((behind>=0&&behind<rearClearance)
      ||(ahead>=0&&ahead<frontClearance))return false;
  }
  return true;
}

// R16D: inbound cars start OUTSIDE the highway scene and drive in from
// its eastbound left approach. At spawn the full surrounding road gap must
// be clear. After joining the visible lane, cars follow traffic ahead;
// highway traffic behind treats the inbound car as an ahead occupant.
// The test uses center positions and visual-only schematic headway.
export function canAdvanceInboundRoad(currentPose,wantedPose,highway,safeGap=10) {
  if (!wantedPose.visible||!wantedPose.inboundRoad) return true;
  const firstJoin=!currentPose.visible||!currentPose.inboundRoad
    ||currentPose.point.x<=-49;
  const x=wantedPose.point.x;
  for(const car of highway){
    if(car.direction!==1||Math.abs(car.lane-49.25)>2)continue;
    const roadX=-car.travel/2+car.highwayProgress;
    const ahead=roadX-x;
    if(ahead>=0&&ahead<safeGap)return false;
    if(firstJoin&&ahead<0&&ahead>-safeGap)return false;
  }
  return true;
}
