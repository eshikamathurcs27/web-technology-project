# RentNgo

RentNgo is a full-stack vehicle rental project with:

- `frontend/` for the multi-page customer website
- `backend/` for the Express + MongoDB API

## Features

- User registration and login
- Live vehicle listing from MongoDB
- Vehicle details and booking flow
- Booking history and booking cancellation
- Contact form submission
- Shared navbar/footer partials for consistent UI

## Run locally

1. Copy `backend/.env.example` to `backend/.env`
2. Add your MongoDB connection string and JWT secret
3. Install backend dependencies if needed:

```bash
cd backend
npm install
```

4. Start the app:

```bash
npm start
```

5. Open:

```text
http://localhost:5000
```

## Notes

- The Express server now serves the frontend as well, so you only need one server.
- Do not commit real secrets inside `backend/.env`.
