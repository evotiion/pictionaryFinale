const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);
let io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(routes);

let lobbyPlayers = {};

io.on("connection", (socket) => {
    console.log(socket.id + " connected");

    var query = socket.handshake.query;
    var roomName = query.roomName;
    socket.join(roomName);
    console.log(roomName);
    var check = false;
    var holdName;

    // Handle incoming player joins and displays
    socket.on("playerJoin", (lobbyName, playerName) => {
        console.log("JOINING");
        // Store the player in the lobby
        if (!lobbyPlayers[lobbyName]) {
            lobbyPlayers[lobbyName] = [];
        }
        lobbyPlayers[lobbyName].push(playerName);
        holdName = playerName;
        console.log("IN LOBBY: " + lobbyName +
            " Here are the current players in the lobby: " + lobbyPlayers[lobbyName]);

        // Broadcast the updated player list to all clients in the lobby
        io.to(lobbyName).emit("updatePlayers", check, lobbyPlayers[lobbyName]);
    });

    socket.on("gameStarts", (drawer) => {
        currDrawer = drawer;
        io.to(roomName).emit("chooser", drawer); // Broadcast the message to all connected clients
    });

    // Handle incoming chat messages
    socket.on("chat message", (message, username) => {
        io.to(roomName).emit("chat message", message, username); // Broadcast the message to all connected clients
    });

    // Handle incoming chat messages
    socket.on("sendScore", (username, score) => {
        console.log(username + score);

        io.to(roomName).emit("sendScore", username, score);
    });


    // Handle drawing data
    socket.on("draw", (data) => {
        io.to(roomName).emit("draw", data); // Broadcast the drawing data to all connected clients
    });

    socket.on("Game Over", (winner, score) => {
        io.to(roomName).emit("Game Over", winner, score); // Broadcast the drawing data to all connected clients
    });

    //displays the word
    socket.on("word", (data, difficulty) => {
        console.log(data.length);
        console.log("_".repeat(data.length));
        console.log(data);
        io.to(roomName).emit("word", data, difficulty); // Broadcast the word data to all connected clients
    });

    socket.on("send Score", (username, score) => {
        console.log(username + score);

        io.to(roomName).emit("send Score", username, score);
    });

    socket.on("start Game", () => {
        console.log("Game Start Sockets");

        io.to(roomName).emit("start Game");
    });


    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");

        // Get the lobby name for the disconnected player
        let lobbyName;
        for (const name in lobbyPlayers) {
            if (lobbyPlayers[name].includes(holdName)) {
                lobbyName = name;
                break;
            }
        }

        // Remove the disconnected player from the lobbyPlayers object
        if (lobbyName) {
            const index = lobbyPlayers[lobbyName].indexOf(holdName);
            if (index > -1) {
                lobbyPlayers[lobbyName].splice(index, 1);
            }

            // Broadcast the updated player list to all clients in the lobby
            io.to(lobbyName).emit("updatePlayers", check, lobbyPlayers[lobbyName]);
        }

        socket.leave(lobbyName);
    });
});

app.use('/js', express.static('./public/js'));

const port = process.env.PORT || 3001;
server.listen(port);