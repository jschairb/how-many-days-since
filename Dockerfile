FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The unit suite includes the record drift guard: a build with a stale
# rivalry-games.json fails here and never reaches production.
RUN npm test
# The record and team-season pages carry `prerender = true`, so SiteShell reads
# the measurement id during this build, not in the running container. A
# runtime-only variable reaches the server-rendered pages and leaves every
# prerendered page without the tag, which is how the 25 record pages lost it.
ARG GA_MEASUREMENT_ID
ENV GA_MEASUREMENT_ID=$GA_MEASUREMENT_ID
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=4310
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4310
CMD ["node", "./dist/server/entry.mjs"]
