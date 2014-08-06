var CONS = {
    g: 10
    , u: 0.4
    , k: 8
    , stringLength: 4
    , stringMax: 14
}

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
    //initialization
    this.l = this.angle = 0;
    this.applyM(m);
    this.applyPosition(x,y);
    this.id = this.global.counter++;
    this.v = new vector();
    this.balls.push(this);
}

ball.prototype.balls = [];

ball.prototype.applyR=function(r){
    this.R=r;
}

ball.prototype.setFixed = function (isFixed) {
    this.fixed = isFixed == undefined ? false : true;
}

ball.prototype.logEvt = new evtWrapper(null);

ball.prototype.log = function (txt) {
    this.logEvt.notify(txt);
}

ball.prototype.global={
    counter:1
}

ball.prototype.applyM = function (m) {
    if (m == undefined) {
        throw "there is no m";
    }
    this.m = m;
}

ball.prototype.applyPosition = function (x, y) {
    this.vector = new vector(x,y);
}

ball.prototype.attachSingleBall = function (anotherBall) {
    if (!this.strings) {
        this.strings = {};
    }
    this.strings[anotherBall.id] = anotherBall;
    var _min = Math.min(this.id, anotherBall.id);
    var _max = Math.max(this.id, anotherBall.id);
    var _ind = _min + "_" + _max;

    if (!this.lines[_ind]) {
        this.lines[_ind] = { line: undefined, a: this, b: anotherBall };
    }

    if (anotherBall.strings && anotherBall.strings[this.id]) {
        return;
    }
    anotherBall.attachSingleBall(this);
}

ball.prototype.calculateAcc = function () {
    //初始化合力
    var _resultForce = new vector();
    //最大静摩擦力
    var _f = this.m * CONS.g * CONS.u;

    for (var i in this.strings) {
        //逐个扫描
        var _singleBall = this.strings[i];

        //计算距离向量
        var _tempVector = this.vector.fromMeTo(_singleBall.vector).div(10);

        //求距离的模（即实际距离）和单位向量（即方向）
        var _unitInfo = _tempVector.unit();

        //弹簧形变距离
        var _dis = Math.min(CONS.stringMax, (_unitInfo.mod - CONS.stringLength));
        //var _dis = _unitInfo.mod - CONS.stringLength;

        //累积合力.单个弹力计算公式:F=k*N,k为弹性系数，N为形变距离
        var _vol;
        if (_dis < 0) {
            
            _vol = _dis * CONS.k * 2;
        }
        else {
            _vol = _dis * CONS.k;
        }

        _resultForce.plus(_unitInfo.unit.times(_vol));
    }

    //返回加速度向量
    var _a = _resultForce.divFrom(this.m);
    return _a;
    //this.log("--Fin--");
    //this.log("");
    
}

ball.prototype.moveInline = function (a) {
    var _aM = a;
    var _vStart = _speed.mod; //起始速度
    var _vEnd = Math.max(_vStart + _aM * t, 0);//结束速度，最小为0
    //计算位移的量
    var _distance = (_vEnd * _vEnd - _vStart * _vStart) / 2 / _aM;
    _S = _speed.unit.times(_distance);
    //计算终止速度，沿原速度方向改变大小
    this.v = _speed.unit.times(_vEnd);
}

ball.prototype.move = function (t) {
    if (this.fixed) { return;}
    var _S;
    var _afMod = CONS.g * CONS.u;
    var _vUnit = _speed = this.v.unit();
    //计算合力产生的加速度
    var _aForce = this.calculateAcc();

    //求外力的模和单位向量
    var _aForceUnit = _aForce.unit();

    //计算外力与摩擦力大小
    var _aDiff = _aForceUnit.mod - _afMod;

    //摩擦力的方向总是与速度相反
    var _af = _vUnit.unit.times(-1 * _afMod);
    var _a = _aForce.add(_af);

    if (this.v.isZero()) {
        //没有速度
        if (_aDiff <= 0) {
            //拉力克服不了摩擦力
            return;
        }
        //启动
        //计算移动距离
        _S = _a.times(0.5 * t * t);
        //计算速度
        this.v.plus(_a.times(t));
        //设置元素位置
        this.vector.plus(_S);
        return;
    }

    if (_aDiff <= 0 ) {
        //拉力克服不了摩擦力
        if (this.v.isZero()) {
            //且速度为0；
            return;
        }
    }


    //速度不为0
    if (this.v.isSameLine(_aForce)) {
        //共线状态
        //得到加速度方向true 为同向， false为反向
        var _isForceReverse = this.v.isReverse(_aForce, true);

        //先考虑反向，此时做匀减速运动
        if (_isForceReverse) {
            this.moveInline(-(_afMod + _aForceUnit.mod));
            //this.log("反向");
        }
        else {
            //同向，需要对加速度做判断
            this.moveInline(_aDiff);
            //this.log("同向");
        }
    }
    else {
        var _aChange = _aForceUnit.unit.times(_aDiff).add(_af);
        //计算移动距离
        _S = this.v.times(t).add(_aChange.times(0.5 * t * t));
        //计算速度
        this.v.plus(_aChange.times(t));
        if (this.v.abs() < 1) {
            this.v = new vector();
        }
    }
    //设置元素位置
    this.vector.plus(_S);
    //////////////////////////////////////////////////////////////////////
    //if (_aForce.isZero()) {
    //    if (this.v.isZero()) {
    //        //没有外力，也没有速度
    //        return;
    //    }

    //    //合力产生的加速度为0，即没有外力作用
    //    //此时只有摩擦力作用
    //    //得到速度向量（量+方向）
    //    var _speed = this.v.unit();
    //    //摩擦力产生的加速度
    //    var _afMod = CONS.g * CONS.u;
    //    //原始速度
    //    var _vStart = _speed.mod;
    //    //结束速度，且速度不能小于0
    //    var _vEnd = Math.max(_vStart -_afMod * t, 0);
    //    //计算位移的量
    //    var _distance = (_vEnd * _vEnd - _vStart * _vStart) / 2 / (-_afMod);
    //    //生产位移向量，量+速度方向
    //    _S = _speed.unit.times(_distance);
    //    //计算终止速度，沿原速度方向改变大小。
    //    this.v = _speed.unit.times(_vEnd);
    //}
    //else {
    //    //计算移动距离
    //    _S = this.v.times(t).add(_aForce.times(0.5 * t * t));
    //    //计算速度
    //    this.v.plus(_aForce.times(t));
    //}
    ////设置元素位置
    //this.vector.plus(_S);
}

ball.prototype.moveNew = function (t) {
    if (this.fixed) { return; }
    var _S;
    var _afMod = CONS.g * CONS.u;
    var _vUnit = _speed = this.v.unit();
    //计算合力产生的加速度
    var _aForce = this.calculateAcc();

    //求外力的模和单位向量
    var _aForceUnit = _aForce.unit();

    //计算外力与摩擦力大小
    var _aDiff = _aForceUnit.mod - _afMod;

    //外力产生的加速度
    var _a = _aForceUnit.unit.times(_aDiff < 0 ? 0 : _aDiff);

    //计算移动距离
    _S = this.v.times(t);

    //计算速度
    this.v.plus(_a.times(t));
    //模拟摩擦力
    this.v.timesFrom(0.8);
    this.vector.plus(_S);
}

ball.prototype.collision = function () {
    for (var i = 0, ci; ci = this.balls[i]; i++) {
        for (var j = i + 1, bi; bi = this.balls[j]; j++) {
            this.twoBallsCollision(ci,bi);
        }
    }
}

ball.prototype.twoBallsCollision = function (b1, b2) {
    //计算距离向量
    var _tempVector = b1.vector.fromMeTo(b2.vector);

    //求距离的模（即实际距离）和单位向量（即方向）
    var _unitInfo = _tempVector.unit();

    if (_unitInfo.mod >= b1.R + b2.R) {
        return;
    }

    if (b1.fixed) {
        b2.v = b2.v.times(-1);
        return;
    }

    if (b2.fixed) {
        b1.v = b1.v.times(-1);
        return;
    }

    var _m1 = b1.m;
    var _m2 = b2.m;

    var _vX1 = b1.v.x;
    var _vX2 = b2.v.x;

    var _vY1 = b1.v.y;
    var _vY2 = b2.v.y;

    b1.v.x = (2 * _m1 * _vX2 + (_m2 - _m1) * _vX1) / (_m1 + _m2);
    b2.v.x = (2 * _m2 * _vX1 + (_m1 - _m2) * _vX2) / (_m1 + _m2);

    b1.v.y = (2 * _m1 * _vY2 + (_m2 - _m1) * _vY1) / (_m1 + _m2);
    b2.v.y = (2 * _m2 * _vY1 + (_m1 - _m2) * _vY2) / (_m1 + _m2);



//v2'=[2m1v1+(m2-m1)v2]/(m1+m2)
//v1'=[2m2v2+(m1-m2)v1]/(m1+m2)

}

ball.prototype.lines = {};