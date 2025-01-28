# Deployment Guide

## Docker Deployment (Recommended)

If you have Docker installed, follow these simple steps:

1. Configure your environment variables in `docker-compose.yml`.

2. Run the following commands:

```bash
docker compose build
docker compose up
```

## Manual Deployment

If you prefer not to use Docker, follow these steps:

1. Install Node.js from [nodejs.org](https://nodejs.org)

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables by creating a `.env` file from the template of `.env.example`

4. Start the development server:
```bash
npm run dev
```