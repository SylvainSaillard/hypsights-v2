-- Migration: Add Fast Search Launch Modal translations (FR/EN)
-- Date: 2025-12-16
-- Updated: New UX with 2 action buttons (Launch & Watch, Launch & Leave)

-- English translations
INSERT INTO translations (locale, key, value) VALUES
('en', 'fast_search_modal.title', 'Launch Fast Search'),
('en', 'fast_search_modal.processing_message', 'The search process may take a few minutes.'),
('en', 'fast_search_modal.processing_description', 'We are searching for the best suppliers matching your solution criteria.'),
('en', 'fast_search_modal.option_email', 'Notify me by email when complete'),
('en', 'fast_search_modal.option_email_desc', 'Receive an email notification when the search is finished'),
('en', 'fast_search_modal.button_cancel', 'Cancel'),
('en', 'fast_search_modal.button_stay', 'Launch & Watch'),
('en', 'fast_search_modal.button_leave', 'Launch & Leave')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;

-- French translations
INSERT INTO translations (locale, key, value) VALUES
('fr', 'fast_search_modal.title', 'Lancer la recherche rapide'),
('fr', 'fast_search_modal.processing_message', 'Le processus de recherche peut prendre quelques minutes.'),
('fr', 'fast_search_modal.processing_description', 'Nous recherchons les meilleurs fournisseurs correspondant aux critères de votre solution.'),
('fr', 'fast_search_modal.option_email', 'Me notifier par email à la fin'),
('fr', 'fast_search_modal.option_email_desc', 'Recevoir une notification par email lorsque la recherche sera terminée'),
('fr', 'fast_search_modal.button_cancel', 'Annuler'),
('fr', 'fast_search_modal.button_stay', 'Lancer et suivre'),
('fr', 'fast_search_modal.button_leave', 'Lancer et quitter')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value;
