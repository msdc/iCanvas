var ball3D = function (env, x, y, z, color) {
    this.EnvParams = env;
    this.applyPosition(x, y, z);
    this.applyColor(color);
    this.applyR();
    this.applySpeed();
    this.visiable();
    this.id = ++this.global.id;
}

ball3D.prototype.global = {
    collisions: {}
    , id: 0
}

ball3D.prototype.reSetParams = function (values) {
    for (var i in values) {
        if (this.EnvParams[i] != undefined) {
            this.EnvParams[i] = values[i];
        }
    }
}

ball3D.prototype.applyPosition = function (x, y, z) {
    if (x instanceof vector3) {
        this.position = x;
        return;
    }
    var _x = x == undefined ? utils.getRandom(this.EnvParams.left, this.EnvParams.right) : x;
    var _y = y == undefined ? utils.getRandom(this.EnvParams.top, this.EnvParams.bottom) : y;
    var _z = z == undefined ? utils.getRandom(this.EnvParams.front, this.EnvParams.back) : z;
    this.position = new vector3(_x, _y, _z);
    //每次apply position之后都需要重新计算位置和scale
    this.perspective();
}

ball3D.prototype.applySpeed = function (x, y, z) {
    var _x = x == undefined ? utils.getRandom(-6, 6) : x;
    var _y = y == undefined ? utils.getRandom(2, 15) : y;
    var _z = z == undefined ? -utils.getRandom(-3, 3) : z;
    this.velocity = new vector3(_x, _y, _z);
}



ball3D.prototype.applyR = function (value) {
    this.r = value == undefined ? this.EnvParams.r : value;
    this.R = this.r;
}

ball3D.prototype.applyColor = function (value) {
    this.color = value ? value : "rgb(" + utils.getRandom(0, 255) + "," + utils.getRandom(0, 255) + "," + utils.getRandom(0, 255) + ")";
}

ball3D.prototype.visiable = function () {
    this.isVisiable = true;
}

ball3D.prototype.vanish = function () {
    this.isVisiable = false;
}

ball3D.prototype.perspective = function () {
    if (this.position.z <= this.EnvParams.minZ) {
        this.vanish();
        return;
    }
    this.visiable();
    this.scale = this.EnvParams.focus / (this.EnvParams.focus + this.position.z);

    var x = this.position.x;
    var y = this.position.y;
    this.display = new vector3(this.EnvParams.vX + x * this.scale, this.EnvParams.vY + y * this.scale, this.position.z);
}

ball3D.prototype.collisionDetecting = function (another) {
    var _dis = another.position.sub(this.position).abs();
    var _small = Math.min(this.id, another.id);
    var _big = Math.max(this.id, another.id);
    var _isCollision = this.global.collisions[_small + "_" + _big];
    var _disCriterion = this.R + another.R; //(this.R * this.scale + another.R*another.scale);

    if (_dis < _disCriterion && !_isCollision) {
        this.global.collisions[_small + "_" + _big] = true;
        return true
    }
    if (_dis >= _disCriterion) {
        delete this.global.collisions[_small + "_" + _big];
    }
    return false;
}

ball3D.prototype.move = function () {
    this.velocity.y += this.EnvParams.g;
    this.applyPosition(this.position.plus(this.velocity));
    //detect Y
    if (this.position.y > this.EnvParams.bottom) {
        this.position.y = this.EnvParams.bottom;
        this.velocity.y *= this.EnvParams.bounce;
    }
    else if (this.position.y < this.EnvParams.top) {
        this.position.y = this.EnvParams.top;
        this.velocity.y *= this.EnvParams.bounce;
    }

    //detect X
    if (this.position.x > this.EnvParams.right) {
        this.position.x = this.EnvParams.right;
        this.velocity.x *= this.EnvParams.bounce;
    }
    else if (this.position.x < this.EnvParams.left) {
        this.position.x = this.EnvParams.left;
        this.velocity.x *= this.EnvParams.bounce;
    }

    //detect Z
    if (this.position.z > this.EnvParams.back) {
        this.position.z = this.EnvParams.back;
        this.velocity.z *= this.EnvParams.bounce;
    }
    else if (this.position.z < this.EnvParams.front) {
        this.position.z = this.EnvParams.front;
        this.velocity.z *= this.EnvParams.bounce;
    }
    this.perspective();
}

ball3D.prototype.rotateY = function (angle) {
    if (angle != undefined) {

        //转坐标系
        this.position = this.position.rotateY(angle);
        this.velocity = this.velocity.rotateY(angle);
    }
    this.perspective();
}


