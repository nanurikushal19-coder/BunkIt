import { test } from 'node:test';
import assert from 'node:assert/strict';
import { status } from '../src/utils/attendance.ts';
test('85 percent boundary is exact',()=>{
 assert.deepEqual(status({attended:0,missed:0}),{total:0,percent:0,skip:0,need:0});
 assert.equal(status({attended:17,missed:3}).need,0);
 assert.equal(status({attended:17,missed:3}).skip,0);
 assert.equal(status({attended:84,missed:16}).need,7);
 assert.equal(status({attended:85,missed:15}).need,0);
});
test('bunk and recovery estimates are maximal/minimal over 5,151 possible records',()=>{
 for(let total=1;total<=100;total++)for(let attended=0;attended<=total;attended++){
  const s=status({attended,missed:total-attended});
  if(s.need){assert.ok(100*(attended+s.need)>=85*(total+s.need));assert.ok(100*(attended+s.need-1)<85*(total+s.need-1));}
  else{assert.ok(100*attended>=85*(total+s.skip));assert.ok(100*attended<85*(total+s.skip+1));}
 }
});
