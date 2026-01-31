# Social Demo Project

Demo project với Frontend (React + TypeScript) và Backend (Express.js + Node.js) kết nối với MySQL.

## Cấu trúc dự án

```
social-full-demo/
├── fe/                 # Frontend React + TypeScript
├── be/                 # Backend Express.js + Node.js
└── database.sql        # MySQL database schema
```

## Setup

### 1. Database

Chạy file `database.sql` trong MySQL để tạo database và tables:
```bash
mysql -u root -p < database.sql
```

### 2. Backend

```bash
cd be
npm install
cp .env.example .env
# Cập nhật thông tin database trong .env
npm run dev
```

Backend chạy tại: http://localhost:3002

### 3. Frontend

```bash
cd fe
npm install
npm start
```

Frontend chạy tại: http://localhost:3003

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - Lấy danh sách users
- `GET /api/posts` - Lấy danh sách posts
- `POST /api/posts` - Tạo post mới

## Features

- Hiển thị danh sách users
- Hiển thị danh sách posts
- Tạo post mới
- Kết nối Frontend và Backend
- Sử dụng MySQL database

## CI/CD
```
# name: # workflow name
# on: # event to run (trigger)
# env: # Environment variable (optional)
# permissions: # GitHub Token permission (optional)
# # actions: read | write | none
# # checks: read | write | none
# # contents: read | write | none
# # deployments: read | write | none
# # id-token: write | none
# # issues: read | write | none
# # discussions: read | write | none
# # packages: read | write | none
# # pages: read | write | none
# # pull-requests: read | write | none
# # repository-projects: read | write | none
# # security-events: read | write | none
# # statuses: read | write | none
# # workflows: read | write | none
# jobs: # Job list
#  build: (hệ điều hành github hỗ trợ)
#   runs-on: ubuntu-latest | windows-latest | macos-latest
#  needs: chờ job trước chạy xong cái job sau mới chạy
#  steps:
#   run: lệnh CLI
#   uses: dùng một action có sẵn trên marketplace
#   with: truyền input
#   env: khai báo biến
# Truy cập biến:
#   github: lấy thông tin của repo, actor, ref, sha, ...
#   vars: lấy nội dung variable khai báo trong setting repo
#   secrets: lấy nội dung secret khai báo trong setting repo
#   steps: output từ trong step đó
#   needs: output từ các jobs phía trước
```