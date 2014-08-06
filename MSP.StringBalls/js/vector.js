var vector = function (x, y) {
    this.x = (x == undefined ? 0 : x);
    this.y = (y == undefined ? 0 : y);
}

vector.prototype.abs = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
}

vector.prototype.add = function (anotherVector) {
    return new vector(this.x + anotherVector.x, this.y + anotherVector.y);
}

vector.prototype.sub = function (anotherVector) {
    return new vector(anotherVector.x - this.x, anotherVector.y - this.y);
}

vector.prototype.plus = function (anotherVector) {
    this.x += anotherVector.x;
    this.y += anotherVector.y;
    return this;
}

vector.prototype.plusNum = function (number) {
    this.x += number;
    this.y += number;
    return this;
}

vector.prototype.times = function (value) {
    return new vector(this.x * value, this.y * value);
}

vector.prototype.timesFrom = function (value) {
    this.x = this.x * value;
    this.y = this.y * value;
    return this;
}

vector.prototype.div = function (value) {
    if (value == 0) { throw "the divider cannot be 0"; };
    return new vector(this.x/value,this.y/value);
}

vector.prototype.divFrom = function (value) {
    if (value == 0) { throw "the divider cannot be 0"; };
    this.x = this.x / value;
    this.y = this.y / value;
    return this;
}

vector.prototype.fromMeTo = function (anotherVector) {
    return this.sub(anotherVector);
}

vector.prototype.getAngel = function () {
    return Math.atan2(this.y,this.x);
}

vector.prototype.unit = function () {
    var _mod = this.abs();
    return {
        unit: _mod == 0 ? this : this.times(1 / _mod)
        , mod: _mod
    }
}

vector.prototype.isZero = function () {
    return (this.x == 0 && this.y == 0);
}

vector.prototype.reverse = function () {
    return new vector(-this.x,-this.y);
}

vector.prototype.setZero = function () {
    this.x = this.y = 0;
}

vector.prototype.ceil = function () {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
}

vector.prototype.floor = function () {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
}

vector.prototype.round = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
}

vector.prototype.isSameLine = function (another) {
    return (this.x * another.y).toFixed(3) == (this.y * another.x).toFixed(3);
}

vector.prototype.isReverse = function (another, flag) {
    if (flag || this.isSameLine(another)) {
        return (this.x / another.x < 0);
    }
    return false
}