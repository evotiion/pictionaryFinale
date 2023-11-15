let path = require("path");
let express = require("express");
let router = express.Router();

router.get("/", function (request, response) {
    response.sendFile(__dirname + "/public/views/HomePage.html");
});
router.get("/JoinPage", function (request, response) {//this needs to fix i think??
    response.sendFile(__dirname + "/public/views/JoinPage.html");
});
router.get("/CreatePage", function (request, response) {//this needs to fix i think??
    response.sendFile(__dirname + "/public/views/CreatePage.html");
});

const lobbies = []; // Initialize an array to store lobby information

router.get("/game/:lobbyName", function (request, response) {
    const lobbyName = request.params.lobbyName;
    const lobby = lobbies.find((lobby) => lobby.lobbyName === lobbyName);

    if (lobby) {
        // Check if the request originated from the Join Page
        const referrer = request.get('Referrer'); // Get the referrer header
        if (referrer && referrer.includes("/JoinPage")) {
            response.sendFile(__dirname + "/public/views/index.html");
        } else {
            response.status(403).send("Unauthorized access. Please join from the Join Page.");
        }
    } else {
        response.status(404).send("Lobby not found");
    }
});

router.post('/createLobby', function (req, res) {
    if (req.body.lobbyName == "" || req.body.password == "" || req.body.timer <= 0 || req.body.rounds <= 0) {
        res.json(null);
    } else {
        var notSameName = true;
        for (var i = 0; i < lobbies.length; i++) {
            if (lobbies[i].lobbyName == req.body.lobbyName)
                notSameName = false;
        }
        // Store lobby information in the 'lobbies' array
        if (notSameName) {
            lobbies.push({
                lobbyName: req.body.lobbyName,
                host: req.body.host,
                password: req.body.password,
                timer: req.body.timer,
                rounds: req.body.rounds,
                players: 0 // Initialize player count to 0
            });
        }

        console.log(lobbies);
        res.json({ success: notSameName });
    }
});

router.post('/joinLobby', function (req, res) {
    const lobbyName = req.body.lobbyName;
    const enteredPassword = req.body.password;
    const hostID = req.body.host
    const lobby = lobbies.find(function (lobby) {
        return lobby.lobbyName === lobbyName;
    });

    if (lobby) {
        if (lobby.password === enteredPassword) {
            lobby.players++; // Increment player count
            if (lobby.host === hostID)
                res.json({ success: true, host: true });
            res.json({ success: true, host: false });
        } else {
            res.json({ success: false });
        }
    } else {
        res.json({ success: false });
    }
});

router.post('/ifCanStart', function (req, res) {
    const lobbyName = req.body.lobbyName;
    const hostID = req.body.host
    const lobby = lobbies.find(function (lobby) {
        return lobby.lobbyName === lobbyName;
    });
    console.log(lobby)
    if (lobby) {
        if (lobby.host === hostID) {
            res.json({ success: true });

        }
        else {
            res.json({ success: false });
        }
    } else {
        res.json({ success: false });
    }
});
router.post('/getSettings', function (req, res) {
    const lobbyName = req.body.lobbyName;
    const lobby = lobbies.find(function (lobby) {
        return lobby.lobbyName === lobbyName;
    });
    console.log(lobby)
    if (lobby) {
        console.log(lobby.timer + "   " + lobby.rounds)
        res.json({ success: true, timer: lobby.timer, maxRounds: lobby.rounds });
    }
    else {
        res.json({ success: false });
    }
});


router.post('/refresh', function (req, res) {
    res.json(lobbies);
});

module.exports = router; 