$(document).ready(function() {
    reset();
    $.when(getSettings()).done(function(data) {
        gamesettings = data;
        $('#mainMenuTitle').html(data.title);
    });
});

var gamesettings;

$("#neuerTitel").click(function(e) {
    e.preventDefault();
    gamesettings.title = $("#title").val();
    $.when(updateSettings(gamesettings)).done(function(data) {
        $('#mainMenuTitle').html(data.title);
        $('#setMainMenuTitle').html(data.title);
    });
});

$("#settings").click(function(e) {
    e.preventDefault();
    $.when(reset()).done(function(data) {
        gamesettings = data;
    });
    if (gamesettings.connection) {
        $('#connection').html("Online");
    }
    $('#setMainMenuTitle').html(gamesettings.title);
    $('#version').html("Version: " + gamesettings.version);
});