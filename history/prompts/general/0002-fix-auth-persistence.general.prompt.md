---
id: 0002
title: Fix auth persistence
stage: general
date: 2025-12-26
surface: agent
model: claude-sonnet-4.5-20250929
feature: none
branch: 003-auth-better-auth-docusaurus
user: aliyan
command: /fix auth persistence
labels: ["authentication","database","bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - src/db.py
 - src/main.py
tests:
 - Signup endpoint creates user in database
 - Login endpoint authenticates user from database
 - /api/auth/me retrieves user from database via token
 - User persists across server restarts
 - Invalid credentials return 401 error
---
## Prompt

I have better-auth integrated in fastAPI server but when I login or signup It stays logged in but after the server restarts I can't login maybe my login credentials is not saving. Check all the files

## Response snapshot

Identified the root cause: Authentication was using in-memory Python dictionaries (`users_db` and `sessions_db`) that get cleared on server restart. The database connection existed but wasn't being used for authentication.

Fixed by:
1. Added `users` and `auth_sessions` tables to PostgreSQL database schema in `src/db.py`
2. Updated `BetterAuth` class in `src/main.py` to use database instead of in-memory storage:
   - `create_user()` - inserts user into database and returns created user data
   - `user_exists()` - checks if email exists in database
   - `authenticate_user()` - verifies password against database and returns user
   - `get_user_by_token()` - retrieves user via session token from database
   - `create_session()` - creates session in database with token and expiry
   - `delete_session()` - removes session from database on logout
   - `update_user()` - updates user information in database
3. Updated all authentication endpoints to use database methods
4. Added proper error logging with traceback

## Outcome

- ✅ Impact: Users and sessions now persist in PostgreSQL across server restarts
- 🧪 Tests: All authentication endpoints tested - signup, login, /me, logout, invalid credentials
- 📁 Files: Modified src/db.py (added tables) and src/main.py (updated BetterAuth class and endpoints)
- 🔁 Next prompts: None - issue resolved
- 🧠 Reflection: The original implementation used in-memory dictionaries explicitly labeled as "Mock database for development", which caused data loss on restart. Migration to PostgreSQL ensures persistent storage.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All tests passed
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): None - fix complete
