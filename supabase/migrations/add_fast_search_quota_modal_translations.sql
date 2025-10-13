-- Migration: Add Fast Search Quota Modal translations
-- Description: Adds all translation keys for the Fast Search Quota Modal in French and English
-- Date: 2025-01-13

-- French translations (FR)
INSERT INTO translations (locale, key, value) VALUES
-- Modal main texts
('fr', 'fastSearchQuota.modal.title', 'Fast Search Quota Atteint'),
('fr', 'fastSearchQuota.modal.subtitle', '3/3 recherches utilisées'),
('fr', 'fastSearchQuota.modal.offer.title', '🎁 Offre Spéciale : +1 Fast Search Gratuit'),
('fr', 'fastSearchQuota.modal.offer.description', 'Partagez vos coordonnées avec notre équipe pour un échange rapide sur vos besoins. En retour, recevez immédiatement 1 Fast Search supplémentaire !'),

-- Benefits list
('fr', 'fastSearchQuota.modal.benefit1', '1 Fast Search supplémentaire offert'),
('fr', 'fastSearchQuota.modal.benefit2', 'Conseils personnalisés de nos experts'),
('fr', 'fastSearchQuota.modal.benefit3', 'Échange rapide (15 min max)'),

-- Form labels and placeholders
('fr', 'fastSearchQuota.modal.phone.label', 'Numéro de téléphone'),
('fr', 'fastSearchQuota.modal.phone.placeholder', '+33 1 23 45 67 89'),
('fr', 'fastSearchQuota.modal.message.label', 'Message (optionnel)'),
('fr', 'fastSearchQuota.modal.message.placeholder', 'Parlez-nous brièvement de vos besoins...'),

-- Info and action texts
('fr', 'fastSearchQuota.modal.info', 'Notre équipe vous contactera sous 24h pour un échange rapide et vous créditer votre Fast Search.'),
('fr', 'fastSearchQuota.modal.cancel', 'Plus tard'),
('fr', 'fastSearchQuota.modal.submit', 'Obtenir 1 Fast Search'),
('fr', 'fastSearchQuota.modal.submitting', 'Envoi...'),

-- Success and error messages
('fr', 'fastSearchQuota.modal.success', 'Votre demande a été envoyée ! Notre équipe vous contactera très prochainement pour vous offrir 1 Fast Search supplémentaire.'),
('fr', 'fastSearchQuota.modal.error', 'Échec de l''envoi de la demande. Veuillez réessayer.'),

-- KPI Card button
('fr', 'kpi.card.fast_search_quota.get_more', '🎁 Obtenir +1 Fast Search')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- English translations (EN)
INSERT INTO translations (locale, key, value) VALUES
-- Modal main texts
('en', 'fastSearchQuota.modal.title', 'Fast Search Quota Reached'),
('en', 'fastSearchQuota.modal.subtitle', '3/3 searches used'),
('en', 'fastSearchQuota.modal.offer.title', '🎁 Special Offer: +1 Free Fast Search'),
('en', 'fastSearchQuota.modal.offer.description', 'Share your contact details with our team for a quick discussion about your needs. In return, receive 1 additional Fast Search immediately!'),

-- Benefits list
('en', 'fastSearchQuota.modal.benefit1', '1 additional Fast Search offered'),
('en', 'fastSearchQuota.modal.benefit2', 'Personalized advice from our experts'),
('en', 'fastSearchQuota.modal.benefit3', 'Quick call (15 min max)'),

-- Form labels and placeholders
('en', 'fastSearchQuota.modal.phone.label', 'Phone Number'),
('en', 'fastSearchQuota.modal.phone.placeholder', '+1 234 567 8900'),
('en', 'fastSearchQuota.modal.message.label', 'Message (optional)'),
('en', 'fastSearchQuota.modal.message.placeholder', 'Tell us briefly about your needs...'),

-- Info and action texts
('en', 'fastSearchQuota.modal.info', 'Our team will contact you within 24 hours for a quick discussion and credit your Fast Search.'),
('en', 'fastSearchQuota.modal.cancel', 'Later'),
('en', 'fastSearchQuota.modal.submit', 'Get 1 Fast Search'),
('en', 'fastSearchQuota.modal.submitting', 'Sending...'),

-- Success and error messages
('en', 'fastSearchQuota.modal.success', 'Your request has been sent! Our team will contact you very soon to offer you 1 additional Fast Search.'),
('en', 'fastSearchQuota.modal.error', 'Failed to send request. Please try again.'),

-- KPI Card button
('en', 'kpi.card.fast_search_quota.get_more', '🎁 Get +1 Fast Search')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Fast Search Quota Modal translations added successfully for FR and EN locales';
END $$;
