var SVGView = function (id) {
    this.applySVG(id);
    this.initEvts();
}

SVGView.prototype.applySVG = function (id) {
    this.svg = document.getElementById(id);
    if (!this.svg) {
        throw "svg element not found";
    }
}

SVGView.prototype.createSvgDom = function (key, parent) {
    var _dom = document.createElementNS('http://www.w3.org/2000/svg', key);
    parent.appendChild(_dom);
    return _dom
}

SVGView.prototype.createOrUpdateCircle = function (id, x, y, r, color, parent) {
    //in case the parent SVG dom may be a g tag, the parameter parent is ultilized to support this
    if (!this.circles) {
        this.circles = {};
    }
    var _circle;
    if (!this.circles[id]) {
        //new element
        _circle = this.createSvgDom("circle", parent ? parent : this.svg);
        _circle.setAttribute("cx", x);
        _circle.setAttribute("cy", y);
        _circle.setAttribute("r", r);
        _circle.setAttribute("fill", color);
        this.circles[id] = _circle;
        return;
    }
    _circle = this.circles[id];
    _circle.setAttribute("cx", x);
    _circle.setAttribute("cy", y);
    _circle.setAttribute("r", r);
    _circle.setAttribute("fill", color);
}

SVGView.prototype.createOrUpdateLine = function (id, x1, y1, x2, y2, color, parent) {
    if (!this.lines) {
        this.lines = {};
    }
    var _line;
    if (!this.lines[id]) {
        //new element
        _line = this.createSvgDom("line", parent ? parent : this.svg);
        _line.setAttribute("x1", x1);
        _line.setAttribute("y1", x1);
        _line.setAttribute("x2", x2);
        _line.setAttribute("y2", y2);
        _line.style.stroke = color ? color : "gray";
        _line.style.strokeWidth = 1;
        return;
    }
    _line = this.lines[id];
    _line.setAttribute("x1", x1);
    _line.setAttribute("y1", x1);
    _line.setAttribute("x2", x2);
    _line.setAttribute("y2", y2);
    _line.style.stroke = color ? color : "gray";
    _line.style.strokeWidth = 1;
}

SVGView.prototype.initEvts = function () {
    if (!this.svg || this.svg.onmouseover) { return };
    this.mouseMoveHandler = new utils.evtWrapper(this);
    var _mouse = utils.captureMouse(this.svg.parentNode);
    var _mouseDown;
    var that = this;
    var _pNode = this.svg;
    
    _pNode.addEventListener("mousemove", function () {
        if (_mouseDown) {
            that.mouseMoveHandler.notify(_mouse);
        }
    }, false);

    //挂事件
    _pNode.addEventListener("mousedown", function () {
        _mouseDown = true;
    }, false);

    _pNode.addEventListener("mouseup", function () { _mouseDown = false; }, false);
}

SVGView.prototype.attachEvt = function (func) {
    this.mouseMoveHandler.attach(func);
}

SVGView.prototype.updateCircles = function (id) {
    //reappend the current circles
    if (!this.circles) {
        return;
    }
    var _dom = this.circles[id];
    if (_dom) {
        _dom.parentNode.appendChild(_dom);
    }
}


SVGView.prototype.setVisibility = function (id, tOrf) {
    var _dom = this.circles[id];
    if (!_dom) {
        throw "element not found"
    }
    _dom.style.display = tOrf ? "" : "none";
}