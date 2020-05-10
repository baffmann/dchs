function getPlayers() {
    return $.ajax({
        url: "/api/player",
    });
};

function createPlayer(player) {
    return $.ajax({
        type: "POST",
        url: "/api/player",
        data: JSON.stringify(player),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: function (result) {
            alert('Spieler konnte nicht angelegt werden.');
        }
    })
};

function update(player) {
    return $.ajax({
        type: "POST",
        url: "/api/update",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(player),
        //TODO: Check if still necessary
        //disable ASYNC ajax because go needs a tiny amount of time to update the db, so last score is missed before player change
		async: false //DEPRECATED!
    })
};

function stats(player) {
    $.ajax({
        type: "POST",
        url: "/api/stats",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(player)
    })
};

function deleteCall(player) {
    return $.ajax({
        type: "POST",
        url: "/api/delete",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(player),
    })
};

function reset() {
    return $.ajax({
        type: "POST",
        url: "/api/reset",
    })
};

function quitGame() {
    $.ajax({
        type: "POST",
        url: "/api/quitGame",
    })
};

