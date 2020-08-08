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
                if (data[index].tries > highestTries) {
                    highestTries = data[index].tries;
                }
			}
		});
        activePlayers = activePlayers.sort(resultsSort);
        
        var resultsListHead = '<tr><th scope="col" style="width: 4.76%">Name</th>';
        roundsplayed = Math.ceil(highestTries / 3);
        console.log (roundsplayed + " " + highestTries)

        for (var i = 1; i <= roundsplayed; i++) {
            console.log("adding head")
            resultsListHead += '<th>';
            resultsListHead += i;
            resultsListHead += '</th>';
        }
        resultsListHead += '</tr>';

        $('#resultslist thead').append(resultsListHead);
        
        $('#infolist thead').append('<tr>'
        + '<th scope="col">Name</th>'
        + '<th>Average</th>'
        + '<th>Beste Runde</th>'
        + '<th>Geworfene Pfeile</th>'
        + '<th>Anzahl Spiele Gesamt</th>'
        + '</tr>');

		$.each(activePlayers, function (index) {
            //append to resultslist table
            var playerresult = '<tr><td>';
            playerresult += activePlayers[index].name;
            playerresult += '</td><td>';
            for (var i = 0; i < roundsplayed; i++) {
                if (activePlayers[index].score[i] == undefined){
                    playerresult += '</td>';
                } else {
                    playerresult += activePlayers[index].score[i];
                    playerresult += '</td>';
                }
                if (i != roundsplayed-1){
                    playerresult += '<td>';
                }
            }

            playerresult += '</tr>'

            $('#resultslist tbody').append(playerresult);


            var playerinfo = '<tr><td>';
            playerinfo += activePlayers[index].name;
            playerinfo += '</td><td>';
            playerinfo += activePlayers[index].avg;
            playerinfo += '</td><td>';
            playerinfo += activePlayers[index].stats.bestscore;// --> Beste Runde
            playerinfo += '</td><td>';
            playerinfo += activePlayers[index].tries;
            playerinfo += '</td><td>';
            playerinfo += activePlayers[index].stats.gamesplayed;
            playerinfo += '</td></tr>';
            $('#infolist tbody').append(playerinfo);
            /*playerresult += activePlayers[index].tries;
            playerresult += '</td><td>';
            playerresult += 
            playerresult += '</td></tr>';*/
            
		});
	})
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