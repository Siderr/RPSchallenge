var Stats = module.exports = function(id) {
    this.id = id;
    this.win = 0;
    this.lose = 0;
    this.last = false;
    this.winStreak = 0;
}

Stats.prototype.getId = function() {
    return this.id;
}

Stats.prototype.won = function() {
    this.win++;
    if (this.last == false) {
        this.winStreak = 0;
    }
    this.winStreak++;
    this.last = true;
};

Stats.prototype.lost = function() {
    this.lose++;
    this.winStreak = 0;
    this.last = false;
};

Stats.prototype.getWin = function() {
    return this.win;
};

Stats.prototype.getLose = function() {
    return this.lose;
};

Stats.prototype.getStreak = function() {
    return this.winStreak;
};

Stats.prototype.getStats = function() {
    var data = {
        w: this.win,
        l: this.lose,
        ws: this.winStreak
    };
    return data;
};
