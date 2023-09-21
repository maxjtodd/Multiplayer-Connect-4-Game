// Max Todd
// 3/20/23

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname));

// Send game file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Keep track of two players
var users = [null, null]

io.on('connection', (socket) => {

    // Make sure that two users are connected

    let id = -1;

    // Get the player ID
    for (const i in users) {
        if (users[i] === null) {
            id = i;
            break;
        }
    }

    // Set the player id
    socket.emit('id', id);
    console.log('User %d Connected', id);

    // Ignore any more connections
    if (id === -1) {return;}

    // Add connection to the users
    users[id] = true;

    // Tell other sockets that another connection has been established with the given id
    socket.broadcast.emit('playerConnected', id)

    var twoPlayersConnected = false
    if (users[0] && users[1]) {
        twoPlayersConnected = true
        console.log("Both players connected.");
        socket.broadcast.emit('bothConnected', twoPlayersConnected);
        socket.emit('bothConnected', twoPlayersConnected);
    }

    // Turn played, recive and send board to other player
    socket.on('turn', board => {
        console.log("TURN");
        socket.broadcast.emit('turn', board);
    })

    // Turn played, recieve and send currentPlayer to other player
    socket.on('currentPlayer', currentPlayer => {
        socket.broadcast.emit('currentPlayer', currentPlayer);
    })

    // Turn played, recieve and send bottomPieces to other player
    socket.on('bottomPieces', bottomPieces => {
        socket.broadcast.emit('bottomPieces', bottomPieces);
    });

    // Player won, recieve and send win information to other player
    socket.on('win', player => {
        socket.broadcast.emit('win', player)
    });

});


// Run on port 3000
server.listen(3000, () => {
  console.log('listening on *:3000');
});