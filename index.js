var Redis = require('./redis');

var net = require('net');


var redisInstance = new Redis();
var port = 5555;

//enable to see server logging
var debug = true;


function processInput(input, out) {
    var commandString = input.toString().trim().split(/\s+/);
    //console.log("Command is", command);
    var command = commandString.shift();

    var key, value, ttlType, ttl;

    switch (command) {
        case "SET":
            key = commandString.shift();
            value = commandString.shift();
            ttlType = commandString.shift();
            ttl = parseInt(commandString.shift(), 10);
            if (key && value && !ttlType) {
                redisInstance.SET(key, value);
                if (debug) {
                    console.log("redisInstance.SET(", key, value, ")");
                }
                out.write("OK\r\n");
            }
            else if (key && value && ttlType == 'EX' && !isNaN(ttl)) {
                redisInstance.SET(key, value, ttl);
                if (debug) {
                    console.log("redisInstance.SET(", key, value, ttl, ")");
                }
                out.write("OK\r\n");
            }
            else {
                out.write("(error) Sytax error\r\n");
            }
            break;

        case "GET":
            key = commandString.shift();
            if (key) {
                var val = redisInstance.GET(key);
                if (debug) {
                    console.log("redisInstance.GET(", key, ") =>", val);
                }
                if (val) {
                    out.write(val + "\r\n");
                }
                else {
                    out.write("(nil)\r\n");
                }
            }
            break;

        case "DEL":
            var delCounter = 0;
            while (commandString.length > 0) {
                key = commandString.shift();
                if (key) {
                    if(redisInstance.DEL(key)) {
                        delCounter++;
                    }
                }
            }
            out.write("(integer) " + delCounter + "\r\n");
            break;

        case "DBSIZE":
            out.write(redisInstance.SIZE() + "\r\n");
            break;

        case "INCR":
            key = commandString.shift();
            if (key) {
                out.write(redisInstance.INCR(key) + "\r\n");
            }
            else {
                out.write("(error) Sytax error\r\n");
            }

            break;
        case "ZADD":
            break;
        case "ZCARD":
            break;
        case "ZRANK":
            break;
        case "ZRANGE":
            break;
        case "EXIT":
            out.write("Bye!\r\n");
            out.end();
            break;
        default:
            out.write("Invalid command!\r\n");
            break;
    }
    out.write(">");
}


var server = net.createServer(function (c) {
    // 'connection' listener
    console.log('client connected');
    c.on('end', function () {
        console.log('client disconnected');
    });
    c.on('data', function (data) {
        processInput(data, c);
    });
    c.write('Hello! Welcome to mini redis!\r\n>');
    //c.pipe(c);
});

/*server.on('connection', function(c) {
 console.log("Connection");
 c.pipe(process.stdout);
 });*/

server.on('error', function (err) {
    throw err;
});

server.listen(port, function () {
    console.log('server listening on port', port);
});
