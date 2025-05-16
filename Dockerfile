# Use the official Node.js image as the base image
FROM node:21-alpine

# Set the working directory inside the container
WORKDIR /usr/src/nest

RUN npm i -g @nestjs/cli

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Ensure necessary scripts have execution permissions
RUN chmod +x /usr/src/nest/scripts/start-dev.sh
RUN chmod +x /usr/src/nest/scripts/wait-for-it.sh

# Expose the application port
EXPOSE 3001

# Define ENTRYPOINT to wait for MySQL before starting the app
ENTRYPOINT ["/usr/src/nest/scripts/wait-for-it.sh", "nest_boilerplate_mysql", "3306", "--"]

# Command to run the application
CMD ["/usr/src/nest/scripts/start-dev.sh"]