# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any dependencies
RUN npm install

# Bundle the app source
COPY . .

# Build the TypeScript files
RUN npm run build

# Make port 3000 available to the world outside this container
EXPOSE 3001

# Define the command to run your app
CMD [ "npm", "start" ]
