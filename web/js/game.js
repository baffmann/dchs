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

list1 = '<li class="list-group-item d-flex justify-content-between align-items-center" style="padding-left: 5px; padding-right: 5px;"><div class="col-sm-6" id="list-player-name" style="padding-left: 0px;">';
list2 = '</div><div class="col-lg-1 text-center" style="padding: 0;"><span class="badge badge-primary" id="';
list3 = '-score-1">-</span></div><div class="col-lg-1 text-center" style="padding: 0;"><span class="badge badge-primary" id="';
list4 = '-score-2">-</span></div><div class="col-lg-1 text-center" style="padding: 0;"><span class="badge badge-primary" id="';
list5 = '-score-3">-</span></div><strong><div class="col-lg-3 text-center" id="';
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

var currentplayer;
var allPlayers;


function doubleActive() {
        if (double === 2) {
                double = 1;
                $("#doublebtn").removeClass("active");
                $('#triplebtn').attr("disabled", false);
        } else {
                double = 2;
                $('#triplebtn').attr("disabled", true);
        }
}

function tripleActive() {
        if (triple === 3) {
                triple = 1;
                $("#triplebtn").removeClass("active");
                $('#pointbtn[value="25"]').attr("disabled", false);
                $('#doublebtn').attr("disabled", false);
        } else {
                triple = 3;
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
                                //console.log("score is null");
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
                                                $("#" + order + "-score-" + (i+1)).html(typeof score[round-1][i] !== 'undefined' ? score[round-1][i] : "-")
                                        }
                                } else {
                                        //console.log("or else...");
                                        for (var i = 0; i < 3; i++) {
                                                $("#" + order + "-score-" + (i+1)).html(score[round][i])
                                        }
                                }

                                $("#" + order + "-points").html(allPlayers[index].points);
                        }
                }
        })
}

function gameFinished(stillPlaying) {
        if (stillPlaying == 0) {
                return true
        }
        if (stillPlaying == 1 && playercount > 1) {
                return true
        }
        return false
}

function getPlayers() {
        return $.ajax({
                url: "/api/player",
        });
};

function sendUpdate(){
        var postUrl = "/api/update";
        $.ajax({
                type: "POST",
                url: postUrl,
                data: JSON.stringify(currentplayer),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                //disable ASYNC ajax because go needs a tiny amount of time to update the db, so last score is missed before player change
                async: false //DEPRECATED!

        })
}


function next(playerid) {
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
                        $("#backbtn").show();
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
                                } else if (typeof currentplayer.score[round] == 'undefined'){ 
                                        //only add score array if player is in new round
                                        //array is already defined when delete button was used
                                        currentplayer.score.push(scores);
                                }
                                displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg);
                                $("#spielername").html(currentplayer.name);

                                for (var i = 1; i < 4; i++) {
                                        $("#dart"+i).html("-");
                                }
                        }

                } else {
                        console.log("Now we are done!!");

                }
        });
}

function displayPoints(order, points, avg) {
        console.log("displayPoints");
        //console.log("order: " + order);
        //console.log("points: " + points);
        //console.log("avg:" + avg);
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
        $("#" + order + "-points").html(points);

        for (var i = 1; i < 4; i++) {
                $("#" + order + "-score-" + i).html("-");
        }

}


function oopsImadeAmistake() {
        console.log("ooooooooooooooooopz");
        //do nothing if start reached
        if (round == 0 && index == 0 && typeof currentplayer.score[round][0] == 'undefined'){
                return;
        }
        if (typeof currentplayer.score[round][2] != 'undefined') {
                currentplayer.points += currentplayer.score[round][2];
                currentplayer.score[round][2] = undefined;
                currentplayer.tries -= 1;
                currentplayer.avg = calcAvg();
                $("#dart3").html("-");
                displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg);
        } else if (typeof currentplayer.score[round][1] != 'undefined') {
                currentplayer.points += currentplayer.score[round][1];
                currentplayer.score[round][1] = undefined;
                currentplayer.tries -= 1;
                currentplayer.avg = calcAvg();
                $("#dart2").html("-");
                displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg);
        } else if (typeof currentplayer.score[round][0] != 'undefined') {
                currentplayer.points += currentplayer.score[round][0];
                currentplayer.score[round][0] = undefined;
                currentplayer.tries -= 1;
                currentplayer.avg = calcAvg();
                $("#dart1").html("-");
                displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg);
        } else if (typeof currentplayer.score[round][0] == 'undefined') {
                var popped = currentplayer.score.pop();
                console.log(popped);
                console.log(round);
                sendUpdate();
                index -= 1;
                if (index < 0) {
                        index = playercount - 1;
                        round -= 1;
                }
                next(playerlist[index]);
        }
}


function points(btn) {
        console.log("points");
        console.log(currentplayer.score)

        // if double --> double = 2 // Triple
        totalscore = (btn.value * double * triple);
        scoredthree = false;
        var dart = 1;

        //console.log("Round: " + round);
        /*
        for (var i = 0; i < 3; i++) {
                console.log(i+":" + currentplayer.score[round][i] + " " + typeof currentplayer.score[round][i]);
        }
        */
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
        }

        currentplayer.points -= totalscore;

        //Check if throw was valid
        if ((currentplayer.points > 1) || ((currentplayer.points == 0) && (double == 2))) {
                currentplayer.tries += 1;


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
                        //Display points because finished players are ignored in updatelist()
                        $("#" + currentplayer.order + "-points").html(currentplayer.points);

                        for (var i = 1; i < 4; i++) {
                                $("#" + currentplayer.order + "-score-" + i).html(currentplayer.score[round][(i-1)]);
                        }

                        //$("#" + currentplayer.order + "-score-2").html(currentplayer.score[round][1]);
                        //$("#" + currentplayer.order + "-score-3").html(currentplayer.score[round][2]);

                }

        } else { //if ((person.points - totalscore) <= 1) && double == 1
                for (var i = 0; i < 3; i++) {
                        $("#" + currentplayer.order + "-score-" + i).html(currentplayer.score[round][(i-1)]);
                        console.log("else:"+i+": " + currentplayer.score[round][i] + " " + typeof currentplayer.score[round][i]);
                }

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

                //hacky hack....TODO: Check if necessary
                currentplayer.points = parseInt(currentplayer.points);
                console.log("hacky hackepeter:" + currentplayer.points);
                $("#newsticker").html("Newsticker: " + currentplayer.name + " wirft " + totalscore + " Punkte! No Score!")
                scoredthree = true;
        }

        currentplayer.avg = calcAvg();
        displayPoints(currentplayer.order, currentplayer.points, currentplayer.avg);
        sendUpdate();

        updateList(currentplayer.order);

        resetMultiplier();

        if (scoredthree || currentplayer.points == 0) {
                console.log("Player finished, Loading next");
                $("#backbtn").hide();
                index += 1;
                if (index > playercount - 1) {
                        index = 0;
                        round += 1;
                }
                next(playerlist[index]);
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
}

function calcAvg() {
        return Math.round(((((gamemode - currentplayer.points) / currentplayer.tries) *3 ) + Number.EPSILON) * 100) / 100;
}


