var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    serverPort = 9098;
var path = require('path');
var Stats = require('./Stats.js');
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'images')));
var clients = [];
var waiting = new Array();
var player1, player2;
var playing = [];
var matches = new Array();
var statistics = [];
// var match = new Array();

console.log('Server started.');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.emit('playerid', {
        content: socket.id
    });
    clients.push(socket);
    console.log('Trying to create new stats object for player.');
    var stats = new Stats(socket.id);
    console.log(stats.getId());
    statistics.push(stats);
    // console.log(statistics[0].getStats());
    // socket.emit('stats', statistics[0].getStats());

    socket.on('ready', function(ready) {
        console.log('getting ready. ')
        waiting.push(socket);
        socket.emit('wait', {
            'content': 'Please wait until we find you an opponent.'
        });
        socket.emit('stats', getStats(socket.id));
    });

    socket.on('disconnect', function() {
        console.log('User disconnected.');
        var index = waiting.indexOf(socket);
        waiting.splice(index, 1);
        for (var i = 0; i < statistics.length; i++) {
            if (statistics[i].getId() == socket.id) {
                statistics.splice(i, 1);
            }
        }
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].player1 == socket) {
                waiting.push(matches[i].player2);
                matches[i].player2.emit('wait', {
                    'content': 'Your opponent disconnected, please wait until we find you a new one.'
                });
                matches.splice(i, 1);
            } else if (matches[i].player2 == socket) {
                waiting.push(matches[i].player1);
                matches[i].player1.emit('wait', {
                    'content': 'Your opponent disconnected, please wait until we find you a new one.'
                });
                matches.splice(i, 1);
            }
            // console.log('checked ' + i + ' times');
        }
    });


});


io.on('connection', function(socket) {
    console.log('User connected.');
});

io.on('disconnect', function(socket) {
    console.log('User disconnected.');
    for (var i = 0; i < matches.length; i++) {

        if (matches[i].player1 == socket) {
            matches.splice(i, 1);
            waiting.push(matches[i].player2);
            matches[i].player2.emit('wait', {
                'content': 'Your opponent disconnected, please wait until we find you a new one.'
            });
        } else if (matches[i].player2 == socket) {
            matches.splice(i, 1);
            waiting.push(matches[i].player1);
            matches[i].player1.emit('wait', {
                'content': 'Your opponent disconnected, please wait until we find you a new one.'
            });
        }
    }
});



server.listen(9098, function() {
    console.log('Listening on port ' + serverPort);
});

var statisticsUpdate = function(id, result) {
    console.log(result);
    for (var i = 0; i < statistics.length; i++) {
        if (statistics[i].getId() == id) {
            console.log('radau');
            if (result == 'won') {
                console.log('laimejau');
                statistics[i].won();
            } else if (result == 'lost') {
                statistics[i].lost();
            }
        }

    }
};

var getStats = function(id) {
    for (var i = 0; i < statistics.length; i++) {
        if (statistics[i].getId() == id) {
            console.log(statistics);
            return statistics[i].getStats();
        }
    }
};

var battle = function(p1, p2, player1, player2) {
    console.log('Entering battle.');
    if (((p1 == 'rock') && (p2 == 'scissors')) || ((p1 == 'paper') && (p2 == 'rock')) || ((p1 == 'scissors') && (p2 == 'paper'))) {
        player1.emit('result', {
            'content': 'You won!'
        });
        player2.emit('result', {
            'content': 'You loose'
        });
        statisticsUpdate(player1.id, 'won');
        statisticsUpdate(player2.id, 'lost');
    }
    if (((p1 == 'rock') && (p2 == 'paper')) || ((p1 == 'paper') && (p2 == 'scissors')) || ((p1 == 'scissors') && (p2 == 'rock'))) {
        player2.emit('result', {
            'content': 'You won!'
        });
        player1.emit('result', {
            'content': 'You loose'
        });
        statisticsUpdate(player2.id, 'won');
        statisticsUpdate(player1.id, 'lost');
    }
    if (p1 == p2) {
        player1.emit('result', {
            'content': 'It\'s a tie!'
        });
        player2.emit('result', {
            'content': 'It\'s a tie!'
        });
    }
    console.log('Preparing to restart battle.');
    setTimeout(function() {
        for (var i = 0; i < matches.length; i++) {
            if (player1 == matches[i].player1 && player2 == matches[i].player2)
                matches.splice(i, 1);
        }
        waiting.push(player1);
        waiting.push(player2);
    }, 100);

};

var game = function(player1, player2) {
    var finished = false;
    var p1, p2;
    player1.emit('choose');
    player2.emit('choose');
    player1.on('choice', function(data) {
        // console.log(data);
        p1 = data;
        if (p2 == undefined)
        // player1.emit('debug', {
        //     'content': 'Player2 hasn\'t chosen yet.'
        // });
            console.log('Player 1 has not made a choice yet.');
        else if (p2 && !finished) {
            finished = true;
            battle(p1, p2, player1, player2);
        }


    });
    player2.on('choice', function(data) {
        // console.log(data);
        p2 = data;
        if (p1 == undefined)
        // player2.emit('wait', {
        //     'content': 'Player1 hasn\'t chosen yet.'
        // });
            console.log('Player 2 has not made a choice yet.');
        else if (p1 && !finished) {
            finished = true;
            battle(p1, p2, player1, player2);
        }

    });
};

setInterval(function() {
    if (waiting.length >= 2) {
        var games = waiting.length / 2;
        console.log('There is a queue of people waiting, let\'s invite them to play.');
        var totalGames = games * 2;
        for (var i = 0; i < totalGames; i = i + 2) {
            if(waiting[i] == null || waiting[i+1] == null)
                break;
            var match = new Array();
            match.player1 = waiting[i];
            match.player2 = waiting[i + 1];
            match.player1.emit('stats', getStats(match.player1.id));
            match.player2.emit('stats', getStats(match.player2.id));
            matches.push(match);
            game(waiting[i], waiting[i + 1]);
        }
        waiting.splice(0, totalGames);
    }
}, 1000);
