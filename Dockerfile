FROM node:carbon as builder
WORKDIR /usr/src/app
COPY yarn.lock package.json ./
RUN yarn
COPY client /usr/src/app/client
RUN yarn build

FROM node:carbon-alpine
#RUN apk --no-cache add
WORKDIR /usr/arc/app
ENV NODE_ENV=production
EXPOSE 3000
COPY yarn.lock package.json ./
RUN yarn
COPY --from=builder /usr/src/app/client/dist/ public
COPY server .
CMD ["node", "bin/www"]
