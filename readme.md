# Guess The Country Multiplayer

Guess The Country is a web-based game where players try to guess the names of countries based on hitns provided. The game utilizes socket.io for real-time communication between players.

# Deployment

The project is hosted on Vercel at https://guessthecountry.vercel.app/.

## Features

- Multiplayer gameplay using socket.io
- Room System
- Global and Room specific Real-time chat
- Single-player mode

## Technologies Used

- React.js for the frontend
- Node.js and Express.js for the backend
- Socket.io for real-time communication
- Mongodb for the database
- Tailwind CSS for styling

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Mohamed-Kacem-Dev/guess-the-country-multiplayer.git
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   cd guess-the-country-multiplayer/frontend
   npm install

   cd ../backend
   npm install
   ```

3. Install dependencies for both frontend and backend:

   ```bash
   # Start frontend server
   cd ../frontend
   npm start

   # Start backend server
   cd ../backend
   npm start
   ```

4. create a .env file in the frontend directory

   ```bash
   REACT_APP_SOCKET_URL=<PUT THE BACKEND LINL HERE>
   ```

5. Open http://localhost:3000 in your web browser.

## Contact

For any inquiries or questions regarding this project, feel free to contact me at ham.kacem15@gmail.com.
