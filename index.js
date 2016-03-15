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

    var key, value, ttlType, ttl, score, member;

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
                value = redisInstance.GET(key);
                if (debug) {
                    console.log("redisInstance.GET(", key, ") =>", value);
                }
                if (value) {
                    out.write(value + "\r\n");
                }
                else {
                    out.write("(nil)\r\n");
                }
            }
            break;

        case "DEL":
            var delCounter = 0, deleted;
            while (commandString.length > 0) {
                key = commandString.shift();
                if (key) {
                    if ((deleted = redisInstance.DEL(key))) {
                        if (debug) {
                            console.log("redisInstance.DEL(", key, ") =>", deleted);
                        }
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
                value = redisInstance.INCR(key);
                if (isNaN((value))) {
                    out.write("(error) ERR value is not an integer or out of range\r\n");
                }
                else {
                    out.write("(integer) " + value + "\r\n");
                }
            }
            else {
                out.write("(error) Sytax error\r\n");
            }
            break;

        case "ZADD":
            key = commandString.shift();
            score = commandString.shift();
            member = commandString.shift();
            if (key && score && member) {
                value = redisInstance.ZADD(key, score,member);
                if (value === null) {
                    out.write("(error) WRONGTYPE Operation against a key holding the wrong kind of value\r\n");
                }
                else {
                    out.write("(integer) " + value + "\r\n");
                }
            }
            break;

        case "ZCARD":
            key = commandString.shift();
            if (key) {
                value = redisInstance.ZCARD(key);
                out.write("(integer) " + value + "\r\n");
            }
            else {
                out.write("(error) ERR wrong number of arguments for 'zcard' command\r\n");
            }
            break;

        case "ZRANK":
            key = commandString.shift();
            member = commandString.shift();
            value = redisInstance.ZRANK(key, member);
            if (value === null) {
                out.write("(nil)\r\n");
            }
            else {
                out.write("(integer) " + value + "\r\n");
            }
            break;

        case "ZRANGE":
            key = commandString.shift();
            var start = commandString.shift();
            var stop = commandString.shift();
            if (key && start && stop) {
                value = redisInstance.ZRANGE(key, start, stop);
                if (value === null || value.length) {
                    out.write("(empty list or set)\r\n");
                }
                else {
                    for (i=0; i< value.length; i++) {
                        out.write(i + ") " + value + "\r\n");
                    }
                }
            }
            else {
                out.write("(error) ERR wrong number of arguments for 'zrange' command\r\n");
            }
            break;

        case "EXIT":
            out.write("Bye!\r\n");
            out.end();
            break;

        default:
            out.write("Unrecognized command!\r\n");
            break;
    }
    if (command !== "EXIT") {
        out.write(">");
    }
}


// 'connection' listener
var server = net.createServer(function (c) {
    console.log('client connected');

    c.write('Hello! Welcome to mini redis!\r\n>');

    c.on('end', function () {
        console.log('client disconnected');
    });

    c.on('data', function (data) {
        processInput(data, c);
    });
});

server.on('error', function (err) {
    throw err;
});

server.listen(port, function () {
    console.log('server listening on port', port);
});
