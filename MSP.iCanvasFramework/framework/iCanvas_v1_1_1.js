function mul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try { m += s1.split(".")[1].length } catch (e) { }
    try { m += s2.split(".")[1].length } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}
function div(arg1, arg2) {
    var t1 = 0, t2 = 0, r1, r2;
    try { t1 = arg1.toString().split(".")[1].length } catch (e) { }
    try { t2 = arg2.toString().split(".")[1].length } catch (e) { }
    with (Math) {
        r1 = Number(arg1.toString().replace(".", ""))
        r2 = Number(arg2.toString().replace(".", ""))
        return mul((r1 / r2), pow(10, t2 - t1));
    }
}
function add(arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length; } catch (e) { r1 = 0; }
    try { r2 = arg2.toString().split(".")[1].length; } catch (e) { r2 = 0; }
    m = Math.pow(10, Math.max(r1, r2));
    return (mul(arg1, m) + mul(arg2, m)) / m;
}
function sub(arg1, arg2) {
    return add(arg1, -arg2);
}

function dcmYu(arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length; } catch (e) { r1 = 0; }
    try { r2 = arg2.toString().split(".")[1].length; } catch (e) { r2 = 0; }
    m = Math.pow(10, Math.max(r1, r2));
    return (mul(arg1, m) % mul(arg2, m)) / m;
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

evtWrapper.prototype.clear = function () {
    this._listeners = [];
}

evtWrapper.prototype.getHandlers = function () {
    return this._listeners;
}

var getOffSet = function (e) {
    var t = e.offsetTop;
    var l = e.offsetLeft;
    while (e = e.offsetParent) {
        t += e.offsetTop;
        l += e.offsetLeft;
    }
    return { dx: l, dy: t };
}

function object(o) {
    function F() { };
    F.prototype = o;
    return new F();
}

function inheritPrototype(subType, superType) {
    var prototype = object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

var pointer = function (w, h, wrapper) {
    this.x = this.y = 0;
    this.ox = this.oy = 0;
    this.w = w;
    this.h = h;
    this.wrapper = wrapper;
}

pointer.prototype.setPoint = function (x, y) {
    this.ox = x ? x : 0;
    this.oy = y ? y : 0;
}

pointer.prototype.moveLeft = function (ctrl) {
    var _flag = this.plusX(ctrl.w + ctrl.left);
    if (_flag == 1) {
        var _tempH = ctrl.offsetTop + ctrl.h;
        if (_tempH > this.y) {
            this.y = _tempH;
        }
    }
    this.translate();
}

pointer.prototype.moveDown = function (ctrl) {
    this.plusY(ctrl.h + ctrl.top);
    this.x = this.ox;
    this.translate();
}

pointer.prototype.moveLeftByPixes = function (value) {
    this.plusX(value);
    this.translate();
}

pointer.prototype.moveDownByPixes = function (value) {
    this.plusY(value);
    this.translate();
}

pointer.prototype.moveBoth = function (x, y) {
    this.plusX(x);
    this.plusY(y);
    this.translate();
}

pointer.prototype.plusX = function (value) {
    var _xLen = this.x + value;
    if (_xLen > this.w) {
        this.x = this.ox;
        return 1;
    }
    this.x = _xLen;
    return 0;
}

pointer.prototype.plusY = function (value) {
    var _yLen = this.y + value;
    if (_yLen > this.h) {
        this.y = this.h;
        return 1;
    }
    this.y = _yLen;
    return 0;
}

pointer.prototype.translate = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.wrapper.save();
    this.wrapper.translate(this.x, this.y);
}

pointer.prototype.restore = function () {
    this.wrapper.restore();
    return this;
}

//Mouse position
var getMouseCord = function (sender, evt) {
    var _offset = getOffSet(sender);
    var _xfix = _offset.dx;
    var _yfix = _offset.dy;
    return evt.pageX || evt.pageY ? { x: evt.pageX - _xfix, y: evt.pageY - _yfix, e: evt } : {
        x: evt.clientX + document.body.scrollLeft - _xfix,
        y: evt.clientY + document.body.scrollTop - _yfix,
        e: evt
    };
}

var getTouchCord = function (sender, evt) {

    var _evt = evt || window.event;

    var _x = _evt.pageX;
    var _y = _evt.pageY;
    if (_evt.targetTouches && _evt.targetTouches.length > 0) {
        _x = _evt.targetTouches[0].pageX;
        _y = _evt.targetTouches[0].pageY;
    }
    // var cord = { x: _evt.targetTouches[0].pageX || _evt.pageX, y: _evt.targetTouches[0].pageY || _evt.pageY };
    var cord = { x: _x, y: _y };
    var _offset = getOffSet(sender);
    var _xfix = _offset.dx;
    var _yfix = _offset.dy;
    return { x: cord.x - _xfix, y: cord.y - _yfix, e: _evt };


}



var canvasWrapper = function (canvasId, width, height, mouseFlag, touchFlag) {
    var _canvas = document.getElementById(canvasId);
    this.type = _canvas ? "existed" : "created";
    this.canvas = _canvas ? _canvas : document.createElement("CANVAS");
    _canvas = this.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.ctrlList = [];

    this.hasTouchCtrls = [];
    this.animationList = [];
    this.mouseFlag = (mouseFlag == undefined ? true : false);
    this.wh = { w: (this.type == "existed") ? _canvas.width : (width ? width : 400), h: (this.type == "existed") ? _canvas.height : (height ? height : 300) };
    if (this.type != "existed") {
        this.canvas.width = this.wh.w;
        this.canvas.height = this.wh.h;
    }

    this.canvasMouseMoveHandler = new evtWrapper(this.canvas);
    this.canvasMouseDownHandler = new evtWrapper(this.canvas);
    this.canvasMouseUpHandler = new evtWrapper(this.canvas);
    this.canvasMouseInHandler = new evtWrapper(this.canvas);
    this.canvasMouseOutHandler = new evtWrapper(this.canvas);

    //20130510 John added touch support
    this.canvasTouchStartHandler = new evtWrapper(this.canvas);
    this.canvasTouchMoveHandler = new evtWrapper(this.canvas);
    this.canvasTouchEndHandler = new evtWrapper(this.canvas);
    //20130517 
    this.canvasTouchOutHandler = new evtWrapper(this.canvas);



    this.offsetParentTouchStartHandler = new evtWrapper(this.canvas.offsetParent);
    this.offsetParentTouchMoveHandler = new evtWrapper(this.canvas.offsetParent);
    this.offsetParentTouchEndHandler = new evtWrapper(this.canvas.offsetParent);

    this.bodyTouchStartHandler = new evtWrapper(document.body);
    this.bodyTouchMoveHandler = new evtWrapper(document.body);
    this.bodyTouchEndHandler = new evtWrapper(document.body);

    this.scaleCallBack = new evtWrapper(this);
    var that = this;

    var _msPointerEnabled = window.navigator.msPointerEnabled;


    _canvas.addEventListener("mouseenter", function (e) {

        if (!that.mouseFlag) { return; };
        var _evt = e || window.event;
        var _mouseCord = getMouseCord(this, _evt);
        that.canvasMouseInHandler.notify(_mouseCord);
    });



    _canvas.addEventListener("mouseout", function (e) {
        if (_msPointerEnabled) { return; };
        // if (!that.mouseFlag) { return; };

        var _evt = e || window.event;
        var _mouseCord = getMouseCord(this, _evt);
        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            ci.mouseoutIvoke(_mouseCord);
        }
        that.canvasMouseOutHandler.notify(_mouseCord);
    });

    _canvas.addEventListener("mousemove", function (e) {
        if (_msPointerEnabled) { return; };
        //if (!that.mouseFlag) { return; };

        var _evt = e || window.event;
        var _mouseCord = getMouseCord(this, _evt);
        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            if (!ci.mousemoveIvoke) { break; }
            if (!ci.renderReady) { continue; }

            var _flag = that.isInCtrl(_mouseCord, ci);
            if (_flag) {
                if (!ci.isMouseIn) {
                    ci.mouseinIvoke(_mouseCord);
                }
                ci.mousemoveIvoke(_mouseCord);
            }
            else {
                if (ci.isMouseIn) {

                    ci.mouseoutIvoke(_mouseCord);
                }
            }
        }
        that.canvasMouseMoveHandler.notify(_mouseCord);
    });
    _canvas.addEventListener("mousedown", function (e) {

        if (_msPointerEnabled) { return; };
        //if (!that.mouseFlag) { return; };
        var _evt = e || window.event;
        var _mouseCord = getMouseCord(this, _evt);
        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            if (ci.isMouseIn) {
                ci.mousedownIvoke(_mouseCord);
            }
        }
        that.canvasMouseDownHandler.notify(_mouseCord);
    });
    _canvas.addEventListener("mouseup", function (e) {

        if (_msPointerEnabled) { return; };
        //if (!that.mouseFlag) { return; };

        var _evt = e || window.event;
        var _mouseCord = getMouseCord(this, _evt);
        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            if (ci.isMouseIn) {
                ci.mouseupIvoke(_mouseCord);
            }
        }
        that.canvasMouseUpHandler.notify(_mouseCord);
    });

    function isTouch(e) {
        if (e.type.toString().indexOf("touch") >= 0) {
            return true;
        }
        else {
            if (e.pointerType && e.pointerType == e.MSPOINTER_TYPE_TOUCH) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    var touchstartHandler = function (e) {

        var _touchCord;
        var _isTouch = isTouch(e);
        if (_isTouch) {
            _touchCord = getTouchCord(_canvas, e);
        }
        else {
            _touchCord = getMouseCord(_canvas, e);
        }
        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            if (!ci.renderReady) { continue; }
            var _flag = that.isInCtrl(_touchCord, ci);
            if (_flag) {
                ci.isMouseIn = true;
                if (_isTouch) {
                    if (ci._touchStartHandler._listeners.length > 0) {
                        ci.touchstartIvoke(_touchCord);
                    }
                    else if (ci._mouseDownHandler._listeners.length > 0) {
                        ci.mousedownIvoke(_touchCord);
                    }
                    else if (ci._mouseInHandler._listeners.length > 0) {
                        ci.mouseinIvoke(_touchCord);
                    }
                    else if (ci._mouseMoveHandler._listeners.length > 0) {
                        ci.mousemoveIvoke(_touchCord);
                    }
                }
                else {
                    if (ci.isMouseIn) {
                        ci.mousedownIvoke(_touchCord);
                    }
                }
            }
        }
        if (_isTouch) {
            //var _flag = false;
            //for (var j = 0, cj; cj = that.hasTouchCtrls[j]; j++) {
            //    if (!cj.renderReady) { continue; }
            //    _flag = that.isInCtrl(cj);
            //    if (_flag) {
            //        break;
            //    }
            //}
            //if (!_flag) {
            that.canvasTouchStartHandler.notify(_touchCord);
            //}

        }
        else {
            that.canvasMouseDownHandler.notify(_touchCord);
        }
    }
    var touchmoveHandler = function (e) {

        var _touchCord;
        var _isTouch = isTouch(e);

        if (_isTouch) {
            _touchCord = getTouchCord(_canvas, e);
        }
        else {
            _touchCord = getMouseCord(_canvas, e);

        }
        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            if (!ci.renderReady) { continue; }
            var _flag = that.isInCtrl(_touchCord, ci);
            if (_flag) {
                if (_isTouch) {
                    if (ci._touchMoveHandler._listeners.length > 0) {
                        ci.touchmoveIvoke(_touchCord);
                    }
                    else if (ci._mouseMoveHandler._listeners.length > 0) {
                        ci.mousemoveIvoke(_touchCord);
                    }
                }
                else {
                    if (!ci.isMouseIn) {
                        ci.mouseinIvoke(_touchCord);
                    }
                    ci.mousemoveIvoke(_touchCord);
                }
            }
            else {
                if (!_isTouch && ci.isMouseIn) {
                    ci.mouseoutIvoke(_touchCord);
                }
            }
        }

        if (_isTouch) {
            that.canvasTouchMoveHandler.notify(_touchCord);
        }
        else {
            that.canvasMouseMoveHandler.notify(_touchCord);
        }
    }
    var touchendHandler = function (e) {

        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            if (!ci.renderReady) { continue; };
            if (ci.isMouseIn) {
                if (ci._touchEndHandler._listeners.length > 0) {
                    ci.touchendIvoke();
                }
                else if (ci._mouseUpHandler._listeners.length > 0) {
                    ci.mouseupIvoke();
                }
                else if (ci._mouseOutHandler._listeners.length > 0) {
                    ci.mouseoutIvoke();
                }
            }
        }
        var _touchCord;
        if (isTouch(e)) {
            _touchCord = getTouchCord(_canvas, e);
            that.canvasTouchEndHandler.notify(_touchCord);
        }
        else {
            _touchCord = getMouseCord(_canvas, e);
            that.canvasMouseUpHandler.notify(_touchCord);
        }
    }

    var touchoutHandler = function (e) {
        var _touchCord;
        var _isTouch = isTouch(e);
        if (_isTouch) {
            _touchCord = getTouchCord(_canvas, e);
        }
        else {
            _touchCord = getMouseCord(_canvas, e);

        }
        for (var i = 0, ci; ci = that.ctrlList[i]; i++) {
            if (!ci.renderReady) { continue; };
            if (ci.isMouseIn) {
                if (_isTouch) {
                    //if (ci._touchEndHandler._listeners.length > 0) {
                    //    ci.touchendIvoke();
                    //}
                    //else if (ci._mouseUpHandler._listeners.length > 0) {
                    //    ci.mouseupIvoke();
                    //}
                    //else if (ci._mouseOutHandler._listeners.length > 0) {
                    //    ci.mouseoutIvoke();
                    //}
                }
                else {
                    ci.mouseoutIvoke();

                }

            }
        }
        if (_isTouch) {
            that.canvasTouchEndHandler.notify(_touchCord);
        }
        else {
            that.canvasMouseOutHandler.notify(_touchCord);
        }

    }


    var _touchStart = "touchstart";
    var _touchMove = "touchmove";
    var _touchEnd = "touchend";
    var _touchOut = "";
    if (_msPointerEnabled) {
        _touchStart = "MSPointerDown";
        _touchMove = "MSPointerMove";
        _touchEnd = "MSPointerUp";
        _touchOut = "MSPointerOut";
    }

    _canvas.addEventListener(_touchStart, touchstartHandler, false);
    _canvas.addEventListener(_touchMove, touchmoveHandler, false);
    _canvas.addEventListener(_touchEnd, touchendHandler, false);

    if (!!_touchOut) {
        _canvas.addEventListener(_touchOut, touchoutHandler, false);
    }


    if (_canvas.offsetParent) {
        _canvas.offsetParent.addEventListener(_touchStart, function (e) {
            var _touchCord = that.processTouchEvent(e);
            that.offsetParentTouchStartHandler.notify(_touchCord);
            e.stopPropagation();
            e.preventDefault();

        }, false);

        _canvas.offsetParent.addEventListener(_touchMove, function (e) {
            var _touchCord = that.processTouchEvent(e);
            that.offsetParentTouchMoveHandler.notify(_touchCord);
            e.stopPropagation();
            e.preventDefault();

        }, false);
        _canvas.offsetParent.addEventListener(_touchEnd, function (e) {
            that.offsetParentTouchEndHandler.notify();
            e.stopPropagation();
            e.preventDefault();

        }, false);
    }


}

canvasWrapper.prototype = function () {
    //animation
    var _listenerHandler = new evtWrapper();
    var _interval;
    var thatWrapper = this;

    //controls
    var baseCtrl = function (wrapper, x, y, w, h, text) {
        this.sx = x;
        this.sy = y;
        this.w = w;
        this.h = h;
        var that = this;
        this.areaScale = 0;




        this.ex = function () { return that.sx + that.w * (1 + that.areaScale) };
        this.ey = function () { return that.sy + that.h * (1 + that.areaScale) };
        this.wrapper = wrapper;
        this._renderHandler = new evtWrapper(this);
        this._mouseInHandler = new evtWrapper(this);
        this._mouseMoveHandler = new evtWrapper(this);
        this._mouseDownHandler = new evtWrapper(this);
        this._mouseUpHandler = new evtWrapper(this);
        this._mouseOutHandler = new evtWrapper(this);
        this._calculateAreaHandler = new evtWrapper(this);
        this._repaintHandler = new evtWrapper(this);
        this._scaleHandler = new evtWrapper(this);
        this._setStartPoint = new evtWrapper(this);
        this._setTLHandler = new evtWrapper(this);
        this._resetHandler = new evtWrapper(this);

        this._touchStartHandler = new evtWrapper(this);
        this._touchMoveHandler = new evtWrapper(this);
        this._touchEndHandler = new evtWrapper(this);
        this.mouseFlag = true;
        this.touchFlag = true;
        this.isMouseIn = false;
        this.fontSize = 0;
        this.renderReady = true;
        this.zIndex = 0;
        this.caption = text ? text : "";
        this.childNodes = [];
        this.left = this.top = this.offsetLeft = this.offsetTop = 0;
    }
    baseCtrl.prototype.addIsInCrtl = function (func) {
        if (typeof func != "function") return;
        this.isInCtrl = func;
    }
    baseCtrl.prototype.setParent = function (ctrl) {
        if (!ctrl) { return; };
        this.parentNode = ctrl;
        if (ctrl.childNodes) {
            ctrl.childNodes.push(this);
            ctrl.childNodes.sort(function (x, y) { return x.zIndex - y.zIndex });
        }
    }
    baseCtrl.prototype.setMouseFlag = function (flag) {
        this.mouseFlag = flag;
    }
    baseCtrl.prototype.setTouchFlag = function (flag) {
        this.touchFlag = flag;
    }
    baseCtrl.prototype.applyResetHandler = function (func) {
        this._resetHandler.attach(func);
    }

    baseCtrl.prototype.reset = function () {
        this._resetHandler.notify();
    }

    //set start point handler after the flow layout
    baseCtrl.prototype.applyStartPointHandler = function (func) {
        this._setStartPoint.attach(func);
    }

    baseCtrl.prototype.setStartPoint = function (x, y) {
        if (this._setStartPoint._listeners.length > 0) {
            this._setStartPoint.notify(x, y);
            return;
        }
        this.sx = x;
        this.sy = y;
    }

    baseCtrl.prototype.applySetLTHandler = function (func) {
        this._setTLHandler.attach(func);
    }

    baseCtrl.prototype.setLT = function (change) {
        this._setTLHandler.notify(change);
    }

    baseCtrl.prototype.move = function (x, y) {
        if (typeof x != "number" || typeof y != "number") { throw "cannot move to that position"; };
        this.sx = x;
        this.sy = y;
        this.left = this.sx - this.parentNode.sx;
        this.top = this.sy - this.parentNode.sy;
    }

    baseCtrl.prototype.setOriginPoint = function (x, y) {
        if (x != undefined && y != undefined) {
            this.ox = x;
            this.oy = y;
        }
    }

    baseCtrl.prototype.registerCoordinate = function (func) {
        if (typeof func != "function") { throw "coorrdinate changing method should be a function"; };
        this.changeCoordinate = func;
    }

    baseCtrl.prototype.getCoordinate = function () {
        if (!this.changeCoordinate) { return { x: 0, y: 0 }; };
        return this.changeCoordinate.apply(this, arguments);

    }

    baseCtrl.prototype.render = function (isHierarchy) {
        if (isHierarchy) {
            this._renderHandler.notify(this.wrapper);
            return;
        }

        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.save();
            this.wrapper.translate(this.ox, this.oy);
        }
        this._renderHandler.notify(this.wrapper);
        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.restore();
        }
    }

    baseCtrl.prototype.resize = function () {
        this._calculateAreaHandler.notify(this.wrapper);
    }

    baseCtrl.prototype.repaint = function () {
        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.save();
            this.wrapper.translate(this.ox, this.oy);
        }
        this._repaintHandler.notify(this.wrapper);
        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.restore();
        }
    }

    baseCtrl.prototype.addScaleHandler = function (func) {
        this._scaleHandler.attach(func)
    }

    baseCtrl.prototype.scale = function (scale) {
        if (!scale) { return; };
        if (typeof this.sx == "number") { this.sx = 0; }
        if (typeof this.sy == "number") { this.sy = 0; }
        this._scaleHandler.notify(scale);
    }

    baseCtrl.prototype.addRenderHandler = function (func) {
        this._renderHandler.attach(func);
    }

    baseCtrl.prototype.addResizeHandler = function (func) {
        this._calculateAreaHandler.attach(func);
    }

    baseCtrl.prototype.addRepaintHandler = function (func) {
        this._repaintHandler.attach(func);
    }

    //mouse in
    baseCtrl.prototype.onmousein = function (func) {
        this._mouseInHandler.attach(func);
    }

    baseCtrl.prototype.mouseinIvoke = function (cord) {
        this.isMouseIn = true;
        this._mouseInHandler.notify(cord);
    }

    //mouse move
    baseCtrl.prototype.onmousemove = function (func) {
        this._mouseMoveHandler.attach(func);
    }

    baseCtrl.prototype.mousemoveIvoke = function (cord) {
        if (!this.mouseFlag) return;
        this._mouseMoveHandler.notify(cord);
    }

    //mouse down
    baseCtrl.prototype.onclick = function (func) {
        this._mouseDownHandler.attach(func);
    }

    baseCtrl.prototype.clickIvoke = function () {
        this._mouseDownHandler.notify();
    }

    baseCtrl.prototype.mousedownIvoke = function (cord) {
        if (!this.mouseFlag) return;
        this._mouseDownHandler.notify(cord);
    }

    //mouse up
    baseCtrl.prototype.onmouseup = function (func) {
        this._mouseUpHandler.attach(func);
    }

    baseCtrl.prototype.mouseupIvoke = function (cord) {
        if (!this.mouseFlag) return;
        this._mouseUpHandler.notify(cord);
    }

    //mouse out
    baseCtrl.prototype.onmouseout = function (func) {
        this._mouseOutHandler.attach(func);
    }

    baseCtrl.prototype.mouseoutIvoke = function (cord) {
        if (!this.mouseFlag) return;
        this._mouseOutHandler.notify(cord);
        this.isMouseIn = false;
    }

    //touch start
    baseCtrl.prototype.ontouchstart = function (func) {
        this._touchStartHandler.attach(func);
    }

    baseCtrl.prototype.touchstartIvoke = function (cord) {
        if (!this.touchFlag) return;
        this.isMouseIn = true;
        this._touchStartHandler.notify(cord);
    }

    //touch move
    baseCtrl.prototype.ontouchmove = function (func) {
        this._touchMoveHandler.attach(func);
    }

    baseCtrl.prototype.touchmoveIvoke = function (cord) {
        if (!this.touchFlag) return;
        this._touchMoveHandler.notify(cord);
    }

    //touch end
    baseCtrl.prototype.ontouchend = function (func) {
        this._touchEndHandler.attach(func);
    }

    baseCtrl.prototype.touchendIvoke = function (cord) {
        if (!this.touchFlag) return;
        this._touchEndHandler.notify(cord);
        this.isMouseIn = false;
    }



    baseCtrl.prototype.setZIndex = function (value) {
        if (typeof value == "number") {
            this.zIndex = value;
            if (this.parentNode) {
                this.parentNode.childNodes.sort(function (x, y) { return x.zIndex - y.zIndex });
            }
        }
    }

    baseCtrl.prototype.setRenderFlag = function (flag) {
        if (typeof flag == "boolean") {
            this.renderReady = flag;
        }
    }

    baseCtrl.prototype.setPosition = function (l, t) {
        this.left = l ? l : 0;
        this.top = t ? t : 0;
    }


    //Button inherited from baseCtrl
    var button = function (wrapper, x, y, w, h, text, color) {
        baseCtrl.apply(this, arguments);
        this.backColor = color;
        var that = this;
        this.ex = function () {
            return that.sx + that.w;
        }

        this.addRenderHandler(function () {
            this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.backColor);
            //this.fontSize = Math.round(this.h * 0.6);
            this.wrapper.writeText(this.sx, this.sy, this.w, this.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);
        });
    }

    inheritPrototype(button, baseCtrl);

    button.prototype.applyFont = function (fontColor, size, family, weight) {
        this.fontColor = fontColor;
        this.fontWeight = weight;
        this.fontSize = size;
        this.fontFamily = family;
    }

    //banner & background
    var banner = function (wrapper, x, y, w, h, color) {
        baseCtrl.call(this, wrapper, x, y, w, h, null, color);
        this.backColor = color;

        this.addRenderHandler(function () {
            if (this.borderState) {
                this.wrapper.drawStrokeRect(this.sx, this.sy, this.w, this.h, this.borderWidth, this.borderColor);

                this.wrapper.drawRect(this.sx + this.borderWidth, this.sy + this.borderWidth, this.w - 2 * this.borderWidth, this.h - 2 * this.borderWidth, this.backColor);
            }
            else {
                this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.backColor);
            }
        });
    }

    inheritPrototype(banner, baseCtrl);
    banner.prototype.applyBorder = function (borderWidth, borderColor) {
        this.borderWidth = borderWidth;
        this.borderColor = borderColor;
    }
    banner.prototype.setBorderState = function (state) {
        this.borderState = !!state;
    }
    //bar
    var bar = function (wrapper, x, y, w, h, text, color) {
        baseCtrl.apply(this, arguments);
        this.backColor = color;
        var that = this;
        this.ex = function () { return that.sx + that.w };
        this.ey = function () { return that.sy - that.h; };
        this.addRenderHandler(function () {
            this.wrapper.drawRect(this.sx, this.sy - this.h, this.w, this.h, this.backColor);
        });
        this.addRepaintHandler(function () {
            this.wrapper.drawRect(this.sx, this.sy - this.h, this.w, this.h, "rgba(0,0,0,0.2)");
        });
    }
    inheritPrototype(bar, baseCtrl);

    bar.prototype.applyFont = function (fontColor, size, family, weight) {
        this.fontColor = fontColor;
        this.weight = weight;
        this.fontSize = size;
        this.family = family;
    }

    //round point
    var point = function (wrapper, x, y, w, h, text, color) {
        baseCtrl.apply(this, arguments);
        this.backColor = color;
        this.r = Math.max(this.w, this.h);
        this.cx = this.sx;
        this.cy = this.sy;
        var that = this;
        this.sx = function () { return that.cx - that.r; };
        this.sy = function () { return that.cy - that.r; };
        this.ex = function () { return that.cx + that.r; };
        this.ey = function () { return that.cy + that.r; };
        this.addRenderHandler(function () {
            this.wrapper.drawArc(this.cx, this.cy, this.r, this.backColor);
        });

    }
    inheritPrototype(point, baseCtrl);

    //push/pin
    var pushPin = function (wrapper, x, y, w, h, text, pushColor, pinColor) {
        baseCtrl.apply(this, arguments);
        this.pushColor = pushColor || "gray";
        this.pinColor = pinColor || "gray";
        this.curColor = this.pushColor;
        this.r = Math.max(this.w, this.h);
        this.cx = this.sx;
        this.cy = this.sy;
        var that = this;
        this.backColor = "RGB(236,236,236)";
        this.lineWidth = 1;
        this.checked = false;
        this.sx = function () { return that.cx - that.r; };
        this.sy = function () { return that.cy - that.r; };;
        this.ex = function () { return that.cx + that.r; };
        this.ey = function () { return that.cy + that.r; };
        this.onclick(function () {
            this.checked = !this.checked;
            this.curColor = this.checked ? this.pinColor : this.pushColor;
            this.clear();
            this.render();
        });

        this.id = new Date().getTime();
        this.caption = text;
        this.addRenderHandler(function () {
            // draw clear area
            if (this.clearRange) {
                this.wrapper.drawRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h, this.backColor);
                this.clearRange = undefined;
            }


            this.wrapper.save();
            this.wrapper.translate(this.cx, this.cy);
            this.wrapper.rotate(45);

            //draw the circle
            this.wrapper.drawArcStroke(0, 0, this.r, this.lineWidth, this.curColor, 0, 1, true);

            //Prepare the rect center
            var _basisX = 0;
            var _basisY = this.r / 6;
            var _rectCore = { x: -_basisX, y: -_basisY };

            //draw the rect
            var _angRct = 2 * Math.PI / 6;
            var _rPercentage = 2.5;
            var _w = Math.abs(this.r / _rPercentage * Math.cos(_angRct)) * 2;
            var _h = Math.abs(this.r / _rPercentage * Math.sin(_angRct)) * 2;
            var _sx = this.r / _rPercentage * Math.cos(Math.PI - _angRct);
            var _sy = -this.r / _rPercentage * Math.sin(_angRct);
            this.wrapper.drawRect(_sx + _rectCore.x, _sy + _rectCore.y, _w, _h, this.curColor);

            //draw the triangle
            var _disPoint = (h - w) / 2;
            var _upPoint = { x: 0, y: -_disPoint };
            var _lowPoint = { x: 0, y: _disPoint };
            this.wrapper.drawTriangle((_upPoint.x + _rectCore.x), (_upPoint.y + _rectCore.y), this.r / 2, Math.PI / 4, this.curColor);
            this.wrapper.drawTriangle((_lowPoint.x + _rectCore.x), (_lowPoint.y + _rectCore.y), this.r / 1.5, -Math.PI / 4, this.curColor);

            //draw the line
            var _tarPoint = { x: _rectCore.x, y: (_rectCore.y + this.r * 0.8) };
            this.wrapper.drawLine(_rectCore.x, _rectCore.y, _tarPoint.x, _tarPoint.y, 2, this.curColor);

            this.wrapper.restore();
        });
    }
    inheritPrototype(pushPin, baseCtrl);
    pushPin.prototype.addToolTip = function () {
        this.toolTip = new toolTip(this.wrapper, this.caption, 100);
    }


    var toolTip = function (wrapper, text, w) {
        this.wrapper = wrapper;
        this.text = text;
        this.w = w;
        // this.create(text, w);
    }
    toolTip.prototype.create = function (text, w) {
        this.Tip = document.createElement("span");
        this.Tip.setAttribute("id", this.id);
        var zIndex = this.wrapper.canvas.style.zIndex + 9999 + 10;
        this.Tip.setAttribute("style", "font-family:Segoe UI,Arial,Verdana,Tahoma,sans-serif;display:block;background-color:#F7F6F9;border:1px solid black;text-align:center;font-size:" + 10 + "px;height:" + 14 + "px;width:" + w + "px;position:absolute;z-index:" + zIndex);

        this.Tip.innerHTML = text;
        document.body.appendChild(this.Tip);
    }
    toolTip.prototype.show = function () {
        if (!this.Tip) {
            this.create(this.text, this.w);
        }
    }
    toolTip.prototype.updateText = function (text) {
        if (this.Tip) {
            this.text = text;
            this.Tip.innerHTML = text;
        }
    }
    toolTip.prototype.setStyle = function (type, value) {
        if (this.Tip) {
            this.Tip.style[type] = value;
        }
    }
    toolTip.prototype.hide = function () {
        if (this.Tip) {
            document.body.removeChild(this.Tip);
            this.Tip = undefined;
        }
    }
    toolTip.prototype.move = function (left, top) {
        if (this.Tip) {
            this.Tip.style["left"] = left + "px";
            this.Tip.style["top"] = top + "px";
        }
    }

    pushPin.prototype.clear = function () {
        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.save();
            this.wrapper.translate(this.ox, this.oy);
        }
        this.clearRange = {
            x: Math.ceil(this.sx() - this.lineWidth)
            , y: Math.ceil(this.sy() - this.lineWidth)
            , w: Math.ceil((this.r + 1) * 2)
            , h: Math.ceil((this.r + 1) * 2)
        }
        this.wrapper.clearRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h);
        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.restore();
        }
    }
    pushPin.prototype.setLineWidth = function (w) {
        this.lineWidth = w;
    }


    var line = function (wrapper, pointlist, color, r) {
        baseCtrl.call(this, 0, 0, 0, 0);
        var _pointList = pointlist ? pointlist : [];
        this.wrapper = wrapper;
        this.points = [];
        this.setR();
        this.backColor = color;
        this.renderReady = true;
        this.zIndex = 0;
        this.renderChildren = true;
        for (var i = 0, ci; ci = _pointList[i]; i++) {
            var _txt = ci[2] != undefined ? ci[2] : "";
            var _p = wrapper.addPoint(ci[0], ci[1], r, _txt, color);
            _p.setRenderFlag(false);
            this.points.push(_p);
        }
    }

    inheritPrototype(line, baseCtrl);

    line.prototype.render = function (isHierarchy) {

        for (var i = 0, ci; ci = this.points[i]; i++) {
            if (!isHierarchy) {
                ci.render();
            }
            if (this.points[i + 1]) {
                var _start = ci;
                var _end = this.points[i + 1];
                if (isHierarchy) {
                    this.wrapper.drawLine(_start.left, _start.top, _end.left, _end.top, this.lineWidth, this.backColor);
                    continue;
                }
                if (this.ox != undefined && this.oy != undefined) {
                    this.wrapper.save();
                    this.wrapper.translate(this.ox, this.oy);
                }
                this.wrapper.drawLine(_start.cx, _start.cy, _end.cx, _end.cy, this.lineWidth, this.backColor);
                if (this.ox != undefined && this.oy != undefined) {
                    this.wrapper.restore();
                }
            }
        }
    }

    line.prototype.setAbsolute = function (flag) {
        this.absolute = flag
        for (var i = 0, ci; ci = this.points[i]; i++) {
            ci.absolute = flag;
        }
    }

    line.prototype.setR = function (value) {
        this.lineWidth = value * 0.6;
        if (!this.points || this.points.length == 0) { return; };
        for (var i = 0, ci; ci = this.points[i]; i++) {
            ci.r = value;
        }
    }

    line.prototype.setZIndex = function (value) {
        if (typeof value == "number") {
            this.zIndex = (value + 1);
            for (var i = 0, ci; ci = this.points[i]; i++) {
                ci.setZIndex(value);
            }
        }
    }

    line.prototype.setOriginPoint = function (x, y) {
        baseCtrl.prototype.setOriginPoint.apply(this, arguments);
        for (var i = 0, ci; ci = this.points[i]; i++) {
            ci.setOriginPoint(x, y);
        }
    }

    line.prototype.setRenderFlagWithPoints = function (flag) {
        this.setRenderFlag(flag);
        for (var i = 0, ci; ci = this.points[i]; i++) {
            ci.setRenderFlag(flag);
        }
    }

    line.prototype.setRenderFlag = function (flag) {
        baseCtrl.prototype.setRenderFlag.call(this, flag);
    }

    line.prototype.setParent = function (ctrl) {
        baseCtrl.prototype.setParent.call(this, ctrl);
        for (var i = 0, ci; ci = this.points[i]; i++) {
            ci.setParent(ctrl);
        }
    }

    var span = function (wrapper, x, y, w, h, text) {
        baseCtrl.apply(this, arguments);
        this.w = w;
        this.h = h;
        var that = this;
        this.ex = function () { return that.sx + this.w + this.h; };
        this.ey = function () { return that.sy + this.h; };
        this.leftCenter = function () { return { x: that.sx + that.h / 2, y: that.sy + that.h / 2 }; };
        this.rectArea = function () { return { x: that.sx + that.h / 2, y: that.sy }; };
        this.rightCenter = function () { return { x: that.sx + that.h / 2 + that.w, y: that.sy + that.h / 2 }; };
        this.addRenderHandler(function () {
            this.wrapper.drawArc(this.leftCenter().x, this.leftCenter().y, this.h / 2, "black", 0, 1, false);
            this.wrapper.drawArc(this.rightCenter().x, this.rightCenter().y, this.h / 2, "black", 0, 1, true);
            this.wrapper.drawRect(this.rectArea().x, this.rectArea().y, this.w, this.h, "black");
            this.wrapper.writeText(this.rectArea().x, this.rectArea().y, this.w, this.h, this.caption, "white", null, "Segoe UI", "bold", "center");

        });
        this.renderReady = true;
    }

    inheritPrototype(span, baseCtrl);

    span.prototype.updateText = function (value) {
        this.caption = value;
    }

    span.prototype.hide = function () {
        this.setRenderFlag(false);
        //this.wrapper.clearRect(this.sx,this.sy,this.w+this.h,this.h);
    }

    span.prototype.show = function () {
        this.hide();
        this.setRenderFlag(true);
        this.render();
    }

    span.prototype.moveTo = function (x, y) {
        this.hide();
        this.move(x, y);
        this.show();
    }

    var checkBox = function (wrapper, x, y, w, h, text, color, flag) {
        baseCtrl.apply(this, arguments);
        this.checked = flag ? flag : true;
        this.backColor = color ? color : "rgb(236,236,236)";
        this.clearRange;
        this._legendHandler = new evtWrapper(this);
        var that = this;
        this.boxLen = function () { return that.h * 0.5 + 15 };
        this.legLen = function () { return that.h * 1.5 + 15 };
        this.textLength = 0;
        this.family = "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
        this.txtStorage = [];
        if (text != undefined) {
            this.addText(text, color);
        }


        var that = this;
        this.len = function () {
            return that.boxLen() + (that._legendHandler._listeners.length > 0 ? that.legLen() : 0) + that.textLength;
        }
        this.ex = function () {
            return that.sx + that.len();
        }
        this.txtColor = color != undefined ? color : "rgb(68,68,68)";
        this.addRenderHandler(function () {
            this.textLength = 0;
            //draw clear area
            if (this.clearRange) {
                this.wrapper.drawRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h, this.backColor);
                this.clearRange = undefined;
            }

            //draw checkbox
            var _x = this.sx + 5.3;
            var _y = this.sy + 0.25 * this.h;
            var _w = _h = this.h * 0.5;
            this.wrapper.drawRect(_x, _y, _w, _h, "white");
            this.wrapper.drawStrokeRect(_x - 1, _y - 1, _w + 2, _h + 2, 1, "rgb(126,126,126)");
            if (this.checked) {
                this.wrapper.drawRect(_x + 0.1 * _w, _y + 0.1 * _h, _w * 0.8, _h * 0.8, "rgb(126,126,126)");
            }
            //drawLegend
            this.drawLegend();

            //draw text
            for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
                var _x = this.ex();
                var _y = this.sy - 1.2;
                var _h = this.h;
                var _fontSize = Math.round(ci.fontsize ? ci.fontsize : this.h * 0.4);
                var _color = ci.color || this.txtColor;
                var _family = ci.family || this.family;
                this.textLength += this.wrapper.writePureText(_x, _y, _h, ci.txt, _color, _fontSize, _family, ci.weight, true);
            }
        });

        this.onclick(function () {
            this.checked = !this.checked;
            this.clear();
            this.render();
        });
    }
    inheritPrototype(checkBox, baseCtrl);

    checkBox.prototype.addText = function (txt, color, fontsize, family, weight, iscenter) {
        this.txtStorage.push({
            txt: txt
            , color: color
            , fontsize: fontsize
            , family: family
            , weight: weight
            , iscenter: iscenter
        });
    }

    checkBox.prototype.eachTxt = function (func) {
        for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
            func.call(this, ci);
        }
    }

    checkBox.prototype.addLegendHandler = function (func) {
        this._legendHandler.attach(func);
    }

    checkBox.prototype.drawLegend = function () {
        var _x = this.sx + this.boxLen();
        var _y = this.sy;
        var _w = this.legLen();
        var _h = this.h;
        this._legendHandler.notify(_x, _y, _w, _h);
    }

    checkBox.prototype.clear = function () {
        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.save();
            this.wrapper.translate(this.ox, this.oy);
        }
        this.clearRange = {
            x: this.sx
            , y: this.sy
            , w: this.len()
            , h: this.h
        }
        this.wrapper.clearRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h);
        if (this.ox != undefined && this.oy != undefined) {
            this.wrapper.restore();
        }
    }

    var lable = function (wrapper, x, y, w, h, color, family) {
        baseCtrl.apply(this, arguments);
        this.txtLen = 0;
        this.txtColor = color || "rgb(68,68,68)";
        this.family = family || "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
        var that = this;
        this.txtStorage = [];
        this.ex = function () { return that.sx + that.txtLen; };
        this.addRenderHandler(function () {
            this.txtLen = 0;
            for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
                var _x = this.ex();
                var _y = this.sy;
                var _h = this.h;
                var _fontSize = ci.fontsize ? ci.fontsize : this.h * 0.4;
                var _color = ci.color || this.txtColor;
                var _family = ci.family || this.family;
                this.txtLen += this.wrapper.writePureText(_x, _y, _h, ci.txt, _color, _fontSize, _family, ci.weight, ci.iscenter);
            }
        });
    }

    inheritPrototype(lable, baseCtrl);
    lable.prototype.addText = function (txt, color, fontsize, family, weight, iscenter) {
        this.txtStorage.push({
            txt: txt
            , color: color
            , fontsize: fontsize
            , family: family
            , weight: weight
            , iscenter: iscenter
        });
    }

    lable.prototype.eachTxt = function (func) {
        for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
            func.call(this, ci);
        }
    }
    var rowlable = function (wrapper, x, y, w, h, color, family) {
        baseCtrl.apply(this, arguments);
        this.txtLen = 0;
        this.txtColor = color || "rgb(68,68,68)";
        this.family = family || "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
        var that = this;
        this.txtStorage = [];
        this.ex = function () { return that.sx + that.txtLen; };
        this.addRenderHandler(function () {
            this.txtLen = 0;
            var _x = this.ex();
            for (var i = 0, ci; ci = this.txtStorage[i]; i++) {

                var _y = this.sy;
                var _h = this.h;
                var _fontSize = ci.fontsize ? ci.fontsize : this.h * 0.4;
                var _color = ci.color || this.txtColor;
                var _family = ci.family || this.family;
                //this.txtLen += this.wrapper.writeText(_x, _y + i * _fontSize, _h, ci.txt, _color, _fontSize, _family, ci.weight, ci.iscenter);
                this.wrapper.writeText(_x, _y + i * _fontSize * 1.2, ci.w, _h, ci.txt, _color, _fontSize, _family, ci.weight, ci.align)
            }
        });
    }

    inheritPrototype(rowlable, baseCtrl);
    rowlable.prototype.addText = function (w, txt, color, fontsize, family, weight, align) {
        align = !!!align ? "center" : align;
        this.txtStorage.push({
            w: w,
            txt: txt
            , color: color
            , fontsize: fontsize
            , family: family
            , weight: weight
            , align: align
        });
    }

    rowlable.prototype.eachTxt = function (func) {
        for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
            func.call(this, ci);
        }
    }

    var axis = function (wrapper, x, y, w, h, color) {
        banner.apply(this, arguments);
        //line position, by persentage
        this.leftAxis = this.rightAxis = true;
        this.axisLines = [0.15, 0.31, 0.47, 0.63, 0.79];
        this.lineColor = "rgb(235,235,235)";
        this.labColor = "rgb(119,119,119)";
        this.isDrawVertical = false;
        this.lenRatio = 0.98;
        this.marginLeftRatio = 0.01;
        this.displayAreaRatio = 0.80;
        var that = this;

        this.addRenderHandler(
            function () {
                var _maginLeft = this.w * this.marginLeftRatio;
                var _length = this.w * this.lenRatio;
                var _fontSize = Math.round(this.h * 5 / 100);
                var _labWidth = this.w / 14;
                var _labHeight = _fontSize + 6;
                for (var i = 0, ci; ci = this.axisLines[i]; i++) {
                    var _x = this.sx + _maginLeft;
                    var _y = this.sy + this.h * ci;
                    //write left
                    if (this.leftCoord && this.leftAxis) {
                        var _tmplabw = this.wrapper.messureText(weight, _fontSize, null, "$" + this.leftCoord[0]).width;
                        var _leftX = _x - _tmplabw / 2;
                        var _leftY = _y - _labHeight;
                        this.wrapper.writeText(_leftX, _leftY, _tmplabw, _labHeight, "$" + this.leftCoord[i], this.labColor, _fontSize, null, "bold", "right");
                    }
                    //write right
                    if (this.rightCoord && this.rightAxis) {
                        var _tmplabw = this.wrapper.messureText(weight, _fontSize, null, "$" + this.rightCoord[0]).width;
                        var _rightX = _x + _length - _tmplabw;
                        var _rightY = _y - _labHeight;
                        this.wrapper.writeText(_rightX, _rightY, _tmplabw, _labHeight, "$" + this.rightCoord[i], this.labColor, _fontSize, null, "bold");
                    }
                    //draw the line
                    this.wrapper.drawStaticLine(_x, Math.floor(_y) + 0.5, _length, 0, 1, this.lineColor);
                }

                if (this.solts && this.labs) {
                    var _ori = this.getOrigin();
                    this.wrapper.save();
                    this.wrapper.translate(_ori.x, this.sy + this.h * Math.max.apply(null, this.axisLines));
                    for (var i = 0, ci; ci = this.solts[i]; i++) {
                        if (this.labs[i] == undefined) { continue; };
                        var _sx = ci.start + 0.3;
                        var _sy = Math.round(2 * _fontSize);
                        var _w = ci.length;
                        var _labFontSize = _fontSize + 0.4;
                        var _h = _labFontSize;
                        var _qts = this.labs[i].substr(0, 2);
                        var _fy = this.labs[i].substr(2);
                        this.wrapper.writeText(_sx, _sy, _w, _h, _qts, "rgb(68,68,68)", _labFontSize, "Segoe UI", "800", "right");
                        this.wrapper.writeText(_sx, _sy, _w, _h, _fy, "rgb(68,68,68)", _labFontSize, "Segoe UI", null, "left");
                        // draw the line
                        if (this.isDrawVertical) {
                            if (i != 0 && i == this.solts.length - 1) {
                                this.wrapper.drawLine(Math.floor(_sx) + 0.5, _sy, Math.floor(_sx) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);
                                this.wrapper.drawLine(Math.floor(_sx + _w) + 0.5, _sy, Math.floor(_sx + _w) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);

                            }
                        }
                    }
                    this.wrapper.restore();
                }
            }
        );
        this.registerCoordinate(function () {
            //var _x = this.w * 0.08;
            //var _y = this.h * Math.max.apply(null, this.axisLines)+1;
            //return { x: _x, y: _y };


            var _x = this.w * (1 - this.marginLeftRatio - this.displayAreaRatio) / 2;
            //added 0.2px to fix blur
            var _y;
            if (!this.originIndex) {
                if (this.leftCoord) {
                    for (var i = 0, ci, len; ci = this.leftCoord[i], len = this.leftCoord.length, i < len; i++) {
                        if (parseFloat(ci) == 0) {
                            _y = this.h * this.axisLines[i];
                            this.originIndex = i;
                        }
                    }
                }
                if (_y == undefined) {
                    var maxline = Math.max.apply(null, this.axisLines);
                    _y = this.h * maxline;
                    for (var i = 0; i < this.axisLines.length; i++) {
                        if (maxline == this.axisLines[i]) {
                            this.originIndex = i;
                            break;
                        }
                    }


                }
            }
            else {
                _y = this.h * this.axisLines[this.originIndex];
            }

            return { x: Math.floor(_x), y: Math.floor(_y) };


        });
    }

    inheritPrototype(axis, banner);

    axis.prototype.applyLabs = function (labs) {
        this.labs = labs
    }
    axis.prototype.applyOrginIndex = function (index) {
        if (typeof index != "number") throw new Error("Incorrect parameter type ");
        if (index >= this.axisLines.length) {
            index = this.axisLines.length - 1;
        }
        else if (index < 0) {
            index = 0;
        }

        this.originIndex = index;
    }
    axis.prototype.applyVerticalLine = function (isDraw) {

        this.isDrawVertical = !!isDraw;
    }
    axis.prototype.calculateCoords = function (max, min, bits) {
        //bits stands for the numbers behind the .
        var _divided = this.axisLines.length - 1;
        var _step = (min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = max + _step * i;
            var _str = tmp.toFixed(bits ? bits : 0);
            _str = parseFloat(_str) == 0 ? "0" : _str;
            if (parseFloat(_str) == 0) {
                if (bits && bits == 1) {
                    _str = "0";
                }
                else {
                    _str = parseFloat(_str).toFixed(bits ? bits : 0);
                }

            }
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }

    axis.prototype.calculateNoBitCoords = function (max, min) {
        var _divided = sub(this.axisLines.length, 1);
        var _step = div(sub(min, max), _divided); //(min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = add(max, mul(_step, i));
            _str = parseFloat(tmp);
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }

    axis.prototype.applyCoordinationLeft = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.leftCoord = _rtn.cords;
        this.leftRange = _rtn.data;
    }

    axis.prototype.applyCoordinationRight = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.rightCoord = _rtn.cords;
        this.rightRange = _rtn.data;
    }

    axis.prototype.applyCoordinationBoth = function (left, right, leftbits, rightbits) {
        this.applyCoordinationLeft(Math.max.apply(null, left), Math.min.apply(null, left), leftbits);
        this.applyCoordinationRight(Math.max.apply(null, right), Math.min.apply(null, right), rightbits);
    }

    axis.prototype.calculateHorizonSolts = function (solts) {
        var _solts = solts ? solts : 1;
        var _soltLength = (this.w * this.displayAreaRatio) / solts;
        this.solts = [];
        for (var i = 0; i < _solts; i++) {

            var _start = i * _soltLength;
            var _end = _start + _soltLength;
            this.solts.push({ start: _start, end: _end, length: _soltLength });
        }
        return this.solts;
    }

    axis.prototype.getOrigin = function () {
        var _rst = this.getCoordinate();
        var _x = this.sx + _rst.x;
        var _y = this.sy + _rst.y;
        return { x: _x, y: _y };
    }

    axis.prototype.applyAxisLines = function (lines) {
        if (Object.prototype.toString.call(lines).toLowerCase() == "[object array]" && lines.length > 1) {
            this.axisLines = lines;
        }
    }

    axis.prototype.applyLineColor = function (linecolor) {
        this.lineColor = linecolor;
    }

    axis.prototype.applyLabColor = function (labcolor) {
        this.labColor = labcolor;
    }

    //Mingli added 
    var axisLeft = function (wrapper, x, y, w, h, color) {
        banner.apply(this, arguments);
        //line position, by persentage
        this.leftAxis = this.rightAxis = true;
        this.axisLines = [0.15, 0.31, 0.47, 0.63, 0.79];
        //this.axisLines = [0.15, 0.31, 0.47, 0.63];
        this.lineColor = "rgb(235,235,235)";
        this.labColor = "rgb(119,119,119)";
        this.fontFamily = "Segoe UI";

        this.isDrawVertical = false;
        this.lenRatio = 0.98;
        this.marginLeftRatio = 0.01;
        this.displayAreaRatio = 0.80;
        var that = this;
        this.addRenderHandler(
            function () {
                var _maginLeft = this.w * this.marginLeftRatio;
                var _length = this.w * this.lenRatio;
                var _fontSize = Math.round(this.h * 5 / 100);
                _fontSize = _fontSize < 7 ? 7 : _fontSize;
                var _labWidth = this.w / 10;
                var _labHeight = _fontSize + 6;
                if (this.solts && this.labs) {
                    var _ori = this.getOrigin();
                    this.wrapper.save();
                    this.wrapper.translate(_ori.x, this.sy + this.h * Math.max.apply(null, this.axisLines));
                    if (!!!this.verticalLinePosition) {
                        this.verticalLinePosition = { start: 1, end: this.solts.length, exclude: [] };
                    }
                    for (var i = 0, ci; ci = this.solts[i]; i++) {
                        if (this.labs[i] == undefined) { continue; };
                        var _sx = ci.start;
                        var _sy = Math.round(2 * _fontSize);
                        var _w = ci.length;
                        var _labFontSize = _fontSize + 0.4;
                        var _h = _labFontSize;
                        var _qts = this.labs[i].substr(0, 2);
                        var _fy = this.labs[i].substr(2);
                        this.wrapper.writeText(Math.floor(_sx) + 0.5, _sy, _w, _h, _qts, this.labColor, _labFontSize, this.fontFamily, "600", "right");
                        this.wrapper.writeText(Math.floor(_sx) + 0.5, _sy, _w, _h, _fy, this.labColor, _labFontSize, this.fontFamily, null, "left");
                        // draw the line
                        if (this.isDrawVerticalLine) {
                            if (i >= this.verticalLinePosition.start && i <= this.verticalLinePosition.end) {
                                if (this.verticalLinePosition.exclude.indexOf(i) < 0) {

                                    if (this.currentBarIndexs && this.currentBarIndexs.indexOf(i) >= 0) {
                                        var tmp = (Math.max.apply(null, this.axisLines)) * this.h;
                                        var rectColor = "RGB(240,240,240)";
                                        if (this.currentBarBackColor) {
                                            rectColor = this.wrapper.createLinearGradient(_sx, _sy, _w - 3, -tmp, this.currentBarBackColor);
                                        }
                                        this.wrapper.drawRect(Math.floor(_sx) + 1.5, _sy, _w - 3, -tmp, rectColor);
                                    }
                                    this.wrapper.drawLine(Math.floor(_sx) + 0.5, _sy, Math.floor(_sx) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);
                                    if (i == this.solts.length - 1) {
                                        this.wrapper.drawLine(Math.floor(_sx + _w) + 0.5, _sy, Math.floor(_sx + _w) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);
                                    }
                                }
                            }
                        }


                    }
                    this.wrapper.restore();
                }
                var maxstr;
                if (this.leftCoord) {
                    var tmplen = 0;
                    this.leftCoord.forEach(function (v, i) {
                        if (v.length > tmplen) {
                            tmplen = v.length;
                            maxstr = v;
                        }
                    });

                }
                for (var i = 0, ci; ci = this.axisLines[i]; i++) {
                    var _x = this.sx + _maginLeft;
                    var _y = this.sy + this.h * ci;
                    //write left
                    if (this.leftCoord && this.leftAxis) {
                        var _tmplabw = this.wrapper.messureText(weight, _fontSize, null, "$" + maxstr).width;
                        var _leftX = _x - _tmplabw / 2;
                        var _leftY = _y - _labHeight;
                        var weight = !this.fontWeight ? "bold" : this.fontWeight;
                        //messureText: function (weight, fontSize, fontFamily, text) {

                        this.wrapper.writeText(_leftX, _leftY, _tmplabw, _labHeight, "$" + this.leftCoord[i], this.labColor, _fontSize, this.fontFamily, weight, "left");
                    }
                    //draw the line
                    this.wrapper.drawStaticLine(_x, Math.floor(_y) + 0.5, _length, 0, 1, this.lineColor);
                }

            }
        );
        this.registerCoordinate(function () {
            //var _x = this.w * 0.08;
            //var _y = this.h * Math.max.apply(null, this.axisLines)+1;
            //return { x: _x, y: _y };
            var _x = this.w * (1 - this.marginLeftRatio - this.displayAreaRatio);
            //added 0.2px to fix blur
            var _y;
            if (!this.originIndex) {

                if (this.leftCoord) {
                    for (var i = 0, ci, len; ci = this.leftCoord[i], len = this.leftCoord.length, i < len; i++) {
                        if (parseFloat(ci) == 0) {
                            _y = this.h * this.axisLines[i];
                            this.originIndex = i;
                        }
                    }
                }
                if (_y == undefined) {
                    var maxline = Math.max.apply(null, this.axisLines);
                    _y = this.h * maxline;
                    for (var i = 0; i < this.axisLines.length; i++) {
                        if (maxline == this.axisLines[i]) {
                            this.originIndex = i;
                            break;
                        }
                    }
                }

            }
            else {
                _y = this.h * this.axisLines[this.originIndex];
            }

            return { x: Math.floor(_x), y: Math.floor(_y) };


        });
    }

    inheritPrototype(axisLeft, banner);

    axisLeft.prototype.applyLabs = function (labs) {
        this.labs = labs
    }

    axisLeft.prototype.applyOrginIndex = function (index) {
        if (typeof index != "number") throw new Error("Incorrect parameter type ");
        if (index >= this.axisLines.length) {
            index = this.axisLines.length - 1;
        }
        else if (index < 0) {
            index = 0;
        }

        this.originIndex = index;
    }

    axisLeft.prototype.applyVerticalLine = function (isDraw) {

        this.isDrawVerticalLine = !!isDraw;
    }

    axisLeft.prototype.applyVLinePosition = function (startPosition, endPosition, exclude) {
        if (typeof endPosition == "undefined" || endPosition == null) {
            endPosition = this.labs ? this.labs.length : Number.MAX_VALUE;
        }
        var ec = [];
        if (Object.prototype.toString.call(exclude).toLowerCase() != "[object array]") {
            if (typeof exclude != "undefined") {
                ec.push(exclude);
            }
        }
        else {
            ec = exclude;
        }
        this.verticalLinePosition = { start: startPosition, end: endPosition, exclude: ec };

    }

    axisLeft.prototype.calculateCoords = function (max, min, bits) {
        //bits stands for the numbers behind the .
        var _divided = this.axisLines.length - 1;
        var _step = (min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = max + _step * i;
            var _str = tmp.toFixed(bits ? bits : 0);
            _str = parseFloat(_str) == 0 ? "0" : _str;
            if (parseFloat(_str) == 0) {
                if (bits && bits == 1) {
                    _str = "0";
                }
                else {
                    _str = parseFloat(_str).toFixed(bits ? bits : 0);
                }

            }
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }

    axisLeft.prototype.calculateNoBitCoords = function (max, min) {
        var _divided = sub(this.axisLines.length, 1);
        var _step = div(sub(min, max), _divided); //(min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = add(max, mul(_step, i));
            _str = parseFloat(tmp);
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }

    axisLeft.prototype.setCurrentBar = function (currentIndexs, color) {
        if (typeof color == "string") {
            color = { 0: color, 1: color };
        }
        this.currentBarBackColor = color;
        var ec = [];
        if (Object.prototype.toString.call(currentIndexs).toLowerCase() != "[object array]") {
            if (typeof currentIndexs != "undefined") {
                ec.push(currentIndexs);
            }
        }
        else {
            ec = currentIndexs;
        }
        this.currentBarIndexs = ec;

    }

    axisLeft.prototype.applyCoordinationLeft = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.leftCoord = _rtn.cords;
        this.leftRange = _rtn.data;
    }

    axisLeft.prototype.applyCoordinationRight = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.rightCoord = _rtn.cords;
        this.rightRange = _rtn.data;
    }

    axisLeft.prototype.applyCoordinationBoth = function (left, right, leftbits, rightbits) {
        this.applyCoordinationLeft(Math.max.apply(null, left), Math.min.apply(null, left), leftbits);
        this.applyCoordinationRight(Math.max.apply(null, right), Math.min.apply(null, right), rightbits);
    }

    axisLeft.prototype.calculateHorizonSolts = function (solts) {
        var _solts = solts ? solts : 1;
        var _soltLength = (this.w * this.displayAreaRatio) / solts;
        this.solts = [];
        for (var i = 0; i < _solts; i++) {

            var _start = i * _soltLength;
            var _end = _start + _soltLength;
            this.solts.push({ start: _start, end: _end, length: _soltLength });
        }
        return this.solts;
    }

    axisLeft.prototype.getOrigin = function () {
        var _rst = this.getCoordinate();
        var _x = this.sx + _rst.x;
        var _y = this.sy + _rst.y;
        return { x: _x, y: _y };
    }

    axisLeft.prototype.applyAxisLines = function (lines) {
        if (Object.prototype.toString.call(lines).toLowerCase() == "[object array]" && lines.length > 1) {
            this.axisLines = lines;
        }
    }

    axisLeft.prototype.applyFont = function (lineColor, labcolor, fontFamily, fontweight) {
        if (!!lineColor) this.lineColor = lineColor;
        if (!!labcolor) this.labColor = labcolor;
        if (!!fontFamily) this.fontFamily = fontFamily;
        if (!!fontweight) this.fontWeight = fontweight;
    }

    axisLeft.prototype.applyLineColor = function (linecolor) {
        this.lineColor = linecolor;
    }

    axisLeft.prototype.applyLabColor = function (labcolor) {
        this.labColor = labcolor;
    }
    //Mingli added a new axis
    var axis2 = function (wrapper, x, y, w, h, color) {
        banner.apply(this, arguments);
        //line position, by persentage
        this.leftAxis = this.rightAxis = true;
        this.axisLines = [0.15, 0.31, 0.47, 0.63, 0.79];
        this.lineColor = "rgb(235,235,235)";
        this.labColor = "rgb(119,119,119)";
        this.fontFamily = "Segoe UI";
        this.isDrawVerticalLine = false;
        this.lenRatio = 0.98;
        this.marginLeftRatio = 0.01;
        this.displayAreaRatio = 0.80;
        var that = this;

        this.addRenderHandler(
            function () {
                var _maginLeft = this.w * this.marginLeftRatio;
                var _length = this.w * this.lenRatio;
                var _fontSize = Math.round(this.h * 5 / 100);
                var _labWidth = this.w / 14;
                var _labHeight = _fontSize + 6;
                var weight = !this.fontWeight ? "bold" : this.fontWeight;


                if (this.solts && this.labs) {
                    if (!!!this.verticalLinePosition) {
                        this.verticalLinePosition = { start: 1, end: this.solts.length, exclude: [] };
                    }
                    var _ori = this.getOrigin();
                    this.wrapper.save();
                    this.wrapper.translate(_ori.x, this.sy + this.h * Math.max.apply(null, this.axisLines));
                    for (var i = 0, ci; ci = this.solts[i]; i++) {
                        if (this.labs[i] == undefined) { continue; };
                        var _sx = ci.start + 0.3;
                        var _sy = Math.round(2 * _fontSize);
                        var _w = ci.length;
                        var _labFontSize = _fontSize + 0.4;
                        var _h = _labFontSize;
                        if (typeof this.labs[i] != "object") {
                            var _qts = this.labs[i].substr(0, 2);
                            var _fy = this.labs[i].substr(2);
                            this.wrapper.writeText(_sx, _sy, _w, _h, _qts, this.labColor, _labFontSize, this.fontFamily, "600", "right");
                            this.wrapper.writeText(_sx, _sy, _w, _h, _fy, this.labColor, _labFontSize, this.fontFamily, null, "left");
                        }
                        else {
                            var _tmpw, _lsx, _lsy;
                            if (!this.axisLabelSolts) { this.calculateHorizonLabelSolts(); }
                            var als = this.axisLabelSolts[i];
                            for (var j = 0, o, len; len = this.labs[i].length, o = this.labs[i][j]; j++) {
                                _tmpw = als[j].length;
                                _lsx = als[j].start
                                _lsy = _sy;
                                var _qts = o.substr(0, 2);
                                var _fy = o.substr(2);
                                this.wrapper.writeText(_lsx, _lsy, _tmpw, _h, _qts, this.labColor, _labFontSize - 1, this.fontFamily, "800", "right");
                                this.wrapper.writeText(_lsx, _lsy, _tmpw, _h, _fy, this.labColor, _labFontSize, this.fontFamily, null, "left");

                            }
                        }
                        // draw the line
                        if (this.isDrawVerticalLine) {
                            if (i >= this.verticalLinePosition.start && i <= this.verticalLinePosition.end) {
                                if (this.verticalLinePosition.exclude.indexOf(i) < 0) {
                                    if (this.currentBarIndexs && this.currentBarIndexs.indexOf(i) >= 0) {
                                        var tmp = (Math.max.apply(null, this.axisLines)) * this.h;
                                        var rectColor = "RGB(240,240,240)";
                                        if (this.currentBarBackColor) {
                                            rectColor = this.wrapper.createLinearGradient(_sx, _sy, _w - 3, -tmp, this.currentBarBackColor);
                                        }
                                        this.wrapper.drawRect(Math.floor(_sx) + 1.5, _sy, _w - 3, -tmp, rectColor);
                                    }
                                    this.wrapper.drawLine(Math.floor(_sx) + 0.5, _sy, Math.floor(_sx) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);
                                    if (i == this.solts.length - 1) {
                                        this.wrapper.drawLine(Math.floor(_sx + _w) + 0.5, _sy, Math.floor(_sx + _w) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);
                                    }
                                }
                            }
                        }

                    }
                    this.wrapper.restore();
                }




                for (var i = 0, ci; ci = this.axisLines[i]; i++) {
                    var _x = this.sx + _maginLeft;
                    var _y = this.sy + this.h * ci;
                    //write left
                    if (this.leftCoord && this.leftAxis) {
                        var _tmplabw = this.wrapper.messureText(weight, _fontSize, this.fontFamily, "$" + this.leftCoord[0]).width;

                        var _leftX = _x - _tmplabw / 2;
                        var _leftY = _y - _labHeight;

                        this.wrapper.writeText(_leftX, _leftY, _tmplabw, _labHeight, "$" + this.leftCoord[i], this.labColor, _fontSize, this.fontFamily, weight, "left");
                    }
                    //write right
                    if (this.rightCoord && this.rightAxis) {
                        var _tmplabw = this.wrapper.messureText(weight, _fontSize, this.fontFamily, "$" + this.rightCoord[0]).width;

                        var _rightX = _x + _length - _tmplabw;
                        var _rightY = _y - _labHeight;
                        this.wrapper.writeText(_rightX, _rightY, _tmplabw, _labHeight, "$" + this.rightCoord[i], this.labColor, _fontSize, this.fontFamily, weight);
                    }
                    //draw the line
                    this.wrapper.drawStaticLine(_x, Math.floor(_y) + 0.5, _length, 0, 1, this.lineColor);
                }


            }
        );
        this.registerCoordinate(function () {
            var _x = this.w * (1 - this.marginLeftRatio - this.displayAreaRatio) / 2;
            //added 0.2px to fix blur
            var _y;
            if (!this.originIndex) {
                if (this.leftCoord) {
                    for (var i = 0, ci, len; ci = this.leftCoord[i], len = this.leftCoord.length, i < len; i++) {
                        if (parseFloat(ci) == 0) {
                            _y = this.h * this.axisLines[i];
                            this.originIndex = i;
                        }
                    }
                }
                if (_y == undefined) {
                    var maxline = Math.max.apply(null, this.axisLines);
                    _y = this.h * maxline;
                    for (var i = 0; i < this.axisLines.length; i++) {
                        if (maxline == this.axisLines[i]) {
                            this.originIndex = i;
                            break;
                        }
                    }
                }
            }
            else {
                _y = this.h * this.axisLines[this.originIndex];
            }

            return { x: Math.floor(_x), y: Math.floor(_y) };


        });
    }
    inheritPrototype(axis2, banner);
    axis2.prototype.calculateHorizonLabelSolts = function () {
        if (this.solts && this.labs) {
            this.axisLabelSolts = [];
            for (var i = 0, ci; ci = this.solts[i]; i++) {
                if (this.labs[i] == undefined) { continue; };
                var _sy = Math.round(1.5 * Math.round(this.h * 5 / 100));
                var _w = ci.length;
                if (typeof this.labs[i] == "object") {
                    var _tmpw = 0;
                    var _unit = 0;
                    var _lsx = 0;
                    var _lsy = 0;
                    var _count = 0;
                    this.axisLabelSolts.push([]);
                    for (var j = 0, o, len; len = this.labs[i].length, o = this.labs[i][j]; j++) {
                        _count = (len + 1) * 2;
                        _unit = _w / _count;
                        _tmpw = Math.round(_unit * (_count - 2) / len);
                        _lsx = ci.start + _unit + _tmpw * j;
                        _lsy = _sy;
                        var _qts = o.substr(0, 2);
                        var _fy = o.substr(2);
                        this.axisLabelSolts[i].push({
                            start: _lsx,
                            end: _lsx + _tmpw,
                            length: _tmpw
                        })
                    }
                }
            }
        }
    }
    axis2.prototype.applyVLinePosition = function (startPosition, endPosition, exclude) {
        if (typeof endPosition == "undefined" || endPosition == null) {
            endPosition = this.labs ? this.labs.length : Number.MAX_VALUE;
        }
        var ec = [];
        if (Object.prototype.toString.call(exclude).toLowerCase() != "[object array]") {
            if (typeof exclude != "undefined") {
                ec.push(exclude);
            }
        }
        else {
            ec = exclude;
        }
        this.verticalLinePosition = { start: startPosition, end: endPosition, exclude: ec };

    }
    axis2.prototype.applyLabs = function (labs) {
        this.labs = labs
    }
    axis2.prototype.applyOrginIndex = function (index) {
        if (typeof index != "number") throw new Error("Incorrect parameter type ");
        if (index >= this.axisLines.length) {
            index = this.axisLines.length - 1;
        }
        else if (index < 0) {
            index = 0;
        }

        this.originIndex = index;
    }
    axis2.prototype.applyVerticalLine = function (isDraw) {

        this.isDrawVerticalLine = !!isDraw;
    }
    axis2.prototype.calculateCoords = function (max, min, bits) {
        //bits stands for the numbers behind the .
        var _divided = this.axisLines.length - 1;
        var _step = (min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = max + _step * i;
            var _str = tmp.toFixed(bits ? bits : 0);
            _str = parseFloat(_str) == 0 ? "0" : _str;
            if (parseFloat(_str) == 0) {
                if (bits && bits == 1) {
                    _str = "0";
                }
                else {
                    _str = parseFloat(_str).toFixed(bits ? bits : 0);
                }

            }
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }
    axis2.prototype.calculateNoBitCoords = function (max, min) {
        var _divided = sub(this.axisLines.length, 1);
        var _step = div(sub(min, max), _divided); //(min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = add(max, mul(_step, i));
            _str = parseFloat(tmp);
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }

    axis2.prototype.setCurrentBar = function (currentIndexs, color) {
        if (typeof color == "string") {
            color = { 0: color, 1: color };
        }
        this.currentBarBackColor = color;
        var ec = [];
        if (Object.prototype.toString.call(currentIndexs).toLowerCase() != "[object array]") {
            if (typeof currentIndexs != "undefined") {
                ec.push(currentIndexs);
            }
        }
        else {
            ec = currentIndexs;
        }
        this.currentBarIndexs = ec;

    }

    axis2.prototype.applyCoordinationLeft = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.leftCoord = _rtn.cords;
        this.leftRange = _rtn.data;
    }

    axis2.prototype.applyCoordinationRight = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.rightCoord = _rtn.cords;
        this.rightRange = _rtn.data;
    }

    axis2.prototype.applyCoordinationBoth = function (left, right, leftbits, rightbits) {
        this.applyCoordinationLeft(Math.max.apply(null, left), Math.min.apply(null, left), leftbits);
        this.applyCoordinationRight(Math.max.apply(null, right), Math.min.apply(null, right), rightbits);
    }

    axis2.prototype.calculateHorizonSolts = function (solts) {
        var _solts = solts ? solts : 1;
        var _soltLength = (this.w * this.displayAreaRatio) / solts;
        this.solts = [];
        for (var i = 0; i < _solts; i++) {

            var _start = i * _soltLength;
            var _end = _start + _soltLength;
            this.solts.push({ start: _start, end: _end, length: _soltLength });
        }
        return this.solts;
    }

    axis2.prototype.getOrigin = function () {
        var _rst = this.getCoordinate();
        var _x = this.sx + _rst.x;
        var _y = this.sy + _rst.y;
        return { x: _x, y: _y };
    }

    axis2.prototype.applyAxisLines = function (lines) {
        if (Object.prototype.toString.call(lines).toLowerCase() == "[object array]" && lines.length > 1) {
            this.axisLines = lines;
        }
    }
    axis2.prototype.applyFont = function (lineColor, labcolor, fontFamily, fontweight) {
        if (!!lineColor) this.lineColor = lineColor;
        if (!!labcolor) this.labColor = labcolor;
        if (!!fontFamily) this.fontFamily = fontFamily;
        if (!!fontweight) this.fontWeight = fontweight;
    }
    axis2.prototype.applyLineColor = function (linecolor) {
        this.lineColor = linecolor;
    }
    axis2.prototype.applyLabColor = function (labcolor) {
        this.labColor = labcolor;
    }

    //Mingli added 
    var axis2Left = function (wrapper, x, y, w, h, color) {
        banner.apply(this, arguments);
        //line position, by persentage
        this.leftAxis = this.rightAxis = true;
        this.axisLines = [0.15, 0.31, 0.47, 0.63, 0.79];
        this.lineColor = "rgb(235,235,235)";
        this.labColor = "rgb(119,119,119)";
        this.fontFamily = "Segoe UI";
        this.isDrawVerticalLine = false;
        this.lenRatio = 0.98;
        this.marginLeftRatio = 0.01;
        this.displayAreaRatio = 0.86;
        var that = this;


        this.addRenderHandler(
            function () {
                var _maginLeft = this.w * this.marginLeftRatio;
                var _length = this.w * this.lenRatio;
                var _fontSize = Math.round(this.h * 5 / 100);
                _fontSize = _fontSize < 7 ? 7 : _fontSize;

                var _labHeight = _fontSize + 6;
                var weight = !this.fontWeight ? "bold" : this.fontWeight;

                if (this.solts && this.labs) {
                    if (!!!this.verticalLinePosition) {
                        this.verticalLinePosition = { start: 1, end: this.solts.length, exclude: [] };
                    }
                    var _ori = this.getOrigin();
                    this.wrapper.save();
                    this.wrapper.translate(_ori.x, this.sy + this.h * Math.max.apply(null, this.axisLines));
                    for (var i = 0, ci; ci = this.solts[i]; i++) {
                        if (this.labs[i] == undefined) { continue; };
                        var _sx = ci.start + 0.3;
                        var _sy = Math.round(2 * _fontSize);
                        var _w = ci.length;
                        var _labFontSize = _fontSize + 0.4;
                        var _h = _labFontSize;
                        if (typeof this.labs[i] != "object") {
                            var _qts = this.labs[i].substr(0, 2);
                            var _fy = this.labs[i].substr(2);
                            this.wrapper.writeText(_sx, _sy, _w, _h, _qts, this.labColor, _labFontSize, this.fontFamily, "600", "right");
                            this.wrapper.writeText(_sx, _sy, _w, _h, _fy, this.labColor, _labFontSize, this.fontFamily, null, "left");
                        }
                        else {
                            var _tmpw, _lsx, _lsy;
                            if (!this.axisLabelSolts) { this.calculateHorizonLabelSolts(); }
                            var als = this.axisLabelSolts[i];
                            for (var j = 0, o, len; len = this.labs[i].length, o = this.labs[i][j]; j++) {
                                _tmpw = als[j].length;
                                _lsx = als[j].start
                                var _fontSize1 = Math.round(this.h * 4 / 100);
                                _lsy = Math.round(2 * _fontSize1);
                                var _qts = o.substr(0, 2);
                                var _fy = o.substr(2);

                                //_fontSize = _fontSize < 7 ? 7 : _fontSize;
                                this.wrapper.writeText(_lsx, _lsy, _tmpw, _h, _qts, this.labColor, _fontSize1, this.fontFamily, "600", "right");
                                this.wrapper.writeText(_lsx, _lsy, _tmpw, _h, _fy, this.labColor, _fontSize1, this.fontFamily, null, "left");

                            }
                        }
                        if (this.isDrawVerticalLine) {
                            if (i >= this.verticalLinePosition.start && i <= this.verticalLinePosition.end) {
                                if (this.verticalLinePosition.exclude.indexOf(i) < 0) {

                                    if (this.currentBarIndexs && this.currentBarIndexs.indexOf(i) >= 0) {
                                        var tmp = (Math.max.apply(null, this.axisLines)) * this.h;
                                        var rectColor = "RGB(240,240,240)";
                                        if (this.currentBarBackColor) {
                                            rectColor = this.wrapper.createLinearGradient(_sx, _sy, _w - 3, -tmp, this.currentBarBackColor);
                                        }
                                        this.wrapper.drawRect(Math.floor(_sx) + 1.5, _sy, _w - 3, -tmp, rectColor);
                                    }
                                    this.wrapper.drawLine(Math.floor(_sx) + 0.5, _sy, Math.floor(_sx) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);
                                    if (i == this.solts.length - 1) {
                                        this.wrapper.drawLine(Math.floor(_sx + _w) + 0.5, _sy, Math.floor(_sx + _w) + 0.5, _sy - this.h * Math.max.apply(null, this.axisLines), 1, this.lineColor);
                                    }
                                }
                            }
                        }
                    }

                    this.wrapper.restore();
                }
                for (var i = 0, ci; ci = this.axisLines[i]; i++) {
                    var _x = this.sx + _maginLeft;
                    var _y = this.sy + this.h * ci;
                    //write left
                    if (this.leftCoord && this.leftAxis) {
                        var _tmplabw = this.wrapper.messureText(weight, _fontSize, this.fontFamily, "$" + this.leftCoord[0]).width;

                        var _leftX = _x - _tmplabw / 2;
                        var _leftY = _y - _labHeight;

                        this.wrapper.writeText(_leftX, _leftY, _tmplabw, _labHeight, "$" + this.leftCoord[i], this.labColor, _fontSize, this.fontFamily, weight, "left");
                    }
                    //draw the line
                    this.wrapper.drawStaticLine(_x, Math.floor(_y) + 0.5, _length, 0, 1, this.lineColor);
                }
            }
        );
        this.registerCoordinate(function () {

            var _x = this.w * (1 - this.marginLeftRatio - this.displayAreaRatio);
            //added 0.2px to fix blur
            var _y;
            if (!this.originIndex) {
                if (this.leftCoord) {
                    for (var i = 0, ci, len; ci = this.leftCoord[i], len = this.leftCoord.length, i < len; i++) {
                        if (parseFloat(ci) == 0) {
                            _y = this.h * this.axisLines[i];
                            this.originIndex = i;
                        }
                    }
                }
                if (_y == undefined) {
                    var maxline = Math.max.apply(null, this.axisLines);
                    _y = this.h * maxline;
                    for (var i = 0; i < this.axisLines.length; i++) {
                        if (maxline == this.axisLines[i]) {
                            this.originIndex = i;
                            break;
                        }
                    }
                }
            }
            else {
                _y = this.h * this.axisLines[this.originIndex];
            }

            return { x: Math.floor(_x), y: Math.floor(_y) };


        });
    }

    inheritPrototype(axis2Left, banner);
    axis2Left.prototype.calculateHorizonLabelSolts = function () {
        if (this.solts && this.labs) {
            this.axisLabelSolts = [];
            for (var i = 0, ci; ci = this.solts[i]; i++) {
                if (this.labs[i] == undefined) { continue; };
                var _sy = Math.round(1.5 * Math.round(this.h * 5 / 100));
                var _w = ci.length;
                if (typeof this.labs[i] == "object") {
                    var _tmpw = 0;
                    var _unit = 0;
                    var _lsx = 0;
                    var _lsy = 0;
                    var _count = 0;
                    this.axisLabelSolts.push([]);
                    for (var j = 0, o, len; len = this.labs[i].length, o = this.labs[i][j]; j++) {
                        _count = (len + 4) * 2;
                        _unit = _w / _count;
                        _tmpw = Math.round(_unit * (_count - 2) / len);
                        _lsx = ci.start + _unit + _tmpw * j;
                        _lsy = _sy;
                        var _qts = o.substr(0, 2);
                        var _fy = o.substr(2);
                        this.axisLabelSolts[i].push({
                            start: _lsx,
                            end: _lsx + _tmpw,
                            length: _tmpw
                        })
                    }
                }
            }
        }
    }
    axis2Left.prototype.applyVLinePosition = function (startPosition, endPosition, exclude) {
        if (typeof endPosition == "undefined") {
            endPosition = this.labs ? this.labs.length : Number.MAX_VALUE;
        }
        var ec = [];
        if (Object.prototype.toString.call(exclude).toLowerCase() != "[object array]") {
            if (typeof exclude != "undefined") {
                ec.push(exclude);
            }
        }
        else {
            ec = exclude;
        }
        this.verticalLinePosition = { start: startPosition, end: endPosition, exclude: ec };

    }
    axis2Left.prototype.applyLabs = function (labs) {
        this.labs = labs
    }

    axis2Left.prototype.setCurrentBar = function (currentIndexs, color) {
        if (typeof color == "string") {
            color = { 0: color, 1: color };
        }
        this.currentBarBackColor = color;
        var ec = [];
        if (Object.prototype.toString.call(currentIndexs).toLowerCase() != "[object array]") {
            if (typeof currentIndexs != "undefined") {
                ec.push(currentIndexs);
            }
        }
        else {
            ec = currentIndexs;
        }
        this.currentBarIndexs = ec;

    }

    axis2Left.prototype.applyOrginIndex = function (index) {
        if (typeof index != "number") throw new Error("Incorrect parameter type ");
        if (index >= this.axisLines.length) {
            index = this.axisLines.length - 1;
        }
        else if (index < 0) {
            index = 0;
        }

        this.originIndex = index;
    }
    axis2Left.prototype.applyVerticalLine = function (isDraw) {

        this.isDrawVerticalLine = !!isDraw;
    }
    axis2Left.prototype.calculateCoords = function (max, min, bits) {
        //bits stands for the numbers behind the .
        var _divided = this.axisLines.length - 1;
        var _step = (min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = max + _step * i;
            var _str = tmp.toFixed(bits ? bits : 0);
            _str = parseFloat(_str) == 0 ? "0" : _str;
            if (parseFloat(_str) == 0) {
                if (bits && bits == 1) {
                    _str = "0";
                }
                else {
                    _str = parseFloat(_str).toFixed(bits ? bits : 0);
                }

            }
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }

    axis2Left.prototype.calculateNoBitCoords = function (max, min) {
        var _divided = sub(this.axisLines.length, 1);
        var _step = div(sub(min, max), _divided); //(min - max) / _divided;
        var _result = [];
        var tmp = 0;
        for (var i = 0; i < _divided + 1; i++) {
            tmp = add(max, mul(_step, i));
            _str = parseFloat(tmp);
            _result.push(_str);
        }
        var _unit = this.h * (Math.max.apply(null, this.axisLines) - Math.min.apply(null, this.axisLines)) / (max - min);
        return { data: { max: max, min: min, unit: _unit }, cords: _result };
    }

    axis2Left.prototype.applyCoordinationLeft = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.leftCoord = _rtn.cords;
        this.leftRange = _rtn.data;
    }

    axis2Left.prototype.applyCoordinationRight = function (max, min, bits) {
        var _rtn;
        if (bits == -1 || bits == undefined || bits == null) {
            _rtn = this.calculateNoBitCoords(max, min);
        }
        else {
            _rtn = this.calculateCoords(max, min, bits);
        }
        this.rightCoord = _rtn.cords;
        this.rightRange = _rtn.data;
    }

    axis2Left.prototype.applyCoordinationBoth = function (left, right, leftbits, rightbits) {
        this.applyCoordinationLeft(Math.max.apply(null, left), Math.min.apply(null, left), leftbits);
        this.applyCoordinationRight(Math.max.apply(null, right), Math.min.apply(null, right), rightbits);
    }

    axis2Left.prototype.calculateHorizonSolts = function (solts) {
        var _solts = solts ? solts : 1;
        var _soltLength = (this.w * this.displayAreaRatio) / solts;
        this.solts = [];
        for (var i = 0; i < _solts; i++) {

            var _start = i * _soltLength;
            var _end = _start + _soltLength;
            this.solts.push({ start: _start, end: _end, length: _soltLength });
        }
        return this.solts;
    }

    axis2Left.prototype.getOrigin = function () {
        var _rst = this.getCoordinate();
        var _x = this.sx + _rst.x;
        var _y = this.sy + _rst.y;
        return { x: _x, y: _y };
    }

    axis2Left.prototype.applyAxisLines = function (lines) {
        if (Object.prototype.toString.call(lines).toLowerCase() == "[object array]" && lines.length > 1) {
            this.axisLines = lines;
        }
    }
    axis2Left.prototype.applyFont = function (lineColor, labcolor, fontFamily, fontweight) {
        if (!!lineColor) this.lineColor = lineColor;
        if (!!labcolor) this.labColor = labcolor;
        if (!!fontFamily) this.fontFamily = fontFamily;
        if (!!fontweight) this.fontWeight = fontweight;
    }

    axis2Left.prototype.applyLineColor = function (linecolor) {
        this.lineColor = linecolor;
    }
    axis2Left.prototype.applyLabColor = function (labcolor) {
        this.labColor = labcolor;
    }
    //Mingli added a arrow


    var arrow = function (wrapper, x, y, w, h, text, color, fontcolor) {
        baseCtrl.apply(this, arguments);
        this.backColor = !color ? "black" : color;
        this.fontColor = !fontcolor ? "white" : fontcolor;
        var that = this;
        this.ex = function () { return that.sx + that.w };
        this.ey = function () { return that.sy - that.h; };
        this.direction = "up";
        this.caption = text;
        this.addRenderHandler(function () {

            var _x1, _y1, _x2, _y2, _x3, _y3, _sx, _sy, _w, _h;
            var bold = "";
            var txtsy;
            if (this.direction == "up") {
                _x1 = this.sx;
                _y1 = this.sy - this.h / 2;
                _x2 = this.sx + this.w / 2;
                _y2 = this.sy - this.h;
                _x3 = this.sx + this.w;
                _y3 = this.sy - this.h / 2;
                _sx = this.sx + this.w / 5;
                _w = this.w * 3 / 5;
                _h = -this.h * 3 / 5;
                _sy = this.sy;
                txtsy = _sy - this.h / 6;
                bold = "bold"
            }
            else if (this.direction == "down") {
                _x1 = this.sx;
                _y1 = this.sy - this.h / 2;
                _x2 = this.sx + this.w / 2;
                _y2 = this.sy;
                _x3 = this.sx + this.w;
                _y3 = this.sy - this.h / 2;

                _sx = this.sx + this.w / 5;
                _sy = this.sy - this.h / 3;
                _w = this.w * 3 / 5;
                _h = -this.h * 3 / 5;
                txtsy = _sy + this.h / 6;
            }
            else if (this.direction = "right") {
                _x1 = this.sx + this.w / 2;
                _y1 = this.sy - this.h;
                _x2 = this.sx + this.w;
                _y2 = this.sy - this.h / 2;
                _x3 = this.sx + this.w / 2;
                _y3 = this.sy;
                _sx = this.sx;
                _w = this.w * 2 / 3;
                _h = this.h / 2;
                _sy = this.sy - this.h * 3 / 4;
                txtsy = _sy;
            }

            this.wrapper.drawFillTriangle(_x1, _y1, _x2, _y2, _x3, _y3, this.backColor);

            this.wrapper.drawRect(_sx, _sy, _w, _h, this.backColor);
            this.wrapper.writeText(_sx, txtsy, _w, _h, this.caption, this.fontColor, this.h / 4, "Segoe UI", bold);
            // x, y, w, h, text, fontColor, size, family, weight, align
            //this.wrapper.drawRect(this.sx, this.sy - this.h, this.w, this.h, "black");
        });
        this.addRepaintHandler(function () {
            //this.wrapper.drawRect(this.sx, this.sy - this.h, this.w, this.h, "rgba(0,0,0,0.2)");
        });
    }
    inheritPrototype(arrow, baseCtrl);
    arrow.prototype.setBackColor = function (color) {
        this.backColor = !color ? "black" : color;
    }
    arrow.prototype.setFontColor = function (color) {
        this.fontColor = !color ? "white" : color;
    }
    arrow.prototype.setDirection = function (direction) {
        this.direction = !direction ? "up" : direction;
    }

    //new animation context
    var animationContext = function (wrapper, fps, clearX, clearY, clearW, clearH) {
        this.wrapper = wrapper;
        this.ready = false;
        this.lastupdated = 0;
        this.fps = fps || 24;
        this.delay = 1000 / this.fps;
        this.clearArea = {
            x: clearX ? clearX : 0
            , y: clearY ? clearY : 0
            , w: clearW ? clearW : wrapper.canvas.w
            , h: clearH ? clearH : wrapper.canvas.h

        }
        this.impactedCtrls = [];
        this.changeList = [];
        this.deactiveHandler = new evtWrapper(this);
        this.scaleHandler = new evtWrapper(this);
        this.clearAreaHandler = new evtWrapper(this);
        this.zoom = 1;
    }

    animationContext.prototype.applyClearArea = function (x, y, w, h) {
        this.clearArea.x = x;
        this.clearArea.y = y;
        this.clearArea.w = w;
        this.clearArea.h = h;
    }

    animationContext.prototype.addClearHandler = function (func) {
        this.clearAreaHandler.attach(func);
    }

    animationContext.prototype.invokeClearHandlers = function () {
        this.clearAreaHandler.notify();
    }

    animationContext.prototype.applyZoom = function (value) {
        this.zoom = value;
    }

    animationContext.prototype.addScaleHandler = function (func) {
        this.scaleHandler.attach(func);
    }

    animationContext.prototype.scale = function () {
        this.scaleHandler.notify(this.zoom);
    }

    animationContext.prototype.render = function () {
        this.scale();
        this.eachImpactedCtrl(function () {
            if (this.renderReady) {
                this.render();
            }
        });
    }

    animationContext.prototype.repaint = function () {
        this.clearRect();
        this.render();
    }

    animationContext.prototype.attachDeactiveHandler = function (func) {
        this.deactiveHandler.attach(func);
    }

    //add a single ctrl to the impacted list
    animationContext.prototype.applyCtrl = function (ctrl) {
        //if (!ctrl instanceof baseCtrl) { return; }
        for (var i = 0, ci; ci = this.impactedCtrls[i]; i++) {
            if (ctrl == ci) {
                return;
            }
        }

        this.impactedCtrls.push(ctrl);
        if (ctrl.applyCtrl) {
            ctrl.applyCtrl.call(ctrl, this.impactedCtrls);
        }
        this.impactedCtrls.sort(function (x, y) { return x.zIndex - y.zIndex; });
    }

    //add multiple ctrls to impacted list
    animationContext.prototype.applyCtrls = function () {
        var _ctrls = [].slice.apply(arguments);
        for (var i = 0, ci; ci = _ctrls[i]; i++) {
            this.applyCtrl(ci);
        }
    }

    //clone ctrls from existing context
    animationContext.prototype.cloneImpactedControls = function (from) {
        if (!(from instanceof animationContext)) { throw "invalid clone format" }
        this.clearArea = from.clearArea;
        var _this = this;
        from.eachImpactedCtrl(function () {
            _this.applyCtrl(this);
        });
    }

    //clear context area
    animationContext.prototype.clearRect = function () {
        this.wrapper.clearRect(this.clearArea.x, this.clearArea.y, this.clearArea.w, this.clearArea.h);
    }

    //for each item in change list
    animationContext.prototype.eachChangeItem = function (func) {
        for (var i = 0, ci; ci = this.changeList[i]; i++) {
            func.apply(ci);
        }
    }

    //for each item in impacted list
    animationContext.prototype.eachImpactedCtrl = function (func) {
        for (var i = 0, ci; ci = this.impactedCtrls[i]; i++) {
            func.apply(ci);
        }
    }

    animationContext.prototype.active = function () {
        this.ready = true;
    }

    animationContext.prototype.deactive = function () {
        this.ready = false;
    }

    animationContext.prototype.reset = function () {
        this.eachChangeItem(function () {
            this.reset();
        });
        this.deactive();
    }

    animationContext.prototype.resetOnlyStatus = function () {
        this.eachChangeItem(function () {
            this.resetOnlyStatus();
        });
        this.deactive();
    }

    animationContext.prototype.restart = function () {
        this.reset();
        this.active();
    }

    animationContext.prototype.update = function () {
        //get time
        var now = (new Date()).getTime();
        if ((now - this.lastupdated) > this.delay) {
            var _flag = true;

            //check all change item status
            for (var i = 0, ci; ci = this.changeList[i]; i++) {
                _flag = _flag && ci.completed;
                if (!_flag) { break; };
            }

            //if all change item has finished their behaviors, do the completion handler
            if (_flag) {
                this.deactive();
                this.deactiveHandler.notify(this.changeList, this.impactedCtrls);
                return;
            }

            //if not all change items have finished their behaviors,
            //1. draw all ctrls first
            //2. continue to update all change items and get their new status

            //repaint the area
            this.repaint();

            //Get all change item status
            var that = this;
            this.eachChangeItem(function () {
                if (this.completed) { return; }
                this.update();
            });

            //save the update time
            this.lastUpdated = now;
        }
    }

    animationContext.prototype.freshOriginal = function () {
        this.eachChangeItem(function () {
            this.freshOriginal();
        });
    }

    animationContext.prototype.logChanges = function (ctrl, target, wait, duration) {
        var that = this;
        var searchImpacted = function (ctrl) {
            for (var i = 0, ci; ci = that.impactedCtrls[i]; i++) {
                if (ci == ctrl) {
                    return true;
                }
            }
            return false;
        }
        for (var i in target) {
            if (ctrl[i] != undefined) {
                if (typeof ctrl[i] == "number") {
                    if (!searchImpacted(ctrl)) {
                        this.applyCtrl(ctrl);
                    }
                    var _tracker = undefined;
                    var _attribute = i;
                    for (var j = 0, ci; ci = this.changeList[j]; j++) {
                        if (ci.ctrl == ctrl && ci.attribute == _attribute) {
                            _tracker = ci;
                            break;
                        }
                    }

                    if (_tracker) {
                        _tracker.addBehavior(target[_attribute], wait, duration);
                        continue;
                    };

                    _tracker = new changeItem(this.fps, ctrl, _attribute, duration);
                    _tracker.addBehavior(target[_attribute], wait);
                    this.changeList.push(_tracker);
                }
            }
        }
    }

    animationContext.prototype.setFirstRange = function (value) {
        if (this.changeList.length == 0) { throw "the first change item has not been detected" };
        var _item = this.changeList[0];
        _item.setFirstRange(value);
    }

    var changeBehavior = function (item, range, wait, duration) {
        if (!item) { throw "a change item should be specified" };
        if (range == undefined) { throw "change target is invalid" };
        this.item = item;
        this.target = this.originalTar = range;
        var _frms = duration ? duration * item.default.FPS : item.default.frmCount;
        var _step = range / _frms;
        var _wait = wait ? wait : 0;
        this.frames = _frms;

        //once resetted, these attribute needs to be dealed with
        this.curFrm = 0;
        this.curwait = wait;

        this.step = this.originalStep = _step;
        this.waitCount = wait;

        this.snapshot = undefined;
        this.completed = false;
    }

    changeBehavior.prototype.reset = function () {
        this.curFrm = 0;
        this.curwait = this.waitCount;
        this.target = this.originalTar;
        this.step = this.originalStep;
        this.completed = false;
        this.snapshot = undefined;
    }

    changeBehavior.prototype.update = function () {
        //process snapshot
        if (this.snapshot == undefined) {
            this.snapshot = this.item.getTrackerValue();
        }

        if (this.curwait > 0) {
            this.curwait--;
            return
        }
        var _value;
        if (this.curFrm == this.frames - 1) {


            if (this.fixTarget != undefined) {
                _value = this.fixTarget;
            }
            else if (this.snapshot == undefined) {
                _value = this.item.default.original + this.target;
            }
            else {
                _value = this.snapshot + this.target;
            }

            //_value = Math.floor(_value);
            //if(this.item.ctrl.id=="c3"){
            //console.log("========================");
            //console.log(this.fixTarget!=undefined?"x":"y",_value);
            //}
            this.item.setTrackerValue(_value);
            this.completed = true;
            if (this.item.ctrl.setLT) {
                this.item.ctrl.setLT(_value, this.completed);
            }
            return;
        }

        _value = this.item.getTrackerValue() + this.step;
        this.item.setTrackerValue(_value);
        if (this.item.ctrl.setLT) {
            this.item.ctrl.setLT(_value, this.completed);
        }
        this.curFrm++;
    }

    changeBehavior.prototype.setRange = function (value, fixTarget) {
        //3 kind of reset range here
        //1. the button, only reset the target.
        //2. the bar and line, they start from y=0
        //3. the wave, static move range but need to reset snapshot and remaining distance
        if (!value) {
            //this means there is no change to the target, 
            //so the current move state and remaining distance can be kept
            //just reset the snapshot to let the animation get the latest updated state
            this.target = this.originalTar - this.step * this.curFrm;
            this.fixTarget = fixTarget;
            this.snapshot = undefined;
            return;
        }

        this.target = this.originalTar = value;
        this.originalStep = value / this.frames;
        this.step = this.originalStep;
        this.target = this.originalTar - this.step * this.curFrm;
        this.fixTarget = fixTarget;
        this.snapshot = undefined;
    }


    var changeItem = function (fps, ctrl, attribute, defaultDuration) {
        if (!ctrl || !attribute) { throw "ctronl or attribute is invalid" }
        if (ctrl[attribute] == undefined) { throw "the control doesn't have an attribute " + attribute; };
        this.ctrl = ctrl;
        this.attribute = attribute;
        var _duration = defaultDuration ? defaultDuration : 1;

        var _frms = _duration * fps;
        this.default = {
            original: ctrl[attribute]
            , FPS: fps
            , frmCount: _frms
        };
        this.sences = [];
        this.completed = false;
    }

    changeItem.prototype.setFirstRange = function (value, changeTarget) {
        if (this.sences.length == 0) { throw "the first change behavior has not been detected" };
        var _behavior = this.sences[0];

        _behavior.setRange(value, changeTarget);
    }

    changeItem.prototype.freshOriginal = function () {
        this.default.original = this.ctrl[this.attribute];
    }

    changeItem.prototype.setOriginal = function () {
        this.ctrl[this.attribute] = this.default.original;
    }

    changeItem.prototype.reset = function () {
        //reset everything include the original status
        this.setOriginal();
        this.ctrl.reset();
        this.eachBehavior(function () {
            this.reset();
        });
        this.completed = false;
    }

    changeItem.prototype.resetOnlyStatus = function () {
        //reset only status but will keep current ctrl status
        this.freshOriginal();
        this.ctrl.reset();
        this.eachBehavior(function () {
            this.reset();
        });
        this.completed = false;
    }

    changeItem.prototype.eachBehavior = function (func) {
        for (var i = 0, ci; ci = this.sences[i]; i++) {
            func.apply(ci);
        }
    }

    changeItem.prototype.getTrackerValue = function () {
        return this.ctrl[this.attribute];
    }

    changeItem.prototype.setTrackerValue = function (value) {
        this.ctrl[this.attribute] = value;
    }

    changeItem.prototype.addBehavior = function (range, wait, duration) {
        var _temp = new changeBehavior(this, range, wait, duration);
        this.sences.push(_temp);
    }

    changeItem.prototype.update = function () {
        this.getCompletionStatus();
        for (var i = 0, ci; ci = this.sences[i]; i++) {
            if (ci.completed) {
                continue;
            }
            ci.update();
            break;
        }
    }

    changeItem.prototype.getCompletionStatus = function () {
        for (var i = 0, ci; ci = this.sences[i]; i++) {
            if (!ci.completed) { this.completed = false; return; };
        }
        this.completed = true;
        //recalculate mouse in area
    }
    return {
        cloneCanvasAttribute: function (tempWrapper) {
            if (!tempWrapper instanceof canvasWrapper) { throw "the wrapper format is invalid"; };
            this.canvas.style.left = tempWrapper.canvas.offsetLeft + "px";
            this.canvas.style.top = tempWrapper.canvas.offsetTop + "px";
            this.canvas.width = tempWrapper.canvas.width;
            this.canvas.height = tempWrapper.canvas.height;
            this.canvas.style.position = "absolute";
        }
        , getCanvasSize: function () {
            return { w: this.canvas.width, h: this.canvas.height };
        }
		, getBaseCtrlObj: function () {
		    var _baseCtrl = new baseCtrl();
		    return _baseCtrl;
		}
        , getCtrlHierarchy: function (ctrl) {
            var t = 0;
            var l = 0;
            while (ctrl) {
                t += ctrl.offsetTop;
                l += ctrl.offsetLeft;
                ctrl = ctrl.parentNode
            }
            return { x: l, y: t };
        }
        , isInCtrl: function (cord, ctrl) {
            var _sx, _sy, _ex, _ey, area;
            if (!ctrl) return false;
            if (ctrl.isInCtrl) {
                return ctrl.isInCtrl.apply(ctrl, [cord]);
            }
            else {
                _sx = (typeof ctrl.sx == "function" ? ctrl.sx() : ctrl.sx);
                _sy = (typeof ctrl.sy == "function" ? ctrl.sy() : ctrl.sy);
                _ex = (typeof ctrl.ex == "function" ? ctrl.ex() : ctrl.ex);
                _ey = (typeof ctrl.ey == "function" ? ctrl.ey() : ctrl.ey);
            }
            var _cordX = cord.x - (ctrl.ox != undefined ? ctrl.ox : 0);
            var _cordY = cord.y - (ctrl.oy != undefined ? ctrl.oy : 0);
            var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
            var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
            return !(_x || _y);
        }
        , registerAnimation: function () {
            var that = this;
            this.addListenerEvent(function () {
                for (var i = 0, ci; ci = that.animationList[i]; i++) {
                    if (ci.ready) {
                        ci.update();
                    }
                }
            });
        }
        , autoStart: function () {
            this.registerAnimation();
            this.startListener();
        }
        , addMouseMoveListener: function (func) {
            this.canvasMouseMoveHandler.attach(func);
        }
        , addMouseDownListener: function (func) {
            this.canvasMouseDownHandler.attach(func);
        }
        , addMouseUpListener: function (func) {
            this.canvasMouseUpHandler.attach(func);
        }
        , addTouchStartListener: function (func) {
            this.canvasTouchStartHandler.attach(func);
        }
        , addTouchMoveListener: function (func) {
            this.canvasTouchMoveHandler.attach(func);
        }
        , addTouchEndListener: function (func) {
            this.canvasTouchEndHandler.attach(func);
        }
        , addMouseInListener: function (func) {
            this.canvasMouseInHandler.attach(func);
        }
        , addMouseOutListener: function (func) {
            this.canvasMouseOutHandler.attach(func);
        }
        , processTouchEvent: function (e) {

            var _evt = e || window.event;
            //_evt.preventDefault();


            var _x = _evt.pageX;
            var _y = _evt.pageY;
            if (_evt.targetTouches) {
                _x = _evt.targetTouches[0].pageX;
                _y = _evt.targetTouches[0].pageY;
            }
            return { x: _x, y: _y };



            //var _evt = e || window.event;
            //_evt.preventDefault();
            //return { x: _evt.pageX || _evt.targetTouches[0].pageX, y: _evt.pageY || _evt.targetTouches[0].pageY }
        }
        , addCanvasTouchListeners: function (startHandler, moveHandler, endHander) {
            if (startHandler) {
                this.canvasTouchStartHandler.attach(startHandler);
            }
            if (moveHandler) {
                this.canvasTouchMoveHandler.attach(moveHandler);
            }
            if (endHander) {
                this.canvasTouchEndHandler.attach(endHander);
            }
        }
        , addCanvasOffsetTouchMoveListener: function (startHandler, moveHandler, endHander) {
            if (startHandler) {
                this.offsetParentTouchStartHandler.attach(startHandler);
            }
            if (moveHandler) {
                this.offsetParentTouchMoveHandler.attach(moveHandler);
            }
            if (endHander) {
                this.offsetParentTouchEndHandler.attach(endHander);
            }
        }
        , addBodyTouchMoveListener: function (startHandler, moveHandler, endHander) {
            if (startHandler) {
                this.bodyTouchStartHandler.attach(startHandler);
            }
            if (moveHandler) {
                this.bodyTouchMoveHandler.attach(moveHandler);
            }
            if (endHander) {
                this.bodyTouchEndHandler.attach(endHander);
            }
        }
        , append: function (parent) {
            if (!parent) { return; }
            var _parentNode = typeof parent == "string" ? document.getElementById(parent) : parent;
            _parentNode.appendChild(this.canvas);
        }
        , addListenerEvent: function (func) {
            _listenerHandler.attach(func);
        }
        , startListener: function () {
            if (window.requestAnimationFrame) {
                this.startListener = function () {
                    this.stopListener();
                    (function () {
                        _listenerHandler.notify();
                        _interval = window.requestAnimationFrame(arguments.callee);
                    })();
                }
            }
            else {
                this.startListener = function () {
                    this.stopListener();
                    _interval = setInterval(function () {
                        _listenerHandler.notify();
                    }, 12);
                }
            }
            this.startListener();
        }
        , stopListener: function () {
            if (window.requestAnimationFrame) {
                this.stopListener = function () {
                    window.cancelAnimationFrame(_interval);
                }
            }
            else {
                this.stopListener = function () {
                    clearInterval(_interval);
                }
            }
            this.stopListener();
        }
        , clearRect: function (x, y, w, h) {
            var _x = x ? x : 0;
            var _y = y ? y : 0;
            var _w = w ? w : this.canvas.getAttribute("width");
            var _h = h ? h : this.canvas.getAttribute("height");
            this.ctx.clearRect(_x, _y, _w, _h);
        }
        , save: function () {
            var _c = this.ctx;
            _c.save();
        }
        , translate: function (x, y) {
            var _c = this.ctx;
            _c.translate(x, y);
        }
        , rotate: function (angle) {
            if (typeof angle != "number") { throw "rotate angle should be a number" };
            var _c = this.ctx;
            _c.rotate(angle / 180 * Math.PI);
        }
        , restore: function () {
            var _c = this.ctx;
            _c.restore();
            return this;
        }
        , messureText: function (weight, fontSize, fontFamily, text) {
            var _c = this.ctx;
            _c.save();
            var _weight = weight ? (weight + " ") : "";
            var _fontSize = (fontSize ? fontSize : 9) + "px ";
            _c.font = _weight + _fontSize + fontFamily;
            var _length = _c.measureText(text);
            _c.restore();
            return _length;
        }
        , createLinearGradient: function (sx, sy, ex, ey, gradientData) {
            //Gradient Data format
            /****
            {
                0:"rgb(255,255,255)"
                ,1:"rgb(0,0,0)"
            }
            ****/
            var _c = this.ctx;
            var lg = _c.createLinearGradient(sx, sy, ex, ey);
            for (var i in gradientData) {
                lg.addColorStop(i, gradientData[i]);
            }
            return lg;
        }
        , drawFillTriangle: function (x1, y1, x2, y2, x3, y3, color) {
            var _c = this.ctx;
            _c.save();
            var _ox = Math.min.apply(this, [x1, x2, x3]);
            var _oy = Math.min.apply(this, [y1, y2, y3]);
            _c.translate(_ox, _oy);
            _c.beginPath()
            _c.moveTo(x1 - _ox, y1 - _oy);
            _c.lineTo(x2 - _ox, y2 - _oy);
            _c.lineTo(x3 - _ox, y3 - _oy);
            _c.closePath();
            _c.fillStyle = color;
            _c.fill();
            _c.restore();
        }
        , drawRect: function (x, y, w, h, color) {
            var _c = this.ctx;
            _c.save();
            _c.translate(x, y);
            _c.fillStyle = color ? color : "gray";
            _c.fillRect(0, 0, w, h);
            _c.restore();
        }
        , drawStrokeRect: function (x, y, w, h, lineWidth, color) {
            var _c = this.ctx;
            _c.save();
            _c.translate(x, y);
            _c.lineWidth = lineWidth ? lineWidth : 1;
            _c.strokeStyle = color ? color : "gray";
            _c.strokeRect(0, 0, w, h);
            _c.restore();
        }
        , drawTriangle: function (cx, cy, r, angle, color) {
            var _c = this.ctx;
            _c.save();
            _c.translate(cx, cy);
            var _p0 = { x: 0, y: 0 };
            var _p1 = { x: r * Math.cos(angle), y: -r * Math.sin(angle) };
            var _p2 = { x: -_p1.x, y: _p1.y };
            _c.fillStyle = color ? color : "gray";
            _c.beginPath();
            _c.moveTo(_p0.x, _p0.y);
            _c.lineTo(_p1.x, _p1.y);
            _c.lineTo(_p2.x, _p2.y);
            _c.closePath();
            _c.fill();
            _c.restore();
        }
        , drawArcStroke: function (cx, cy, r, lineWidth, color, startPosition, range, clockwise) {
            var _c = this.ctx;
            _c.save();
            _c.translate(cx, cy);
            _c.lineWidth = lineWidth ? lineWidth : 1;
            _c.strokeStyle = color ? color : "gray";
            var _startPosition = Math.PI * 2 * (startPosition || 0);
            var _range = Math.PI * 2 * (range || 1);
            var _clockwise = !!clockwise ? clockwise : false;
            _c.beginPath();
            _c.arc(0, 0, r, _startPosition, _range, _clockwise);
            _c.closePath();
            _c.stroke();
            _c.restore();
        }
        , drawArcNoCloseStroke: function (cx, cy, r, lineWidth, color, startPosition, range, clockwise) {
            var _c = this.ctx;
            _c.save();
            _c.translate(cx, cy);
            _c.lineWidth = lineWidth ? lineWidth : 1;
            _c.strokeStyle = color ? color : "gray";
            var _startPosition = Math.PI * 2 * (startPosition || 0);
            var _range = Math.PI * 2 * (range || 1);
            var _clockwise = !!clockwise ? clockwise : false;
            _c.beginPath();
            _c.arc(0, 0, r, _startPosition, _range, _clockwise);
            _c.stroke();
            _c.closePath();

            _c.restore();
        }
        , drawArcStrokeShadow: function (cx, cy, r, lineWidth, color, startPosition, range, clockwise) {
            var _c = this.ctx;

            _c.save();
            _c.translate(cx, cy);
            _c.shadowColor = "black";
            _c.shadowBlur = 2;
            _c.shadowOffsetX = 1;
            _c.shadowOffsetY = 2;
            _c.lineWidth = lineWidth ? lineWidth : 1;
            _c.strokeStyle = color ? color : "gray";
            var _startPosition = Math.PI * 2 * (startPosition || 0);
            var _range = Math.PI * 2 * (range || 1);
            var _clockwise = !!clockwise ? clockwise : false;
            _c.beginPath();
            _c.arc(0, 0, r, _startPosition, _range, _clockwise);
            _c.stroke();
            _c.closePath();
            _c.restore();
        }
		, drawArc: function (cx, cy, r, color, startPosition, range, clockwise, lineWidth) {
		    var _c = this.ctx;
		    _c.save();
		    _c.translate(cx, cy);
		    _c.fillStyle = color ? color : "gray";
		    var _startPosition = Math.PI * 2 * (startPosition || 0);
		    var _range = Math.PI * 2 * (range || 1);
		    var _clockwise = clockwise ? clockwise : true;
		    _c.lineWidth = lineWidth ? lineWidth : 1;
		    _c.beginPath();
		    _c.arc(0, 0, r, _startPosition, _range, _clockwise);
		    _c.closePath();
		    _c.fill();
		    _c.restore();
		}
        , drawLine: function (sx, sy, ex, ey, lineWidth, color) {
            this.drawStaticLine(sx, sy, ex - sx, ey - sy, lineWidth, color);
        }
        , drawStaticLine: function (sx, sy, w, h, lineWidth, color) {
            var _c = this.ctx;
            _c.save();
            _c.translate(sx, sy);
            _c.lineWidth = lineWidth ? lineWidth : 5;
            _c.strokeStyle = color ? color : "gray";
            _c.beginPath();
            _c.moveTo(0, 0);
            _c.lineTo(w, h);
            _c.closePath();
            _c.stroke();
            _c.restore();
        }
        , writeText: function (x, y, w, h, text, fontColor, size, family, weight, align) {
            var _c = this.ctx;
            _c.save();
            _c.translate(x, y);
            var _color = fontColor || "black";
            var _weight = weight || "";
            var _size = size || Math.round(h * 0.6);
            var _family = family || "'Segoe UI','Segoe UI Light', Tahoma, Arial, Verdana, sans-serif";
            var _font = _weight + " " + _size + "px " + _family;
            _c.font = _font;
            _c.textAlign = align ? align : 'center';
            _c.textBaseline = 'middle';
            _c.fillStyle = _color;
            var _left = w / 2;
            var _top = h / 2;
            _c.fillText(text, _left, _top);
            _c.restore();
        }
        , writePureText: function (x, y, h, text, fontColor, size, family, weight, align) {
            var _c = this.ctx;
            _c.save();
            _c.translate(x, y);
            var _color = fontColor || "black";
            var _weight = weight || "";
            var _size = size || Math.round(h * 0.6);
            var _family = family || "'Segoe UI Light', 'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
            var _font = _weight + " " + _size + "px " + _family;
            _c.font = _font;
            _c.textBaseline = 'middle';
            _c.fillStyle = _color;
            var _top = (align ? (h / 2) : 0);
            _c.fillText(text, 0, _top);
            _c.restore();
            return this.messureText(_weight, _size, _family, text).width;
        }
        , createToolTip: function (text, w) {
            return new toolTip(this, text, w);
        }
        , addButton: function (x, y, w, h, text, color, parentCtrl) {
            var _btn = new button(this, x, y, w, h, text, color);
            _btn.setZIndex(6);
            _btn.setParent(parentCtrl);
            this.ctrlList.push(_btn);
            return _btn;
        }
        , addBanner: function (x, y, w, h, color, parentCtrl) {
            var _banner = new banner(this, x, y, w, h, color);
            _banner.setParent(parentCtrl);
            this.ctrlList.push(_banner);
            return _banner;
        }
        , addBar: function (x, y, w, h, text, color, parentCtrl) {
            var _bar = new bar(this, x, y, w, h, text, color);
            _bar.setZIndex(6);
            _bar.setParent(parentCtrl);
            this.ctrlList.push(_bar);
            return _bar;
        }
		, addArrow: function (x, y, w, h, text, color, parentCtrl) {
		    var _arrow = new arrow(this, x, y, w, h, text, color);

		    _arrow.setParent(parentCtrl);
		    this.ctrlList.push(_arrow);
		    return _arrow;
		}
        , addPushPin: function (x, y, r, text, pushColor, pinColor, parentCtrl) {
            var _pushPin = new pushPin(this, x, y, r, r, text, pushColor, pinColor);
            _pushPin.setParent(parentCtrl);
            this.ctrlList.push(_pushPin);
            return _pushPin;
        }
        , addPoint: function (x, y, r, text, color, parentCtrl) {
            var _point = new point(this, x, y, r, r, text, color);
            _point.setParent(parentCtrl);
            this.ctrlList.push(_point);
            return _point;
        }
        , addLine: function (pointlist, color, r, parentCtrl) {
            var _line = new line(this, pointlist, color, r);
            _line.setZIndex(9);
            _line.setParent(parentCtrl);
            this.ctrlList.push(_line);
            return _line;
        }
        , addSpan: function (x, y, w, h, text, parentCtrl) {
            var _span = new span(this, x, y, w, h, text);
            _span.setParent(parentCtrl);
            this.ctrlList.push(_span);
            return _span;
        }
        , addCheckBox: function (x, y, w, h, text, color, parentCtrl) {
            var _check = new checkBox(this, x, y, w, h, text, color);
            _check.setParent(parentCtrl);
            this.ctrlList.push(_check);
            return _check;
        }
        , addLable: function (x, y, w, h, color, family, parentCtrl) {
            var _lable = new lable(this, x, y, w, h, color, family);
            _lable.setParent(parentCtrl);
            this.ctrlList.push(_lable);
            return _lable;
        }
        , addRowLable: function (x, y, w, h, color, family, parentCtrl) {
            var _lable = new rowlable(this, x, y, w, h, color, family);
            _lable.setParent(parentCtrl);
            this.ctrlList.push(_lable);
            return _lable;
        }
        , addAxis: function (x, y, w, h, color, parentCtrl) {
            var _axis = new axis(this, x, y, w, h, color);

            _axis.setParent(parentCtrl);
            this.ctrlList.push(_axis);
            return _axis;

        }
        , addAxisLeftCoord: function (x, y, w, h, color, parentCtrl) {
            var _axis = new axisLeft(this, x, y, w, h, color);
            _axis.setParent(parentCtrl);
            this.ctrlList.push(_axis);
            return _axis;
        }
        , addAxis2LeftCoord: function (x, y, w, h, color, parentCtrl) {
            var _axis = new axis2Left(this, x, y, w, h, color);
            _axis.setParent(parentCtrl);
            this.ctrlList.push(_axis);
            return _axis;
        }
        , addAxis2: function (x, y, w, h, color, parentCtrl) {
            var _axis = new axis2(this, x, y, w, h, color);

            _axis.setParent(parentCtrl);
            this.ctrlList.push(_axis);
            return _axis;

        }
        , addAnimation: function (fps, clearX, clearY, clearW, clearH) {
            var _animation = new animationContext(this, fps, clearX, clearY, clearW, clearH);
            this.animationList.push(_animation);
            return _animation;
        }
        , render: function () {
            this.ctrlList.sort(function (x, y) { return x.zIndex - y.zIndex });
            for (var i = 0, ci; ci = this.ctrlList[i]; i++) {
                if (ci.renderReady) {
                    ci.render();
                }
            }
        }
        , addScaleHandler: function (func) {
            this.scaleCallBack.attach(func);
        }
        , renderByHierarchy: function (scale) {
            for (var i = 0, ci; ci = this.ctrlList[i]; i++) {
                if (!ci.parentNode && ci.childNodes && ci.childNodes.length > 0) {
                    if (ci.renderReady) {
                        ci.scale(scale);
                        this.save();
                        this.translate(ci.left, ci.top);
                        ci.render(1);
                        ci.offsetLeft = ci.left;
                        ci.offsetTop = ci.top;
                        this.restore();

                        (function (ci, x, y) {
                            this.save();
                            this.translate(x, y);//start from 0,0
                            if (ci.changeCoordinate) {
                                var _r = ci.getCoordinate();
                                this.save();
                                this.translate(_r.x, _r.y);
                            }


                            var _pointer = new pointer(ci.w, ci.h, this);
                            var _restoreFlag = false;
                            for (var j = 0, di; di = ci.childNodes[j]; j++) {



                                di.scale(scale);
                                //translate to margin
                                this.save();
                                if (di.absolute) {
                                    this.translate(di.left - _pointer.x, di.top - _pointer.y);//translate back
                                }
                                else {
                                    this.translate(di.left, di.top);
                                }
                                //render the ctrl
                                if (di.renderReady) {

                                    di.render(1);
                                }
                                di.offsetLeft = di.absolute ? di.left : (_pointer.x + di.left);
                                di.offsetTop = di.absolute ? di.top : (_pointer.y + di.top);
                                var _pos = this.getCtrlHierarchy(di);
                                di.setStartPoint(_pos.x, _pos.y);
                                //go back margin
                                this.restore();
                                //restore the canvas which was last updated on the previous item
                                //if current control is the first one, do not restore
                                if (_restoreFlag && !di.absolute) {
                                    _pointer.restore();
                                    _restoreFlag = false;
                                };

                                //now the coordination is back to current ctrl start point
                                //give the margin numbers to the fix childnodes position
                                if (di.childNodes && di.childNodes.length > 0) {
                                    arguments.callee.call(this, di, di.offsetLeft, di.offsetTop);
                                }

                                if (di.absolute) { continue; }
                                if (!di.renderReady) { continue; }

                                if (di.float) {
                                    _pointer.moveLeft(di);
                                }
                                else {
                                    _pointer.moveDown(di);
                                }
                                _restoreFlag = true

                            }
                            if (_restoreFlag) {
                                _pointer.restore();
                                _restoreFlag = false;
                            };

                            if (ci.changeCoordinate) {
                                this.restore();
                            }
                            this.restore();
                        }).call(this, ci, ci.left, ci.top);
                        //process the animation scales
                        for (var i = 0, ci; ci = this.animationList[i]; i++) {
                            ci.invokeClearHandlers(scale);
                        }
                        //delegation of scaling as the call back
                        this.scaleCallBack.notify(scale);
                    }
                }
            }
        }
    }
}();