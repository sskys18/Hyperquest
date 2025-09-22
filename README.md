# Hyperquest Monorepo

This repo contains:

- `backend`: Express.js API server
- `contracts`: Hardhat Solidity project
- `frontend`: React app (Vite)

## Getting started

Install dependencies per package and run the dev servers.

### Backend

```
cd backend
npm install
npm run dev
```

### Contracts

```
cd contracts
npm install
npm run compile
npm run test
```

Deploy example contract (set RPC/keys in `.env`):

```
npm run deploy
```

### Frontend

```
cd frontend
npm install
npm run dev
```

