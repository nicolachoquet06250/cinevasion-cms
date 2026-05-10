-- Migration: Add dev user
-- Description: Adds nicovers06.fr user for development purposes

INSERT INTO `user` (id, name, email, emailVerified)
SELECT 'dev-user-id-001', 'nicovers06.fr', 'nicolachoquet06250@gmail.com', STRFTIME('%s', 'now') * 1000
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE email = 'nicolachoquet06250@gmail.com');
