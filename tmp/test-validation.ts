
import { ProfileUpdateSchema } from '../src/lib/validations/profile';
import { DiscoveryQuerySchema } from '../src/lib/validations/discovery';
import { sanitize } from '../src/lib/utils/sanitizer';

async function verify() {
  console.log('--- Verification Started ---');

  const dirty = '<p>Hello <script>alert("xss")</script> <b>world</b></p>';
  const clean = sanitize(dirty);
  console.log('XSS Check:', clean.includes('<script>') ? '❌ FAILED' : '✅ PASSED');

  const validProfile = { name: 'Ken Carl', lat: 45.5, lng: -122.6 };
  const profileResult = ProfileUpdateSchema.safeParse(validProfile);
  console.log('Profile Valid Payload:', profileResult.success ? '✅ PASSED' : '❌ FAILED');

  const rawParams = { lat: '45.5', lng: '-122.6', radius: '10' };
  const discoveryResult = DiscoveryQuerySchema.safeParse(rawParams);
  console.log('Discovery Query Transform:', discoveryResult.success && typeof discoveryResult.data.lat === 'number' ? '✅ PASSED' : '❌ FAILED');

  console.log('--- Verification Finished ---');
}

verify().catch(console.error);
