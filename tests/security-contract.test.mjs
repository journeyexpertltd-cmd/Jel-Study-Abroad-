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
  const booking = read('src/components/ConsultationBooking.tsx');
  assert.match(endpoint, /submit_public_lead/);
  assert.match(endpoint, /status: 'New'/);
  assert.equal(endpoint.includes('service_role'), false, 'never hard-code a service-role secret');
  assert.equal(endpoint.includes('full_name:'), false, 'legacy leads schema must not be reintroduced');
  assert.equal(endpoint.includes('mobile_number:'), false, 'legacy leads schema must not be reintroduced');
  assert.equal(booking.includes('jel_consult_leads'), false, 'consultation booking must not treat localStorage as CRM');
  assert.match(booking, /!response\.ok \|\| body\?\.success !== true/);
});

test('versioned migrations keep CRM and student storage private with RLS', () => {
  const crmSql = read('supabase/migrations/20260916_production_crm_storage.sql');
  const studentSql = read('supabase/migrations/20260916_student_applications.sql');
  assert.match(crmSql, /alter table public\.leads enable row level security/i);
  assert.match(crmSql, /'student-documents',[\s\S]*false,/i);
  assert.match(crmSql, /grant execute on function public\.submit_public_lead/i);
  assert.match(crmSql, /revoke all on table public\.leads from anon/i);
  assert.match(studentSql, /alter table public\.students enable row level security/i);
  assert.match(studentSql, /alter table public\.applications enable row level security/i);
  assert.match(studentSql, /raw_user_meta_data->>'role'/i);
});

test('student tracker and document vault expose real authenticated flows, not simulators', () => {
  const tracker = read('src/components/StudentApplicationTracker.tsx');
  const vault = read('src/components/SecureDocumentVault.tsx');
  assert.equal(tracker.includes('adminSimulator'), false);
  assert.equal(tracker.includes('/api/admin/update-status'), false);
  assert.equal(vault.includes('INITIAL_DOCUMENTS'), false);
  assert.equal(vault.includes('handleSimulatedUpload'), false);
  assert.match(vault, /supabase\.storage\.from\(BUCKET\)/);
  assert.match(vault, /createSignedUrl/);
});

test('public UI contains no unsupported visa-success or scholarship-guarantee claims', () => {
  const app = read('src/App.tsx');
  const booking = read('src/components/ConsultationBooking.tsx');
  for (const forbidden of ['98% Visa Success Rate', '98.2% Visa Conversion', '100% Study Abroad Scholarships', "Bangladesh's leading student counseling franchise"] ) {
    assert.equal(app.includes(forbidden), false, `unsupported claim in App.tsx: ${forbidden}`);
    assert.equal(booking.includes(forbidden), false, `unsupported claim in ConsultationBooking.tsx: ${forbidden}`);
  }
  assert.match(app, /No outcome guarantees/);
});
