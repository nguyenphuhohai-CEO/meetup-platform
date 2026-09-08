const express = require('express');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const User = require('../models/User');
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

const plans = {
  'basic': { price: 999, duration: 30, name: 'Basic - 1 mois' },
  'standard': { price: 2499, duration: 90, name: 'Standard - 3 mois' },
  'premium': { price: 4999, duration: 180, name: 'Premium - 6 mois' }
};

// Create payment intent
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = plans[planId];

    if (!plan) return res.status(400).json({ message: 'Plan invalide' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price,
      currency: 'eur',
      metadata: {
        userId: req.userId,
        planId: planId,
        duration: plan.duration
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      plan: plan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId, planId } = req.body;
    const plan = plans[planId];

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + plan.duration);

      await User.findByIdAndUpdate(req.userId, {
        premium: true,
        premiumUntil: premiumUntil
      });

      res.json({ message: 'Paiement confirmé, accès premium activé' });
    } else {
      res.status(400).json({ message: 'Paiement non confirmé' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get plans
router.get('/plans', (req, res) => {
  const formattedPlans = Object.entries(plans).map(([key, value]) => ({
    id: key,
    ...value,
    priceDisplay: `€${(value.price / 100).toFixed(2)}`
  }));
  res.json(formattedPlans);
});

module.exports = router;
