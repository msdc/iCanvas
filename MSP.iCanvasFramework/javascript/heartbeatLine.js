/// <reference path="iCanvas_v1_1_1.js" />
(function () {
    var _cvsWrapper, _baseType, _isInCtrl, _simpleLine, _simpleAxis, _point, _axisTipLine;
    _cvsWrapper = new canvasWrapper();
    _baseType = _cvsWrapper.getBaseCtrlObj().constructor;
    _isInCtrl = _cvsWrapper["isInCtrl"];
    _point = function (wrapper, x, y, r, color) {
        _baseType.call(this, wrapper, x - r, y - r, 2 * r, 2 * r);
        this.backColor = color || "black";
        this.r = r;
        this.cx = x;
        this.cy = y;
        var that = this;
        this.sx = function () { return that.cx - that.r; }
        this.sy = function () { return that.cy - that.r; }
        this.displayBorder = true;
        this.lineWidth = 2;
        this.lineColor = "white";
        this.originOffsetY = 0;
        this.originOffsetX = 0;
        this.text = "0";
        this.fontSize = 10;
        this.fontWeight = "";
        this.fontColor = undefined;
        this.fontFamily = "Arial";
        this.pointTag = "";
        this.addIsInCrtl(function (cord) {
            var _cx = this.cx,
                _cy = this.cy,
                _r = this.r + this.lineWidth,
                _ctx = this.wrapper.ctx,
                _result,
                _position = this.wrapper.getCtrlHierarchy(this);
            _ctx.save();
            _ctx.translate(_position.x, _position.y);
            _ctx.beginPath();
            _ctx.moveTo(_cx, _cy);
            _ctx.arc(_cx, _cy, _r, 0, Math.PI * 2, false);

            _ctx.closePath();
            _result = _ctx.isPointInPath(cord.x, cord.y);
            _ctx.restore();
            return _result;


        });


        this.addRenderHandler(function () {

            var _lineWidth = this.lineWidth || 2,
                _lineColor = this.lineColor,
                _cx = this.cx + this.originOffsetX,
                _cy = this.cy + this.originOffsetY,
                _r = this.r,
                _backColor = this.backColor;
            this.fontColor = this.fontColor || this.backColor;
            this.wrapper.save();
            this.wrapper.drawArc(_cx, _cy, _r, _backColor);
            if (this.displayBorder) {
                this.wrapper.drawArcStroke(_cx, _cy, _r, _lineWidth, _lineColor);
            }
            this.wrapper.restore();
            this.wrapper.save();
            var tw = this.wrapper.messureText(this.fontWeight, this.fontSize, this.fontFamily, this.text).width;
            this.wrapper.drawString(this.text, _cx - tw / 2, _cy - 20, tw, this.fontSize, this.fontColor, this.fontSize, this.fontFamily, this.fontWeight, "center", "center", true);
            this.wrapper.restore();
            this.renderReady = true;
        });
    }
    inheritPrototype(_point, _baseType);
    _point.prototype.setPosition = function (x, y) {
        this.cx = x;
        this.cy = y;
    }
    _point.prototype.setStyle = function (backColor, lineWidth, lineColor) {
        this.backColor = backColor || "black";
        this.lineWidth = lineWidth || 2;
        this.lineColor = lineColor || "white";
    }
    _point.prototype.clone = function () {
        var result = new this.constructor();
        for (var i in this) {
            if (this.hasOwnProperty(i)) {
                result[i] = this[i];
            }
        }
        return result;
    }
    _point.prototype.setText = function (txt) {
        this.text = txt;
    }

    _simpleLine = function (wrapper, lineColor, lineWidth) {
        _baseType.call(this, wrapper, 0, 0, 0, 0);
        this.lineColor = lineColor || "#F48029";
        this.lineWidth = lineWidth || 2;
        this._addPointHandler = new evtWrapper(this);
        this.pointList = [];
        this.pointCount = 8;
        this.pointsXPosition = [];
        this.displayPoint = true;
        /*Animation proprety*/
        this.loadAnimationEnable = true;
        this.isAnimationCompleted = false;
        this.currentPosition = 0;

        var _initPointSetting = (function () {
            var _pointList = this.pointList,
           _count = this.pointCount, _tmpPoint;
            if (_count > 0) {
                while (_pointList.length > _count) {
                    _tmpPoint = _pointList.shift();
                }
            }

            for (var i = 0, ci; ci = _pointList[i]; i++) {
                if (ci.renderReady) {
                    ci.renderReady = false;
                }
                ci.cx = this.pointsXPosition[i] || ci.cx;
            }
        }).bind(this);
        var _createEquation = (function () {
            if (!this.equationCollection) {

                var _getLineEquation = function (a1, b1, a2, b2) {
                    return function (x) {
                        var k = (b2 - b1) / (a2 - a1);
                        return k * x + b1 - k * a1;
                    }
                };
                var _equationCollection = [];
                var _equationObj = undefined, _endPoint, _fn;
                for (var i = 0, ci; ci = this.pointList[i]; i++) {
                    _endPoint = this.pointList[i + 1];
                    if (_endPoint) {
                        _fn = _getLineEquation(ci.cx, ci.cy, _endPoint.cx, _endPoint.cy);
                        _equationObj = { fn: _fn, startPoint: ci.clone(), endPoint: _endPoint.clone() };
                        _equationCollection.push(_equationObj);
                    }
                }
                this.equationCollection = _equationCollection;
            }
            return this.equationCollection;
        }).bind(this);

        this.addRenderHandler(function () {
            _initPointSetting();

            var _drawPoint = (function (point) {
                point.renderReady = true;
                point.render();
            }).bind(this),

            _drawLine = (function (spoint, epoint) {
                this.wrapper.drawLine(spoint.cx, spoint.cy, epoint.cx, epoint.cy, this.lineWidth, this.lineColor);
            }).bind(this);

            var _pointList = this.pointList,
                _spoint, _sx, _sy, _ex, _ey, _getPointY, _currentX = this.currentPosition;

            if (_pointList <= 0) {
                return;
            }
            if (this.loadAnimationEnable && !this.isAnimationCompleted) {
                var _equationCol = _createEquation(),
                    _len = _equationCol.length,
                    _sp, _ep, _fn;
                for (var i = 0, _equation; _equation = _equationCol[i]; i++) {
                    _sp = _equation.startPoint;
                    _ep = _equation.endPoint;
                    _fn = _equation.fn;
                    if (_currentX < _sp.cx) {
                        break;
                    }
                    if (_currentX >= _sp.cx && _currentX < _ep.cx) {
                        this.wrapper.drawLine(_sp.cx, _sp.cy, _currentX, _fn(_currentX), this.lineWidth, this.lineColor);
                    }
                    else {
                        this.wrapper.drawLine(_sp.cx, _sp.cy, _ep.cx, _ep.cy, this.lineWidth, this.lineColor);
                    }

                    if (_currentX >= _equationCol[_len - 1].endPoint.cx) {
                        this.isAnimationCompleted = true;
                    }
                }
            }
            else {
                _spoint = _pointList[0];
                for (var i = 1, ci; ci = _pointList[i]; i++) {
                    _sx = _spoint.cx;
                    _sy = _spoint.cy;
                    _ex = ci.cx;
                    _ey = ci.cy;
                    if (!_sx || !_sy || !_ex || !_ey) { continue; }
                    _drawLine({ cx: _sx, cy: _sy }, { cx: _ex, cy: _ey });
                    _spoint = ci.clone();
                }
                if (this.displayPoint) {
                    for (var i = 0, ci; ci = _pointList[i]; i++) {
                        if (!ci.cx || !ci.cy) { continue; }
                        _drawPoint(ci);
                    }
                }
            }




        });
    }
    inheritPrototype(_simpleLine, _baseType);

    _simpleLine.prototype.setDisplayCount = function (count) {
        this.pointCount = count || -1;
    }
    _simpleLine.prototype.addPoints = function (points) {
        var _pointList = [];
        if (Object.prototype.toString.call(points).toLocaleLowerCase() == "[object array]") {
            _pointList = points;
        }
        else {
            _pointList.push(points);
        }
        for (var i = 0, ci; ci = _pointList[i]; i++) {
            //this.pointsXPosition.push(ci.cx);
            ci.renderReady = false;
            this.pointList.push(ci);
        }

    }
    /************************************/
    _simpleAxis = function (wrapper, x, y, w, h, color) {
        _baseType.apply(this, [wrapper, x, y, w, h]);
        this.backColor = color || "white";
        this.originLineColor = "white";
        this.nonOrginLineColor = "white";
        this.borderColor = "white";
        this.borderWidth = 1;
        this.soltCounts = 8;
        this.axisYLabelWidth = 50;
        this.axisXLabelHeight = 30;
        this.nonOrginLinePosition = [];
        this.displayBorder = true;
        var that = this;
        this.ex = function () { return that.sx + that.w; }
        this.labels = [];
        var controlLabelCount = (function () {
            var _labels = this.labels,
           _count = this.soltCounts;
            if (_count > 0) {
                while (_labels.length > _count) {
                    _labels.shift();
                }
            }
            for (var i = 0, ci; ci = _labels[i]; i++) {
                if (ci.renderReady) {
                    ci.renderReady = false;
                }
            }

        }).bind(this);

        this.XfontSize = 12;
        this.XfontWeight = "normal";
        this.XfontColor = "black";
        this.XfontFamily = "Arial";

        this.YfontSize = 12;
        this.YfontWeight = "normal";
        this.YfontColor = "black";
        this.YfontFamily = "Arial";

        this.addRenderHandler(function () {
            controlLabelCount();
            var _yLableWidth = this.axisYLabelWidth;
            var _xLableHeight = this.axisXLabelHeight;
            var _w = this.w, _h = this.h,
                _borderW = this.borderWidth,
                _axisLinePosition = this.axisLinePosition;
            this.wrapper.clearRect(this.sx, this.sy, _w, _h);
            this.wrapper.save();
            this.wrapper.translate(parseInt(this.sx, 10) + 0.5, parseInt(this.sy, 10) + 0.5);

            if (_axisLinePosition.length > 0) {
                _w = _w - _yLableWidth;
            }

            /*draw axis background*/
            if (this.displayBorder) {
                this.wrapper.drawRect(_borderW, _borderW, _w - _borderW * 2, _h - _borderW * 2, this.backColor);
                this.wrapper.drawStrokeRect(0, 0, _w, _h, _borderW, this.borderColor);
            }
            else {
                this.wrapper.drawRect(0, 0, _w, _h, this.backColor);
            }

            /***/

            if (this.oValue != undefined) {
                this.wrapper.save();
                this.wrapper.translate(Math.floor(this.oX), Math.floor(this.oY));

                /*draw x-axis orginal Line*/
                this.wrapper.drawStaticLine(0, 0, _w, 0, 1, this.originLineColor);

                /*draw axis line*/
                var len = _axisLinePosition.length;
                for (var i = 0; i < len; i++) {
                    var _tmp = 0 - parseInt(_axisLinePosition[i] * this.unit, 10);
                    this.wrapper.drawStaticLine(0, _tmp, _w, 0, 1, this.nonOrginLineColor);
                    this.wrapper.writeText(_w, _tmp - 10, _yLableWidth, 20, _axisLinePosition[i], this.YfontColor, this.YXfontSize, this.YfontFamily, this.YfontWeight, "right");

                }
                var _soltPosition = this.soltPostions;
                len = _soltPosition.length;

                for (var i = 1; i < len; i++) {

                    var tw = this.wrapper.messureText(this.XfontWeight, this.XfontSize, this.XfontFamily, this.text).width;
                    this.wrapper.drawString(this.labels[i], _soltPosition[i] - tw / 2, 10, tw, this.XfontSize + 8, this.XfontColor, this.XfontSize, this.XfontFamily, this.XfontWeight, "center", "center", true);



                    // this.wrapper.writeText(_soltPosition[i], 0, tw, 20, this.labels[i], this.originLineColor, 10, null, null, "right");

                }


                this.wrapper.restore();
            }






            this.wrapper.restore();
        })
    }

    inheritPrototype(_simpleAxis, _baseType);

    _simpleAxis.prototype.applyRange = function (min, max) {
        var _min, _max, _yLabelWidth, _xLabelHeight,
            _soltCounts = this.soltCounts || 8,
            _soltLength;
        this.min = _min = Math.min.apply(null, [min, max]);
        this.max = _max = Math.max.apply(null, [min, max]);
        _xLabelHeight = this.axisXLabelHeight || 30;
        _yLabelWidth = this.axisYLabelWidth || 50;
        this.unit = (this.h - _xLabelHeight * 2) / (_max - _min);
        if (this.nonOrginLinePosition.length <= 0) {
            _yLabelWidth = 0;
        }
        this.actualWidth = this.w - _yLabelWidth;
        this.soltLength = Math.round(this.actualWidth / _soltCounts);
        this.soltPostions = [];
        _soltLength = this.soltLength;
        for (var i = 0; i < _soltCounts; i++) {
            this.soltPostions.push((i - 1 / 2) * _soltLength);
        }
    }

    _simpleAxis.prototype.setOriginal = function (value, oX) {
        this.oValue = (value >= this.min || value <= this.max) ? value : this.min;
        this.oY = this.h - this.axisXLabelHeight - this.oValue;
        this.oX = oX == undefined ? 0 : oX;
    }
    _simpleAxis.prototype.getPointY = function (value) {
        return this.oY - value * this.unit + this.sy;
    }
    _simpleAxis.prototype.addLabel = function (label) {
        this.labels.push(label);
    }
    _simpleAxis.prototype.setSoltPositionOffsetX = function (offsetX) {
        var _soltPostion = this.soltPostions;
        for (var i = 0, len; len = _soltPostion.length, i < len; i++) {
            _soltPostion[i] += offsetX;
        }
    }
    _simpleAxis.prototype.addSoltPostion = function (value) {
        var _soltPostion = this.soltPostions;
        _soltPostion.shift();
        _soltPostion.push(value);
    }

    _axisTipLine = function (wrapper, sx, sy, ex, ey, color, width) {
        _baseType.apply(this, [wrapper, sx, sy, ex, ey]);
        this.sx = sx;
        this.sy = sy;
        this.ex = ex;
        this.ey = ey;
        this.color = color;
        this.width = width;
        this.addRenderHandler(function () {
            this.wrapper.save();
            this.wrapper.drawLine(parseInt(this.sx) + 0.5, this.sy, parseInt(this.ex) + 0.5, this.ey, this.width, this.color);
            this.wrapper.restore();
        });

    }
    inheritPrototype(_axisTipLine, _baseType);
    canvasWrapper.prototype.addAxisTipLine = function (sx, sy, ex, ey, lineColor, lineWidth, parentCtrl) {
        var _sline = new _axisTipLine(this, sx, sy, ex, ey, lineColor, lineWidth);
        _sline.setParent(parentCtrl);
        this.ctrlList.push(_sline);
        return _sline;
    }
    canvasWrapper.prototype.addSimpleLine = function (lineColor, lineWidth, parentCtrl) {
        var _sline = new _simpleLine(this, lineColor, lineWidth);
        _sline.setParent(parentCtrl);
        this.ctrlList.push(_sline);
        return _sline;
    }
    canvasWrapper.prototype.addSimplePoint = function (x, y, r, color, parentCtrl) {
        var _spoint = new _point(this, x, y, r, color);
        _spoint.setParent(parentCtrl);
        this.ctrlList.push(_spoint);
        return _spoint;
    }
    canvasWrapper.prototype.addSimpleAxis = function (x, y, w, h, color, parentCtrl) {
        var _axis = new _simpleAxis(this, x, y, w, h, color);
        _axis.setParent(parentCtrl);
        this.ctrlList.push(_axis);
        return _axis;
    }
    canvasWrapper.prototype.drawString = function (text, sx, sy, w, h, fontColor, size, family, weight, textAlign, vtextAlign, isfill) {
        var _c = this.ctx;
        _c.save();
        _c.translate(sx, sy);
        _c.textBaseline = 'middle';
        var _left = 0, _top = 0;
        switch (textAlign) {
            case "right":
                {
                    _left = w;
                    break;
                }
            case "center":
                {
                    _left = w / 2;
                    break;
                }
            default:
                {
                    _left = 0;
                    break;
                }
        }
        vtextAlign = vtextAlign ? vtextAlign : "top";
        _c.textAlign = textAlign;
        var _color = fontColor || "black";
        var _weight = weight || "";
        var _size = size || Math.round(h * 0.6);
        var _family = family || "微软雅黑";

        _c.font = "normal normal " + _weight + " " + _size + "px " + _family;
        switch (vtextAlign) {
            case "bottom":
                {
                    _top = h - size;
                    break;
                }
            case 'center':
                {
                    _top = h / 2 - size / 2;
                    break;
                }
            default:
                {
                    _top = 0;
                    break;
                }
        }
        _c.fillStyle = _color;
        _c.strokeStyle = _color;
        text = text || "";
        isfill ? _c.fillText(text, _left, _top) : _c.strokeText(text, _left, _top);
        _c.restore();

    };



})();

var lineChart = function (cvsId, w, h) {
    this.sx = 0;
    this.sy = 0;
    this.w = w != undefined ? w : 400;
    this.h = h != undefined ? h : 420;
    this.applyWrapper(cvsId, this.w, this.h);
    this.backColor = "white";
    this.displayBorder = false;
    this.borderWidth = 1;
    this.borderColor = "black";
    this.axisOriginLineColor = "gray";
    this.axisNonOriginLineColor = "gray";
    this.pointCount = 7;
    this.axisLinePosition = [0, 40, 80, 120];
    this.axisRange = [0, 120];
    this.originalValue = 0;
    this.data = [];
    this.labels = [];

    this.pointRadius = 6;
    this.pointColor = ["#F48029"];
    this.pointBorderColor = "white";
    this.pointBorderWidth = 2;
    this.displayPointBorder = true;

    this.lineWidth = 3;
    this.lineColor = ["#F48029"];

    this.axisYLabelFontSize = 12;
    this.axisYlabelFontColor = "black";
    this.axisYlabelFontFamily = "微软雅黑";
    this.axisYlabelFontWeight = "normal";

    this.axisXLabelFontSize = 12;
    this.axisXlabelFontColor = "black";
    this.axisXlabelFontFamily = "微软雅黑";
    this.axisXlabelFontWeight = "normal";


    this.pointFontSize = 12;
    this.pointFontColor = ["black"];
    this.pointFontFamily = "微软雅黑";
    this.pointFontWeight = "normal";
    this.pointTag = [];

    this.loadingAnimationEnable = true;
    this._axis = undefined;
    this._lines = undefined;

    this._configHandler = new evtWrapper(this);
    this._loadingAnimateCompletedHandler = new evtWrapper(this);
    this._pointClickHandler = new evtWrapper(this);
    this._pointMousemoveHandler = new evtWrapper(this);
    this._pointMouseoutHandler = new evtWrapper(this);

    this.addConfigHandler(function () {
        var _wrapper = this.wrapper,
            _sx = this.sx,
            _sy = this.sy,
            _w = this.w,
            _h = this.h,
            _that = this,
            _backColor = this.backColor,
            _pointCount = this.pointCount + 1,
            _displayBorder = this.displayBorder,
            _axisLinePosition = this.axisLinePosition,
            _borderWidth = this.borderWidth,
            _borderColor = this.borderColor,
            _axisOriginLineColor = this.axisOriginLineColor,
            _axisNonOriginLineColor = this.axisNonOriginLineColor,
            _axisRange = this.axisRange,
            _originalValue = this.originalValue,
            _data = this.data && this.data.length > 0 ? this.data : [[0, 0]],
            _labels = this.labels && this.labels.length > 0 ? this.labels : ["", ""],
            _r = this.pointRadius,
            _pointColor = this.pointColor,
            _pointBorderColor = this.pointBorderColor,
            _pointBorderWidth = this.pointBorderWidth,
            _displayPointBorder = this.displayPointBorder,
            _lineWidth = this.lineWidth,
            _lineColor = this.lineColor,

            _axisYLabelFontSize = this.axisYLabelFontSize,
            _axisYlabelFontColor = this.axisYlabelFontColor,
            _axisYlabelFontFamily = this.axisYlabelFontFamily,
            _axisYlabelFontWeight = this.axisYlabelFontWeight,

            _axisXLabelFontSize = this.axisXLabelFontSize,
            _axisXlabelFontColor = this.axisXlabelFontColor,
            _axisXlabelFontFamily = this.axisXlabelFontFamily,
            _axisXlabelFontWeight = this.axisXlabelFontWeight,


            _pointFontSize = this.pointFontSize,
            _pointFontColor = this.pointFontColor,
            _pointFontFamily = this.pointFontFamily,
            _pointFontWeight = this.pointFontWeight,
            _pointTag = this.pointTag;

        _loadingAnimationEnable = this.loadingAnimationEnable;


        var _axis, _point, _pointList = [], _line, _soltLength;
        var _axisMaxData = Math.max.apply(null, _axisRange),
            _axisMinData = Math.min.apply(null, _axisRange);
        _axis = _wrapper.addSimpleAxis(_sx, _sy, _w, _h, _backColor);
        _axis.soltCounts = _pointCount;
        _axis.axisLinePosition = _axisLinePosition;
        _axis.displayBorder = _displayBorder;
        _axis.originLineColor = _axisOriginLineColor;
        _axis.nonOrginLineColor = _axisNonOriginLineColor;
        _axis.borderColor = _borderColor;
        _axis.borderWidth = _borderWidth;
        _axis.applyRange(_axisMinData, _axisMaxData);
        _axis.setOriginal(_originalValue);
        _axis.labels = _labels;
        _axis.zIndex = 0;
        _axis.YfontColor = _axisYlabelFontColor;
        _axis.YfontSize = _axisYLabelFontSize;
        _axis.YfontFamily = _axisYlabelFontFamily;
        _axis.YfontWeight = _axisYlabelFontWeight;
        _axis.XfontColor = _axisXlabelFontColor;
        _axis.XfontSize = _axisXLabelFontSize;
        _axis.XfontFamily = _axisXlabelFontFamily;
        _axis.XfontWeight = _axisXlabelFontWeight;

        //_axisTipLine = _wrapper.addAxisTipLine(0, _axis.getPointY(_axisMinData), 0, _axis.getPointY(_axisMaxData), "#814EE6", 1);
        //_axisTipLine.zIndex = 1;
        //_axisTipLine.setRenderFlag(false);
        //_axis.onmousemove(function (cord) {
        //    _axisTipLine.setRenderFlag(true);

        //    var i = Math.round((cord.x + this.soltLength/2 )/ this.soltLength);
        //    //this.soltPostions[i]

        //    _axisTipLine.sx = this.soltPostions[i];
        //    _axisTipLine.ex = this.soltPostions[i];

        //    _wrapper.render();

        //});
        //_axis.onmouseout(function (cord) {
        //    _axisTipLine.setRenderFlag(false);


        //    _wrapper.render();

        //});





        _soltLength = _axis.soltLength;
        var _lData = [], _lines = [];
        for (var j = 0; j < _data.length; j++) {
            _lData = _data[j];
            _pointList[j] = [];
            var _k = j % _data.length;
            for (var i = 0, len, txt; len = _lData.length, i < len; i++) {
                txt = _lData[i];


                _point = _wrapper.addSimplePoint(_axis.soltPostions[i], _axis.getPointY(txt), _r, _pointColor[_k]);
                _point.displayBorder = _displayPointBorder;
                _point.lineColor = _pointBorderColor;
                _point.lineWidth = _pointBorderWidth;

                _point.fontColor = _pointFontColor[_k];
                _point.fontSize = _pointFontSize;
                _point.fontFamily = _pointFontFamily;
                _point.fontWeight = _pointFontWeight;
                var _tmpTag = typeof _pointTag[j][i] == undefined ? undefined : _pointTag[j][i];
                _point.pointTag = { lineNo: j, tag: _tmpTag };
                _point.setText(txt);
                (function (k) {
                    _point.onclick(function (cord) {
                        _that._pointClickHandler.notify(this, cord);
                    });
                    _point.onmousemove(function (cord) {
                        _that._pointMousemoveHandler.notify(this, cord);
                    });
                    _point.onmouseout(function (cord) {
                        _that._pointMouseoutHandler.notify(this, cord);
                    });
                })(i);



                if (_loadingAnimationEnable) {
                    _point.originOffsetY = -10;
                    _point.originOffsetX = 10;
                }
                //_point.setRenderFlag(false);
                _point.zIndex = 3 + i * (j + 1);
                _pointList[j].push(_point);
            }
            var _line = _wrapper.addSimpleLine(_lineColor[_k], _lineWidth, _axis);
            _line.addPoints(_pointList[j]);
            _line.pointsXPosition = _axis.soltPostions;
            _line.pointCount = _pointCount;

            _line.zIndex = 2;
            _line.loadAnimationEnable = _loadingAnimationEnable;

            _lines.push(_line);
        }


        if (_loadingAnimationEnable) {
            var _lineAnimate = _wrapper.addAnimation(20);
            _lineAnimate.applyCtrls(_axis);

            var _pointAnimation = _wrapper.addAnimation(20);
            _pointAnimation.applyCtrls(_axis);


            for (var m = 0, ci; ci = _lines[m]; m++) {
                _pointAnimation.applyCtrl(ci);

                _lineAnimate.logChanges(ci, { currentPosition: _axis.soltPostions[_axis.soltPostions.length - 1] }, 0, 2);
            }
            _lineAnimate.active();


            for (var i = 0, ci; ci = _pointList[i]; i++) {
                for (var k = 0, ck; ck = ci[k]; k++) {
                    _pointAnimation.logChanges(ck, { originOffsetY: 10, originOffsetX: -10 }, 0, 0);
                }
            }
            _lineAnimate.attachDeactiveHandler(function () {
                _pointAnimation.active();
            });
            _pointAnimation.attachDeactiveHandler(function () {
                _that._loadingAnimateCompletedHandler.notify(_data);
            });
        }

        this._axis = _axis;
        this._lines = _lines;
    });

}
lineChart.prototype.addDataAndLable = function (nameValue) {
    var _keyValueCols = [];
    if (Object.prototype.toString.call(nameValue).toLocaleLowerCase() == "[object array]") {
        _keyValueCols = nameValue;
    }
    else {
        _keyValueCols.push(nameValue);
    }
    var _obj, _key, _value, _links;

    for (var i = 0; i < _keyValueCols.length; i++) {
        _obj = _keyValueCols[i];
        _key = _obj.key;
        _value = _obj.values;
        _links = _obj.links;
        this.data.length = this.data.length == 0 ? this.data.length = _value.length : this.data.length;
        this.pointTag.length = this.pointTag.length == 0 ? this.pointTag.length = _value.length : this.pointTag.length;
        for (var j = 0; j < this.data.length; j++) {
            if (typeof _value[j] == "undefined") {
                break;
            }
            if (Object.prototype.toString.call(this.data[j]).toLocaleLowerCase() != "[object array]") {
                this.data[j] = [];
            }
            if (Object.prototype.toString.call(this.pointTag[j]).toLocaleLowerCase() != "[object array]") {
                this.pointTag[j] = [];
            }
            this.data[j].push(_value[j]);
            this.pointTag[j].push(_links[j]);
        }
        this.labels.push(_key);
    }

}
lineChart.prototype.addConfigHandler = function (func) {
    this._configHandler.attach(func);
}
lineChart.prototype.applyWrapper = function (cvsId, width, height) {
    this.wrapper = new canvasWrapper(cvsId, width, height);
}
lineChart.prototype.loadingCompletedCallBack = function (func) {
    this._loadingAnimateCompletedHandler.attach(func);
}
lineChart.prototype.runConfig = function () {
    this._configHandler.notify();
    this.isRunedConfing = true;
}
lineChart.prototype.render = function (isLoading) {
    var _wrapper = this.wrapper;
    if (!_wrapper) { throw "canvases are not ready"; };
    if (!this.isRunedConfing) { this.runConfig(); }
    _wrapper.clearRect(0, 0, this.w, this.h);
    if (this.loadingAnimationEnable && isLoading) {
        _wrapper.renderByHierarchy();
        _wrapper.autoStart();
    }
    else {

        _wrapper.render();
    }
}

lineChart.prototype.activedRenderAnimation = function () {
    this.trigger = true;
}

lineChart.prototype.registorRenderAnimation = function (duration, fps, completedCallback, processCallback) {
    var _fps = fps || 24;
    var _delay = 1000 / fps;
    var _distance = this._axis ? this._axis.soltLength : this.w / (this.pointCount + 1);
    var _curfrm = 0;
    var _frames = parseInt((duration * _fps).toFixed(0), 10);
    var _step = _distance / _frames;
    var _lastUpdate = 0;
    var _this = this;
    this.wrapper.addListenerEvent(function () {
        _update(processCallback, completedCallback);
    });
    function _update(process, completed) {
        var _dataObj = new Date(), _now = _dataObj.getTime();
        if (typeof process != "function") process = function () { };
        if (typeof completed != "function") completed = function () { };
        if (_now - _lastUpdate > _delay && _this.trigger) {
            if (_curfrm == _frames - 1) {
                completed.apply(_this, [_curfrm, _step, _frames, _distance]);
                _this.trigger = false;
                _curfrm = 0;
            }
            else {
                process.apply(_this, [_curfrm, _step, _frames, _distance]);
                _this.trigger = true;
                _curfrm++;
            }
        }
    }

    this.wrapper.startListener();
}

lineChart.prototype.addPoint = function (label, value, links) {
    var _soltPostions = this._axis.soltPostions;
    var point;

    for (var i = 0; i < this._lines.length; i++) {
        if (typeof value[i] == "undefined") {
            break;
        }
        point = this._lines[i].pointList.shift();
        point.setText(value[i]);
        point.cy = this._axis.getPointY(value[i]);
        point.pointTag.tag = links[i];
        this._lines[i].addPoints(point);
    }


}

lineChart.prototype.moveAxisSoltPostionOffsetX = function (value) {
    this._axis.setSoltPositionOffsetX(value);
}
lineChart.prototype.onPointClick = function (func) {
    this._pointClickHandler.attach(func);
}
lineChart.prototype.onPointMousemove = function (func) {
    this._pointMousemoveHandler.attach(func);
}
lineChart.prototype.onPointMouseout = function (func) {
    this._pointMouseoutHandler.attach(func);
}

var heartbeatLineChart = function (params) {


    var _defaults = {
        cvsId: "c1",
        width: 800,
        height: 200,
        backColor: "white",
        displayBorder: false,
        borderWidth: 1,
        borderColor: "black",
        axisOriginLineColor: "#000000",
        axisNonOriginLineColor: "#dFdFdF",
        pointCount: 13,
        axisLinePosition: [40, 80, 100, 120],
        axisRange: [0, 120],
        originalValue: 0,
        data: [],
        labels: [],
        pointRadius: 8,
        pointColor: ["#F48029"],
        pointBorderColor: "white",
        pointBorderWidth: 2,
        displayPointBorder: true,
        lineWidth: 5,
        lineColor: ["#F48029"],
        axisYLabelFontSize: 12,
        axisYlabelFontColor: "#d9d9d9",
        axisYlabelFontFamily: "微软雅黑",
        axisYlabelFontWeight: "normal",
        axisXLabelFontSize: 12,
        axisXlabelFontColor: "#000000",
        axisXlabelFontFamily: "微软雅黑",
        axisXlabelFontWeight: "normal",
        pointFontSize: 12,
        pointFontColor: "black",
        pointFontFamily: "微软雅黑",
        pointFontWeight: "normal",
        loadingAnimationEnable: true
    }
    for (var i in params) {
        if (i in _defaults) {
            _defaults[i] = params[i];
        }
    }
    var _max = Math.max.apply(null, _defaults.axisRange);
    var _lineChart = new lineChart(_defaults.cvsId, _defaults.width, _defaults.height);

    _lineChart.pointCount = _defaults.pointCount;
    _lineChart.backColor = _defaults.backColor;
    _lineChart.displayBorder = _defaults.displayBorder;
    _lineChart.borderWidth = _defaults.borderWidth;
    _lineChart.borderColor = _defaults.borderColor;
    _lineChart.axisOriginLineColor = _defaults.axisOriginLineColor;
    _lineChart.axisNonOriginLineColor = _defaults.axisNonOriginLineColor;
    _lineChart.axisLinePosition = _defaults.axisLinePosition;
    _lineChart.axisRange = _defaults.axisRange;
    _lineChart.originalValue = _defaults.originalValue;
    _lineChart.pointRadius = _defaults.pointRadius;
    _lineChart.pointColor = _defaults.pointColor;
    _lineChart.pointBorderColor = _defaults.pointBorderColor;
    _lineChart.pointBorderWidth = _defaults.pointBorderWidth;
    _lineChart.displayPointBorder = _defaults.displayPointBorder;
    _lineChart.lineWidth = _defaults.lineWidth;
    _lineChart.lineColor = _defaults.lineColor;
    _lineChart.axisYLabelFontSize = _defaults.axisYLabelFontSize;
    _lineChart.axisYlabelFontColor = _defaults.axisYlabelFontColor;
    _lineChart.axisYlabelFontFamily = _defaults.axisYlabelFontFamily;
    _lineChart.axisYlabelFontWeight = _defaults.axisYlabelFontWeight;
    _lineChart.axisXLabelFontSize = _defaults.axisXLabelFontSize;
    _lineChart.axisXlabelFontColor = _defaults.axisXlabelFontColor;
    _lineChart.axisXlabelFontFamily = _defaults.axisXlabelFontFamily;
    _lineChart.axisXlabelFontWeight = _defaults.axisXlabelFontWeight;
    _lineChart.pointFontSize = _defaults.pointFontSize;
    _lineChart.pointFontColor = _defaults.pointFontColor;
    _lineChart.pointFontFamily = _defaults.pointFontFamily;
    _lineChart.pointFontWeight = _defaults.pointFontWeight;
    _lineChart.loadingAnimationEnable = _defaults.loadingAnimationEnable;

    if (!_defaults.data) {
        _defaults.data = [];
    }

    var _values = [], _links = [];

    for (var i = 0, pCount = _defaults.pointCount; i <= pCount; i++) {
        _values = [];
        _links = [];
        var _tmpTxt = undefined;
        for (var k = 0; k < _defaults.data.length; k++) {
            var len = pCount - _defaults.data[k].length;
            if (i <= len) {
                _values.push(0);
                _links.push(0);
            }
            else {
                _values.push(parseInt(_defaults.data[k][i - len - 1].value, 10));
                _links.push(_defaults.data[k][i - len - 1].links)
            }
            _tmpTxt = _tmpTxt || _defaults.data[k][i - len - 1].key;
        }
        _ltxt = _tmpTxt || "";
        _lineChart.addDataAndLable({ key: _ltxt, values: _values, links: _links });

    }

    var _pointClickHandler = new evtWrapper(_lineChart);
    var _pointMousemoveHandler = new evtWrapper(_lineChart);
    var _pointMouseoutHandler = new evtWrapper(_lineChart);
    var _chartMoveCompletedHandler = new evtWrapper(this);

    var _newLabel = "", _newValue = [], _newlinks = [];

    _lineChart.registorRenderAnimation(1, 24, function (curfrm, step, frames, distance) {
        var _newstep = Math.abs((frames - curfrm) * step);
        this.moveAxisSoltPostionOffsetX(-_newstep);
        this.render(false);
        this.moveAxisSoltPostionOffsetX(distance);
        this.addPoint(_newLabel, _newValue, _newlinks);
        this.render(false);
        _chartMoveCompletedHandler.notify(_newValue, _newlinks);
    }, function (curfrm, step, frames) {
        this._axis.setSoltPositionOffsetX(-step);
        this.render(false);
    });

    _lineChart.render(true);
    _lineChart.onPointClick(function (point, cord) {
        _pointClickHandler.notify(point, cord);
    });
    _lineChart.onPointMousemove(function (point, cord) {
        _pointMousemoveHandler.notify(point, cord);
    });
    _lineChart.onPointMouseout(function (point, cord) {
        _pointMouseoutHandler.notify(point, cord);
    });


    return {
        onPointClick: function (func) {
            if (typeof func == "function") {
                _pointClickHandler.attach(func);
            }
        },
        onPointMousemove: function (func) {
            if (typeof func == "function") {
                _pointMousemoveHandler.attach(func);
            }
        },
        onPointMouseout: function (func) {
            if (typeof func == "function") {
                _pointMouseoutHandler.attach(func);
            }
        },
        activedRenderAnimation: function () {
            _lineChart.activedRenderAnimation();
        },
        addMoveCompletedHandler: function (func) {
            if (typeof func == "function") {
                _chartMoveCompletedHandler.attach(func);
            }
        },

        addData: function (key, values, links) {
            if (arguments.length == 1) {
                var alist = key;
                _newValue = [];
                _newlinks = [];
                for (var i = 0, ci; ci = alist[i]; i++) {
                    _newLabel = _newLabel || ci.key;
                    _newValue.push(parseFloat(ci.value));
                    _newlinks.push(ci.links);
                }


            }
            else {
                _newLabel = key;
                _newValue = values;
                _newlinks = links;
            }

        }
    }

}





