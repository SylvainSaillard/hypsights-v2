-- Migration: Add Fast Search Quota Modal translations (Beta Feedback approach)
-- Description: Adds all translation keys for the Beta Feedback Modal when quota is reached
-- Updated: 2025-01-15 - Changed from Fast Search offer to Beta feedback request
-- Date: 2025-01-13

-- French translations (FR) - Beta Feedback approach
INSERT INTO translations (locale, key, value) VALUES
-- Modal main texts
('fr', 'fastSearchQuota.modal.title', 'Quota Fast Search Atteint'),
('fr', 'fastSearchQuota.modal.subtitle', '3/3 recherches utilisées'),
('fr', 'fastSearchQuota.modal.offer.title', 'Aidez-nous à améliorer Hypsights'),
('fr', 'fastSearchQuota.modal.offer.description', 'Hypsights est en phase bêta et nous aimerions échanger avec vous sur votre expérience. Partagez vos retours, vos besoins et vos suggestions pour nous aider à construire la meilleure plateforme possible.'),

-- Benefits list
('fr', 'fastSearchQuota.modal.benefit1', 'Partagez votre expérience et vos suggestions'),
('fr', 'fastSearchQuota.modal.benefit2', 'Influencez le développement de la plateforme'),
('fr', 'fastSearchQuota.modal.benefit3', 'Échange informel (15 min max)'),

-- Form labels and placeholders
('fr', 'fastSearchQuota.modal.phone.label', 'Numéro de téléphone'),
('fr', 'fastSearchQuota.modal.phone.placeholder', '+33 1 23 45 67 89'),
('fr', 'fastSearchQuota.modal.message.label', 'Message (optionnel)'),
('fr', 'fastSearchQuota.modal.message.placeholder', 'Parlez-nous brièvement de vos besoins...'),

-- Info and action texts
('fr', 'fastSearchQuota.modal.info', 'Notre équipe vous contactera sous 24h pour un échange informel autour de votre expérience Hypsights.'),
('fr', 'fastSearchQuota.modal.cancel', 'Plus tard'),
('fr', 'fastSearchQuota.modal.submit', 'Participer à l''échange'),
('fr', 'fastSearchQuota.modal.submitting', 'Envoi...'),

-- Success and error messages
('fr', 'fastSearchQuota.modal.success', 'Merci ! Notre équipe vous contactera très prochainement pour échanger sur votre expérience.'),
('fr', 'fastSearchQuota.modal.error', 'Échec de l''envoi de la demande. Veuillez réessayer.'),

-- KPI Card button
('fr', 'kpi.card.fast_search_quota.get_more', '💬 Partager mon feedback')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- English translations (EN) - Beta Feedback approach
INSERT INTO translations (locale, key, value) VALUES
-- Modal main texts
('en', 'fastSearchQuota.modal.title', 'Fast Search Quota Reached'),
('en', 'fastSearchQuota.modal.subtitle', '3/3 searches used'),
('en', 'fastSearchQuota.modal.offer.title', 'Help Us Improve Hypsights'),
('en', 'fastSearchQuota.modal.offer.description', 'Hypsights is in beta phase and we would love to discuss your experience with you. Share your feedback, needs and suggestions to help us build the best platform possible.'),

-- Benefits list
('en', 'fastSearchQuota.modal.benefit1', 'Share your experience and suggestions'),
('en', 'fastSearchQuota.modal.benefit2', 'Influence the platform development'),
('en', 'fastSearchQuota.modal.benefit3', 'Informal chat (15 min max)'),

-- Form labels and placeholders
('en', 'fastSearchQuota.modal.phone.label', 'Phone Number'),
('en', 'fastSearchQuota.modal.phone.placeholder', '+1 234 567 8900'),
('en', 'fastSearchQuota.modal.message.label', 'Message (optional)'),
('en', 'fastSearchQuota.modal.message.placeholder', 'Tell us briefly about your needs...'),

-- Info and action texts
('en', 'fastSearchQuota.modal.info', 'Our team will contact you within 24 hours for an informal discussion about your Hypsights experience.'),
('en', 'fastSearchQuota.modal.cancel', 'Later'),
('en', 'fastSearchQuota.modal.submit', 'Join the conversation'),
('en', 'fastSearchQuota.modal.submitting', 'Sending...'),

-- Success and error messages
('en', 'fastSearchQuota.modal.success', 'Thank you! Our team will contact you very soon to discuss your experience.'),
('en', 'fastSearchQuota.modal.error', 'Failed to send request. Please try again.'),

-- KPI Card button
('en', 'kpi.card.fast_search_quota.get_more', '💬 Share my feedback')

ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Beta Feedback Modal translations added successfully for FR and EN locales';
END $$;
