FROM node:20-alpine

WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm install

# Copy db.json and routes.json into container
COPY db.json routes.json ./

# Ensure json-server is executable
RUN chmod +x node_modules/.bin/json-server

EXPOSE 4001

# Start JSON server
CMD ["npx", "json-server", "--host", "0.0.0.0", "--port", "4001", "--routes", "routes.json", "db.json"]
