# Stage 1: Build the application
FROM node:20 AS builder
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY ./app .

#Stage 2: Create the final image using Alpine
FROM alpine:latest
# Ensure you install the specific Node.js version you need. Alpine's package repository might not have the latest version.
RUN apk add --no-cache nodejs npm
WORKDIR /app
RUN mkdir uploads
COPY --from=builder /app .

#If you have a build step that outpus to a dist or build folder, make sure to copy that instead
# COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "app.js"] # Make sure to point to your main app file correctly
