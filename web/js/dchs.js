$(document).ready(function () {
    $.when(reset()).done(function (data) {
        $('#version').html("Version: " + data);
    });
});

