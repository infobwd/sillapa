'use strict';
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'nongkum.html'),'utf8');
const css=fs.readFileSync(path.join(root,'nongkum-desktop.css'),'utf8');

test('desktop CSS is an additional stylesheet, not a second data implementation',()=>{
  assert.match(html,/<link rel="stylesheet" href="\.\/nongkum-desktop\.css">/);
  assert.match(html,/class="venue-table"/);
  assert.match(html,/id="audit-school"/);
  assert.match(html,/id="school-export-print"/);
  assert.match(html,/id="school-export-csv"/);
});

test('layout and top navigation overrides are scoped to 1200px+',()=>{
  assert.match(css,/@media\s*\(min-width:1200px\)/);
  assert.match(css,/\.mobile-bottom-nav\s*\{/);
  assert.match(css,/top:0;bottom:auto/);
  assert.match(css,/grid-template-columns:280px minmax\(0,1fr\)/);
  assert.match(css,/#complete-field-plan\.role-visible\[data-mode="school"\]/);
  assert.match(css,/#complete-field-plan\.role-visible\[data-mode="venue"\]/);
  const desktopStart=css.indexOf('@media (min-width:1200px)');
  const before=css.slice(0,desktopStart).replace(/\/\*[\s\S]*?\*\//g,'').trim();
  assert.equal(before,'');
});

test('mobile keeps old inline other-school names and native bottom nav',()=>{
  assert.match(html,/rivalCell\.append\(list\);/);
  assert.match(html,/if\(window\.matchMedia\('\(min-width:1200px\)'\)\.matches\)/);
  assert.match(html,/details\.className='audit-rival-details'/);
  assert.match(html,/summary\.textContent='ดูรายชื่อโรงเรียน'/);
  assert.match(html,/desktopBreak\.addEventListener\('change',render\)/);
  assert.match(html,/class="mobile-bottom-nav"/);
});

test('existing boundary and source clarification remain present',()=>{
  assert.match(html,/ไม่ใช่ระบบสมัครแข่งขัน/);
  assert.match(html,/ไม่ใช่เกณฑ์รับรองครั้งที่ 74/);
  assert.match(html,/round70-catalog\.js/);
  assert.match(html,/round74-confirmed-groups\.js/);
});

test('school actions and venue filters are still wired',()=>{
  assert.match(html,/school\.addEventListener\('change',render\)/);
  assert.match(html,/search\.addEventListener\('input',render\)/);
  assert.match(html,/venueSelect\.addEventListener\('change'/);
  assert.match(html,/id="venue-category-panel"/);
  assert.match(html,/id="venue-status-tabs"/);
});

test('theme and focus enhancements are present',()=>{
  assert.match(css,/prefers-color-scheme:light/);
  assert.match(css,/focus-visible/);
  assert.match(css,/audit-rival-details\[open\]/);
});
