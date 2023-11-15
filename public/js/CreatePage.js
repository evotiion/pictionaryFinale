function createClicked() {
    console.log("createClicked");
    $.ajax({
        url: "/createLobby",
        type: "POST",
        data: {
            lobbyName: $("#lobbyName").val(),
            host: sessionStorage.getItem('sessionID'),
            password: $("#password").val(),
            timer: $("#timer").val(),
            rounds: $("#rounds").val()
        },
        success: function (data) {
            if (!data) {
                alert("ERROR");
            }
            else if (!data.success) {
                alert("Choose another lobby name");
            }
            else if (data.success) {
                alert("You have successfully created a lobby!");
                // Update the lobby list on the join page by triggering a refresh
                //refreshLobbyList();
            }
        },
        dataType: "json"
    });
    return false;
}




$(document).ready(function () {
    console.log("hello world from CreatePage.js");
    console.log(sessionStorage.getItem('username'));
    console.log(sessionStorage.getItem('sessionID'));

    $("#createLobby").click(createClicked);
});