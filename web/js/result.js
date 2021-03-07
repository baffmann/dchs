$(document).ready(function() {
    calcResult();
});

function calcResult() {
    $.when(getPlayers()).done(function(data) {
        allPlayers = data;
        //var activePlayers = [];
        var highestTries = 0;
        $.each(data, function(index) {
            //sort active players
            //if (data[index].active == true) {
            //activePlayers.push(data[index]);
            //needed to calculate amount of rounds played
            // with Math.ceil(highestTries / 3);
            if (data[index].tries > highestTries) {
                highestTries = data[index].tries;
            }
            //}
        });
        allPlayers = allPlayers.sort(resultsSort);

        roundsplayed = Math.ceil(highestTries / 3);
        var bestrnd = 0;
        var bestrndPlayer = 0;
        var bestrndName = 0;
        var bestavg = 0;
        var bestavgPlayer = "";

        $('#infolist thead').append('<tr>' +
            '<th scope="col">Name</th>' +
            '<th>Average</th>' +
            '<th>Beste Runde</th>' +
            '<th>Geworfene Pfeile</th>' +
            '<th>Anzahl Spiele Gesamt</th>' +
            '<th>100+ Gesamt</th>' +
            '<th>140+ Gesamt</th>' +
            '<th>180+ Gesamt</th>' +
            '<th>Bester Average</th>' +
            '</tr>');


        $.each(allPlayers, function(index) {

            if (allPlayers[index].ranking == 1) {
                $('#winner').html(allPlayers[index].name);
            }

            //check for best average from all finished players (points == 0)
            if (allPlayers[index].avg > bestavg && allPlayers[index].points == 0) {
                bestavg = allPlayers[index].avg;
                bestavgPlayer = allPlayers[index].name;
            }

            for (var i = 0; i < roundsplayed; i++) {
                var roundresult = 0;
                //catch if player has no score at all // game was interrupted
                if (allPlayers[index].score == null) {
                    bestrndPlayer = 0;
                    break;
                }
                if (allPlayers[index].score[i] != undefined) {
                    for (var j = 0; j < 3; j++) {
                        if (allPlayers[index].score[i][j] != undefined) {
                            roundresult += allPlayers[index].score[i][j];
                        }
                    }
                }

                if (roundresult > bestrnd) {
                    bestrnd = roundresult;
                    bestrndName = allPlayers[index].name;
                }
                if (roundresult > bestrndPlayer) {
                    bestrndPlayer = roundresult;
                }

                //check for 180,140,100
                if (roundresult >= 100 && roundresult < 140) {
                    allPlayers[index].stats.onehundred += 1;
                } else if (roundresult >= 140 && roundresult < 180) {
                    allPlayers[index].stats.onehundred += 1;
                    allPlayers[index].stats.onehundredforty += 1;
                } else if (roundresult == 180) {
                    allPlayers[index].stats.onehundred += 1;
                    allPlayers[index].stats.onehundredforty += 1;
                    allPlayers[index].stats.onehundredeighty += 1;
                }
            }

            if (allPlayers[index].avg > allPlayers[index].stats.bestavg && allPlayers[index].points == 0) {
                allPlayers[index].stats.bestavg = allPlayers[index].avg;
            }

            allPlayers[index].stats.gamesplayed += 1;

            update(allPlayers[index]);

            createResultTable(allPlayers[index], bestrndPlayer)

            //reset bestroundplayer
            bestrndPlayer = 0;

        });

        $('#bestrnd').html(bestrnd);
        $('#bestrndName').html(bestrndName);
        $('#bestavg').html(bestavg);
        $('#bestavgName').html(bestavgPlayer);
    })
}


function createResultTable(player, bestroundplayer) {
    console.log(player)
    var playerinfo = '<tr><td>';
    playerinfo += player.name;
    playerinfo += '</td><td>';
    if (player.points != 0) {
        playerinfo += '(';
        playerinfo += player.avg;
        playerinfo += ')';
    } else {
        playerinfo += player.avg;
    }
    playerinfo += '</td><td>';
    playerinfo += bestroundplayer;
    playerinfo += '</td><td>';
    playerinfo += player.tries;
    playerinfo += '</td><td>';
    playerinfo += player.stats.gamesplayed;
    playerinfo += '</td><td>';
    playerinfo += player.stats.onehundred; // --> Beste Runde
    playerinfo += '</td><td>';
    playerinfo += player.stats.onehundredforty; // --> Beste Runde
    playerinfo += '</td><td>';
    playerinfo += player.stats.onehundredeighty; // --> Beste Runde
    playerinfo += '</td><td>';
    playerinfo += player.stats.bestavg;
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