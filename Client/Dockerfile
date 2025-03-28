FROM node:18.20

WORKDIR /app

RUN npm install -g pnpm@latest-10

RUN pnpm --version && echo "pnpm version displayed above"

ENV VITE_SUPABASE_URL=https://cvnwglrxkkpnboipxtzd.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bndnbHJ4a2twbmJvaXB4dHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMjg5NjAsImV4cCI6MjA1NTkwNDk2MH0.WevJ28A-33psNofAsxGhDBDc63afTPkIU5E7kT5RhP4
ENV VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bndnbHJ4a2twbmJvaXB4dHpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMyODk2MCwiZXhwIjoyMDU1OTA0OTYwfQ.Ual8xTX1vUQsB0sTWTr8cd22PTIYt13VOd6I0p4sRGg

COPY ./pnpm-lock.yaml .
COPY ./package.json .

RUN pnpm install --frozen-lockfile

COPY . .
EXPOSE 5173

CMD ["pnpm", "run", "dev", "--", "--port=5173","--host=0.0.0.0"]
