/// <reference path="../framework/iCanvas_v1_1_1.js" />
(function () {
    var _cvsWrapper, _baseCtrl, _legend;
    _cvsWrapper = new canvasWrapper();
    _baseCtrl = _cvsWrapper.getBaseCtrlObj().constructor;
    _legend = function (wrapper,x, y, w, h, color, text) {
        _baseCtrl.call(this, wrapper,x, y, w, h, color, text);
        this.color = color ? color : "red";
        this.caption = text ? text : "?";
        this.fontColor = "red";
        this.fontSize = "12";
        this.weight = "200";
        this.family = "Arial";
        this.text = {
            sx: this.sx + this.w,
            sy: this.sy
        }
        this.addRenderHandler(function () {
            this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.color);
            this.wrapper.writeText(this.text.sx, this.text.sy, 20, this.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);
        });
        this.addRepaintHandler(function () {

        });
    }
    canvasWrapper.prototype.addLegend = function (x, y, w, h, color, text, parentCtrl) {
        var _leg = new _legend(this, x, y, w, h, color, text);
        _leg.setParent(parentCtrl);
        this.ctrlList.push(_leg);
        return _leg;
    };

    inheritPrototype(_legend, _baseCtrl);
    _legend.prototype.applyFont = function (fontColor, size, family, weight) {
        this.fontColor = fontColor;
        this.fontSize = size;
        this.family = family;
        this.weight = weight;

    };
    _legend.prototype.setBgColor = function (backColor) {
        this.color = backColor;
    }
})();

var LegendList = function (params) {
    var _defaults = {
        cvsId: "cvs",
        sx: 10,
        sy: 10,
        w: 100,
        h: 25,
        color: "red",
        text: "1"
    }
    for (var attr in params) {
        _defaults[attr] = params[attr];
    }
    this.data = [];
    this.wrapper = new canvasWrapper(_defaults.cvsId);
    this._configHandler = new evtWrapper(this);
    this.addConfigHandler(function () {

        var _bigBack = this.wrapper.addBanner(_defaults.sx, _defaults.sy, _defaults.w, _defaults.h, "gray");

        for (var _item in this.data) {
            var _legendctrl = this.wrapper.addLegend(_defaults.sx, _defaults.sy, _defaults.w, _defaults.h, _defaults.color, _defaults.text, this.wrapper);
            _legendctrl.color = this.data[_item].color;
            _legendctrl.fontColor = this.data[_item].color;
            _legendctrl.caption = this.data[_item].text;
            _legendctrl.sx = parseFloat(this.data[_item].x) + _defaults.sx;
            _legendctrl.sy = parseFloat(this.data[_item].y )+ _defaults.sy;
            _legendctrl.w = parseFloat(this.data[_item].w);
            _legendctrl.h = parseFloat(this.data[_item].h);

            _legendctrl.onclick = function () {
                this.color = "black";

                that.render();
                //this.repaint();
            }
        }
    });


}
LegendList.prototype.addConfigHandler = function (func) {
    if (typeof func == "function") {
        this._configHandler.attach(func);
    }
}
LegendList.prototype.render = function () {
    this.wrapper.render();
}
LegendList.prototype.setData = function (d) {
    this.data = d;
}
LegendList.prototype.runcofig = function () {
    this._configHandler.notify();
}

window.onload = function () {    
    var list = new LegendList({
        cvsId: "c1",
        sx: 10,
        sy: 10,
        w: 1000,
        h: 250,
        color: "red",
        text: "?"
    });
    list.setData([{ "color": "red", "text": "?", "w": "100", "h": "20", "x": "0", "y": "0" },
        { "color": "green", "text": "?", "w": "100", "h": "20", "x": "0", "y": "30" },
    { "color": "blue", "text": "?", "w": "100", "h": "20", "x": "0", "y": "60" }]);
    list.runcofig();
    list.render();

}