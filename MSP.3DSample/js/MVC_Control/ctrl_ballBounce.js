var bounceBallCtrl = function (model, view) {
    this.model = model;
    this.view = view;
}


bounceBallCtrl.prototype.render = function () {
    this.view.createOrChangeCircle(0, this.model.display.x, this.model.display.y, this.model.r*this.model.scale, this.model.color);
    this.view.setVisibility(0, this.model.isVisiable);
}


bounceBallCtrl.prototype.run = function () {
    this.model.move();
}

bounceBallCtrl.prototype.rotateY = function (angle) {
    this.model.rotateY(angle);
}