# Job Portal Frontend

React + Vite frontend for the Job Portal project.

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` and set:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_ADZUNA_APP_ID=
VITE_ADZUNA_APP_KEY=
```

## Vercel Deployment

Use these settings in Vercel:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Required environment variable:

```text
VITE_API_BASE_URL=https://your-railway-backend-domain.up.railway.app/api
```

Optional environment variables for external job search:

```text
VITE_ADZUNA_APP_ID=your_adzuna_app_id
VITE_ADZUNA_APP_KEY=your_adzuna_app_key
```
