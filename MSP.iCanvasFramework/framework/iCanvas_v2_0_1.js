var iCanvas = function () {
    /**************************** Section Start *******************************
       Private assets  
   ***************************************************************************/
    var _timer;
    var _animationList = [];
    var canvasInstance;

    /**************************** Section End *********************************/

    /**************************** Section Start *******************************
        Tools Section
        This section contains all available tools for use.   
    ***************************************************************************/
    var Tools = {
        getOffSet: function (e) {
            //get the absolute position of an element from the top left corner
            var t = e.offsetTop;
            var l = e.offsetLeft;
            while (e = e.offsetParent) {
                t += e.offsetTop;
                l += e.offsetLeft;
            }
            return { dx: l, dy: t };
        }
        , getMouseCord: function (sender, evt) {
            //get Mouse position
            var _offset = getOffSet(sender);
            var _xfix = _offset.dx;
            var _yfix = _offset.dy;
            return evt.pageX || evt.pageY ? { x: evt.pageX - _xfix, y: evt.pageY - _yfix, e: evt } : {
                x: evt.clientX + document.body.scrollLeft - _xfix,
                y: evt.clientY + document.body.scrollTop - _yfix,
                e: evt
            };
        }
        , getTouchCord: function (sender, evt) {
            //get touch position
            var _evt = evt || window.event;
            var _x = _evt.pageX;
            var _y = _evt.pageY;
            if (_evt.targetTouches && _evt.targetTouches.length > 0) {
                _x = _evt.targetTouches[0].pageX;
                _y = _evt.targetTouches[0].pageY;
            }
            var cord = { x: _x, y: _y };
            var _offset = getOffSet(sender);
            var _xfix = _offset.dx;
            var _yfix = _offset.dy;
            return { x: cord.x - _xfix, y: cord.y - _yfix, e: _evt };
        }
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
    /**************************** Section End *********************************/

    /**************************** Section Start *******************************
        Event Wrapper Section
        In this action there is the definition of evtWrapper, which is a self 
        defined event class that handles all customized event according to the
        observer design pattern.
    ***************************************************************************/
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
    /**************************** Section End *********************************/

    /**************************** Section Start *******************************
       The canvas wrapper, which is the most important object in the framework
    ***************************************************************************/
    //Canvas Wrapper
    var canvasWrapper = function () {
        //ctrl indexes
        this.idMap = {};
        this.typeMap = {};
        this.rootCtrl = null;

        /********************
        ** mouse and touch switch
        ** Default value is true. 
        ** Once turned off, the wrapper will not response to mouse or tough event
        ********************/
        this.mouseFlag = true;
        this.touchFlag = true;

        /*Put canvas event handlers here*/

    }

    canvasWrapper.prototype.applyCanvas = function (canvasId) {
        var _canvas = document.getElementById(canvasId);
        this.type = _canvas ? "existed" : "created";
        this.canvas = _canvas ? _canvas : document.createElement("CANVAS");
        this.ctx = this.canvas.getContext("2d");
        return this;
    }

    canvasWrapper.prototype.setCanvasSize = function (width, height) {
        if (!this.canvas) { throw "no available canvas" }
        this.wh = { w: (this.type == "existed") ? _canvas.width : (width ? width : 400), h: (this.type == "existed") ? _canvas.height : (height ? height : 300) };
        if (this.type != "existed") {
            this.canvas.width = this.wh.w;
            this.canvas.height = this.wh.h;
        }
        return this;
    }


    /**************************** Section End *********************************/

    /**************************** Section Start ********************************
      Contrl definations
    ****************************************************************************/
    var baseCtrl = function (wrapper, w, h, text) {
        /*Put base contrl information here*/
        this.w = w;
        this.h = h;
        var that = this;
        this.areaScale = 0;
        this.wrapper = wrapper;
        this.sx = 0;
        this.sy = 0;
        this.ex = function () { return that.sx + that.w * (1 + that.areaScale) };
        this.ey = function () { return that.sy + that.h * (1 + that.areaScale) };
        this.parentNode = null;
        this.fontSize = 0;
        this.renderReady = true;
        this.Index = 0;
        this.caption = text ? text : "";
        this.left = this.top = this.offsetLeft = this.offsetTop = 0;
        this.margin = { top: 0, left: 0, right: 0 };
        this.float = "none";
        this.childNodes = [];
        this.leftMargin = 0;
        this.rightMargin = w;
        this.topMargin = 0;
        this.topBegin = 0;
        this.position = { absolute: false, top: 0, left: 0 };

        this._renderHandler = new evtWrapper(this);
        this._mouseDownHandler = new evtWrapper(this);
    }
    baseCtrl.prototype.setParent = function (ctrl) {
        if (!ctrl) { return; };
        this.parentNode = ctrl;
        if (ctrl.childNodes) {
            ctrl.childNodes.push(this);
            ctrl.childNodes.sort(function (x, y) { return x.zIndex - y.zIndex });
        }
    }
    baseCtrl.prototype.addRenderHandler = function (func) {
        this._renderHandler.attach(func);
    }
    baseCtrl.prototype.setIndex = function (value) {
        if (typeof value == "number") {
            this.Index = value;
            if (this.parentNode) {
                this.parentNode.childNodes.sort(function (x, y) { return x.Index - y.Index });
            }
        }
    }
    baseCtrl.prototype.setMargin = function (value) {
        if (value.left)
            this.margin.left = value.left;
        if (value.right)
            this.margin.right = value.right;
        if (value.top)
            this.margin.top = value.top;
    }
    baseCtrl.prototype.setPosition = function (value) {
        this.position = value;
    }
    baseCtrl.prototype.render = function () {
        this._renderHandler.notify(this.wrapper);
       
        this.rightMargin = this.ex();
        this.topBegin = this.sy;
        this.leftMargin = this.sx;
        for (var i = 0, ci; ci = this.childNodes[i]; i++) {
            if (ci.renderReady==false) {
                continue;
            }
            if (ci.w < 1) {
                ci.w = this.w * ci.w;
            }
            if (ci.h < 1) {
                ci.h = this.h * ci.h;
            }
            if (ci.margin.top>0&&ci.margin.top<1) {
                ci.margin.top = ci.margin.top * this.h;
            }
            if (ci.margin.left > 0 && ci.margin.left < 1) {
                ci.margin.left = ci.margin.left * this.w;
            }
            if (ci.margin.right > 0 && ci.margin.right < 1) {
                ci.margin.right = ci.margin.right * this.w;
            }
            if (ci.position.absolute == true) {
                ci.sx = this.sx + ci.position.left;
                ci.sy = this.sy + ci.position.top;
                ci.render();
                continue;
            }
            if (ci.float == "right") {
                ci.sx = this.rightMargin - ci.margin.right - ci.w;
                this.rightMargin = ci.sx - ci.margin.left;
                ci.sy = this.topBegin + ci.margin.top;
                if (this.rightMargin < this.leftMargin) {
                    this.leftMargin = this.sx;
                    this.rightMargin = this.ex() - ci.w - ci.margin.left - ci.margin.right;
                    this.topBegin = this.topMargin;
                    ci.sx = this.ex() - ci.w - ci.margin.right;
                    ci.sy = this.topBegin + ci.margin.top;
                }
            }
            else {
                if (ci.float == "none") {
                    ci.sx = this.sx + ci.margin.left;
                }
                else {
                    ci.sx = this.leftMargin + ci.margin.left;
                }
                this.leftMargin = ci.ex() + ci.margin.right;
                ci.sy = this.topBegin + ci.margin.top;
                if (ci.ex() > this.rightMargin || (ci.float == "none" && ci.sx - ci.margin.left != this.leftMargin)) {
                    this.leftMargin = this.sx + ci.w + ci.margin.left + ci.margin.right;
                    this.rightMargin = this.ex();
                    this.topBegin = this.topMargin;
                    ci.sy = this.topBegin + ci.margin.top;
                    ci.sx = this.sx + ci.margin.left;
                }
            }

            this.topMargin = this.topMargin > ci.ey() ? this.topMargin : ci.ey();

            ci.render();
        }
    }
    baseCtrl.prototype.setRenderFlag = function (flag) {
        if (typeof flag == "boolean") {
            this.renderReady = flag;
        }
    }
    //mouse down
    baseCtrl.prototype.onclick = function (func) {
        this._mouseDownHandler.attach(func);
    }

    //Button inherited from baseCtrl
    var button = function (wrapper, w, h, text, color) {
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
    var banner = function (wrapper, w, h, color, x, y) {
        baseCtrl.call(this, wrapper, w, h, null, color);
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
    var bar = function (wrapper, w, h, text, color) {
        baseCtrl.apply(this, arguments);
        this.backColor = color;
        var that = this;
        this.ex = function () { return that.sx + that.w };
        this.ey = function () { return that.sy - that.h; };
        this.addRenderHandler(function () {
            this.wrapper.drawRect(this.sx, this.sy - this.h, this.w, this.h, this.backColor);
            this.wrapper.writeText(this.sx, this.sy - this.h, this.w, this.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);
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
    var point = function (wrapper, w, h, text, color) {
        baseCtrl.apply(this, arguments);
        this.backColor = color;
        this.r = w / 2;
        var that = this;

        this.addRenderHandler(function () {
            this.wrapper.drawArc(this.sx+this.r, this.sy+this.r, this.r, this.backColor);
        });

    }
    inheritPrototype(point, baseCtrl);

    //push/pin
    var pushPin = function (wrapper, w, h, text, pushColor, pinColor) {
        baseCtrl.apply(this, arguments);
        this.pushColor = pushColor || "gray";
        this.pinColor = pinColor || "gray";
        this.curColor = this.pushColor;
        this.r = w / 2;       
        var that = this;
        this.backColor = "RGB(236,236,236)";
        this.lineWidth = 1;
        this.checked = false;
        this.cx = this.sx;
        this.cy = this.sy;
        this.id = new Date().getTime();
        this.caption = text;
        this.addRenderHandler(function () {
            // draw clear area
            if (this.clearRange) {
                this.wrapper.drawRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h, this.backColor);
                this.clearRange = undefined;
            }


            this.wrapper.save();
            this.wrapper.translate(this.sx + this.r, this.sy + this.r);
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
            this.wrapper.save();
            this.wrapper.translate(this.cx, this.cy);
           // console.log(this.cx);
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

        //this.clearRange = {
        //    x: Math.ceil(this.sx - this.lineWidth)
        //    , y: Math.ceil(this.sy - this.lineWidth)
        //    , w: Math.ceil((this.r + 1) * 2)
        //    , h: Math.ceil((this.r + 1) * 2)
        //}
        //this.wrapper.clearRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h);
        this.setRenderFlag(false);
    }
    pushPin.prototype.setLineWidth = function (w) {
        this.lineWidth = w;
    }

    var line = function (wrapper, pointlist, color, r) {
        baseCtrl.call(this, 0, 0, 0, 0);
        var _pointList = pointlist ? pointlist : [];
        this.wrapper = wrapper;
        this.points = [];
        this.pointsX = [];
        this.pointsY = [];
        this.setR();
        this.backColor = color;
        this.renderReady = true;
        this.zIndex = 0;
        this.renderChildren = true;
        for (var i = 0, ci; ci = _pointList[i]; i++) {
            this.points.push(_p);
            this.pointsX.push(ci[0]);
            this.pointsY.push(ci[1]);
        }
        var minX = Math.min.apply(null,this.pointsX),
            maxX = Math.max.apply(null,this.pointsX),
            minY = Math.min.apply(null,this.pointsY),
            maxY = Math.max.apply(null,this.pointsY);
        this.w = maxX - minX;
        this.h = maxY - minY;
        this.ox = minx;
        this.oy = minY;
        var movex = this.ox - this.sx,
            moveY = this.oy - this.sy;

        for (var j = 0, cj; cj = _pointList[j]; j++) {
            cj[0] = cj[0] - movex;
            cj[1] = cj[1] - moveY;
           // var _txt = cj[2] != undefined ? cj[2] : "";
          //  var _p = wrapper.addPoint(cj[0], cj[1], r, _txt, color);
        //    _p.setRenderFlag(false);
         //   this.points.push(_p);
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
            }
        }
    }

    var span = function (wrapper, w, h, text) {
        baseCtrl.apply(this, arguments);
        this.w = w;
        this.h = h;
        var that = this;
        this.leftCenter = function () { return { x: that.sx + that.h / 2, y: that.sy + that.h / 2 }; };
        this.rectArea = function () { return { x: that.sx + that.h / 2, y: that.sy,w:that.w-that.h }; };
        this.rightCenter = function () { return { x: that.sx+that.w - that.h / 2, y: that.sy + that.h / 2 }; };
        this.addRenderHandler(function () {
            this.wrapper.drawArc(this.leftCenter().x, this.leftCenter().y, this.h / 2, "black", 0, 1, false);
            this.wrapper.drawArc(this.rightCenter().x, this.rightCenter().y, this.h / 2, "black", 0, 1, true);
            this.wrapper.drawRect(this.rectArea().x, this.rectArea().y, this.rectArea().w, this.h, "black");
            this.wrapper.writeText(this.rectArea().x, this.rectArea().y, this.rectArea().w, this.h, this.caption, "white", null, "Segoe UI", "bold", "center");

        });
        this.renderReady = true;
    }

    inheritPrototype(span, baseCtrl);

    span.prototype.updateText = function (value) {
        this.caption = value;
    }
    span.prototype.hide = function () {
        this.setRenderFlag(false);
    }

    span.prototype.show = function () {
        this.hide();
        this.setRenderFlag(true);
        this.render();
    }

    var checkBox = function (wrapper, w, h, text, color, flag) {
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
        this.eex = function () {
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
                var _x = this.eex();
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
            console.log(this.checked)
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
        this.setRenderFlag(false);
    }
  
    var lable = function (wrapper, w, h, color, family) {
        baseCtrl.apply(this, arguments);
        this.txtLen = 0;
        this.txtColor = color || "rgb(68,68,68)";
        this.family = family || "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
        var that = this;
        this.txtStorage = [];
        this.eex = function () { return that.sx + that.txtLen; };
        this.addRenderHandler(function () {
            this.txtLen = 0;
            for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
                var _x = this.eex();
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

    var rowlable = function (wrapper, w, h, color, family) {
        baseCtrl.apply(this, arguments);
        this.txtLen = 0;
        this.txtColor = color || "rgb(68,68,68)";
        this.family = family || "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
        var that = this;
        this.txtStorage = [];
        this.eex = function () { return that.sx + that.txtLen; };
        this.addRenderHandler(function () {
            this.txtLen = 0;
            var _x = this.eex();
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

    var arrow = function (wrapper, w, h, text, color, fontcolor) {
        baseCtrl.apply(this, arguments);
        this.backColor = !color ? "black" : color;
        this.fontColor = !fontcolor ? "white" : fontcolor;
        var that = this;
        this.direction = "up";
        this.caption = text;
        this.addRenderHandler(function () {

            var _x1, _y1, _x2, _y2, _x3, _y3, _sx, _sy, _w, _h;
            var bold = "";
            var txtsy;
            if (this.direction == "up") {
                _x1 = this.sx;
                _y1 = this.sy + this.h / 2;
                _x2 = this.sx + this.w / 2;
                _y2 = this.sy;
                _x3 = this.sx + this.w;
                _y3 = this.sy + this.h / 2;
                _sx = this.sx + this.w / 5;
                _w = this.w * 3 / 5;
                _h = this.h * 3 / 5;
                _sy = this.sy+this.h*2/5;
                txtsy = _sy + this.h / 6;
                bold = "bold"
            }
            else if (this.direction == "down") {
                _x1 = this.sx;
                _y1 = this.sy + this.h / 2;
                _x2 = this.sx + this.w / 2;
                _y2 = this.sy+this.h;
                _x3 = this.sx + this.w;
                _y3 = this.sy + this.h / 2;

                _sx = this.sx + this.w / 5;
                _sy = this.sy;
                _w = this.w * 3 / 5;
                _h = this.h * 3 / 5;
                txtsy = _sy + this.h / 6;
            }
            else if (this.direction == "right") {
                _x1 = this.sx + this.w / 2;
                _y1 = this.sy;
                _x2 = this.sx + this.w;
                _y2 = this.sy + this.h / 2;
                _x3 = this.sx + this.w / 2;
                _y3 = this.sy+this.h;
                _sx = this.sx;
                _w = this.w * 2 / 3;
                _h = this.h / 2;
                _sy = this.sy + this.h * 1 / 4;
                txtsy = _sy;
            } else if (this.direction == "left") {
                _x1 = this.sx + this.w / 2;
                _y1 = this.sy;
                _x2 = this.sx + this.w / 2;
                _y2 = this.sy + this.h;
                _x3 = this.sx;
                _y3 = this.sy + this.h / 2;
                _sx = this.sx+this.w / 3;
                _w = this.w * 2 / 3;
                _h = this.h / 2;
                _sy = this.sy + this.h * 1 / 4;
                txtsy = _sy;
            }

            this.wrapper.drawFillTriangle(_x1, _y1, _x2, _y2, _x3, _y3, this.backColor);

            this.wrapper.drawRect(_sx, _sy, _w, _h, this.backColor);
            this.wrapper.writeText(_sx, txtsy, _w, _h, this.caption, this.fontColor, this.h / 4, "Segoe UI", bold);
            // x, y, w, h, text, fontColor, size, family, weight, align
            //this.wrapper.drawRect(this.sx, this.sy - this.h, this.w, this.h, "black");
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

    /**************************** Section End *********************************/

    /**************************** Section Start ********************************
     Animation engine
    ****************************************************************************/
    var animationContext = function (wrapper, fps, clearX, clearY, clearW, clearH) {
        /*Put animation engine here*/
    }
    /**************************** Section End **********************************/

    return {
        getCanvasInstance: function (id) {
            canvasInstance = new canvasWrapper().applyCanvas(id);
        }
        , clearRect: function (x, y, w, h) {
            var _x = x ? x : 0;
            var _y = y ? y : 0;
            var _w = w ? w : this.canvas.getAttribute("width");
            var _h = h ? h : this.canvas.getAttribute("height");
            canvasInstance.ctx.clearRect(_x, _y, _w, _h);
        }
        , save: function () {
            var _c = canvasInstance.ctx;
            _c.save();
        }
        , translate: function (x, y) {
            var _c = canvasInstance.ctx;
            _c.translate(x, y);
        }
        , rotate: function (angle) {
            if (typeof angle != "number") { throw "rotate angle should be a number" };
            var _c = canvasInstance.ctx;
            _c.rotate(angle / 180 * Math.PI);
        }
        , restore: function () {
            var _c = canvasInstance.ctx;
            _c.restore();
            return this;
        }
        , messureText: function (weight, fontSize, fontFamily, text) {
            var _c = canvasInstance.ctx;
            _c.save();
            var _weight = weight ? (weight + " ") : "";
            var _fontSize = (fontSize ? fontSize : 9) + "px ";
            _c.font = _weight + _fontSize + fontFamily;
            var _length = _c.measureText(text);
            _c.restore();
            return _length;
        }
        , drawRect: function (x, y, w, h, color) {
            var _c = canvasInstance.ctx;
            _c.save();
            _c.translate(x, y);
            _c.fillStyle = color ? color : "gray";
            _c.fillRect(0, 0, w, h);
            _c.restore();
        }
        , drawStrokeRect: function (x, y, w, h, lineWidth, color) {
            var _c = canvasInstance.ctx;
            _c.save();
            _c.translate(x, y);
            _c.lineWidth = lineWidth ? lineWidth : 1;
            _c.strokeStyle = color ? color : "gray";
            _c.strokeRect(0, 0, w, h);
            _c.restore();
        }
        , drawArc: function (cx, cy, r, color, startPosition, range, clockwise, lineWidth) {
            var _c = canvasInstance.ctx;
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
        , writeText: function (x, y, w, h, text, fontColor, size, family, weight, align) {
            var _c = canvasInstance.ctx;
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
            var _c = canvasInstance.ctx;
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
        , drawArcStroke: function (cx, cy, r, lineWidth, color, startPosition, range, clockwise) {
            var _c = canvasInstance.ctx;
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
        , drawTriangle: function (cx, cy, r, angle, color) {
            var _c = canvasInstance.ctx;
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
        , drawLine: function (sx, sy, ex, ey, lineWidth, color) {
            this.drawStaticLine(sx, sy, ex - sx, ey - sy, lineWidth, color);
        }
        , drawStaticLine: function (sx, sy, w, h, lineWidth, color) {
            var _c = canvasInstance.ctx;
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
        , drawFillTriangle: function (x1, y1, x2, y2, x3, y3, color) {
            var _c = canvasInstance.ctx;
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
        , addButton: function (w, h, text, color, parentCtrl, x, y) {
            var _btn = new button(this, w, h, text, color);
            _btn.setParent(parentCtrl);
            return _btn;
        }
        , addBanner: function (w, h, color, parentCtrl, x, y) {
            var _banner = new banner(this, w, h, color, x, y);
            _banner.setParent(parentCtrl);
            return _banner;
        }
        , addBar: function (w, h, text, color, parentCtrl) {
            var _bar = new bar(this, w, h, text, color);
            _bar.setParent(parentCtrl);
            return _bar;
        }
        , addPoint: function (r, text, color, parentCtrl) {
            var w = 2 * r, h = 2 * r;
            var _point = new point(this, w, h, text, color);
            _point.setParent(parentCtrl);
            return _point;
        }
        , addPushPin: function (r, text, pushColor, pinColor, parentCtrl) {
            var w = 2 * r, h = 2 * r;
            var _pushPin = new pushPin(this, w, h, text, pushColor, pinColor);
            _pushPin.setParent(parentCtrl);
            return _pushPin;
        }
        , addSpan: function (w, h, text, parentCtrl) {
            var _span = new span(this, w, h, text);
            _span.setParent(parentCtrl);
            return _span;
        }
        , addCheckBox: function (w, h, text, color,parentCtrl) {
            var _checkBox = new checkBox(this, w, h, text,color);
            _checkBox.setParent(parentCtrl);
            return _checkBox;
        }
        , addLable: function (w, h, color, family, parentCtrl) {
            var _lable = new lable(this, w, h, color, family);
            _lable.setParent(parentCtrl);
            return _lable;
        }
        , addRowLable: function (w, h, color, family, parentCtrl) {
            var _lable = new rowlable(this, w, h, color, family);
            _lable.setParent(parentCtrl);
            return _lable;
        }
        , addArrow: function (w, h, text, color, parentCtrl) {
            var _arrow = new arrow(this, w, h, text, color);
            _arrow.setParent(parentCtrl);
            return _arrow;
        }
        , render: function () {
            if (canvasInstance.rootCtrl != null) {
                canvasInstance.rootCtrl.render();
            }
        }
        , setRootCtrl: function (ctrl) {
            canvasInstance.rootCtrl = ctrl;
        }
    }
}();