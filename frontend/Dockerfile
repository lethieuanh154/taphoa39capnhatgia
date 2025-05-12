FROM node:18-alpine

WORKDIR /app

# Copy các file cấu hình cần thiết
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

# Copy toàn bộ source code vào /app
COPY ./src ./src

# Install with special flags to fix the rollup issue
RUN npm install -g @angular/cli --legacy-peer-deps
RUN npm install --legacy-peer-deps
RUN npm install @rollup/rollup-linux-x64-musl --save-optional

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000"]