
import { ProfileUpdateSchema } from '../src/lib/validations/profile.js';
import { DiscoveryQuerySchema } from '../src/lib/validations/discovery.js';
import { sanitize } from '../src/lib/utils/sanitizer.js';

async function verify() {
  console.log('--- Verification Started ---');

  // 1. Test XSS Sanitization
  const dirty = '<p>Hello <script>alert("xss")</script> <b>world</b></p>';
  const clean = sanitize(dirty);
  console.log('XSS Check:', clean.includes('<script>') ? '❌ FAILED' : '✅ PASSED');
  console.log('Clean output:', clean);

  // 2. Test Profile Validation (Valid)
  const validProfile = {
    name: 'Ken Carl',
    bio: 'Professional musician',
    lat: 45.5,
    lng: -122.6
  };
  const profileResult = ProfileUpdateSchema.safeParse(validProfile);
  console.log('Profile Valid Payload:', profileResult.success ? '✅ PASSED' : '❌ FAILED');

  // 3. Test Profile Validation (Invalid Lat)
  const invalidProfile = { lat: 100 };
  const failProfile = ProfileUpdateSchema.safeParse(invalidProfile);
  console.log('Profile Invalid Payload:', !failProfile.success ? '✅ PASSED' : '❌ FAILED');

  // 4. Test Discovery Query (Transformations)
  const rawParams = {
    lat: '45.5',
    lng: '-122.6',
    radius: '10'
  };
  const discoveryResult = DiscoveryQuerySchema.safeParse(rawParams);
  console.log('Discovery Query Transform:', discoveryResult.success && typeof discoveryResult.data.lat === 'number' ? '✅ PASSED' : '❌ FAILED');
  
  if (discoveryResult.success) {
    console.log('Parsed Discovery:', discoveryResult.data);
  }

  console.log('--- Verification Finished ---');
}

verify().catch(console.error);
