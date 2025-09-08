// Script pour décoder les clés JWT Supabase et extraire l'URL du projet

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0MDcsImV4cCI6MjA3MDk0MDQwN30.f2Mo-77InzZHnK1o7bMNs1ZC3DyX7EkPl964ksQTafY';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZWthaXZnanpzbWRvY2NodnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2NDQwNywiZXhwIjoyMDcwOTQwNDA3fQ.ryMev0CT2nnLWLG-5dtEeUEvWysi1dsa2e2yoq3w7Fs';

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erreur décodage JWT:', error);
    return null;
  }
}

console.log('🔍 DÉCODAGE DES CLÉS SUPABASE');
console.log('============================');

const anonDecoded = decodeJWT(anonKey);
const serviceDecoded = decodeJWT(serviceKey);

if (anonDecoded && serviceDecoded) {
  const projectRef = anonDecoded.ref;
  const supabaseUrl = `https://${projectRef}.supabase.co`;
  
  console.log('✅ Clés décodées avec succès !');
  console.log('');
  console.log('📊 INFORMATIONS DU PROJET:');
  console.log(`   Référence: ${projectRef}`);
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Émetteur: ${anonDecoded.iss}`);
  console.log(`   Expiration: ${new Date(anonDecoded.exp * 1000).toLocaleDateString()}`);
  console.log('');
  console.log('🔑 CONFIGURATION À UTILISER:');
  console.log(`PUBLIC_SUPABASE_URL="${supabaseUrl}"`);
  console.log(`PUBLIC_SUPABASE_ANON_KEY="${anonKey}"`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY="${serviceKey}"`);
  
} else {
  console.log('❌ Erreur lors du décodage des clés');
}
