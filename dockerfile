# Stage 1: Build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Accept build arguments and set environment variables
ARG NODE_ENV=production
ARG REACT_APP_API_URL

ENV NODE_ENV=$NODE_ENV
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the app
RUN npm run build

# Stage 2: Serve app with Nginx
FROM nginx:stable-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy built assets from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration template
COPY nginx.conf.template /etc/nginx/conf.d/nginx.conf.template

# Set the PORT environment variable (default to 80)
ENV PORT 80

# Expose port (for documentation purposes)
EXPOSE $PORT

# Start Nginx with envsubst to substitute environment variables
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
