var ball3dCtrl = function (model, view) {
    this.model = model;
    this.view = view;
    this.init();
}

ball3dCtrl.prototype.Default = {
    r:40
}

ball3dCtrl.prototype.render = function () {
    this.view.createOrChangeCircle(0, this.model.position.x, this.model.position.y, this.Default.r * this.model.scale,this.model.color);
    this.view.setVisibility(0, this.model.isVisiable);
}

ball3dCtrl.prototype.init = function () {
    var that = this;
    window.addEventListener("keydown", function (event) {
        if (event.keyCode === 38) {
            that.model.move(5);
        }
        else if (event.keyCode === 40) {
            that.model.move(-5);
        }

    }, false);
}

ball3dCtrl.prototype.run = function () {
    this.model.move(-5);
    if (!this.model.isVisiable) {
        this.model.applyPosition(utils.getRandom(30, 780), utils.getRandom(30, 580), 300);
        this.model.applyZSpeed();
        this.model.applyColor();
    }
}