//Observer
var evtWrapper = function (sender) {
    this._sender = sender;
    this._listeners = [];
}
evtWrapper.prototype.attach = function (handler) {
    if (typeof handler == "function") {
        this._listeners.push(handler);
    }
}
evtWrapper.prototype.notify = function () {
    for (var i = 0, ci; ci = this._listeners[i]; i++) {
        ci.apply(this._sender, arguments);
    }
}

var ball = function (m, x, y) {
    if (!m) { throw "no M" };
    this.m = m;
    this.applyPosition(x, y);
    this.applyV();
    this.applyR();
    this.picked = false;
    this.id = this.global.counter++;
    this.strings = {};
    this.global.allInstances.push(this);
    this.renderHandler = new evtWrapper(this);
}

ball.prototype.CONS = {
    fraction: 0.9
    , spring: 0.03
    , defaultR: 33
}

ball.prototype.global = {
    counter: 0
    , allStrings: {}
    , allInstances: []
}

ball.prototype.applyR = function (r) {
    if (r == undefined) {
        this.R = this.CONS.defaultR;
        return;
    }
    this.R = r;
}

ball.prototype.applyPosition = function (x, y) {
    this.position = new vector(x, y);
}

ball.prototype.applyV = function (vVector) {
    if (!vVector) {
        if (!this.v) {
            this.v = new vector();
            return;
        }
        return;
    }
    this.v = vVector
}

ball.prototype.spring = function (targetVector) {
    var _a = targetVector.times(this.CONS.spring);
    if (!this.v) { this.applyV(); }
    this.v.plus(_a);
    this.v.timesFrom(this.CONS.fraction);
    this.position.plus(this.v);
}

ball.prototype.springTo = function (dVector) {
    var _dis = this.position.fromMeTo(dVector);
    this.spring(_dis);
}

ball.prototype.springToBall = function (anotherBall) {
    var _len = this.getVal(anotherBall);
    if (_len < 0) { return; }
    var _toBall = this.position.fromMeTo(anotherBall.position);
    var _angel = _toBall.getAngel();
    var _tarX = anotherBall.position.x - Math.cos(_angel) * _len;
    var _tarY = anotherBall.position.y - Math.sin(_angel) * _len;
    this.springTo(new vector(_tarX, _tarY));
}

ball.prototype.springToBalls = function () {
    for (var i in this.strings) {
        var _another = this.strings[i];
        this.springToBall(_another);
    }
}

ball.prototype.attachBall = function (anotherBall) {
    var _key = Math.min(this.id, anotherBall.id) + "_" + Math.max(this.id, anotherBall.id);
    if (!this.global.allStrings[_key]) {
        var _val = this.position.fromMeTo(anotherBall.position).abs();
        this.strings[anotherBall.id] = anotherBall;
        anotherBall.strings[this.id] = this;
        this.global.allStrings[_key] = { a: this.id < anotherBall.id ? this : anotherBall, b: this.id > anotherBall.id ? this : anotherBall, len: _val };
    }
}

ball.prototype.getVal = function (anotherBall) {
    var _key = Math.min(this.id, anotherBall.id) + "_" + Math.max(this.id, anotherBall.id);
    return this.global.allStrings[_key] ? this.global.allStrings[_key].len : -1;
}


ball.prototype.onRender = function (func) {
    this.renderHandler.attach(func);
}

ball.prototype.render = function () {
    this.renderHandler.notify();
}

ball.prototype.logEvt = new evtWrapper(null);

ball.prototype.log = function (txt) {
    this.logEvt.notify(txt);
}
