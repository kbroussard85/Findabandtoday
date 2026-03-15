const fs = require('fs');
const path = require('path');

const files = [
  'src/app/actions/stripe.ts',
  'src/app/actions/venue-swipe.ts',
  'src/app/api/ai/maximizer/route.ts',
  'src/app/api/ai/outreach/route.ts',
  'src/app/api/artist/[id]/rate/route.ts',
  'src/app/api/artist/register-media/route.ts',
  'src/app/api/artist/upload-audio/route.ts',
  'src/app/api/artist/upload-image/route.ts',
  'src/app/api/auth/sync/manual/route.ts',
  'src/app/api/auth/sync/route.ts',
  'src/app/api/checkout/route.ts',
  'src/app/api/cron/expire-gigs/route.ts',
  'src/app/api/cron/payouts/route.ts',
  'src/app/api/discovery/route.ts',
  'src/app/api/events/public/route.ts',
  'src/app/api/gigs/[id]/contract/route.tsx',
  'src/app/api/gigs/[id]/escrow/route.ts',
  'src/app/api/gigs/route.ts',
  'src/app/api/onboarding/band/route.ts',
  'src/app/api/onboarding/venue/route.ts',
  'src/app/api/profile/availability/route.ts',
  'src/app/api/profile/route.ts',
  'src/app/api/stripe/onboarding/route.ts',
  'src/app/api/stripe/portal/route.ts',
  'src/app/api/uploadthing/core.ts',
  'src/app/api/webhook/route.ts',
  'src/app/api/webhooks/stripe/route.ts',
  'src/app/auth/role-selection/page.tsx',
  'src/app/directory/page.tsx',
  'src/app/profile/[id]/page.tsx',
  'src/components/auth/SyncManualButton.tsx',
  'src/components/discovery/ArtistCard.tsx',
  'src/components/landing/LocalTalentSection.tsx',
  'src/components/profile/DashboardCenter.tsx',
  'src/components/profile/UpgradeButton.tsx',
  'src/context/LocationContext.tsx',
  'src/lib/ai/agents/maximizer.ts',
  'src/lib/documents/generator.ts',
  'src/lib/stripe/payouts.ts',
  'src/lib/utils/file-validation.ts'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, '..', f);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace logger.error("msg", err) -> logger.error({ err }, "msg")
  content = content.replace(/logger\.(error|warn|info|debug)\((['"`][^'"`]+?['"`]),\s*([^,)]+)(,\s*[^)]+)?\)/g, function(match, level, msg, arg1) {
    return `logger.${level}({ err: ${arg1} }, ${msg})`;
  });

  fs.writeFileSync(fullPath, content, 'utf8');
});
console.log('Fixed logger arg order in all files');
