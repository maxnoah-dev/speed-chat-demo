FROM node:20 as build-react

WORKDIR /fe

COPY package.json yarn.lock ./
RUN yarn config set network-timeout 3000000
# Giới hạn RAM cho Node (VPS ít RAM); bỏ hoặc tăng nếu máy đủ mạnh
ENV NODE_OPTIONS=--max-old-space-size=768
RUN yarn install --network-concurrency 1
COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN yarn build

FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=build-react /fe/build /usr/share/nginx/html
EXPOSE 80