const Stripe = require('stripe');
const fs = require('fs');

async function checkPrice() {
    const env = fs.readFileSync('.env', 'utf8');
    const secretKey = env.match(/STRIPE_SECRET_KEY=(.*)/)?.[1]?.replace(/['"]/g, '');

    if (!secretKey) {
        console.error('STRIPE_SECRET_KEY not found in .env');
        return;
    }

    const stripe = new Stripe(secretKey);
    const priceId = 'price_1T8Fs2EEdRD9DFfEQlTc1IqF';

    console.log(`Checking Price ID: ${priceId}`);
    try {
        const price = await stripe.prices.retrieve(priceId);
        console.log('SUCCESS: Price found!');
        console.log(JSON.stringify(price, null, 2));
    } catch (err) {
        console.error(`ERROR: ${err.message}`);
    }
}

checkPrice();
