# Backend - Speed Chat

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` thành `.env.development` hoặc `.env.production` và cập nhật thông tin database:
```bash
cp .env.example .env.development
# hoặc
cp .env.example .env.production
```

3. Make sure MySQL is running and database is created (run `database.sql` from root)

4. Run development server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
