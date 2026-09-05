FROM node:24-alpine AS build
WORKDIR /app
# The sitemap names the canonical host at build time. Leave the argument unset
# for the long domain; pass the new domain on flip day.
ARG CANONICAL_HOST
ENV CANONICAL_HOST=${CANONICAL_HOST}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV HOST=0.0.0.0
ENV PORT=4310
ARG CANONICAL_HOST
ENV CANONICAL_HOST=${CANONICAL_HOST}
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4310
CMD ["node", "./dist/server/entry.mjs"]
