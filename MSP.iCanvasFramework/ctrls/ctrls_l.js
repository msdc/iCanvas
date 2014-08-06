/*import framwork v1.2.1 in advance*/
var axis = iCanvas.createNewCtrl(function () {
    this.type = "axis";
    this.applyBoundary(0, 100);
    this.Box = iCanvas.ctrls.vbox(this.wrapper);
    //this.Box.applyColor("blue");
    this.appendChild(this.Box);
    this.lines = [];
    this.labs = [];
    this.ctrls = [];
    var _areCtrlsAdded = false;
    this.onRender(
        function (x, y) {
            this.caculateSelf();
            this.setLabSpace();
            //this.wrapper.rect(this, "ctrl_rect", x, y);
            this.Box.applyWH(this.EX + "-" + this.SX, this.EY + "-" + this.SY);
            this.Box.applyMargin(this.SX, this.SY);
            if (this.lineSpace != undefined && this.lines.length == 0) {
                var that = this;
                function setFontSize() {
                    this.applyFontSize(that.H / 15);
                }
                var _Cons = iCanvas.getCONS();
                var _txtCons = _Cons.TXT;
                //process vertical data
                for (var i = 0, ci; ci = this.lineSpace[i]; i++) {
                    //line
                    var _temp = iCanvas.ctrls.line(this.wrapper, 100, this.lineWidth, 0, ci, this.lineColor);
                    //vertical lab
                    var _txt = iCanvas.ctrls.txt(this.wrapper, 0, 0, 0, 0, "transparent", this.labPrefix + this.labs[i]);
                    //config txt properties
                    _txt.attachFontHandler(setFontSize);
                    _txt.applyAlign(_txtCons.ALIGN.LEFT);
                    _txt.applyDisY(-3);
                    _temp.appendChild(_txt);
                    this.Box.appendChild(_temp);
                    this.lines.push(_temp);
                }
                //0 line                
                var _temp = iCanvas.ctrls.line(this.wrapper, 95, this.lineWidth, 5, this.centerLineHeight, "green");
                //vertical lab
                var _txt = iCanvas.ctrls.txt(this.wrapper, 0, 0, 100, 0, "transparent", this.labPrefix + "0");
                //config txt properties
                _txt.attachFontHandler(setFontSize);
                _txt.applyAlign(_txtCons.ALIGN.LEFT);
                _txt.applyDisY(-3);
                _temp.appendChild(_txt);
                this.Box.appendChild(_temp);
                this.lines.push(_temp);
                //process horizontal data
                for (var i = 0, ci; ci = this.solts[i]; i++) {
                    var _s = ci.s;
                    var _e = ci.e;
                    var _mp = ci.mp;
                    var _xTxt = iCanvas.ctrls.txt(this.wrapper, 0, 0, _mp.c, this.EY, "blue", this.XLabs[i]);
                    _xTxt.setPosition(_Cons.POSITION.ABSOLUTE);
                    _xTxt.attachFontHandler(function () {
                        setFontSize.apply(this);
                        this.applyDisY(this.fontSize + 3);
                    });
                    _xTxt.applyAlign(_txtCons.ALIGN.MIDDLE);
                    this.appendChild(_xTxt);
                }
            }
            if (!_areCtrlsAdded) {
                for (var i = 0, ci; ci = this.ctrls[i]; i++) {
                    this.appendChild(ci);
                }
                _areCtrlsAdded = true;
            }
        }
   );
});
axis.prototype.applyRange = function (max, min) {
    if (this.Range == undefined) {
        this.Range = [{ max: max, min: min }];
    }
    else {
        this.Range.push({ max: max, min: min });
    }
    return this;
}
axis.prototype.setLineCount = function (value, index) {
    if (typeof value != "number") {
        throw "line count is invalid";
    }
    this.lineCount = value;
    this.setLineSpace(index == undefined ? 0 : index);
}
axis.prototype.setLineSpace = function (index) {
    if (this.lineCount == undefined) { throw "there is no line assigned" }
    if (!this.Range || this.Range[index] == undefined) { throw "no valid range selected" };
    //select range
    var _range = this.Range[index];
    //the line space storage
    this.lineSpace = ["0"];
    //vertical lab storage
    this.labs = [_range.max];
    //return if there is only one line
    if (this.lineCount == 1) { return };
    //space between lines
    var _space = ((this.EY - this.SY) / (this.lineCount - 1)) + "-" + this.lineWidth;
    //calculate the difference between 2 labs
    var _labDiff = (_range.max - _range.min) / (this.lineCount - 1);
    for (var i = 1; i < this.lineCount; i++) {
        this.lineSpace.push(_space);
        this.labs.push(_range.max - i * _labDiff);
    }
    this.centerLineHeight = 100 / (_range.max - _range.min) * (_range.min - 0) - 1;
}
axis.prototype.setLabSpace = function () {
    if (this.XLabs == undefined) { return; }
    //calculate the solts
    var _soltDiff = iCanvas.newExp(this.EAX).SUB(this.SAX).DIV("{" + this.XLabs.length + "}");
    var _halfSoltDiff = iCanvas.newExp(_soltDiff).DIV("{2}");
    this.solts = [];
    var _start = iCanvas.newExp(this.SAX.toString());
    var _end = iCanvas.newExp(_start).ADD(_soltDiff);

    for (var i = 0; i < this.XLabs.length; i++) {
        this.solts.push({ s: _start, e: _end, diff: _soltDiff, mp: iCanvas.newExp(_start).ADD(_halfSoltDiff) });
        if (_end.c == this.EAX) {
            break;
        }
        _start = iCanvas.newExp(_end);
        _end = (i == (this.XLabs.length - 2)) ? iCanvas.newExp(this.EAX.toString()) : (_end.ADD(_soltDiff));
    }
}
axis.prototype.applyConfig = function (config, index) {
    for (var i in config) {
        if (this[i]) {
            this[i] = config[i];
        }
    }
    this.setLineSpace(index == undefined ? 0 : index);
}
axis.prototype.applyXLabs = function (value) {
    if (!this.XLabs) {
        this.XLabs = [value];
    }
    else {
        this.XLabs.push(value);
    }
}
axis.prototype.applyBoundary = function (sax, eax, sx, ex, sy, ey) {
    //start available x, end available x
    //start x, end x
    //start y, end y
    this.SAX = sax;
    this.EAX = eax;
    this.SX = sx == undefined ? 0 : sx;
    this.EX = ex == undefined ? 100 : ex;
    this.SY = sy == undefined ? 0 : sy;
    this.EY = ey == undefined ? 100 : ey;
}
axis.prototype.attachCtrl = function (ctrl) {
    this.ctrls.push(ctrl);
}
axis.prototype.lineWidth = "1px";
axis.prototype.lineColor = "#7e7e7e";
axis.prototype.labPrefix = "$";
///////////////////////
var paths = iCanvas.createNewCtrl(function () {
    this.type = "circle";
    var _Cons = iCanvas.getCONS();
    this.setPosition(_Cons.POSITION.ABSOLUTE);
    this.GROUP = iCanvas.ctrls.g(this.wrapper, 100, 100, 0, 0);
    this.GROUP.setPosition(_Cons.POSITION.ABSOLUTE);
    this.appendChild(this.GROUP);
    this.circles = [];
    this.backC = "blue";
    this.hoverC = "yellow";
    this.onRender(function (x, y) {
        this.caculateSelf();
        var _seed = 0;
        var _exp = iCanvas.newExp;
        this.cr = (this.cr == undefined ? 1.5 : this.cr);
        this.pathW = (this.pathW == undefined ? 1.5 : this.pathW);
        var _u = this.getUnit();
        var _max = this.Range.max;
        var _min = this.Range.min;
        this.pathPoints = [];

        for (var i in this.items) {
            var _single = this.items[i];
            var _dx = this.axis.solts[_seed].mp.c;
            var _dy = _exp("{" + (_max - _single.s - _single.l) + "}").MUL(_u).ADD(this.axis.SY).SUB(this.axis.lineWidth).c;
            var singlePoint = { x: _dx, y: _dy };
            _seed++;
            this.pathPoints.push(singlePoint);
        }
        var _singlePath = iCanvas.ctrls.path(this.wrapper, this.pathW, 0, 0, 0, "green", { obj: this.GROUP, ctrl: "ctrl_path" });
        _singlePath.setPosition(_Cons.POSITION.ABSOLUTE);
        _singlePath.pathWidth(this.pw);
        _singlePath.pathPoints(this.pathPoints);
        this.GROUP.appendChild(_singlePath);

        _seed = 0;
        for (var i in this.items) {
            var _single = this.items[i];
            var _cx = this.axis.solts[_seed].mp.c;
            var _cy = _exp("{" + (_max - _single.s - _single.l) + "}").MUL(_u).ADD(this.axis.SY).SUB(this.axis.lineWidth).c;
            var _singleCircle = iCanvas.ctrls.circle(this.wrapper, this.cr, 0, _cx, _cy, "blue", { obj: this.GROUP, ctrl: "ctrl_circle" });
            _singleCircle.setPosition(_Cons.POSITION.ABSOLUTE);
            this.GROUP.appendChild(_singleCircle);
            _seed++;
        }




    });
});

paths.prototype.applyAxis = function (axis, cordIndex) {
    this.axis = axis;
    axis.attachCtrl(this);
    //in case of multiple cordinations in the axis, the cordIndex is designed to specify a sertain one
    this.Range = axis.Range[cordIndex == undefined ? 0 : cordIndex];

}

paths.prototype.applyR = function (w) {
    this.cr = w;
}


paths.prototype.applySingleValue = function (key, length, start) {
    if (!this.items) {
        this.items = {};
    }
    this.items[key] = { s: start == undefined ? 0 : start, l: length };
}

paths.prototype.applyWidth = function (w) {
    this.pathW = w;
}

paths.prototype.applyColors = function (backC, hoverC) {
    this.backC = backC;
    this.hoverC = hoverC ? hoverC : backC;
}

paths.prototype.getUnit = function () {
    if (!this.axis) { throw "invalid axis" };
    var _range = this.Range;
    var _start = this.axis.SY;
    var _end = this.axis.EY;
    var _volume = iCanvas.newExp(_end).SUB(_start).c;
    var _unit = iCanvas.newExp(_volume).DIV("{" + (_range.max - _range.min) + "}");
    return _unit;
}

paths.prototype.getU = function () {
    if (!this.axis) { throw "invalid axis" };
    var _range = this.Range;
    var _start = this.wrapper.w;
    var _end = this.wrapper.h;
    var _volume = iCanvas.newExp(_end).SUB(_start).c;
    var _unit = iCanvas.newExp(_volume).DIV("{" + (_range.max - _range.min) + "}");
    return _unit;
}