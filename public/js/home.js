var easyList = ["sun", "balloon", "orange", "clock", "face", "ghost", "family", "basketball", "bench", "swing", "angel", "dog", "chair", "island", "chimney", "cow", "hippo", "curl", "broom", "candle", "crab", "leaf", "mountains", "girl", "doll", "window", "kitten", "caterpillar", "zigzag", "butterfly"]
var mediumList = ["meteor", "notebook", "hummingbird", "stem", "electrical outlet", "cracker", "cabin", "ladder", "volcano", "coyote", "scar", "gingerbread man", "computer", "mouse", "window", "ironing board", "nun", "blue jeans", "school bus", "chest", "yardstick", "pineapple", "yo-yo", "lap", "trip", "sleep", "poodle", "chain", "ambulance", "toy"]
var hardList = ["drip", "turtleneck", "shrew", "reveal", "yawn", "landlord", "economics", "staple", "atlas", "spare", "chameleon", "swamp", "wheelie", "clamp", "obey", "robe", "parking garage", "tow", "houseboat", "Heinz 57", "engaged", "mirror", "glitter", "edit", "diagonal", "plastic", "dew", "captain", "nanny", "front"]

let easyWord = "";
let mediumWord = "";
let hardWord = "";

let easyListLength = easyList.length;
let mediumListLength = mediumList.length;
let hardListLength = hardList.length;

var roomName = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
let socket = io({
    query: {
        roomName: roomName,
    },
});

socket.emit("playerJoin", roomName, sessionStorage.getItem('username'));

let randomNum;

let holdMessage;
let holdWord;

let currentDifficulty = "";
sessionStorage.setItem('score', 0);

let timer;
let maxTimer;
let currentRound = 0;
let maxRounds;
let pointValue = 1;
let playersDrawn = 0;
let wordChosen = false;

$.ajax({
    url: "/getSettings",
    type: "POST",
    data: { lobbyName: roomName },
    success: function (data) {
        if (data.success) {//is host
            console.log("Get Settings");
            maxRounds = data.maxRounds;
            maxTimer = data.timer;
            timer = maxTimer
            console.log(" maxRounds:" + maxRounds + " maxTimer:" + maxTimer + " timer:" + timer)
        }
        else {
            console.log("Coudn't get info host");
            maxRounds = 3;
            maxTimer = 90;
        }
    },
    dataType: "json"
});

let gameStarted = false;

let guessRight = false;

let drawerYou = false;

const lobby = $('#lobby')[0];
const game = $('#game')[0];
const startButton = $('#start-game')[0];
const drawingCanvas = $('#drawing-canvas')[0];
const chatHistory = $('#chat-history')[0];
const chatInput = $('#chat-input')[0];
const sendButton = $('#send-button')[0];
const easyButton = $('#easy-button')[0];
const mediumButton = $('#medium-button')[0];
const hardButton = $('#hard-button')[0];
const clearButton = $('#clear-button')[0];
const freeButton = $('#free-button')[0];
const lineButton = $('#line-button')[0];
const squareButton = $('#square-button')[0];
const squarefButton = $('#squaref-button')[0];
const circleButton = $('#circle-button')[0];
const circlefButton = $('#circlef-button')[0];
const undoButton = $('#undo-button')[0];

easyButton.addEventListener('click', () => {
    if (wordChosen)
        return;
    if (easyListLength > 0) {
        randomNum = Math.floor((Math.random() * 30));
        while (easyList[randomNum] == null) {
            randomNum = Math.floor((Math.random() * 30));
        }
        currentDifficulty = "easy";
        easyWord = easyList[randomNum];
        socket.emit("word", easyWord, currentDifficulty);
        easyList[randomNum] = null;
        easyListLength--;
        wordChosen = true;
    }
});
mediumButton.addEventListener('click', () => {
    if (wordChosen)
        return;
    if (mediumListLength > 0) {
        randomNum = Math.floor((Math.random() * 30));
        while (mediumList[randomNum] == null) {
            randomNum = Math.floor((Math.random() * 30));
        }
        currentDifficulty = "medium";
        mediumWord = mediumList[randomNum];
        socket.emit("word", mediumWord, currentDifficulty);
        mediumList[randomNum] = null;
        mediumListLength--;
        wordChosen = true;
    }
});
hardButton.addEventListener('click', () => {
    if (wordChosen)
        return;
    if (hardListLength > 0) {
        randomNum = Math.floor((Math.random() * 30));
        while (hardList[randomNum] == null) {
            randomNum = Math.floor((Math.random() * 30));
        }
        currentDifficulty = "hard";
        hardWord = hardList[randomNum];
        socket.emit("word", hardWord, currentDifficulty)
        hardList[randomNum] = null;
        hardListLength--;
        wordChosen = true;
    }
});
var arrayPoints = [];
var arrayLines = [];

clearButton.addEventListener('click', () => {
    if (!drawerYou)
        return;
    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    arrayLines = [];
    socket.emit("draw", { arr1: arrayPoints, arr2: arrayLines });
});

freeButton.addEventListener('click', () => {
    lineMode = "free"
});

lineButton.addEventListener('click', () => {
    lineMode = "line"
    //context.drawImage(gee, 0, 0);

});

squareButton.addEventListener('click', () => {
    lineMode = "square"
});

squarefButton.addEventListener('click', () => {
    lineMode = "squaref"
});

circleButton.addEventListener('click', () => {
    lineMode = "circle"
});

circlefButton.addEventListener('click', () => {
    lineMode = "circlef"
});

undoButton.addEventListener('click', () => {
    arrayLines.splice(-1, 1);
    reDraw();
    socket.emit("draw", { arr1: arrayPoints, arr2: arrayLines });
});

var wordHolder = "";

socket.on("word", (word, difficulty) => {
    currentDifficulty = difficulty;
    wordHolder = word;
    holdWord = word.replace(/\S/g, '?'); // Replace non-space characters with question marks
    console.log(holdWord);

    // Check if the current user is the drawer
    if (drawerYou) {
        $("#displayWord").html(wordHolder);
    } else {
        // If not the drawer, display question marks
        $("#displayWord").html(holdWord);
    }
});

function myFunction1() {
    var sliderNum = $("#rating").val();
    $("#rating2").val(sliderNum);
}
function myFunction2() {
    var inputNum = $("#rating2").val();
    $("#rating").val(inputNum);
}

let isDrawing = false;
let context = drawingCanvas.getContext('2d');

var arrayPoints = [];
var arrayLines = [];

var prev = { x: 0, y: 0 };

let lineMode = "free";
let multiL = false;
let shiftDown = false;
let ctrlDown = false;
let zDown = false;
let cancelLine = false;

startButton.addEventListener('click', () => {
    console.log("startbutton");
    $.ajax({
        url: "/ifCanStart",
        type: "POST",
        data: { lobbyName: roomName, host: sessionStorage.getItem('sessionID') },
        success: function (data) {
            if (data.success) {//is host
                console.log("Yes host go start");
                socket.emit("start Game");
            }
            else {
                console.log("not host");
                alert("Only host can start");
            }
        },
        dataType: "json"
    });

});

$(document).ready(function () {
    $("#chat-input").keydown(function (event) {
        if (event.which === 13) {
            const message = chatInput.value;
            if (chatInput.value != "" && chatInput.value != null) {
                chatInput.value = "";
                if (message == wordHolder && guessRight == false) {
                    socket.emit("chat message", "Got the word!", sessionStorage.getItem('username'));
                    if (currentDifficulty == "easy") {
                        sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(100 * pointValue));
                        socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
                        guessRight = true;
                    }
                    else if (currentDifficulty == "medium") {
                        sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(200 * pointValue));
                        socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
                        guessRight = true;
                    }
                    else if (currentDifficulty == "hard") {
                        sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(300 * pointValue));
                        socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
                        guessRight = true;
                    }
                } else {
                    socket.emit("chat message", message, sessionStorage.getItem('username')); // Send the message to the serve
                    socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
                }
            }
            event.preventDefault();
            return false;
        }
    });
});

sendButton.addEventListener("click", () => {
    const message = chatInput.value;
    if (chatInput.value != "" && chatInput.value != null) {
        chatInput.value = "";
        if (message == wordHolder && guessRight == false) {
            socket.emit("chat message", "Got the word!", sessionStorage.getItem('username'));
            if (currentDifficulty == "easy") {
                sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(100 * pointValue));
                socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
                guessRight = true;
            }
            else if (currentDifficulty == "medium") {
                sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(200 * pointValue));
                socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
                guessRight = true;
            }
            else if (currentDifficulty == "hard") {
                sessionStorage.setItem('score', Number(sessionStorage.getItem('score')) + parseInt(300 * pointValue));
                socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
                guessRight = true;
            }
        } else {
            socket.emit("chat message", message, sessionStorage.getItem('username')); // Send the message to the serve
            socket.emit("send Score", sessionStorage.getItem('username'), sessionStorage.getItem('score'));
        }
    }
});

// Handle receiving and displaying chat messages
socket.on("chat message", (message, username) => {
    holdMessage = message;
    displayMessage(username, message); // Display messages from other users
    $("#leaderboard tr").each(function () {
        if ($(this).find("td:eq(0)").text() == sessionStorage.getItem('username')) {
            $(this).find("td:eq(1)").text(sessionStorage.getItem('score'));
        }
    });

});

function displayMessage(sender, message) {
    var messageElement = $('<div>').text("(" + sessionStorage.getItem('score') + ")" + sender + ': ' + message);
    chatHistory.appendChild(messageElement[0]); // Append message to chat history
}

socket.on("send Score", (username, score) => {
    $("#leaderboard tr").each(function () {
        if ($(this).find("td:eq(0)").text() == username) {
            $(this).find("td:eq(1)").text(score);
        }
    });
});
//SOCKET.IO CODE FOR DRAWING ON CANVAS
let lastX, lastY;

drawingCanvas.addEventListener('mousedown', () => {
    if (!drawerYou)
        return;
    //if (drawerYou) {
    isDrawing = true;
    context.lineCap = "round"
    context.fillStyle = $("#color").val();
    context.lineWidth = $("#rating").val(); // Set line width
    context.strokeStyle = $("#color").val(); // Set stroke style (color)
    arrayPoints = [];
    let thisx = event.clientX - drawingCanvas.offsetLeft + $(document).scrollLeft();
    let thisy = event.clientY - drawingCanvas.offsetTop + $(document).scrollTop();
    arrayPoints.push({ x: thisx, y: thisy, type: lineMode, color: $("#color").val(), stroke: $("#rating").val() });
    prev = { x: thisx, y: thisy };
    //}
});

drawingCanvas.addEventListener('mousemove', () => {
    if (!drawerYou)
        return;
    //if (drawerYou) {
    if (isDrawing) {
        let thisx = event.clientX - drawingCanvas.offsetLeft + $(document).scrollLeft();
        let thisy = event.clientY - drawingCanvas.offsetTop + $(document).scrollTop();
        if (lineMode == "free") {
            freeLine(thisx, thisy);
        }
        else if (lineMode == "line") {
            lineLine(thisx, thisy);
        }
        else if (lineMode == "square" || lineMode == "squaref") {
            squareLine(thisx, thisy);
        }
        else if (lineMode == "circle" || lineMode == "circlef") {
            circleLine(thisx, thisy);
        }

        if (lineMode != "square" || lineMode != "squaref") {
            if (lineMode == "line") {
                if (shiftDown) {
                    if (Math.abs(prev.x - thisx) > Math.abs(prev.y - thisy)) {
                        arrayPoints.push({ x: thisx, y: prev.y, type: lineMode });
                    }
                    else {
                        arrayPoints.push({ x: prev.x, y: thisy, type: lineMode });
                    }
                }
                else {
                    arrayPoints.push({ x: thisx, y: thisy, type: lineMode });
                }
            }
            else {
                arrayPoints.push({ x: thisx, y: thisy, type: lineMode });
            }
        }
        socket.emit("draw", { arr1: arrayPoints, arr2: arrayLines });
    }

    // Emit the drawing data and settings to other players
    //socket.emit("draw", {
    //     fromX: lastX,
    //     fromY: lastY,
    //      toX: currentX,
    //      toY: currentY,
    //      lineWidth: $("#rating").val(), // Send line width
    //       strokeStyle: $("#color").val(), // Send stroke style (color)
    //  });
    //   }
    // }
});

drawingCanvas.addEventListener('mouseup', () => {
    if (!drawerYou)
        return;
    //if (drawerYou) {
    isDrawing = false;
    if (arrayPoints.length < 2) {
        arrayPoints = [];
        reDraw();
        context.closePath();
    }
    else {
        arrayLines.push(arrayPoints);
        reDraw();
        multiL = false;
        context.closePath();
    }
    //}
});

// Handle receiving and displaying drawing data
function freeLine(currX, currY) {
    context.beginPath();
    context.moveTo(prev.x, prev.y);
    context.lineTo(currX, currY);
    context.stroke();
    prev = { x: currX, y: currY };
}

function lineLine(currX, currY) {
    if (multiL) {
        arrayPoints.splice(-1, 1);
        reDraw();
    }
    context.beginPath();
    context.moveTo(prev.x, prev.y);
    if (shiftDown) {
        if (Math.abs(prev.x - currX) > Math.abs(prev.y - currY)) {
            context.lineTo(currX, prev.y);
        }
        else {
            context.lineTo(prev.x, currY);
        }
    }
    else {
        context.lineTo(currX, currY);
    }
    context.stroke();
    multiL = true;
}

function squareLine(currX, currY) {
    if (multiL) {
        arrayPoints = [];
        reDraw();
        arrayPoints.push({ x: prev.x, y: prev.y, type: lineMode, shift: shiftDown, color: $("#color").val(), stroke: $("#rating").val() });
    }
    if (shiftDown) {
        if (Math.abs(prev.x - currX) > Math.abs(prev.y - currY)) {
            if ((currY - prev.y) < 0) {
                if ((currX - prev.x) < 0) {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, currY - Number(prev.y), currY - Number(prev.y));
                }
                else {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, -(currY - Number(prev.y)), currY - Number(prev.y));
                }
            }
            else {
                if ((currX - prev.x) < 0) {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, -(currY - Number(prev.y)), currY - Number(prev.y));
                }
                else {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, currY - Number(prev.y), currY - Number(prev.y));
                }
            }
        }
        else {
            if ((currY - prev.y) < 0) {
                if ((currX - prev.x) < 0) {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, currX - Number(prev.x), currX - Number(prev.x));
                }
                else {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, currX - Number(prev.x), -(currX - Number(prev.x)));
                }
            }
            else {
                if ((currX - prev.x) < 0) {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, currX - Number(prev.x), -(currX - Number(prev.x)));
                }
                else {
                    arrayPoints.push({ x: currX, y: currY, type: lineMode });
                    context.beginPath();
                    context.rect(prev.x, prev.y, currX - Number(prev.x), currX - Number(prev.x));
                }
            }
        }
        console.log(currX + " | " + currY);
        console.log(prev.x + " | " + prev.y);
    }
    else {
        arrayPoints.push({ x: currX, y: currY, type: lineMode });
        context.beginPath();
        context.rect(prev.x, prev.y, currX - Number(prev.x), currY - Number(prev.y));
    }

    if (lineMode == "squaref") {
        context.fill();
    }
    context.stroke();
    multiL = true;
}

function circleLine(currX, currY) {
    if (multiL) {
        arrayPoints = [];
        reDraw();
        arrayPoints.push({ x: prev.x, y: prev.y, type: lineMode, color: $("#color").val(), stroke: $("#rating").val() });
    }
    arrayPoints.push({ x: currX, y: currY, type: lineMode });
    context.beginPath();
    context.arc((prev.x + currX) / 2, (prev.y + currY) / 2, (Math.abs((prev.y + currY) / 2 - currY) + Math.abs((prev.x + currX) / 2 - currX)) / 2, 0, 2 * Math.PI);
    if (lineMode == "circlef") {
        context.fill();
    }
    context.stroke();
    multiL = true;
}

function specRe(currX, currY, prevx, prevy, filler) {
    if (Math.abs(prevx - currX) > Math.abs(prevy - currY)) {
        if ((currY - prevy) < 0) {
            if ((currX - prevx) < 0) {
                context.beginPath();
                context.rect(prevx, prevy, currY - Number(prevy), currY - Number(prevy));
            }
            else {
                context.beginPath();
                context.rect(prevx, prevy, -(currY - Number(prevy)), currY - Number(prevy));
            }
        }
        else {
            if ((currX - prevx) < 0) {
                context.beginPath();
                context.rect(prevx, prev.y, -(currY - Number(prevy)), currY - Number(prevy));
            }
            else {
                context.beginPath();
                context.rect(prevx, prevy, currY - Number(prevy), currY - Number(prevy));
            }
        }
    }
    else {
        if ((currY - prevy) < 0) {
            if ((currX - prevx) < 0) {
                context.beginPath();
                context.rect(prevx, prevy, currX - Number(prevx), currX - Number(prevx));
            }
            else {
                context.beginPath();
                context.rect(prevx, prevy, currX - Number(prevx), -(currX - Number(prevx)));
            }
        }
        else {
            if ((currX - prevx) < 0) {
                context.beginPath();
                context.rect(prevx, prevy, currX - Number(prevx), -(currX - Number(prevx)));
            }
            else {
                context.beginPath();
                context.rect(prevx, prevy, currX - Number(prevx), currX - Number(prevx));
            }
        }
    }

    if (filler) {
        context.fill();
    }

    context.stroke();
}

function reDraw() {
    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    arrayLines.forEach((lines) => {
        context.beginPath();
        console.log(lines[0].color);
        context.fillStyle = lines[0].color;
        context.lineWidth = lines[0].stroke; // Set line width
        context.strokeStyle = lines[0].color; // Set stroke style (color)
        if (lines[0].type == "square") {
            if (lines[0].shift) {
                specRe(lines[1].x, lines[1].y, lines[0].x, lines[0].y, false);
            }
            else {
                context.rect(Number(lines[0].x), Number(lines[0].y), Number(lines[1].x) - Number(lines[0].x), Number(lines[1].y) - Number(lines[0].y));
            }
        }
        else if (lines[0].type == "squaref") {
            if (lines[0].shift) {
                specRe(lines[1].x, lines[1].y, lines[0].x, lines[0].y, true);
            }
            else {
                context.rect(Number(lines[0].x), Number(lines[0].y), Number(lines[1].x) - Number(lines[0].x), Number(lines[1].y) - Number(lines[0].y));
                context.fill();
            }
        }
        else if (lines[0].type == "circle") {
            context.arc((lines[0].x + lines[1].x) / 2, (lines[0].y + lines[1].y) / 2, (Math.abs((lines[0].y + lines[1].y) / 2 - Math.abs(lines[1].y)) + Math.abs((lines[0].x + lines[1].x) / 2 - Math.abs(lines[1].x))) / 2, 0, 2 * Math.PI);
        }
        else if (lines[0].type == "circlef") {
            context.arc((lines[0].x + lines[1].x) / 2, (lines[0].y + lines[1].y) / 2, (Math.abs((lines[0].y + lines[1].y) / 2 - Math.abs(lines[1].y)) + Math.abs((lines[0].x + lines[1].x) / 2 - Math.abs(lines[1].x))) / 2, 0, 2 * Math.PI);
            context.fill();
        }
        else {
            context.moveTo(lines[0].x, lines[0].y);
            for (let i = 1; i < lines.length; i++) {
                context.lineTo(lines[i].x, lines[i].y);

            }
        }
        context.stroke();
    });
}

// Handle receiving and displaying drawing data
socket.on("draw", (data) => {

    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    if (data.arr1 == null) {
    }
    else {
        context.fillStyle = data.arr1[0].color;
        context.lineWidth = data.arr1[0].stroke; // Set line width
        context.strokeStyle = data.arr1[0].color; // Set stroke style (color)
        context.beginPath();
        if (data.arr1[0].type == "square") {
            if (data.arr1[0].shift) {
                specRe(data.arr1[1].x, data.arr1[1].y, data.arr1[0].x, data.arr1[0].y, false);
            }
            else {
                context.rect(Number(data.arr1[0].x), Number(data.arr1[0].y), Number(data.arr1[1].x) - Number(data.arr1[0].x), Number(data.arr1[1].y) - Number(data.arr1[0].y));
            }
        }
        else if (data.arr1[0].type == "squaref") {
            if (data.arr1[0].shift) {
                specRe(data.arr1[1].x, data.arr1[1].y, data.arr1[0].x, data.arr1[0].y, true);
            }
            else {
                context.rect(Number(data.arr1[0].x), Number(data.arr1[0].y), Number(data.arr1[1].x) - Number(data.arr1[0].x), Number(data.arr1[1].y) - Number(data.arr1[0].y));
                context.fill();
            }
        }
        else if (data.arr1[0].type == "circle") {
            context.arc((data.arr1[0].x + data.arr1[1].x) / 2, (data.arr1[0].y + data.arr1[1].y) / 2, (Math.abs((data.arr1[0].y + data.arr1[1].y) / 2 - Math.abs(data.arr1[1].y)) + Math.abs((data.arr1[0].x + data.arr1[1].x) / 2 - Math.abs(data.arr1[1].x))) / 2, 0, 2 * Math.PI);
        }
        else if (data.arr1[0].type == "circlef") {
            context.arc((data.arr1[0].x + data.arr1[1].x) / 2, (data.arr1[0].y + data.arr1[1].y) / 2, (Math.abs((data.arr1[0].y + data.arr1[1].y) / 2 - Math.abs(data.arr1[1].y)) + Math.abs((data.arr1[0].x + data.arr1[1].x) / 2 - Math.abs(data.arr1[1].x))) / 2, 0, 2 * Math.PI);
            context.fill();
        }
        else {
            context.moveTo(data.arr1[0].x, data.arr1[0].y);
            for (let i = 1; i < data.arr1.length; i++) {
                context.lineTo(data.arr1[i].x, data.arr1[i].y);

            }
        }
        context.stroke();
    }
    if (data.arr2 == null) {

    }
    else {
        data.arr2.forEach((lines) => {
            context.fillStyle = lines[0].color;
            context.lineWidth = lines[0].stroke; // Set line width
            context.strokeStyle = lines[0].color; // Set stroke style (color)
            context.beginPath();
            if (lines[0].type == "square") {
                if (lines[0].shift) {
                    specRe(lines[1].x, lines[1].y, lines[0].x, lines[0].y, false);
                }
                else {
                    context.rect(Number(lines[0].x), Number(lines[0].y), Number(lines[1].x) - Number(lines[0].x), Number(lines[1].y) - Number(lines[0].y));
                }
            }
            else if (lines[0].type == "squaref") {
                if (lines[0].shift) {
                    specRe(lines[1].x, lines[1].y, lines[0].x, lines[0].y, true);
                }
                else {
                    context.rect(Number(lines[0].x), Number(lines[0].y), Number(lines[1].x) - Number(lines[0].x), Number(lines[1].y) - Number(lines[0].y));
                    context.fill();
                }
            }
            else if (lines[0].type == "circle") {
                context.arc((lines[0].x + lines[1].x) / 2, (lines[0].y + lines[1].y) / 2, (Math.abs((lines[0].y + lines[1].y) / 2 - Math.abs(lines[1].y)) + Math.abs((lines[0].x + lines[1].x) / 2 - Math.abs(lines[1].x))) / 2, 0, 2 * Math.PI);
            }
            else if (lines[0].type == "circlef") {
                context.arc((lines[0].x + lines[1].x) / 2, (lines[0].y + lines[1].y) / 2, (Math.abs((lines[0].y + lines[1].y) / 2 - Math.abs(lines[1].y)) + Math.abs((lines[0].x + lines[1].x) / 2 - Math.abs(lines[1].x))) / 2, 0, 2 * Math.PI);
                context.fill();
            }
            else {
                context.moveTo(lines[0].x, lines[0].y);
                for (let i = 1; i < lines.length; i++) {
                    context.lineTo(lines[i].x, lines[i].y);

                }
            }
            context.stroke();
        });
    }
});

$(document).ready(function () {
    $(document).keydown(function (event) {
        if (event.which === 16) {
            shiftDown = true;
            event.preventDefault();
            return false;
        }
    });

    $(document).keyup(function (event) {
        if (event.which === 16) {
            shiftDown = false;
            event.preventDefault();
            return false;
        }
    });

    $(document).keydown(function (event) {
        if (event.which === 17) {
            ctrlDown = true;
            if (ctrlDown && zDown) {
                arrayLines.splice(-1, 1);
                reDraw();
            }
            event.preventDefault();
            return false;
        }
    });

    $(document).keyup(function (event) {
        if (event.which === 17) {
            ctrlDown = false;
            event.preventDefault();
            return false;
        }
    });

    $(document).keydown(function (event) {
        if (event.which === 90) {
            zDown = true;
            if (ctrlDown && zDown) {
                arrayLines.splice(-1, 1);
                reDraw();
            }
            event.preventDefault();
            return false;
        }
    });

    $(document).keyup(function (event) {
        if (event.which === 90) {
            zDown = false;
            event.preventDefault();
            return false;
        }
    });

    $(document).mousedown(function (event) {
        if (event.which === 0) {
            event.preventDefault();
            return false;
        }
    });

    $(document).mouseup(function (event) {
        if (event.which === 0) {
            event.preventDefault();
            return false;
        }
    });
});

let holdPlayers = [];
let holdRemove;

socket.on("updatePlayersDisconnect", (player) => {
    const index = holdPlayers.indexOf(player);
    if (index > -1) { // only splice array when item is found
        holdPlayers.splice(index, 1); // 2nd parameter means remove one item only
    }
    console.log(holdPlayers)
    $("#playerCount").empty();
    $("#playerCount").append(("Players: " + holdPlayers + (", ")));
});

socket.on("updatePlayers", (check, players) => {
    holdPlayers = players;
    console.log("Hello from updatePlayers socket code: " + holdPlayers);
    if (check == false) {
        $("#playerCount").empty();
        $("#playerCount").append(("Players: " + holdPlayers + (", ")));
        $("#leaderboard tr").remove();
        for (var i = 0; i < holdPlayers.length; i++) {
            $("#leaderboard").append("<tr><td>" + holdPlayers[i] + "</td><td>" + sessionStorage.getItem('score') + "</td></tr>");
        }


    }
});
polling();

function polling() {
    console.log("polling");
    if (gameStarted) {
        if (pointValue > .5) {
            pointValue -= .01;
        }

        timer--;
        $("#timer").html("Time Left: " + timer);
        console.log(timer);
        if (timer <= 0) {
            console.log("Times Up");
            timeOver();
        }

    }
    let numMilliSeconds = 1000;   // 1000 milliseconds = 1 second
    setTimeout(polling, numMilliSeconds);
}

function timeOver() {
    if (currentRound == maxRounds && playersDrawn == holdPlayers.length) {
        console.log("Game End");
        timer = "0";
        var highestScore = 0;
        var highestName;
        $("#leaderboard tr").each(function () {
            if (Number($(this).find("td:eq(1)").text()) > highestScore) {//$(this).find("td:eq(0)").text()
                highestScore = Number($(this).find("td:eq(1)").text())//$(this).find("td:eq(1)").text(score)
            }
        });
        $("#leaderboard tr").each(function () {
            if (Number($(this).find("td:eq(1)").text()) == highestScore) {
                highestName = $(this).find("td:eq(0)").text();
            }
        });


        socket.emit("Game Over", highestName, highestScore);//winner
        $("#round").html("Round: Game End");//$("#round").html("Round: " + currentRound + "/" + maxRounds);
        $("#timer").html("Time Left: Game End");//$("#timer").html("Time Left: 0");
    }
    else if (playersDrawn < holdPlayers.length) {
        console.log("next player");
        playersDrawn++

        context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);/////////
        arrayLines = [];
        //socket.emit("draw", { arr1: arrayPoints, arr2: arrayLines });

        socket.emit("gameStarts", holdPlayers[playersDrawn - 1]);
        console.log("New Player:Drawer is " + holdPlayers[playersDrawn - 1])

        wordChosen = false;

        guessRight = false
        timer = maxTimer;
    }
    else if (playersDrawn >= holdPlayers.length) {
        console.log("new round");
        guessRight = false
        playersDrawn = 1;

        context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);/////////
        arrayLines = [];
        //socket.emit("draw", { arr1: arrayPoints, arr2: arrayLines });

        socket.emit("gameStarts", holdPlayers[playersDrawn - 1]);
        console.log("New Round:Drawer is " + holdPlayers[playersDrawn - 1])

        wordChosen = false;

        timer = maxTimer;
        currentRound++;
        $("#round").html("Round: " + currentRound + "/" + maxRounds);
    }
}

socket.on("Game Over", (winner, score) => {
    console.log("Game Over")
    alert("Winner is " + winner + " with " + score + " points")

});

socket.on("start Game", () => {
    console.log("Game Start")
    lobby.style.display = 'none';
    game.style.display = 'block';
    gameStarted = true;
    currentRound++;
    playersDrawn++
    socket.emit("gameStarts", holdPlayers[playersDrawn - 1]);
    console.log("gameStarts:Drawer is " + holdPlayers[playersDrawn - 1])
    $("#round").html("Round: " + currentRound + "/" + maxRounds);

});

socket.on("chooser", (drawer) => {
    if (sessionStorage.getItem('username') == drawer) {
        //lobby.style.display = 'none';
        //game.style.display = 'block';
        //$("#chat").prop('disabled', true);

        //$("#rating2").prop('disabled', false);
        //$("#rating").prop('disabled', false);
        //$("#color").prop('disabled', false);

        $("#difficulty-buttons").show();
        $("#rating2").show();
        $("#rating").show();
        $("#color").show();

        $("#clear-button").show();
        $("#free-button").show();
        $("#line-button").show();
        $("#square-button").show();
        $("#squaref-button").show();
        $("#circle-button").show();
        $("#circlef-button").show();
        $("#undo-button").show();
        $("#user-input").hide();

        $("#drawing-canvas").prop('disabled', false);

        drawerYou = true;
    }
    else {
        lobby.style.display = 'none';

        //$("#difficulty-buttons").html("");
        //$("#rating2").prop('disabled', true);
        //$("#rating").prop('disabled', true);
        //$("#color").prop('disabled', true);

        $("#difficulty-buttons").hide();
        $("#rating2").hide();
        $("#rating").hide();
        $("#color").hide();
        $("#user-input").show();

        $("#clear-button").hide();
        $("#free-button").hide();
        $("#line-button").hide();
        $("#square-button").hide();
        $("#squaref-button").hide();
        $("#circle-button").hide();
        $("#circlef-button").hide();
        $("#undo-button").hide();

        //$("#chat").prop('disabled', false);
        $("#drawing-canvas").prop('disabled', true);
        drawerYou = false;
    }
    $("#isDrawer").text("Drawer: " + drawer);
});