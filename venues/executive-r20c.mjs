/**
 * D3D-R20C — read-only, source-labelled executive summary.
 * All numeric values derive exclusively from historical Sillapa 73 rows.
 * No live round-74 readiness, staffing, team, or occupancy data is inferred.
 */
export function executiveSnapshot(venues, selectedVenueId) {
 const historic=Array.isArray(venues)
  ?venues.filter(v=>v&&v.edition===73&&Array.isArray(v.rows)):[];
 const venue=historic.find(v=>v.id===selectedVenueId)||null;
 const selectedRows=venue?venue.rows:[];
 const buildings=new Map();
 for(const row of selectedRows){
  const label=typeof row?.building==='string'&&row.building.trim()
   ?row.building.trim():'ไม่ระบุอาคาร';
  const key=label.normalize('NFKC').replace(/\s+/g,'').toLowerCase();
  if(!buildings.has(key))buildings.set(key,{key,label,rows:0});
  buildings.get(key).rows++;
 }
 return {
  edition:73,
  sourceStatus:'historical-review-only',
  venueCount:historic.length,
  totalHistoricalRows:historic.reduce((sum,v)=>sum+v.rows.length,0),
  selectedId:venue?.id||null,
  selectedName:venue?.name||'ไม่พบข้อมูลของสนามนี้',
  selectedRows:selectedRows.length,
  selectedBuildings:buildings.size,
  selectedMatchingPending:selectedRows.filter(r=>r?.reviewStatus==='needs_activity_id_match').length,
  roomSpecifiedRows:selectedRows.filter(r=>typeof r?.room==='string'&&r.room.trim()).length,
  buildings:[...buildings.values()],
  hasApproved74Data:false
 };
}

export function formatExecutiveSourceNotice(summary){
 return 'ข้อมูลจากครั้งที่ 73 · สนามนี้บันทึกไว้ '+summary.selectedRows+' รายการ · '+
  summary.selectedMatchingPending+' รายการยังรอตรวจสอบรหัสกิจกรรม · '+
  'ยังไม่มีข้อมูลยืนยันความพร้อมครั้งที่ 74';
}
