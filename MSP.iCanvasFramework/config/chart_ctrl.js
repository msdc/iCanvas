/// <reference path="../JScript/chart.framework-1.1.js" />


var trendedCtrls = function (txtCtrl, lines) {
    var txtCtrllor = txtCtrl;
    var charLines = lines;
    var slider = undefined;
    return {
        applyAxisContrl: function (left, right, lineColor, wrapper) {
            if (!wrapper) { throw "chart wrapper not ready" };
            var _chartWrapper = wrapper;
            var _base = _chartWrapper.getBaseCtrlObj();
            var _baseType = _base.constructor;
            var that = this;
            var chartAxis = function (wrapper, x, y, w, h) {
                _baseType.apply(this, arguments);
                this.lineCount = 6;
                this.lines = [0.12, 0.28, 0.44, 0.60, 0.76, 0.92];
                this.lineWidth = 1;
                this.lineColor = lineColor ? lineColor : "black";
                this.linePositions = [];
                this.addRenderHandler(function () {
                    this.wrapper.save();
                    this.wrapper.translate(this.sx, this.sy);
                    this.wrapper.drawStaticLine(0, 0, this.w, 0, 2, "rgb(236,236,236)");
                    //draw lines, only after the scale has been calculated
                    for (var i = 0, ci; ci = this.linePositions[i]; i++) {
                        this.wrapper.drawStaticLine(0, ci, this.w, 0, this.lineWidth, this.lineColor);
                    }

                    this.wrapper.drawStaticLine(0, this.h + 2, this.w, 0, 2, "rgb(236,236,236)");

                    this.wrapper.restore();
                });
            }
            inheritPrototype(chartAxis, _baseType);

            function calculateAxisLab(array) {
                var scale = 0;

                var curveMinValue = 0;
                var curveMaxValue = 0;
                var graduationCount = 5;
                var curveMaxLimit = 0;
                var zeroY = 0;
                function prepareDate(array) {
                    var max = Math.max.apply(null, array);
                    var min = Math.min.apply(null, array);
                    var tmpMaxValue = 0;
                    var tmpBaseValue = 0;
                    min = min > 0 ? 0 : min;
                    max = max < 0 ? 0 : max;

                    curveMinValue = min;
                    curveMaxValue = max;

                    tempMaxValue = curveMaxValue - curveMinValue;

                    var separateValue = div(tempMaxValue, graduationCount);

                    if (curveMinValue < 0) {
                        var count = Math.ceil(div(Math.abs(curveMinValue), separateValue));

                        if (count == 0) {
                            tempBaseValue = separateValue;
                        }
                        else {
                            tempBaseValue = mul(separateValue, count);
                        }

                        tempMaxValue = add(curveMaxValue, tempBaseValue);
                    }

                    curveWeight = getWeight(tempMaxValue);

                    var mod = dcmYu(tempMaxValue, curveWeight);

                    if (mod > 0) {
                        if (mod <= div(curveWeight, 2)) {
                            curveMaxLimit = add(sub(tempMaxValue, mod), div(curveWeight, 2));
                        }
                        else {
                            curveMaxLimit = add(sub(tempMaxValue, mod), curveWeight);
                        }
                    }
                    else {
                        curveMaxLimit = tempMaxValue;
                    }
                    if (curveMinValue < 0) {
                        separateValue = div(curveMaxLimit, graduationCount);
                        var separateCount = Math.ceil(div(Math.abs((curveMinValue)), separateValue));
                        baseValue = mul(separateValue, separateCount);
                    }
                    else {
                        baseValue = 0;
                    }
                }

                function generateGraduation() {
                    var iBegin = 0;
                    var iEnd = 0;
                    var separate = div(curveMaxLimit, graduationCount);
                    if (separate == 0) {
                        iBegin = 0;
                        iEnd = 1;
                    }
                    else {
                        iBegin = Math.ceil(div(Math.abs((curveMinValue)), separate));
                        iEnd = Math.ceil(div(Math.abs(curveMaxLimit), separate));

                        if (iBegin != 0) {
                            iBegin = -iBegin;
                        }
                        if (iBegin < 0) {
                            iEnd = iEnd + iBegin;
                        }
                    }

                    var txtMarks = [];
                    var count = 0;
                    var zeroY = 0;
                    var marks = [];
                    for (var i = iBegin; i <= iEnd; i++) {

                        if (mul(separate, i) == 0) {
                            zeroY = graduationCount - count;
                        }
                        count++
                        marks.push(mul(separate, i));
                        //txtMarks.push(((separate * i) / 1000).toFixed(2));
                    }

                    return { valmarks: marks.reverse(), txtMarks: txtMarks.reverse(), zeroY: zeroY, separate: separate }

                }
                function getWeight(maxValue) {
                    var weight = 1;

                    if (maxValue == 0) {
                        return 1;
                    }
                    else if (maxValue < 1) {
                        do {
                            weight = div(weight, 10);
                        }
                        while ((maxValue = mul(maxValue, 10)) < 1);
                        return weight;
                    }
                    else {
                        while ((maxValue = div(maxValue, 10)) >= 1) {
                            weight = mul(weight, 10);
                        }
                        return weight;
                    }
                }


                prepareDate(array);

                return generateGraduation();


            }
            //chartAxis.prototype.calculateAxis = function (maxVal, zeroLine) {
            //    this.linePositions = [];
            //    for (var i = 0, ci; ci = this.lines[i]; i++) {
            //        var _y = Math.round(this.h * ci) + 0.5;
            //        this.linePositions.push(_y);
            //    }
            //    var _max = maxVal;
            //    var _0Line = zeroLine ? zeroLine : this.lineCount;
            //    //from line 1 to line n, there are n-1 solts
            //    var _solts = _0Line - 1;
            //    if (_solts <= 0) { throw "invalid solt value" };
            //    var _stepValue = _max / _solts;
            //    var _0LineIndex = _0Line - 1;
            //    var _unit = this.h * (this.lines[_0LineIndex] - this.lines[0]) / _max;
            //    var _zeroY = this.linePositions[_0LineIndex] + this.sy;
            //    var _labs = [];
            //    for (var i = 0; i < this.lineCount; i++) {
            //        var _val = (i == _0LineIndex) ? 0 : _max - _stepValue * i;
            //        _labs.push(_val)
            //    }
            //    return { labs: _labs, unit: _unit, zeroY: _zeroY };

            //}

            chartAxis.prototype.calculateAxis = function (array) {
                this.linePositions = [];
                for (var i = 0, ci; ci = this.lines[i]; i++) {
                    var _y = Math.round(this.h * ci) + 0.5;
                    this.linePositions.push(_y);
                }

                var axisJson = calculateAxisLab(array, 2);
                var _max = Math.max.apply(null, axisJson.valmarks);
                var _0Line = axisJson.zeroY ? axisJson.zeroY : this.lineCount;
                //from line 1 to line n, there are n-1 solts
                var _solts = _0Line - 1;
                if (_solts <= 0) { throw "invalid solt value" };
                var _stepValue = axisJson.separate;
                var _0LineIndex = _0Line - 1;

                var _unit = this.h * (this.lines[_0Line] - this.lines[0]) / _max;
                var _zeroY = this.linePositions[_0Line] + this.sy;

                return { labs: axisJson.valmarks, unit: _unit, zeroY: _zeroY };
            }


            //chartAxis.prototype.applyScales = function (leftScale, rightScale) {
            //    //leftScale=[0.76, 5] 
            //    //stands for the max value of left scale is 0.76 and the 0 line is the 5th one.
            //    if (leftScale && leftScale instanceof Array) {
            //        var _scale = this.calculateAxis(leftScale[0], leftScale[1]);
            //        _scale.side = "left";
            //        this.leftScale = _scale;
            //    }
            //    if (rightScale && rightScale instanceof Array) {
            //        var _scale = this.calculateAxis(rightScale[0], rightScale[1]);
            //        _scale.side = "right";
            //        this.rightScale = _scale;
            //    }
            //}


            chartAxis.prototype.applyScales = function (leftScale, rightScale) {
                //leftScale=[0.76, 5] 
                //stands for the max value of left scale is 0.76 and the 0 line is the 5th one.
                if (leftScale && leftScale instanceof Array) {
                    var _scale = this.calculateAxis(leftScale);
                    _scale.side = "left";
                    this.leftScale = _scale;
                }
                if (rightScale && rightScale instanceof Array) {
                    var _scale = this.calculateAxis(rightScale);
                    _scale.side = "right";
                    this.rightScale = _scale;
                }
            }



            chartAxis.prototype.getOrigin = function (side) {
                return { x: this.sx, y: side == "left" ? this.leftScale.zeroY : this.rightScale.zeroY };
            }

            _chartWrapper.addChartAxis = function (x, y, w, h, parentCtrl) {
                var _axis = new chartAxis(this, x, y, w, h);
                _axis.applyScales(left, right);
                _axis.setParent(parentCtrl);
                this.ctrlList.push(_axis);
                return _axis;
            }
            return this;
        }
        , applyAxisLabs: function (wrapper) {
            if (!wrapper) { throw "chart wrapper not ready" };
            var _chartWrapper = wrapper;
            var _base = _chartWrapper.getBaseCtrlObj();
            var _baseType = _base.constructor;
            var that = this;

            var chartLab = function (wrapper, x, y, w, h, pty, shadowSide) {
                _baseType.call(this, wrapper, x, y, w, h);
                this.txtHCenter = Math.round(this.w / 2);
                this.txtList = [];
                this.hover = false;
                this.pty = pty ? pty : txtCtrllor.createTxtProperty();
                this.pty.applyWeight("bold");
                this.pty.applyFontSize(this.pty.size + 1);
                this.setZIndex(20);
                this.addRenderHandler(function () {
                    this.wrapper.save();
                    this.wrapper.translate(this.sx, this.sy);
                    this.wrapper.save();
                    var _c = this.wrapper.ctx;
                    _c.shadowOffsetX = shadowSide ? -1 : 1;
                    _c.shadowOffsetY = 0;
                    _c.shadowColor = this.hover ? 'rgba(100,100,100,0.7)' : 'rgba(100,100,100,0.2)';
                    _c.shadowBlur = this.hover ? 8 : 2;
                    this.wrapper.drawRect(0, 0, this.w, this.h, "white");
                    this.wrapper.restore();
                    for (var i = 0, ci; ci = this.txtList[i]; i++) {
                        txtCtrllor.write(_c, this.txtHCenter, ci.y, ci.txt, this.pty, "middle", "center");
                    }
                    this.wrapper.restore();
                });
            }
            inheritPrototype(chartLab, _baseType);

            chartLab.prototype.appendTxt = function (y, txt) {
                if (y == undefined || txt == undefined) {
                    throw "invalid parameters";
                }
                this.txtList.push({ y: Math.floor(y) - 0.5, txt: txt });
            }

            chartLab.prototype.resetTxtList = function () {
                this.txtList = [];
            }

            _chartWrapper.addAxisLab = function (x, y, w, h, parentCtrl, shadowSide, pty) {
                var _axisLab = new chartLab(this, x, y, w, h, pty, shadowSide);
                _axisLab.setParent(parentCtrl);
                this.ctrlList.push(_axisLab);
                return _axisLab;
            }
            return this;
        }
        , applyPointAndLine: function (wrapper) {
            if (!wrapper) { throw "chart wrapper not ready" };
            var _chartWrapper = wrapper;
            var _base = _chartWrapper.getBaseCtrlObj();
            var _baseType = _base.constructor;
            var that = this;
            //new point
            var chartPoint = function (wrapper, x, y, w, h, text, color) {
                _baseType.apply(this, arguments);
                this.backColor = color;
                this.r = this.or = Math.max(this.w, this.h);
                this.cx = this.sx;
                this.cy = this.sy;
                var that = this;
                this.renderFlag = false;
                this.zIndex = 7;
                this.parentLine;
                this.sx = function () { return that.cx - that.r * 1.3; };
                this.sy = function () { return that.cy - 10 - that.r * 1.3; };
                this.ex = function () { return that.cx + that.r * 1.3; };
                this.ey = function () { return that.cy + that.r * 1.3; };
                this.acy = this.cy;
                this.addRenderHandler(function () {
                    if (this.renderFlag) {
                        this.wrapper.drawArc(this.cx, this.acy - ((this.parentLine && this.parentLine.hover) ? 5 : 0), this.r, this.backColor);
                    }
                });
            }
            inheritPrototype(chartPoint, _baseType);

            chartPoint.prototype.applyR = function (value) {
                this.r = value;
            }
            chartPoint.prototype.resetR = function (value) {
                this.r = this.or;
            }

            var chartLine = function (wrapper, pointlist, color, r) {
                _baseType.call(this, 0, 0, 0, 0);
                var _pointList = pointlist ? pointlist : [];
                this.wrapper = wrapper;
                this.points = [];
                this.backColor = color;
                this.renderReady = true;
                this.zIndex = this.originalZ = 1;
                this.renderChildren = true;
                this.hover = false;
                this.axisScale;
                this.hoverHandler = new evtWrapper(this);
                this.unHoverHandler = new evtWrapper(this);
                this.animationHandler = new evtWrapper(this);
                for (var i = 0, ci, ci1; ci1 = _pointList[i - 1], ci = _pointList[i]; i++) {
                    var _txt = ci[2] != undefined ? ci[2] : "";
                    var _p = wrapper.addChartPoint(ci[0], ci[1], r, _txt, color);
                    _p.setRenderFlag(false);
                    _p.id = i;
                    _p.parentLine = this;
                    this.points.push(_p);
                }
                this.lineWidth = r * 0.7;
                this.pointR = r;
                this.currentX = 0;

            }

            inheritPrototype(chartLine, _baseType);
            chartLine.prototype.setCurrentX = function () {
                this.currentX = this.points[0].cx;
            }
            chartLine.prototype.setHoverPoints = function () {
                var _upArray = [];
                var _downArray = [];
                //added a flag to deal with the first point has not been calculated in hovering due to the point width
                var _flag = true;

                for (var i = 0, ci; ci = this.points[i]; i++) {
                    if (!ci.renderReady) { continue; };
                    if (_flag) {
                        _flag = false;
                        _upArray.push({ x: ci.cx + this.ox + this.pointR + 5, y: ci.cy - this.pointR * 1.5 + this.oy - 15 });
                        _downArray.unshift({ x: ci.cx + this.ox + this.pointR + 5, y: ci.cy + this.pointR * 1.5 + this.oy + 2 });
                    }
                    _upArray.push({ x: ci.cx + this.ox, y: ci.cy - this.pointR * 1.5 + this.oy - 15 });
                    _downArray.unshift({ x: ci.cx + this.ox, y: ci.cy + this.pointR * 1.5 + this.oy + 2 });
                }
                this.isInArray = _upArray.concat(_downArray);
            }
            chartLine.prototype.createEquations = function () {
                //if (!this.equations) {

                this.equations = [];
                function getLineEquation(a1, b1, a2, b2) {
                    return function (x) {
                        var k = (b2 - b1) / (a2 - a1);
                        return k * x + b1 - k * a1;
                    }
                }
                for (var i = this.points.length - 1, ci; ci = this.points[i]; i--) {
                    if (!ci.renderReady) { continue; }
                    if (ci.cx > this.maxCx) {
                        this.maxCx = ci.cx;
                    }
                    if (this.points[i - 1] && this.points[i - 1].renderReady) {
                        var _start = ci;
                        var _end = this.points[i - 1];
                        var y = getLineEquation(_start.cx, _start.cy, _end.cx, _end.cy);
                        var j = { fn: y, startPoint: _start, endPoint: _end };
                        this.equations.push(j);
                    }

                }
                //}
            }
            chartLine.prototype.isHovered = function (cord) {
                if (this.isInArray == undefined) {
                    return false;
                }
                this.wrapper.save();
                var _c = this.wrapper.ctx;
                _c.beginPath();

                for (var i = 0, ci; ci = this.isInArray[i]; i++) {
                    if (i == 0) {
                        _c.moveTo(ci.x, ci.y);
                    }
                    else {
                        _c.lineTo(ci.x, ci.y);

                    }
                }
                _c.closePath();
                var _is = _c.isPointInPath(cord.x, cord.y);
                this.wrapper.restore();
                return _is;
            }

            chartLine.prototype.Hover = function () {
                this.hover = true;
                var _that = this;
                charLines.each(function () {
                    var _tempLine = this.line;
                    if (_tempLine.renderReady) {
                        if (_tempLine != _that) {
                            _tempLine.inHover = false;
                        }
                        else {
                            _tempLine.inHover = true;
                        }
                    }
                    else {
                        _tempLine.inHover = false;
                    }
                });
                this.changeZIndex(9);
                this.hovering();
            }

            chartLine.prototype.UnHover = function () {
                this.hover = false;
                this.resetZIndex();
                this.resetR();
                this.unhovering();
            }

            chartLine.prototype.applyHoverHandler = function (func) {
                this.hoverHandler.attach(func);
            }

            chartLine.prototype.hovering = function () {
                this.hoverHandler.notify();
            }

            chartLine.prototype.applyUnHoverHandler = function (func) {
                this.unHoverHandler.attach(func);
            }

            chartLine.prototype.unhovering = function () {
                this.unHoverHandler.notify();
            }

            chartLine.prototype.render = function (hover) {

                this.createEquations();

                if (this.isCompleted) {
                    this.currentX = this.points[0].cx;
                }
                var count = 0;
                function drawLineByEquations(obj) {
                    var currentX = obj.currentX;
                    var _start, _end;
                    for (var i = 0, ci; ci = obj.equations[i]; i++) {
                        _start = obj.equations[i].startPoint;
                        _end = obj.equations[i].endPoint;
                        if (currentX < ci.startPoint.cx) {
                            break;
                        }
                        if (currentX >= obj.equations[obj.equations.length - 1].endPoint.cx) {
                            obj.isCompleted = true;
                        }
                        if (currentX >= ci.startPoint.cx && currentX < ci.endPoint.cx) {
                            obj.wrapper.drawLine(_start.cx, _start.cy - (obj.hover ? 5 : 0), currentX, ci.fn(currentX) - (obj.hover ? 5 : 0), obj.lineWidth, obj.backColor);

                        }
                        else {
                            obj.wrapper.drawLine(_start.cx, _start.cy - (obj.hover ? 5 : 0), _end.cx, _end.cy - (obj.hover ? 5 : 0), obj.lineWidth, obj.backColor);

                        }
                    }
                }
                this.wrapper.save();
                var _c = this.wrapper.ctx;
                _c.shadowOffsetX = 3;

                _c.shadowOffsetY = this.hover ? 14 : 3;
                _c.shadowColor = 'rgba(100,100,100,0.5)';
                _c.shadowBlur = 5;
                if (this.ox != undefined && this.oy != undefined) {
                    this.wrapper.save();
                    this.wrapper.translate(this.ox, this.oy);
                }
                if (this.equations.length > 0) {
                    drawLineByEquations(this);
                }
                if (this.ox != undefined && this.oy != undefined) {
                    this.wrapper.restore();
                }
                if (this.isCompleted) {
                    for (var i = this.points.length - 1, ci; ci = this.points[i]; i--) {
                        if (!ci.renderReady) { continue; }
                        ci.render();
                    }
                }
                this.wrapper.restore();
            }

            chartLine.prototype.setAnimationParam = function (fps, duration) {
                this.fps = fps || 24;
                this.duration = duration || 0.5;
                this.frames = this.duration * this.fps;
                this.delay = 1000 / this.fps;
                this.increment = (this.points[0].cx - this.points[this.points.length - 1].cx) / this.frames;

            }

            chartLine.prototype.animationCompletedHandler = function (func) {
                this.animationHandler.attach(func);
            }
            chartLine.prototype.animationCompleted = function () {
                this.animationHandler.notify.apply(this, arguments);
            }


            chartLine.prototype.setAbsolute = function (flag) {
                this.absolute = flag
                for (var i = 0, ci; ci = this.points[i]; i++) {
                    ci.absolute = flag;
                }
            }

            chartLine.prototype.setR = function (value) {
                this.lineWidth = value * 0.7;
                if (!this.points || this.points.length == 0) { return; };
                for (var i = 0, ci; ci = this.points[i]; i++) {
                    ci.r = value;
                }
            }

            chartLine.prototype.resetR = function () {
                if (!this.points || this.points.length == 0) { return; };
                for (var i = 0, ci; ci = this.points[i]; i++) {
                    ci.resetR();
                }
            }

            chartLine.prototype.setZIndex = function (value) {
                this.zIndex = this.originalZ = value;
            }

            chartLine.prototype.changeZIndex = function (value) {
                this.zIndex = value;
            }

            chartLine.prototype.resetZIndex = function () {
                this.hover = false;
                this.zIndex = this.originalZ;
            }

            chartLine.prototype.isReseted = function () {
                return this.zIndex == this.originalZ;
            }

            chartLine.prototype.setOriginPoint = function (x, y) {
                _base.setOriginPoint.apply(this, arguments);
                for (var i = 0, ci; ci = this.points[i]; i++) {
                    ci.setOriginPoint(x, y);
                }
            }

            chartLine.prototype.setRenderFlagWithPoints = function (flag) {
                this.setRenderFlag(flag);
                for (var i = 0, ci; ci = this.points[i]; i++) {
                    ci.setRenderFlag(flag);
                }
            }

            chartLine.prototype.setRenderFlag = function (flag) {
                _base.setRenderFlag.call(this, flag);
            }

            chartLine.prototype.setParent = function (ctrl) {
                _base.setParent.call(this, ctrl);
                for (var i = 0, ci; ci = this.points[i]; i++) {
                    ci.setParent(ctrl);
                }
            }

            _chartWrapper.addChartPoint = function (x, y, r, text, color, parentCtrl) {
                var _point = new chartPoint(this, x, y, r, r, text, color);
                _point.setParent(parentCtrl);
                this.ctrlList.push(_point);
                return _point;
            }
            _chartWrapper.addChartLine = function (pointlist, color, r, parentCtrl) {
                var _line = new chartLine(this, pointlist, color, r);
                _line.setParent(parentCtrl);
                this.ctrlList.push(_line);
                return _line;
            }

            var _handler = _chartWrapper.isInCtrl;
            _chartWrapper.isInCtrl = function (cord, ctrl) {
                if (ctrl instanceof chartLine) {
                    var _self = ctrl.isHovered(cord);
                    if (_self) {
                        return ctrl.inHover ? true : charLines.each(function () {
                            var _tempLine = this.line;
                            if (_tempLine != ctrl && (_tempLine.inHover || _tempLine.zIndex > ctrl.zIndex) && _tempLine.renderReady) {
                                var _checker = _tempLine.isHovered(cord);
                                if (_checker) { return false }
                            }
                        });
                    }
                    return false;
                }
                else if (ctrl instanceof chartPoint) {
                    if (!ctrl.parentLine.hover) {
                        return false;
                    }
                    return _handler.apply(this, arguments);
                }
                else {
                    return _handler.apply(this, arguments);
                }
            }
            return this;
        }
        , applyChk: function (wrapper) {
            if (!wrapper) { throw "chart wrapper not ready" };
            var _chkWrapper = wrapper;
            var _base = _chkWrapper.getBaseCtrlObj();
            var _baseType = _base.constructor;
            var that = this;
            var chartChk = function (wrapper, x, y, w, h, text, color, flag) {
                _baseType.apply(this, arguments);
                this.checked = flag ? flag : true;
                this.backColor = "white";
                this.boxColor = color ? color : "gray";
                this.boxWRatio = 0.8;
                this.boxW = this.boxWRatio * this.h;
                this.clearRange;
                this.boxLen = function () { return this.boxW + 5 };
                this.textLength = 0;
                this.family = "'Segoe UI', Tahoma, Arial, Verdana, sans-serif";
                this.txtStorage = [];
                this.text = text;
                this.hover = false;

                this.len = function () {
                    return this.w;
                }
                this.ex = function () {
                    return this.sx + this.len();
                }

                this.addRenderHandler(function () {
                    this.textLength = 0;
                    //draw clear area
                    if (this.clearRange) {
                        this.wrapper.drawRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h, this.backColor);
                        this.clearRange = undefined;
                    }

                    if (this.hover) {
                        this.wrapper.save();
                        var _c = this.wrapper.ctx;
                        _c.shadowOffsetX = 1;
                        _c.shadowOffsetY = 2;
                        _c.shadowColor = 'rgba(100,100,100,0.5)';
                        _c.shadowBlur = 4;
                        this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.backColor);
                        this.wrapper.restore();
                    }

                    //draw checkbox
                    var _x = this.sx + 5;
                    var _y = this.sy + ((1 - this.boxWRatio) / 2) * this.h + 0.5;
                    var _w = _h = Math.round(this.boxW);
                    this.wrapper.drawRect(_x, _y, _w, _h, this.boxColor);
                    if (this.checked) {
                        this.wrapper.drawRect(_x + 0.3 * _w, _y + 0.3 * _h, _w * 0.4, _h * 0.4, "white");
                    }

                    //draw text
                    var _txtLines = that.processTxt(this.text);
                    var _txtSx = _x + this.boxLen();
                    var _txtSy = this.sy + this.h / 2 + 0.5;
                    var _pty = txtCtrllor.createTxtProperty();
                    if (_txtLines.length == 1) {
                        txtCtrllor.write(this.wrapper.ctx, _txtSx, _txtSy, _txtLines[0], _pty);
                    }
                    else {
                        txtCtrllor.write(this.wrapper.ctx, _txtSx, _txtSy, _txtLines[0], _pty, "bottom");
                        txtCtrllor.write(this.wrapper.ctx, _txtSx, _txtSy, _txtLines[1], _pty, "hanging");
                    }
                });

                this.onclick(function () {
                    //this.checked = !this.checked;
                    //this.clear();
                    //this.render();
                });
            }
            inheritPrototype(chartChk, _baseType);

            chartChk.prototype.clear = function () {
                if (this.ox != undefined && this.oy != undefined) {
                    this.wrapper.save();
                    this.wrapper.translate(this.ox, this.oy);
                }
                this.clearRange = {
                    x: this.sx - 1
                    , y: this.sy - 3
                    , w: this.len() + 7
                    , h: this.h + 10
                }
                this.wrapper.clearRect(this.clearRange.x, this.clearRange.y, this.clearRange.w, this.clearRange.h);
                if (this.ox != undefined && this.oy != undefined) {
                    this.wrapper.restore();
                }
            }

            _chkWrapper.addChk = function (x, y, w, h, text, color, parentCtrl) {
                var _check = new chartChk(this, x, y, w, h, text, color);
                _check.setParent(parentCtrl);
                this.ctrlList.push(_check);
                return _check;
            }

            return this;
        }
        , applySpan: function (wrapper) {
            if (!wrapper) { throw "chart wrapper not ready" };
            var _chartWrapper = wrapper;
            var _baseCtrl = _chartWrapper.getBaseCtrlObj();
            var _baseType = _baseCtrl.constructor;
            var spanCtrl = function (wrapper, x, y, w, h, text) {
                _baseType.apply(this, arguments);
                this.w = w;
                this.h = h;
                this.lineColor = "red";
                this.backColor = "white";
                this.fontColor = "black";
                this.fontSize = this.h * 4 / 5;
                var that = this;
                this.ex = function () { return that.sx + that.captionW() + this.h; };
                this.ey = function () { return that.sy + this.h; };
                this.leftCenter = function () { return { x: that.sx + that.h / 2, y: that.sy + that.h / 2 }; };
                this.rectArea = function () { return { x: that.sx + that.h / 2, y: that.sy }; };
                this.rightCenter = function () { return { x: that.sx + that.h / 2 + that.captionW(), y: that.sy + that.h / 2 }; };
                this.captionW = function () { return wrapper.messureText("bold", that.fontSize, "Segoe UI", that.caption).width };

                this.addRenderHandler(function () {
                    this.wrapper.drawStrokeRect(this.rectArea().x, this.rectArea().y, that.captionW(), this.h, 2, this.lineColor);
                    this.wrapper.drawRect(this.rectArea().x, this.rectArea().y, that.captionW(), this.h, this.backColor);
                    this.wrapper.drawArcNoCloseStroke(this.leftCenter().x, this.leftCenter().y, this.h / 2, 2, this.lineColor, -1 / 4, 1 / 4, true)
                    //cx, cy, r, lineWidth, color, startPosition, range, clockwise
                    this.wrapper.drawArc(this.leftCenter().x, this.leftCenter().y, this.h / 2, this.backColor, 0, 1, false);
                    this.wrapper.drawArcNoCloseStroke(this.rightCenter().x, this.rightCenter().y, this.h / 2, 2, this.lineColor, -1 / 4, 1 / 4, false)
                    this.wrapper.drawArc(this.rightCenter().x, this.rightCenter().y, this.h / 2, this.backColor, 0, 1, true);
                    this.wrapper.writeText(this.rectArea().x, this.rectArea().y + Math.floor((this.h - parseInt(this.fontSize, 10)) / 2), that.captionW(), this.h, this.caption, this.fontColor, this.fontSize, "Segoe UI", "bold", "center");

                });
                this.renderReady = true;
            }

            inheritPrototype(spanCtrl, _baseType);

            spanCtrl.prototype.updateText = function (value) {
                this.caption = value;
            }

            spanCtrl.prototype.hide = function () {
                this.setRenderFlag(false);
                //this.wrapper.clearRect(this.sx,this.sy,this.w+this.h,this.h);
            }

            spanCtrl.prototype.show = function () {
                this.setRenderFlag(true);
                this.render();
            }
            spanCtrl.prototype.applyStyle = function (lineColor, backColor, fontColor, fontSize) {
                this.lineColor = lineColor ? lineColor : "red";
                this.backColor = backColor ? backColor : "white";
                this.fontColor = fontColor ? fontColor : "black";
                this.fontSize = fontSize ? fontSize : this.h * 4 / 5;
            }
            spanCtrl.prototype.moveTo = function (x, y) {
                this.hide();
                this.move(x, y);
                this.show();
            }

            _chartWrapper.addSpanCtrl = function (x, y, w, h, text, parentCtrl) {
                var _span = new spanCtrl(this, x, y, w, h, text);
                _span.setParent(parentCtrl);
                this.ctrlList.push(_span);
                return _span;
            }
            return this;
        }
        , applyHTMLSlider: function (wrapper) {
            if (!wrapper) { throw "chart wrapper not ready" };
            var _chartWrapper = wrapper;
            var _baseCtrl = _chartWrapper.getBaseCtrlObj();
            var _baseType = _baseCtrl.constructor;

            var slider = function (wrapper, x, y, w, h) {
                _baseType.apply(this, arguments);
                this.x = 315;
                this.rendered = false;
                var _this = this;
                this.scrollHandler = new evtWrapper(this);
                this.wrapper.offsetXY = { l: this.wrapper.canvas.offsetLeft, t: this.wrapper.canvas.offsetTop };

                this.barH = Math.round(this.h / 6);
                this.absBarStart = { x: this.sx, y: Math.round(this.sy + (this.h - this.barH) / 2) };
                this.pureBarStart = { x: 0, y: Math.round((this.h - this.barH) / 2) };
                this.barW = this.w;

                this.blockH = 22;//Math.round(this.h * 2 / 3);
                this.absBlockStart = { x: this.sx, y: Math.round(this.sy + (this.h - this.blockH) / 2) };
                this.blockW = 45;

                this.block = this.wrapper.addBanner(this.absBlockStart.x, this.absBlockStart.y, this.blockW, this.blockH, "white", this);
                this.block.renderFlag = false;
                this.block._renderHandler._listeners = [];
                this.block.element = document.createElement("CANVAS");
                this.block.startX = this.sx;
                this.block.sx = function () { return this.startX + _this.x };
                this.block.ex = function () { return this.sx() + this.w };
                this.block.addRenderHandler(function () {
                    if (!this.renderFlag) { return; };
                    if (!_this.rendered) {
                        _this.wrapper.canvas.offsetParent.appendChild(this.element);
                        this.element.className = "htmlSlider";
                        this.element.width = _this.blockW + 4;
                        this.element.height = _this.blockH;
                        _this.rendered = true;
                    }
                    if (_this.x >= _this.w - _this.blockW) {
                        _this.x = _this.w - _this.blockW;
                    }
                    var offSet = _this.wrapper.offsetXY;
                    var _floatLeft = offSet.l + this.sx();


                    this.element.style.left = _floatLeft - 3 + "px";
                    this.element.style.top = offSet.t + this.sy + "px";
                    _this.scrolling();
                    var _pty = txtCtrllor.createTxtProperty("bold");
                    var _align = "center"
                    var _txt = this.caption;
                    var _width = this.element.width;
                    var _ctx = this.element.getContext("2d");
                    _ctx.clearRect(0, 0, this.element.width, this.element.height);
                    //ctx, x, y, txt, width, height, align, valign, pty
                    txtCtrllor.writeDataWithAlign(_ctx, 0, 0, _txt, _width, this.h, _align, "middle", _pty);
                    this.renderFlag = false;
                });
                this.block.range = this.getRange();

                var dragFlag = false;
                var _mousePosition = 0;
                var _offset = this.wrapper.canvas.offsetParent;

                this.block.element.addEventListener("mousedown", function (e) {
                    var _evt = e || window.event;
                    var cord = _evt.pageX ? _evt.pageX : _evt.clientX;
                    dragFlag = true;
                    _mousePosition = cord;

                    _this.webtrends = false;

                });

                _offset.addEventListener("mousemove", function (e) {
                    if (dragFlag) {
                        var _evt = e || window.event;
                        var cord = _evt.pageX ? _evt.pageX : _evt.clientX;
                        _this.x += cord - _mousePosition;
                        _this.x = Math.min(Math.max(_this.block.range.min, _this.x), _this.block.range.max);
                        _this.scrolling();
                        _mousePosition = cord;
                        _this.block.renderFlag = true;
                        _this.block.render();
                        _this.block.renderFlag = false;
                    }
                });

                function mouseup() {
                    if (dragFlag) {
                        dragFlag = false;
                        _mousePosition = undefined;
                        if (_this.block.referencedNode) {
                            _this.x = _this.block.referencedNode.location;
                            _this.block.renderFlag = true;
                            _this.block.render();
                            _this.block.renderFlag = false;
                        }
                    }
                }
                _offset.addEventListener("mouseup", function () {
                    mouseup();
                });

                document.body.addEventListener("mouseup", function () {
                    mouseup();
                });

                document.body.addEventListener("MSPointerUp", function () {
                    if (_touchFlag) {
                        _touchFlag = false;
                        _mousePosition = undefined;
                        if (_this.block.referencedNode) {
                            _this.x = _this.block.referencedNode.location;
                            _this.block.renderFlag = true;
                            _this.block.render();
                            _this.block.renderFlag = false;
                        }
                    }
                });

                var _touchStart = "touchstart";
                var _touchMove = "touchmove";
                var _touchEnd = "touchend";
                var _touchFlag = false;
                if (window.navigator.msPointerEnabled) {
                    _touchStart = "MSPointerDown";
                    _touchMove = "MSPointerMove";
                    _touchEnd = "MSPointerUp";
                }


                this.block.element.addEventListener(_touchStart, function (e) {

                    if (e.pointerType == e.MSPOINTER_TYPE_TOUCH) {
                        _this.wrapper.canvas.offsetParent.style.msTouchAction = "none";//   .setAttribute("style", "-ms-touch-action: none");
                    }
                    else {
                        _this.wrapper.canvas.offsetParent.style.removeProperty("msTouchAction");

                    }
                    var _evt = e || window.event;
                    var _touchCord = _this.wrapper.processTouchEvent(e);
                    _touchFlag = true;
                    _mousePosition = _touchCord.x;
                    _this.webtrends = false;
                });

                this.wrapper.addCanvasOffsetTouchMoveListener(null
                    , function (cord) {
                        if (_touchFlag) {
                            _this.x += cord.x - _mousePosition;
                            _this.x = Math.min(Math.max(_this.block.range.min, _this.x), _this.block.range.max);
                            _this.scrolling();
                            _mousePosition = cord.x;
                            _this.block.renderFlag = true;
                            _this.block.render();
                            _this.block.renderFlag = false;
                        }
                    }
                    , function () {
                        if (_touchFlag) {
                            _touchFlag = false;
                            _mousePosition = undefined;
                            if (_this.block.referencedNode) {
                                _this.x = _this.block.referencedNode.location;
                                _this.block.renderFlag = true;
                                _this.block.render();
                                _this.block.renderFlag = false;
                            }
                        }
                    }
                 );

                this.addRenderHandler(function () {
                    this.wrapper.save();
                    this.wrapper.translate(this.sx, this.sy);
                    var _barSX = this.pureBarStart.x + 0.5;
                    var _barSY = this.pureBarStart.y + 0.5;
                    var _barW = this.w - 2;
                    var _barH = this.barH;
                    var rectColor = this.wrapper.createLinearGradient(0, 0, 0, _barH, { 0: "rgba(243,243,243,0.6)", 1: "rgba(255,255,255,1)" });
                    this.wrapper.drawRect(_barSX, _barSY, _barW, _barH, rectColor);
                    this.wrapper.drawStrokeRect(_barSX, _barSY, _barW, _barH, 1, "rgb(241,241,241)");
                    this.wrapper.restore();
                    //draw the block
                    this.block.renderFlag = true;
                    this.block.render();
                });
            }
            inheritPrototype(slider, _baseType);
            slider.prototype.clearBlock = function () {
                if (this.block.element) {
                    this.block.element.parentNode.removeChild(this.block.element);
                }
            }
            slider.prototype.applyBlockWidth = function (value) {
                this.blockW = value;
            }
            slider.prototype.applyBackColor = function (color) {
                this.backColor = color;
            }

            slider.prototype.getRange = function () {
                return {
                    min: 0
                    , max: this.w - this.block.w
                }
            }

            slider.prototype.attachScroll = function (func) {
                this.scrollHandler.attach(func);
            }

            slider.prototype.scrolling = function () {
                this.scrollHandler.notify();
            }

            _chartWrapper.addSlider = function (x, y, w, h, parentCtrl) {
                var _slider = new slider(this, x, y, w, h);
                _slider.setParent(parentCtrl);
                this.ctrlList.push(_slider);
                return _slider;
            }
            return this;
        }
        , processTxt: function (txt) {
            var _reg = /[\s\/n\s]?.+/gi
            var _matches = txt.split(/\s\/n\s/gi);
            if (!_matches.length) { return [txt]; }
            return _matches
        }
    }
}