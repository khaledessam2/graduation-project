# Unit Tests — Test Scenarios Documentation

## AuthService — 22 tests

### Initial State

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 1 | localStorage empty → `currentUser` = null | Default state for any new visitor |
| 2 | localStorage has valid user data → loads it into the signal | Session persists after page refresh |
| 3 | localStorage has corrupted JSON → returns null without crashing | Protects against tampered storage |

### getUniversityId / getToken

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 4 | No value stored → returns null | Must not return an empty string |
| 5 | Value is stored → returns it | Interceptor and services depend on these |
| 6 | No token stored → returns null | — |
| 7 | Token is stored → returns it | — |

### isLoggedIn

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 8 | No user → returns false | authGuard depends on this result |
| 9 | User loaded from localStorage → returns true | Session verification |

### login

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 10 | Response has `res.data.token` format → success + token saved | Official API format |
| 11 | Response has `res.token` directly → success + token saved | Fallback if backend returns different format |
| 12 | Role sent as UPPERCASE → normalized to lowercase | `role === 'admin'` check works correctly |
| 13 | HTTP 401 with message → `{ success: false, message }` | Display error to user |
| 14 | HTTP 500 without body → default error message | Prevents showing `undefined` to user |
| 15 | Error body has `detail` instead of `message` → uses it | Django REST Framework sends `detail` not `message` |

### updateStats

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 16 | `currentUser` is null → does nothing, no crash | Dashboard calls this on every load |
| 17 | Updates gpa, passedHours, availableHours on signal | Dashboard stats refresh immediately |
| 18 | Updates name when name argument is provided | Name can change |
| 19 | Persists updated stats to localStorage | Session stays updated after page refresh |

### logout

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 20 | Removes `unismart_token`, `unismart_user`, `unismart_uid` | Any remaining key = potential data leak |
| 21 | Sets `currentUser` to null | UI updates immediately |
| 22 | Navigates to `/login` | User doesn't remain on a protected page |

---

## authGuard — 3 tests

| # | Scenario | Result |
|---|----------|--------|
| 1 | User is logged in | Returns `true`, no redirect |
| 2 | User is NOT logged in | Returns `false` |
| 3 | User is NOT logged in | Navigates to `/login` |

> Tests 2 and 3 are intentionally separate — each assertion covers a distinct behavior.

---

## adminGuard — 5 tests

| # | Scenario | Result |
|---|----------|--------|
| 1 | Logged in + role = `admin` | Returns `true`, no redirect |
| 2 | Logged in + role = `student` | Returns `false` |
| 3 | Logged in + role = `student` | Navigates to `/login` |
| 4 | Not logged in at all | Returns `false` |
| 5 | Not logged in at all | Navigates to `/login` |

> Critical scenario: a student attempting to access `/admin/...` must be blocked.

---

## apiInterceptor — 8 tests

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 1 | `loading.start()` is called | Spinner activates on every request |
| 2 | `loading.stop()` is called after response | Spinner stops after request completes |
| 3 | `Content-Type: application/json` added to every request | Backend can parse the request body |
| 4 | `Authorization: Bearer {token}` added for API URLs when token exists | Authentication header |
| 5 | `x-user-role: admin/student` added for API URLs | Backend knows user permissions |
| 6 | No `Authorization` header for external URLs | Prevents token leakage to third parties |
| 7 | No `x-user-role` header for external URLs | Same reason |
| 8 | No `Authorization` when token is null | Login request itself goes out without token |

---

## GradesService — 15 tests

### Initial State

| # | Scenario |
|---|----------|
| 1 | `grades` = empty array |
| 2 | `loading` = false |
| 3 | `error` = null |

### loadGrades

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 4 | `loading = true` before response arrives | UI shows spinner |
| 5 | Body contains `universityId` only (no level/term) | Clean body when filtering not needed |
| 6 | Body includes `level` and `term` when provided | Semester filtering works |
| 7 | Response in `res.data` array format | Official API format |
| 8 | Response as direct array | Fallback format |
| 9 | Snake_case fields: `course_name`, `numeric_grade`, `letter_grade` | Some endpoints return snake_case |
| 10 | `courseCode` used as fallback for `courseName` | If no name → shows the code |
| 11 | `level` and `term` are null when not in response | Must return null, not 0 |
| 12 | `loading = false` after success | Spinner stops |
| 13 | HTTP error with `message` → stored in `error` signal | UI shows error message |
| 14 | HTTP error without `message` → default error message | Prevents showing `undefined` |
| 15 | `error` signal cleared before each new request | Old error message doesn't persist |

---

## RegistrationService — 23 tests

### Initial State

| # | Scenario |
|---|----------|
| 1 | `availableCourses` = empty array |
| 2 | `pendingCourseIds` = empty array |
| 3 | `loading` = false, `error` = null |

### loadAvailableCourses

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 4 | POST to correct URL with `universityId` in body | — |
| 5 | Sends `level` and `term` when provided | Course filtering works |
| 6 | Maps camelCase fields | Official API format |
| 7 | Maps snake_case fields | Alternative backend format |
| 8 | String prerequisites split by comma → array | `"CS101, CS201"` → `["CS101", "CS201"]` |
| 9 | Array prerequisites kept as array | No double conversion |
| 10 | `creditHours` defaults to 3 when missing | Avoids NaN in hour calculations |
| 11 | HTTP error → error signal set | — |

### registerCourse

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 12 | `courseId` not found → returns `{ success: false }` immediately | No HTTP request made |
| 13 | Request body contains course code, not id | Backend expects the code |
| 14 | On success → `courseId` added to `pendingCourseIds` | UI reflects pending state |
| 15 | Registering same course twice → not duplicated in list | Prevents duplicate entries |
| 16 | HTTP error → `error` signal + `{ success: false }` | — |

### unregisterCourse

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 17 | Removes courseId from the list | UI updates immediately |
| 18 | ID not in list → no change, no crash | Defensive handling |
| 19 | Empty list → remains empty | — |

### pendingHours

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 20 | Sums credit hours of all pending courses | Shows total pending hours in UI |
| 21 | No pending courses → returns 0 | — |
| 22 | ID exists in pending but not in availableCourses → skipped | No crash on stale data |
| 23 | Single course pending → returns its credit hours | Basic case |

---

## AdminStatsService — 6 tests

| # | Scenario | Why It Matters |
|---|----------|----------------|
| 1 | POST to `/api/admin/stats` with empty body | Endpoint requires POST, not GET |
| 2 | Maps camelCase fields from `res.data` | `totalStudents`, `recentRegistrations`, etc. |
| 3 | Maps snake_case fields from flat response | `total_students`, `recent_registrations`, etc. |
| 4 | `departments` field used as fallback for `departmentsCount` | Three possible field names from backend |
| 5 | Empty response → all numbers = 0, all arrays = [] | Dashboard doesn't crash on missing data |
| 6 | `res.data` takes priority over top-level fields | Handles ambiguous response structure |

---

## Summary

| File | Tests |
|------|-------|
| auth.service.spec.ts | 22 |
| auth.guard.spec.ts | 3 |
| admin.guard.spec.ts | 5 |
| api.interceptor.spec.ts | 8 |
| grades.service.spec.ts | 15 |
| registration.service.spec.ts | 23 |
| admin-stats.service.spec.ts | 6 |
| **Total** | **82** |
