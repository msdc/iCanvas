
var IR = IR || {};
var $$ = function (id) { return document.getElementById(id); }
/*
**Implementation of multiple inheritance
@param:sub-class
@param:base-class
*/
function multipleinheritPrototype(sub, base) {
    function object1(obj) {
        function F() { };
        F.prototype = obj;
        return new F();
    }
    var obj1 = object1(base.prototype);
    for (var i in obj1) {
        if (!sub.hasOwnProperty(i)) {
            sub.prototype[i] = obj1[i];
        }
    }
}

/*
** base class of  all charts
**@param
*/
IR.Chart = function (sx, sy, w, h, scale) {
    this.sx = sx != undefined ? sx : 0;
    this.sy = sy != undefined ? sy : 0;
    this.w = w != undefined ? w : 400;
    this.h = h != undefined ? h : 420;
    this.applyScale(scale);
    this.lRange = [8, 0];
    this.rRange = [0.24, 0.00];
    this.renderHandler = new evtWrapper(this);
    this.zoomCompletedHandler = new evtWrapper(this);
    this.rootElementTouchStartOddHandler = new evtWrapper(this);
    this.rootElementTouchStartEvenHandler = new evtWrapper(this);
    this.rootElementTouchStart = new evtWrapper(this);
    this.rootElementTouchMove = new evtWrapper(this);
    this.rootElementTouchEnd = new evtWrapper(this);
    this.chartIsZoomOut = true;
    this.touchFlagDisableCtrl = [];
    //this.pinCheckedHandler = new evtWrapper(this);
    //this.pinNoCheckedHandler = new evtWrapper(this);
}
IR.Chart.prototype.move = function (x, y) {
    this.sx = x;
    this.sy = y;
}
IR.Chart.prototype.applyScale = function (scale) {
    this.scale = scale != undefined ? scale : 1;
}
IR.Chart.prototype.applyWrapper = function (canvasId, width, height) {
    this.wrapper = new canvasWrapper(canvasId, width, height);
    return this;
}
IR.Chart.prototype.config = function (func) {
    this.renderHandler.attach(func);
}
IR.Chart.prototype.runConfig = function () {
    this.renderHandler.notify();
    this.wrapper.registerAnimation();
}
IR.Chart.prototype.render = function (scale) {
    this.renderHandler.notify();
    if (!this.back || !this.front) { throw "canvases are not ready"; };
    var _scale = scale ? scale : 1;
    this.wrapper.renderByHierarchy(_scale);
    this.applyScale(scale);
    this.wrapper.autoStart();
}
IR.Chart.prototype.pureRender = function (scale) {
    if (!this.wrapper) { throw "canvases are not ready"; };
    var _scale = scale ? scale : 1;
    this.wrapper.renderByHierarchy(_scale);
    this.applyScale(scale);
}
IR.Chart.prototype.clearCanvases = function () {
    this.wrapper.clearRect();
}
IR.Chart.prototype.applyAxisLabs = function (labArray) {
    this.labItems = labArray;
}
IR.Chart.prototype.applyAxisRange = function (leftRange, rightRange) {
    this.lRange = leftRange;
    this.rRange = rightRange;
}
IR.Chart.prototype.getCtrlPosition = function (ctrl) {
    var t = ctrl.offsetTop;
    var l = ctrl.offsetLeft;
    while (ctrl = ctrl.parentNode) {
        t += ctrl.offsetTop;
        l += ctrl.offsetLeft;
    }
    return { x: l, y: t };
}
IR.Chart.prototype.addZoomCompletedHandler = function (func) {
    this.zoomCompletedHandler.attach(func);
}
IR.Chart.prototype.registerZoom = function () {
    var that = this;
    this.wrapper.addListenerEvent(function () {
        that.update();
    });
}
IR.Chart.prototype.ZoomInOut = function (targtScale, fps, duration, isLowerLeft) {
    if (typeof this.completed != "undefined" && !this.completed) {
        return;
    }
    if (this.targtScale == targtScale) {
        return;
    }
    this.isZoomOut = !(this.scale > targtScale);
    this.isLowerLeft = !!isLowerLeft;
    var scale = Math.min(this.scale, targtScale);
    this.unit = this.unit ? this.unit : this.w * (1 - scale);
    this.cw = this.wrapper.canvas.width;
    this.ch = this.wrapper.canvas.height;
    this.lastupdated = 0;
    this.fps = fps || 24;
    this.delay = 1000 / this.fps;
    this.frames = (duration ? duration : 3) * this.fps;
    this.curFrm = 0;
    var _target = targtScale ? targtScale : 1;
    this.targtScale = targtScale;
    this.zoom = (_target - this.scale) / (this.frames);
    this.completed = false;
    this.count = 0;
    this.tmpw = 0;
    this.tmph = 0;
    this.rw = this.isZoomOut ? this.wrapper.canvas.width / this.scale : this.wrapper.canvas.width * targtScale;
    if (this.isZoomOut) {
        var th = this.wrapper.canvas.height / this.scale;
        this.rh = th > this.h ? th : this.h;
    }
    else {
        this.rh = Math.floor(this.wrapper.canvas.height * targtScale);
    }
}
IR.Chart.prototype.update = function () {
    if (this.completed) {
        return;
    }
    //get time
    var now = (new Date()).getTime();
    if ((now - this.lastupdated) > this.delay) {
        var _zoom;
        var modW = 0;
        var modH = 0;
        if (this.curFrm == this.frames - 1) {
            _zoom = this.targtScale;
        }
        else {
            _zoom = this.scale + this.zoom;
        }
        var _zoomdiff = Math.abs(_zoom - this.scale);
        var tmpw = this.w * _zoomdiff;
        var tmph = _zoomdiff * this.h;
        this.tmpw += Math.abs(Math.floor(tmpw) - tmpw);
        this.tmph += Math.abs(Math.floor(tmph) - tmph);
        modW = Math.round(this.tmpw);
        this.tmpw = -(Math.round(this.tmpw) - this.tmpw);
        modH = Math.round(this.tmph);
        this.tmph = -(Math.round(this.tmph) - this.tmph);

        var constW = Math.floor(this.w * _zoomdiff) + modW;
        var constH = Math.floor(_zoomdiff * this.h) + modH;

        var tmp = parseFloat(this.wrapper.canvas.style.marginLeft);
        var marginLeft = tmp ? tmp : 0;
        if (this.isZoomOut) {

            this.wrapper.canvas.width += constW;
            this.wrapper.canvas.height += constH;
            if (this.isLowerLeft) {
                this.wrapper.canvas.style.marginLeft = marginLeft - constW + "px";
            }
        }
        else {
            this.wrapper.canvas.width -= constW;
            this.wrapper.canvas.height -= constH;
            if (this.isLowerLeft) {
                this.wrapper.canvas.style.marginLeft = marginLeft + constW + "px";
            }
        }
        this.pureRender(_zoom);
        this.curFrm++;
        if (this.curFrm == this.frames) {

            this.zoomCompletedHandler.notify();
            this.completed = true;

            return;
        }
    }
}
IR.Chart.prototype.zoomInOutCallBack = function (scale, fps, duration, callback, args) {
    this.ZoomInOut(scale, fps, duration, true);
    var that = this;
    var linstener = setInterval(function () {
        if (that.completed) {
            if (typeof callback == "function")
                callback.apply(null, args);
            clearInterval(linstener);
        }
    }, 1);
};
IR.Chart.prototype.setMouseOrTouchFlag = function (mouseFlag, touchFlag) {
    if (!this.wrapper) { throw "canvases are not ready"; };
    for (var i = 0, ci; ci = this.wrapper.ctrlList[i]; i++) {
        if (!(mouseFlag == undefined || mouseFlag == null)) {
            ci.setMouseFlag(mouseFlag);
        }
        if (!(touchFlag == undefined || touchFlag == null)) {
            ci.setTouchFlag(touchFlag);
        }
    }

    for (var m = 0, cm; cm = this.touchFlagDisableCtrl[m]; m++) {
        cm.setTouchFlag(true);
    }

}
IR.Chart.prototype.setCanvasStyle = function (attributeName, attributeValue) {
    if (this.wrapper) {
        //this.wrapper.canvas.style.setProperty(attributeName, attributeValue);
        this.wrapper.canvas.style[attributeName] = attributeValue;
    }
}
IR.Chart.prototype.addCanvasTouchListeners = function (start, move, end) {
    if (this.wrapper) {
        this.wrapper.addCanvasTouchListeners(start, move, end);
    }
}
IR.Chart.prototype.addMouseOverListener = function (func) {
    if (this.wrapper) {
        this.wrapper.addMouseMoveListener(func);
    }
}
IR.Chart.prototype.addMouseDownListener = function (func) {
    if (this.wrapper) {
        this.wrapper.addMouseDownListener(func);
    }
}
IR.Chart.prototype.addMouseUpListener = function (func) {
    if (this.wrapper) {
        this.wrapper.addMouseUpListener(func);
    }
}
IR.Chart.prototype.addMouseInListener = function (func) {
    if (this.wrapper) {
        this.wrapper.addMouseInListener(func);
    }
}
IR.Chart.prototype.addMouseOutListener = function (func) {
    if (this.wrapper) {
        this.wrapper.addMouseOutListener(func);
    }
}
IR.Chart.prototype.getCanvas = function () {
    if (this.wrapper) {
        return this.wrapper.canvas;
    }
}

IR.Chart.prototype.addRootElementTouchStartListener = function (func) {
    this.rootElementTouchStart.attach(func);
}
IR.Chart.prototype.addRootElementTouchMoveListener = function (func) {
    this.rootElementTouchMove.attach(func);
}
IR.Chart.prototype.addRootElementTouchEndListener = function (func) {
    this.rootElementTouchEnd.attach(func);
}
IR.Chart.prototype.addRootElementTouchEventListener = function (start, move, end) {
    if (start) {
        this.addRootElementTouchStartListener(start);
    }
    if (move) {
        this.addRootElementTouchMoveListener(move);
    }
    if (end) {
        this.addRootElementTouchEndListener(end);
    }

}
IR.Chart.prototype.addRootElementTouchStartToggle = function (func1, func2) {
    this.rootElementTouchStartOddHandler.attach(func1);
    this.rootElementTouchStartEvenHandler.attach(func2);
}

/***********************************/
IR.ChartAxisAttribute = function () {
    this.axisBackColor = "gray";
    this.quarterlyAxis = {
        lrange: [8, 0],
        rrange: [],
        lines: [0.15, 0.36, 0.57, 0.78],
        labitems: ["Q212", "Q312", "Q412", "Q113", "Q213"],
        orginindex: 4,
        data: [1.8, 3.0, 2.2, 1.5, 1.3],
        barcolors: ["rgb(35, 132, 203)"],
        linecolor: "rgb(235,235,235)",
        labcolor: "rgb(119,119,119)",
        barlink: []
    };
    this.yearToDateAxis = {
        lrange: [0.24, 0],
        rrange: [],
        lines: [0.15, 0.36, 0.57, 0.78],
        labitems: ["Q212", "Q312", "Q412"],
        orginindex: 4,
        data: [0.20, 0.23, 0.21],
        barcolors: ["rgb(35, 132, 203)"],
        linecolor: "rgb(235,235,235)",
        labcolor: "rgb(119,119,119)",
        barlink: []
    };
    this.scalePrecision = { left: 1, right: 1 };
}
IR.ChartAxisAttribute.prototype.setQuarterlyAxis = function (params) {
    this.extend(this.quarterlyAxis, params);
}
IR.ChartAxisAttribute.prototype.setYearToDateAxis = function (params) {
    this.extend(this.yearToDateAxis, params);
}
IR.ChartAxisAttribute.prototype.setScalePrecision = function (precision) {
    this.extend(this.scalePrecision, precision);
}
IR.ChartAxisAttribute.prototype.isContainQ4 = function () {
    var isContain = false;
    function r(array, l, i) {
        if (Object.prototype.toString.call(array).toLowerCase() == "[object array]") {
            var len = array.length;
            if (len == 0) return false;
            for (var i = 0; i < len; i++) {
                if (arguments.callee(array[i], len, i)) {
                    break;
                }
            }
        }
        else {
            if (l == i + 1) {
                if (array.toLowerCase().indexOf("q4") >= 0) {
                    isContain = true;
                    return true;
                }

            }
            return false;
        }

    }
    r(this.quarterlyAxis.labitems);
    if (isContain) {
        return true;
    }
    isContain = false;
    r(this.yearToDateAxis.labitems);
    if (isContain) {
        return true;
    }
    return false;


}
/*******************************************/
IR.ChartBaseAttribute = function () {

    this.pinCheckedHandler = new evtWrapper(this);
    this.pinNoCheckedHandler = new evtWrapper(this);
    this.quarterlyBarColors = [];
    this.yearToDateBarColors = [];
    this.bigbackColor = "rgb(240, 240, 240)";
    this.titleBackColor = "rgb(240, 240, 240)";
    this.pinSwitchColor = ["RGB(178,178,178)", "RGB(122,122,122)"];
    this.labTitleStyle = {
        text: "RETURN OF CASH TO SHAREHOLDERS",
        color: "black",
        fontsize: null,
        family: "Segoe UI",
        weight: "bold",
        iscenter: null
    };
    this.labSubTitleStyle = {
        text: "(In billions except for Dividends Per Share)",
        color: "rgb(142,142,142)",
        fontsize: undefined,
        family: "Segoe UI",
        weight: undefined,
        iscenter: undefined
    };
    this.tabBackColor = "rgb(126,126,126)";
    this.quarterlyTabStyle = {
        text: "Quarterly",
        fontcolor: "black",
        backcolor: "transparent"
    };
    this.yearToDateTabStyle = {
        text: "Year To Date",
        fontcolor: "white",
        backcolor: "transparent"
    };
    this.tabSelectedColor = "white";
    this.barToolTipStyle = {

    };
    this.precision = 1;
    //this.scalePrecision = { left: 1, right: 1 };
}

IR.ChartBaseAttribute.prototype.setTabSelectedColor = function (color) {
    this.tabSelectedColor = color;
}
IR.ChartBaseAttribute.prototype.setBigbackColor = function (color) {
    this.bigbackColor = color;
}
IR.ChartBaseAttribute.prototype.setTitleBackColor = function (color) {
    this.titleBackColor = color;
}
IR.ChartBaseAttribute.prototype.setLabTitleStyle = function (params) {
    this.extend(this.labTitleStyle, params);
}
IR.ChartBaseAttribute.prototype.setLabSubTitleStyle = function (params) {
    this.extend(this.labSubTitleStyle, params);
}
IR.ChartBaseAttribute.prototype.setQuarterlyTabStyle = function (params) {
    this.extend(this.quarterlyTabStyle, params);
}
IR.ChartBaseAttribute.prototype.setYearToDateTabStyle = function (params) {
    this.extend(this.yearToDateTabStyle, params);
}
IR.ChartBaseAttribute.prototype.setTabBackColor = function (color) {
    this.tabBackColor = color;
}
IR.ChartBaseAttribute.prototype.setAxisBackColor = function (color) {
    this.axisBackColor = color;
}
IR.ChartBaseAttribute.prototype.extend = function (target, source) {
    for (var i in source) {
        target[i] = source[i];
    }
}
IR.ChartBaseAttribute.prototype.addPinCheckedListener = function (func) {
    if (typeof func == "function") this.pinCheckedHandler.attach(func);
}
IR.ChartBaseAttribute.prototype.addPinNoCheckedListener = function (func) {
    if (typeof func == "function") this.pinNoCheckedHandler.attach(func);
}
IR.ChartBaseAttribute.prototype.pinToggle = function (func1, func2) {
    this.addPinCheckedListener(func1);
    this.addPinNoCheckedListener(func2);
}
IR.ChartBaseAttribute.prototype.setPrecision = function (precision) {
    if (Object.prototype.toString.call(precision).toLowerCase() == "[object number]") {
        this.precision = parseInt(precision);
    }
}
IR.ChartBaseAttribute.prototype.setPinSwitchColor = function (colors) {
    this.pinSwitchColor = colors;
}
IR.ChartBaseAttribute.prototype.initTab = function (flags) {
    if (flags == undefined) {
        this.initTab = flags;
    }
    else {
        this.initTab = !flags
    }
}
/***********************************/
IR.ChartColumnAttribute = function () {
    IR.ChartAxisAttribute.apply(this, null);
    IR.ChartBaseAttribute.apply(this, null);
}
multipleinheritPrototype(IR.ChartColumnAttribute, IR.ChartAxisAttribute);
multipleinheritPrototype(IR.ChartColumnAttribute, IR.ChartBaseAttribute);
/**********************************/
IR.ChartDoughnutAttribute = function () {
    IR.ChartBaseAttribute.apply(this, null);

    this.groupTitle = {
        text: ["Windows Live Division", "Server and Tools", "Online Services Division", "Microsoft Business Division", "Entertainment and Devices Division"],
        fontFamily: "Segou UI",
        fontSize: 12,
        color: "black"
    }
    this.quarterly = {
        data: [[5.9, 5.2, 0.9, 5.7, 3.8], [5.9, 5.2, 0.9, 5.7, 3.8]],
        labitems: ["Q213", "Q212"],
        labcolor: "RGB(119,119,119)",
        barcolor: ["#ff8c00", "#7fba00", "#68217a", "#0072c6", "#00b294"],
        fontSize: 17,
        barlink: [],
        unallocated: [0, 0]
    }
    this.yearToDate = {
        data: [[5.9, 5.2, 0.9, 5.7, 3.8], [5.9, 5.2, 0.9, 5.7, 3.8]],
        labitems: ["Q213", "Q212"],
        labcolor: "RGB(119,119,119)",
        barcolor: ["#ff8c00", "#7fba00", "#68217a", "#0072c6", "#00b294"],
        fontSize: 17,
        barlink: [],
        unallocated: [0, 0]
    }
}
inheritPrototype(IR.ChartDoughnutAttribute, IR.ChartBaseAttribute);

IR.ChartDoughnutAttribute.prototype.setTitles = function (params) {
    this.extend(this.groupTitle, params);
}
IR.ChartDoughnutAttribute.prototype.setQuarterly = function (params) {
    this.extend(this.quarterly, params);
}
IR.ChartDoughnutAttribute.prototype.setYearToDate = function (params) {
    this.extend(this.yearToDate, params);
}
IR.ChartDoughnutAttribute.prototype.isContainQ4 = function () {
    var isContain = false;
    function r(array, l, i) {
        if (Object.prototype.toString.call(array).toLowerCase() == "[object array]") {
            var len = array.length;
            if (len == 0) return false;
            for (var i = 0; i < len; i++) {
                if (arguments.callee(array[i], len, i)) {
                    break;
                }
            }
        }
        else {
            //if (l == i + 1) {
            if (array.toLowerCase().indexOf("q4") >= 0) {
                isContain = true;
                return true;
            }

            //}
            return false;
        }

    }
    r(this.quarterly.labitems);
    if (isContain) {
        return true;
    }
    //isContain = false;
    //r(this.yearToDateLable.text);
    //if (isContain) {
    //    return true;
    //}
    return false;

}


/***********************************/
/*
** 
**
*/
IR.SingleColumn = function (sx, sy, w, h, scale) {
    IR.Chart.apply(this, arguments);
    IR.ChartColumnAttribute.apply(this, null);
    this.config(function () {
        var _wrapper = this.wrapper;
        var _cSize = { w: w, h: h };
        var _start = { x: this.sx, y: this.sy };
        var that = this;
        var initTab, isQ4 = this.isContainQ4();
        if (this.initTab == undefined) {
            initTab = isQ4;
        }
        else {
            initTab = this.initTab;
        }


        var animateState = false;
        //add the background
        var _bigback = _wrapper.addBanner(0, 0, 0, 0, this.bigbackColor);
        _bigback.setBorderState(true);
        _bigback.applyBorder(1, "RGB(207,207,207)");
        var _borderWidth = _bigback.borderWidth;
        _bigback.addScaleHandler(function (scale) {
            this.w = Math.round(_cSize.w * scale);
            this.h = Math.round(_cSize.h * scale);
            this.setPosition(that.sx, that.sy);
        });
        var isZoomOut;
        _bigback.ontouchstart(function (cord) {
            var isInChild = false;
            var inChild = [_btn, _btn2, _backBanner].concat(_bars).concat(_bars2);
            for (var i = 0, ci; ci = inChild[i]; i++) {
                isInChild = _wrapper.isInCtrl(cord, ci);
                if (isInChild) {
                    break;
                }
            }
            isZoomOut = !that.chartIsZoomOut;
            if (isZoomOut) {
                changePinState(true);
                //that.setMouseOrTouchFlag(null, false);
                that.rootElementTouchStartOddHandler.notify(_wrapper.canvas);
                // that.setMouseOrTouchFlag(null, true);
            }
            else {
                if (!isInChild) {
                    changePinState(false)
                    that.rootElementTouchStartEvenHandler.notify(_wrapper.canvas);
                    //that.setMouseOrTouchFlag(null, false);
                    //this.setTouchFlag(true);
                }
            }

            function changePinState(flag) {
                _pin.checked = flag;
                pinClick();

                _pin.curColor = _pin.checked ? _pin.pinColor : _pin.pushColor;
            }

        });
        _bigback.ontouchend(function () {


        });
        _bigback.setTouchFlag(true);
        that.touchFlagDisableCtrl.push(_bigback);
        _bigback.ontouchmove(function () { });
        //the title
        var _title = _wrapper.addBanner(0, 0, 0, 0, this.titleBackColor, _bigback);
        _title.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 27 / 320);
        });
        //the push pin
        var _pin = _wrapper.addPushPin(0, 0, 0, "Click to dock chart", this.pinSwitchColor[0], this.pinSwitchColor[1], _title);
        _pin.absolute = true;
        _pin.addScaleHandler(function (scale) {
            this.r = this.parentNode.h * 0.4;
            this.top = this.parentNode.h / 2;
            this.left = this.parentNode.w - this.r - 5;
            this.cx = this.cy = 0;
        });
        _pin.applyStartPointHandler(function (x, y) {
            this.cx = x;
            this.cy = y;
        });

        _pin.addToolTip();

        _pin.onmousemove(function (cord) {
            that.setCanvasStyle("cursor", "pointer");
            var w = 120;
            this.toolTip.setStyle("width", w + "px");
            this.toolTip.setStyle("borderRadius", "5px 6px");
            this.toolTip.show();
            this.toolTip.move(cord.e.pageX - cord.x + this.left - w + that.sx + this.r, cord.e.pageY + 20);
        });
        _pin.onmouseout(function () {
            that.setCanvasStyle("cursor", "");
            this.toolTip.hide();
        });

        //title content
        var _labTitle = _wrapper.addLable(0, 0, 0, 0, this.labTitleStyle.color, this.labTitleStyle.family, _title);
        _labTitle.addText(this.labTitleStyle.text, this.labTitleStyle.color, this.labTitleStyle.fontsize, this.labTitleStyle.family, this.labTitleStyle.weight);
        _labTitle.addText(this.labSubTitleStyle.text, this.labSubTitleStyle.color, this.labSubTitleStyle.fontsize, this.labSubTitleStyle.family, this.labSubTitleStyle.weight);
        _labTitle.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w / 80);
            this.top = Math.round(this.parentNode.h / 2);
            this.h = _title.h / 2;//14 * scale;
            this.eachTxt(function (txtItem) {

                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });

        //the line banner       
        var _btnLine = _wrapper.addBanner(0, 0, 0, 0, this.tabBackColor, _bigback);
        _btnLine.setPosition(_borderWidth, 0);
        _btnLine.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - _borderWidth * 2);
            this.h = Math.round(this.parentNode.h * 20 / 320);

        });

        //chart back, the gradient
        var _chartBack = _wrapper.addBanner(0, 0, 0, 0, this.axisBackColor, _bigback);
        _chartBack.setPosition(_borderWidth, 0);
        _chartBack.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - 2 * _borderWidth);
            this.h = Math.round(this.parentNode.h * 250 / 320);
            this.backColor = _wrapper.createLinearGradient(0, 0, 0, this.h, { 0: "rgb(255,255,255)", 0.3: "rgb(250,250,250)", 0.5: "rgb(245,245,245)", 0.7: "rgb(240,240,240)" });
        });

        //axis
        var _axis = _wrapper.addAxisLeftCoord(0, 0, 0, 0, "transparent", _chartBack);
        _axis.setZIndex(3);
        _axis.applyAxisLines(this.quarterlyAxis.lines);
        _axis.applyLineColor(this.quarterlyAxis.linecolor);
        _axis.applyLabColor(this.quarterlyAxis.labcolor);
        var _tlabs = this.quarterlyAxis.labitems;
        if (_tlabs && _tlabs.length > 0) {
            _axis.calculateHorizonSolts(_tlabs.length);
            _axis.applyLabs(_tlabs);
        }

        _axis.float = true;
        _axis.applyVerticalLine(1);
        _axis.applyVLinePosition(_tlabs.length - 1, null);
        _axis.setCurrentBar([_tlabs.length - 1], { 0: "RGB(244,244,244)", 1: "RGB(255,255,255)" })
        _axis.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h);
            var max = Math.max.apply(null, that.quarterlyAxis.lrange);
            var min = Math.min.apply(null, that.quarterlyAxis.lrange);
            var precision = IR.Common.getPrecision(Math.abs(max) + Math.abs(min), that.scalePrecision.left);
            this.applyCoordinationLeft(max, min, precision);
            this.calculateHorizonSolts(_tlabs.length);

        });

        var _axis2 = _wrapper.addAxisLeftCoord(0, 0, 0, 0, "transparent", _chartBack);
        _axis2.setZIndex(2);
        _axis2.applyAxisLines(this.yearToDateAxis.lines);
        _axis2.applyLineColor(this.yearToDateAxis.linecolor);
        _axis2.applyLabColor(this.yearToDateAxis.labcolor);
        var _labs = this.yearToDateAxis.labitems;
        if (_labs && _labs.length > 0) {
            _axis2.calculateHorizonSolts(_labs.length);
            _axis2.applyLabs(_labs);
        }
        _axis2.absolute = true;
        _axis2.applyVerticalLine(1);
        _axis2.applyVLinePosition(_labs.length - 1, null);
        _axis2.setCurrentBar([_labs.length - 1], { 0: "RGB(244,244,244)", 1: "RGB(255,255,255)" })
        _axis2.setRenderFlag(false);
        _axis2.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h);
            var max = Math.max.apply(null, that.yearToDateAxis.lrange);
            var min = Math.min.apply(null, that.yearToDateAxis.lrange);
            var precision = IR.Common.getPrecision(Math.abs(max) + Math.abs(min), that.scalePrecision.left);
            this.applyCoordinationLeft(max, min, precision);
            this.calculateHorizonSolts(_labs.length);
        });

        //btns, front canvas starts
        //btns
        var _btn = _wrapper.addButton(0, 0, 0, 0, this.quarterlyTabStyle.text, this.quarterlyTabStyle.backcolor, _btnLine);
        _btn.left = 0;
        _btn.setZIndex(8);
        _btn.float = true;
        //need to reset when clicked
        _btn.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
            this.left = this.left * scale / that.scale;
            this.top = 0;

        });


        var _btn2 = _wrapper.addButton(0, 0, 0, 0, this.yearToDateTabStyle.text, this.yearToDateTabStyle.backcolor, _btnLine);
        _btn2.setZIndex(9);


        _btn2.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
            this.top = 0;

        });
        function tabinCtrl(cord) {
            var _sx, _sy, _ex, _ey;
            _sx = (typeof this.sx == "function" ? this.sx() : this.sx);
            _sy = (typeof this.sy == "function" ? this.sy() : this.sy);
            _ex = (typeof this.ex == "function" ? this.ex() : this.ex);
            _ey = (typeof this.ey == "function" ? this.ey() : this.ey) + this.h / 2;
            var _cordX = cord.x - (this.ox != undefined ? this.ox : 0);
            var _cordY = cord.y - (this.oy != undefined ? this.oy : 0);
            var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
            var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
            return !(_x || _y);
        }
        _btn2.addIsInCrtl(tabinCtrl);
        _btn.addIsInCrtl(tabinCtrl);

        //back banner
        var _backBanner = _wrapper.addBanner(0, 0, 0, 0, this.tabSelectedColor, _btnLine);
        _backBanner.setZIndex(3);
        _backBanner.absolute = true;
        _backBanner.left = 0;
        _backBanner.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = _btnLine.h;
            this.left = initTab ? Math.round(120 * scale) : this.left * scale / that.scale;
            initTab = false;
        });
        _backBanner.applySetLTHandler(function (change) {
            this.sx = Math.floor(this.sx)
            this.left = this.sx - this.parentNode.sx;

        });

        //_span
        var _span = _wrapper.addSpan(0, 0, 0, 0, "", _bigback);
        _span.absolute = true;
        _span.setRenderFlag(false);
        _span.addScaleHandler(function (scale) {
            this.w = Math.round(30 * scale);
            this.h = Math.round(20 * scale);
        });

        //bars
        var _bars = [];
        var tempColor;
        var tempIndex;
        for (var i = 0; i < this.quarterlyAxis.data.length; i++) {

            if (i == this.quarterlyAxis.data.length - 1) {
                tempIndex = 1;
            }
            else {
                tempIndex = 0;
            }
            var tmpBd = parseFloat(parseFloat(this.quarterlyAxis.data[i]).toFixed(this.precision));
            tempColor = this.quarterlyAxis.barcolors[tempIndex];
            var _tempBar = _wrapper.addBar(0, 0, 0, 0, "$" + tmpBd.toFixed(this.precision), tempColor, _axis);
            _tempBar.value = this.quarterlyAxis.data[i];
            _tempBar.setZIndex(7);


            function over1(cord) {
                if (!animateState) return;
                that.setCanvasStyle("cursor", "pointer");

                var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2) + (this.ox != undefined ? this.ox : 0);
                var _y;
                if (parseFloat(this.value) < 0) {
                    _y = (this.ey() + 2) + (this.oy != undefined ? this.oy : 0);
                }
                else {
                    _y = (this.ey() - _span.h - 2) + (this.oy != undefined ? this.oy : 0);
                }
                _span.updateText(this.caption);
                _span.hide();
                ani2.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            _tempBar.ontouchstart(over1);
            _tempBar.onmousemove(over1);
            _tempBar.ontouchend(function () { });
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                ani2.repaint();
            });

            _tempBar.absolute = true;

            (function (i) {

                _tempBar.onclick(function () {
                    var blen = that.quarterlyAxis.barlink.length;
                    if (blen == 0) return;
                    var href = that.quarterlyAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }
                });

                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis.getOrigin();
                    var _solts = _axis.solts;
                    var _width = Math.round(35 * scale);
                    this.h = this.h * scale / that.scale;
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.w = _width;
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);
                    this.setOriginPoint(_o.x, _o.y);

                });
                _tempBar.applyFont("RGB(119,119,119)", _span.size, "Segoe UI", "Bold");
                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                });
                _tempBar.isDisplayTitle = false;
                _tempBar.addRenderHandler(function () {
                    if (this.isDisplayTitle) {
                        this.wrapper.writeText(this.sx, barTextSY(this.caption, this), _span.w, _span.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);

                    }

                })
            })(i);
            _bars.push(_tempBar);
        }
        function barTextSY(text, bar) {
            var tmph;
            if (parseFloat(bar.value) < 0) {
                tmph = bar.ey();
            }
            else {
                tmph = bar.ey() - _span.h
            }
            return tmph;
        }
        //the second batch of bars
        var _bars2 = [];

        for (var i = 0; i < this.yearToDateAxis.data.length; i++) {
            if (i == this.yearToDateAxis.data.length - 1) {
                tempIndex = 1;
            }
            else {
                tempIndex = 0;
            }
            tempColor = this.yearToDateAxis.barcolors[tempIndex];
            var _tempBar = _wrapper.addBar(0, 0, 0, 0, "$" + parseFloat(parseFloat(this.yearToDateAxis.data[i]).toFixed(this.precision)).toFixed(this.precision), tempColor, _axis2);
            _tempBar.setZIndex(7);
            _tempBar.setRenderFlag(false);

            function over2(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (!animateState) return;
                var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2) + (this.ox != undefined ? this.ox : 0);
                var _y;
                if (parseFloat(this.value) < 0) {
                    _y = (this.ey() + 2) + (this.oy != undefined ? this.oy : 0);
                }
                else {
                    _y = (this.ey() - _span.h - 2) + (this.oy != undefined ? this.oy : 0);
                }
                _span.updateText(this.caption);
                _span.hide();
                ani3.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            _tempBar.ontouchstart(over2);
            _tempBar.onmousemove(over2);
            _tempBar.value = this.yearToDateAxis.data[i];
            _tempBar.ontouchend(function () { });
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                ani3.repaint();
            });
            _tempBar.absolute = true;

            (function (i) {
                _tempBar.onclick(function () {
                    var blen = that.yearToDateAxis.barlink.length;
                    if (blen == 0) return;

                    var href = that.yearToDateAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });
                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis2.getOrigin();
                    var _solts = _axis2.solts;
                    var _width = Math.round(35 * scale);
                    this.h = this.h * scale / that.scale;
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.w = _width;

                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);

                    this.setOriginPoint(_o.x, _o.y);
                });
                _tempBar.isDisplayTitle = false;
                _tempBar.applyFont("RGB(119,119,119)", _span.size, "Segoe UI", "Bold");
                _tempBar.addRenderHandler(function () {
                    if (this.isDisplayTitle) {
                        this.wrapper.writeText(this.sx, barTextSY(this.caption, this), _span.w, _span.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);
                    }

                })
                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                    this.sy = this.top;
                });
            })(i);
            _bars2.push(_tempBar);
        }
        //animation
        //animation 1
        var ani1 = _wrapper.addAnimation(20);
        ani1.applyCtrls(_btnLine, _backBanner, _btn, _btn2);
        ani1.logChanges(_backBanner, { sx: 120 }, 0, 1);

        //animation 2
        var ani2 = _wrapper.addAnimation(20);
        //ani2.applyCtrls(_chartBack, _axis, _line);
        ani2.applyCtrls(_chartBack, _axis, _span);
        for (var i = 0; i < _bars.length; i++) {
            ani2.logChanges(_bars[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        //animation 3
        var ani3 = _wrapper.addAnimation(20);
        ani3.applyCtrls(_chartBack, _axis2, _span);
        // ani3.cloneImpactedControls(ani2);
        for (var i = 0; i < _bars2.length; i++) {
            ani3.logChanges(_bars2[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        function getValue(d) {
            var tmp = Math.abs(d);
            if (tmp <= 1 && tmp > 0) {
                if (d < 0) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            return d;
        }
        _axis.addScaleHandler(function () {
            var _unit = this.leftRange.unit || 1;
            var v;
            for (var i = 0, ci; ci = ani2.changeList[i]; i++) {
                // v = parseFloat(that.quarterlyAxis.data[i]).toFixed(that.precision);
                v = parseFloat(that.quarterlyAxis.data[i]);
                ci.setFirstRange(getValue(v * _unit));//sub 0.1 pix to fix blur
            }

        });
        _axis2.addScaleHandler(function () {
            var _unit = this.leftRange.unit || 1;
            var v;
            for (var i = 0, ci; ci = ani3.changeList[i]; i++) {
                //v = parseFloat(that.yearToDateAxis.data[i]).toFixed(that.precision);
                v = parseFloat(that.yearToDateAxis.data[i]);
                ci.setFirstRange(getValue(v * _unit));//sub 0.1 pix to fix blur
            }

        });

        _axis.addScaleHandler(function (scale) {
            _span.scale(scale);
        });
        _axis2.addScaleHandler(function (scale) {
            _span.scale(scale);
        });
        ani1.addClearHandler(function () {
            this.applyClearArea(_btnLine.sx, _btnLine.sy, _btnLine.w, _btnLine.h);
        });

        ani2.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });

        ani3.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });
        ani2.attachDeactiveHandler(function (bars) {
            var tmph;
            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.wrapper.save();
                ci.wrapper.translate(ci.ox, ci.oy);
                tmph = barTextSY(ci.caption, ci);
                ci.wrapper.writeText(ci.sx, tmph, _span.w, _span.h, ci.caption, ci.fontColor, _span.size, ci.family, ci.weight);
                ci.wrapper.restore();
                ci.isDisplayTitle = true;
            }
            animateState = true;
        });

        ani3.attachDeactiveHandler(function () {
            var tmph;
            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.wrapper.save();
                ci.wrapper.translate(ci.ox, ci.oy);
                tmph = barTextSY(ci.caption, ci);
                ci.wrapper.writeText(ci.sx, tmph, _span.w, _span.h, ci.caption, ci.fontColor, _span.size, ci.family, ci.weight);
                ci.wrapper.restore();
                ci.isDisplayTitle = true;
            }
            animateState = true;
        });

        _btn.onclick(function () {
            if (!that.completed) return;

            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                //this.tabSelectedColor = "white";
                _span.hide();
                animateState = false;
                setYRenderFlag(false);
                setQRenderFlag(true);
                // _wrapper.renderByHierarchy(that.scale);
                ani1.resetOnlyStatus();
                ani1.setFirstRange(-this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn2.fontColor = that.yearToDateTabStyle.fontcolor;
                ani3.reset();
                ani3.deactive();
                ani2.restart();
            }
        });

        _btn2.onclick(function () {
            if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                _span.hide();
                animateState = false;
                setYRenderFlag(true);
                setQRenderFlag(false);
                ani1.resetOnlyStatus();
                ani1.setFirstRange(this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn.fontColor = that.yearToDateTabStyle.fontcolor;
                ani2.reset();
                ani2.deactive();
                ani3.restart();
            }
        });
        function pinClick() {
            // this.pinClickHandler.notify(arguments);
            if (_pin.checked) {
                that.pinCheckedHandler.notify();
                _pin.caption = "Click to undock chart"

            }
            else {
                that.pinNoCheckedHandler.notify();
                _pin.caption = "Click to dock chart"
            }
            if (_pin.toolTip) {
                _pin.toolTip.updateText(_pin.caption);
            }
        }
        _pin.onclick(pinClick);

        function setQRenderFlag(flag) {
            _axis.setRenderFlag(flag);
            for (var i = 0, ci; ci = _bars[i]; i++) {

                ci.setRenderFlag(flag);
            }
            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.isDisplayTitle = false;

            }
        }
        function setYRenderFlag(flag) {
            _axis2.setRenderFlag(flag);
            for (var i = 0, ci; ci = _bars2[i]; i++) {

                ci.setRenderFlag(flag);
            }
            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.isDisplayTitle = false;

            }
        }
        if (initTab) {
            _btn2.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn.applyFont(this.yearToDateTabStyle.fontcolor);

            setYRenderFlag(true);
            setQRenderFlag(false);
            ani3.active();
        }
        else {
            _btn.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn2.applyFont(this.yearToDateTabStyle.fontcolor);
            setYRenderFlag(false);
            setQRenderFlag(true);
            ani2.active();
        }
        if (isQ4) {
            _btn2.caption = "Annual";
        }
        //that.setMouseOrTouchFlag(null, false);
        //_bigback.setTouchFlag(true);
        that.touchFlagDisableCtrl.push(_bigback);
    });

}
inheritPrototype(IR.SingleColumn, IR.Chart);
multipleinheritPrototype(IR.SingleColumn, IR.ChartColumnAttribute);
/********************************/
/*Start*/
IR.ClusteredArrowColumn = function (sx, sy, w, h, scale) {
    IR.Chart.apply(this, arguments);
    IR.ChartColumnAttribute.apply(this, null);
    this.config(function () {
        //prepare the canvases
        var _wrapper = this.wrapper;

        var _cSize = { w: w, h: h };
        var _start = { x: this.sx, y: this.sy };
        var that = this; //save the "this"
        var initTab, isQ4 = this.isContainQ4();
        if (this.initTab == undefined) {
            initTab = isQ4;
        }
        else {
            initTab = this.initTab;
        }


        //add the background
        var _bigback = _wrapper.addBanner(0, 0, 0, 0, this.bigbackColor);
        _bigback.setBorderState(true);
        _bigback.applyBorder(1, "RGB(207,207,207)");
        var _borderWidth = _bigback.borderWidth;
        _bigback.addScaleHandler(function (scale) {
            this.w = Math.round(_cSize.w * scale);
            this.h = Math.round(_cSize.h * scale);
            this.setPosition(that.sx, that.sy);
        });
        var isZoomOut;
        _bigback.ontouchstart(function (cord) {
            var isInChild = false;
            var inChild = [_btn, _btn2, _backBanner].concat(_bars).concat(_bars2);
            for (var i = 0, ci; ci = inChild[i]; i++) {
                isInChild = _wrapper.isInCtrl(cord, ci);
                if (isInChild) {
                    break;
                }
            }

            isZoomOut = !that.chartIsZoomOut;
            if (isZoomOut) {
                changePinState(true);
                //that.setMouseOrTouchFlag(null, false);
                that.rootElementTouchStartOddHandler.notify(_wrapper.canvas);
                // that.setMouseOrTouchFlag(null, true);
            }
            else {
                if (!isInChild) {
                    changePinState(false)
                    that.rootElementTouchStartEvenHandler.notify(_wrapper.canvas);
                    //that.setMouseOrTouchFlag(null, false);
                    //this.setTouchFlag(true);
                }
            }

            function changePinState(flag) {
                _pin.checked = flag;
                pinClick();

                _pin.curColor = _pin.checked ? _pin.pinColor : _pin.pushColor;
            }

        });
        _bigback.ontouchend(function () {


        });
        _bigback.setTouchFlag(true);
        _bigback.ontouchmove(function () { });
        //the title
        var _title = _wrapper.addBanner(0, 0, 0, 0, this.titleBackColor, _bigback);
        _title.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 27 / 320);
        });
        //the push pin
        var _pin = _wrapper.addPushPin(0, 0, 0, "Click to dock chart", this.pinSwitchColor[0], this.pinSwitchColor[1], _title);
        _pin.absolute = true;
        _pin.addScaleHandler(function (scale) {
            this.r = this.parentNode.h * 0.4;
            this.top = this.parentNode.h / 2;
            this.left = this.parentNode.w - this.r - 5;
            this.cx = this.cy = 0;
        });
        _pin.applyStartPointHandler(function (x, y) {
            this.cx = x;
            this.cy = y;
        });
        _pin.addToolTip();

        _pin.onmousemove(function (cord) {
            that.setCanvasStyle("cursor", "pointer");
            var w = 120;
            this.toolTip.setStyle("width", w + "px");
            this.toolTip.setStyle("borderRadius", "5px 6px");
            this.toolTip.show();
            this.toolTip.move(cord.e.pageX - cord.x + this.left - w + that.sx + this.r, cord.e.pageY + 20);
        });
        _pin.onmouseout(function () {
            that.setCanvasStyle("cursor", "");
            this.toolTip.hide();
        });
        //title content
        var _labTitle = _wrapper.addLable(0, 0, 0, 0, this.labTitleStyle.color, this.labTitleStyle.family, _title);
        _labTitle.addText(this.labTitleStyle.text, this.labTitleStyle.color, this.labTitleStyle.fontsize, this.labTitleStyle.family, this.labTitleStyle.weight);
        _labTitle.addText(this.labSubTitleStyle.text, this.labSubTitleStyle.color, this.labSubTitleStyle.fontsize, this.labSubTitleStyle.family, this.labSubTitleStyle.weight);
        _labTitle.addScaleHandler(function (scale) {
            this.left = this.parentNode.w / 80;
            this.top = this.parentNode.h / 2;
            this.h = _title.h / 2;
            this.eachTxt(function (txtItem) {

                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });

        //the line banner
        //_bgPointer.moveDown(_title);
        var _btnLine = _wrapper.addBanner(0, 0, 0, 0, this.tabBackColor, _bigback);
        _btnLine.setPosition(_borderWidth, 0);
        _btnLine.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - _borderWidth * 2);
            this.h = Math.round(this.parentNode.h * 20 / 320);
            //alert("_btnLine:" + this.h);
        });

        //chart back, the gradient
        var _chartBack = _wrapper.addBanner(0, 0, 0, 0, this.axisBackColor, _bigback);
        _chartBack.setPosition(_borderWidth, 0);
        _chartBack.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - 2 * _borderWidth);
            this.h = Math.round(this.parentNode.h * 250 / 320);
            this.backColor = _wrapper.createLinearGradient(0, 0, 0, this.h, { 0: "rgb(255,255,255)", 0.3: "rgb(255,255,255)", 0.5: "rgb(240,240,240)", 0.7: "rgb(236,236,236)" });
        });

        var changeArrayRank = function (array) {
            var result = [];
            for (var i = 0, ai; ai = array[i]; i++) {
                if (Object.prototype.toString.call(ai) === '[object Array]') {
                    for (var j = 0, aj; aj = ai[j]; j++) {
                        result.push(aj);
                    }
                    result.push("");
                }
                else {
                    result.push(ai);
                }
            }
            return result;
        }



        //axis
        var _axis = _wrapper.addAxis2LeftCoord(0, 0, 0, 0, "transparent", _chartBack);
        _axis.setZIndex(3);
        _axis.applyAxisLines(this.quarterlyAxis.lines);
        _axis.applyLineColor(this.quarterlyAxis.linecolor);
        _axis.applyLabColor(this.quarterlyAxis.labcolor);
        var _tlabs = changeArrayRank(this.quarterlyAxis.labitems);
        if (_tlabs && _tlabs.length > 0) {
            _axis.calculateHorizonSolts(_tlabs.length);
            _axis.applyLabs(_tlabs);

        }

        _axis.float = true;
        _axis.applyVerticalLine(1);
        _axis.applyVLinePosition(1, _tlabs.length - 1, Math.ceil(_tlabs.length / 2));
        _axis.setCurrentBar([1, 4], { 0: "RGB(244,244,244)", 1: "RGB(255,255,255)" })

        _axis.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h);
            var max = Math.max.apply(null, that.quarterlyAxis.lrange);
            var min = Math.min.apply(null, that.quarterlyAxis.lrange);
            var precision = IR.Common.getPrecision(Math.abs(max) + Math.abs(min), that.scalePrecision.left);
            this.applyCoordinationLeft(max, min, precision);
            this.calculateHorizonSolts(_tlabs.length);

        });

        var _axis2 = _wrapper.addAxis2LeftCoord(0, 0, 0, 0, "transparent", _chartBack);
        _axis2.setZIndex(2);
        _axis2.applyAxisLines(this.yearToDateAxis.lines);
        _axis2.applyLineColor(this.yearToDateAxis.linecolor);
        _axis2.applyLabColor(this.yearToDateAxis.labcolor);



        var _labs = changeArrayRank(this.yearToDateAxis.labitems);
        if (_labs && _labs.length > 0) {
            _axis2.calculateHorizonSolts(_labs.length);
            _axis2.applyLabs(_labs);

        }

        _axis2.absolute = true;
        _axis2.applyVerticalLine(1);
        _axis2.applyVLinePosition(1, _tlabs.length - 1, Math.ceil(_tlabs.length / 2));
        _axis2.setCurrentBar([1, 4], { 0: "RGB(244,244,244)", 1: "RGB(255,255,255)" })
        _axis2.setRenderFlag(false);

        _axis2.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h);
            var max = Math.max.apply(null, that.yearToDateAxis.lrange);
            var min = Math.min.apply(null, that.yearToDateAxis.lrange);
            var precision = IR.Common.getPrecision(Math.abs(max) + Math.abs(min), that.scalePrecision.left);
            this.applyCoordinationLeft(max, min, precision);
            this.calculateHorizonSolts(_labs.length);

        });

        var _btitle = _wrapper.addBanner(0, 0, 0, 0, "transparent", _bigback);
        _btitle.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 20 / 320);
        });

        var _blabTitle = _wrapper.addLable(0, 0, 0, 0, "black", this.labTitleStyle.family, _btitle);
        _blabTitle.absolute = true;
        _blabTitle.addText("Revenue", this.labTitleStyle.color, this.labTitleStyle.fontsize, this.labTitleStyle.family, this.labTitleStyle.weight);
        _blabTitle.top = 7;
        _blabTitle.addScaleHandler(function (scale) {
            var _o;
            var _solts;
            if (_axis.renderReady) {
                _solts = _axis.solts;
                _o = _axis.getOrigin();
            }
            else {
                _solts = _axis2.solts;
                _o = _axis2.getOrigin();
            }
            this.left = _o.x + _solts[0].length / 4;
            this.top = this.top * scale / that.scale;
            this.h = _btitle.h * 2 / 3;
            this.eachTxt(function (txtItem) {

                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });
        var _blabTitle1 = _wrapper.addLable(0, 0, 0, 0, "black", this.labTitleStyle.family, _btitle);
        _blabTitle1.absolute = true;
        _blabTitle1.addText("Operating Income", this.labTitleStyle.color, this.labTitleStyle.fontsize, this.labTitleStyle.family, this.labTitleStyle.weight);
        _blabTitle1.addScaleHandler(function (scale) {
            var _o;
            var _solts;
            if (_axis.renderReady) {
                _solts = _axis.solts;
                _o = _axis.getOrigin();
            }
            else {
                _solts = _axis2.solts;
                _o = _axis2.getOrigin();
            }
            this.left = _o.x + _solts[0].length * 3;
            this.top = _blabTitle.top;
            this.h = _btitle.h * 2 / 3;
            this.eachTxt(function (txtItem) {

                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });

        //btns, front canvas starts
        //btns
        var _btn = _wrapper.addButton(0, 0, 0, 0, this.quarterlyTabStyle.text, this.quarterlyTabStyle.backcolor, _btnLine);
        _btn.left = 0;
        _btn.setZIndex(8);
        _btn.float = true;
        _btn.selected = true; //need to reset when clicked
        _btn.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
            this.left = this.left * scale / that.scale;
        });

        var _btn2 = _wrapper.addButton(0, 0, 0, 0, this.yearToDateTabStyle.text, this.yearToDateTabStyle.backcolor, _btnLine);
        _btn2.setZIndex(9);
        _btn2.applyFont(this.yearToDateTabStyle.fontcolor);
        _btn2.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
        });
        function tabinCtrl(cord) {
            var _sx, _sy, _ex, _ey;
            _sx = (typeof this.sx == "function" ? this.sx() : this.sx);
            _sy = (typeof this.sy == "function" ? this.sy() : this.sy);
            _ex = (typeof this.ex == "function" ? this.ex() : this.ex);
            _ey = (typeof this.ey == "function" ? this.ey() : this.ey) + this.h / 2;
            var _cordX = cord.x - (this.ox != undefined ? this.ox : 0);
            var _cordY = cord.y - (this.oy != undefined ? this.oy : 0);
            var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
            var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
            return !(_x || _y);
        }
        _btn2.addIsInCrtl(tabinCtrl);
        _btn.addIsInCrtl(tabinCtrl);
        //back banner
        var _backBanner = _wrapper.addBanner(0, 0, 0, 0, this.tabSelectedColor, _btnLine);
        _backBanner.left = 0;
        _backBanner.setZIndex(3);
        _backBanner.absolute = true;
        _backBanner.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = _btnLine.h;
            this.left = initTab ? Math.round(120 * scale) : this.left * scale / that.scale;
            initTab = false;
        });
        _backBanner.applySetLTHandler(function (change) {
            this.sx = Math.floor(this.sx)
            this.left = this.sx - this.parentNode.sx;
        });

        //_span
        var _span = _wrapper.addSpan(0, 0, 0, 0, "", _bigback);
        _span.absolute = true;
        _span.setRenderFlag(false);
        _span.addScaleHandler(function (scale) {
            this.w = Math.round(30 * scale);
            this.h = Math.round(20 * scale);
        });
        var _qarrows = [];

        //bars
        var _bars = [];
        var arrowAnimateState = false;
        var tempColor;
        var tempIndex;
        var quarterlyData = [];
        var tmpData1 = changeArrayRank(this.quarterlyAxis.data);
        function _leftcoord(array, d) {
            return array.reduce(function (v, c) {
                if (d == 1) {
                    if (parseFloat(v) <= parseFloat(c)) {
                        return parseFloat(c);
                    }
                    else {
                        return parseFloat(v);
                    }
                }
                else {
                    if (parseFloat(v) >= parseFloat(c)) {
                        return parseFloat(c);
                    }
                    else {
                        return parseFloat(v);
                    }
                }
            }, 0)
        }
        for (var i = 0; i < tmpData1.length; i++) {
            if (tmpData1[i] == "") {
                var difSet = tmpData1[i - 1] - tmpData1[i - 2];
                var text = Math.round((Math.abs(difSet) / Math.abs(tmpData1[i - 2])) * 100) + "%";
                var _arrow = _wrapper.addArrow(0, 0, 0, 0, text, "", _axis);
                _arrow.setZIndex(8);
                if (difSet > 0) {
                    _arrow.direction = "up";
                    _arrow.animation = true
                    _arrow.setBackColor("RGB(51,153,0)");
                }
                else if (difSet < 0) {
                    _arrow.direction = "down";
                    _arrow.animation = false
                    _arrow.setBackColor("RGB(232,17,35)");
                    _arrow.caption = "(" + _arrow.caption + ")";
                }
                else {
                    _arrow.direction = "right";
                    _arrow.animation = false
                    _arrow.setBackColor("RGB(119,119,119)");
                }
                _arrow.absolute = true;
                var _tmpData1 = tmpData1[i - 1];
                var _top;

                (function (i) {
                    _arrow.addScaleHandler(function (scale) {
                        var _o = _axis.getOrigin();
                        var _solts = _axis.solts;
                        var _width = _solts[i].length;
                        this.h = 50 * scale;
                        this.left = Math.round(_solts[i].start) + 0.1;//added 0.1px to fix blur
                        this.w = _width;
                        var tmpa;
                        if (_axis.originIndex == 0) {
                            tmpa = Math.abs(Math.max.apply(null, _axis.axisLines) - _axis.axisLines[_axis.originIndex]);
                            _top = tmpData1[i - 1] * (tmpa) * _axis.h / (_leftcoord(_axis.leftCoord, 0));
                            this.top = this.h;
                        }
                        else {
                            tmpa = Math.abs(_axis.axisLines[0] - _axis.axisLines[_axis.originIndex]);
                            _top = tmpData1[i - 1] * (tmpa) * _axis.h / (_leftcoord(_axis.leftCoord, 1));
                            if (_top - this.h > 0) {
                                this.top = -(_top - this.h);
                            }
                            else {
                                this.top = 0;
                            }
                        }
                        this.setOriginPoint(_o.x, _o.y);
                    })
                    _arrow.applyStartPointHandler(function (x, y) {
                        this.sx = this.left;
                        this.sy = this.top;
                    });
                    _arrow.applySetLTHandler(function () {
                        this.top = this.sy;
                    });

                    _qarrows.push(_arrow);
                })(i)
                continue;
            }
            quarterlyData.push(tmpData1[i]);
            var qdataLen = quarterlyData.length;
            tempIndex = (qdataLen - 1) % this.quarterlyAxis.barcolors.length;
            tempColor = this.quarterlyAxis.barcolors[tempIndex];


            var _tempBar = _wrapper.addBar(0, 0, 0, 0, "$" + parseFloat(parseFloat(tmpData1[i]).toFixed(this.precision)).toFixed(this.precision), tempColor, _axis);
            _tempBar.value = tmpData1[i];
            _tempBar.setZIndex(7);
            //          

            function over1(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (arrowAnimateState) {
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2) + (this.ox != undefined ? this.ox : 0);
                    var _y = (this.ey() - _span.h - 2) + (this.oy != undefined ? this.oy : 0);
                    if (parseFloat(this.value) < 0) {
                        _y = (this.ey() + 2) + (this.oy != undefined ? this.oy : 0);
                    }
                    else {
                        _y = (this.ey() - _span.h - 2) + (this.oy != undefined ? this.oy : 0);
                    }

                    _span.updateText(this.caption);
                    ani2.repaint();
                    this.repaint();
                    _span.moveTo(_x, _y);
                }
            }
            _tempBar.ontouchstart(over1);
            _tempBar.onmousemove(over1);
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                ani2.repaint();
            });

            _tempBar.ontouchend(function () { });

            _tempBar.absolute = true;
            _tempBar.applyFont("RGB(119,119,119)", _span.size, "Segoe UI", "Bold");
            (function (i) {
                _tempBar.onclick(function () {
                    var blen = that.quarterlyAxis.barlink.length;
                    if (blen == 0) return;
                    var index;
                    if ((i) % 3 == 0) {
                        index = (i) / 3;
                    }
                    else {
                        index = (i - 1) / 3;
                    }
                    var href = that.quarterlyAxis.barlink[index % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });
                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis.getOrigin();
                    var _solts = _axis.solts;
                    var _width = Math.round(35 * scale);
                    this.h = this.h * scale / that.scale;
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.w = _width;
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);
                    this.setOriginPoint(_o.x, _o.y);
                });
                _tempBar.applyFont("RGB(119,119,119)", _span.size, "Segoe UI", "Bold");
                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                });

                _tempBar.isDisplayTitle = false;
                _tempBar.addRenderHandler(function () {
                    if (this.isDisplayTitle) {
                        this.wrapper.writeText(this.sx, barTextSY(this.caption, this), _span.w, _span.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);

                    }

                })
            })(i);
            prevBar = _tempBar;
            _bars.push(_tempBar);
        }

        function barTextSY(text, bar) {
            var tmph;
            if (parseFloat(bar.value) < 0) {
                tmph = bar.ey();
            }
            else {
                tmph = bar.ey() - _span.h;
            }
            return tmph;
        }
        //the second batch of bars
        var _yarrows = [];
        var _bars2 = [];
        var yearToDateData = [];
        var tmpData = changeArrayRank(this.yearToDateAxis.data);
        for (var i = 0; i < tmpData.length; i++) {
            if (tmpData[i] == "") {
                var difSet = tmpData[i - 1] - tmpData[i - 2];
                var text = Math.round((Math.abs(difSet) / Math.abs(tmpData[i - 2])) * 100) + "%";
                var _arrow = _wrapper.addArrow(0, 0, 0, 0, text, "", _axis2);
                _arrow.setZIndex(4);
                if (difSet > 0) {
                    _arrow.direction = "up";
                    _arrow.animation = true
                    _arrow.setBackColor("RGB(51,153,0)");
                }
                else if (difSet < 0) {
                    _arrow.direction = "down";
                    _arrow.animation = false
                    _arrow.setBackColor("RGB(232,17,35)");
                    _arrow.caption = "(" + _arrow.caption + ")";
                }
                else {
                    _arrow.direction = "right";
                    _arrow.animation = false
                    _arrow.setBackColor("RGB(119,119,119)");
                }
                _arrow.absolute = true;

                _arrow.setRenderFlag(false);
                (function (i) {
                    _arrow.addScaleHandler(function (scale) {
                        var _o = _axis2.getOrigin();
                        var _solts = _axis2.solts;
                        var _width = _solts[i].length;
                        this.h = 50 * scale;
                        this.left = Math.round(_solts[i].start) + 0.1;//added 0.1px to fix blur
                        this.w = _width;

                        if (_axis2.originIndex == 0) {
                            tmpa = Math.abs(Math.max.apply(null, _axis2.axisLines) - _axis2.axisLines[_axis2.originIndex]);
                            _top = tmpData[i - 1] * (tmpa) * _axis2.h / (_leftcoord(_axis2.leftCoord, 0));
                            this.top = this.h;
                        }
                        else {
                            tmpa = Math.abs(_axis2.axisLines[0] - _axis2.axisLines[_axis2.originIndex]);
                            _top = tmpData[i - 1] * (tmpa) * _axis2.h / (_leftcoord(_axis2.leftCoord, 1));
                            if (_top - this.h > 0) {
                                this.top = -(_top - this.h);
                            }
                            else {
                                this.top = 0;
                            }
                        }
                        this.setOriginPoint(_o.x, _o.y);
                        //this.top = 0;
                    })
                    _arrow.applyStartPointHandler(function (x, y) {
                        this.sx = this.left;
                        this.sy = this.top;
                    });
                    _arrow.applySetLTHandler(function () {
                        this.top = this.sy;
                    });
                    _yarrows.push(_arrow);
                })(i)

                continue;
            }
            yearToDateData.push(tmpData[i]);
            var ydataLen = yearToDateData.length;
            tempIndex = (ydataLen - 1) % this.yearToDateAxis.barcolors.length;
            tempColor = this.yearToDateAxis.barcolors[tempIndex];
            var _tempBar = _wrapper.addBar(0, 0, 0, 0, "$" + parseFloat(parseFloat(tmpData[i]).toFixed(this.precision)).toFixed(this.precision), tempColor, _axis2);
            _tempBar.value = tmpData[i];
            _tempBar.setZIndex(7);
            _tempBar.setRenderFlag(false);

            function over2(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (arrowAnimateState) {
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2) + (this.ox != undefined ? this.ox : 0);
                    var _y = (this.ey() - _span.h - 2) + (this.oy != undefined ? this.oy : 0);
                    if (parseFloat(this.value) < 0) {
                        _y = (this.ey() + 2) + (this.oy != undefined ? this.oy : 0);
                    }
                    else {
                        _y = (this.ey() - _span.h - 2) + (this.oy != undefined ? this.oy : 0);
                    }
                    _span.updateText(this.caption);
                    ani3.repaint();
                    this.repaint();
                    _span.moveTo(_x, _y);
                }
            }
            _tempBar.onmousemove(over2);
            _tempBar.ontouchstart(over2);
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                ani3.repaint();
            });
            _tempBar.ontouchend(function () { });
            _tempBar.absolute = true;

            (function (i) {
                _tempBar.onclick(function () {
                    var blen = that.yearToDateAxis.barlink.length;
                    if (blen == 0) return;
                    var index;
                    if ((i) % 3 == 0) {
                        index = (i) / 3;
                    }
                    else {
                        index = (i - 1) / 3;
                    }
                    var href = that.yearToDateAxis.barlink[index % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });
                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis2.getOrigin();
                    var _solts = _axis2.solts;
                    var _width = Math.round(35 * scale);
                    this.h = this.h * scale / that.scale;
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.w = _width;
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);
                    this.setOriginPoint(_o.x, _o.y);

                });
                _tempBar.applyFont("RGB(119,119,119)", _span.size, "Segoe UI", "Bold");
                _tempBar.isDisplayTitle = false;
                _tempBar.addRenderHandler(function () {
                    if (this.isDisplayTitle) {
                        this.wrapper.writeText(this.sx, barTextSY(this.caption, this), _span.w, _span.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);
                    }

                })
                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                    this.sy = this.top;
                });
            })(i);
            _bars2.push(_tempBar);
        }
        //animation
        //animation 1
        var ani1 = _wrapper.addAnimation(20);
        ani1.applyCtrls(_btnLine, _backBanner, _btn, _btn2);
        ani1.logChanges(_backBanner, { sx: 120 }, 0, 1);

        //animation 2
        var ani2 = _wrapper.addAnimation(20);
        //ani2.applyCtrls(_chartBack, _axis, _line);
        ani2.applyCtrls(_chartBack, _axis);
        for (var i = 0; i < _qarrows.length; i++) {
            ani2.applyCtrls(_qarrows[i]);
        }

        for (var i = 0; i < _bars.length; i++) {
            ani2.logChanges(_bars[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        //animation 3
        var ani3 = _wrapper.addAnimation(20);
        ani3.applyCtrls(_chartBack, _axis2);
        for (var i = 0; i < _yarrows.length; i++) {
            ani3.applyCtrls(_yarrows[i]);
        }
        for (var i = 0; i < _bars2.length; i++) {
            ani3.logChanges(_bars2[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }
        var ani4 = _wrapper.addAnimation(24);
        ani4.cloneImpactedControls(ani2);
        ani4.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });
        for (var i = 0, ai; ai = _qarrows[i]; i++) {
            if (ai.animation) {
                ani4.logChanges(ai, { sy: -8 }, 0, 3);
                ani4.logChanges(ai, { sy: 8 }, 0, 3);
                ani4.logChanges(ai, { sy: -5 }, 0, 3);
                ani4.logChanges(ai, { sy: 5 }, 0, 3);
            }
        }

        var ani5 = _wrapper.addAnimation(24);
        ani5.cloneImpactedControls(ani3);
        ani5.addClearHandler(function () {
            this.applyClearArea(_axis2.sx, _axis2.sy, _axis2.w, _axis2.h);
        });
        for (var i = 0, ai; ai = _yarrows[i]; i++) {
            if (ai.animation) {
                ani5.logChanges(ai, { sy: -8 }, 0, 3);
                ani5.logChanges(ai, { sy: 8 }, 0, 3);
                ani5.logChanges(ai, { sy: -5 }, 0, 3);
                ani5.logChanges(ai, { sy: 5 }, 0, 3);
            }
        }
        function getValue(d) {
            var tmp = Math.abs(d);
            if (tmp <= 1 && tmp > 0) {
                if (d < 0) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            return d;
        }
        _axis.addScaleHandler(function (scale) {
            var _unit = this.leftRange.unit || 1;
            var v;
            for (var i = 0, ci; ci = ani2.changeList[i]; i++) {
                //v = parseFloat(quarterlyData[i]).toFixed(that.precision);
                v = parseFloat(quarterlyData[i]);
                ci.setFirstRange(getValue(v * _unit));//sub 0.1 pix to fix blur
            }
            var tmp = -52 * scale / that.scale
            for (var j = 0, ci; ci = ani4.changeList[j]; j++) {
                ci.sences[0].setRange();
                ci.sences[1].setRange();
                ci.sences[2].setRange();
                ci.sences[3].setRange();
            }


        });
        _axis2.addScaleHandler(function () {
            var _unit = this.leftRange.unit || 1;
            var v;
            for (var i = 0, ci; ci = ani3.changeList[i]; i++) {
                // v = parseFloat(yearToDateData[i]).toFixed(that.precision);
                v = parseFloat(yearToDateData[i]);
                ci.setFirstRange(getValue(v * _unit));//sub 0.1 pix to fix blur
            }
            for (var j = 0, ci; ci = ani5.changeList[j]; j++) {
                ci.sences[0].setRange();
                ci.sences[1].setRange();
                ci.sences[2].setRange();
                ci.sences[3].setRange();
            }

        });
        _axis.addScaleHandler(function (scale) {
            _span.scale(scale);
        });
        _axis2.addScaleHandler(function (scale) {
            _span.scale(scale);
        });
        ani1.addClearHandler(function () {
            this.applyClearArea(_btnLine.sx, _btnLine.sy, _btnLine.w, _btnLine.h);
        });

        ani2.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });

        ani3.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });
        ani2.attachDeactiveHandler(function (bars) {
            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.wrapper.save();
                ci.wrapper.translate(ci.ox, ci.oy);
                ci.wrapper.writeText(ci.sx, barTextSY(ci.caption, ci), _span.w, _span.h, ci.caption, ci.fontColor, _span.size, ci.family, ci.weight);
                ci.wrapper.restore();
                ci.isDisplayTitle = true;
                ci.isMousemove = true;
            }
            //debugger;
            ani4.resetOnlyStatus();
            ani4.active();
        });
        ani4.attachDeactiveHandler(function (bars) {
            arrowAnimateState = true;
        })
        ani5.attachDeactiveHandler(function (bars) {
            arrowAnimateState = true;
        })

        ani3.attachDeactiveHandler(function () {
            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.wrapper.save();
                ci.wrapper.translate(ci.ox, ci.oy);
                ci.wrapper.writeText(ci.sx, barTextSY(ci.caption, ci), _span.w, _span.h, ci.caption, ci.fontColor, _span.size, ci.family, ci.weight);
                ci.wrapper.restore();
                ci.isDisplayTitle = true;
            }
            ani5.resetOnlyStatus();
            ani5.active();
        });

        _btn.onclick(function () {
            if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                this.tabSelectedColor = "white";
                arrowAnimateState = false;
                setYRenderFlag(false);
                setQRenderFlag(true);
                ani1.resetOnlyStatus();
                ani1.setFirstRange(-this.w, -this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn2.fontColor = that.yearToDateTabStyle.fontcolor;
                ani3.reset();
                ani5.reset();
                ani2.restart();
            }
        });

        _btn2.onclick(function () {
            if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                arrowAnimateState = false;
                setYRenderFlag(true);
                setQRenderFlag(false);

                ani1.resetOnlyStatus();
                ani1.setFirstRange(this.w, -this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn.fontColor = that.yearToDateTabStyle.fontcolor;
                ani2.reset();
                ani4.resetOnlyStatus();
                ani3.restart();
            }
        });
        function setQRenderFlag(flag) {
            _axis.setRenderFlag(flag);
            for (var i = 0, ci; ci = _bars[i]; i++) {

                ci.setRenderFlag(flag);
            }
            for (var i = 0, ci; ci = _qarrows[i]; i++) {
                ci.setRenderFlag(flag);
            }
            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.isDisplayTitle = false;
            }
        }
        function setYRenderFlag(flag) {
            _axis2.setRenderFlag(flag);
            for (var i = 0, ci; ci = _bars2[i]; i++) {

                ci.setRenderFlag(flag);
            }
            for (var i = 0, ci; ci = _yarrows[i]; i++) {
                ci.setRenderFlag(flag);
            }
            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.isDisplayTitle = false;

            }
        }
        function pinClick() {
            // this.pinClickHandler.notify(arguments);
            if (_pin.checked) {
                that.pinCheckedHandler.notify();
                _pin.caption = "Click to undock chart"

            }
            else {
                that.pinNoCheckedHandler.notify();
                _pin.caption = "Click to dock chart"
            }
            if (_pin.toolTip) {
                _pin.toolTip.updateText(_pin.caption);
            }

        }

        _pin.onclick(pinClick);
        if (initTab) {
            _btn2.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn.applyFont(this.yearToDateTabStyle.fontcolor);

            setYRenderFlag(true);
            setQRenderFlag(false);
            ani3.active();
        }
        else {
            _btn.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn2.applyFont(this.yearToDateTabStyle.fontcolor);
            setYRenderFlag(false);
            setQRenderFlag(true);
            ani2.active();
        }
        if (isQ4) {
            _btn2.caption = "Annual";
        }
        that.touchFlagDisableCtrl.push(_bigback);

    });

}
inheritPrototype(IR.ClusteredArrowColumn, IR.Chart);
multipleinheritPrototype(IR.ClusteredArrowColumn, IR.ChartColumnAttribute);

/*******************************************************************/

IR.ClusteredColumn = function (sx, sy, w, h, scale) {
    IR.Chart.apply(this, arguments);
    IR.ChartColumnAttribute.apply(this, null);
    this.config(function () {

        //prepare the canvases
        var _wrapper = this.wrapper;

        var _cSize = { w: w, h: h };
        var _start = { x: this.sx, y: this.sy };
        var that = this; //save the "this"
        var initTab, isQ4 = this.isContainQ4();
        if (this.initTab == undefined) {
            initTab = isQ4;
        }
        else {
            initTab = this.initTab;
        }
        var animateState = false;

        //add the background
        var _bigback = _wrapper.addBanner(0, 0, 0, 0, this.bigbackColor);
        _bigback.setBorderState(true)
        _bigback.applyBorder(1, "RGB(207,207,207)");
        var _borderWidth = _bigback.borderWidth;
        _bigback.addScaleHandler(function (scale) {
            this.w = Math.round(_cSize.w * scale);
            this.h = Math.round(_cSize.h * scale);
            this.setPosition(that.sx, that.sy);
        });
        var isZoomOut;
        _bigback.ontouchstart(function (cord) {
            var isInChild = false;
            var inChild = [_btn, _btn2, _backBanner].concat(_bars).concat(_bars2);
            for (var i = 0, ci; ci = inChild[i]; i++) {
                isInChild = _wrapper.isInCtrl(cord, ci);
                if (isInChild) {
                    break;
                }
            }
            isZoomOut = !that.chartIsZoomOut;
            if (isZoomOut) {
                changePinState(true);
                //that.setMouseOrTouchFlag(null, false);
                that.rootElementTouchStartOddHandler.notify(_wrapper.canvas);
                //that.setMouseOrTouchFlag(null, true);
            }
            else {
                if (!isInChild) {
                    changePinState(false)
                    that.rootElementTouchStartEvenHandler.notify(_wrapper.canvas);
                    //that.setMouseOrTouchFlag(null, false);
                    //this.setTouchFlag(true);
                }
            }

            function changePinState(flag) {
                _pin.checked = flag;
                pinClick();

                _pin.curColor = _pin.checked ? _pin.pinColor : _pin.pushColor;
            }

        });
        _bigback.ontouchend(function () {


        });
        _bigback.setTouchFlag(true);
        _bigback.ontouchmove(function () { });
        //the title
        var _title = _wrapper.addBanner(0, 0, 0, 0, this.titleBackColor, _bigback);
        _title.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 35 / 395);
        });
        //the push pin
        var _pin = _wrapper.addPushPin(0, 0, 0, "Click to dock chart", this.pinSwitchColor[0], this.pinSwitchColor[1], _title);
        _pin.absolute = true;
        _pin.addScaleHandler(function (scale) {
            this.r = this.parentNode.h * 0.3;
            this.top = this.parentNode.h / 2;
            this.left = this.parentNode.w - this.r - 5;
            this.cx = this.cy = 0;
        });
        _pin.applyStartPointHandler(function (x, y) {
            this.cx = x;
            this.cy = y;
        });
        _pin.addToolTip();

        _pin.onmousemove(function (cord) {
            that.setCanvasStyle("cursor", "pointer");
            var w = 120;
            this.toolTip.setStyle("width", w + "px");
            this.toolTip.setStyle("borderRadius", "5px 6px");
            this.toolTip.show();
            this.toolTip.move(cord.e.pageX - cord.x + this.left - w + that.sx + this.r, cord.e.pageY + 20);
        });
        _pin.onmouseout(function () {
            that.setCanvasStyle("cursor", "");
            this.toolTip.hide();
        });
        //title content
        var _labTitle = _wrapper.addLable(0, 0, 0, 0, this.labTitleStyle.color, this.labTitleStyle.family, _title);
        _labTitle.addText(this.labTitleStyle.text, this.labTitleStyle.color, this.labTitleStyle.fontsize, this.labTitleStyle.family, this.labTitleStyle.weight);
        _labTitle.addText(this.labSubTitleStyle.text, this.labSubTitleStyle.color, this.labSubTitleStyle.fontsize, this.labSubTitleStyle.family, this.labSubTitleStyle.weight);

        _labTitle.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w / 80);
            this.top = Math.round(this.parentNode.h / 2);
            this.h = _title.h / 2;
            this.eachTxt(function (txtItem) {
                txtItem.fontsize = txtItem.fontsize * scale / that.scale;;
            });
        });


        var _btitle = _wrapper.addBanner(0, 0, 0, 0, "transparent", _bigback);
        _btitle.setZIndex(6);
        _btitle.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 55 / 395);
        });
        //this.groupTitles = ["Windows Windows Live Division", "Server and Tools", "Online Services Division", "Microsoft Business Division", "Entertainment and Devices Division"]
        //this.groupTitles = ["a d e f g h g g g g g g ", "Server and Tools", "b", "c", "Entertainment and Devices Division"]

        var _fontsize = 12;
        var _fontFamily = that.labTitleStyle.family;
        var _color = "RGB(128,128,128)";

        for (var mk = 0, mlen; mlen = this.groupTitles.length, mk < mlen; mk++) {


            var _blabTitle = _wrapper.addRowLable(0, 0, 0, 0, "", this.labTitleStyle.family, _btitle);
            _blabTitle.absolute = true;
            _blabTitle.top = 7;
            (function (i) {
                _blabTitle.addScaleHandler(function (scale) {
                    var _o;
                    var _solts;
                    var _length;
                    if (_axis.renderReady) {
                        _solts = _axis.axisLabelSolts;

                        _o = _axis.getOrigin();
                    }
                    else {
                        _solts = _axis2.axisLabelSolts;
                        _o = _axis2.getOrigin();
                    }

                    // messureText: function (weight, fontSize, fontFamily, text) {
                    if (this.txtStorage.length == 0) {
                        var txts = that.groupTitles[i].split(" ");
                        var tmw = 0;
                        var tmpw = 0;
                        var txt = "";
                        var sx = 0;
                        var len = 0;
                        for (var ti = 0; ti < txts.length; ti++) {
                            tmpw = that.wrapper.messureText("", _fontsize * scale / that.scale, _fontFamily, txts[ti] + " ").width;
                            tmw += tmpw;
                            len = _solts[i][0].length * _solts[i].length;
                            if (tmw >= len) {
                                if (txt.trim() == "") {
                                    this.addText(len, txts[ti] + " ", _color, _fontsize, _fontFamily, "", "center");

                                }
                                else {
                                    this.addText(len, txt, _color, _fontsize, _fontFamily, "", "center");
                                    txt = txts[ti] + " ";
                                }
                                tmw = tmpw;
                            }
                            else {
                                txt += txts[ti] + " ";
                            }
                            if (ti == txts.length - 1) {
                                if (tmw < len) {
                                    this.addText(len, txt, _color, _fontsize, _fontFamily, "", "center");

                                }
                            }
                        }


                    }


                    this.left = _o.x + _solts[i][0].start;
                    this.top = this.top * scale / that.scale;

                    //this.h = _btitle.h * 2 / 3;            
                    this.eachTxt(function (txtItem) {
                        // txtItem.fontsize = this.h < 7 ? 7 : this.h;
                        txtItem.fontsize = txtItem.fontsize * scale / that.scale;
                        txtItem.w = _solts[i][0].length * _solts[i].length;
                    });
                });
            })(mk);


        }





        //_bgPointer.moveDown(_title);
        var _btnLine = _wrapper.addBanner(0, 0, 0, 0, this.tabBackColor, _bigback);
        _btnLine.setPosition(_borderWidth, 0);
        _btnLine.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - _borderWidth * 2);
            this.h = Math.round(this.parentNode.h * 20 / 395);
            // this.backColor = _wrapper.createLinearGradient(0, 0, 0, this.h, that.tabBackColor.LinearGradient);
        });

        //chart back, the gradient
        var _chartBack = _wrapper.addBanner(0, 0, 0, 0, this.axisBackColor, _bigback);
        _chartBack.setPosition(_borderWidth, 0);
        _chartBack.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - 2 * _borderWidth);
            this.h = (that.h * 280 / 395) * scale;
            this.backColor = _wrapper.createLinearGradient(0, 0, 0, this.h, { 0: "rgb(255,255,255)", 0.3: "rgb(255,255,255)", 0.5: "rgb(240,240,240)", 0.7: "rgb(236,236,236)" });

        });

        //axis
        var _axis = _wrapper.addAxis2LeftCoord(0, 0, 0, 0, "transparent", _chartBack);
        _axis.setZIndex(3);
        _axis.applyAxisLines(this.quarterlyAxis.lines);
        _axis.applyVerticalLine(1);
        _axis.applyLineColor(this.quarterlyAxis.linecolor);
        _axis.applyLabColor(this.quarterlyAxis.labcolor);
        var _tlabs = this.quarterlyAxis.labitems;
        if (_tlabs && _tlabs.length > 0) {
            _axis.calculateHorizonSolts(_tlabs.length);
            _axis.applyLabs(_tlabs);
            _axis.calculateHorizonLabelSolts();
        }

        _axis.float = true;
        _axis.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h);
            var max = Math.max.apply(null, that.quarterlyAxis.lrange);
            var min = Math.min.apply(null, that.quarterlyAxis.lrange);
            var precision = IR.Common.getPrecision(Math.abs(max) + Math.abs(min), that.scalePrecision.left);
            this.applyCoordinationLeft(max, min, precision); this.calculateHorizonSolts(_tlabs.length);
            this.calculateHorizonLabelSolts();
        });

        var _axis2 = _wrapper.addAxis2LeftCoord(0, 0, 0, 0, "transparent", _chartBack);
        _axis2.setZIndex(2);
        _axis2.applyVerticalLine(1);
        _axis2.applyAxisLines(this.yearToDateAxis.lines);
        _axis2.applyLineColor(this.yearToDateAxis.linecolor);
        _axis2.applyLabColor(this.yearToDateAxis.labcolor);
        var _labs = this.yearToDateAxis.labitems;
        if (_labs && _labs.length > 0) {
            _axis2.calculateHorizonSolts(_labs.length);
            _axis2.applyLabs(_labs);
            _axis2.calculateHorizonLabelSolts();
        }

        _axis2.absolute = true;

        _axis2.setRenderFlag(false);

        _axis2.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h);
            var max = Math.max.apply(null, that.yearToDateAxis.lrange);
            var min = Math.min.apply(null, that.yearToDateAxis.lrange);
            var precision = IR.Common.getPrecision(Math.abs(max) + Math.abs(min), that.scalePrecision.left);
            this.applyCoordinationLeft(max, min, precision); this.calculateHorizonSolts(_labs.length);
            this.calculateHorizonLabelSolts();
        });



        //btns, front canvas starts
        //btns
        var _btn = _wrapper.addButton(0, 0, 0, 0, this.quarterlyTabStyle.text, this.quarterlyTabStyle.backcolor, _btnLine);
        _btn.left = 0;
        _btn.setZIndex(8);
        _btn.float = true;
        _btn.selected = true; //need to reset when clicked
        _btn.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
            this.left = this.left * scale / that.scale;
            this.top = 0;
        });

        var _btn2 = _wrapper.addButton(0, 0, 0, 0, this.yearToDateTabStyle.text, this.yearToDateTabStyle.backcolor, _btnLine);
        _btn2.setZIndex(9);
        _btn2.applyFont(this.yearToDateTabStyle.fontcolor);
        _btn2.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
            this.top = 0;
        });
        function tabinCtrl(cord) {
            var _sx, _sy, _ex, _ey;
            _sx = (typeof this.sx == "function" ? this.sx() : this.sx);
            _sy = (typeof this.sy == "function" ? this.sy() : this.sy);
            _ex = (typeof this.ex == "function" ? this.ex() : this.ex);
            _ey = (typeof this.ey == "function" ? this.ey() : this.ey) + this.h / 2;
            var _cordX = cord.x - (this.ox != undefined ? this.ox : 0);
            var _cordY = cord.y - (this.oy != undefined ? this.oy : 0);
            var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
            var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
            return !(_x || _y);
        }
        _btn2.addIsInCrtl(tabinCtrl);
        _btn.addIsInCrtl(tabinCtrl);
        //back banner
        var _backBanner = _wrapper.addBanner(0, 0, 0, 0, this.tabSelectedColor, _btnLine);
        _backBanner.left = 0;
        _backBanner.setZIndex(3);
        _backBanner.absolute = true;
        _backBanner.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = _btnLine.h;
            this.left = initTab ? Math.round(120 * scale) : this.left * scale / that.scale;
            initTab = false;
        });
        _backBanner.applySetLTHandler(function (change) {
            this.sx = Math.floor(this.sx)
            this.left = this.sx - this.parentNode.sx;
        });

        //_span
        var _span = _wrapper.addSpan(0, 0, 0, 0, "", _bigback);
        _span.absolute = true;
        _span.setRenderFlag(false);
        _span.addScaleHandler(function (scale) {
            this.w = Math.round(60 * scale);
            this.h = Math.round(20 * scale);
        });

        //bars
        var _bars = [];
        var tempColor;
        var tempIndex;
        for (var i = 0; i < this.quarterlyAxis.data.length; i++) {
            for (var j = 0, len = this.quarterlyAxis.data[i].length; j < len ; j++) {
                tempIndex = (len * i + j) % len;
                tempColor = this.quarterlyAxis.barcolors[tempIndex];
                var _tempBar = _wrapper.addBar(0, 0, 0, 0, parseFloat(parseFloat(this.quarterlyAxis.data[i][j]).toFixed(this.precision)).toFixed(this.precision), tempColor, _axis);
                _tempBar.setZIndex(7);
                _tempBar.value = this.quarterlyAxis.data[i][j];
                _tempBar.absolute = true;
                (function (i, j) {

                    function over1(cord) {
                        that.setCanvasStyle("cursor", "pointer");
                        var obj = this
                        if (!animateState) return;

                        function displayAllBarTitle() {
                            for (var m = 0, cm; cm = that.quarterlyAxis.data[m]; m++) {
                                for (var n = 0, len; len = cm.length, n < len; n++) {
                                    _bars[len * m + n].isDisplayTitle = true;
                                }
                            }
                            _span.hide();
                            ani2.repaint();
                        }
                        displayAllBarTitle();

                        listenerFunc();
                        function listenerFunc() {
                            var tmpMax = 0;
                            var len = that.quarterlyAxis.data[i].length;
                            var k = 0;
                            var caption = "";
                            var _solts = _axis.solts;
                            var _o = _axis.getOrigin();
                            // var _x = (_bars[len * i].sx) + (_bars[len * i].ox != undefined ? _bars[len * i].ox : 0);
                            var _x = _solts[i].start + _o.x;
                            var _y;
                            for (var m = 0; m < that.quarterlyAxis.data[i].length; m++) {
                                if (tmpMax < Math.abs(that.quarterlyAxis.data[i][m])) {
                                    tmpMax = Math.abs(that.quarterlyAxis.data[i][m])
                                    k = m;
                                }
                                caption += _bars[len * i + m].caption + " | ";
                                _bars[len * i + m].isDisplayTitle = false;
                            }
                            caption = caption.slice(0, caption.length - 2);
                            var tmpbar = _bars[len * i + k];
                            if (parseFloat(tmpbar.value) < 0) {
                                _y = (tmpbar.ey() + 2) + (tmpbar.oy != undefined ? tmpbar.oy : 0);
                            }
                            else {
                                _y = (tmpbar.ey() - _span.h - 2) + (tmpbar.oy != undefined ? tmpbar.oy : 0);
                            }
                            _span.updateText(caption);
                            ani2.repaint();
                            for (var m = 0; m < that.quarterlyAxis.data[i].length; m++) {
                                _bars[len * i + m].repaint();
                            }

                            _span.w = _solts[i].length - _span.h;
                            _span.moveTo(_x, _y);
                        }
                    }

                    _tempBar.onmousemove(over1);
                    _tempBar.onmouseout(function (cord) {
                        that.setCanvasStyle("cursor", "");
                        var lasted = new Date().getTime();
                        isInCtrl = false;
                        function listenerFunc() {
                            for (var m = 0, len; len = that.quarterlyAxis.data[i].length, m < len; m++) {
                                isInCtrl = isInCtrl || that.wrapper.isInCtrl(cord, _bars[len * i + m]);
                                _bars[len * i + m].isDisplayTitle = true;
                            }
                            if (!isInCtrl) {
                                ani2.repaint();
                                _span.hide();
                            }
                        }
                        listenerFunc();
                    });

                    _tempBar.ontouchstart(function (cord) {
                        ani2.repaint();
                        over1(cord);
                    });

                    _tempBar.ontouchend(function () { });
                    _tempBar.onclick(function () {
                        var blen = that.quarterlyAxis.barlink.length;
                        if (blen == 0) return;
                        var index = Math.floor((that.quarterlyAxis.data[i].length * i + j) / 2);
                        var href = that.quarterlyAxis.barlink[index % blen];
                        if (href.trim().length > 0) {
                            location.href = href;
                        }

                    });
                    _tempBar.addScaleHandler(function (scale) {
                        var _o = _axis.getOrigin();
                        var _l = _axis.axisLabelSolts;
                        var _solts = _axis.solts;
                        this.h = this.h * scale / that.scale;
                        this.left = _l[i][j].start;
                        this.w = _l[i][j].length;

                        this.setOriginPoint(_o.x, _o.y);
                        var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2) + this.ox;
                        var _y = (this.ey()) + this.oy;
                        _span.move(_x, _y);

                    });
                    _tempBar.applyStartPointHandler(function (x, y) {
                        this.sx = this.left;
                    });
                    _tempBar.applyFont("RGB(119,119,119)", _span.size, "Segoe UI", "Bold");
                    _tempBar.isDisplayTitle = false;
                    _tempBar.addRenderHandler(function () {
                        if (this.isDisplayTitle) {
                            this.wrapper.writeText(this.sx, barTextSY(this.caption, this), this.w, _span.h, this.caption.replace("$", ""), this.fontColor, this.fontSize, this.family, this.weight);

                        }

                    })
                })(i, j);
                _bars.push(_tempBar);
            }
        }
        function barTextSY(text, bar) {
            var tmph;
            if (parseFloat(bar.value) < 0) {
                tmph = bar.ey();
            }
            else {
                tmph = bar.ey() - _span.h
            }
            return tmph;
        }
        //the second batch of bars
        var _bars2 = [];
        for (var i = 0; i < this.yearToDateAxis.data.length; i++) {
            for (var j = 0, len = this.yearToDateAxis.data[i].length; j < len; j++) {

                tempIndex = (len * i + j) % len;
                tempColor = this.yearToDateAxis.barcolors[tempIndex];

                var _tempBar = _wrapper.addBar(0, 0, 0, 0, parseFloat(parseFloat(this.yearToDateAxis.data[i][j]).toFixed(this.precision)).toFixed(this.precision), tempColor, _axis2);
                _tempBar.setZIndex(7);
                _tempBar.value = this.yearToDateAxis.data[i][j];
                _tempBar.absolute = true;
                _tempBar.group = i;
                (function (i, j) {
                    _tempBar.onclick(function () {
                        var blen = that.yearToDateAxis.barlink.length;
                        if (blen == 0) return;
                        var index = Math.floor((that.yearToDateAxis.data[i].length * i + j) / 2);
                        var href = that.yearToDateAxis.barlink[index % blen];
                        if (href.trim().length > 0) {
                            location.href = href;
                        }

                    });

                    function over2(cord) {

                        that.setCanvasStyle("cursor", "pointer");
                        var obj = this
                        if (!animateState) return;

                        function displayAllBarTitle() {
                            for (var m = 0, cm; cm = that.yearToDateAxis.data[m]; m++) {
                                for (var n = 0, len; len = cm.length, n < len; n++) {
                                    _bars2[len * m + n].isDisplayTitle = true;
                                }
                            }
                            _span.hide();
                            ani3.repaint();
                        }
                        displayAllBarTitle();


                        listenerFunc();
                        function listenerFunc() {
                            var tmpMax = 0;
                            var len = that.yearToDateAxis.data[i].length;
                            var k = 0;
                            var caption = "";
                            // var _x = (_bars2[len * i].sx) + (_bars2[len * i].ox != undefined ? _bars2[len * i].ox : 0);

                            var _solts = _axis.solts;
                            var _o = _axis.getOrigin();

                            var _x = _solts[i].start + _o.x;
                            var _y;
                            for (var m = 0; m < that.yearToDateAxis.data[i].length; m++) {
                                if (tmpMax < Math.abs(that.yearToDateAxis.data[i][m])) {
                                    tmpMax = Math.abs(that.yearToDateAxis.data[i][m])
                                    k = m;
                                }
                                caption += _bars2[len * i + m].caption + " | ";
                                _bars2[len * i + m].isDisplayTitle = false;
                            }
                            caption = caption.slice(0, caption.length - 2);
                            var tmpbar = _bars2[len * i + k];
                            if (parseFloat(tmpbar.value) < 0) {
                                _y = (tmpbar.ey() + 2) + (tmpbar.oy != undefined ? tmpbar.oy : 0);
                            }
                            else {
                                _y = (tmpbar.ey() - _span.h - 2) + (tmpbar.oy != undefined ? tmpbar.oy : 0);
                            }
                            _span.updateText(caption);
                            ani3.repaint();
                            for (var m = 0; m < that.yearToDateAxis.data[i].length; m++) {
                                _bars2[len * i + m].repaint();
                            }
                            _span.w = _solts[i].length - _span.h;
                            _span.moveTo(_x, _y);
                        }
                    }

                    _tempBar.onmousemove(over2);

                    function out(cord) {
                        that.setCanvasStyle("cursor", "");
                        var lasted = new Date().getTime();
                        var isInCtrl = false;
                        function listenerFunc() {
                            for (var m = 0, len; len = that.yearToDateAxis.data[i].length, m < len; m++) {
                                isInCtrl = isInCtrl || that.wrapper.isInCtrl(cord, _bars2[len * i + m]);
                                _bars2[len * i + m].isDisplayTitle = true;
                            }
                            if (!isInCtrl) {
                                ani3.repaint();
                                _span.hide();
                            }
                        }

                        listenerFunc();

                    }

                    _tempBar.onmouseout(out);

                    _tempBar.ontouchstart(function (cord) {
                        ani3.repaint();
                        over2(cord);
                    });
                    _tempBar.ontouchend(function () { });

                    _tempBar.addScaleHandler(function (scale) {
                        var _o = _axis2.getOrigin();

                        var _l = _axis2.axisLabelSolts;
                        var _solts = _axis2.solts;
                        this.h = this.h * scale / that.scale;
                        this.left = _l[i][j].start;
                        this.w = _l[i][j].length;
                        var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                        var _y = (this.ey() - _span.h - 5);
                        _span.move(_x, _y);
                        this.setOriginPoint(_o.x, _o.y);

                    });
                    _tempBar.isDisplayTitle = false;
                    _tempBar.setRenderFlag(false);
                    _tempBar.applyFont("RGB(119,119,119)", _span.size, "Segoe UI", "Bold");
                    _tempBar.addRenderHandler(function () {
                        if (this.isDisplayTitle) {
                            this.wrapper.writeText(this.sx, barTextSY(this.caption, this), this.w, _span.h, this.caption.replace("$", ""), this.fontColor, this.fontSize, this.family, this.weight);
                        }

                    })
                    _tempBar.applyStartPointHandler(function (x, y) {
                        this.sx = this.left;
                        this.sy = this.top;
                    });
                })(i, j);
                _bars2.push(_tempBar);
            }
        }
        //animation
        //animation 1
        var ani1 = _wrapper.addAnimation(20);
        ani1.applyCtrls(_btnLine, _backBanner, _btn, _btn2);
        ani1.logChanges(_backBanner, { sx: 120 }, 0, 1);

        //animation 2
        var ani2 = _wrapper.addAnimation(20);
        //ani2.applyCtrls(_chartBack, _axis, _line);
        ani2.applyCtrls(_chartBack, _axis);
        for (var i = 0; i < _bars.length; i++) {
            ani2.logChanges(_bars[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        //animation 3
        var ani3 = _wrapper.addAnimation(20);
        ani3.applyCtrls(_chartBack, _axis2);
        // ani3.cloneImpactedControls(ani2);
        for (var i = 0; i < _bars2.length; i++) {
            ani3.logChanges(_bars2[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        function getValue(d) {
            var tmp = Math.abs(d);
            if (tmp <= 1 && tmp > 0) {
                if (d < 0) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            return d;
        }
        _axis.addScaleHandler(function () {
            var _unit = this.leftRange.unit || 1;
            var col = that.quarterlyAxis.data.length > 0 ? that.quarterlyAxis.data[0].length : 1;
            var v;
            for (var i = 0, ci; ci = ani2.changeList[i]; i++) {
                // v = parseFloat(that.quarterlyAxis.data[Math.floor(i / col)][i % col]).toFixed(that.precision);
                v = parseFloat(that.quarterlyAxis.data[Math.floor(i / col)][i % col]);
                ci.setFirstRange(getValue(v * _unit) - 0.1);//sub 0.1 pix to fix blur
            }

        });
        _axis2.addScaleHandler(function () {
            var _unit = this.leftRange.unit || 1;
            var col = that.yearToDateAxis.data.length > 0 ? that.yearToDateAxis.data[0].length : 1;
            var v;
            for (var i = 0, ci; ci = ani3.changeList[i]; i++) {
                //v = parseFloat(that.yearToDateAxis.data[Math.floor(i / col)][i % col]).toFixed(that.precision);
                v = parseFloat(that.yearToDateAxis.data[Math.floor(i / col)][i % col]);
                ci.setFirstRange(getValue(v * _unit) - 0.1);//sub 0.1 pix to fix blur
            }
        });


        _axis.addScaleHandler(function (scale) {
            _span.scale(scale);
            for (var m = 0, cm; cm = that.quarterlyAxis.data[m]; m++) {
                for (var n = 0, len; len = cm.length, n < len; n++) {
                    _bars[len * m + n].isDisplayTitle = true;
                }
            }
            _span.hide();

        });
        _axis2.addScaleHandler(function (scale) {
            _span.scale(scale);
            for (var m = 0, cm; cm = that.yearToDateAxis.data[m]; m++) {
                for (var n = 0, len; len = cm.length, n < len; n++) {
                    _bars2[len * m + n].isDisplayTitle = true;
                }
            }
            _span.hide();


        });
        ani1.addClearHandler(function () {
            this.applyClearArea(_btnLine.sx, _btnLine.sy, _btnLine.w, _btnLine.h);
        });

        ani2.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });

        ani3.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });

        ani2.attachDeactiveHandler(function (bars) {
            var tmph;
            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.wrapper.save();
                ci.wrapper.translate(ci.ox, ci.oy);
                tmph = barTextSY(ci.caption, ci);
                ci.wrapper.writeText(ci.sx, tmph, ci.w, _span.h, ci.caption.replace("$", ""), ci.fontColor, _span.size, ci.family, ci.weight);
                ci.wrapper.restore();
                ci.isDisplayTitle = true;
            }
            animateState = true;
        });

        ani3.attachDeactiveHandler(function () {
            var tmph;
            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.wrapper.save();
                ci.wrapper.translate(ci.ox, ci.oy);
                tmph = barTextSY(ci.caption, ci);
                ci.wrapper.writeText(ci.sx, tmph, ci.w, _span.h, ci.caption.replace("$", ""), ci.fontColor, _span.size, ci.family, ci.weight);
                ci.wrapper.restore();
                ci.isDisplayTitle = true;
            }
            animateState = true;
        });

        _btn.onclick(function () {
            if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                animateState = false;
                this.tabSelectedColor = "white";
                setQRenderFlag(true);
                setYRenderFlag(false);
                ani1.resetOnlyStatus();
                ani1.setFirstRange(-this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn2.fontColor = that.yearToDateTabStyle.fontcolor;
                ani3.reset();
                ani2.restart();
            }
        });

        _btn2.onclick(function () {
            if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                animateState = false;
                setQRenderFlag(false);
                setYRenderFlag(true);
                ani1.resetOnlyStatus();
                ani1.setFirstRange(this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn.fontColor = that.yearToDateTabStyle.fontcolor;
                ani2.reset();
                ani3.restart();
            }
        });

        function pinClick() {
            // this.pinClickHandler.notify(arguments);
            if (_pin.checked) {
                that.pinCheckedHandler.notify();
                _pin.caption = "Click to undock chart"

            }
            else {
                that.pinNoCheckedHandler.notify();
                _pin.caption = "Click to dock chart"
            }
            if (_pin.toolTip) {
                _pin.toolTip.updateText(_pin.caption);
            }

        }

        _pin.onclick(pinClick);
        function setQRenderFlag(flag) {
            _axis.setRenderFlag(flag);
            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.isDisplayTitle = false;
                ci.setRenderFlag(flag);
            }

            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.isDisplayTitle = false;
            }
        }
        function setYRenderFlag(flag) {
            _axis2.setRenderFlag(flag);
            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.isDisplayTitle = false;
                ci.setRenderFlag(flag);
            }

            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.isDisplayTitle = false;

            }
        }
        if (initTab) {
            _btn2.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn.applyFont(this.yearToDateTabStyle.fontcolor);
            setYRenderFlag(true);
            setQRenderFlag(false);
            ani3.active();
        }
        else {
            _btn.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn2.applyFont(this.yearToDateTabStyle.fontcolor);
            setYRenderFlag(false);
            setQRenderFlag(true);
            ani2.active();
        }
        if (isQ4) {
            _btn2.caption = "Annual";
        }
        that.touchFlagDisableCtrl.push(_bigback);

    });

}
inheritPrototype(IR.ClusteredColumn, IR.Chart);
multipleinheritPrototype(IR.ClusteredColumn, IR.ChartColumnAttribute);
IR.ClusteredColumn.prototype.setGroupTitle = function (titles) {
    this.groupTitles = titles;
};


/*****************************************************************/
IR.StackedColumnAndLine = function (sx, sy, w, h, scale) {
    IR.Chart.apply(this, arguments);
    IR.ChartColumnAttribute.apply(this, null);
    this.config(function () {
        //prepare the canvases
        var _wrapper = this.wrapper;
        var _cSize = { w: w, h: h };
        var _start = { x: this.sx, y: this.sy };
        var that = this; //save the "this"
        var initTab, isQ4 = this.isContainQ4();
        if (this.initTab == undefined) {
            initTab = isQ4;
        }
        else {
            initTab = this.initTab;
        }
        var animateState = false;
        //add the background
        var _bigback = _wrapper.addBanner(0, 0, 0, 0, this.bigbackColor);
        _bigback.setBorderState(true)
        _bigback.applyBorder(1, "RGB(207,207,207)");
        var _borderWidth = _bigback.borderWidth;
        _bigback.addScaleHandler(function (scale) {
            this.w = Math.round(_cSize.w * scale);
            this.h = Math.round(_cSize.h * scale);
            this.setPosition(that.sx, that.sy);
        });
        var isZoomOut;
        _bigback.ontouchstart(function (cord) {
            var isInChild = false;
            var inChild = [_btn, _btn2, _backBanner, _chk, _chk1, _chk2].concat(_bars).concat(_bars2).concat(_ybars).concat(_ybars2).concat(_line).concat(_yline).concat(_line.points).concat(_yline.points);
            for (var i = 0, ci; ci = inChild[i]; i++) {
                isInChild = _wrapper.isInCtrl(cord, ci);
                if (isInChild) {
                    break;
                }
            }

            isZoomOut = !that.chartIsZoomOut;
            if (isZoomOut) {
                changePinState(true);
                //that.setMouseOrTouchFlag(null, false);
                that.rootElementTouchStartOddHandler.notify(_wrapper.canvas);
                //that.setMouseOrTouchFlag(null, true);
            }
            else {
                if (!isInChild) {
                    changePinState(false)
                    that.rootElementTouchStartEvenHandler.notify(_wrapper.canvas);
                    //that.setMouseOrTouchFlag(null, false);
                    //this.setTouchFlag(true);
                }
            }
            function changePinState(flag) {
                _pin.checked = flag;
                pinClick();
                _pin.curColor = _pin.checked ? _pin.pinColor : _pin.pushColor;
            }

        });
        _bigback.ontouchend(function () {


        });
        _bigback.setTouchFlag(true);
        _bigback.ontouchmove(function () { });
        //the title
        var _title = _wrapper.addBanner(0, 0, 0, 0, this.titleBackColor, _bigback);
        _title.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 36 / 420);
        });

        //the push pin
        var _pin = _wrapper.addPushPin(0, 0, 0, "Click to dock chart", this.pinSwitchColor[0], this.pinSwitchColor[1], _title);
        _pin.absolute = true;
        _pin.addScaleHandler(function (scale) {
            this.r = this.parentNode.h * 0.3;
            this.top = this.parentNode.h / 2;
            this.left = this.parentNode.w - this.r - 5;
            this.cx = this.cy = 0;
        });
        _pin.applyStartPointHandler(function (x, y) {
            this.cx = x;
            this.cy = y;
        });
        _pin.addToolTip();

        _pin.onmousemove(function (cord) {
            that.setCanvasStyle("cursor", "pointer");
            var w = 120;
            this.toolTip.setStyle("width", w + "px");
            this.toolTip.setStyle("borderRadius", "5px 6px");
            this.toolTip.show();
            this.toolTip.move(cord.e.pageX - cord.x + this.left - w + that.sx + this.r, cord.e.pageY + 20);
        });
        _pin.onmouseout(function () {
            that.setCanvasStyle("cursor", "");
            this.toolTip.hide();
        });
        //title content
        var _labTitle = _wrapper.addLable(0, 0, 0, 0, this.labTitleStyle.color, this.labTitleStyle.family, _title);
        _labTitle.addText(this.labTitleStyle.text, this.labTitleStyle.color, this.labTitleStyle.fontsize, this.labTitleStyle.family, this.labTitleStyle.weight);
        _labTitle.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w / 80);
            this.top = Math.round(this.parentNode.h / 3);
            this.h = _title.h / 3;
            this.eachTxt(function (txtItem) {

                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });

        var _labSubTitle = _wrapper.addLable(0, 0, 0, 0, this.labSubTitleStyle.color, this.labSubTitleStyle.family, _title);
        _labSubTitle.addText(this.labSubTitleStyle.text, this.labSubTitleStyle.color, this.labSubTitleStyle.fontsize, this.labSubTitleStyle.family, this.labSubTitleStyle.weight);
        _labSubTitle.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w / 80);
            this.top = 0;
            this.h = _title.h / 3;
            this.eachTxt(function (txtItem) {

                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });


        //the line banner
        //_bgPointer.moveDown(_title);
        var _btnLine = _wrapper.addBanner(0, 0, 0, 0, this.tabBackColor, _bigback);
        _btnLine.setPosition(_borderWidth, 0);
        _btnLine.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - 2 * _borderWidth);
            this.h = Math.round(this.parentNode.h * 22 / 420);
            //alert("_btnLine:" + this.h);
        });

        //chart back, the gradient
        var _chartBack = _wrapper.addBanner(0, 0, 0, 0, this.axisBackColor, _bigback);
        _chartBack.setPosition(_borderWidth, 0);
        _chartBack.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - 2 * _borderWidth);
            this.h = Math.round(362 / 420 * this.parentNode.h);
            this.backColor = _wrapper.createLinearGradient(0, 0, 0, this.h, { 0: "rgb(255,255,255)", 0.3: "rgb(255,255,255)", 0.5: "rgb(240,240,240)", 0.7: "rgb(236,236,236)" });
        });

        //axis
        var _axis = _wrapper.addAxis2(0, 0, 0, 0, "transparent", _chartBack);
        _axis.setZIndex(3);
        _axis.float = true;
        _axis.applyAxisLines(this.quarterlyAxis.lines);
        _axis.applyLineColor(this.quarterlyAxis.linecolor);
        _axis.applyLabColor(this.quarterlyAxis.labcolor);

        var _tlabs = this.quarterlyAxis.labitems[0];
        _axis.applyVerticalLine(1);
        _axis.applyVLinePosition(_tlabs.length - 1);
        _axis.setCurrentBar([_tlabs.length - 1], { 0: "RGB(240,240,240)", 1: "RGB(255,255,255)" });
        if (_tlabs && _tlabs.length > 0) {
            _axis.calculateHorizonSolts(_tlabs.length);
            _axis.applyLabs(_tlabs);
        }





        _axis.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 250 / 362);// Math.round(this.parentNode.h);
            //var max = Math.max.apply(null, that.quarterlyAxis.lrange);
            //var min = Math.min.apply(null, that.quarterlyAxis.lrange);
            //var precision = IR.Common.getPrecision(Math.abs(max) + Math.abs(min), that.precision);

            this.applyCoordinationBoth(that.quarterlyAxis.lrange, that.quarterlyAxis.rrange, that.scalePrecision.left, that.scalePrecision.right);
            this.calculateHorizonSolts(_tlabs.length);
        });
        //axis2  Mingli

        var _axis2 = _wrapper.addAxis2(0, 0, 0, 0, "transparent", _chartBack);
        _axis2.setZIndex(20);
        _axis2.absolute = true;
        _axis2.applyAxisLines(this.yearToDateAxis.lines);
        _axis2.applyLineColor(this.yearToDateAxis.linecolor);
        _axis2.applyLabColor(this.yearToDateAxis.labcolor);
        var _labs = this.yearToDateAxis.labitems[0];
        _axis2.applyVerticalLine(1);
        _axis2.applyVLinePosition(_labs.length - 1);
        _axis2.setCurrentBar([_labs.length - 1], { 0: "RGB(240,240,240)", 1: "RGB(255,255,255)" });
        if (_labs && _labs.length > 0) {
            _axis2.calculateHorizonSolts(_labs.length);
            _axis2.applyLabs(_labs);
        }
        _axis2.setRenderFlag(true);
        _axis2.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w);
            this.h = Math.round(this.parentNode.h * 250 / 362);
            this.applyCoordinationBoth(that.yearToDateAxis.lrange, that.yearToDateAxis.rrange, that.scalePrecision.left, that.scalePrecision.right);
            this.calculateHorizonSolts(_labs.length);
        });



        //btns, front canvas starts
        //btns
        var _btn = _wrapper.addButton(0, 0, 0, 0, this.quarterlyTabStyle.text, this.quarterlyTabStyle.backcolor, _btnLine);
        _btn.left = 0;
        _btn.setZIndex(8);
        _btn.float = true;
        _btn.selected = true; //need to reset when clicked
        _btn.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(this.parentNode.h);
            this.left = this.left * scale / that.scale;
        });

        var _btn2 = _wrapper.addButton(0, 0, 0, 0, this.yearToDateTabStyle.text, this.yearToDateTabStyle.backcolor, _btnLine);
        _btn2.setZIndex(9);
        _btn2.applyFont("white");
        _btn2.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(this.parentNode.h);
        });
        function tabinCtrl(cord) {
            var _sx, _sy, _ex, _ey;
            _sx = (typeof this.sx == "function" ? this.sx() : this.sx);
            _sy = (typeof this.sy == "function" ? this.sy() : this.sy);
            _ex = (typeof this.ex == "function" ? this.ex() : this.ex);
            _ey = (typeof this.ey == "function" ? this.ey() : this.ey) + this.h / 2;
            var _cordX = cord.x - (this.ox != undefined ? this.ox : 0);
            var _cordY = cord.y - (this.oy != undefined ? this.oy : 0);
            var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
            var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
            return !(_x || _y);
        }
        _btn2.addIsInCrtl(tabinCtrl);
        _btn.addIsInCrtl(tabinCtrl);

        //back banner
        var _backBanner = _wrapper.addBanner(0, 0, 0, 0, this.tabSelectedColor, _btnLine);
        _backBanner.left = 0;
        _backBanner.setZIndex(3);
        _backBanner.absolute = true;
        _backBanner.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(this.parentNode.h);
            this.left = initTab ? Math.round(120 * scale) : this.left * scale / that.scale;
            initTab = false;
        });
        _backBanner.applySetLTHandler(function (change) {
            this.sx = Math.floor(this.sx)
            this.left = this.sx - this.parentNode.sx;
            //console.log(this.left);
        });

        //_span
        var _span = _wrapper.addSpan(0, 0, 0, 0, "", _bigback);
        _span.absolute = true;
        _span.setRenderFlag(false);
        _span.addScaleHandler(function (scale) {
            this.w = Math.round(30 * scale);
            this.h = Math.round(20 * scale);
        });


        //bars
        var _bars = [];
        var qBarData = this.quarterlyAxis.data[0];
        var qBar1Data = this.quarterlyAxis.data[1];
        var qLineData = this.quarterlyAxis.data[2];
        for (var i = 0; i < qBarData.length; i++) {
            var color = this.quarterlyAxis.barcolors[0];
            var _tempBar = _wrapper.addBar(0, 0, 0, 1, "$" + parseFloat(parseFloat(qBarData[i]).toFixed(this.precision)).toFixed(this.precision), color, _axis);
            _tempBar.value = qBarData[i];

            function over1(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (!animateState) return;
                var _x = (this.ex() - 5) + (this.ox != undefined ? this.ox : 0);
                var _y = cord.y;
                _span.updateText(this.caption);
                ani4.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            _tempBar.ontouchstart(over1);
            _tempBar.onmousemove(over1);
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                ani4.repaint();
            });
            _tempBar.ontouchend(function () { });
            _tempBar.absolute = true;

            (function (i) {

                _tempBar.onclick(function () {
                    var blen = that.quarterlyAxis.barlink.length;
                    if (blen == 0) return;
                    var href = that.quarterlyAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });


                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis.getOrigin();
                    var _solts = _axis.solts;
                    var _width = Math.round(35 * scale);
                    this.h = this.h * scale / that.scale;
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.w = _width;
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);
                    this.setOriginPoint(_o.x, _o.y);
                });
                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                });
            })(i);
            _bars.push(_tempBar);
        }

        //the second batch of bars
        var _bars2 = [];
        for (var i = 0; i < qBar1Data.length; i++) {
            var color = this.quarterlyAxis.barcolors[1 % this.quarterlyAxis.barcolors.length];
            var _tempBar = _wrapper.addBar(0, 0, 0, 1, "$" + parseFloat(parseFloat(qBar1Data[i]).toFixed(this.precision)).toFixed(this.precision), color, _axis);
            _tempBar.value = qBar1Data[i];
            _tempBar.setZIndex(7);

            function over2(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (!animateState) return;
                var _x = this.ex() - 5 + (this.ox != undefined ? this.ox : 0);
                var _y = cord.y;
                _span.updateText(this.caption);
                ani4.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            _tempBar.ontouchstart(over2);
            _tempBar.onmousemove(over2);
            _tempBar.ontouchend(function () { });
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                ani4.repaint();
            });
            _tempBar.absolute = true;

            (function (i) {
                _tempBar.onclick(function () {
                    var blen = that.quarterlyAxis.barlink.length;
                    if (blen == 0) return;
                    var href = that.quarterlyAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });
                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis.getOrigin();
                    var _solts = _axis.solts;
                    var _width = Math.round(35 * scale);
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.top = (_bars[i].renderReady ? -_bars[i].h : 0);
                    this.w = _width;
                    this.h = this.h * scale / that.scale;
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);
                    this.setOriginPoint(_o.x, _o.y);
                });

                _tempBar.applyResetHandler(function () {
                    var _o = _axis.getOrigin();
                    var _solts = _axis.solts;
                    var _width = Math.round(35 * that.scale);
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur

                    this.top = 0;
                });


                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                    this.sy = this.top;
                });
            })(i);
            _bars2.push(_tempBar);
        }
        //bar Mingli

        var _ybars = [];
        var yBarData = this.yearToDateAxis.data[0];
        var yBar1Data = this.yearToDateAxis.data[1];
        var yLineData = this.yearToDateAxis.data[2];
        for (var i = 0; i < yBarData.length; i++) {
            var color = this.yearToDateAxis.barcolors[0]
            var _tempBar = _wrapper.addBar(0, 0, 0, 0, "$" + parseFloat(parseFloat(yBarData[i]).toFixed(this.precision)).toFixed(this.precision), color, _axis2);
            _tempBar.value = yBarData[i];


            function yover1(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (!animateState) return;
                var _x = (this.ex() - 5) + (this.ox != undefined ? this.ox : 0);
                var _y = cord.y;
                _span.updateText(this.caption);
                yani4.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            _tempBar.onmousemove(yover1);
            _tempBar.ontouchstart(yover1)
            _tempBar.ontouchend(function () { });
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                yani4.repaint();
            });

            _tempBar.absolute = true;
            _tempBar.setZIndex(21);
            (function (i) {

                _tempBar.onclick(function () {
                    var blen = that.yearToDateAxis.barlink.length;
                    if (blen == 0) return;
                    var href = that.yearToDateAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });

                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis2.getOrigin();
                    var _solts = _axis2.solts;
                    var _width = Math.round(35 * scale);
                    this.h = this.h * scale / that.scale;
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.w = _width;
                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);
                    this.setOriginPoint(_o.x, _o.y);
                });
                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                });
            })(i);
            _ybars.push(_tempBar);
        }

        //the second batch of bars
        var _ybars2 = [];
        for (var i = 0; i < yBar1Data.length; i++) {
            var color = this.quarterlyAxis.barcolors[1 % this.yearToDateAxis.barcolors.length]

            var _tempBar = _wrapper.addBar(0, 0, 0, 0, "$" + parseFloat(parseFloat(yBar1Data[i]).toFixed(this.precision)).toFixed(this.precision), color, _axis2);
            _tempBar.value = yBar1Data[i];
            _tempBar.setZIndex(22);
            function yover2(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (!animateState) return;
                var _x = this.ex() - 5 + (this.ox != undefined ? this.ox : 0);
                var _y = cord.y;
                _span.updateText(this.caption);
                yani4.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            _tempBar.onmousemove(yover2);
            _tempBar.ontouchstart(yover2);
            _tempBar.ontouchend(function () { });
            _tempBar.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                yani4.repaint();
            });
            _tempBar.absolute = true;

            (function (i) {

                _tempBar.onclick(function () {
                    var blen = that.yearToDateAxis.barlink.length;
                    if (blen == 0) return;
                    var href = that.yearToDateAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });

                _tempBar.addScaleHandler(function (scale) {
                    var _o = _axis2.getOrigin();
                    var _solts = _axis2.solts;
                    var _width = Math.round(35 * scale);
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur
                    this.top = (_ybars[i].renderReady ? -_ybars[i].h : 0);
                    this.w = _width;
                    this.h = this.h * scale / that.scale;

                    var _x = (this.sx - Math.abs(this.w - _span.w - _span.h) / 2);
                    var _y = (this.ey() - _span.h - 5);
                    _span.move(_x, _y);
                    this.setOriginPoint(_o.x, _o.y);
                });

                _tempBar.applyResetHandler(function () {
                    var _o = _axis.getOrigin();
                    var _solts = _axis.solts;
                    var _width = Math.round(35 * that.scale);
                    this.left = Math.round(_solts[i].start + (_solts[i].length - _width) / 2) + 0.1;//added 0.1px to fix blur

                    this.top = 0;
                });


                _tempBar.applyStartPointHandler(function (x, y) {
                    this.sx = this.left;
                    this.sy = this.top;
                });
            })(i);
            _ybars2.push(_tempBar);
        }






        //the line
        var _linePoints = [];
        for (var i = 0; i < qLineData.length; i++) {
            _linePoints.push([0, 0, (Math.abs(qLineData[i])).toFixed(this.linePrecision)]);
        }
        var color = this.quarterlyAxis.barcolors[2 % this.quarterlyAxis.barcolors.length];
        var _line = _wrapper.addLine(_linePoints, color, 7, _axis);
        _line.setAbsolute(true);
        _line.setRenderFlagWithPoints(true);

        for (var i = 0, ci; ci = _line.points[i]; i++) {
            ci.absolute = true;
            function lover(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (!animateState) return;
                var _x = this.cx + (this.ox != undefined ? this.ox : 0) - (_span.w + _span.h) / 2;
                var _y = this.cy + (this.oy != undefined ? this.oy : 0) - this.r - _span.h - 2;
                _span.updateText("$ " + this.caption);
                ani4.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            ci.onmousemove(lover);
            ci.addIsInCrtl(function (cord) {
                var _sx, _sy, _ex, _ey;
                _sx = (typeof this.sx == "function" ? this.sx() : this.sx) - this.r;
                _sy = (typeof this.sy == "function" ? this.sy() : this.sy) - this.r;
                _ex = (typeof this.ex == "function" ? this.ex() : this.ex) + this.r;
                _ey = (typeof this.ey == "function" ? this.ey() : this.ey) + this.r;
                var _cordX = cord.x - (this.ox != undefined ? this.ox : 0);
                var _cordY = cord.y - (this.oy != undefined ? this.oy : 0);
                var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
                var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
                return !(_x || _y);
            });
            ci.ontouchstart(lover);
            ci.ontouchend(function () { });
            ci.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                ani4.repaint();
            });

            (function (i) {
                ci.onclick(function () {
                    var blen = that.quarterlyAxis.barlink.length;
                    if (blen == 0) return;
                    var href = that.quarterlyAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });
                ci.addScaleHandler(function (scale) {
                    this.id = "c" + i;
                    this.r = 7 * scale;
                    var _o = _axis.getOrigin();
                    var _solts = _axis.solts;
                    this.left = Math.round(_solts[i].start + _solts[i].length * 0.5);
                    this.top = this.top * scale / that.scale;
                    this.cx = this.cy = 0;
                    this.setOriginPoint(_o.x, _o.y);
                });

                ci.applyResetHandler(function () {
                    this.top = 0;
                });

                ci.applyStartPointHandler(function (x, y) {
                    this.cx = this.left;
                    this.cy = this.top;
                });

                ci.applySetLTHandler(function () {
                    this.top = this.cy;
                });
            })(i);
        }

        _line.addScaleHandler(function (scale) {
            this.setR(7 * scale);
            var _o = _axis.getOrigin();
            var _solts = _axis.solts;
            this.sx = this.sy = 0;
            this.left = 0;
            this.top = 0;
            this.setOriginPoint(_o.x, _o.y);
        });


        //the line   Mingli
        var _ylinePoints = [];
        for (var i = 0; i < yLineData.length; i++) {
            _ylinePoints.push([0, 0, (Math.abs(yLineData[i])).toFixed(this.linePrecision)]);
        }
        var color = this.yearToDateAxis.barcolors[2 % this.yearToDateAxis.barcolors.length];
        var _yline = _wrapper.addLine(_ylinePoints, color, 7, _axis2);
        _yline.setAbsolute(true);
        _yline.setRenderFlagWithPoints(true);
        // _yline.setZIndex(30);
        for (var i = 0, ci; ci = _yline.points[i]; i++) {
            // ci.setZIndex(30);
            ci.absolute = true;
            function pover(cord) {
                that.setCanvasStyle("cursor", "pointer");
                if (!animateState) return;
                var _x = this.cx + (this.ox != undefined ? this.ox : 0) - (_span.w + _span.h) / 2;
                var _y = this.cy + (this.oy != undefined ? this.oy : 0) - this.r - _span.h - 2;
                _span.updateText("$ " + this.caption);
                yani4.repaint();
                this.repaint();
                _span.moveTo(_x, _y);
            }
            ci.onmousemove(pover);
            ci.addIsInCrtl(function (cord) {
                var _sx, _sy, _ex, _ey;
                _sx = (typeof this.sx == "function" ? this.sx() : this.sx) - this.r;
                _sy = (typeof this.sy == "function" ? this.sy() : this.sy) - this.r;
                _ex = (typeof this.ex == "function" ? this.ex() : this.ex) + this.r;
                _ey = (typeof this.ey == "function" ? this.ey() : this.ey) + this.r;
                var _cordX = cord.x - (this.ox != undefined ? this.ox : 0);
                var _cordY = cord.y - (this.oy != undefined ? this.oy : 0);
                var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
                var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
                return !(_x || _y);
            });
            ci.ontouchstart(pover);
            ci.ontouchend(function () { });
            ci.onmouseout(function () {
                that.setCanvasStyle("cursor", "");
                _span.hide();
                yani4.repaint();
            });

            (function (i) {

                ci.onclick(function () {
                    var blen = that.yearToDateAxis.barlink.length;
                    if (blen == 0) return;
                    var href = that.yearToDateAxis.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }

                });

                ci.addScaleHandler(function (scale) {
                    this.id = "c" + i;
                    this.r = 7 * scale;
                    var _o = _axis2.getOrigin();
                    var _solts = _axis2.solts;
                    this.left = Math.round(_solts[i].start + _solts[i].length * 0.5);
                    this.top = this.top * scale / that.scale;
                    this.cx = this.cy = 0;
                    this.setOriginPoint(_o.x, _o.y);
                });

                ci.applyResetHandler(function () {
                    this.top = 0;
                });

                ci.applyStartPointHandler(function (x, y) {
                    this.cx = this.left;
                    this.cy = this.top;
                });

                ci.applySetLTHandler(function () {
                    this.top = this.cy;
                });
            })(i);
        }

        _yline.addScaleHandler(function (scale) {
            this.setR(7 * scale);
            var _o = _axis2.getOrigin();
            var _solts = _axis2.solts;
            this.sx = this.sy = 0;
            this.left = 0;
            this.top = 0;
            this.setOriginPoint(_o.x, _o.y);
        });
        _yline.setZIndex(30);
        //checkboxes
        var _chk = _wrapper.addCheckBox(0, 0, 0, 0, "Dividends Per Share", null, _chartBack);
        _chk.addText("*", "rgb(244,104,14)", Math.round(16 * scale), "Segoe UI", null, true);
        _chk.setZIndex(10);
        _chk.absolute = true;
        _chk.addScaleHandler(function (scale) {
            this.h = Math.round(this.parentNode.h / 14);
            this.left = Math.round(this.parentNode.w / 20);
            this.top = _axis.h;
        });

        var _chk1 = _wrapper.addCheckBox(0, 0, 0, 0, "Total Dividends (Accrual Basis)", null, _chartBack);
        _chk1.setZIndex(11);
        _chk1.absolute = true;
        _chk1.addScaleHandler(function () {
            this.h = Math.round(this.parentNode.h / 14);
            this.left = Math.round(this.parentNode.w / 20);
            this.top = _axis.h + this.h;
        });

        var _chk2 = _wrapper.addCheckBox(0, 0, 0, 0, "Share Buyback (Accrual Basis)", null, _chartBack);
        _chk2.setZIndex(12);
        _chk2.absolute = true;
        _chk2.addScaleHandler(function () {
            this.h = Math.round(this.parentNode.h / 14);
            this.left = Math.round(this.parentNode.w / 20);
            this.top = _axis.h + 2 * this.h;
        });

        var _chkPoint, _chkLine, _chk1Banner, _chk2Banner;
        _chk.addLegendHandler(function (x, y, w, h) {
            var _r = Math.round(h * 0.25);
            var _x = Math.round(x + _r);
            var _y = Math.round(y + h / 2);
            var _color = that.quarterlyAxis.barcolors[2 % that.quarterlyAxis.barcolors.length];
            this.wrapper.drawArc(_x, _y, _r, _color);
            this.wrapper.drawRect(_x, Math.round(_y - h / 10), Math.round(w - _r - 10), Math.round(h / 5), _color);
        });

        _chk1.addLegendHandler(function (x, y, w, h) {
            var _h = Math.round(h * 0.6);
            var _x = Math.round(x);
            var _y = Math.round(y + h * 0.2);
            var _w = Math.round(w - 10);
            this.wrapper.drawRect(_x, _y, _w, _h, that.quarterlyAxis.barcolors[1 % that.quarterlyAxis.barcolors.length]);
        });

        _chk2.addLegendHandler(function (x, y, w, h) {
            var _h = Math.round(h * 0.6);
            var _x = Math.round(x);
            var _y = Math.round(y + h * 0.2);
            var _w = Math.round(w - 10);
            this.wrapper.drawRect(_x, _y, _w, _h, that.quarterlyAxis.barcolors[0]);
        });


        var _labComment = _wrapper.addLable(0, 0, 0, 20, null, "Segoe UI", _chartBack);
        _labComment.addText("* ", "rgb(244,104,14)", 16, "Segoe UI");
        _labComment.addText("refer to right-hand scale", null, 10, "Segoe UI", null);
        _labComment.setZIndex(13);
        _labComment.absolute = true;
        _labComment.addScaleHandler(function (scale) {
            this.h = Math.round(this.parentNode.h / 21);
            this.left = Math.round(this.parentNode.w / 8);
            this.top = _axis.h + _chk.h * 3.2;
            var counter = 0;
            this.eachTxt(function (txtItem) {
                if (counter == 0) {
                    txtItem.fontsize = 16 * scale;
                    counter++;
                }
                else {
                    txtItem.fontsize = 10 * scale;
                }

            });
        });

        //Mingli

        //animation 1
        var ani1 = _wrapper.addAnimation(20);
        ani1.applyCtrls(_btnLine, _backBanner, _btn, _btn2);
        ani1.logChanges(_backBanner, { sx: 120 }, 0, 1);

        //animation 2
        var ani2 = _wrapper.addAnimation(20);
        ani2.applyCtrls(_chartBack, _axis, _line, _chk, _chk1, _chk2, _labComment);
        for (var i = 0; i < _bars.length; i++) {
            ani2.logChanges(_bars[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        //animation 3
        var ani3 = _wrapper.addAnimation(20);
        ani3.cloneImpactedControls(ani2);
        for (var i = 0; i < _bars2.length; i++) {
            ani3.logChanges(_bars2[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        //animation 4
        var ani4 = _wrapper.addAnimation(24);
        ani4.cloneImpactedControls(ani3);
        for (var i = 0, ci; ci = _line.points[i]; i++) {
            ani4.logChanges(ci, { cy: 23 }, i * 20, 4);
            ani4.logChanges(ci, { cy: 10 }, 0, 3);
            ani4.logChanges(ci, { cy: -5 }, 0, 3);
        }

        var yani2 = _wrapper.addAnimation(20);
        yani2.applyCtrls(_chartBack, _axis2, _yline, _chk, _chk1, _chk2, _labComment);
        for (var i = 0; i < _ybars.length; i++) {
            yani2.logChanges(_ybars[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        //animation 3
        var yani3 = _wrapper.addAnimation(20);
        yani3.cloneImpactedControls(yani2);
        for (var i = 0; i < _ybars2.length; i++) {
            yani3.logChanges(_ybars2[i], { h: 0 }, 0, 3); //sub 0.2 pix to fix blur
        }

        //animation 4
        var yani4 = _wrapper.addAnimation(24);
        yani4.cloneImpactedControls(yani3);
        for (var i = 0, ci; ci = _yline.points[i]; i++) {
            yani4.logChanges(ci, { cy: 23 }, i * 20, 4);
            yani4.logChanges(ci, { cy: 10 }, 0, 3);
            yani4.logChanges(ci, { cy: -5 }, 0, 3);
        }
        function getValue(d) {
            var tmp = Math.abs(d);
            if (tmp <= 1 && tmp > 0) {
                if (d < 0) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            return d;
        }
        //config animation 2 and animation 3
        _axis.addScaleHandler(function () {
            var _unit = this.leftRange.unit || 1;
            for (var i = 0, ci; ci = ani2.changeList[i]; i++) {
                var _value = Math.floor(getValue(qBarData[i] * _unit));
                ci.setFirstRange(_value, _value);//sub 0.1 pix to fix blur
            }

            for (var i = 0, ci; ci = ani3.changeList[i]; i++) {
                var _value = Math.floor(getValue(qBar1Data[i] * _unit));
                ci.setFirstRange(_value, _value);//sub 0.1 pix to fix blur
            }
        });

        _axis.addScaleHandler(function () {
            var _unit = this.rightRange.unit || 1;
            for (var i = 0, ci; ci = ani4.changeList[i]; i++) {
                var _value = -qLineData[i] * _unit - 5;
                ci.setFirstRange(_value, _value);
                ci.sences[1].setRange(null, _value + 10);
                ci.sences[2].setRange(null, _value + 5);
            }
        });

        _axis.addScaleHandler(function (scale) {
            _span.scale(scale);
        });

        _axis2.addScaleHandler(function () {
            var _unit = this.leftRange.unit || 1;
            for (var i = 0, ci; ci = yani2.changeList[i]; i++) {
                var _value = Math.floor(getValue(yBarData[i] * _unit));
                ci.setFirstRange(_value, _value);//sub 0.1 pix to fix blur
            }

            for (var i = 0, ci; ci = yani3.changeList[i]; i++) {
                var _value = Math.floor(getValue(yBar1Data[i] * _unit));
                ci.setFirstRange(_value, _value);//sub 0.1 pix to fix blur
            }
        });

        _axis2.addScaleHandler(function () {
            var _unit = this.rightRange.unit || 1;
            for (var i = 0, ci; ci = yani4.changeList[i]; i++) {
                var _value = -yLineData[i] * _unit - 5;
                ci.setFirstRange(_value, _value);
                ci.sences[1].setRange(null, _value + 10);
                ci.sences[2].setRange(null, _value + 5);
            }
        });

        _axis2.addScaleHandler(function (scale) {
            _span.scale(scale);
        });



        ani1.addClearHandler(function () {
            this.applyClearArea(_btnLine.sx, _btnLine.sy, _btnLine.w, _btnLine.h);
        });

        ani2.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });

        ani3.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });

        ani4.addClearHandler(function () {
            this.applyClearArea(_axis.sx, _axis.sy, _axis.w, _axis.h);
        });

        yani2.addClearHandler(function () {
            this.applyClearArea(_axis2.sx, _axis2.sy, _axis2.w, _axis2.h);
        });

        yani3.addClearHandler(function () {
            this.applyClearArea(_axis2.sx, _axis2.sy, _axis2.w, _axis2.h);
        });

        yani4.addClearHandler(function () {
            this.applyClearArea(_axis2.sx, _axis2.sy, _axis2.w, _axis2.h);
        });

        ani2.attachDeactiveHandler(function (bars) {
            for (var i = 0, ci; ci = bars[i]; i++) {
                var _ctrl = ci.ctrl;
                ani3.changeList[i].ctrl.sx = _ctrl.sx;
                ani3.changeList[i].ctrl.sy = _ctrl.renderReady ? (_ctrl.sy - _ctrl.h) : 0;
                ani3.changeList[i].ctrl.w = _ctrl.w;
                ani3.changeList[i].ctrl.setRenderFlag(_chk1.checked);
            }
            if (_chk1.checked) {
                ani3.active()
            }
            else {
                ani4.active();
            }
        });

        ani3.attachDeactiveHandler(function () {
            ani4.active();
        });
        ani4.attachDeactiveHandler(function () {
            animateState = true;
        });
        yani2.attachDeactiveHandler(function (bars) {
            for (var i = 0, ci; ci = bars[i]; i++) {
                var _ctrl = ci.ctrl;
                yani3.changeList[i].ctrl.sx = _ctrl.sx;
                yani3.changeList[i].ctrl.sy = _ctrl.renderReady ? (_ctrl.sy - _ctrl.h) : 0;
                yani3.changeList[i].ctrl.w = _ctrl.w;
                yani3.changeList[i].ctrl.setRenderFlag(_chk1.checked);
            }
            if (!_chk1.checked) { yani4.active(); return; };
            yani3.active();
        });

        yani3.attachDeactiveHandler(function () {
            yani4.active();
        });
        yani4.attachDeactiveHandler(function () {
            animateState = true;

        });
        _btn.onclick(function () {
            if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                animateState = false;
                _chk.txtStorage = [];
                _chk.addText("Dividends Per Share ", "", null, "Segoe UI", null, true);
                _chk.addText("*", "rgb(244,104,14)", Math.round(16 * scale), "Segoe UI", null, true);

                setQRenderFlag(true);
                setYRenderFlag(false);
                ani1.resetOnlyStatus();
                ani1.setFirstRange(-this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn2.fontColor = that.yearToDateTabStyle.fontcolor;
                this.selected = true;
                _btn2.selected = false;
                ani2.reset();
                ani3.reset();
                ani4.reset();
                ani2.restart();

                yani2.reset();
                yani3.reset();
                yani4.reset();
                // ani2.restart();

            }
        });

        _btn2.onclick(function () {
            if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani1.ready == false) {
                _chk.txtStorage = [];
                _chk.addText("Cash Dividends Deciared Per Share ", "", null, "Segoe UI", null, true);
                _chk.addText("*", "rgb(244,104,14)", Math.round(16 * scale), "Segoe UI", null, true);
                animateState = false;
                setQRenderFlag(false);
                setYRenderFlag(true);
                ani1.resetOnlyStatus();
                ani1.setFirstRange(this.w);
                ani1.active();
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn.fontColor = that.yearToDateTabStyle.fontcolor;
                this.selected = true;
                _btn.selected = false;
                yani2.reset();
                yani3.reset();
                yani4.reset();
                yani2.restart();
                ani2.reset();
                ani3.reset();
                ani4.reset();

            }
        });

        _chk.onclick(function () {
            if (_btn.selected) {
                _line.setRenderFlagWithPoints(this.checked);
                ani2.reset();
                ani3.reset();
                ani4.reset();
                ani2.restart();
            } else {
                _yline.setRenderFlagWithPoints(this.checked);
                yani2.reset();
                yani3.reset();
                yani4.reset();
                yani2.restart();
            }

        });

        _chk1.onclick(function () {
            if (_btn.selected) {

                for (var i = 0, ci; ci = _bars2[i]; i++) {
                    ci.setRenderFlag(this.checked);
                }
                ani2.reset();
                ani3.reset();
                ani4.reset();
                ani2.restart();
            }
            else {
                for (var i = 0, ci; ci = _ybars2[i]; i++) {
                    ci.setRenderFlag(this.checked);
                }
                yani2.reset();
                yani3.reset();
                yani4.reset();
                yani2.restart();
            }

        });

        _chk2.onclick(function () {
            if (_btn.selected) {
                for (var i = 0, ci; ci = _bars[i]; i++) {
                    ci.setRenderFlag(this.checked);
                }
                ani2.reset();
                ani3.reset();
                ani4.reset();
                ani2.restart();
            }

            else {
                for (var i = 0, ci; ci = _ybars[i]; i++) {
                    ci.setRenderFlag(this.checked);
                }
                yani2.reset();
                yani3.reset();
                yani4.reset();
                yani2.restart();
            }


        });

        function setQRenderFlag(flag) {

            _line.setRenderFlagWithPoints(flag && _chk.checked);
            [_chk, _chk1, _chk2, _labComment].forEach(function (v, i, a) {
                v.setRenderFlag(true);
            })
            _axis.setRenderFlag(flag);
            for (var i = 0, ci; ci = _bars[i]; i++) {
                ci.setRenderFlag(flag && _chk2.checked);
            }
            for (var i = 0, ci; ci = _bars2[i]; i++) {
                ci.setRenderFlag(flag && _chk1.checked);
            }
        }
        function setYRenderFlag(flag) {
            _yline.setRenderFlagWithPoints(flag && _chk.checked);
            [_chk, _chk1, _chk2, _labComment].forEach(function (v, i, a) {
                v.setRenderFlag(true);
            })

            _axis2.setRenderFlag(flag);

            for (var i = 0, ci; ci = _ybars[i]; i++) {
                ci.setRenderFlag(flag && _chk2.checked);
            }
            for (var i = 0, ci; ci = _ybars2[i]; i++) {
                ci.setRenderFlag(flag && _chk1.checked);
            }
        }
        function pinClick() {
            // this.pinClickHandler.notify(arguments);
            if (_pin.checked) {
                that.pinCheckedHandler.notify();
                _pin.caption = "Click to undock chart";

            }
            else {
                that.pinNoCheckedHandler.notify();
                _pin.caption = "Click to dock chart"
            }
            if (_pin.toolTip) {
                _pin.toolTip.updateText(_pin.caption);
            }

        }

        _pin.onclick(pinClick);


        if (initTab) {
            _btn2.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn.applyFont(this.yearToDateTabStyle.fontcolor);
            _btn2.selected = true;
            _btn.selected = false;

            setYRenderFlag(true);
            setQRenderFlag(false);
            _chk.txtStorage = [];
            _chk.addText("Cash Dividends Deciared Per Share ", "", null, "Segoe UI", null, true);
            _chk.addText("*", "rgb(244,104,14)", Math.round(16 * scale), "Segoe UI", null, true);
            yani2.active();
        }
        else {
            _btn.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn2.applyFont(this.yearToDateTabStyle.fontcolor);
            _btn.selected = true;
            _btn2.selected = false;
            setYRenderFlag(false);
            setQRenderFlag(true);
            _chk.txtStorage = [];
            _chk.addText("Dividends Per Share ", "", null, "Segoe UI", null, true);
            _chk.addText("*", "rgb(244,104,14)", Math.round(16 * scale), "Segoe UI", null, true);

            ani2.active();
        }

        if (isQ4) {
            _btn2.caption = "Annual";
        }


        that.touchFlagDisableCtrl.push(_bigback);


        //yani2.active();
    });

}
inheritPrototype(IR.StackedColumnAndLine, IR.Chart);

multipleinheritPrototype(IR.StackedColumnAndLine, IR.ChartColumnAttribute);
IR.StackedColumnAndLine.prototype.setPrecision = function (precision) {
    if (Object.prototype.toString.call(precision).toLowerCase() == "[object number]") {
        this.precision = precision;
        this.linePrecision = (precision - 1) < 0 ? 0 : precision - 1;
    }
}

/****************************************************************/

var baseCtrl = new canvasWrapper().getBaseCtrlObj().constructor;

canvasWrapper.prototype.addLegend = function (x, y, w, h, text, color, parentCtrl) {
    var legendCtrl = new legend(this, x, y, w, h, text, color);
    legendCtrl.setParent(parentCtrl);
    this.ctrlList.push(legendCtrl);
    return legendCtrl;
}
canvasWrapper.prototype.addPieRowLable = function (x, y, w, h, text, color, parentCtrl) {
    var pielable = new pierowlable(this, x, y, w, h, text, color);
    pielable.setParent(parentCtrl);
    this.ctrlList.push(pielable);
    return pielable;
}

var arc = function (wrapper, nx, ny, r, text, color) {
    baseCtrl.apply(this, [wrapper, nx, ny, 0, 0, text, color]);
    this.backColor = color;
    var that = this;
    this.r = r;
    this.nx = nx;
    this.ny = ny;
    this.nr = 20;
    this.cx = function () { return Math.cos((this.endPosition + this.startPosition) * Math.PI) * this.nr + this.nx; }
    this.cy = function () { return Math.sin((this.endPosition + this.startPosition) * Math.PI) * this.nr + this.ny; }
    this.alpha = 0;
    this.startPosition = 0;
    this.endPosition = 0;
    this.addRenderHandler(function () {
        //drawArcStroke: function (cx, cy, r, lineWidth, color, startPosition, range, lineWidth, clockwise) {
        this.wrapper.ctx.save();
        this.wrapper.ctx.globalAlpha = this.alpha;
        this.wrapper.drawArcNoCloseStroke(this.cx(), this.cy(), this.r, this.lineWidth, this.backColor, this.startPosition, this.endPosition, false);
        //this.wrapper.drawArcStroke(this.cx(), this.cy(), this.r, this.lineWidth, this.backColor, this.startPosition, this.endPosition, false);
        this.wrapper.ctx.restore();
        //this.wrapper.drawArc(this.nx, this.ny, this.nr, "black", 0, 1);
    })
    this.addRepaintHandler(function () {
        var cx = this.cx() + Math.cos((this.endPosition + this.startPosition) * Math.PI) * 3;
        var cy = this.cy() + Math.sin((this.endPosition + this.startPosition) * Math.PI) * 3;
        this.wrapper.drawArcStrokeShadow(cx, cy, this.r, this.lineWidth, this.backColor, this.startPosition, this.endPosition, false);

    });
}
inheritPrototype(arc, baseCtrl);

var func = canvasWrapper.prototype["isInCtrl"];

canvasWrapper.prototype.isInCtrl = function (cord, ctrl) {
    if (ctrl instanceof arc) {
        var _c = this.ctx;
        var isInY = false;
        var isInN = false;
        _c.save();
        var t = this.getCtrlHierarchy(ctrl);
        _c.translate(t.x, t.y);
        _c.beginPath();
        _c.moveTo(ctrl.cx(), ctrl.cy());
        _c.arc(ctrl.cx(), ctrl.cy(), ctrl.r + ctrl.lineWidth / 2, ctrl.startPosition * Math.PI * 2, ctrl.endPosition * Math.PI * 2, false);
        _c.closePath();
        isInY = _c.isPointInPath(cord.x, cord.y);
        _c.beginPath();
        _c.moveTo(ctrl.cx(), ctrl.cy());
        var r = ctrl.r - ctrl.lineWidth / 2;

        _c.arc(ctrl.cx(), ctrl.cy(), r < 0 ? 0 : r, ctrl.startPosition * Math.PI * 2, ctrl.endPosition * Math.PI * 2, false);
        _c.closePath();
        isInN = _c.isPointInPath(cord.x, cord.y);
        _c.restore();
        return isInY && !isInN;
    }
    else {
        return func.apply(this, arguments);
    }
}
var pierowlable = function (wrapper, x, y, w, h, color, family) {
    baseCtrl.apply(this, arguments);
    this.txtLen = 0;
    this.txtColor = color || "rgb(68,68,68)";
    this.family = family || "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
    var that = this;
    this.txtStorage = [];
    this.ex = function () { return that.sx + that.txtLen; };
    this.addRenderHandler(function () {
        this.txtLen = 0;
        var _x, _y, tmpLen;
        for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
            var _fontSize = ci.fontsize ? ci.fontsize : this.h * 0.4;
            _x = ci.isline ? _x + tmpLen : this.ex() + ci.left;
            _y = ci.isline ? _y : this.sy + i * _fontSize * 1.2;
            var _h = this.h;
            var _color = ci.color || this.txtColor;
            var _family = ci.family || this.family;
            tmpLen = ci.w;
            this.wrapper.writeText(_x, _y, ci.w, _h, ci.txt, _color, _fontSize, _family, ci.weight, ci.align)
        }
    });
}

inheritPrototype(pierowlable, baseCtrl);
pierowlable.prototype.addText = function (w, left, txt, color, fontsize, family, weight, align, isline) {
    align = !!!align ? "center" : align;
    isline = !!isline;
    this.txtStorage.push({
        w: w,
        txt: txt,
        left: left
        , color: color
        , fontsize: fontsize
        , family: family
        , weight: weight
        , align: align
        , isline: isline
    });
}



pierowlable.prototype.eachTxt = function (func) {
    for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
        func.call(this, ci);
    }
}


var legend = function (wrapper, x, y, w, h, text, color, flag) {
    baseCtrl.apply(this, arguments);
    this.checked = flag ? flag : true;
    this.backColor = color ? color : "rgb(247,247,247)";
    this.clearRange;
    this._legendHandler = new evtWrapper(this);
    var that = this;
    this.legLen = function () { return that.h };
    this.legH = function () { return that.h * 0.9 };
    this.legW = function () { return that.h * 1.5 };
    this.isHover = false;
    this.textLength = 0;
    this.w = this.legW() + this.textLength;
    this.family = "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
    this.txtStorage = [];
    if (text != undefined) {
        this.addText(text, color);
    }


    var that = this;
    this.len = function () {
        return (that._legendHandler._listeners.length > 0 ? that.legLen() : 0) + that.textLength + that.h;
    }
    this.ex = function () {
        return that.sx + that.len();
    }
    this.txtColor = color != undefined ? color : "rgb(68,68,68)";
    this.addRenderHandler(function () {
        this.textLength = 0;
        //draw clear area
        if (this.clearRange) {
            this.wrapper.ctx.putImageData(this.imageData, this.clearRange.x, this.clearRange.y, 0, 0, this.clearRange.w, this.clearRange.h)
            //this.wrapper.ctx.rect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h);
            this.clearRange = undefined;
        }
        //  x: this.sx
        //, y: this.sy
        //, w: this.len()
        //, h: this.h
        var _fontSize, _family;
        for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
            _fontSize = Math.round(ci.fontsize ? ci.fontsize : this.h * 0.4);
            _family = ci.family || this.family;
            this.textLength += this.wrapper.messureText(ci.weight, _fontSize, _family, ci.txt).width;
        }
        if (!this.clearRange) {
            this.imageData = this.wrapper.ctx.getImageData(this.sx, this.sy, this.len(), this.h);
        }

        var _x, _y;
        var _w = _h = this.h * 0.5;
        //drawLegend
        this.drawLegend();
        //draw text
        for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
            var _x = this.sx + this.legW() * 1.3;
            var _y = this.sy;
            var _h = this.h;
            _fontSize = Math.round(ci.fontsize ? ci.fontsize : this.h * 0.4);
            var _color = ci.color || this.txtColor;
            _family = ci.family || this.family;
            this.wrapper.writePureText(_x, _y, _h, ci.txt, _color, _fontSize, _family, ci.weight, true);
        }
    });

    this.addRepaintHandler(function () {
        this.textLength = 0;
        //draw clear area
        if (this.clearRange) {
            this.wrapper.ctx.putImageData(this.imageData, this.clearRange.x, this.clearRange.y, 0, 0, this.clearRange.w, this.clearRange.h)

            // this.wrapper.ctx.rect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h);
            this.clearRange = undefined;
        }

        //draw checkbox
        var _x, _y;
        var _w = _h = this.h * 0.5;

        //drawLegend
        var _c = this.wrapper.ctx;
        _c.save();
        _c.shadowColor = "black";
        _c.shadowBlur = 1;
        _c.shadowOffsetX = 2;
        _c.shadowOffsetY = 2;
        this.drawRepaintLegend();

        _c.restore();
        //draw text
        for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
            var _x = this.sx + this.legW() * 1.2;
            var _y = this.sy - 2.5;
            var _h = this.h;
            var _fontSize = Math.round(ci.fontsize ? ci.fontsize : this.h * 0.4);
            var _color = ci.color || this.txtColor;
            var _family = ci.family || this.family;
            this.textLength += this.wrapper.writePureText(_x, _y, _h, ci.txt, _color, _fontSize, _family, ci.weight, true);
        }

    })

}
inheritPrototype(legend, baseCtrl);
legend.prototype.addText = function (txt, color, fontsize, family, weight, iscenter) {
    this.txtStorage.push({
        txt: txt
        , color: color
        , fontsize: fontsize
        , family: family
        , weight: weight
        , iscenter: iscenter
    });
}

legend.prototype.eachTxt = function (func) {
    for (var i = 0, ci; ci = this.txtStorage[i]; i++) {
        func.call(this, ci);
    }
}

legend.prototype.addLegendHandler = function (func) {
    this._legendHandler.attach(func);
}

legend.prototype.drawLegend = function () {
    var _x = this.sx;
    var _y = this.sy;
    var _w = this.legW();
    var _h = this.legH();
    this._legendHandler.notify(_x, _y, _w, _h);
}
legend.prototype.drawRepaintLegend = function () {
    var _x = this.sx;
    var _y = this.sy;
    var _w = this.legW();
    var _h = this.legH();
    this._legendHandler.notify(_x, _y, _w, _h);
}
legend.prototype.clear = function () {
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

var transparentBanner = function (wrapper, x, y, w, h, color) {
    baseCtrl.call(this, wrapper, x, y, w, h, null, color);
    this.imageData = null;
    this.addRenderHandler(function () {
        //if (this.borderState) {
        //    this.wrapper.drawStrokeRect(this.sx, this.sy, this.w, this.h, this.borderWidth, this.borderColor);
        //    this.wrapper.ctx.putImageData(this.imageData, this.sx, this.sy);

        //    // this.wrapper.drawRect(this.sx + this.borderWidth, this.sy + this.borderWidth, this.w - 2 * this.borderWidth, this.h - 2 * this.borderWidth, this.backColor);
        //}
        //else {
        //    //this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.backColor);
        //}
        this.getBackColor();
        this.wrapper.ctx.putImageData(this.imageData, this.sx, this.sy);
    });
}

inheritPrototype(transparentBanner, baseCtrl);
transparentBanner.prototype.applyBorder = function (borderWidth, borderColor) {
    this.borderWidth = borderWidth;
    this.borderColor = borderColor;
}
transparentBanner.prototype.setBorderState = function (state) {
    this.borderState = !!state;
}
transparentBanner.prototype.getBackColor = function () {
    this.imageData = this.wrapper.ctx.getImageData(this.sx, this.sy, this.w, this.h);
}
canvasWrapper.prototype.addTransparentBanner = function (x, y, w, h, text, color, parentCtrl) {
    var ctrl = new transparentBanner(this, x, y, w, h, text, color);
    ctrl.setParent(parentCtrl);
    this.ctrlList.push(ctrl);
    return ctrl;
}





/****************************************************************/

IR.Doughnut = function (sx, sy, w, h, scale) {
    IR.Chart.apply(this, arguments);
    IR.ChartDoughnutAttribute.apply(this, null);

    this.config(function () {
        var _wrapper = this.wrapper;
        var _cSize = { w: w, h: h };
        var _start = { x: this.sx, y: this.sy };
        var that = this;
        var initTab, isQ4 = this.isContainQ4();
        if (this.initTab == undefined) {
            initTab = isQ4;
        }
        else {
            initTab = this.initTab;
        }
        var animateState = false;

        /*add the background*/
        var _bigback = _wrapper.addBanner(0, 0, 0, 0, this.bigbackColor);
        _bigback.setBorderState(true);
        _bigback.applyBorder(1, "RGB(191,191,191)");
        var _borderWidth = _bigback.borderWidth;
        _bigback.addScaleHandler(function (scale) {
            this.w = Math.round(_cSize.w * scale);
            this.h = Math.round(_cSize.h * scale);
            this.setPosition(that.sx, that.sy);
        });
        var isZoomOut;
        _bigback.ontouchstart(function (cord) {
            var isInChild = false;
            var inChild = [_btn, _btn2, _backBanner].concat(_arcs).concat(_arcs1).concat(_yarcs).concat(_yarcs1).concat(_legends);
            for (var i = 0, ci; ci = inChild[i]; i++) {
                isInChild = _wrapper.isInCtrl(cord, ci);
                if (isInChild) {
                    break;
                }
            }
            isZoomOut = !that.chartIsZoomOut;
            if (isZoomOut) {
                changePinState(true)
                // that.setMouseOrTouchFlag(null, false);
                that.rootElementTouchStartOddHandler.notify(_wrapper.canvas);
                //that.setMouseOrTouchFlag(null, true);
            }
            else {
                if (!isInChild) {
                    changePinState(false)
                    if (_btn.isSelected) {
                        out(ani1);
                    }
                    else {
                        out(ani3);
                    }
                    that.rootElementTouchStartEvenHandler.notify(_wrapper.canvas);
                    //that.setMouseOrTouchFlag(null, false);
                    // this.setTouchFlag(true);

                }
            }

            function changePinState(flag) {
                _pin.checked = flag;
                pinClick();

                _pin.curColor = _pin.checked ? _pin.pinColor : _pin.pushColor;
            }

        });
        _bigback.ontouchend(function () {


        });

        _bigback.ontouchmove(function () { });

        //the title
        var _title = _wrapper.addBanner(0, 0, 0, 0, this.titleBackColor, _bigback);
        _title.setPosition(_borderWidth, 0);
        _title.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - 2 * _borderWidth);
            this.h = Math.round(this.parentNode.h * 35 / 420);
            this.top = _borderWidth;
        });


        var _labTitle = _wrapper.addLable(0, 0, 0, 0, this.labTitleStyle.color, this.labTitleStyle.family, _title);
        _labTitle.addText(this.labTitleStyle.text, this.labTitleStyle.color, this.labTitleStyle.fontsize, this.labTitleStyle.family, this.labTitleStyle.weight);
        _labTitle.addText(this.labSubTitleStyle.text, this.labSubTitleStyle.color, this.labSubTitleStyle.fontsize, this.labSubTitleStyle.family, this.labSubTitleStyle.weight);
        _labTitle.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w / 80);
            this.top = Math.round(this.parentNode.h / 2);
            this.h = _title.h / 2;//14 * scale;
            this.eachTxt(function (txtItem) {
                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });


        var _pin = _wrapper.addPushPin(0, 0, 0, "Click to dock chart", this.pinSwitchColor[0], this.pinSwitchColor[1], _title);
        _pin.absolute = true;

        _pin.addScaleHandler(function (scale) {
            this.r = this.parentNode.h * 0.3;
            this.top = this.parentNode.h / 2;
            this.left = this.parentNode.w - this.r - 5;
            this.cx = this.cy = 0;
        });
        _pin.applyStartPointHandler(function (x, y) {
            this.cx = x;
            this.cy = y;
        });
        _pin.addToolTip();

        _pin.onmousemove(function (cord) {
            that.setCanvasStyle("cursor", "pointer");
            var w = 120;
            this.toolTip.setStyle("width", w + "px");
            this.toolTip.setStyle("borderRadius", "5px 6px");
            this.toolTip.show();
            this.toolTip.move(cord.e.pageX - cord.x + this.left - w + that.sx + this.r, cord.e.pageY + 20);
        });
        _pin.onmouseout(function () {
            that.setCanvasStyle("cursor", "");
            this.toolTip.hide();
        });



        //the line banner       
        var _btnLine = _wrapper.addBanner(0, 0, 0, 0, this.tabBackColor, _bigback);
        _btnLine.setPosition(_borderWidth, 0);
        _btnLine.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - _borderWidth * 2);
            this.h = Math.round(this.parentNode.h * 22 / 420);

        });

        var _chartback = _wrapper.addBanner(0, 0, 0, 0, "RGB(255,255,255)", _bigback);
        _chartback.caption = "c";
        _chartback.setPosition(_borderWidth, 0);

        _chartback.addScaleHandler(function (scale) {
            this.w = Math.round(this.parentNode.w - _borderWidth * 2);
            this.h = Math.round((this.parentNode.h - _borderWidth) * 362 / 420);
            this.backColor = _wrapper.createLinearGradient(0, 0, 0, this.h, { 0: "rgb(255,255,255)", 0.3: "rgb(250,250,250)", 0.5: "rgb(245,245,245)", 0.7: "rgb(240,240,240)" });

        });

        //btns
        var _btn = _wrapper.addButton(0, 0, 0, 0, this.quarterlyTabStyle.text, this.quarterlyTabStyle.backcolor, _btnLine);
        _btn.left = 0;
        _btn.setZIndex(8);
        _btn.float = true;
        //need to reset when clicked
        _btn.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
            this.left = this.left * scale / that.scale;
            this.top = 0;

        });

        var _btn2 = _wrapper.addButton(0, 0, 0, 0, this.yearToDateTabStyle.text, this.yearToDateTabStyle.backcolor, _btnLine);
        _btn2.setZIndex(9);
        _btn2.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = Math.round(20 * scale);
            this.top = 0;

        });
        function tabinCtrl(cord) {
            var _sx, _sy, _ex, _ey;
            _sx = (typeof this.sx == "function" ? this.sx() : this.sx);
            _sy = (typeof this.sy == "function" ? this.sy() : this.sy);
            _ex = (typeof this.ex == "function" ? this.ex() : this.ex);
            _ey = (typeof this.ey == "function" ? this.ey() : this.ey) + this.h / 2;
            var _cordX = cord.x - (this.ox != undefined ? this.ox : 0);
            var _cordY = cord.y - (this.oy != undefined ? this.oy : 0);
            var _x = (_cordX < Math.min(_sx, _ex)) || (_cordX > Math.max(_sx, _ex));
            var _y = (_cordY < Math.min(_sy, _ey)) || (_cordY > Math.max(_sy, _ey));
            return !(_x || _y);
        }
        _btn2.addIsInCrtl(tabinCtrl);
        _btn.addIsInCrtl(tabinCtrl);
        var _span = _wrapper.addSpan(0, 0, 0, 0, "", _bigback);
        _span.absolute = true;
        _span.setRenderFlag(false);
        _span.addScaleHandler(function (scale) {
            this.w = Math.round(30 * scale);
            this.h = Math.round(18 * scale);
        });

        var _span1 = _wrapper.addSpan(0, 0, 0, 0, "", _bigback);
        _span1.absolute = true;
        _span1.setRenderFlag(false);
        _span1.addScaleHandler(function (scale) {
            this.w = Math.round(30 * scale);
            this.h = Math.round(18 * scale);
        });

        //back banner
        var _backBanner = _wrapper.addBanner(0, 0, 0, 0, this.tabSelectedColor, _btnLine);
        _backBanner.setZIndex(4);
        _backBanner.absolute = true;
        _backBanner.left = 0;
        _backBanner.caption = "gml";
        _backBanner.addScaleHandler(function (scale) {
            this.w = Math.round(120 * scale);
            this.h = _btnLine.h;
            this.left = initTab ? Math.round(120 * scale) : this.left * scale / that.scale;
            initTab = false;
        });
        _backBanner.applySetLTHandler(function (change, completed) {
            this.sx = Math.floor(this.sx)

            this.left = this.sx - this.parentNode.sx;

        });

        var _container = _wrapper.addBanner(0, 0, 0, 0, "", _chartback);
        _container.setBorderState(false);


        _container.addScaleHandler(function (scale) {
            this.w = Math.floor(this.parentNode.w);
            this.h = Math.floor(this.parentNode.h);
            this.backColor = _wrapper.createLinearGradient(0, 0, 0, this.h, { 0: "rgb(255,255,255)", 0.3: "rgb(250,250,250)", 0.5: "rgb(245,245,245)", 0.7: "rgb(240,240,240)" });
        });



        var groupTitle = this.groupTitle.text;
        var totalStr = "Total Company Revenue*";
        var nr = 15;
        //var init = 0;
        var lineWidth = 25;
        var marginLeft = 12;
        var _arcs = [];
        var data = this.quarterly.data[0]; //[5.9, 5.2, 0.9, 5.7, 3.8];
        var color = this.quarterly.barcolor;// ["#ff8c00", "#7fba00", "#68217a", "#0072c6", "#00b294"];

        var sum = data.reduce(function (pv, cv, ci) {
            return Math.abs(parseFloat(pv)) + Math.abs(parseFloat(cv));
        }, 0);
        var total = sum + parseFloat(this.quarterly.unallocated[0]);
        var spaceUnit = 0.01 * sum;
        sum = sum + spaceUnit + spaceUnit * (data.length - 1);
        var start = 0.75;
        for (var i = 0; i < data.length; i++) {
            var _arc = _wrapper.addArc(0, 0, 0, "", color[i], _container);
            _arc.caption = "q" + i;
            _arc.nr = nr;
            _arc.caption = data[i];
            _arc.setZIndex(10 + i);
            _arc.lineWidth = lineWidth;
            _arc.marginLeft = marginLeft;
            (function (i) {
                _arc.addScaleHandler(function (scale) {
                    this.nx = Math.round(this.parentNode.w * 108 / 400);
                    this.ny = Math.round(this.parentNode.h * 118 / 362);
                    this.marginLeft = this.marginLeft * scale / that.scale;
                    this.lineWidth = this.lineWidth * scale / that.scale;
                    this.startPosition = start;
                    this.endPosition = start + data[i] / sum
                    start = this.endPosition + spaceUnit / sum;

                    this.r = (this.parentNode.w / 2 - (this.lineWidth + this.marginLeft) * 2) / 2;
                    this.setOriginPoint(this.parentNode.sx, this.parentNode.sy);

                });
                _arc.applySetLTHandler(function (change) {
                    // this.nr = this.nr;
                    //this.alpha = change;
                });
                function aover1(cord) {
                    that.setCanvasStyle("cursor", "pointer");
                    displayTitle(1, total1, totalStr);
                    displayTitle(0, this.caption, groupTitle[i]);
                    this.setRenderFlag(false);
                    _span.hide();
                    ani1.repaint();
                    this.setRenderFlag(true);
                    this.repaint();
                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        if (i == j) {
                            _legends[j].repaint();
                        }
                        else {
                            _legends[j].render();
                        }
                    }
                    var p = (parseFloat(this.caption) * 100 / parseFloat(total)).toFixed(0) + "%";
                    _span.updateText(p);
                    _span.moveTo(cord.x - _span.w, cord.y - _span.h);

                }
                _arc.onmousemove(aover1);
                _arc.ontouchstart(aover1);
                _arc.ontouchend(function () { });



                _arc.onmouseout(function () {
                    that.setCanvasStyle("cursor", "");
                    displayTitle(0, total, totalStr);
                    _span.hide();
                    ani1.repaint();
                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        _legends[j].render();
                    }

                });
                _arc.onclick(function () {
                    var blen = that.quarterly.barlink.length;
                    if (blen == 0) return;

                    var href = that.quarterly.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }
                })
            })(i);
            _arcs.push(_arc);
        }

        function out(ani) {
            that.setCanvasStyle("cursor", "");
            displayTitle(0, total, totalStr);
            displayTitle(1, total, totalStr);
            _span.hide();
            _span1.hide();
            ani.repaint();
            for (var j = 0; j < _legends.length; j++) {
                _legends[j].clear();
                _legends[j].render();
            }
        }

        var _splitLine = _wrapper.addBanner(0, 0, 0, 0, "RGB(224,224,224)", _container);
        _splitLine.setBorderState(false);
        _splitLine.absolute = true;
        _splitLine.left = 12;
        _splitLine.addScaleHandler(function (scale) {
            this.left = this.left * scale / that.scale;
            this.w = Math.floor(this.parentNode.w - 2 * this.left);
            this.h = 1;
            this.top = Math.floor(this.parentNode.h * 207 / 362);
        });



        var fontsize = this.groupTitle.fontSize;
        var r;


        var _blabTitle = _wrapper.addPieRowLable(0, 0, 0, 0, "", this.groupTitle.fontFamily, _container);
        _blabTitle.absolute = true;
        _blabTitle.setZIndex(100);
        _blabTitle.fontsize = fontsize;
        _blabTitle.left = 108;
        _blabTitle.addScaleHandler(function (scale) {
            r = (this.parentNode.w / 2 - (lineWidth + 12) * scale * 2) / 2 - (lineWidth + 5) * scale / 2;

            this.left = Math.round(this.parentNode.w * 108 / 400) - r;
            this.top = Math.round(this.parentNode.h * 118 / 362);
            this.fontsize = this.fontsize * scale / that.scale;
            this.top = this.top - this.fontsize * 2;
            if (this.txtStorage.length == 0) {
                updateRowLable(_blabTitle, this.left, this.top, 2 * r, total.toFixed(1), totalStr, this.fontsize);
                // displayTitle(0, total, totalStr);
            }
            else {
                var tmpValue = parseFloat(this.txtStorage[0].txt.replace("$", ""));
                var tmpStr = "";
                for (var i = 1, ci; ci = this.txtStorage[i]; i++) {

                    tmpStr += ci.txt;
                }
                this.txtStorage = null;
                displayTitle(0, tmpValue, tmpStr.trim());
            }
            var counter = 0;
            this.eachTxt(function (txtItem) {
                if (counter == 0) {
                    txtItem.fontsize = this.fontsize * 1.5;
                }
                else {
                    txtItem.fontsize = this.fontsize;
                }
                counter++;

            });
        });

        _pin.applyStartPointHandler(function (x, y) {
            this.left = x;
            this.top = y;
        });


        var _blabTitle1 = _wrapper.addPieRowLable(0, 0, 0, 0, "", this.groupTitle.fontFamily, _container);
        _blabTitle1.absolute = true;
        _blabTitle1.setZIndex(99);
        _blabTitle1.fontsize = fontsize;
        _blabTitle1.addScaleHandler(function (scale) {
            r = (this.parentNode.w / 2 - (lineWidth + 12) * 2 * scale) / 2 - (lineWidth + 5) * scale / 2;

            this.left = Math.round(this.parentNode.w * 292 / 400) - r;
            this.top = Math.round(this.parentNode.h * 118 / 362);
            this.fontsize = this.fontsize * scale / that.scale;

            this.top = this.top - this.fontsize * 2;
            if (this.txtStorage.length == 0) {
                updateRowLable(this, this.left, this.top, 2 * r, total1.toFixed(1), totalStr, this.fontsize);
            }
            else {
                var tmpValue = parseFloat(this.txtStorage[0].txt.replace("$", ""));
                var tmpStr = "";
                for (var i = 1, ci; ci = this.txtStorage[i]; i++) {
                    tmpStr += ci.txt;
                }
                this.txtStorage = null;
                displayTitle(1, tmpValue, tmpStr.trim());


            }
            var counter = 0;
            this.eachTxt(function (txtItem) {
                if (counter == 0) {
                    txtItem.fontsize = this.fontsize * 1.5;
                }
                else {
                    txtItem.fontsize = this.fontsize;
                }
                // txtItem.w = txtItem.w * scale / that.scale;
                //txtItem.left = txtItem.left * scale / that.scale;

                counter++;

            });
        });





        _blabTitle.constructor.prototype.clear = function () {
            this.txtStorage = [];
        }

        var _clabTitle = _wrapper.addLable(0, 0, 0, 0, null, null, _container);
        _clabTitle.addText(this.quarterly.labitems[0], this.quarterly.labcolor, this.quarterly.fontSize, null, "bold");
        _clabTitle.absolute = true;
        _clabTitle.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w * 85 / 400);
            this.top = Math.round(this.parentNode.h * 18 / 362);
            this.h = 20 * scale;//14 * scale;
            this.eachTxt(function (txtItem) {
                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });

        var _clabTitle1 = _wrapper.addLable(0, 0, 0, 0, null, null, _container);
        _clabTitle1.addText(this.quarterly.labitems[1], this.quarterly.labcolor, this.quarterly.fontSize, null, "");
        _clabTitle1.absolute = true;
        _clabTitle1.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w * 269 / 400);

            this.top = Math.round(this.parentNode.h * 18 / 362);
            this.h = 20 * scale;//14 * scale;
            this.eachTxt(function (txtItem) {
                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });




        var _yclabTitle = _wrapper.addLable(0, 0, 0, 0, null, null, _container);
        _yclabTitle.addText(this.yearToDate.labitems[0], this.yearToDate.labcolor, this.yearToDate.fontSize, null, "bold");
        _yclabTitle.absolute = true;
        _yclabTitle.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w * 85 / 400);
            this.top = Math.round(this.parentNode.h * 18 / 362);
            this.h = 20 * scale;//14 * scale;
            this.eachTxt(function (txtItem) {
                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });

        var _yclabTitle1 = _wrapper.addLable(0, 0, 0, 0, null, null, _container);
        _yclabTitle1.addText(this.yearToDate.labitems[1], this.yearToDate.labcolor, this.yearToDate.fontSize, null, "");
        _yclabTitle1.absolute = true;
        _yclabTitle1.addScaleHandler(function (scale) {
            this.left = Math.round(this.parentNode.w * 269 / 400);

            this.top = Math.round(this.parentNode.h * 18 / 362);
            this.h = 20 * scale;//14 * scale;
            this.eachTxt(function (txtItem) {
                txtItem.fontsize = txtItem.fontsize * scale / that.scale;
            });
        });





        var _arcs1 = [];
        var data1 = this.quarterly.data[1]; //[145, 245, 321, 210, 100];
        //var color1 = ["#7fba00", "#68217a", "#0072c6", "#00b294", "#ff8c00"];
        var sum1 = data1.reduce(function (pv, cv, ci) {
            return Math.abs(parseFloat(pv)) + Math.abs(parseFloat(cv));
        }, 0);
        var spaceUnit1 = 0.01 * sum1;
        var total1 = sum1 + parseFloat(this.quarterly.unallocated[1]);
        sum1 = sum1 + spaceUnit1 + spaceUnit1 * (data1.length - 1);
        var start1 = 0.75;
        for (var i = 0; i < data1.length; i++) {
            var _arc = _wrapper.addArc(0, 0, 0, "", color[i], _container);
            _arc.caption = data1[i];
            _arc.nr = nr;
            _arc.setZIndex(10 + i);
            _arc.lineWidth = lineWidth;
            _arc.marginLeft = marginLeft;
            (function (i) {
                _arc.addScaleHandler(function (scale) {
                    this.nx = Math.round(this.parentNode.w * 292 / 400);
                    this.ny = Math.round(this.parentNode.h * 118 / 362);
                    this.startPosition = start1;
                    this.endPosition = start1 + data1[i] / sum1
                    start1 = this.endPosition + spaceUnit1 / sum1;
                    this.marginLeft = this.marginLeft * scale / that.scale;
                    this.lineWidth = this.lineWidth * scale / that.scale;

                    this.r = (this.parentNode.w / 2 - (this.lineWidth + this.marginLeft) * 2) / 2;
                    this.setOriginPoint(this.parentNode.sx, this.parentNode.sy);
                });
                function aover2(cord) {
                    that.setCanvasStyle("cursor", "pointer");
                    displayTitle(0, total, totalStr);
                    displayTitle(1, this.caption, groupTitle[i]);
                    this.setRenderFlag(false);
                    _span.hide();
                    ani1.repaint();
                    this.setRenderFlag(true);
                    this.repaint();
                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        if (i == j) {
                            _legends[j].repaint();
                        }
                        else {
                            _legends[j].render();
                        }
                    }
                    var p = (parseFloat(this.caption) * 100 / parseFloat(total1)).toFixed(0) + "%";
                    _span1.updateText(p);
                    _span1.moveTo(cord.x - _span.w, cord.y - _span.h);

                }
                _arc.ontouchstart(aover2);
                _arc.onmousemove(aover2);
                _arc.onmouseout(function () {
                    that.setCanvasStyle("cursor", "");

                    displayTitle(1, total1, totalStr);

                    _span1.hide();
                    ani1.repaint();

                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        _legends[j].render();
                    }


                });
                _arc.ontouchend(function () { });
                _arc.onclick(function () {
                    var blen = that.quarterly.barlink.length;
                    if (blen == 0) return;

                    var href = that.quarterly.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }
                })


            })(i);
            _arcs1.push(_arc);
        }
        /**********YearToDate*****************/


        var _yarcs = [];
        var ydata = this.yearToDate.data[0]; //[1, 5.2, 0.9, 5.7, 3.8];

        var ysum = ydata.reduce(function (pv, cv, ci) {
            return Math.abs(parseFloat(pv)) + Math.abs(parseFloat(cv));
        }, 0);
        var yspaceUnit = 0.01 * ysum;
        var ytotal = ysum + parseFloat(this.yearToDate.unallocated[0]);
        ysum = ysum + yspaceUnit + yspaceUnit * (ydata.length - 1);
        var ystart = 0.75;
        for (var i = 0; i < ydata.length; i++) {
            var _arc = _wrapper.addArc(0, 0, 0, "", color[i], _container);
            _arc.caption = ydata[i];
            _arc.nr = nr;
            _arc.setZIndex(10 + i);
            _arc.marginLeft = marginLeft;
            _arc.lineWidth = lineWidth;
            (function (i) {
                _arc.addScaleHandler(function (scale) {
                    this.nx = Math.round(this.parentNode.w * 108 / 400);
                    this.ny = Math.round(this.parentNode.h * 118 / 362);

                    this.startPosition = ystart;
                    this.endPosition = ystart + ydata[i] / ysum
                    ystart = this.endPosition + yspaceUnit / ysum;
                    this.marginLeft = this.marginLeft * scale / that.scale;
                    this.lineWidth = this.lineWidth * scale / that.scale;
                    this.r = (this.parentNode.w / 2 - (this.lineWidth + this.marginLeft) * 2) / 2;
                    this.setOriginPoint(this.parentNode.sx, this.parentNode.sy);

                });
                _arc.applySetLTHandler(function (change) {
                });
                function yaover1(cord) {
                    that.setCanvasStyle("cursor", "pointer");
                    displayTitle(1, ytotal1, totalStr);
                    displayTitle(0, this.caption, groupTitle[i]);

                    this.setRenderFlag(false);
                    _span1.hide();
                    ani3.repaint();
                    this.setRenderFlag(true);
                    this.repaint();

                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        if (i == j) {
                            _legends[j].repaint();
                        }
                        else {
                            _legends[j].render();
                        }
                    }
                    var p = (parseFloat(this.caption) * 100 / parseFloat(ytotal)).toFixed(0) + "%";
                    _span.updateText(p);
                    _span.moveTo(cord.x - _span.w, cord.y - _span.h);

                }
                _arc.ontouchstart(yaover1);
                _arc.onmousemove(yaover1);
                _arc.onmouseout(function () {
                    that.setCanvasStyle("cursor", "");
                    displayTitle(0, ytotal, totalStr);
                    _span.hide();
                    ani3.repaint();
                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        _legends[j].render();

                    }
                });
                _arc.ontouchend(function () { });
                _arc.onclick(function () {
                    var blen = that.yearToDate.barlink.length;
                    if (blen == 0) return;

                    var href = that.yearToDate.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }
                });
            })(i);
            _yarcs.push(_arc);
        }

        var _ysplitLine = _wrapper.addBanner(0, 0, 0, 0, "RGB(224,224,224)", _container);
        _ysplitLine.setBorderState(false);
        _ysplitLine.absolute = true;
        _ysplitLine.left = 12;
        _ysplitLine.addScaleHandler(function (scale) {
            this.left = this.left * scale / that.scale;
            this.w = Math.floor(this.parentNode.w - 2 * this.left);

            this.h = 1;
            this.top = Math.floor(this.parentNode.h * 207 / 362);
        });



        var _yarcs1 = [];
        var ydata1 = this.yearToDate.data[1]; //[145, 245, 321, 210, 100];
        var ysum1 = ydata1.reduce(function (pv, cv, ci) {
            return Math.abs(parseFloat(pv)) + Math.abs(parseFloat(cv));
        }, 0);
        var yspaceUnit1 = 0.01 * ysum1;
        var ytotal1 = ysum1 + parseFloat(this.yearToDate.unallocated[1]);
        ysum1 = ysum1 + yspaceUnit1 + yspaceUnit1 * (ydata1.length - 1);
        var ystart1 = 0.75;
        for (var i = 0; i < ydata1.length; i++) {
            var _arc = _wrapper.addArc(0, 0, 0, "", color[i], _container);
            _arc.caption = ydata1[i]
            _arc.nr = nr;
            _arc.setZIndex(10 + i);
            _arc.marginLeft = marginLeft;
            _arc.lineWidth = lineWidth;
            (function (i) {
                _arc.addScaleHandler(function (scale) {
                    this.nx = Math.round(this.parentNode.w * 292 / 400);
                    this.ny = Math.round(this.parentNode.h * 118 / 362);
                    this.startPosition = ystart1;
                    this.endPosition = ystart1 + ydata1[i] / ysum1
                    ystart1 = this.endPosition + yspaceUnit1 / ysum1;
                    this.marginLeft = this.marginLeft * scale / that.scale;
                    this.lineWidth = this.lineWidth * scale / that.scale;

                    this.r = (this.parentNode.w / 2 - (this.lineWidth + this.marginLeft) * 2) / 2;
                    this.setOriginPoint(this.parentNode.sx, this.parentNode.sy);
                });
                function yaover2(cord) {
                    that.setCanvasStyle("cursor", "pointer");
                    displayTitle(0, ytotal, totalStr);

                    displayTitle(1, this.caption, groupTitle[i]);
                    this.setRenderFlag(false);
                    _span1.hide();
                    ani3.repaint();
                    this.setRenderFlag(true);
                    this.repaint();

                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        if (i == j) {
                            _legends[j].repaint();
                        }
                        else {
                            _legends[j].render();
                        }
                    }
                    var p = (parseFloat(this.caption) * 100 / parseFloat(ytotal1)).toFixed(0) + "%";
                    _span1.updateText(p);
                    _span1.moveTo(cord.x - _span1.w, cord.y - _span1.h);
                }
                _arc.ontouchstart(yaover2);
                _arc.onmousemove(yaover2);
                _arc.onmouseout(function () {
                    that.setCanvasStyle("cursor", "");
                    displayTitle(1, ytotal1, totalStr);
                    _span1.hide();
                    ani3.repaint();
                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        _legends[j].render();
                    }
                });
                _arc.ontouchend(function () { });
                _arc.onclick(function () {
                    var blen = that.yearToDate.barlink.length;
                    if (blen == 0) return;

                    var href = that.yearToDate.barlink[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }
                })
            })(i);
            _yarcs1.push(_arc);
        }
        /*****************************/
        //w, txt, color, fontsize, family, weight, align
        function updateRowLable(ctrl, left, top, w, value, text, fontsize, color, family, weight, align) {
            var _color = color ? color : "black";
            var _fontsize = Math.floor(fontsize);
            var _family = family ? family : "Segoe UI";
            var _weight = weight ? weight : "bold";
            var _align = align ? align : "center";
            ctrl.clear();
            var txts = text.split(" ");
            var tmw = 0;
            var tmpw = 0;
            var txt = "";
            var sx = 0;
            var len = w;
            //var _fontsize = fontsize; //scale ? _fontsize * scale / that.scale : _fontsize * that.scale;
            var l = 0;
            var row = 0;
            ctrl.addText(len, l, "$" + value, _color, _fontsize * 1.5, _family, "bold", "center");
            ctrl.addText(len, l, "", _color, _fontsize, _family, "", "center");
            for (var ti = 0; ti < txts.length; ti++) {
                tmpw = that.wrapper.messureText("", _fontsize, _family, txts[ti]).width;
                tmw += tmpw;
                if (tmw >= len) {
                    if (txt.trim() == "") {
                        ctrl.addText(len, l, txts[ti] + " ", _color, _fontsize, _family, "", "center");
                    }
                    else {
                        ctrl.addText(len, l, txt, _color, _fontsize, _family, "", "center");
                        txt = txts[ti] + " ";
                    }
                    row++;
                    len = (w - _fontsize * row * 2);
                    l = (w - len) / 2;
                    tmw = tmpw;
                }
                else {
                    txt += txts[ti] + " ";

                }
                if (ti == txts.length - 1) {
                    var xinTxt;
                    var xinLen;
                    row++;
                    len = (w - _fontsize * row * 2);
                    l = (w - len) / 2;
                    if (!!txt && txt.trim().lastIndexOf("*") == txt.trim().length - 1) {
                        txt = txt.slice(0, txt.length - 2);
                        xinTxt = "*";
                        xinLen = that.wrapper.messureText("", _fontsize, _family, xinTxt).width;
                        ctrl.addText((len - xinLen) * 1.1, l, txt.replace(/\*+$/, ""), _color, _fontsize, _family, "", "center");

                        ctrl.addText(xinLen, 0, xinTxt, "red", _fontsize, _family, "bold", "center", true);
                    }
                    else {
                        ctrl.addText(len, l, txt, _color, _fontsize, _family, "", "center");
                    }
                }

                // resolve the touch - screen bug
                var count = 0;
                for (var m = 0, cm; cm = ctrl.txtStorage[m]; m++) {
                    if (cm.txt.trim() == "*") {
                        count++;
                        if (count > 1) {
                            ctrl.txtStorage.pop();
                        }
                    }
                }
            }
            //ctrl.left = left; 
            //ctrl.top = top;
        }

        function displayTitle(index, value, text) {
            var left;
            var top;
            index == !!index ? index : 0;
            value = parseFloat(value).toFixed(1);
            if (index == 0) {
                left = Math.round(_blabTitle.parentNode.w * 108 / 400) - r;
                top = Math.round(_blabTitle.parentNode.h * 118 / 220);
                updateRowLable(_blabTitle, left, top, 2 * r, value, text, _blabTitle.fontsize);
            }
            else {
                left = Math.round(_blabTitle1.parentNode.w * 292 / 400) - r;
                top = Math.round(_blabTitle1.parentNode.h * 118 / 220);
                updateRowLable(_blabTitle1, left, top, 2 * r, value, text, _blabTitle1.fontsize);
            }
        }


        var _legends = [];
        for (var i = 0; i < data.length; i++) {
            var _legend = _wrapper.addLegend(0, 0, 0, 0, "", "", _container)
            _legend.addText(groupTitle[i], null, 12, null, null, null);
            _legend.setZIndex(10);
            _legend.absolute = true;
            _legend.backColor = "red";
            (function (i) {
                //_legend.left = 20;
                //_legend.backColor = color[i]
                _legend.addScaleHandler(function (scale) {
                    this.h = Math.round(this.parentNode.h * 20 / 362);
                    this.left = Math.round(this.parentNode.w / 20) + 1;
                    this.top = Math.floor(this.parentNode.h * 220 / 362) + i * (this.h * 1.2);
                    this.eachTxt(function (itemtxt) {
                        itemtxt.fontsize = itemtxt.fontsize * scale / that.scale;
                    })
                    // this.setOriginPoint(_chartback.sx, _chartback.sy);
                });
                _legend.addLegendHandler(function (x, y, w, h) {
                    var _h = Math.round(h);
                    var _x = Math.round(x);
                    var _y = Math.round(y);
                    var _w = Math.round(w);
                    this.wrapper.drawRect(_x, _y, _w, _h, color[i]);
                });
                function legendOver() {
                    that.setCanvasStyle("cursor", "pointer");
                    for (var j = 0; j < _legends.length; j++) {
                        if (i == j) {
                            var tsum, tsum1, tctrl, tctrl1, animation;
                            if (_btn.isSelected) {
                                tsum = total;
                                tsum1 = total1;
                                tctrl = _arcs[i];
                                tctrl1 = _arcs1[i];
                                animation = ani1;
                            }
                            else if (_btn2.isSelected) {
                                tsum = ytotal;
                                tsum1 = ytotal1;
                                tctrl = _yarcs[i];
                                tctrl1 = _yarcs1[i];
                                animation = ani3;
                            }
                            var p = (parseFloat(tctrl.caption) * 100 / parseFloat(tsum)).toFixed(0) + "%";
                            _span.hide();
                            _span.updateText(p);
                            p = (parseFloat(tctrl1.caption) * 100 / parseFloat(tsum1)).toFixed(0) + "%";
                            _span1.hide();
                            _span1.updateText(p);
                            /****display  title*****/
                            displayTitle(0, tctrl.caption, groupTitle[i]);
                            displayTitle(1, tctrl1.caption, groupTitle[i]);

                            tctrl.setRenderFlag(false);
                            tctrl1.setRenderFlag(false);
                            animation.repaint();
                            tctrl.setRenderFlag(true);
                            tctrl.repaint();
                            tctrl1.setRenderFlag(true);
                            tctrl1.repaint();


                            /**display toolTip***/

                            function position(ctrl, span) {
                                var start = ctrl.startPosition;
                                var end = ctrl.endPosition;
                                var r = ctrl.r;
                                var a = (end - (end - start) / 2) * Math.PI * 2;
                                var jp = that.wrapper.getCtrlHierarchy(ctrl);
                                var _x = jp.x + ctrl.cx() + Math.cos(a) * r;
                                var _y = jp.y + ctrl.cy() + Math.sin(a) * r;
                                _x = _x - ctrl.cx() > 0 ? _x - span.w / 3 : _x - span.w;
                                var p = { x: _x, y: _y };
                                return p;
                            }
                            var _position = position(tctrl, _span);
                            _span.moveTo(_position.x, _position.y);
                            var _position = position(tctrl1, _span1);
                            _span1.moveTo(_position.x, _position.y);

                            this.clear();
                            this.repaint();
                        }
                        else {


                            _legends[j].clear();
                            _legends[j].render();
                        }
                    }

                }
                _legend.onmousemove(legendOver);
                _legend.ontouchstart(legendOver);
                _legend.onmouseout(function () {
                    that.setCanvasStyle("cursor", "");

                    var value;
                    var value1;
                    var ani;
                    if (_btn.isSelected) {
                        ani = ani1;
                        value = total;
                        value1 = total1;
                    }
                    else if (_btn2.isSelected) {
                        ani = ani3;
                        value = ytotal;
                        value1 = ytotal1;

                    }
                    displayTitle(0, value, totalStr);
                    displayTitle(1, value1, totalStr);
                    _span.hide();
                    _span1.hide();
                    ani.repaint();



                    for (var j = 0; j < _legends.length; j++) {
                        _legends[j].clear();
                        _legends[j].render();

                    }

                });
                _legend.ontouchend(function () { });
                _legend.onclick(function () {
                    var links;
                    if (_btn.isSelected) {
                        links = that.quarterly.barlink;
                    }
                    else {
                        links = that.yearToDate.barlink;
                    }


                    var blen = links.length;
                    if (blen == 0) return;

                    var href = links[i % blen];
                    if (href.trim().length > 0) {
                        location.href = href;
                    }
                })
            })(i);
            _legends.push(_legend);

        }
        var _labComment = _wrapper.addLable(0, 0, 0, 20, null, "Segoe UI", _container);
        _labComment.addText("* ", "rgb(244,104,14)", 16, "Segoe UI");
        _labComment.addText("includes {0} of unallocated and other in {1} and {2} in {3} not shown", null, 9, "Segoe UI", null);
        //_labComment.addText(" on graph", null, 9, "Segoe UI", null);
        _labComment.setZIndex(13);
        _labComment.absolute = true;
        _labComment.addScaleHandler(function (scale) {
            this.h = Math.round(this.parentNode.h / 42);
            this.left = Math.round(this.parentNode.w / 16);
            this.top = this.parentNode.h * 343 / 362;
            var counter = 0;
            this.eachTxt(function (txtItem) {
                if (counter == 0) {
                    txtItem.fontsize = 16 * scale;
                    counter++;
                }
                else {
                    txtItem.fontsize = 9 * scale;
                }

            });
        });
        _labComment.updateText = function (args) {

            this.eachTxt(function (txtItem) {
                if (txtItem.txt.trim() != "*") {
                    txtItem.txt = "includes {0} of unallocated and other in {1} and {2} in {3} not shown";
                }
                args.forEach(function (v) {
                    var tv = v;
                    if (v.toString().search(/Q\d/i) >= 0) {
                        tv = "FY" + v.substr(2, 2) + "-" + v.substr(0, 2);
                    }
                    var _tv = tv.replace(/\$\-\d+M/i, function (ttv) {

                        return ttv.replace("-", "(").replace(/M/i, ")M");


                    })

                    txtItem.txt = txtItem.txt.toString().replace(/\{\d+\}/, _tv);

                })
            })
        }
        var _labComment1 = _wrapper.addLable(0, 0, 0, 20, null, "Segoe UI", _container);
        _labComment1.addText("  ", "rgb(244,104,14)", 16, "Segoe UI");
        _labComment1.addText(" on graph", null, 8, "Segoe UI", null);
        _labComment1.setZIndex(13);
        _labComment1.absolute = true;
        _labComment1.addScaleHandler(function (scale) {
            this.h = Math.round(this.parentNode.h / 42);
            this.left = Math.round(this.parentNode.w / 16);
            //this.txtStorage = [];

            this.top = this.parentNode.h * 345 / 362 + _labComment.h;
            var counter = 0;
            this.eachTxt(function (txtItem) {
                if (counter == 0) {
                    txtItem.fontsize = 16 * scale;
                    counter++;
                }
                else {
                    txtItem.fontsize = 9 * scale;
                }

            });
        });





        var ani0 = _wrapper.addAnimation(20);
        ani0.applyCtrls(_btnLine, _backBanner, _btn, _btn2);
        ani0.logChanges(_backBanner, { sx: _backBanner.w }, 0, 1);

        ani0.addClearHandler(function () {
            this.applyClearArea(_btnLine.sx, _btnLine.sy, _btnLine.w, _btnLine.h);
        });

        /**Quarterly animation***/
        var ani1 = _wrapper.addAnimation(20);
        ani1.applyCtrls(_container, _splitLine, _blabTitle, _blabTitle1, _clabTitle, _clabTitle1, _labComment, _labComment1, _span);
        for (var i = 0, ci; ci = _legends[i]; i++) {
            ani1.applyCtrls(ci);
        }
        for (var i = 0; i < _arcs.length; i++) {
            ani1.logChanges(_arcs[i], { nr: -nr }, 0, 2);
            ani1.logChanges(_arcs[i], { alpha: 1 }, 0, 2);
        }
        for (var i = 0; i < _arcs1.length; i++) {
            ani1.logChanges(_arcs1[i], { nr: -nr }, 0, 2);
            ani1.logChanges(_arcs1[i], { alpha: 1 }, 0, 2);
        }
        ani1.addClearHandler(function () {
            this.applyClearArea(_container.sx, _container.sy, _container.w, _container.h);
        });

        _bigback.addScaleHandler(function (scale) {
            _span.hide();
            _span1.hide();
        });

        /*****end*****************/
        /**YeartoDate animation***/
        var ani3 = _wrapper.addAnimation(20);
        ani3.applyCtrls(_container, _ysplitLine, _blabTitle, _blabTitle1, _yclabTitle, _yclabTitle1, _labComment, _labComment1, _span1);
        for (var i = 0, ci; ci = _legends[i]; i++) {
            ani3.applyCtrls(ci);
        }
        for (var i = 0; i < _yarcs.length; i++) {
            ani3.logChanges(_yarcs[i], { nr: -nr }, 0, 2);
            ani3.logChanges(_yarcs[i], { alpha: 1 }, 0, 2);
        }
        for (var i = 0; i < _yarcs1.length; i++) {

            ani3.logChanges(_yarcs1[i], { nr: -nr }, 0, 2);
            ani3.logChanges(_yarcs1[i], { alpha: 1 }, 0, 2);
        }
        ani3.addClearHandler(function () {
            this.applyClearArea(_container.sx, _container.sy, _container.w, _container.h);
        });
        ani3.attachDeactiveHandler(function () {
            //_labComment.reset();
        })
        ani3.attachDeactiveHandler(function () {
            //_labComment.reset();
        })
        /*****end*****************/

        function setQRenderFlag(flag) {
            for (var i = 0, ci, ci1; ci = _arcs[i], ci1 = _arcs1[i]; i++) {
                ci.setRenderFlag(flag);
                ci1.setRenderFlag(flag);
            }
            _clabTitle.setRenderFlag(flag);
            _clabTitle1.setRenderFlag(flag);

        }
        function setYRenderFlag(flag) {
            for (var i = 0, ci, ci1; ci = _yarcs[i], ci1 = _yarcs1[i]; i++) {
                ci.setRenderFlag(flag);
                ci1.setRenderFlag(flag);
            }
            _yclabTitle.setRenderFlag(flag);
            _yclabTitle1.setRenderFlag(flag);
        }


        function btn() {
            //if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani0.ready == false) {
                // animateState = false;
                _span.hide();
                _span1.hide();
                setYRenderFlag(false);
                setQRenderFlag(true);
                displayTitle(0, total, totalStr);
                displayTitle(1, total1, totalStr);
                ani0.resetOnlyStatus();
                ani0.setFirstRange(-this.w);
                ani0.active();
                _btn.isSelected = true;
                _btn2.isSelected = false;
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn2.fontColor = that.yearToDateTabStyle.fontcolor;


                _labComment.updateText(["$" + that.quarterly.unallocated[0] * 1000 + "M", that.quarterly.labitems[0], "$" + that.quarterly.unallocated[1] * 1000 + "M", that.quarterly.labitems[1]]);

                ani3.reset();
                ani3.deactive();
                ani1.restart();
            }
        }
        _btn.ontouchstart(btn);
        _btn.onclick(btn);

        function btn2() {
            //if (!that.completed) return;
            if (Math.abs(this.sx - _backBanner.sx) > 1 && ani0.ready == false) {
                // animateState = false;
                _span.hide();
                _span1.hide();
                setYRenderFlag(true);
                setQRenderFlag(false);
                displayTitle(0, ytotal, totalStr);
                displayTitle(1, ytotal1, totalStr);
                ani0.resetOnlyStatus();
                ani0.setFirstRange(this.w);
                ani0.active();
                _btn.isSelected = false;
                _btn2.isSelected = true;
                this.fontColor = that.quarterlyTabStyle.fontcolor;
                _btn.fontColor = that.yearToDateTabStyle.fontcolor;
                _labComment.updateText(["$" + that.yearToDate.unallocated[0] * 1000 + "M", that.yearToDate.labitems[0], "$" + that.yearToDate.unallocated[1] * 1000 + "M", that.yearToDate.labitems[1]]);

                ani1.reset();
                ani1.deactive();
                ani3.restart();
            }
        }
        _btn2.onclick(btn2);
        _btn2.ontouchstart(btn2);
        function pinClick() {
            // this.pinClickHandler.notify(arguments);
            if (_pin.checked) {
                that.pinCheckedHandler.notify();
                _pin.caption = "Click to undock chart"

            }
            else {
                that.pinNoCheckedHandler.notify();
                _pin.caption = "Click to dock chart"
            }
            if (_pin.toolTip) {
                _pin.toolTip.updateText(_pin.caption);
            }

        }

        _pin.onclick(pinClick);
        if (initTab) {
            _btn2.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn.applyFont(this.yearToDateTabStyle.fontcolor);

            _btn2.isSelected = true;
            _btn.isSelected = false;
            displayTitle(0, ytotal, totalStr);
            displayTitle(1, ytotal1, totalStr);
            setYRenderFlag(true);
            setQRenderFlag(false);
            _labComment.updateText(["$" + that.yearToDate.unallocated[0] * 1000 + "M", that.yearToDate.labitems[0], "$" + that.yearToDate.unallocated[1] * 1000 + "M", that.yearToDate.labitems[1]]);
            ani3.active();
        }
        else {
            _btn.applyFont(this.quarterlyTabStyle.fontcolor);
            _btn2.applyFont(this.yearToDateTabStyle.fontcolor);
            _btn.isSelected = true;
            _btn2.isSelected = false;
            displayTitle(0, total, totalStr);
            displayTitle(1, total1, totalStr);
            setYRenderFlag(false);
            setQRenderFlag(true);

            _labComment.updateText(["$" + that.quarterly.unallocated[0] * 1000 + "M", that.quarterly.labitems[0], "$" + that.quarterly.unallocated[1] * 1000 + "M", that.quarterly.labitems[1]]);

            ani1.active();
        }
        if (isQ4) {
            _btn2.caption = "Annual";
        }
        //_wrapper.hasTouchCtrls = [_btn, _btn2, _backBanner].concat(_arcs).concat(_arcs1).concat(_yarcs).concat(_yarcs1).concat(_legends);
        that.touchFlagDisableCtrl.push(_bigback);
    });
}
inheritPrototype(IR.Doughnut, IR.Chart);
multipleinheritPrototype(IR.Doughnut, IR.ChartDoughnutAttribute);
/*****************************************************************/

IR.Common = {
    getOneRankArray: function (array, results) {
        results = results || [];
        if (Object.prototype.toString.call(array).toLowerCase() == "[object array]") {
            for (var i = 0, ci; ci = array[i], i < array.length; i++) {
                arguments.callee(ci, results);
            }
        }
        else {
            results.push(array);
        }
        return results;
    },
    getPrecision: function (d, r) {
        if (r < 0 || r == null || r == undefined) return -1;
        if (Object.prototype.toString.call(d).toLowerCase() == "[object number]") {
            var str = parseFloat(d).toFixed(r);
            var start = str.indexOf(".", 0)
            return start > 0 ? str.substring(start + 1, str.length).length : 0;
        }
        else {
            return 0;
        }
    },
    getRange: function (data, isEpsBar, decimalNo) {
        var array = this.getOneRankArray(data);
        var maxValue, minValue;
        maxValue = Math.max.apply(null, array);
        minValue = Math.min.apply(null, array);
        var scale;
        if (minValue >= 0) {
            if (!isEpsBar) {
                if (maxValue >= 21) {
                    scale = mul(Math.ceil(div(maxValue, 6)), 2);
                }
                else if (maxValue <= 4) {
                    scale = div(Math.ceil(div(mul(maxValue, 10), 3)), 10);
                }
                else {
                    scale = Math.ceil(div(maxValue, 3));
                }

                return [0, mul(scale, 3)];

            }
            else {
                scale = (maxValue / 3).toFixed(2);
                scale = (parseFloat(scale));
                scale = (scale * 100) % 2 == 0 ? scale : scale + 0.01;
                var tmpmax = (scale * 3).toFixed(decimalNo);
                return [0.00, parseFloat(tmpmax)];
            }
        }
        else if (maxValue <= 0) {
            if (!isEpsBar) {
                if (-minValue >= 30) {
                    scale = mul(Math.ceil(div(mul(Math.abs(minValue), 10), 56)), 2);
                }
                else if (-minValue <= 9) {
                    scale = div(Math.ceil(-div(mul(minValue, 10), 2.8)), 10);
                }
                else {
                    scale = Math.ceil(-div(mul(minValue, 10), 28));
                }
                return [-mul(scale, 3), 0];
            }
            else {
                scale = (Math.abs(minValue) / 2.8).toFixed(2);
                scale = (parseFloat(scale));
                scale = (scale * 100) % 2 == 0 ? scale : scale + 0.01
                var tmpmin = 0 - parseFloat((scale * 3).toFixed(decimalNo));
                return [tmpmin, 0.00];
            }

        } else if (Math.abs(minValue) > Math.abs(maxValue)) {
            if (!isEpsBar) {
                if (div((-minValue), 1.8) > maxValue) {
                    if (-minValue >= 15) {
                        scale = Math.round((-minValue) / (1.8 * 2)) * 2;
                    }
                    else if (-minValue <= 7) {
                        scale = Math.ceil(-minValue * 10 / 1.8) / 10;
                    }
                    else {
                        scale = Math.ceil(-minValue / 1.8);
                    }
                }
                else {
                    if (maxValue >= 1) {
                        scale = Math.ceil(maxValue / 2) * 2;
                    }
                    else {
                        scale = Math.ceil(maxValue * 10) / 10;
                    }
                }

                return [-scale * 2, scale];
            }
            else {
                scale = parseFloat(scale);
                scale = ((-minValue) / 1.8 > maxValue) ? ((-minValue) / 1.8).toFixed(2) : maxValue.toFixed(2);
                scale = (parseFloat(scale));
                scale = (scale * 100) % 2 == 0 ? scale : scale + 0.01;
                var tmpmax = parseFloat(parseFloat(scale).toFixed(decimalNo));
                var tmpmin = parseFloat((parseFloat(scale) * 2).toFixed(decimalNo));
                return [-tmpmin, tmpmax];
            }
        }
        else if (Math.abs(minValue) <= Math.abs(maxValue)) {
            if (!isEpsBar) {
                if (maxValue / 2 > (-minValue)) {
                    if (maxValue >= 15) {
                        scale = Math.ceil(maxValue / (2 * 2)) * 2;
                    }
                    else if (maxValue <= 5) {
                        scale = Math.ceil(maxValue * 10 / 2) / 10;
                    }
                    else {
                        scale = Math.ceil(maxValue / 2);
                    }
                }
                else {
                    if (-minValue >= 2) {
                        scale = Math.ceil(-minValue / (0.8 * 2)) * 2;
                    }
                    else if (-minValue <= 1) {
                        scale = Math.ceil(-minValue * 10 / 0.8) / 10;
                    }
                    else {
                        scale = Math.ceil(-minValue / 0.8);
                    }
                }
                var tmpmax = scale * 2;
                var tmpmin = scale;
                return [-tmpmin, tmpmax];

            }
            else {
                scale = (maxValue / 2 > (-minValue / 0.8)) ? (maxValue / 2).toFixed(2) : (-minValue / 0.8).toFixed(2);
                scale = (parseFloat(scale));
                scale = scale * 100 % 2 == 0 ? scale : scale + 0.01;
                var tmpmax = scale * 2;
                var tmpmin = scale;
                return [-tmpmin, tmpmax];
            }
        }
    },
    getLeftRange: function (data) {

        var ta = this.getMaxOrMin(data);
        var maxValue = ta.max;
        var minValue = ta.min;
        var scale = Math.ceil((maxValue - minValue) / (5 - 2));
        return [0, scale * 4];
    },
    getRightRange: function (data) {
        var ta = this.getMaxOrMin(data);
        var maxValue = ta.max;
        var minValue = ta.min;
        var scale = parseFloat(((maxValue - minValue) / (5 - 1)).toFixed(2));
        return [0, parseFloat(scale) * 4];
    },
    getMaxOrMin: function (data) {
        var maxValue, minValue;
        var array = this.getOneRankArray(data);
        maxValue = Math.max.apply(null, array);
        minValue = Math.min.apply(null, array);
        if (minValue > 0) {
            minValue = 0;
        } else if (maxValue < 0) {
            maxValue = 0;
        }
        else {
            var tmp = minValue;
            minValue = maxValue;
            maxValue = tmp;
        }
        return { max: maxValue, min: minValue };
    }
}
IR.DataModel = function (xmlFile) {
    var xdoc;
    var json = {};
    function createXHR() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        }
        else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xhr;
    }
    (function () {
        var xhr = createXHR();
        if (xhr) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        xdoc = xhr.responseXML;
                        var allNodes = getNodes(xdoc, xdoc, ".//ChartData");
                        deal(allNodes, json);
                    }
                }
            }
            xhr.open("get", xmlFile, false);
            try {
                //IE10
                xhr.responseType = "msxml-document";
            }
            catch (e) {
            }
            xhr.send(null);
        }
    }());
    function getNodes(xdoc, contextNode, xpath) {
        var Nodes = [];
        try {
            Nodes = xdoc.selectNodes(xpath);
        }
        catch (e) {
            var xmlPath = xdoc.createExpression(xpath, null);
            var xPathRes = xmlPath.evaluate(contextNode, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (var i = 0, count = xPathRes.snapshotLength; i < count; i++) {
                Nodes.push(xPathRes.snapshotItem(i));
            }
        }
        return Nodes;
    }
    function deal(nodes, json) {
        for (var i = 0, node; node = nodes[i]; i++) {
            if (node.nodeType == 1) {
                if (node.attributes.length == 0) {
                    if (node.childNodes.length == 0) {
                        //Exclude element that doesn't have attributes  e.g. <Datasegments> doesn't have attributes in ChartDatas.xml file
                        return;
                    }
                    else {
                        arguments.callee(node.childNodes, json);
                    }
                }
                else {
                    if (node.childNodes.length == 0) {
                        var pattern = /^FY\d{2}\s+Q\d$/gi
                        var reg = new RegExp(pattern);
                        for (var j = 0, attr; attr = node.attributes[j]; j++) {
                            json[attr.nodeName] = json[attr.nodeName] || [];
                            if (reg.test(attr.nodeValue)) {
                                var start = attr.nodeValue.search(/\d{2}\s+Q\d/i)
                                var str = attr.nodeValue.substring(start, attr.nodeValue.length).split(/\s+/).reverse().join("");
                                json[attr.nodeName].push(str);
                                continue;
                            }
                            json[attr.nodeName].push(attr.nodeValue == "" ? 0 : attr.nodeValue);
                        }
                    }
                    else {
                        for (var j = 0, attr; attr = node.attributes[j]; j++) {
                            json[attr.nodeValue] = {};
                            if (j == 0) {
                                arguments.callee(node.childNodes, json[attr.nodeValue]);
                            }
                        }
                    }
                }
            }
        }
    }
    return {
        delSpecialStr: function (str) {
            return str.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").replace("&apos", "\'").replace("&quot", "\"")
        },
        clone: function (souce) {
            var target = {};
            if (Object.prototype.toString.call(souce).toLowerCase() == "[object array]") {
                target = [];
            }
            for (var i in souce) {
                if (typeof souce[i] == "object") {
                    target[i] = arguments.callee(souce[i]);
                }
                else {
                    target[i] = souce[i];
                }
            }
            return target;
        },
        getArray: function () {
            var results = { YearToData: { labs: [], values: [] }, Quarterly: { labs: [], values: [] } };
            if (arguments.length == 0) return results;
            var charttitle;
            var datasegment;
            if (arguments.length == 2) {
                charttitle = arguments[0];
                datasegment = arguments[1];
            }
            else if (arguments.length == 1 && Object.prototype.toString.call(arguments[0]).toLowerCase() == "[object array]") {
                charttitle = arguments[0][0];
                datasegment = arguments[0][1];
            }
            else {
                return results;
            }
            charttitle = this.delSpecialStr(charttitle);
            datasegment = this.delSpecialStr(datasegment);
            results = {};
            results["YearToData"] = {};
            results["YearToData"]["labs"] = json[charttitle][datasegment]["Annual"]["Valuetitle"];
            results["YearToData"]["values"] = json[charttitle][datasegment]["Annual"]["Value"];
            results["Quarterly"] = {};
            results["Quarterly"]["labs"] = json[charttitle][datasegment]["Quarterly"]["Valuetitle"];
            results["Quarterly"]["values"] = json[charttitle][datasegment]["Quarterly"]["Value"];
            return results;
        },
        bar: function (params) {
            var chartTitle = params.chartTitle;
            var segmentType = params.segmentType && params.segmentType.length > 0 ? params.segmentType[0] : "";
            var data = this.getArray(chartTitle, segmentType);
            return data;
        },
        epsbar: function (params) {
            return this.bar(params);
        },
        barversus: function (params) {
            var rdata = { YearToData: { labs: [], values: [] }, Quarterly: { labs: [], values: [] } }
            var data;
            var chartTitle = params.chartTitle;
            var segmentType = params.segmentType;
            for (var i = 0; i < segmentType.length; i++) {
                data = this.getArray([chartTitle, segmentType[i]]);
                rdata.Quarterly.labs.push(data.Quarterly.labs);
                rdata.Quarterly.values.push(data.Quarterly.values);
                rdata.YearToData.labs.push(data.YearToData.labs);
                rdata.YearToData.values.push(data.YearToData.values);
            }
            return rdata;
        },
        barsegment: function (params) {
            return this.barversus(params);
        },
        cash: function (params) {
            var rdata = { YearToData: { labs: [], values: [] }, Quarterly: { labs: [], values: [] } }
            var data;
            var chartTitle = params.chartTitle;
            var segmentType = params.segmentType;
            for (var i = 0; i < segmentType.length; i++) {
                data = this.getArray([chartTitle, segmentType[i]]);
                if (rdata.Quarterly.labs.length == 0) {
                    rdata.Quarterly.labs.push(data.Quarterly.labs);
                }
                if (rdata.YearToData.labs.length == 0) {
                    rdata.YearToData.labs.push(data.YearToData.labs);
                }
                rdata.Quarterly.values.push(data.Quarterly.values);

                rdata.YearToData.values.push(data.YearToData.values);
            }
            return rdata;
        },
        doughnut: function (params) {
            var rdata = { YearToData: { labs: [], values: [] }, Quarterly: { labs: [], values: [] } }
            var data;
            var chartTitle = params.chartTitle;
            var segmentType = params.segmentType;
            var qlabs = [];
            var qvalues = [[], []];
            var ylabs = [];
            var yvalues = [[], []];
            for (var i = 0; i < segmentType.length; i++) {
                var data = this.clone(this.getArray([chartTitle, segmentType[i]]));

                qlabs = data.Quarterly.labs.reverse();
                qvalues[0].push(data.Quarterly.values[1]);
                qvalues[1].push(data.Quarterly.values[0]);

                ylabs = data.YearToData.labs.reverse();
                yvalues[0].push(data.YearToData.values[1]);
                yvalues[1].push(data.YearToData.values[0]);
            }
            rdata.Quarterly.labs = qlabs;
            rdata.Quarterly.values = qvalues;
            rdata.YearToData.labs = ylabs;
            rdata.YearToData.values = yvalues;
            return rdata;
        }
    }
}

//IR.ChartType = { bar: "bar", epsbar: "epsbar", barsegment: "barsegment", barversus: "barversus", cash: "cash" };




/*******************************/


IR.ChartAdapter = function (params) {
    var loaders = {
        bar: function (sx, sy, w, h, scale) { return new IR.SingleColumn(sx, sy, w, h, scale); },
        epsbar: function (sx, sy, w, h, scale) { return new IR.SingleColumn(sx, sy, w, h, scale); },
        barsegment: function (sx, sy, w, h, scale) { return new IR.ClusteredColumn(sx, sy, w, h, scale); },
        barversus: function (sx, sy, w, h, scale) { return new IR.ClusteredArrowColumn(sx, sy, w, h, scale); },
        cash: function (sx, sy, w, h, scale) { return new IR.StackedColumnAndLine(sx, sy, w, h, scale); },
        doughnut: function (sx, sy, w, h, scale) { return new IR.Doughnut(sx, sy, w, h, scale); }
    }
    function extend(target, source) {
        for (var i in source) {
            target[i] = source[i];
        }
        return target;
    };
    var loader;
    var defaults = {
        charType: "bar",
        id: "canvas",
        sx: 0,
        sy: 0,
        width: 400,
        height: 320,
        precision: 2,
        scalePrecision: { left: 0, right: 2 },
        data: []
    }
    var settings = extend(defaults, params);
    return {
        create: function (params) {
            if (!loader) {
                loader = loaders[settings.charType](settings.sx, settings.sy, settings.width, settings.height);
            }
            loader.applyWrapper(settings.id, null, null);
            var data = settings.data;
            var qdata = data.Quarterly.values;
            var ydata = data.YearToData.values;
            var qlabs = data.Quarterly.labs;
            var ylabs = data.YearToData.labs;
            var qlrange, qrrange, ylrange = [], yrrange = [];
            var backcolors = ["#00B193", "#0072C5"];
            var lines = [0.15, 0.36, 0.57, 0.78];
            var qParams, yParams;

            if (settings.charType.toLowerCase() == "doughnut") {
                var qtmpdata = [];
                var qtmpunallocated = [];
                qdata.forEach(function (v, i) {
                    if (v.length < 2) return;

                    qtmpdata.push(v.slice(0, v.length - 1));
                    qtmpunallocated.push(v[v.length - 1]);
                })

                var ytmpdata = [];
                var ytmpunallocated = [];
                ydata.forEach(function (v, i) {
                    if (v.length < 2) return;

                    ytmpdata.push(v.slice(0, v.length - 1));
                    ytmpunallocated.push(v[v.length - 1]);
                })

                qParams = {
                    data: qtmpdata,
                    labitems: qlabs,
                    labcolor: "RGB(119,119,119)",
                    barcolor: ["#ff8c00", "#7fba00", "#68217a", "#0072c6", "#00b294"],
                    fontSize: 17,
                    barlink: [],
                    unallocated: qtmpunallocated
                }
                yParams = {
                    data: ytmpdata,
                    labitems: ylabs,
                    labcolor: "RGB(119,119,119)",
                    barcolor: ["#ff8c00", "#7fba00", "#68217a", "#0072c6", "#00b294"],
                    fontSize: 17,
                    barlink: [],
                    unallocated: ytmpunallocated
                }
            }
            else {

                switch (settings.charType.toLowerCase()) {
                    case "cash":
                        {
                            var tmparray = [];
                            for (var i = 0; i < qdata[0].length; i++) {
                                tmparray.push(parseFloat(qdata[0][i]) + parseFloat(qdata[1][i]));
                            }
                            qlrange = IR.Common.getLeftRange(tmparray);
                            qrrange = IR.Common.getRightRange(qdata[2]);
                            tmparray = [];
                            for (var i = 0; i < ydata[0].length; i++) {
                                tmparray.push(parseFloat(ydata[0][i]) + parseFloat(ydata[1][i]));
                            }
                            ylrange = IR.Common.getLeftRange(tmparray);
                            yrrange = IR.Common.getRightRange(ydata[2]);
                            backcolors = ["#0072C5", "#00B193", "RGB(255,216,0)"];
                            lines = [0.18, 0.34, 0.50, 0.66, 0.82];
                            break;
                        }
                    case "epsbar":
                        {
                            qlrange = IR.Common.getRange(qdata, true, 2);
                            ylrange = IR.Common.getRange(ydata, true, 2);
                            break;
                        }
                    default:
                        {
                            qlrange = IR.Common.getRange(qdata, false);
                            ylrange = IR.Common.getRange(ydata, false);
                            break;
                        }
                }

                qParams = {
                    lrange: qlrange,
                    rrange: qrrange,
                    labitems: qlabs,
                    data: qdata,
                    orginindex: 4,
                    barcolors: backcolors,
                    lines: lines,
                    linecolor: "rgb(235,235,235)",
                    labcolor: "rgb(119,119,119)"
                }
                yParams = {
                    lrange: ylrange,
                    rrange: yrrange,
                    labitems: ylabs,
                    data: ydata,
                    orginindex: 4,
                    barcolors: backcolors,
                    lines: lines,
                    linecolor: "rgb(235,235,235)",
                    labcolor: "rgb(119,119,119)"
                }
            }
            this.setALlPrecision(settings.precision, settings.scalePrecision);
            this.setQuarterly(qParams);
            this.setYearToDate(yParams);
            this.setLabTitleStyle({
                text: "RETURN",
                color: "black",
                fontsize: 13,
                family: "Segoe UI",
                weight: "bold",
                iscenter: null
            });
            this.setLabSubTitleStyle({
                text: "(In billions)",
                color: "rgb(142,142,142)",
                fontsize: 11,
                family: "Segoe UI",
                weight: undefined,
                iscenter: undefined
            });
            return this;
        }
        , setQuarterly: function (attributes) {
            if (settings.charType == "doughnut") {
                loader.setQuarterly(attributes);
            }
            else {
                loader.setQuarterlyAxis(attributes);
            }
        }
        , setYearToDate: function (attributes) {
            if (settings.charType == "doughnut") {
                loader.setYearToDate(attributes);
            }
            else {
                loader.setYearToDateAxis(attributes);
            }
        }
        , setLabTitleStyle: function (attributes) {
            loader.setLabTitleStyle(attributes);
        }
        , setLabSubTitleStyle: function (attributes) {
            loader.setLabSubTitleStyle(attributes);
        }
        , setALlPrecision: function (precision, scalePrecision) {
            if (precision != null)
                loader.setPrecision(precision);
            if (scalePrecision != null && typeof loader["setScalePrecision"] == "function") {
                loader.setScalePrecision(scalePrecision);
            }
        }
        , setGroupTitle: function (titles) {
            if (settings.charType == "doughnut") {
                loader.setTitles({ text: titles });
            }
            else {
                if (typeof loader["setGroupTitle"] == "function") {
                    loader.setGroupTitle(titles);
                }
            }
        }
        , getChartLoaderObj: function () {
            return loader;
        }
        , render: function (scale) {
            loader.registerZoom();
            loader.runConfig();
            loader.wrapper.startListener();
            loader.pureRender(scale);
        }
        , addMouseOverListener: function (func) {
            loader.addMouseOverListener(func);
        }
        , addMouseDownListener: function (func) {
            loader.addMouseDownListener(func);
        }
        , addMouseUpListener: function (func) {
            loader.addMouseUpListener(func);
        }
        , addMouseInListener: function (func) {
            loader.addMouseInListener(func);
        }
        , addMouseOutListener: function (func) {
            loader.addMouseOutListener(func);
        }
        , addRootElementTouchStartToggle: function (func1, func2) {
            loader.addRootElementTouchStartToggle(func1, func2);
        }
        , zoomInOutCallBack: function (scale, fps, duration, callback, args) {
            loader.zoomInOutCallBack(scale, fps, duration, callback, args);
        }
        , setCanvasStyle: function (atrributeName, atrributeValue) {
            loader.setCanvasStyle(atrributeName, atrributeValue);
        }
        , pinToggle: function (checkedFunc, noCheckedFunc) {
            loader.pinToggle(checkedFunc, noCheckedFunc);
        }
        , getCanvas: function () {
            return loader.getCanvas();
        }
        , setMouseOrTouchFlag: function (mouseFlag, TouchFlag) {
            loader.setMouseOrTouchFlag(mouseFlag, TouchFlag);
        }
        , setInitTab: function (flag) {
            loader.initTab(flag);
        }
        , setChartZoom: function (flag) {
            loader.chartIsZoomOut = flag;
        }

    }
}

IR.ChartView = function (params) {
    var defaults = {
        chartType: "bar",
        renderTo: "canvas",
        data: { chartTitle: "Operating Income (Loss)", segmentType: ["Revenue"] },
        title: "",
        subTitle: "",
        precision: 2,
        scalePrecision: { left: -1, right: -1 },
        sx: 0,
        sy: 0,
        width: 400,
        height: 320,
        scale: 179 / 400,
        xmlFile: "ChartDatas.xml",
        //backcolors: ["#00B193", "#0072C5"],
        linecolor: "rgb(230,230,230)",
        labcolor: "rgb(119,119,119)",
        barLinks: [],
        groupTitles: [],
        initTab: undefined
    }
    function extend(target, source) {
        for (var i in source) {
            target[i] = source[i];
        }
        return target;
    }

    var settings = extend(defaults, params);
    window.dataModel = window.dataModel || IR.DataModel(settings.xmlFile);
    var data = dataModel[settings.chartType](settings.data);
    var qdata = data.Quarterly.values;
    var ydata = data.YearToData.values;
    var title = settings.title;
    var canvasId = settings.renderTo;
    var lossArray = [];
    function loss(array) {
        if (Object.prototype.toString.call(array).toLowerCase() == "[object array]") {
            for (var i = 0; i < array.length; i++) {
                arguments.callee(array[i]);
            }
        }
        else {
            var tmp = array <= 0 ? 0 : 1;
            lossArray.push(tmp);
        }
    }
    loss([qdata, ydata]);
    var sum = lossArray.reduce(function (pv, cv, ci) {
        return pv + cv;
    }, 0);
    if (sum == 0) {
        title = title.replace(/income/i, "").replace(/\(|\)/g, "");
    }
    else if (sum == lossArray.length) {
        title = title.replace(/\(loss\)/i, "");
    }
    else {
        title = title;
    }
    var chartHandler = IR.ChartAdapter({
        charType: settings.chartType,
        id: canvasId,
        sx: settings.sx,
        sy: settings.sy,
        width: settings.width,
        height: settings.height,
        precision: settings.precision,
        scalePrecision: settings.scalePrecision,
        data: data,
    });
    var loader = chartHandler.create();
    loader.setInitTab(settings.initTab);
    if (typeof loader["setGroupTitle"] == "function") {
        if (Object.prototype.toString.call(settings.groupTitles).toLowerCase() == "[object array]" && settings.groupTitles.length > 0) {
            loader.setGroupTitle(settings.groupTitles);
        }
        else {

            loader.setGroupTitle(settings.data.segmentType);
        }
    }

    loader.setLabTitleStyle({
        text: title
    });
    loader.setLabSubTitleStyle({ text: settings.subTitle });

    var pName = location.pathname;
    // var reg = pName.substring(pName.lastIndexOf("/") + 1);
    function compareUrl(localUrl, paramUrl) {
        var regStr = /\/fy\d+\/q\d\/\S+/i;
        var lIndex = localUrl.search(regStr);
        if (lIndex == -1) return false;
        var pIndex = paramUrl.search(regStr);
        if (pIndex == -1) return false;
        return localUrl.substring(lIndex).toLowerCase() == paramUrl.substring(pIndex).toLowerCase();

    }
    var url = location.pathname;
    settings.barLinks.forEach(function (v, i, a) {
        if (compareUrl(url, v)) {
            a[i] = "";
        }
    })


    loader.setYearToDate({
        linecolor: settings.linecolor,
        labcolor: settings.labcolor,
        barlink: settings.barLinks,


    });
    loader.setQuarterly({
        linecolor: settings.linecolor,
        labcolor: settings.labcolor,
        barlink: settings.barLinks
    });


    loader.setChartZoom(false);
    loader.render(settings.scale);
    loader.setMouseOrTouchFlag(false, false);
    var lasted;
    var isMouseOut = false, isTouchEnd = false;
    var isMouseOver = false, isTouchStart = false;
    var isOut = false;
    var isDock = false;
    var touchCount = false;
    var mouseOutIsFinish = true;
    loader.addMouseOverListener(mouseoverListener);
    loader.addMouseOutListener(mouseoutListener);
    loader.addRootElementTouchStartToggle(touchZoomOutListener, touchZoomInListener);
    loader.pinToggle(function () {
        isDock = true;
        isMouseOut = true;
        isMouseOver = true;
        isTouchEnd = true;
        isTouchStart = true;
    }, function () {
        isDock = false;
    });
    function mouseoutListener(obj) {
        if (isDock) {
            var that = loader.getCanvas();
            for (var i = 0, ci; ci = document.getElementsByTagName("canvas")[i]; i++) {
                if (ci == that) {
                    ci.style.zIndex = i + 9 + 1;
                }
            }
        }
        else {
            lasted = new Date().getTime();
            isMouseOut = true;
            isMouseOver = false;
            var mouseOutListener = setInterval(function () {
                mouseOutIsFinish = false;
                var tmptime = new Date().getTime();
                if (tmptime - lasted > 500) {
                    clearInterval(mouseOutListener);
                    mouseOutIsFinish = true;
                }
                if (!isMouseOver) {
                    loader.zoomInOutCallBack(settings.scale, 5, 3, function () {
                        loader.setMouseOrTouchFlag(false, false);
                        loader.setChartZoom(false);
                        loader.setCanvasStyle("zIndex", 9);

                    });
                }

            }, 1);
        }
    }


    function mouseoverListener(obj) {
        if (isDock) {
            loader.setCanvasStyle("zIndex", 9999);
        }
        else {
            lasted = new Date().getTime();
            isMouseOut = false;
            isMouseOver = true;
            var mouseOverlistener = setInterval(function () {
                if (!isMouseOut) {
                    if (new Date().getTime() - lasted > 5) {
                        loader.zoomInOutCallBack(1, 5, 3, function () {
                            loader.setMouseOrTouchFlag(true, true);
                            loader.setChartZoom(true);
                            clearInterval(mouseOverlistener);
                        });
                        loader.setCanvasStyle("zIndex", 9999);

                    }
                }
                else {
                    clearInterval(mouseOverlistener);
                }
            }, 1);
        }
    }
    function touchZoomOutListener(obj) {
        if (!mouseOutIsFinish) return;

        lasted = new Date().getTime();
        isTouchEnd = false;
        isTouchStart = true;
        var touchstartlistener = setInterval(function () {
            if (!isTouchEnd) {
                if (new Date().getTime() - lasted > 5) {
                    loader.zoomInOutCallBack(1, 5, 3, function () {
                        loader.setMouseOrTouchFlag(true, true);
                        loader.setChartZoom(true);
                        clearInterval(touchstartlistener);
                    });
                    var that = loader.getCanvas();
                    for (var i = 0, ci; ci = document.getElementsByTagName("canvas")[i]; i++) {
                        if (ci == that) {
                            ci.style.zIndex = i + 9999;
                        }



                    }
                }
            }
            else {
                clearInterval(touchstartlistener);
            }
        }, 1);
    }

    function touchZoomInListener(obj) {

        lasted = new Date().getTime();
        isTouchEnd = true;
        isTouchStart = false;
        var mouseOutListener = setInterval(function () {
            mouseOutIsFinish = false;
            var tmptime = new Date().getTime();
            if (tmptime - lasted > 500) {
                clearInterval(mouseOutListener);
                mouseOutIsFinish = true;
            }
            if (!isTouchStart) {
                loader.zoomInOutCallBack(settings.scale, 5, 3, function () {
                    loader.setMouseOrTouchFlag(false, false);
                    loader.setChartZoom(false);
                    loader.setCanvasStyle("zIndex", 9);

                });
            }

        }, 1);
    }


}





