//score = hash = key
// member = value

function ZElement(score, member) {
    this.member = member;
    this.score = score;
}
// Comparator function to use for ordering ZElements
ZElement.prototype.compareTo = function compareTo(other) {
    if (this.score == other.score) {
        return this.member.localeCompare(other.member); //string comparison
    }
    return this.score > other.score;
};


function ZSet() {
    this.elements = {};//truly unique elements - hash map of "member_score"
    this.memberMap = {};//map of {member : element}
    this.sortedElements = []; //sorted version of elements
    this.size = 0; //size of ZSet
    this.sorted = true; //short circuit for sorting operation
}

ZSet.prototype.add = function add(score, member) {
    var key = member + "_" + score;
    var existing = this.elements[key];
    if (existing) {
        return 0;
    }

    var element = new ZElement(score, member);
    this.elements[key] = element;
    this.memberMap[member] = element;
    this.sortedElements.push(element);
    this.size++;
    this.sorted = false;
    return 1;
};

ZSet.prototype.sort = function sort() {
    if (this.sorted) {
        return;
    }
    this.sortedElements.sort(function comparator(a, b) {
        return a.compareTo(b);
    });
    this.sorted = true;
};

ZSet.prototype.zcard = function zcard() {
    return this.size;
};

ZSet.prototype.zscore = function zscore(member) {
    return this.memberMap[member].score;
};

ZSet.prototype.getRank = function getRank(member) {
    this.sort();
    return this.sortedElements.indexOf(this.memberMap[member]);
};


ZSet.prototype.zrange = function zrange(start, stop) {
    this.sort();
    return this.sortedElements.slice(start, stop);
};

exports.ZElement = ZElement;
exports.ZSet = ZSet;