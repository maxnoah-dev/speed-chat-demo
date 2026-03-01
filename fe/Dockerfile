FROM node:20 as build-react

WORKDIR /fe

COPY package.json .

RUN yarn config set network-timeout 3000000

RUN yarn install

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN yarn build

FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=build-react /fe/build /usr/share/nginx/html
EXPOSE 80