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

EXPOSE 3002

CMD ["yarn", "start"]