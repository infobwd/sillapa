/* Nongkum round 74: public school identifiers only. Source: 73 SQL schools.school_id.
   Teacher identities and full staff roster remain in restricted Google Sheets. */
(function(global){
  'use strict';
  const schools=[{"school_id":"71020017","name":"บ้านเสาหงส์","sql_name":"บ้านเสาหงส์","aliases":["โรงเรียนบ้านเสาหงส์"]},{"school_id":"71020019","name":"บ้านวังด้ง","sql_name":"บ้านวังด้ง","aliases":["โรงเรียนบ้านวังด้ง"]},{"school_id":"71020020","name":"บ้านพุพรหม","sql_name":"บ้านพุพรหม","aliases":["โรงเรียนบ้านพุพรหม"]},{"school_id":"71020021","name":"วังเขาแก้ว (หงำอุปถัมภ์)","sql_name":"วังเขาแก้ว(หงำอุปถัมภ์)","aliases":["บ้านวังเขาแก้ว","โรงเรียนบ้านวังเขาแก้ว","วังเขาแก้ว(หงำอุปถัมภ์)"]},{"school_id":"71020022","name":"บ้านหนองกระทุ่ม","sql_name":"บ้านหนองกระทุ่ม","aliases":["โรงเรียนบ้านหนองกระทุ่ม"]},{"school_id":"71020023","name":"บ้านหนองกุ่ม","sql_name":"บ้านหนองกุ่ม","aliases":["โรงเรียนบ้านหนองกุ่ม"]},{"school_id":"71020024","name":"วัดทุ่งมะสัง (มิตรภาพที่ 9)","sql_name":"วัดทุ่งมะสัง(มิตรภาพที่9)","aliases":["วัดทุ่งมะสัง(มิตรภาพที่9)","โรงเรียนวัดทุ่งมะสัง (มิตรภาพที่ 9)"]},{"school_id":"71020025","name":"บ้านรางขาม","sql_name":"บ้านรางขาม","aliases":["โรงเรียนบ้านรางขาม"]}];
  function normalize(name){return String(name||'').replace(/^โรงเรียน/,'').replace(/[\s()（）\-–]/g,'').trim();}
  const byId=Object.create(null),byAlias=Object.create(null);
  for(const school of schools){
    Object.freeze(school.aliases);Object.freeze(school);
    byId[school.school_id]=school;
    for(const alias of [school.school_id,school.name,school.sql_name,...school.aliases]){
      byAlias[normalize(alias)]=school.school_id;
    }
  }
  function resolveId(value){return byId[value]?value:byAlias[normalize(value)]||null;}
  function displayName(value){const id=resolveId(value);return id?byId[id].name:String(value||'');}
  function schoolById(id){return byId[String(id)]||null;}
  global.NONGKUM_SCHOOLS=Object.freeze({schools:Object.freeze(schools),resolveId,displayName,schoolById});
})(window);
