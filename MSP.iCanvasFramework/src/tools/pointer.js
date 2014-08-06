define(function (require) {

    var pointer = function (sx, sy) {
        this.sx = sx == undefined ? 0 : sx;
        this.sy = sy == undefined ? 0 : sy;
        this.cx = this.sx;
        this.cy = this.sy;
        this.lineHeight = 0;
    }
    //pointer
    pointer.prototype.getChanges = function (ctrl) {
        var _result = ctrl.caculateSelf();
        return {
            x: _result.w + _result.l
            , y: _result.h + _result.t
        }
    }
    pointer.prototype.mx = function (ctrl) {
        var _dis = this.getChanges(ctrl);
        this.cx = this.cx + _dis.x;

        var _r = ctrl.caculateSelf();
        this.lineHeight = Math.max(this.lineHeight, _r.h + _r.t);
    }
    pointer.prototype.my = function (ctrl) {
        var _dis = this.getChanges(ctrl);
        this.cy = this.cy + _dis.y;
    }
    pointer.prototype.nextLine = function () {
        this.cx = this.sx;
        this.cy += this.lineHeight;
        this.lineHeight = 0;
    }
    pointer.prototype.mxy = function (ctrl) {
        var _dis = this.getChanges(ctrl);
        this.cx = this.cx + _dis.x;
        this.cy = this.cy + _dis.y;
    }
    pointer.prototype.reset = function () {
        this.cx = this.sx;
        this.cy = this.sy;
    }
    pointer.prototype.moveto = function (x, y) {
        this.cx = x;
        this.cy = y;
    }
    pointer.prototype.move = function (x, y) {
        this.cx += x;
        this.cy += y;
    }
    return pointer;

});