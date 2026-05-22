FROM node:18-alpine

WORKDIR /app

# Coppy files package.json va package-lock.json (hoac yarn.lock)
COPY package*.json yarn.lock* ./

# Install dependencies
RUN npm install

# Copy toan bo code backend
COPY . .

# Copy script docker-entrypoint va phan quyen
COPY docker-entrypoint.sh /usr/local/bin/
RUN apk add --no-cache dos2unix && dos2unix /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
