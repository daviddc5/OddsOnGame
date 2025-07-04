// const express = require('express')
// const http = require('http')
// const socketio = require('socket.io')
// const cors = require('cors')

// const app = express()
// const server = http.createServer(app)
// const io = socketIo(server, {
//     // this needs to be changed to the frontend url
//     cors: {
//         origin: 'http://localhost:5173',
//         methods: ['GET', 'POST'],

//     }
// });

// app.use(cors())

// app.get('/', (req, res) => {
//     res.send('Odds on Server is runnningg!!!')
// });

// //Simplified Game State

// let games = {};
// let playersInLobby = [];

// io.on('connection', (socket)) => {
//     console.log('A user connected', socket.id);

// }
