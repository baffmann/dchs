$(document).ready(function () {
    calcResult();
});

function calcResult() {
    $.when(getPlayers()).done(function (data) {
        allPlayers = data;
        var activePlayers = [];
        var highestTries = 0;
        $.each(data, function (index) {
            //sort active players
            if (data[index].active == true) {
                activePlayers.push(data[index]);
                //needed to calculate amount of rounds played
                // with Math.ceil(highestTries / 3);
                if (data[index].tries > highestTries) {
                    highestTries = data[index].tries;
                }
            }
        });
        activePlayers = activePlayers.sort(resultsSort);

        roundsplayed = Math.ceil(highestTries / 3);
        var bestrnd = 0;
        var bestrndPlayer = 0;
        var bestrndName = 0;
        var bestavg = 0;
        var bestavgPlayer = "";

        $('#infolist thead').append('<tr>'
        + '<th scope="col">Name</th>'
        + '<th>Average</th>'
        + '<th>Beste Runde</th>'
        + '<th>Geworfene Pfeile</th>'
        + '<th>Anzahl Spiele Gesamt</th>'
        + '<th>100+ Gesamt</th>'
        + '<th>140+ Gesamt</th>'
        + '<th>180+ Gesamt</th>'
        + '<th>Bester Average</th>'
        + '</tr>');


        $.each(activePlayers, function (index) {

            if (activePlayers[index].ranking == 1) {
                $('#winner').html(activePlayers[index].name);
            }

            //check for best average from all finished players (points == 0)
            if (activePlayers[index].avg > bestavg && activePlayers[index].points == 0) {
                bestavg = activePlayers[index].avg;
                bestavgPlayer = activePlayers[index].name;
            }

            for (var i = 0; i < roundsplayed; i++) {
                var roundresult = 0;
                if (activePlayers[index].score[i] != undefined) {
                    for (var j = 0; j < 3; j++){
                        if (activePlayers[index].score[i][j] != undefined) {
                            roundresult += activePlayers[index].score[i][j];
                        } 
                    }
                }

                if (roundresult > bestrnd) {
                    bestrnd = roundresult;
                    bestrndName = activePlayers[index].name;
                }
                if (roundresult > bestrndPlayer) {
                    bestrndPlayer = roundresult;
                }

                //check for 180,140,100
                if (roundresult >= 100 && roundresult < 140){
                    activePlayers[index].stats.onehundred += 1;
                    console.log(activePlayers[index].stats.onehundred);
                } else if (roundresult >= 140 && roundresult < 180){
                    activePlayers[index].stats.onehundredeighty += 1;
                    console.log(activePlayers[index].stats.onehundredeighty);
                } else if (roundresult == 180) {
                    activePlayers[index].stats.onehundredforty += 1;
                    console.log(activePlayers[index].stats.onehundredforty);
                }
            }

            if (activePlayers[index].avg > activePlayers[index].stats.bestavg && activePlayers[index].points == 0) {
                activePlayers[index].stats.bestavg = activePlayers[index].avg;
            }

            activePlayers[index].stats.gamesplayed += 1;

            update(activePlayers[index]);

            createResultTable(activePlayers[index], bestrndPlayer)

            //reset bestroundplayer
            bestrndPlayer = 0;

        });

        $('#bestrnd').html(bestrnd);
        $('#bestrndName').html(bestrndName);
        $('#bestavg').html(bestavg);
        $('#bestavgName').html(bestavgPlayer);
    })
}


function createResultTable(activePlayer, bestroundplayer){
    console.log(activePlayer)
    var playerinfo = '<tr><td>';
    playerinfo += activePlayer.name;
    playerinfo += '</td><td>';
    if (activePlayer.points != 0){
        playerinfo += '(';
        playerinfo += activePlayer.avg;
        playerinfo += ')';
    } else {
        playerinfo += activePlayer.avg;
    }
    playerinfo += '</td><td>';
    playerinfo += bestroundplayer;
    playerinfo += '</td><td>';
    playerinfo += activePlayer.tries;
    playerinfo += '</td><td>';
    playerinfo += activePlayer.stats.gamesplayed;
    playerinfo += '</td><td>';
    playerinfo += activePlayer.stats.onehundred;// --> Beste Runde
    playerinfo += '</td><td>';
    playerinfo += activePlayer.stats.onehundredforty;// --> Beste Runde
    playerinfo += '</td><td>';
    playerinfo += activePlayer.stats.onehundredeighty;// --> Beste Runde
    playerinfo += '</td><td>';
    playerinfo += activePlayer.stats.bestavg;
    playerinfo += '</td></tr>';
    $('#infolist tbody').append(playerinfo);
}

/*
Sorting is in the following order
1. Sort players in respect to ranking (not ranked is 99)
2. Sort players regarding their points left
3. Sort players by number of tries (equal to which player has better average)
4. Sort players by order
*/
function resultsSort(a, b) {
    if (a.ranking < b.ranking) {
        return -1
    }
    if (a.ranking > b.ranking) {
        return 1
    }
    //if ranking is the same (--> multiple players not finished)
    if (a.points < b.points) {
        return -1
    }
    if (a.points > b.points) {
        return 1
    }
    //Players have the same amount of points
    if (a.tries < b.tries) {
        return -1
    }
    if (a.tries > b.tries) {
        return 1
    }
    //Player have same amount of points and tries
    if (a.order < b.order) {
        return -1
    }
    if (a.order > b.order) {
        return 1
    }
    //Basically this can't be reached 
    return 0
}