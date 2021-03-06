   var choice = function(data) {
        socket.emit('choice', data);
        clearStyle();
        setColor(data);
    };

    var setColor = function(data) {
        var classname = "." + data;
        var element = document.querySelector(classname);
        element.style.borderStyle = "solid";
        element.style.borderWidth = "5 px";
        element.style.borderColor = "#888";
    };

    var clearStyle = function() {
        var items = [".rock", ".paper", ".scissors"];
        for(var i=0; i<items.length;i++){
            // console.log(item);
        var element = document.querySelector(items[i]);
        element.removeAttribute("style");
        }

        
    }

    var toggle =
        function(id, toggle) {
            var element = document.getElementById(id);
            element.style.visibility = toggle;
        };

    var setText = function(id, text) {
        var element = document.getElementById(id);
        element.innerHTML = text;
    };
    var appendText = function(id, text) {
        var element = document.getElementById(id);
        element.innerHTML = element.innerHTML + "</br>" + text;
    };
    var socket = io.connect('http://localhost', {
        'sync disconnect on unload': true
    });
    socket.on('playerid', function(data) {
        console.log(data);
        var line = "Your player id is: " + data.content;
        appendText('debug', line);
        socket.emit('ready', 'ready');
    });

    socket.on('wait', function(data) {
        console.log(data);
        toggle('wait', 'visible');
        setText('wait', data.content);
        toggle('game', 'hidden');
    });

    socket.on('choose', function() {
        setText('result', '');
        toggle('result', 'hidden');
        setText('counter', '');
        toggle('counter', 'hidden');
        toggle('game', 'visible');
        // var game = document.getElementById('game');
        // game.style.visibility = "visible";
        toggle('wait', 'hidden');
        // var wait = document.getElementById('wait');
        // wait.style.visibility = "hidden";
    });

    socket.on('stats', function(data) {
        console.log(data);
        var line = 'Won: ' + data.w + ' Lost: ' + data.l + ' Streak: ' + data.ws;
        setText('stats', line);
    });

    socket.on('result', function(data) {

        // toggle('game', 'hidden');
        setText('result', data.content);
        toggle('result', 'visible');
        var secs = 1;

        updateText();

        function updateText() {
                // var counter = document.getElementById('counter');
                var line = 'You will be placed in queue after ' + secs + ' seconds';
                toggle('counter', 'visible');
                setText('counter', line);
                secs--;
                if (secs > 0) {
                    setTimeout(updateText, 100);
                }
            }
        clearStyle();
            // counter.style.visibility = 'hidden';
    });
   