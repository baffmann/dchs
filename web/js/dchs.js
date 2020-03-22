$(document).ready(function () {
    reset();
});

function reset() {
    var resetUrl = "/api/reset"
    $.ajax({
        type: "POST",
        url: resetUrl,
    })
};

function quitGame() {
    var quitUrl = "/api/quitGame"
    $.ajax({
        type: "POST",
        url: quitUrl,
    })
};