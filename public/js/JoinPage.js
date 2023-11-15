function refreshClicked() {
    $.ajax({
        url: "/refresh",
        type: "POST",
        data: {},
        success: function (data) {
            if (!data) {
                alert("ERROR");
            } else {
                // Clear the existing lobby list
                $("#avblLobby").empty();

                // Loop through the lobbies and display them
                for (const lobby of data) {
                    const isFull = false;
                    var newLobby = $('<div>').attr('id', lobby.lobbyName).html(
                        '<label>' + lobby.lobbyName + ' : </label>' + ' Password: ' +
                        '<input type="password" id="password-' + lobby.lobbyName + '">' +
                        '<input type="button" id="connect-' + lobby.lobbyName + '" value="Connect" onclick="joinLobby(\'' + lobby.lobbyName + '\')" ' + (isFull ? 'disabled' : '') + '>'
                    );
                    $("#avblLobby").append(newLobby);
                }
            }
        },
        dataType: "json"
    });
}

const socket = io();

function joinLobby(lobbyName) {
    // When a user clicks the "Connect" button, this function should be called
    // You need to get the password entered by the user and compare it with the lobby's password
    var enteredPassword = $("#password-" + lobbyName).val();
    console.log("Joining lobby: " + lobbyName + " with password: " + enteredPassword);

    $.ajax({
        url: "/joinLobby",
        type: "POST",
        data: { lobbyName: lobbyName, password: enteredPassword, host: sessionStorage.getItem('sessionID') },
        success: function (data) {
            console.log(data); // Log the response
            if (data.success) {
                window.location.href = "/game/" + lobbyName;
                if (data.host) {
                    console.log("You are Host");
                }
            } else {
                if (data.error === 'full') {
                    alert("Lobby is full. Cannot join.");
                } else {
                    alert("Incorrect password or lobby does not exist. Please try again.");
                }
            }
        },
        dataType: "json"
    });
}

$(document).ready(function () {
    console.log("hello world from JoinPage.js");
    console.log(sessionStorage.getItem('username'));
    console.log(sessionStorage.getItem('sessionID'));

    $("#refreshClicked").click(refreshClicked);
});


