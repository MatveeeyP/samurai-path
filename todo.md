# Путь самурая — TODO

## Core Setup
- [x] Initialize project scaffold
- [x] Database schema (17 tables: tasks, userAttempts, userTopicScores, userPlans, userWarrior, flashcards, motivationStories, quotes, variants, userVariantAttempts, homework, theoryArticles, news, videos, userProfiles, diagnosticSessions, users)
- [x] Global samurai theme (dark, #0F0F14 bg, #E63E7C accent, Cinzel headings)
- [x] Navigation layout with sidebar (15 menu items)

## Backend (tRPC Routers)
- [x] Auth router (me, logout)
- [x] Tasks router (list, count, byId, byTopic, submit, myAttempts, solvedCount, generate)
- [x] AI router (analyzeError, socraticChat, motivationalPhrase, diagnosticComment)
- [x] Diagnostics router (getTopics, getTopicScores, startSession, submitResults)
- [x] Plan router (getWeeklyPlan, getMonthlyPlan, generatePlan, updateStatus)
- [x] Warrior/gamification router (getStatus, addMinutes)
- [x] Flashcards router (list, create, review, systemCards)
- [x] Motivation router (stories, quotes)
- [x] Variants router (list, byId, submit)
- [x] Homework router (list, submit)
- [x] Theory router (list)
- [x] News router (list, videos)
- [x] Admin router (createTask, deleteTask, createVariant, assignHomework, reviewHomework, createArticle, createNews, createVideo, createStory, createQuote, createFlashcard, getStats)
- [x] Profile router (update, stats)

## Frontend Pages
- [x] Home (dashboard with warrior widget, radar chart, countdown to ЕГЭ, today's plan, quote)
- [x] /practice — task catalog with filters + AI generator tab
- [x] /task/:id — task page with answer field, AI error analysis, Socratic mode
- [x] /diagnostics — 15-question adaptive test with radar result + predicted score
- [x] /plan — weekly calendar grid + plan generation
- [x] /timer — Samurai timer with SVG city/warrior animation
- [x] /flashcards — SM-2 flashcard system (system + custom cards)
- [x] /variants — ЕГЭ variants list and solver
- [x] /homework — homework list and submission
- [x] /theory — theory articles with inline content
- [x] /motivation — stories, provocations, quotes tabs
- [x] /profile — stats, radar chart, settings
- [x] /admin — admin panel (tasks, theory, motivation tabs)
- [x] /news — news section
- [x] /videos — video section

## New Features
- [x] Feature 1: AI step-by-step error analysis with JSON response (step_with_error, error_type, what_went_wrong, rule_to_remember)
- [x] Feature 2: Entrance diagnostics + gap map radar chart
- [x] Feature 3: Adaptive weekly plan (prioritizes weak topics)
- [x] Feature 4: Samurai timer with SVG battle animation (city levels, warrior army)
- [x] Feature 5: Socratic dialogue mode (chat-style hints without giving answer)
- [x] Feature 6: Motivational course (stories, provocations, quotes)
- [x] Feature 7: Flashcards with SM-2 algorithm
- [x] Feature 9: Updated dashboard home page
- [x] Feature 10: Profile with warrior stats
- [x] Feature 11: Task generator with AI + fallback DB

## Quality
- [x] TypeScript: zero errors
- [x] Tests: 17 passing (auth, diagnostics, theory, motivation, variants, news, tasks, admin)
- [x] URL query param handling in Practice (topic, errorType)
- [x] Auth guards on protected queries
- [x] Null safety for all DB fields

## Pending / Future (Not Required for Jury)
- [ ] Feature 8: Excalidraw online whiteboard on task page (future feature)
- [x] Seed 70 tasks in DB across 5 topics × 3 difficulty levels
- [ ] PDF export for flashcards (future feature)
- [ ] Extended admin panel with variants, homework review, news management (future feature)


## IMPROVEMENTS ITERATION 2 (Competition Submission)

### Priority 1 — CRITICAL FOR JURY
- [x] Improvement 1: AI Helper Button (visible entry point to Socratic mode)
- [x] Improvement 2: Diagnostics with Full Statistics (persistent stats from DB, updated after each task)
- [x] Improvement 3: Print Functionality (flashcards + exam variants)

### Priority 2 — IMPORTANT
- [x] Improvement 4: Exam Variants with AI Grading (sample variant with AI scoring feedback)
- [x] Improvement 5: Drawing Flashcards + Templates (Excalidraw with 5 templates)
- [x] Improvement 6: Samurai & Fortress Visuals (SVG samurai, fortress progression, timer battle)

### Priority 3 — POLISH
- [x] Improvement 7: Notifications & Feedback (toasts via sonner, milestone notifications)
- [x] Improvement 8: Data Quality (70 tasks seeded across 5 topics, 3 difficulty levels)
- [x] Improvement 9: Minor Fixes (UI polish, edge cases, accessibility)


## IMPROVEMENTS ITERATION 3 (Final Polish for Jury)

### Priority 1 — CRITICAL FOR JURY
- [x] Improvement 1: Prominent AI Helper Button (pulsing gradient, visible entry point)
- [x] Improvement 2: Comprehensive Diagnostics with Charts (persistent stats from DB)
- [x] Improvement 3: Print Functionality (flashcards + exam variants)

### Priority 2 — IMPORTANT
- [x] Improvement 4: Exam Variants with AI Grading (sample variant with AI feedback)
- [x] Improvement 5: Drawing Flashcards + Templates (Excalidraw with 5 templates)
- [x] Improvement 6: Samurai & Fortress Visuals (SVG samurai, fortress, timer battle)

### Priority 3 — POLISH
- [x] Improvement 7: Notifications & Feedback (toasts via sonner)
- [x] Improvement 8: Data Quality (70 tasks seeded, 5 topics × 3 difficulty levels)
- [x] Improvement 9: Minor Fixes (UI polish, accessibility, edge cases)
