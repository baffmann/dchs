$(document).ready(function () {
	$.when(getPlayers()).done(function (data) {
		$.each(data, function (index) {
			if (data[index].active == true) {
				createPlayerList(data[index]);
				playerlist.push(data[index].id);
				playercount += 1;
			}
		});
		gamemode = data[index].points;
		$("#newsticker").html("Newsticker: ");
		next(playerlist[0]);
	});
});

list1 = '<li class="list-group-item d-flex justify-content-between align-items-center" style="padding-left: 5px; padding-right: 5px;"><div class="col-sm-6" id="list-player-name" style="padding-left: 0px;"><strong style="font-size: 1.2em;">';
list2 = '</strong></div><div class="col-lg-1 text-center" style="padding: 0;"><span class="badge badge-primary scorebadge" id="';
list3 = '-score-1">-</span></div><div class="col-lg-1 text-center" style="padding: 0;"><span class="badge badge-primary scorebadge" id="';
list4 = '-score-2">-</span></div><div class="col-lg-1 text-center" style="padding: 0;"><span class="badge badge-primary scorebadge" id="';
list5 = '-score-3">-</span></div><strong style="font-size: 1.2em;"><div class="col-lg-3 text-center" id="';
list6 = '-points" style="padding-right: 0;">';
list7 = '</div></strong></li>';

//generate html for list on the rhs
function createPlayerList(player) {
	console.log(player);
	content = list1;
	content += player.name;
	content += list2;
	content += player.order;
	content += list3;
	content += player.order;
	content += list4;
	content += player.order;
	content += list5;
	content += player.order;
	content += list6;
	content += player.points;
	content += list7;
	$('#scorelist').append(content);
};

var gamemode;
var playercount = 0;
var index = 0;
var playerlist = [];
var double = 1;
var triple = 1;
var round = 0;
var keepPlaying = false;
var ranking = 1;
var shot = 1;
var backupScore = [];

var currentplayer;
var allPlayers;


function doubleActive() {
	if (double === 2) {
		double = 1;
		$("#doublebtn").removeClass("active");
		$('#triplebtn').attr("disabled", false);
		$('.pointbtn').css("background", "");
	} else {
		double = 2;
		$('.pointbtn').css("background", "rgb(105, 184, 3)");
		$('#triplebtn').attr("disabled", true);
	}
}

function tripleActive() {
	if (triple === 3) {
		triple = 1;
		$("#triplebtn").removeClass("active");
		$('#pointbtn[value="25"]').attr("disabled", false);
		$('#doublebtn').attr("disabled", false);
		$('.pointbtn').css("background", "");
	} else {
		triple = 3;
		$('.pointbtn').css("background", "rgb(190, 63, 3)");
		$('#pointbtn[value="25"]').attr("disabled", true);
		$('#doublebtn').attr("disabled", true);
	}
}

function updateList(playerid) {
	console.log("updateList called for playerid: " + playerid);
	$.each(allPlayers, function (index) {
		if (allPlayers[index].id != playerid && allPlayers[index].active == true && allPlayers[index].finished == false) {
			order = allPlayers[index].order;
			score = allPlayers[index].score;
			//score is null in the beginning of a game
			if (score == null) {
				for (var i = 1; i < 4; i++) {
					$("#" + order + "-score-" + i).html("-");
				}
			} else {
				//when next round starts, show results of last round
				//console.log("score is NOT null");
				//console.log("updateList: " + score[round]);
				if (typeof score[round] == 'undefined') {
					//console.log("if undef");
					//check if player threw three darts..must atleast have one score
					for (var i = 0; i < 3; i++) {
						$("#" + order + "-score-" + (i + 1)).html(typeof score[round - 1][i] !== 'undefined' ? score[round - 1][i] : "-")
					}
				} else {
					//console.log("or else...");
					for (var i = 0; i < 3; i++) {
						$("#" + order + "-score-" + (i + 1)).html(score[round][i])
					}
				}

				$("#" + order + "-points").html(allPlayers[index].points);
			}
		}
	})
}

function endGame() {
	//Modal for finished Game
	calcResult();
	$("#finishedGame").modal()
	$.each(allPlayers, function (index) {
		if (allPlayers[index].active == true){
			stats(allPlayers[index]);
		}
	})
	console.log("Now we are done!!");
}

function gameFinished(stillPlaying) {
	if (round == 20 && !keepPlaying) {
		//If it reaches this the second time, player has chosen to play until the end
		//If not, game is finished anyways
		//Therefore setting keepPlaying directly to true makes sense
		keepPlaying = true;
		//Ask player if game should be finished
		$("#manualFinish").modal()
	}

	if (stillPlaying == 0) {
		return true
	}
	if (stillPlaying == 1 && playercount > 1) {
		return true
	}
	return false
}

function next(playerid) {
	$('#backbtn').attr("disabled", true);
	$('#nextBtn').attr("disabled", true);
	var roundtext = "Runde: ";
	//round +1 because game starts with round 0
	roundtext += round + 1;
	$('#roundnumber').html(roundtext);
	console.log("next(playerid): " + playerid);
	var stillPlaying = 0;
	$.when(getPlayers()).done(function (data) {
		allPlayers = data;
		$.each(data, function (index) {
			//check if at least two player are not finished
			if (data[index].active == true && data[index].finished == false) {
				stillPlaying += 1;
			}
			if (allPlayers[index].id == playerid) {
				currentplayer = allPlayers[index];
			}
		});
		//console.log("Stillplaying: " + stillPlaying);
		if (!gameFinished(stillPlaying)) {
			updateList(playerid);
			if (currentplayer.finished == true) {
				//console.log("currentplayer finished");
				index += 1;
				if (index > playercount - 1) {
					index = 0;
					round += 1;
				}
				next(playerlist[index]);
			} else {
				//console.log(currentplayer.name + " ist an der Reihe");
				$("#newsticker").html("Newsticker: " + currentplayer.name + " ist an der Reihe");
				var scores = [];
				var rounds = [];
				if (currentplayer.score == null) {
					rounds.push(scores);
					currentplayer.score = rounds;
				} else if (typeof currentplayer.score[round] == 'undefined') {
					//only add score array if player is in new round
					//array is already defined when delete button was used
					currentplayer.score.push(scores);
				}
				displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg, currentplayer.stats.bestavg);
				$("#spielername").html(currentplayer.name);

				for (var i = 1; i < 4; i++) {
					$("#dart" + i).html("-");
				}
			}

		} else {
			endGame();
		}
	});
}

function calcResult() {
	$.when(getPlayers()).done(function (data) {
		allPlayers = data;
		var activePlayers = [];
		$.each(data, function (index) {
			//sort active players
			if (data[index].active == true) {
				activePlayers.push(data[index]);
			}
		});
		activePlayers = activePlayers.sort(resultsSort);
		ranking = 1;
		$.each(activePlayers, function (index) {
			//append to resultslist table
			$('#resultslist tbody').append('<tr><th scope="row">'
				+ ranking
				+ '</th><td>'
				+ activePlayers[index].name
				+ '</td><td>'
				+ activePlayers[index].tries
				+ '</td><td>'
				+ activePlayers[index].avg
				+ '</td></tr>');

			ranking += 1;
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

function displayPoints(order, points, avg, bestavg) {
	$('#punktzahl').each(function () {
		var $this = $(this);
		jQuery({ Counter: $this.text() }).animate({ Counter: points }, {
			duration: 300,
			easing: 'swing',
			step: function () {
				$this.text(Number.parseInt(this.Counter));
			},
			//bugfix to make sure number is correct
			//https://stackoverflow.com/questions/30095171/jquery-animate-doesnt-finish-animating
			done: function () {
				$this.text(Number.parseInt(this.Counter));
			}
		});
	});
	$('#punktzahl').html(points);
	$("#average").html(avg);
	$("#bestAverage").html(bestavg);
	$("#" + order + "-points").html(points);

	for (var i = 1; i < 4; i++) {
		$("#" + order + "-score-" + i).html("-");
	}

}

//delete last throw of player
function back() {
	//do nothing if start reached
	if (round == 0 && index == 0 && typeof currentplayer.score[round][0] == 'undefined') {
		return;
	}

	if (backupScore[0] != undefined){
		console.log("Restoring points from backup");
		currentplayer.points = backupScore[0].points;
		currentplayer.score[round][0] = backupScore[0].score1;
		currentplayer.score[round][1] = backupScore[0].score2;
		currentplayer.score[round][2] = backupScore[0].score3;
	}

	$('#nextBtn').attr("disabled", true)
	$('.pointbtn').attr("disabled", false);
	$('#zerobtn').attr("disabled", false);
	$('#doublebtn').attr("disabled", false);
	$('#triplebtn').attr("disabled", false);

	if (typeof currentplayer.score[round][2] != 'undefined') {
		currentplayer.points += currentplayer.score[round][2];
		currentplayer.score[round][2] = undefined;
		currentplayer.tries -= 1;
		currentplayer.avg = calcAvg();
		$("#dart3").html("-");
		displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg, currentplayer.stats.bestavg);
	} else if (typeof currentplayer.score[round][1] != 'undefined') {
		currentplayer.points += currentplayer.score[round][1];
		currentplayer.score[round][1] = undefined;
		currentplayer.tries -= 1;
		currentplayer.avg = calcAvg();
		$("#dart2").html("-");
		displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg, currentplayer.stats.bestavg);
	} else if (typeof currentplayer.score[round][0] != 'undefined') {
		$('#backbtn').attr("disabled", true);
		currentplayer.points += currentplayer.score[round][0];
		currentplayer.score[round][0] = undefined;
		currentplayer.tries -= 1;
		currentplayer.avg = calcAvg();
		$("#dart1").html("-");
		displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg, currentplayer.stats.bestavg);
	}

	//I'M SORRY BUT THIS IS BUGGY AS HELL
	/*
	
	else if (typeof currentplayer.score[round][0] == 'undefined') {
		var popped = currentplayer.score.pop();
		console.log(popped);
		console.log(round);
		update(currentplayer);
		index -= 1;
		if (index < 0) {
			index = playercount - 1;
			round -= 1;
		}
		next(playerlist[index]);
	}
	
	*/
}


function points(btn) {
	$('#backbtn').attr("disabled", false);
	console.log("points");
	console.log(currentplayer.score)

	// if double --> double = 2 // triple = 1
	// if triple --> double = 1 // triple = 3
	totalscore = (btn.value * double * triple);
	scoredthree = false;
	backupScore = [];
	var dart = 1;

	//set score for current throw

	if (typeof currentplayer.score[round][0] == 'undefined') {
		currentplayer.score[round][0] = parseInt(totalscore);
		//console.log("first dart");
	} else if (typeof currentplayer.score[round][1] == 'undefined') {
		currentplayer.score[round][1] = parseInt(totalscore);
		//console.log("second dart");
		dart = 2;
	} else if (typeof currentplayer.score[round][2] == 'undefined') {
		currentplayer.score[round][2] = parseInt(totalscore);
		dart = 3;
		scoredthree = true;
		//console.log("third dart");
	} else if (typeof currentplayer.score[round][2] != 'undefined') {
		//do nothing because player is finished
		return;
	}

	currentplayer.points -= totalscore;
	currentplayer.tries += 1;

	//Check if throw was valid
	if ((currentplayer.points > 1) || ((currentplayer.points == 0) && (double == 2))) {

		switch (dart) {
			case 1:
				$("#dart1").html(totalscore);
				$("#newsticker").html("Newsticker: " + currentplayer.name + " wirft " + totalscore + " Punkte mit dem ersten Dart!");
				break;
			case 2:
				$("#dart2").html(totalscore);
				$("#newsticker").html("Newsticker: " + currentplayer.name + " wirft " + totalscore + " Punkte mit dem zweiten Dart!");
				break;
			case 3:
				$("#dart3").html(totalscore);
				$("#newsticker").html("Newsticker: " + currentplayer.name + " wirft " + totalscore + " Punkte mit dem dritten Dart!");
				break;
		}

		//console.log("currentplayer.points:" + currentplayer.points);
		if (currentplayer.points == 0) {
			currentplayer.finished = true;
			scoredthree = true;
			currentplayer.ranking = ranking;
			ranking += 1;
			//Display points because finished players are ignored in updatelist()
			$("#" + currentplayer.order + "-points").html(currentplayer.points);

			for (var i = 1; i < 4; i++) {
				$("#" + currentplayer.order + "-score-" + i).html(currentplayer.score[round][(i - 1)]);
			}

		}

	} else { //if ((person.points - totalscore) <= 1) && double == 1
		// if last click was a mistake, score and points has to be restored from backupScore in back()
		backupScore.push({
			points: currentplayer.points, 
			score1: currentplayer.score[round][0], 
			score2: currentplayer.score[round][1], 
			score3: currentplayer.score[round][2]
		});

		switch (dart) {
			case 1:
				currentplayer.points += currentplayer.score[round][0];
				currentplayer.score[round][0] = 0;
				break;
			case 2:
				currentplayer.points += currentplayer.score[round][0];
				currentplayer.points += currentplayer.score[round][1];
				currentplayer.score[round][0] = 0;
				currentplayer.score[round][1] = 0;
				break;
			case 3:
				currentplayer.points += currentplayer.score[round][0];
				currentplayer.points += currentplayer.score[round][1];
				currentplayer.points += currentplayer.score[round][2];
				currentplayer.score[round][0] = 0;
				currentplayer.score[round][1] = 0;
				currentplayer.score[round][2] = 0;
				break;
		}

		//display throw even if scored too much for better user experience
		switch (dart) {
			case 1:
				console.log("Darts1 - Overthrown: " + totalscore);
				$("#dart1").html(totalscore);
				break;
			case 2:
				console.log("Darts2 - Overthrown: " + totalscore);
				$("#dart2").html(totalscore);
				break;
			case 3:
				console.log("Darts3 - Overthrown: " + totalscore);
				$("#dart3").html(totalscore);
				break;
		}

		$("#newsticker").html("Newsticker: " + currentplayer.name + " wirft " + totalscore + " Punkte! No Score!");
		scoredthree = true;
	}

	currentplayer.avg = calcAvg();
	displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg, currentplayer.stats.bestavg);
	update(currentplayer);

	updateList(currentplayer.order);

	resetMultiplier();

	if (scoredthree || currentplayer.points == 0) {
		$('.pointbtn').attr("disabled", true);
		$('#zerobtn').attr("disabled", true);
		$('#doublebtn').attr("disabled", true);
		$('#triplebtn').attr("disabled", true);
		$('#nextBtn').attr("disabled", false);
	}
}

function nextBtn() {
	console.log("Player finished, Loading next");
	checkShot();
	$('.pointbtn').attr("disabled", false);
	$('#zerobtn').attr("disabled", false);
	$('#doublebtn').attr("disabled", false);
	$('#triplebtn').attr("disabled", false);
	index += 1;
	if (index > playercount - 1) {
		index = 0;
		round += 1;
	}
	next(playerlist[index]);
}

function checkShot() {
	if (shot > 4) {
		return;
	}
	humanRound = round + 1;
	switch (currentplayer.points) {
		case 444:
			$("#shot" + shot).attr("src", "images/greenshot.png");
			$("#shot" + shot).attr("title", currentplayer.name + " hat " + currentplayer.points + " in Runde " + humanRound + " geworfen! Cheers!");
			shot += 1;
			break;
		case 333:
			$("#shot" + shot).attr("src", "images/greenshot.png");
			$("#shot" + shot).attr("title", currentplayer.name + " hat " + currentplayer.points + " in Runde " + humanRound + " geworfen! Cheers!");
			shot += 1;
			break;
		case 222:
			$("#shot" + shot).attr("src", "images/greenshot.png");
			$("#shot" + shot).attr("title", currentplayer.name + " hat " + currentplayer.points + " in Runde " + humanRound + " geworfen! Cheers!");
			shot += 1;
			break;
		case 111:
			$("#shot" + shot).attr("src", "images/greenshot.png");
			$("#shot" + shot).attr("title", currentplayer.name + " hat " + currentplayer.points + " in Runde " + humanRound + " geworfen! Cheers!");
			shot += 1;
			break;
	}
}

function resetMultiplier() {
	double = 1;
	$("#doublebtn").removeClass("active");
	$('#doublebtn').attr("disabled", false);
	triple = 1;
	$("#triplebtn").removeClass("active");
	$('#triplebtn').attr("disabled", false);
	$('#pointbtn[value="25"]').attr("disabled", false);
	$('.pointbtn').css("background", "");
}

function calcAvg() {
	return Math.round(((((gamemode - currentplayer.points) / currentplayer.tries) * 3) + Number.EPSILON) * 100) / 100;
}

function shotNews(title) {
	if (title != "") {
		$("#newsticker").html(title);
	}
}




