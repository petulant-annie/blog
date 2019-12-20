const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createCharge = (stripeCustomerId, amount, email, stripeCardId) => {
  return stripe.charges.create({
    customer: stripeCustomerId,
    amount: amount,
    currency: 'usd',
    description: `Charge Pro for ${email}`,
    source: stripeCardId,
  });
};

exports.createCustomer = (email) => {
  return stripe.customers.create({
    email: email,
    source: 'tok_visa',
  });
};

exports.retrieveCustomer = (stripeCustomerId) => {
  return stripe.customers.retrieve(stripeCustomerId);
};

exports.updateCustomer = (stripeCustomerId, amount) => {
  stripe.customers.update(
    stripeCustomerId,
    { balance: amount }
  );
};