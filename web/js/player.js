$(document).ready(function () {
    $("#startGame").attr("disabled", true);
    $("#zuruecksetzen").attr("disabled", true);
    $("#title").html("Spieler auswählen: ");

    reload();
});

let playerbuttonStart = '<div class="col-lg-2" id="spielerbutton"><button type="button" class="btn btn-primary btn-lg btn-block playerbtn" data-toggle="button" id="';
let playerbuttonID = '" onClick="select(this)"><span class="badge badge-light float-left"></span>';
let playerbuttonEnd = '</button></div>';

function createPlayerButton(id, name) {
    content = playerbuttonStart;
    content += id;
    content += playerbuttonID;
    content += name;
    content += playerbuttonEnd;
    $('#playerlist').append(content);
};

var person = {
    name: '',
    status: '',
    points: '',
};

var gamemode = 501;
var playercount = 0;
var activecount = 0;
var deletemode = 0;
var allPlayers;
var order = 1;

function setDelete() {
    console.log(deletemode);
    if (deletemode === 0) {
        deletemode = 1;
        $('#playerlist :button').css('background-color', 'red');
        $("#title").html("Welcher Spieler soll gelöscht werden?");
    } else {
        $("#title").html("Spieler auswählen: ");
        $('#playerlist :button').css('background-color', '');
        deletemode = 0;
        //$("#deletePlayer").removeClass("active");
    }
}

function reload() {
    playercount = 0;
    $('#playerlist').empty();
    $.when(getPlayers()).done(function (data) {
        allPlayers = data;
        $.each(allPlayers, function (index) {
            createPlayerButton(allPlayers[index].id, allPlayers[index].name);
            playercount += 1;
        });
        checkPlayerCount();
    });
}



function checkPlayerCount() {
    if (playercount >= 24) {
        $("#newPlayer").attr("disabled", true);
    } else {
        $("#newPlayer").attr("disabled", false);
    }
}

$("#myButtons :input").change(function () {
    gamemode = $("input[name='options']:checked").val();
    gamemode = parseInt(gamemode);
    $.each(allPlayers, function (index) {
        allPlayers[index].points = gamemode;
        update(allPlayers[index]);
    })
});

// NEUEN SPIELER ANLEGEN

$("#neuerSpieler").click(function (e) {
    e.preventDefault();
    person.name = $("#spieler-name").val();
    if (person.name.length < 3) {
        alert("Bitte mehr als 3 Zeichen eingeben");
    } else {
        person.status = 'inaktiv';
        person.points = gamemode;
        $.when(createPlayer(person)).done(function (data) {
            reload();
        });
    }
});

// empty value on modal open
$('#spielerModal').on('hidden.bs.modal', function (e) {
    $(this).find("input,textarea,select").val('').end();
});

function select(btn) {
    //find selected player by btn.id
    $.each(allPlayers, function (index) {
        if (allPlayers[index].id == btn.id) {
            player = allPlayers[index];
        }
    })
    //deletebutton is pressed
    //delete player instead of select this one
    if (deletemode === 1) {
        console.log("Lösche Spieler " + btn.id);
        setDelete();
        $.when(deleteCall(player)).done(function (data) {
            reload();
        });
    } else {
        //player gets selected for the game
        if (activecount >= 12) {
            alert("Maximale Spielerzahl erreicht!");
            return;
        }
        $("#startGame").attr("disabled", false);
        $("#zuruecksetzen").attr("disabled", false);

        player.active = true;
        player.order = order;

        $.when(update(player)).done(function (data) {
            $("#" + data.id + " .badge.badge-light").text(data.order);
            $("#" + data.id).attr("disabled", true);
            activecount += 1;
            order += 1;
        });
    }
};


function resetGame() {
    reset();
    //also deactivate players in the frontend otherwise, player is active=true when gamemode (301/501) is changed 
    $.each(allPlayers, function (index) {
        allPlayers[index].active = false;
    });
    //set back frontend
    $("#startGame").attr("disabled", true);
    $("#zuruecksetzen").attr("disabled", true);
    $(".playerbtn .badge.badge-light").text('');
    $(".playerbtn").attr("disabled", false);
    $(".playerbtn").removeClass("active");
};