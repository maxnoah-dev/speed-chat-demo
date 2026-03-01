FROM node:20

WORKDIR /be

# Tránh OOM khi cài dependency / prisma generate
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copy package.json, yarn.lock và prisma/ trước để cài đúng
COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN yarn config set network-timeout 3000000

# Retry 1 lần nếu lỗi mạng khi tải Prisma engine
RUN yarn install || (sleep 15 && yarn install)

# Copy phần còn lại
COPY . .

RUN yarn build

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh 2>/dev/null || true && chmod +x /docker-entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["yarn", "start"]