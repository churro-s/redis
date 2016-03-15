var zs = require('./ZSet');
var ZSet = zs.ZSet;
var ZElement = zs.ZElement;

/**
 * Constructs a new redis client
 * @constructor
 */
function Redis() {
    this.map = {};
    this.size = 0;
}

Redis.prototype.DEL = function DEL(key) {
    var oldValue = this.map[key];
    if (oldValue) {
        clearTimeout(oldValue.timeout);
        this.size--;
    }
    delete this.map[key];
    return oldValue && oldValue.value;
};


Redis.prototype.SET = function SET(key, val, seconds) {
    oldValue = this.map[key];

    if (oldValue && oldValue.timeout) {
        clearTimeOut(oldValue.timeout);
    }

    newValue = {
        value: val,
        expires: Date.now() + seconds
    };

    //set deletion timeout to specified TTL
    if (!isNaN(newValue.expires)) {
        newValue.timeout = setTimeout(function () {
            this.DEL(key);
        }.bind(this), seconds * 1000);
    }

    this.map[key] = newValue;
    this.size++;

    return val;
};

Redis.prototype.GET = function GET(key) {
    var record = this.map[key];
    return record && record.value;
};

Redis.prototype.SIZE = function SIZE() {
    return this.size;
};

Redis.prototype.INCR = function INCR(key) {
    var val = this.GET(key);
    val = (val - 0) + 1;
    if (isNaN(val)) {
        return val;
    }
    return this.SET(key, val);
};

Redis.prototype.ZADD = function ZADD(key, score, member) {
    var val = this.GET(key);
    if (val) {
        if (val instanceof ZSet) {
            return val.add(score, member);
        }
        else {
            return null; //found a non-ZSet value
        }
    }
    else {
        val = new ZSet();
        this.SET(key, val);
        return val.add(score, member);
    }
};
Redis.prototype.ZCARD = function ZCARD(key) {
    var val = this.GET(key);
    if (val && val instanceof ZSet) {
        return val.zcard();
    }
    else {
        return 0; //found a non-ZSet value
    }
};

Redis.prototype.ZRANK = function ZRANK(key, member) {
    var val = this.GET(key);
    if (val && val instanceof ZSet) {
        return val.getRank(member);
    }
    else {
        return null; //found a non-ZSet value
    }
};
Redis.prototype.ZRANGE = function ZRANGE(key, start, stop) {
    var val = this.GET(key);
    if (val && val instanceof ZSet) {
        return val.zrange(start, stop);
    }
    else {
        return null; //found a non-ZSet value
    }
};


module.exports = exports = Redis;