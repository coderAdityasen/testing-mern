FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

ENV PORT=3000
ENV MONGO_URI=mongodb+srv://adityasen:12345@adityasen-cluster.kprjses.mongodb.net/authapp
ENV JWT_SECRET=super_secret_jwt_key_change_in_production_2024
ENV JWT_EXPIRES_IN=7d

EXPOSE 3000

CMD ["node", "src/index.js"]
