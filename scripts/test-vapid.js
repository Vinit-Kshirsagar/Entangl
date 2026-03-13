const webpush = require('web-push');

// Load your keys from .env.local
require('dotenv').config({ path: '.env.local' });

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

console.log('Testing VAPID keys...\n');
console.log('Public Key:', publicKey);
console.log('Public Key Length:', publicKey?.length);
console.log('Private Key:', privateKey);
console.log('Private Key Length:', privateKey?.length);

// Test if keys are valid
try {
  webpush.setVapidDetails(
    'mailto:test@example.com',
    publicKey,
    privateKey
  );
  console.log('\n✅ VAPID keys are VALID!');
} catch (error) {
  console.log('\n❌ VAPID keys are INVALID!');
  console.error('Error:', error.message);
}