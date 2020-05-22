$(document).ready(function () {
    $('#score').html("Score: 27");
    $('#field').html("Treffe die Doppel 1");
    /*$.when(reset()).done(function (data) {*/
    $('#bestscore').html("Top: 0");
    /*});*/
});

var points = 27;
var field = 1;

function score(btn) {
    console.log(btn.value);
    if (btn.value == "0") {
        console.log("Negative")
        points = points - (field * 2)
    } else {
        switch (btn.value) {
            case "1":
                points = points + (field * 2);
                break;
            case "2":
                points = points + (field * 2 * 2);
                break;
            case "3":
                points = points + (field * 2 * 3);
                break;
        } 
    }
    field = field + 1;
    console.log(points);
    update();
}

function update(){
    $('#score').html("Score: " + points);
    $('#field').html("Treffe die Doppel " + field);
}

