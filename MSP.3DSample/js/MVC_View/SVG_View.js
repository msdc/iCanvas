var svgView = function (id) {
    this.acquireDom(id);
    this.doms = [];
    this.init();
}

svgView.prototype.Env = {}

svgView.prototype.init = function () {
    if (!this.svg || this.svg.onmouseover) { return };

    this.Env.mouseMoveHandler = new utils.evtWrapper(this);

    var _mouse = utils.captureMouse(this.svg.parentNode);
    var _mouseDown;
    var that = this;

    var _pNode = this.svg.parentNode;

    _pNode.addEventListener("mousemove", function () {
        if (_mouseDown) {
            that.Env.mouseMoveHandler.notify(_mouse);
        }
    }, false);


    //挂事件
    _pNode.addEventListener("mousedown", function () {
        _mouseDown = true;
    }, false);

    _pNode.addEventListener("mouseup", function () { _mouseDown = false; }, false);
}

svgView.prototype.attachEvt = function (func) {
    this.Env.mouseMoveHandler.attach(func);
}

svgView.prototype.acquireDom = function (id) {
    this.svg = document.getElementById(id);
    if (!this.svg) {
        throw "svg element not found";
    }
}

svgView.prototype.createSvgDom = function (key, parent) {
    var _dom = document.createElementNS('http://www.w3.org/2000/svg', key);
    parent.appendChild(_dom);
    return _dom
}

svgView.prototype.getElement = function (id) {
    var _dom;
    if (typeof id == "number") {
        _dom = this.doms[id];
    }
    else if (typeof id == "string") {
        _dom = document.getElementById(id);
    }
    else if (id instanceof Object) {
        _dom = id;
    }
    else {
        throw "invalid dom information";
    }

    return _dom;
}

svgView.prototype.setVisibility = function (id, tOrf) {
    var _dom = this.getElement(id);
    if (!_dom) {
        throw "element not found"
    }
    _dom.style.display = tOrf ? "" : "none";
}

svgView.prototype.createOrChangeCircle = function (id, x, y, r, color, parent) {
    var _dom = this.getElement(id);
    if (!_dom) {
        var _circle = this.createSvgDom("circle", parent ? parent : this.svg);
        _circle.setAttribute("cx", x);
        _circle.setAttribute("cy", y);
        _circle.setAttribute("r", r);
        _circle.setAttribute("fill", color);
        this.doms.push(_circle);
    }
    else {
        _dom.setAttribute("cx", x);
        _dom.setAttribute("cy", y);
        _dom.setAttribute("r", r);
        _dom.setAttribute("fill", color);
    }
}

svgView.prototype.updateDom = function (id) {
    var _dom = this.getElement(id);
    if (_dom) {
        _dom.parentNode.appendChild(_dom);
    }
}

svgView.prototype.createOrChangeLine = function (id, x1, y1, x2, y2, color, parent) {
    var _dom = this.getElement(id);

}


