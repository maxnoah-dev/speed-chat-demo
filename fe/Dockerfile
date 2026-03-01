FROM node:20 as build-react

WORKDIR /fe

# Tránh OOM khi cài dependency / build
ENV NODE_OPTIONS=--max-old-space-size=4096

COPY package.json yarn.lock ./
RUN yarn config set network-timeout 3000000
# Retry 1 lần nếu lỗi mạng
RUN yarn install || (sleep 15 && yarn install)
COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN yarn build

FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=build-react /fe/build /usr/share/nginx/html
EXPOSE 80