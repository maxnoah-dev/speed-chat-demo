# Frontend - Speed Chat

## Setup

1. Install dependencies:
```bash
npm install
```

2. Env theo NODE_ENV:
   - **Local** (`npm start`): dùng `.env.development` — `REACT_APP_API_URL=http://localhost:3002`
   - **Production build** (`npm run build`): dùng `.env.production` — sửa `REACT_APP_API_URL` cho domain thật
   - Override: tạo `.env.local` (không commit)

3. Run development server:
```bash
npm start
```

The app will open at http://165.22.99.117:3003
