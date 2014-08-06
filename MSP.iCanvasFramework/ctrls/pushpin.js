/*import framwork v1.2.1 in advance*/
var pushPin = iCanvas.createNewCtrl(function () {
    this.type = "pushPin";
    var _Cons = iCanvas.getCONS();
    this.setPosition(_Cons.POSITION.ABSOLUTE);
    this.GROUP = iCanvas.ctrls.gxy(this.wrapper, 100, 100, 0, 0,-45);
    this.GROUP.setPosition(_Cons.POSITION.ABSOLUTE);
    this.appendChild(this.GROUP);
    this.onRender(
        function (x, y) {
            var _result = this.caculateSelf();
            var bigTriangle = {
                pointone: [ 30 , 25],
                pointtwo: [ 50 , 50],
                pointthree: [ 30 , 75]
            }
            var smallTriangle = {
                pointone: [ 50 , 50],
                pointtwo: [ 620 / 8 ,  500 / 16],
                pointthree: [ 620 / 8 , 1100 / 16]
            }
            if (this.GROUP.childNodes.length == 0) {
                var circle = iCanvas.ctrls.circle(this.wrapper, 100, 100, 0, 0, "transparent", this.bocolor, 1, { obj: this.GROUP, ctrl: "ctrl_gxy" });
                var rect = iCanvas.ctrls.rect(this.wrapper, 300/10, 25, 300/8, 300/8, this.bgcolor, { obj: this.GROUP, ctrl: "ctrl_gxy" });
                var triangle1 = iCanvas.ctrls.polygon(this.wrapper, 100, 100, 0, 0, this.bgcolor, [bigTriangle.pointone, bigTriangle.pointtwo, bigTriangle.pointthree], this.bgcolor, 1, "", { obj: this.GROUP, ctrl: "ctrl_gxy" });
                var triangle2 = iCanvas.ctrls.polygon(this.wrapper, 100, 100, 0, 0, this.bgcolor, [smallTriangle.pointone, smallTriangle.pointtwo, smallTriangle.pointthree], this.bgcolor, 1, "", { obj: this.GROUP, ctrl: "ctrl_gxy" });
                var line = iCanvas.ctrls.line(this.wrapper, 300 / 8, 5, 80 / 8, 50, this.bgcolor, this.delta, "", { obj: this.GROUP, ctrl: "ctrl_gxy" });
                this.GROUP.appendChild(circle);
                this.GROUP.appendChild(rect);
                this.GROUP.appendChild(triangle1);
                this.GROUP.appendChild(triangle2);
                this.GROUP.appendChild(line);
                rect.setPosition("absolute");
                triangle1.setPosition("absolute");
                triangle2.setPosition("absolute");
                line.setPosition("absolute");
                line.setDelta(0);
            }

        }
   );
});
pushPin.prototype.setBordercolor = function (color) {
    this.bocolor = color;
}
pushPin.prototype.setBgColor = function (color) {
    this.bgcolor = color;
}