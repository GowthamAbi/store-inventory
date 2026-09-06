# Accessories Flow — Accessories Store Manager

Readable MERN project with separate `client` and `server` folders.

## SaaS production workflow

- Company + factory tenant isolation with audit fields.
- SaaS Super Admin, Company Admin, Store, Planner, Operator, Supervisor,
  Quality, Maintenance, Sewing Coordinator, Management and View Only roles.
- Vendor, Section, Colour, Size and Sewing Unit masters.
- DC-based plans with multiple colours and sizes.
- Main DC QR + colour QR, machine QR and employee QR production control.
- Complete, breakdown, thread/box/size/other-change time tracking.
- OK, rework, rejection, balance, material pending and sewing hold flows.
- Sewing split delivery, dashboard, combined reports, CSV/PDF/print and trace search.
- DC print keeps the Main DC QR at the top centre and one exact row QR for each
  Outward No. + Inward No. + Colour combination.
- Public QR outward saves company/factory ownership and repairs legacy records
  that previously caused a DC print 404.
- Inward lots retain brand, description, type, colour and unit for traceability.
- Mobile outward completion shows a confirmation popup and next-inward scan entry.
- Item Master supports separate colour variants for the same Item Code.
- Existing and pending PO lines automatically create/update their matching
  Item Code + Colour master variant when the server starts.
- Inward brand, description, type, colour and unit always come from the exact
  PO No. + Item Code (+ Indent No.) line; existing mismatched inward snapshots
  are corrected automatically and colour-wise stock is recalculated.

The first registration creates the initial company, factory and SaaS Super Admin.
Existing single-company data is attached to a default company during startup.

## Folder structure

```
Store/
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

## Elastic Production SaaS extension

- The first registered account is the single company administrator.
- Existing installations automatically promote the oldest account when no admin exists.
- Admin creates separate Store and Production users from User Management.
- All colour outwards sharing one DC No. are combined in the DC generator.
- The DC print/PDF creates one Main DC QR plus one QR for every unique colour.
- Main DC, Colour, Machine and Employee QR scans are retained as one production draft.
- Production runs track colour, size, planned/OK/rework/rejection/balance pieces.
- Machine stops track Complete, Breakdown, Thread, Box, Size and Other changes.
- Section Pending tracks shortage, elastic rejection, production/rework/sewing holds and material requests.
- Sewing Delivery splits available OK pieces by sewing unit and delivery person.

For password-reset email, configure `RESEND_API_KEY`, `EMAIL_FROM`, and deployed
`CLIENT_URL` in Render. Reset links expire after 30 minutes.
