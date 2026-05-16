CREATE TABLE `diagnostic_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`answers` json,
	`completed` boolean DEFAULT false,
	`aiComment` text,
	`predictedScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnostic_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`topic` varchar(128),
	`isCustom` boolean DEFAULT false,
	`scheduledAt` timestamp DEFAULT (now()),
	`repetitionCount` int DEFAULT 0,
	`easeFactor` float DEFAULT 2.5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flashcards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `homework` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` varchar(256) NOT NULL,
	`taskIds` json,
	`status` enum('assigned','submitted','reviewed') DEFAULT 'assigned',
	`dueDate` timestamp,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `homework_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `motivation_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`summary` text,
	`fullText` text,
	`heroName` varchar(128),
	`category` enum('famous','student','quote','provocation') DEFAULT 'famous',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `motivation_stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text,
	`imageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`author` varchar(128),
	`category` varchar(64) DEFAULT 'warrior',
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_boards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int NOT NULL,
	`boardData` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(64) NOT NULL DEFAULT 'Математика',
	`topic` varchar(128) NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`category` varchar(128),
	`text` text NOT NULL,
	`answer` varchar(256),
	`solution` text,
	`source` varchar(256),
	`isGenerated` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `theory_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text,
	`topic` varchar(128),
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `theory_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int NOT NULL,
	`userAnswer` varchar(512),
	`userSolution` text,
	`isCorrect` boolean DEFAULT false,
	`errorType` varchar(64),
	`aiExplanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(16) NOT NULL,
	`topic` varchar(128),
	`taskIds` json,
	`status` enum('pending','in_progress','completed') DEFAULT 'pending',
	`estimatedMinutes` int DEFAULT 40,
	CONSTRAINT `user_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_topic_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(128) NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_topic_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_variant_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`variantId` int NOT NULL,
	`answers` json,
	`score` int DEFAULT 0,
	`completed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_variant_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_warrior` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalMinutes` int NOT NULL DEFAULT 0,
	`samuraiCount` int NOT NULL DEFAULT 0,
	`cityLevel` int NOT NULL DEFAULT 0,
	`warriorRank` varchar(32) NOT NULL DEFAULT 'ронин',
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActiveDate` varchar(16),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_warrior_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_warrior_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`type` enum('trial','marathon','custom') DEFAULT 'trial',
	`taskIds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`url` varchar(512) NOT NULL,
	`isExternal` boolean DEFAULT true,
	`topic` varchar(128),
	`thumbnailUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `grade` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `region` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `egeDateTarget` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `targetScore` int DEFAULT 85;