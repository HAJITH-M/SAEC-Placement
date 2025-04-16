FROM node:18.20

WORKDIR /app

RUN npm install -g pnpm@latest-10

RUN pnpm --version && echo "pnpm version displayed above"

COPY ./pnpm-lock.yaml .

COPY ./package.json .

COPY ./.env .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 4173

CMD ["pnpm", "run", "preview", "--", "--port=4173","--host=0.0.0.0"]