# Deploy

Single-compose, self-hosted. Assumes Docker + Docker Compose v2 on the target machine.

## One-time setup

```bash
git clone <repo>
cd overtchat
cp .env.example .env
```

Edit `.env`:

- `BETTER_AUTH_SECRET` — required. Generate with `openssl rand -hex 32`.
- `BETTER_AUTH_URL` — must match the URL the browser hits (scheme + host + port).
  - Local: `http://localhost:4718`
  - Cloudflare tunnel: `https://chat.yourdomain.com`

Then:

```bash
docker compose up -d --build
```

Open the URL. First user signs up → becomes admin. Add more users from `/settings/users`.

## Deploying updates

```bash
git pull
docker compose up -d --build
```

Compose only recreates the container if the image changed. Migrations run automatically on boot. Data in the `overtchat-data` volume persists across rebuilds.

## Cloudflare tunnel

Point the tunnel at `http://localhost:4718` on the host. Set `BETTER_AUTH_URL` in `.env` to the public URL, then `docker compose up -d` to restart the app with the new value. `BETTER_AUTH_URL` must exactly match what the browser sees — mismatches break auth cookies silently.

## Common ops

```bash
# Tail logs
docker compose logs -f app

# Restart just the app
docker compose restart app

# Stop everything
docker compose down

# Backup the DB (safe while running)
docker compose exec app sqlite3 /app/data/chat.db ".backup /app/data/backup.db"
docker compose cp app:/app/data/backup.db ./backup.db

# Nuke everything including data
docker compose down -v

# Rebuild from scratch
docker compose down && docker compose up -d --build --force-recreate
```

## Troubleshooting

- **`curl -I http://localhost:4718` returns `307`** — healthy (redirect to `/login`).
- **Login succeeds, next page redirects back to login** — `BETTER_AUTH_URL` mismatch. Fix in `.env`, then restart.
- **Port already in use** — change `APP_PORT` in `.env`.
- **Schema errors after pull** — you didn't rebuild. `docker compose up -d --build`.
