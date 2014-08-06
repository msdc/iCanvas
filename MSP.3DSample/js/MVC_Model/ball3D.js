var ball3D = function (x, y, z,zSpeed,color) {
    this.applyPosition(x, y, z);
    this.applyZSpeed(zSpeed);
    this.applyColor(color);
    this.visiable();
}

ball3D.prototype.EnvParams = {
    focus: 60
    , minZ: -60
    , vX: 400
    , vY:300
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
    this.position = new vector3(x, y, z);
    //每次apply position之后都需要重新计算位置和scale
    this.perspective();
}

ball3D.prototype.applyZSpeed = function (value) {
    if (value == undefined) {
        this.zSpeed = utils.getRandom(-4, 4);
        return;
    }
    this.zSpeed = value;
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

    if (this.oX==undefined) {
        this.oX = this.position.x;
        this.oY = this.position.y;
    }
    var x = this.oX - this.EnvParams.vX;
    var y = this.oY - this.EnvParams.vY;
    this.position = new vector3(this.EnvParams.vX + x * this.scale, this.EnvParams.vY + y * this.scale, this.position.z);
}




ball3D.prototype.move = function (step) {
    this.position.z += (step+this.zSpeed);
    this.perspective();
}

