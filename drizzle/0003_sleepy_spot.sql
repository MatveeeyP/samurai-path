CREATE TABLE `remember_may21_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`targetDate` timestamp NOT NULL,
	`isGrandGoal` boolean NOT NULL DEFAULT false,
	`progress` int DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `remember_may21_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remember_may21_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(256) NOT NULL,
	`fileUrl` varchar(512) NOT NULL,
	`fileType` varchar(32) NOT NULL,
	`linkedGoalId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `remember_may21_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remember_may21_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` varchar(64) NOT NULL,
	`hours` float NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `remember_may21_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remember_may21_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`dueDate` timestamp,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `remember_may21_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remember_may21_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mentorMode` enum('kind','strict','rude') NOT NULL DEFAULT 'kind',
	`displayName` varchar(128) NOT NULL,
	`weeklyHoursGoal` float NOT NULL DEFAULT 48,
	`seasonGoal` text,
	`seasonGoalProgress` int DEFAULT 0,
	`studyBlockFormat` text,
	`currentStreak` int NOT NULL DEFAULT 0,
	`freezesRemaining` int NOT NULL DEFAULT 0,
	`lastStudyDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remember_may21_users_id` PRIMARY KEY(`id`)
);
