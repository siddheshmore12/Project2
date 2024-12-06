# Use Node.js base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend files to the container
COPY . .

# Expose the port your server is running on
EXPOSE 8080

# Command to run the application
CMD ["node", "server.js"]
