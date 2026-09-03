# YarnFlow — Yarn & Accessories Store Manager

Readable MERN project with separate `client` and `server` folders.

## Folder structure

```
YarnFlow-MERN/
├── client/                 React + Vite frontend
│   └── src/
│       ├── components/     Reusable UI components
│       ├── api.js          Backend API helper
│       ├── App.jsx         Pages and business flow
│       └── styles.css      Complete responsive styling
└── server/                 Node + Express backend
    └── src/
        ├── models/         MongoDB/Mongoose schemas
        ├── routes/         REST API routes
        ├── utils/          Shared helpers
        └── server.js       Server entry point
```

## Run locally

1. Create a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env` and add your MongoDB URI.
3. Copy `client/.env.example` to `client/.env`.
4. From the root folder run:

```bash
npm install
npm run install:all
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Deploy

- Render root directory: `server`; build `npm install`; start `npm start`.
- Netlify base directory: `client`; build `npm run build`; publish `dist`.
- Set `VITE_API_URL=https://YOUR-RENDER-URL/api` in Netlify.
- Set `MONGODB_URI`, `CLIENT_URL` and `JWT_SECRET` in Render.

## Main features

- Master item Add, Edit, Delete
- Purchase order Add, Edit, Delete and pending balance
- Multi-row inward receipt with unique inward number
- Outward issue subtracts the exact inward balance
- Live stock summary
- Minimum quantity and PO delivery alerts
- Date/category transaction history
- CSV export
- Login and registration using JWT

