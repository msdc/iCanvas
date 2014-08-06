var ballCtrl = function (model, view) {
    this.ball = model;
    this.view = view;
}

ballCtrl.prototype.render = function () {
    this.view.createOrUpdateCircle(this.ball.id, this.ball.display.x, this.ball.display.y, this.ball.r * this.ball.scale, this.ball.color);
    this.view.setVisibility(this.ball.id, this.ball.isVisiable);
}


ballCtrl.prototype.run = function () {
    this.ball.move();
}

ballCtrl.prototype.rotateY = function (angle) {
    this.ball.rotateY(angle);
}

var BounceBallCtrl = function (counter) {
    this.ctrls = [];
    var view = new SVGView("svg");
    for (var i = 0; i < counter; i++) {
        var ball = new ball3D(this.ENV);
        var ctrl = new ballCtrl(ball, view);
        this.ctrls.push(ctrl);
    }
    var that = this;
    view.attachEvt(function (mouse) {
        var angle = (mouse.x - that.ENV.vX) * 0.001;
        for (var i = 0, ci; ci = that.ctrls[i]; i++) {
            ci.rotateY(angle);
        }
        that.sort();
        that.show();
    });
}



BounceBallCtrl.prototype = {
        sort: function () {
            this.ctrls = this.ctrls.sort(function (x, y) {
                if (x.ball.position.z > y.ball.position.z) {
                    return -1;
                }
                else {
                    return 1;
                }
            });
        }
        , show: function () {
            for (var i = 0, ci; ci = this.ctrls[i]; i++) {
                ci.view.updateCircles(ci.ball.id);
            }

            for (var i = 0, ci; ci = this.ctrls[i]; i++) {
                ci.render();
            }
        }
        , run: function () {
            for (var i = 0, ci; ci = this.ctrls[i]; i++) {
                ci.run();
                for (var j = i + 1, bi; bi = this.ctrls[j]; j++) {
                    var _small = Math.min(ci.ball.id, bi.ball.id);
                    var _big = Math.max(ci.ball.id, bi.ball.id);

                    if (ci.ball.collisionDetecting(bi.ball)) {
                        var _temp = ci.ball.velocity;
                        ci.ball.velocity = bi.ball.velocity;
                        bi.ball.velocity = _temp;
                    }
                }
            }

            this.sort();
            this.show();


            var _args = arguments;
            var that = this;
            this.timer = window.requestAnimationFrame(function () {
                _args.callee.apply(that);
            });
        }

        , stop: function () {
            window.cancelAnimationFrame(this.timer);
        }
}

BounceBallCtrl.prototype.ENV = {
    focus: 250
        , minZ: -250
        , vX: 400
        , vY: 300
        , g: 0.5
        , r: 20
        , bounce: -0.9
        , front: -100
        , back: 100
        , top: -200
        , bottom: 200
        , left: -200
        , right: 200
        , bPoints: function () {
            var _config = this;
            return {
                ltf: new vector3(_config.left, _config.top, _config.front)
                , rtf: new vector3(_config.right, _config.top, _config.front)
                , lbf: new vector3(_config.left, _config.bottom, _config.front)
                , rbf: new vector3(_config.right, _config.bottom, _config.front)
                , ltb: new vector3(_config.left, _config.top, _config.back)
                , rtb: new vector3(_config.right, _config.top, _config.back)
                , lbb: new vector3(_config.left, _config.bottom, _config.back)
                , rbb: new vector3(_config.right, _config.bottom, _config.back)
            }
        }()
        , perspectiveSinglePoint: function (point) {
            var _scale = this.focus / (this.focus + point.z);
            return new vector3(this.vX + point.x * _scale, this.vY + point.y * _scale, this.z);
        }
        , perspectiveBoundaryPoints: function () {
            for (var i in this.bPoints) {
                var point = this.bPoints[i];
                point.display = this.perspectiveSinglePoint(point);
            }
        }
}
