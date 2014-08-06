var vector3 = function (x, y, z) {
    this.x = (x == undefined ? 0 : x);
    this.y = (y == undefined ? 0 : y);
    this.z = (z == undefined ? 0 : z);
}

vector3.prototype.abs = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}

vector3.prototype.add = function (anotherVector) {
    return new vector3(this.x + anotherVector.x, this.y + anotherVector.y, this.z + anotherVector.z);
}

vector3.prototype.sub = function (anotherVector) {
    return new vector3(anotherVector.x - this.x, anotherVector.y - this.y, anotherVector.z - this.z);
}

vector3.prototype.plus = function (anotherVector) {
    this.x += anotherVector.x;
    this.y += anotherVector.y;
    this.z += anotherVector.z;
    return this;
}

vector3.prototype.plusNum = function (number) {
    this.x += number;
    this.y += number;
    this.z += number;
    return this;
}

vector3.prototype.times = function (value) {
    return new vector3(this.x * value, this.y * value, this.z * value);
}

vector3.prototype.timesFrom = function (value) {
    this.x = this.x * value;
    this.y = this.y * value;
    this.z = this.z * value;
    return this;
}

vector3.prototype.div = function (value) {
    if (value == 0) { throw "the divider cannot be 0"; };
    return new vector3(this.x / value, this.y / value, this.z / value);
}

vector3.prototype.divFrom = function (value) {
    if (value == 0) { throw "the divider cannot be 0"; };
    this.x = this.x / value;
    this.y = this.y / value;
    this.z = this.z / value;
    return this;
}

vector3.prototype.fromMeTo = function (anotherVector) {
    return this.sub(anotherVector);
}

vector3.prototype.getAngel = function () {
    var _abs=this.abs();
    var _cosX = this.x / _abs;
    var _cosY = this.y / _abs;
    var _cosZ = this.z / _abs;

    return {
        angelX: Math.acos(_cosX)
        , angelY: Math.acos(_cosY)
        , angelZ: Math.acos(_cosZ)
        , cosX: _cosX
        , cosY: _cosY
        , cosZ: _cosZ

    }
}

vector3.prototype.unit = function () {
    var _mod = this.abs();
    return {
        unit: _mod == 0 ? this : this.times(1 / _mod)
        , mod: _mod
    }
}

vector3.prototype.isZero = function () {
    return (this.x == 0 && this.y == 0 && this.z==0);
}

vector3.prototype.reverse = function () {
    return new vector3(-this.x, -this.y, -this.z);
}

vector3.prototype.setZero = function () {
    this.x = this.y = this.z = 0;
}

vector3.prototype.ceil = function () {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
}

vector3.prototype.floor = function () {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
}

vector3.prototype.round = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
}

vector3.prototype.matrixSingle = function (x, y, z) {
    return this.x * x + this.y * y + this.z * z;
}

vector3.prototype.matrixChange = function (p,q,r) {
    /*
         p   q   r
        x1  x2  x3
        y1  y2  y3
        z1  z2  z3
    */
    return new vector3(this.matrixSingle(p.x, p.y, p.z), this.matrixSingle(q.x, q.y, q.z), this.matrixSingle(r.x, r.y, r.z));
}

vector3.prototype.rotateZ = function (angle) {
    return this.matrixChange({ x: Math.cos(angle), y: -Math.sin(angle), z: 0 }, { x: Math.cos(angle), y: Math.sin(angle), z: 0 }, { x: 0, y: 0, z: 1 });
}

vector3.prototype.rotateY = function (angle) {
    return this.matrixChange({ x: Math.cos(angle), y: 0, z: -Math.sin(angle) }, { x: 0, y: 1, z: 0 }, { x: Math.sin(angle), y: 0, z: Math.cos(angle) });
}

vector3.prototype.rotateX = function (angle) {
    return this.matrixChange({ x: 1, y: 0, z: 0 }, { x: 0, y: Math.cos(angle), z: -Math.sin(angle) }, { x: 0, y: Math.cos(angle), z: Math.sin(angle) });
}

vector3.prototype.move = function (x, y, z) {
    return new vector3(this.x - x, this.y - y, this.z - z);
}

