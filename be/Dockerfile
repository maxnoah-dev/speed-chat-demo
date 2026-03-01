FROM node:20

WORKDIR /be


# Copy package.json và prisma/ trước để cài đúng
COPY package.json ./
COPY prisma ./prisma

RUN yarn config set network-timeout 3000000

RUN yarn install

# Copy phần còn lại
COPY . .

RUN yarn build

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3002

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["yarn", "start"]