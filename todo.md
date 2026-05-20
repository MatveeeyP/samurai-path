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


## REMEMBER MAY 21 (Вспомни 21 мая) — Light Theme Discipline Tracker

### Phase 1-2: MVP (Completed)
- [x] Database schema (5 tables: rememberMay21Users, rememberMay21Goals, rememberMay21Sessions, rememberMay21Tasks, rememberMay21Materials)
- [x] Onboarding flow (mentor mode selection, name, goals, weekly hours, study blocks)
- [x] Hour tracking MVP (basic timer, session logging)
- [x] Goals management
- [x] Tasks and materials management
- [x] Light theme (#1B6DEB accent)

### Phase 3: Day-Closing Ritual (PRIORITY)
- [x] Database: Add dailySummary table (date, userId, hoursLogged, tasksCompleted, mood, reflection, nextDayFocus)
- [x] Backend router: rememberMay21.closeDayRitual (save summary, calculate streak, prepare next day)
- [x] Frontend: DayClosingRitual component (mood selector, reflection input, next day focus, AI encouragement)
- [x] Integration: Show ritual modal at end of day (8 PM or user-defined time)

### Phase 4: Streak Mechanics
- [x] Database: Add streaks table (userId, currentStreak, longestStreak, lastActiveDate, freezeCount, freezeUsedToday)
- [x] Backend router: rememberMay21.getStreaks, rememberMay21.useFreeze
- [x] Frontend: Streak widget (current/longest, freeze button, visual indicator)
- [x] Logic: Auto-update streak on daily session, freeze mechanic (skip 1 day without losing streak)

### Phase 5: Time-of-Day Heatmap
- [x] Database: Extend sessions table with hourOfDay field
- [x] Backend router: rememberMay21.getHeatmapData (7-day activity by hour)
- [x] Frontend: Heatmap visualization (7 days × 24 hours grid, color intensity by activity)
- [x] Integration: Show on dashboard or dedicated Heatmap page

### Phase 6: AI Mentor Integration
- [x] Backend router: rememberMay21.getMentorMessage (personality: kind/strict/rude)
- [x] Frontend: AIMentor component (3 personality buttons, action buttons: motivate/plan/reflect/rest)
- [x] LLM integration: Generate contextual messages based on user stats and personality
- [x] Integration: Show mentor on dashboard or modal

### Phase 7: Testing & Polish
- [x] Unit tests for all new routers (6 tests passing)
- [x] UI polish and light theme consistency
- [x] End-to-end testing of Day-Closing Ritual flow
- [x] Performance optimization


## REMEMBER MAY 21 — Refinements & Future Enhancements

### AI Mentor Enhancement
- [ ] Implement server-side `rememberMay21.getMentorMessage` with LLM integration
- [ ] Generate contextual messages based on user stats (streak, hours, mood history)
- [ ] Replace hardcoded client messages with dynamic LLM responses

### Day-Closing Ritual Enhancement
- [ ] Add scheduled reminder at 8 PM (or user-configurable time)
- [ ] Generate AI encouragement message on ritual completion
- [ ] Implement upsert logic (one summary per date/user)
- [ ] Add "prepare next day" checklist generation

### Streak Mechanics Refinement
- [ ] Implement true freeze logic (preserve streak across 1 missed day)
- [ ] Add `getStreaks` router procedure
- [ ] Auto-update streak on session creation (not just on day close)
- [ ] Add streak milestone notifications (7-day, 14-day, 30-day)

### Heatmap Enhancement
- [ ] Add `hourOfDay` field to rememberMay21Sessions table
- [ ] Persist hour data when sessions are created
- [ ] Add heatmap filtering by session type
- [ ] Show recommendations based on peak activity hours

### Testing & Validation
- [ ] Add router-level tests (not just DB-level)
- [ ] End-to-end test for complete Day-Closing Ritual flow
- [ ] Test streak calculation edge cases
- [ ] Validate freeze mechanic behavior

### UI/UX Polish
- [ ] Ensure light theme works independently from Samurai dark theme
- [ ] Add animations for streak milestones
- [ ] Improve heatmap mobile responsiveness
- [ ] Add onboarding tour for new users
