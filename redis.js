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


module.exports = exports = Redis;