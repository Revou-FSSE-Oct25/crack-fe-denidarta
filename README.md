# crack-fe-denidarta

Frontend untuk aplikasi Rapor Biru. Dibangun dengan Next.js 16, React 19, dan IBM Carbon Design System.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: IBM Carbon React
- **State**: TanStack Query v5
- **Form**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4 + SASS

## Setup Lokal

```bash
npm install
```

Buat file `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Jalankan dev server:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run lint       # lint
npm run test       # unit test (vitest)
npm run test:run   # run test sekali
```

## Deployment

Frontend di-deploy ke **Netlify**: [https://rapor-biru.netlify.app](https://rapor-biru.netlify.app)

Environment variable yang wajib di-set di Netlify:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://api.raporbiru.web.id` |

Deploy otomatis saat push ke branch `main`.
