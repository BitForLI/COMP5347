# Backend (Express + MongoDB)

## Env

复制并填写：

```bash
cp .env.example .env
```

## Run

```bash
npm install
npm run dev
```

## Routes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login` (rate limited)
- `GET /api/auth/me`
- `GET /api/quiz` (protected)
- `POST /api/quiz/submit` (protected + rate limited)
- `GET /api/quiz/attempts` (protected)
- `GET /api/quiz/leaderboard` (protected)
- `GET /api/admin/questions` (admin)
- `POST /api/admin/questions` (admin)
- `PATCH /api/admin/questions/:id` (admin)
- `DELETE /api/admin/questions/:id` (admin)
- `POST /api/admin/questions/:id/toggle` (admin)
- `POST /api/admin/bulk-import` (admin)

