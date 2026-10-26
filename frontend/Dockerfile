# Stage 1: build the Angular app into static files
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                           # install exact versions from package-lock.json
COPY . .
RUN npx ng build

# Stage 2: serve the files with nginx (which also forwards /api to the backend)
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
