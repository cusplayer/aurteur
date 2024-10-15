# Use an official Node.js image as the base
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# For yarn users
# COPY yarn.lock ./

# Install dependencies
RUN npm install
# or
# RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build
# or
# RUN yarn build

# Stage 2: Serve the app using Nginx
FROM nginx:stable-alpine

# Copy the build output to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
