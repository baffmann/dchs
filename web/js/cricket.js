var playerlist = [];
var playercount = 0;
var index = 0;
var numberclosed;
var allPlayers;

$(document).ready(function() {
    $.when(startGame()).done(function(data) {
        $.each(data, function(index) {
            addPlayer(data[index]);
            playerlist.push(data[index].id);
            playercount += 1;
        });
        numberclosed = 3 * playercount;
        console.log(3 * playercount);
        console.log(numberclosed);
        setPlayer(playerlist[index]);
    });
});



var activeplayer;
var fifteen, sixteen, seventeen, eighteen, nineteen, twenty, bull;
fifteen = sixteen = seventeen = eighteen = nineteen = twenty = bull = 0;


function addPlayer(player) {
    $('#crickettable tbody').append('<tr class="d-flex">' +
        '<td class="col-3 cricketname" id="player-' +
        player.id +
        '">' +
        '<img src="" height="50%">' +
        player.name +
        '</td>' +
        '<td class="col-1 text-center" id="15-' +
        player.id +
        '"></td>' +
        '<td class="col-1 text-center" id="16-' +
        player.id +
        '"></td>' +
        '<td class="col-1 text-center" id="17-' +
        player.id +
        '"></td>' +
        '<td class="col-1 text-center" id="18-' +
        player.id +
        '"></td>' +
        '<td class="col-1 text-center" id="19-' +
        player.id +
        '"></td>' +
        '<td class="col-1 text-center" id="20-' +
        player.id +
        '"></td>' +
        '<td class="col-1 text-center" id="25-' +
        player.id +
        '"></td>' +
        '<td class="col-2 text-center cricketname" id="score-' +
        player.id +
        '">' +
        player.cricket.points +
        '</td>' +
        '</tr>');

}

function points(btn) {
    hit = parseInt(btn.value);
    switchImage(hit);
}

function switchImage(points) {
    alt = $("#" + points + "-" + activeplayer.id).children("img").attr("alt");
    console.log(typeof alt);
    if (typeof alt == 'undefined') {
        $("#" + points + "-" + activeplayer.id).append('<img src="images/hit1.png" class="img-fluid" style="width:60px;" alt="one" />');
        countHit(points);
    } else if (alt == "one") {
        $("#" + points + "-" + activeplayer.id).children("img").attr("src", "images/hit2.png");
        $("#" + points + "-" + activeplayer.id).children("img").attr("alt", "two");
        countHit(points);
    } else if (alt == "two") {
        $("#" + points + "-" + activeplayer.id).children("img").attr("src", "images/hit3.png");
        $("#" + points + "-" + activeplayer.id).children("img").attr("alt", "three");
        countHit(points);
        checkFinish();
    } else {
        calcpoints(points);
    }
}

function countHit(hit) {
    activeplayer.cricket.hits++;
    switch (hit) {
        case 15:
            fifteen++;
            break;
        case 16:
            sixteen++;
            break;
        case 17:
            seventeen++;
            break;
        case 18:
            eighteen++;
            break;
        case 19:
            nineteen++;
            break;
        case 20:
            twenty++;
            break;
        case 25:
            bull++;
            break;
    }
    update(activeplayer);
}

function calcpoints(points) {
    console.log("calc", fifteen, numberclosed);
    switch (points) {
        case 15:
            if (fifteen < numberclosed) {
                activeplayer.cricket.points += 15;
            }
            break;
        case 16:
            if (sixteen < numberclosed) {
                activeplayer.cricket.points += 16;
            }
            break;
        case 17:
            if (seventeen < numberclosed) {
                activeplayer.cricket.points += 17;
            }
            break;
        case 18:
            if (eighteen < numberclosed) {
                activeplayer.cricket.points += 18;
            }
            break;
        case 19:
            if (nineteen < numberclosed) {
                activeplayer.cricket.points += 19;
            }
            break;
        case 20:
            if (twenty < numberclosed) {
                activeplayer.cricket.points += 20;
            }
            break;
        case 25:
            if (bull < numberclosed) {
                activeplayer.cricket.points += 25;
            }
            break;
    }
    $("#score-" + activeplayer.id).html(activeplayer.cricket.points)
    update(activeplayer);
    checkFinish()
}

function setPlayer(playerid) {
    $.when(getPlayers()).done(function(data) {
        allPlayers = data;
        $.each(data, function(index) {
            if (allPlayers[index].id == playerid) {
                activeplayer = allPlayers[index];
                $("#player-" + playerid).children("img").attr("src", "images/cricket.png");
                $("#player-" + playerid).css('color', '#3FFF00');
            }
        });
    });
}

function next() {
    index++;
    if (index > playercount - 1) {
        index = 0;
    }
    $("#player-" + activeplayer.id).children("img").attr("src", "");
    $("#player-" + activeplayer.id).css('color', '');
    setPlayer(playerlist[index]);
}

function checkFinish() {
    /*
    a. The player/team that closes all innings first and has the most
    points, shall be declared the winner.
    b. If both sides are tied on points, or have no points, the first
    player/team to close all innings shall be the winner.
    c. If a player/team closes all innings first, and is behind in points,
    he/they must continue to score on any innings not closed until
    either the point deficit is made up, or the opponent has closed
    all innings.
    */
    var gamefinished = false;
    var carryon;
    if (activeplayer.cricket.hits == 21) {
        $.each(allPlayers, function(index) {
            if (allPlayers[index].id != activeplayer.id) {
                if (allPlayers[index].cricket.points > activeplayer.cricket.points) { //if a player has more points than activeplayer
                    carryon = true;
                }
            }
        });
        if (!carryon) {
            gamefinished = true;
            if (activeplayer.cricket.points > activeplayer.stats.bestcricket) {
                activeplayer.stats.bestcricket = activeplayer.cricket.points;
                update(activeplayer);
            }
            $('#winner').html(activeplayer.name + " hat das Spiel mit " + activeplayer.cricket.points + " Punkten gewonnen!");
            $("#cricketFinishModal").modal()
            console.log(activeplayer.name, " wins the game");
        }
    }
}

function endGame() {
    console.log("Now we are done!!");
    window.location = "http://localhost:64760/index.html";
}