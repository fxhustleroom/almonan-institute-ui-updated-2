# Almonan Institute UI (Next.js + React)

This project contains the **public pages + student portal pages** for Almonan Institute, matching the design style/colors you generated:

1) Home `/`
2) Courses catalog `/courses`
3) Course details `/courses/[courseId]`
4) Library `/library`
5) Bookstore `/bookstore`
6) Support `/support`

## Design rules (kept consistent)
- One logo for all pages (ALMONAN INSTITUTE).
- Same color palette (cream background + Almonan green + brown accents).
- Same menu order: Home, Courses, Library, Bookstore, Support, Login.
- All content relates to **school services** (courses, library, bookstore, support).

---

## API mapping (connects the UI to your backend)

Set your API base URL:

```bash
cp .env.example .env.local
# edit NEXT_PUBLIC_API_BASE
```

### Endpoints used by each page

**Home `/`**
- Featured courses: `GET /public/courses`

**Courses `/courses`**
- Course list + search/filter: `GET /public/courses` (query params supported in UI: `q`, `category`, `price`, `page`)

**Course details `/courses/[courseId]`**
- Course details: `GET /public/courses/:id`

**Library `/library`**
- Library books/resources: `GET /library/books`

**Bookstore `/bookstore`**
- Products/books: `GET /bookstore/products`

**Support `/support`**
- Submit ticket: `POST /support/tickets` (payload: `{ fullName, contact, subject, message }`)

---

## Student portal routes added (same design system)

### Auth (UI screens in your latest batch)
- Login (screen): `/login`  → `POST /auth/login`
- Student registration (screen): `/register` → `POST /auth/register/online`
- Offline registration (screen): `/register?mode=offline` → `POST /auth/register/offline`
- Forgot password (screen): `/forgot-password` → `POST /auth/forgot-password`
- Verification success (screen): `/verify/success` → `POST /auth/verify-email` (or your verify endpoint)
- Profile & Privacy (screen): `/profile` → `GET /me`, `PATCH /me`, `PATCH /me/privacy`, `POST /me/avatar`

### Student dashboard + learning (UI screens in your latest batch)
- Student Dashboard: `/dashboard` → `GET /me/dashboard`, `GET /me/activity`
- My Enrolled Courses: `/my-courses` → `GET /me/courses`
- Course Learning Outline: `/my-courses/[courseId]` → `GET /courses/:id`, `GET /learning/courses/:id/outline`
- Lesson Viewer: `/my-courses/[courseId]/lessons/[lessonId]` → `GET /learning/lessons/:id`, `GET /learning/courses/:id/outline`
- Module Q&A Threads: `/qna/[moduleId]` → `GET /qna/threads?moduleId=...`
- Quiz Attempt UI: `/quizzes/[quizId]/attempt` →
  - load: `GET /quizzes/:quizId/attempt`
  - save answer: `POST /quizzes/:quizId/attempt/answer`
  - submit: `POST /quizzes/:quizId/attempt/submit`

All calls are implemented in:
- `lib/queries.ts`
- Axios instance in `lib/api.ts`

---

## Run locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

---

## Notes
- If any backend route names differ from your Nest API, update them in **one place**: `lib/queries.ts`.
- Screens are fully built with real API calls + safe fallbacks, so you can start developing immediately.
