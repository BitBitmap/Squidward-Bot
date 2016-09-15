var request = require('request');
var Discord = require("discord.js");
var async = require("async");
var moment = require("moment");
var mybot = new Discord.Client();

//Pulls the schedule as JSON
var schedule = function(callback) {
    request.get('https://splatoon.ink/schedule.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null, JSON.parse(body));
        } else {
            callback(error);
        }
    })
};

//Checks rotation for now, next, last, and all based on order and displays it.
function display_rotation(message, order, callback) {
    var time;

    schedule(function(error, schedule_json){
        if (order === 0) {
            if (schedule_json.schedule[order]) {
                time = '==== Now ends ' + moment(schedule_json.schedule[order].endTime).fromNow() + ' ====\n';
            }
        }
        else if (order === 1) {
            if (schedule_json.schedule[order]) {
                time = '==== Next Rotation ' + moment(schedule_json.schedule[order].startTime).fromNow() + ' ====\n';
            }
        }
        else if (order === 2) {
            if (schedule_json.schedule[order]) {
                time = '==== Last Rotation ' + moment(schedule_json.schedule[order].startTime).fromNow() + ' ====\n';
            }
        }

        if (error) {
            message.channel.sendMessage("Oh snap, I can't retrieve the schedule.");
            if (typeof(callback) == "function")
                callback(null, message);
        } else{
            if (schedule_json.splatfest === true){
                message.channel.sendMessage("Splatfest ongoing. Please use `!r fes` instead.");
                if (typeof(callback) == "function")
                    callback(null, message);
            } else {
                if (schedule_json.schedule[order]) {
                    message.channel.sendMessage(time + '**Turf War:** ' + schedule_json.schedule[order].regular.maps["0"].nameEN + ', ' + schedule_json.schedule[order].regular.maps["1"].nameEN + '\n' + '**Ranked [' + schedule_json.schedule[order].ranked.rulesEN + ']:** ' + schedule_json.schedule[order].ranked.maps["0"].nameEN + ', ' + schedule_json.schedule[order].ranked.maps["1"].nameEN);
                }
                if (typeof(callback) == "function")
                    callback(null, message);
            }
        }
    });
}

//Checks if there is a splatfest and displays splatfest information if there is.
function display_festival(message) {
    schedule(function(error, schedule_json){
        if (error) {
            message.channel.sendMessage("Oh snap, I can't retrieve the schedule.");
            callback(null, message);
        } else {
            if (schedule_json.splatfest === false){
                message.channel.sendMessage("No Splatfest right now. Please us `!r now`, `!r next`, `!r last` or `!r all` instead.")
            } else {
                message.channel.sendMessage('==== Splatfest ====\n' + schedule_json.schedule[0].regular.teams[0] + ' **vs** ' + schedule_json.schedule[0].regular.teams[1] + '\n' + '**Ends ** ' + moment(schedule_json.schedule[0].endTime).fromNow() + '\n' + '**Maps :** ' + schedule_json.schedule[0].regular.maps[0].nameEN + ', ' + schedule_json.schedule[0].regular.maps[1].nameEN + ', ' + schedule_json.schedule[0].regular.maps[2].nameEN + '\n\nHappy Splatfest! And may the odds be ever in your favor!')
            }
        }
    })
}

//Bot help menu
function display_helper(message) {
    message.channel.sendMessage("Use `!r help` to list all the available commands");
}

//Displays bot commands
function display_commands(message) {
    message.channel.sendMessage("List of commands for the Splat Rotations bot:\n\n- `!r help` : You're using it\n- `!r now` : Displays the current rotation\n- `!r next` : Displays the next rotation\n- `!r last` : Displays the last rotaton\n- `!r all` : Displays all rotations\n- `!r fes` : Displays current Splatfest infos\n\nくコ:彡 ***Stay Fresh***")
}

mybot.on("message", function(message) {
    if (message.content === "!r")
        display_helper(message);
    else if (message.content === "!r help")
        display_commands(message);
    else if (message.content === "!r now")
        display_rotation(message, 0);
    else if (message.content === "!r next")
        display_rotation(message, 1);
    else if (message.content === "!r last")
        display_rotation(message, 2);
    else if (message.content === "!r fes")
        display_festival(message);
    else if (message.content === "!r all") {
        async.waterfall([
            function(callback) { callback(null, message); },
            function(message, callback){ display_rotation(message, 0, callback) },
            function(message, callback){ display_rotation(message, 1, callback) },
            function(message, callback){ display_rotation(message, 2, callback) }
        ]);
    }
});

mybot.login("nZciOVApusEk8JxXrnPbNKQB6lxNvsgd");
// If you still need to login with email and password, use mybot.login("email", "password");