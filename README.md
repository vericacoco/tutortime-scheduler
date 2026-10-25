# TutorTime

TutorTime is a simple scheduling application for private lessons.

A tutor can publish available lesson slots, and students can book
an available time using their name and email.

## Links

- Live App: https://tutortime-scheduler-2uiwylcvd-verica.vercel.app
- GitHub Repository: https://github.com/USERNAME/teamlift-tutortime

## Features

- Create lesson availability with date, start time, and duration
- View available lesson slots
- Book a lesson using name and email
- Prevent double bookings
- Prevent overlapping tutor availability
- Persistent PostgreSQL database
- Gemini-generated booking confirmation
- Google Calendar integration for detecting scheduling conflicts
- Responsive React interface

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- TypeScript

### Database
- PostgreSQL
- Supabase

### Integrations
- Google Gemini API
- Google Calendar API

## How it works

The React frontend communicates with an Express REST API.

The backend is responsible for:
- creating available slots
- retrieving availability
- booking slots
- preventing overlapping and double bookings
- querying Google Calendar availability
- generating confirmation messages with Gemini

The PostgreSQL database stores the scheduling data.

## API

- GET /api/slots
- POST /api/slots
- POST /api/slots/:id/book
- POST /api/ai/confirmation
- GET /api/auth/google
- GET /api/auth/google/callback

## AI tools used

I used ChatGPT and Cursor during development.

I used them for:
- planning the application architecture
- generating initial boilerplate
- debugging API and TypeScript issues
- reviewing booking and overlap logic
- improving the UI

I reviewed and understood the generated code and made the final
implementation decisions.

Gemini is also integrated into the application itself to generate a
short friendly message after a successful booking.

## Running locally

### Backend

cd server
npm install

Create a `.env` file using `.env.example`.

Then run:

npm run dev

The backend runs on:

http://localhost:3001

### Frontend

cd client
npm install
npm run dev

The frontend runs on:

http://localhost:5173

## What I would improve with more time

- Host authentication
- Email booking confirmations
- Cancellation and rescheduling
- Recurring availability
- Multiple tutors
- Better timezone support
- Calendar connection management instead of a single configured host calendar
- Automated tests for API and booking concurrency
