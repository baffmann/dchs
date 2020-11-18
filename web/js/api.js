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
    })
};

function updateSettings(gamesettings) {
    return $.ajax({
        type: "POST",
        url: "/api/updateSettings",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(gamesettings),
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
        contentType: "application/json; charset=utf-8",
        dataType: "json",
    })
};

function quitGame() {
    $.ajax({
        type: "POST",
        url: "/api/quitGame",
    })
};

