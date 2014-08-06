var chartCtrls = function () {
    //put private content here
    var _wrapper, _base, _baseType,
        _distance, _step, _curfrm,
        _dateDelay, _lastUpdated, _frames, _trigger;
    Array.prototype.clone = function () {
        var _result = [];
        for (var i = 0, len; len = this.length, i < len; i++) {
            _result.push(this[i]);
        }
        return _result;
    }
    return {
        bindiCanvasInstance: function (iCanvas) {
            if (!iCanvas instanceof canvasWrapper) {
                throw ("iCanvas instance required");
            }
            _wrapper = iCanvas;
            _base = _wrapper.getBaseCtrlObj();
            _baseType = _base.constructor;
            return this;
        }
        , applyAxis: function () {
            if (!_wrapper || !_base) {
                throw ("need to bind an iCanvas instance first");
            }
            var simpleAxis = function (wrapper, x, y, w, h, text, color, lineColor) {
                _baseType.apply(this, arguments);
                this.backColor = color;
                this.originLineColor = lineColor;
                this.axislineColor = lineColor;
                this.borderColor = undefined;
                this.borderWidth = 1;
                this.soltCounts = this.soltCounts || 8;
                this.axisVLabelWidth = 50;
                var that = this;
                this.ex = function () {
                    return that.sx + that.w;
                }
                this.axisLinePosition = [];
                this.addRenderHandler(function () {
                    this.wrapper.save();
                    this.wrapper.translate(this.sx, this.sy);
                    var _vLableWidth = this.axisVLabelWidth;
                    if (this.axisLinePosition.length > 0) {
                        _w = this.w - _vLableWidth;
                    }
                    else {
                        _w = this.w;
                    }
                    this.wrapper.clearRect(0, 0, this.w, this.h);

                    if (this.displayBorder) {
                        this.wrapper.drawRect(1, 1, _w - 2, this.h - 2, this.backColor);
                        this.wrapper.drawStrokeRect(0, 0, _w, this.h, this.borderWidth, this.borderColor);
                    }
                    else {
                       

                    }


                    if (this.oValue != undefined) {
                        //draw the line
                        this.wrapper.save();
                        this.wrapper.translate(this.oX, Math.floor(this.oY) + 0.5);

                        //sx, sy, w, h, lineWidth, color
                        this.wrapper.drawStaticLine(0, 0, _w, 0, 1, this.originLineColor);

                        for (var j = 0, len; len = this.axisLinePosition.length, j < len; j++) {
                            var _tmp = -parseInt(this.axisLinePosition[j] * this.unit, 10)
                            this.wrapper.drawStaticLine(0, -parseInt(this.axisLinePosition[j] * this.unit, 10), _w, 0, 1, this.axislineColor);
                            this.wrapper.writeText(_w, _tmp - 10, _vLableWidth, 20, this.axisLinePosition[j], this.axislineColor, null, null, null, "right");
                        }

                        var _pos = this.soltPositionReverse;

                        var _val = this.labels;

                        if (!(_val && _val.length >= 2)) return;
                        for (var i = 0; i < _pos.length; i++) {

                            var ci = _pos[i];
                            this.wrapper.save();
                            this.wrapper.translate(ci - 25, 0);
                            //: function (x, y, w, h, text, fontColor, size, family, weight, align) {
                            var _cv = _val[i];
                            if (!_cv) {
                                this.wrapper.restore();
                                break;
                            }
                            this.wrapper.writeText(0, 2, 50, 20, _cv);
                            this.wrapper.restore();

                        }


                        this.wrapper.restore();
                    }
                    this.wrapper.restore();
                });
            }
            inheritPrototype(simpleAxis, _baseType);

            simpleAxis.prototype.applyRange = function (min, max) {
                if (min >= max) {
                    throw "the min value should be smaller than the max one";
                }
                this.min = min;
                this.max = max;
                this.unit = (this.h - 30) / (this.max - this.min);
                var _vw = this.axisVLabelWidth;
                if (this.axisLinePosition.length <= 0) {
                    _vw = 0;
                }

                this.soltLength = Math.round((this.w - _vw) / (this.soltCounts - 2));


                this.soltPositions = [];
                var _halfSoltLength = this.soltLength;
                for (var i = 0; i < this.soltCounts - 1; i++) {

                    this.soltPositions.push((i - 1 / 2) * _halfSoltLength);

                }

                this.soltPositionReverse = this.soltPositionReverse || this.soltPositions.reverse();

                var that = this;
                return {
                    setOriginal: function (value, oX) {
                        that.oValue = (value >= min || value <= max) ? value : that.min;
                        that.oY = that.h - 20 - that.oValue;
                        that.oX = oX == undefined ? 0 : oX;
                    }
                }
            }
            simpleAxis.prototype.getPointY = function (value) {
                return this.oY - value * this.unit;
            }
            simpleAxis.prototype.applySingleLabel = function (value) {
                if (!this.labels) {
                    this.labels = [value];
                    return;
                }
                if (this.labels.length == this.soltCounts) {
                    this.labels.pop();
                }
                this.labels.unshift(value);
                if (this.labels.length >= 2) {
                    this.renderReady = true;
                }
                else {
                    this.renderReady = false;
                }
            }

            simpleAxis.prototype.setSoltPositionOffsetX = function (value) {

                if (!(this.labels && this.labels.length >= 2)) {
                    return;
                }

                var _soltPostion = this.soltPositionReverse;

                for (var i = 0, len; len = _soltPostion.length, i < len; i++) {
                    _soltPostion[i] += value;
                }
            }
            simpleAxis.prototype.calculateSoltPostion = function () {

                if (!(this.labels && this.labels.length > 2)) {
                    return;
                }

                var _soltPostion = this.soltPositionReverse;

                for (var i = 0, len; len = _soltPostion.length, i < len; i++) {
                    _soltPostion[i] = parseFloat(_soltPostion[i]) + this.soltLength;
                }

            }

            _wrapper.addSimpleAxis = function (x, y, w, h, text, color, lineColor, parentCtrl) {
                var _axis = new simpleAxis(this, x, y, w, h, text, color, lineColor);
                _axis.setZIndex(2);
                _axis.setParent(parentCtrl);
                this.ctrlList.push(_axis);
                return _axis;
            }
            return this;
        }
        , applyLine: function () {
            if (!_wrapper || !_base) {
                throw ("need to bind an iCanvas instance first");
            }

            var simpleLine = function (wrapper, x, y, w, h, text, color) {
                _baseType.apply(this, arguments);
                this.lineColor = color;
                this.r = 6;
                this.soltCounts = this.soltCounts || 8;
                this.addRenderHandler(function () {
                    if (!this.parentNode) {
                        return;
                    }
                    _axis = this.parentNode;
                    //translate to the axis
                    this.wrapper.save();
                    this.wrapper.translate(_axis.sx, _axis.sy);
                    var _pos = _axis.soltPositionReverse;
                    var _points = this.points;
                    if (!(_points && _points.length >= 2)) return;
                    function set(i) {
                        return { x: _pos[i], y: _axis.getPointY(_points[i]) }
                    }

                    for (var i = 0; i < _points.length - 1; i++) {
                        var _start = set(i);
                        this.wrapper.save();
                        if (this.shadowEnable) {
                            var _c = this.wrapper.ctx;
                            _c.shadowOffsetX = 2;
                            _c.shadowOffsetY = 3;
                            _c.shadowColor = 'rgba(100,100,100,0.7)';
                            _c.shadowBlur = 4;
                        }
                        //line
                        if (_points[i + 1] != undefined) {
                            var _end = set(i + 1);
                            this.wrapper.drawLine(_start.x, _start.y, _end.x, _end.y, Math.floor(this.r / 2), this.lineColor);
                        }

                        //circle
                        this.wrapper.drawArc(_start.x, _start.y, this.r, this.lineColor);
                        this.wrapper.drawArcStroke(_start.x, _start.y, this.r, this.r / 2, "white");
                        this.wrapper.restore();

                        //text
                        var _labX = _start.x - 30;
                        var _labY = _start.y - this.r - 18;
                        this.wrapper.writeText(_labX, _labY, 50, 20, _points[i]);
                    }

                    this.wrapper.restore();
                });


            }
            inheritPrototype(simpleLine, _baseType);

            simpleLine.prototype.applySinglePoint = function (value) {
                if (!this.points) {
                    this.points = [value];
                    return;
                }
                if (this.points.length == this.soltCounts) {
                    this.points.pop();
                }
                this.points.unshift(value);
                if (this.points.length >= 2) {
                    this.renderReady = true;
                }
                else {
                    this.renderReady = false;
                }
            }


            _wrapper.addSimpleLines = function (x, y, w, h, text, color, parentCtrl) {
                var _sline = new simpleLine(this, x, y, w, h, text, color);
                _sline.setZIndex(4);
                _sline.setParent(parentCtrl);
                this.ctrlList.push(_sline);
                return _sline;
            }
            return this;

        }
        , setAnimationParams: function (duration, distance, fps, process, completed) {
            fps = fps || 24;
            _dateDelay = 1000 / fps;
            _distance = distance || 78;
            _curfrm = 0;
            _frames = parseInt((duration * fps).toFixed(0), 10);
            _step = _distance / _frames;
            _lastUpdated = 0;
            var _this = this;
            _wrapper.addListenerEvent(function () {
                _this.update(process, completed);
            });
            _wrapper.startListener();
        }
        , update: function (process, completed) {
            var _dateObj = new Date(), _args = [],
                _now = _dateObj.getTime();
            if (typeof process != "function") process = function () { };
            if (typeof completed != "function") completed = function () { };

            if (_now - _lastUpdated > _dateDelay && _trigger) {
                if (_curfrm == _frames - 1) {
                    _args = [_curfrm, _step, _frames];
                    completed.apply(this, _args);
                    _trigger = false;
                    _curfrm = 0;
                }
                else {
                    _args = [_curfrm, _step, _frames];
                    process.apply(this, _args);
                    _trigger = true;
                    _curfrm++;
                }
                _lastUpdated = _dateObj.getTime();
            }
        }
        , activeAnimation: function () {
            _trigger = true;
        }

    }
};

var heartRateLine = function (params) {
    var _defaults = {
        cvsId: "c1",
        width: 500,
        height: 143,
        borderColor: "lightgray",
        borderWidth: 1,
        axisOriginLineColor: "red",
        axisLineColor: "red",
        axisBgColor: "white",
        lineColor: "blue",
        pointRadius: 6,
        count: 6,
        axisRange: undefined,
        axisLinePosition: undefined

    }
    for (var i in params) {
        if (i in _defaults) {
            _defaults[i] = params[i];
        }
    }
    //this.originLineColor = lineColor;
    //this.axislineColor = lineColor;
    //this.borderColor = undefined;
    //this.borderWidth = 1;
    var iCanvasInstance = new canvasWrapper(_defaults.cvsId);
    var _chartCtrls = chartCtrls();
    _chartCtrls.bindiCanvasInstance(iCanvasInstance).applyAxis().applyLine();
    var _completedHandler = new evtWrapper(this);
    var _startHandler = new evtWrapper(this);
    var _renderAfter = new evtWrapper(this);
    var _count = _defaults.count + 2;
    var _w = parseInt(_defaults.width, 10) + 0.5, _h = parseInt(_defaults.height, 10) + 0.5;
    var _axisMax, _axisMin;
    if (Object.prototype.toString.call(_defaults.axisRange).toLocaleLowerCase() == "[object array]") {
        _axisMax = Math.max.apply(null, _defaults.axisRange);
        _axisMin = Math.min.apply(null, _defaults.axisRange);
    }
    //Create a banner control as a background.
    var _bigBack = iCanvasInstance.addBanner(0, 0, _w, _h, "transparent");

    var _axis = iCanvasInstance.addSimpleAxis(0, 0, _w, _h, "", _defaults.axisBgColor, _defaults.axisLineColor, _bigBack);
    _axis.soltCounts = _count;
    _axis.axisLinePosition = _defaults.axisLinePosition || [];

    _axis.originLineColor = _defaults.axisOriginLineColor;
    _axis.displayBorder = true;
    _axis.borderColor = _defaults.borderColor;
    _axis.borderWidth = _defaults.borderWidth;
    _axis.axislineColor = _defaults.axisLineColor;
    _axis._vLableWidth = 30;
    _axis.applyRange(0, 10).setOriginal(0);

    var _line = iCanvasInstance.addSimpleLines(0, 0, 0, 0, "", _defaults.lineColor, _axis);
    _line.soltCounts = _count;
    _line.r = _defaults.pointRadius;
    _line.lineColor = _defaults.lineColor;
    _line.shadowEnable = false;

    // var _addDataHandler = new eventHandler(chartCtrls);

    _axis.applySingleLabel("");
    _line.applySinglePoint(0);
    _axis.applySingleLabel("");
    _line.applySinglePoint(0);

    function _updateData(key, value) {
        _newData.key = key || _newData.key;
        _newData.value = value || _newData.value;
        _key = _newData.key;
        _value = _newData.value;

        _axis.applySingleLabel(_key);
        var _points = _line.points ? _line.points.clone() : [];
        _points.pop();
        _points.push(_value);
        var _max, _min;
        if (_axisMax) {
            _max = _axisMax;
        }
        else {
            _max = _axisMax || Math.max.apply(null, _points);

        }
        _max = _max < 0 ? 0 : _max;
        if (_axisMin) {
            _min = _axisMin;
        }
        else {
            _min = Math.min.apply(null, _points);

        }
        _min = _min > 0 ? 0 : _min;
        _axis.applyRange(_min - 5, _max + 10).setOriginal(5);
        _line.applySinglePoint(_value);
        return _value;
    }
    var _newData = { key: "", value: 0 };
    _chartCtrls.setAnimationParams(0.2, _axis.soltLength, 24, function (_curfrm, _step, _frames) {
        _axis.setSoltPositionOffsetX(-_step);
        iCanvasInstance.render();
    }, function (_curfrm, _step, _frames) {
        var _newstep = Math.abs((_frames - _curfrm) * _step)
        _axis.setSoltPositionOffsetX(-_newstep);
        iCanvasInstance.render();
        var _result = _updateData();
        _axis.calculateSoltPostion();
        iCanvasInstance.render();

        _completedHandler.notify(_result);
    });

    return {
        render: function () {
            iCanvasInstance.render();
            _renderAfter.notify(_newData.value);
        },
        activeAnimation: function () {
            _startHandler.notify();
            _chartCtrls.activeAnimation();
        },
        addAnimateData: function (key, value) {
            _newData.key = key;
            _newData.value = value;
            //_updateData(key, value);
        },
        addNonAnimateData: function (key, value) {
            _updateData(key, value);
        },
        completed: function (func) {
            _completedHandler.attach(func);
        },
        startBefore: function (func) {
            _startHandler.attach(func);
        },
        renderAfter: function (func) {
            _renderAfter.attach(func);
        }

    }

}
