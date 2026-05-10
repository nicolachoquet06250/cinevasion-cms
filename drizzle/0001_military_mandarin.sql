DROP TABLE `authenticator`;--> statement-breakpoint
ALTER TABLE `user` ADD `twoFactorSecret` text;--> statement-breakpoint
ALTER TABLE `user` ADD `twoFactorEnabled` integer DEFAULT false;