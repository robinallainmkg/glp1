import https from 'https';

const SUPABASE_URL = 'https://ywekaivgjzsmdocchvum.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

const ticketIds = [
  '7e7d2bae-7c04-4ed1-83cd-163680005b4c',
  '63764b52-4878-4250-94e4-0562a6add5e6',
  'c7b4363e-6605-40ea-a26b-255da923eaa2',
  '179dfdd8-24cd-422c-99de-ad78ef5e31b5',
  'ae0be4ec-3074-459d-84c4-0003a94c468d',
  'd6ac2fcd-723c-41aa-b920-f4d91b053beb',
  '5e45b34a-0621-4ae7-a2c1-8ebefcb22301',
  '5bec0980-00f1-41bb-b4c0-fec2186a6e00',
  '2d9f7b82-fca6-4285-bf12-0b07c489c2f6',
  'e63b6085-fa3e-4fff-953a-ba1d37436419',
  '16b63783-5721-4899-88f1-7a79f2564a28',
  '9df29e62-9652-4007-88f8-d04f7c220eff',
  '167434db-8dc6-46d4-972c-6b5988373519',
  '792519cb-22b0-4561-986f-bdd824a7ddfe',
  '17989e8d-f160-4f56-823f-2357b493e5f6',
  'b9c27ad6-8ce4-4b99-81bf-c58b1107ef81',
  '5ccf21db-dccf-49b7-a35a-6fc4901a1642',
  'c123dc2b-8697-48ed-ac8b-77d426012692',
  '4aaa3278-6aea-4947-be25-e8afe6c73653',
  '668742ea-5a7b-4143-a190-6a3d88c01935'
];

function patchRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(options, (res) => {
      let resp = '';
      res.on('data', chunk => resp += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: resp }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Mark all tickets in_progress (batch by using in filter)
const ids = ticketIds.map(id => '"' + id + '"').join(',');
const result = await patchRequest(
  '/rest/v1/correction_tickets?id=in.(' + ticketIds.join(',') + ')',
  { statut: 'in_progress' }
);
console.log('Mark in_progress:', result.status, result.body || '(ok)');
