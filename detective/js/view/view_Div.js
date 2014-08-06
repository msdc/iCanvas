var view = function (id) {
    this.applyContainer(id);
}

view.prototype.applyContainer = function (id) {
    this.container = typeof id == "string" ? document.getElementById(id) : id;
}

view.prototype.appendDiv = function (desp) {
    if (!this.divs) {
        this.divs = [];
    }
    var _div = document.createElement("DIV");
    for (var i in desp) {
        if (_div[i] != undefined) {
            _div[i] = desp[i];
        }
    }
    this.divs.push(_div);
}

view.prototype.update = function () {
    if (!this.divs || !this.container) { return; }
    for (var i = 0, ci; ci = this.divs[i]; i++) {
        this.container.appendChild(ci);
    }
    delete this.divs;
}

view.prototype.reset = function () {
    if (!this.container) { return; }
    this.container.innerHTML = "";
    delete this.divs;
}
