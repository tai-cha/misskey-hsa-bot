# Use the official Bun image
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# Install dependencies into a temp directory to cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install production dependencies (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from temp directory, then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules ./node_modules
COPY . .

# Build the project
ENV NODE_ENV=production
RUN bun run build --target=bun

# Final stage to minimize the final image size
FROM base AS release
WORKDIR /usr/src/app
COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY package.json .

# Run the app
USER bun
CMD ["bun", "run", "dist/index.js"]