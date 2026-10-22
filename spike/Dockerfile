# Week-1 spike, W1-9c: the standalone image, for the exit plan (architecture §12.3 option B).
# Build (the catalog page is prerendered from the database, so the build needs the test env):
#   docker build --network host --secret id=spike_env,src=.env.local -t kasoundbox-spike .
# Run:
#   docker run --rm --network host --env-file <env file> kasoundbox-spike
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_OUTPUT=standalone NEXT_TELEMETRY_DISABLED=1
# The env file is mounted only for this step and read by Node's own parser; nothing from it is written into the image.
RUN --mount=type=secret,id=spike_env,required=true node scripts/build-with-env.mjs /run/secrets/spike_env

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
