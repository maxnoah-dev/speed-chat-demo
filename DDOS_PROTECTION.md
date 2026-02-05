# DDoS Protection & Security Implementation

## Các biện pháp chống DDoS đã được triển khai:

### 1. **Nginx Reverse Proxy với Rate Limiting**
   - **Location**: `nginx/nginx.conf`
   - **Rate Limits**:
     - General requests: **100 req/s** per IP
     - API requests: **50 req/s** per IP
     - POST requests: **10 req/s** per IP (kỳ hạn tạo post)
   - **Burst**: Cho phép vài request vượt quá limit rồi mới drop
   - **Headers bảo vệ**:
     - X-Frame-Options: SAMEORIGIN (chặn clickjacking)
     - X-Content-Type-Options: nosniff
     - X-XSS-Protection: 1; mode=block
     - Content-Security-Policy: chặt hơn nếu cần

### 2. **Chặn Suspicious User Agents**
   - Ngăn chặn bot, crawler, spider
   - Chặn request từ curl, wget (tools hacker dùng)

### 3. **Chặn Suspicious Patterns**
   - Ngăn request .php, .asp, .jsp, wp-admin, .env files
   - Chặn request có nhiều slashes `/+`
   - Chặn request methods không hợp lệ
   - Chặn empty User-Agent

### 4. **Express Helmet Middleware**
   - Tự động set security headers
   - Bảo vệ khỏi XSS, Clickjacking, MIME sniffing
   - Tắt X-Powered-By header

### 5. **Request Validation (Joi)**
   - Validate dữ liệu POST
   - Limit độ dài title (3-200 chars)
   - Limit độ dài content (10-5000 chars)
   - Ensure user_id là number dương
   - Từ chối request không hợp lệ ngay tức khắc

### 6. **Request Size Limit**
   - Max body size: **1MB** (chặn request khổng lồ)

### 7. **Connection Timeout**
   - Connection timeout: 30s
   - Send timeout: 30s
   - Read timeout: 30s
   - Tránh connection hangs

### 8. **Buffer Settings**
   - Limit buffer size để tránh memory exhaustion
   - Max temp file size: 2GB

### 9. **Request Logging**
   - Log mỗi request với IP, method, response code, duration
   - Giúp phát hiện patterns tấn công

## Setup & Deploy

### 1. Cài thêm dependencies:
```bash
cd be
npm install
```

### 2. Build & Run:
```bash
# Trên local
docker-compose down
docker-compose build
docker-compose up -d

# Hoặc dùng Jenkins để deploy tự động
```

### 3. Test Rate Limiting:
```bash
# Test general limit (nên fail sau 100 requests)
for i in {1..110}; do curl http://188.166.234.37:3002/api/health; done

# Test POST limit (nên fail sau 10 requests)
for i in {1..15}; do 
  curl -X POST http://188.166.234.37:3002/api/posts \
    -H "Content-Type: application/json" \
    -d '{"user_id":1,"title":"Test","content":"This is a test post"}'
done
```

## Tùy chỉnh Rate Limits

Nếu muốn thay đổi limits, edit `nginx/nginx.conf`:

```nginx
# General limit (dòng 33)
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/s;

# POST limit (dòng 36)
limit_req_zone $binary_remote_addr zone=post_limit:10m rate=10r/s;

# API limit (dòng 39)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=50r/s;
```

**Ý nghĩa**:
- `10m` = 10MB memory zone (lưu tracking data)
- `rate=100r/s` = 100 requests per second

## Monitoring

### Xem request logs:
```bash
docker logs nginx-proxy
docker logs be-nodejs
```

### Xem active connections:
```bash
docker exec nginx-proxy nginx -T
```

## Lưu ý quan trọng

⚠️ **Nếu có issue**:
- Rate limit quá chặt → tăng `max` value
- Backend không phản hồi → check `proxy_connect_timeout`
- Memory tràn → giảm `proxy_max_temp_file_size`

✅ **Các tầng bảo vệ (4 layers)**:
1. **Nginx** - Reverse proxy, rate limiting, request validation
2. **Express Helmet** - Security headers
3. **Joi** - Data validation
4. **Database** - SQL injection protection (prepared statements)

Với cấu hình này, server sẽ chịu được DDoS tốt hơn! 🛡️
