FROM node:20-slim

WORKDIR /app


# Copy toàn bộ source code vào /app
COPY . .
# Install with special flags to fix the rollup issue
RUN rm package-lock.json
RUN rm -rf node_modules
RUN npm cache clean --force
RUN npm install @rollup/rollup-linux-x64-gnu --legacy-peer-deps 
RUN npm install -g @angular/cli --legacy-peer-deps
RUN npm install --legacy-peer-deps

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000"]