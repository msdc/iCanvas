var ctrl = function (model, view) {
    this.model = model;
    this.view = view;
}

ctrl.prototype.appendDiv = function (type) {
    this.view.appendDiv({ className: type });
}

ctrl.prototype.appendPath = function () {
    this.appendDiv("path");
}

ctrl.prototype.appendRoom = function () {
    this.appendDiv("room");
}

ctrl.prototype.appendDoor = function () {
    this.appendDiv("door");
}

ctrl.prototype.processMap = function () {
    var _map = this.model.map;
    for (var i = 0, ci; ci = _map[i]; i++) {
        for (var j = 0, bi; bi = ci[j]; j++) {
            switch (bi) {
                case 1:
                    this.appendPath();
                    break;
                case 2:
                    this.appendRoom();
                    break;
                default:
                    this.appendDoor();
                    break;
            }
        }
    }
}

ctrl.prototype.render = function () {
    this.view.reset();
    this.processMap();
    this.view.update();
}