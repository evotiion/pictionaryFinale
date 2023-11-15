var makesSessionID = (function () {
    //sessionStorage.setItem('createSession', false);
    return function () {
        if (!sessionStorage.getItem('sessionID')) {
            //sessionStorage.setItem('createSession', true);
            sessionStorage.setItem('sessionID', "id" + Math.random().toString(16).slice(2));
        }
    };
})();
makesSessionID();

if (sessionStorage.getItem('username') == null || sessionStorage.getItem('username') == '')
    sessionStorage.setItem('username', 'Anon' + Math.random().toString(16).slice(10));



function usernameUpdated() {
    console.log("usernameUpdated");
    sessionStorage.setItem('username', $("#username").val());
    var userN = $("#username").val();
    if (!$("#username").val().replace(/\s/g, '').length) {
        sessionStorage.setItem('username', 'Anon' + Math.random().toString(16).slice(10));
    }

    $("#username").val(sessionStorage.getItem('username'))
    console.log(sessionStorage.getItem('username'));
    console.log(sessionStorage.getItem('sessionID'));
}

$(document).ready(function () {
    console.log("hello world from HomePage.js");
    $("#username").val(sessionStorage.getItem('username'))
    console.log(sessionStorage.getItem('sessionID'));
});