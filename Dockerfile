# Stage 1: Build the React application
# Use an official Node.js LTS version. Alpine versions are smaller.
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if you use Yarn)
# This step leverages Docker's layer caching. If these files don't change,
# Docker won't re-run subsequent steps like npm install.
COPY package.json ./
COPY package-lock.json ./
# If using yarn, uncomment the following and comment out package-lock.json:
# COPY yarn.lock ./

# Install project dependencies
# 'npm ci' is generally recommended for CI/build environments as it installs
# dependencies exactly as defined in package-lock.json and is faster.
RUN npm ci
# If using yarn, use:
# RUN yarn install --frozen-lockfile

# Copy the rest of the application source code into the container
COPY . .

# Build the React application for production
# Replace 'build' with your actual build script in package.json if it's different (e.g., 'vite build').
# The output is typically in a 'build' or 'dist' folder.
RUN npm run build

# Stage 2: Serve the static files using a lightweight web server (Nginx)
# This stage is for serving the built static assets.
# If you deploy your static assets directly to a service like Supabase Hosting,
# Vercel, Netlify, or an S3 bucket, you might only need the 'builder' stage above
# to produce the assets, and this 'nginx' stage might not be necessary for your deployment.
FROM nginx:1.25-alpine

# Set the working directory for Nginx
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy the build output (static files) from the 'builder' stage
# Adjust '/app/build' if your build script outputs to a different directory (e.g., '/app/dist').
COPY --from=builder /app/build .

# Expose port 80 (default HTTP port Nginx listens on)
EXPOSE 80

# Command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
