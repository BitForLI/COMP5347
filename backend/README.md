# Backend (Express + MongoDB)

## Env

复制并填写：

```bash
cp .env.example .env
```

注册验证码邮件：配置 **`RESEND_API_KEY`** 与 **`EMAIL_FROM`**（须与 [Resend](https://resend.com) 后台已验证发件人一致）。

首次发送与冷却后的「重发」都调用：`POST /api/auth/register/send-code`。


## Run

```bash
npm install
npm run dev
```

## Routes

- `GET /api/health`
- `POST /api/auth/register/send-code`（注册：向邮箱发 6 位验证码，限流）
- `POST /api/auth/register`（注册：`email`、`password`、`confirmPassword`、`code`）
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

