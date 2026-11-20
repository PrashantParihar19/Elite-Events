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
cd server
cp .env.example .env    # then fill in your values
npm install
npm start

### 2. Frontend
cd client
cp .env.example .env    # then fill in your values
npm install
npm run dev

## Screenshots
## Screenshots

### Landing Page
![Landing Page](docs/Screenshots/landing.png)

### Events
![Events](docs/Screenshots/events.png)

### Create Event
![Create Event](docs/Screenshots/create-event.png)

### Organizer Dashboard
![Organizer Dashboard](docs/Screenshots/organizer-dashboard.png)

### Payment (Razorpay Test Mode)
![Payment](docs/Screenshots/payment.png)

### QR Ticket
![QR Ticket](docs/Screenshots/ticket-qr.png)

### Email Confirmation with Ticket
![Email Ticket](docs/Screenshots/email-ticket.png)

## Author
Prashant Parihar