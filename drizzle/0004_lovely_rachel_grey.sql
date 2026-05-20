CREATE TABLE `remember_may21_daily_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(16) NOT NULL,
	`hoursLogged` float NOT NULL DEFAULT 0,
	`tasksCompleted` int NOT NULL DEFAULT 0,
	`mood` enum('excellent','good','neutral','tired','struggling') DEFAULT 'neutral',
	`reflection` text,
	`nextDayFocus` text,
	`aiEncouragement` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `remember_may21_daily_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remember_may21_streaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActiveDate` timestamp,
	`freezeCount` int NOT NULL DEFAULT 3,
	`freezeUsedToday` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remember_may21_streaks_id` PRIMARY KEY(`id`)
);
