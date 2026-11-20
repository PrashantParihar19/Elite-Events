# EliteEvents

A full-stack event management web app built with the MERN stack.

## Features
- User authentication
- Browse and book events
- QR code ticket generation and scanning
- Real-time updates with Socket.io
- Online payments with Razorpay

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js, MongoDB
- **Other:** Socket.io, Razorpay

## Folder Structure
- `client/` – React frontend
- `server/` – Express backend (config, controllers, middleware, models, routes, services, utils)

## Getting Started

### 1. Backend
```bash
cd server
cp .env.example .env    # then fill in your values
npm install
npm start
```

### 2. Frontend
```bash
cd client
cp .env.example .env    # then fill in your values
npm install
npm run dev
```

## Screenshots

### Landing Page
![Landing Page](Docs/Screenshots/landing.jpg)

### Events
![Events](Docs/Screenshots/events.jpg)

### Create Event
![Create Event](Docs/Screenshots/create-event.jpg)

### Organizer Dashboard
![Organizer Dashboard](Docs/Screenshots/organizer-dashboard.jpg)

### Payment (Razorpay Test Mode)
![Payment](Docs/Screenshots/payment.jpg)

### QR Ticket
![QR Ticket](Docs/Screenshots/ticket-qr.png)

### Email Confirmation with Ticket
![Email Ticket](Docs/Screenshots/email-ticket.png)

## Author
Prashant Parihar