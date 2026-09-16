# StepOut

StepOut is a full-stack web application for discovering events and finding people with similar interests.

## Project Description

Users can explore events in their city, filter them by category and date, register for events, save favorites, and communicate with organizers through real-time chats.

Organizers can create and manage their own events and communicate with participants.

Administrators can moderate platform events and ban events with a specified reason.

The application supports three user roles: **user**, **organizer**, and **admin**, each with different permissions and functionality.

**Note:** When opening the application for the first time, loading events may take a little longer because the backend server may need to wake up. Please wait while the events are being loaded.

### Test Accounts

You can create a new account through the registration page or use the following test accounts to explore different roles:

**Admin**

```text
Email: admin@stepout.dev
Password: Admin12345!
```

**Organizer**

```text
Email: lucas.organizer@stepout.dev
Password: Organizer123!
```

**User**

```text
Email: emma.user@stepout.dev
Password: User12345!
```

## Live Preview

Experience the live website: [StepOut Demo](https://nyarachun.github.io/StepOut/)

## Technologies Used

### Frontend

- **React** (v19.2.8) – UI framework
- **TypeScript** (v6.0.2) – Type safety
- **Vite** (v8.2.2) – Build tool
- **React Router** (v7.18.3) – Client-side routing
- **SCSS** (v1.104.0) – Styling
- **Axios** (v1.20.0) – HTTP requests
- **Zod** (v4.6.2) – Data validation
- **Lucide React** (v1.44.0) – Icons
- **Socket.IO Client** (v4.8.1) – Real-time communication

### Backend

- **Node.js** (v20.20.2)
- **NestJS** (v12.0.1) – Backend framework
- **TypeScript** (v6.0.2) – Type safety
- **TypeORM** (v1.1.1) – Database ORM
- **PostgreSQL** – Relational database
- **JWT** (v12.0.1) – Authentication
- **bcrypt** (v6.0.0) – Password hashing
- **Socket.IO** – Real-time communication
- **NestJS WebSockets** (v12.0.1) – WebSocket integration

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/nyarachun/StepOut.git
cd StepOut
```

2. Install dependencies:
```bash
npm install
cd client
npm install
cd ../server
npm install
cd ..
```
3. Configure environment variables:
Create a .env file in the server directory
```bash
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
PORT=300
```

4. Run the project locally:
```bash
npm start
```

## Features

- **Authentication & Authorization:** registration, login, JWT authentication, protected routes, role-based access control.
- **Event Discovery:** browse events and filter them by city, category, and date.
- **Event Registration:** register for events, cancel registrations, and track available places.
- **Favorites:** save and remove favorite events.
- **Event Management:** organizers can create, edit, and delete their own events.
- **Real-Time Chat:** communication using Socket.IO and NestJS WebSockets.
- **Unread Messages:** track unread chat messages and update the chat interface in real time.
- **User Profiles:** edit personal information, interests, and biography.
- **Achievements:** display user achievements.
- **Admin Moderation:** administrators can ban events and provide a moderation reason.
- **Responsive Design:** adaptive layouts for desktop, tablet, and mobile devices.
