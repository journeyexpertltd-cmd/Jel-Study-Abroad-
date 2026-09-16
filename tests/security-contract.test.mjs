import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

test('student portal contains no plaintext demo passwords or local credential store', () => {
  const source = read('src/components/StudentPortal.tsx');
  for (const forbidden of ['student123', 'counselor123', 'admin123', 'jel_portal_accounts', 'Sandbox Mode']) {
    assert.equal(source.includes(forbidden), false, `forbidden portal credential pattern: ${forbidden}`);
  }
  assert.match(source, /role:\s*"student"/);
  assert.match(source, /resetPasswordForEmail/);
});

test('admin recovery and student recovery stay on separate production routes', () => {
  const main = read('src/main.tsx');
  const admin = read('src/components/AdminDashboard.tsx');
  const student = read('src/components/StudentPortal.tsx');
  assert.match(main, /window\.location\.pathname === '\/'/);
  assert.match(admin, /redirectTo: `\$\{window\.location\.origin\}\/admin`/);
  assert.match(student, /redirectTo: `\$\{window\.location\.origin\}\/student-portal`/);
  assert.match(admin, /updateUser\(\{ password: newPassword \}\)/);
  assert.match(student, /updateUser\(\{ password: newPassword \}\)/);
});

test('public lead capture is server-side and uses controlled CRM fields', () => {
  const endpoint = read('functions/api/supabase/booking.ts');
  assert.match(endpoint, /submit_public_lead/);
  assert.match(endpoint, /status: 'New'/);
  assert.equal(endpoint.includes('service_role'), false, 'never hard-code a service-role secret');
  assert.equal(endpoint.includes('full_name:'), false, 'legacy leads schema must not be reintroduced');
  assert.equal(endpoint.includes('mobile_number:'), false, 'legacy leads schema must not be reintroduced');
});

test('versioned migration keeps student storage private and RLS enabled', () => {
  const sql = read('supabase/migrations/20260916_production_crm_storage.sql');
  assert.match(sql, /alter table public\.leads enable row level security/i);
  assert.match(sql, /'student-documents',[\s\S]*false,/i);
  assert.match(sql, /grant execute on function public\.submit_public_lead/i);
  assert.match(sql, /revoke all on table public\.leads from anon/i);
});
