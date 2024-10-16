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

# Build the app
RUN npm run build

# Stage 2: Serve app with nginx
FROM nginx:stable-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy built assets from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration template
COPY nginx.conf /etc/nginx/conf.d/nginx.conf.template

# Expose port (for documentation purposes only)
EXPOSE 8080

# Start nginx with envsubst to substitute the environment variables
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
