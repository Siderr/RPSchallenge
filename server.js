var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    serverPort = 9098;
var clients = [];
var waiting = new Array();
var player1, player2;
var playing = [];
var matches = new Array();
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

    socket.on('ready', function(ready) {
        console.log('getting ready.	')
        waiting.push(socket);
        socket.emit('wait', {
            'content': 'Please wait until we find you an opponent.'
        });


    });


    io.on('connection', function(socket) {
        console.log('User connected.')
    });

    io.on('disconnect', function(socket) {
        console.log('User disconnected.');
    });


});

server.listen(9098, function() {
    console.log('Listening on port ' + serverPort);
});

var battle = function(p1, p2, player1, player2) {
    console.log('Entering battle.');
    if ((p1 == 'rock') && (p2 == 'scissors')) {
        player1.emit('result', {
            'content': 'You won!'
        });
        player2.emit('result', {
            'content': 'You loose'
        });
    }
    if ((p1 == 'rock') && (p2 == 'paper')) {
        player2.emit('result', {
            'content': 'You won!'
        });
        player1.emit('result', {
            'content': 'You loose'
        });
    }
    if ((p1 == 'paper') && (p2 == 'rock')) {
        player1.emit('result', {
            'content': 'You won!'
        });
        player2.emit('result', {
            'content': 'You loose'
        });
    }
    if ((p1 == 'paper') && (p2 == 'scissors')) {
        player2.emit('result', {
            'content': 'You won!'
        });
        player1.emit('result', {
            'content': 'You loose'
        });
    }
    if ((p1 == 'scissors') && (p2 == 'paper')) {
        player1.emit('result', {
            'content': 'You won!'
        });
        player2.emit('result', {
            'content': 'You loose'
        });
    }
    if ((p1 == 'scissors') && (p2 == 'rock')) {
        player2.emit('result', {
            'content': 'You won!'
        });
        player1.emit('result', {
            'content': 'You loose'
        });
    }
    if (p1 == p2) {
        player1.emit('result', {
            'content': 'It\'s a tie!'
        });
        player2.emit('result', {
            'content': 'It\'s a tie!'
        });
    }

};

var game = function(player1, player2) {
    var finished = false;
    var p1, p2;
    player1.emit('choose');
    player2.emit('choose');
    player1.on('choice', function(data) {
        console.log(data);
        p1 = data;
        if (p2 == undefined)
            player1.emit('wait', {
                'content': 'Player2 hasn\'t chosen yet.'
            });
        else if (p2 && !finished) {
            finished = true;
            battle(p1, p2, player1, player2);
        }


    });
    player2.on('choice', function(data) {
        console.log(data);
        p2 = data;
        if (p1 == undefined)
            player2.emit('wait', {
                'content': 'Player1 hasn\'t chosen yet.'
            });
        else if (p1 && !finished) {
            finished = true;
            battle(p1, p2, player1, player2);
        }

    });
};

setInterval(function() {
    if (waiting.length >= 2) {
        var games = waiting.length / 2;
        console.log(games);
        console.log('There is a queue of people waiting, let\'s invite them to play.');
        var totalGames = games * 2;
        for (var i = 0; i < totalGames; i = i + 2) {
            console.log('for ciklas');
            var match = new Array();
            console.log(waiting[i]);
            match.player1 = waiting[i];
            match.player2 = waiting[i + 1];
            matches.push(match);
            game(waiting[i], waiting[i + 1]);
        }
        waiting.splice(0, totalGames);
    }
}, 1000);
