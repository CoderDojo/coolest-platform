FROM node:carbon-alpine as builder
RUN apk --no-cache add python build-base
WORKDIR /usr/src/app
COPY yarn.lock package.json ./
RUN yarn
COPY client /usr/src/app/client
RUN yarn build

FROM node:carbon-alpine
RUN apk --no-cache add python build-base
WORKDIR /usr/src/app
ENV NODE_ENV=production
EXPOSE 3000
COPY yarn.lock package.json ./
RUN yarn
RUN npm rebuild bcrypt --build-from-source
COPY --from=builder /usr/src/app/client/dist/ public
COPY server .
CMD ["node", "bin/www"]
