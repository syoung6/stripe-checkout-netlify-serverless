const publishKey = 'pk_test_51INt1LKVtADShm00p9Kq8apFcYNM1eeUicdjYHbcTEOu2KYkliS8NFlMMVXqpzm2hSYWix21pvGCMfXXMVhIoY9p00BF0pzK1p';
const secretKey = 'sk_test_51INt1LKVtADShm00ytNgXXuZqa9oeyxH8FJiuo64jMubBuRz2oaPywM2gGE1tR68hRBcfuZINEBEuVbyd1IVThOv00PEwdehkN';

const process = require('process');
const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
console.log(STRIPE_PUBLISHABLE_KEY);
console.log(STRIPE_SECRET_KEY);

const stripe = require('stripe')(STRIPE_SECRET_KEY);
// const stripe = require('stripe')(secretKey);
const inventory = require('./data/products.json');

exports.handler = async (event) => {
  const { sku, quantity } = JSON.parse(event.body);
  const product = inventory.find((p) => p.sku === sku);
  const validatedQuantity = quantity > 0 && quantity < 11 ? quantity : 1;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    success_url: `${process.env.URL}/success.html`,
    cancel_url: process.env.URL,
    line_items: [
      {
        name: product.name,
        description: product.description,
        images: [product.image],
        amount: product.amount,
        currency: product.currency,
        quantity: validatedQuantity,
      },
    ],
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      sessionId: session.id,
      publishableKey: STRIPE_PUBLISHABLE_KEY
    }),
  };
};
