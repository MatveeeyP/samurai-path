ALTER TABLE `flashcards` ADD `cardType` enum('text','drawing') DEFAULT 'text';--> statement-breakpoint
ALTER TABLE `flashcards` ADD `frontDrawing` text;--> statement-breakpoint
ALTER TABLE `flashcards` ADD `backDrawing` text;--> statement-breakpoint
ALTER TABLE `flashcards` ADD `template` varchar(64);