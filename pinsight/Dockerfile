# Base image for building the React app
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN rm -rf node_modules && npm ci

# Explicitly add execute permissions to react-scripts binary
RUN chmod +x ./node_modules/.bin/react-scripts

# Copy source code and build the app
COPY . .
RUN npm run build

# Nginx base image for serving the React build
FROM nginx:alpine

# Copy the build folder to Nginx's default folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
