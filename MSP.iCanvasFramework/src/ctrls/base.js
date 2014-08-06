define(function (require) {
    var CONS = require("../framework/const"),
        evtWrapper = require("../tools/observer"),
        tools = require("../tools/canvas_util"),
        pointer = require("../tools/pointer");

    //base ctrl
    var ctrl = function (wrapper, w, h, l, t, c, txt) {

        this.applyWrapper(wrapper);
        this.applyWH(w, h);

        this.applyMargin(l, t);

        this.applyColor(c);

        this.applyTxt(txt);

        this._renderHandler = new evtWrapper(this);

        this.childNodes = [];

        this.renderReady = true;

        //Bind events
        //this.Handlers = new evtCollection(this);

        this.Handlers = new evtWrapper(this);

    }
    ctrl.prototype.CONS = CONS;
    ctrl.prototype.onRender = function (func) {
        //this._renderHandler.attach(func);
        this.Handlers.attach("render", func);
    }
    //render ctrl
    ctrl.prototype.render = function (x, y) {
        if (!this.wrapper) { return; }
        //this._renderHandler.notify(x, y);
        this.Handlers.notifyByKey(render, x, y);
        this.X = x;
        this.Y = y;
    }
    ctrl.prototype.applyWH = function (w, h) {
        this.w = w;
        this.h = h;
    }
    ctrl.prototype.applyMargin = function (l, t) {
        this.l = l;
        this.t = t;
    }
    //color management
    ctrl.prototype.applyColor = function (c) {
        this.c = c;
    }
    ctrl.prototype.applyFontColor = function (c) {
        this.fontColor = c;
    }
    //attach wrapper
    ctrl.prototype.applyWrapper = function (wrapper) {
        this.wrapper = wrapper;
    }
    //text management
    ctrl.prototype.applyTxt = function (txt) {
        this.txt = txt;
    }
    ctrl.prototype.applyFontSize = function (size) {
        this.fontSize = size == undefined ? Config.TXT.DefaultFontSize : size;
    }
    ctrl.prototype.setZ = function (value) {
        this.zIndex = value;
    }
    //deal with position & Float
    ctrl.prototype.setPosition = function (value) {
        var _v = CONS.POSITION[value.toUpperCase()];
        if (_v !== undefined) {
            this.position = _v;
        }
    }
    ctrl.prototype.setFloat = function (value) {
        var _v = CONS.FLOAT[value.toUpperCase()];
        if (_v !== undefined) {
            this.float = _v;
        }
    }
    //deal with parent/children hierachy
    ctrl.prototype.appendChild = function (tempCtrl) {
        if (!this.childNodes) {
            this.childNodes = [tempCtrl];
        }
        else {
            this.childNodes.push(tempCtrl);
        }
        tempCtrl.parentNode = this;
    }
    ctrl.prototype.setParent = function (tempCtrl) {
        tempCtrl.appendChild(this);
    }
    //caculate self width/height/length
    ctrl.prototype.caculateSelf = function () {
        var _W = this.parentNode ? Number(tools.matchNum(this.parentNode.W).v) : Number(tools.matchNum(this.wrapper.w).v);
        var _H = this.parentNode ? Number(tools.matchNum(this.parentNode.H).v) : Number(tools.matchNum(this.wrapper.h).v);
        var _h = tools.getVolume(this.h, _H);
        var _w = tools.getVolume(this.w, _W);
        var _l = tools.getVolume(this.l, _W);
        var _t = tools.getVolume(this.t, _H);
        this.W = _w;
        this.H = _h;
        this.L = _l;
        this.T = _t;
        return {
            w: _w
            , h: _h
            , l: _l
            , t: _t
        }
    }
    //render all
    ctrl.prototype.renderAll = function (x, y) {
        //在此的render参数为绝对值，非相对
        var _pointer = new pointer(x, y);
        this.render(x, y)
        var _h = this.H;
        var _w = this.W;
        for (var i = 0, ci; ci = this.childNodes[i]; i++) {
            //abosulute elements, start from the every beginning of the parent node
            //and current node will not impact the layout
            if (ci.position == CONS.POSITION.ABSOLUTE) {
                ci.renderAll(_pointer.sx + this.L, _pointer.sy + this.T);
                continue;
            }
            //otherwise, render based on element positions
            //float left
            if (ci.float == CONS.FLOAT.LEFT) {
                //validae width
                var _wh = _pointer.getChanges(ci);

                if (_pointer.cx + _wh.x <= _w) {
                    //width not exceeded, render all
                    ci.renderAll(_pointer.cx, _pointer.cy);
                    _pointer.mx(ci);
                    continue;
                }
            }
            //skip to another line
            //currently, 2 situations will be handled here
            //1. no float element
            //2. insufficient width
            _pointer.nextLine();
            _pointer.move(this.L, i == 0 ? this.T : 0);
            ci.renderAll(_pointer.cx, _pointer.cy);
            _pointer.mx(ci);

        }
    }

});