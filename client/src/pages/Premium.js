import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import '../styles/Premium.css';

function Premium({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/payments/plans')
      .then(res => setPlans(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (planId) => {
    try {
      const response = await API.post('/payments/create-intent', { planId });
      // Intégrer Stripe Elements ici dans une vraie app
      alert('Redirection vers le paiement Stripe (à implémenter complètement)');
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="premium-page">
      <header className="page-header">
        <Link to="/dashboard" className="btn-back">← Retour</Link>
        <h1>✨ Passer Premium</h1>
      </header>

      <div className="premium-container">
        <div className="premium-intro">
          <h2>Débloquez des fonctionnalités exclusives</h2>
          <p>Augmentez vos chances de rencontres avec une adhésion premium</p>
        </div>

        <div className="features-list">
          <div className="feature">
            <span>❤️</span>
            <p>Vues illimitées</p>
          </div>
          <div className="feature">
            <span>💬</span>
            <p>Messages prioritaires</p>
          </div>
          <div className="feature">
            <span>🔍</span>
            <p>Filtres avancés</p>
          </div>
          <div className="feature">
            <span>👀</span>
            <p>Voir qui a aimé votre profil</p>
          </div>
        </div>

        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan.id} className={`plan-card ${plan.id === 'premium' ? 'featured' : ''}`}>
              {plan.id === 'premium' && <span className="badge">Meilleur choix</span>}
              <h3>{plan.name}</h3>
              <div className="price">{plan.priceDisplay}</div>
              <p className="duration">{plan.duration} jours d'accès</p>
              <button
                onClick={() => handlePurchase(plan.id)}
                className="btn-primary"
              >
                Acheter maintenant
              </button>
            </div>
          ))}
        </div>

        <div className="premium-info">
          <h3>Comment ça marche ?</h3>
          <ol>
            <li>Choisissez un plan</li>
            <li>Effectuez le paiement sécurisé</li>
            <li>Accédez immédiatement aux fonctionnalités premium</li>
            <li>Profitez d'une meilleure expérience de rencontre</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Premium;
