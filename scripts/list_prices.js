const Stripe = require('stripe');
const fs = require('fs');

async function listPrices() {
    const env = fs.readFileSync('.env', 'utf8');
    const secretKey = env.match(/STRIPE_SECRET_KEY=(.*)/)?.[1]?.replace(/['"]/g, '');

    if (!secretKey) {
        console.error('STRIPE_SECRET_KEY not found');
        return;
    }

    const stripe = new Stripe(secretKey);
    console.log('Listing first 10 prices in this account...');
    try {
        const prices = await stripe.prices.list({ limit: 10 });
        prices.data.forEach(p => {
            console.log(`- ${p.id} (${p.unit_amount / 100} ${p.currency}) - Active: ${p.active}`);
        });
    } catch (err) {
        console.error(`ERROR: ${err.message}`);
    }
}

listPrices();
