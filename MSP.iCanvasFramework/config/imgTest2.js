var odcCtrl = function () {
    //put private content here
    var _wrapper, _base, _baseType;

    return {
        bindiCanvasInstance: function (iCanvas) {
            if (!iCanvas instanceof canvasWrapper) {
                throw ("iCanvas instance required");
            }
            _wrapper = iCanvas;
            _base = _wrapper.getBaseCtrlObj();
            _baseType = _base.constructor;
            return this;

        }
        , applyImgBtn: function () {
            if (!_wrapper || !_base) {
                throw ("need to bind an iCanvas instance first");
            }

            var imgBtn = function (wrapper, x, y, w, h, text, color, img, sx, sy, sw, sh) {
                _baseType.apply(this, arguments);
                this.backColor = color;
                this.img = img;
                this.imgRect = {
                    sx: sx
                    , sy: sy
                    , sw: sw
                    , sh: sh
                };

                var that = this;
                this.ex = function () {
                    return that.sx + that.w;
                }

                this.addRenderHandler(function () {
                    this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.backColor);
                    this.wrapper.drawImg(this.img, this.imgRect.sx, this.imgRect.sy, this.imgRect.sw, this.imgRect.sh);
                });
            }
            inheritPrototype(imgBtn, _baseType);
            _wrapper.drawImg = function (image, sx, sy, sw, sh) {
                var _c = this.ctx;
                _c.save();
                _c.drawImage(image, sx, sy, sw, sh);
                _c.restore();
            }
            _wrapper.addImgBtn = function (x, y, w, h, text, color, img, sx, sy, sw, sh, parentCtrl) {
                var _imgBtn = new imgBtn(this, x, y, w, h, text, color, img, sx, sy, sw, sh);
                _imgBtn.setZIndex(6);
                _imgBtn.setParent(parentCtrl);
                this.ctrlList.push(_imgBtn);
                return _imgBtn;
            }

            return this;
        }
        , applyInit: function () {
            if (!_wrapper || !_base) {
                throw ("need to bind an iCanvas instance first");
            }
            var RectStroke = function (wrapper, x, y, w, h, text, color, borderw) {
                _baseType.apply(this, arguments);
                this.borderWidth = borderw;
                this.borderColor = color;
                var that = this;
                this.ex = function () {
                    return that.sx + that.w;
                }
                this.addRenderHandler(function () {
                    this.wrapper.drawStrokeRect(this.sx, this.sy, this.w, this.h, this.borderWidth, this.borderColor);
                    this.wrapper.writeText(this.sx, this.sy, this.w, this.h, this.caption, this.fontColor, this.fontSize, this.family, this.weight);
                });
            }
            inheritPrototype(RectStroke, _baseType);
            _wrapper.addRectStroke = function (x, y, w, h, text, color, borderw, parentCtrl) {
                var _RectStroke = new RectStroke(this, x, y, w, h, text, color, borderw);
                _RectStroke.setZIndex(6);
                _RectStroke.setParent(parentCtrl);
                this.ctrlList.push(_RectStroke);
                return _RectStroke;
            }
            var circle = function (wrapper, x, y, r, color) {//cx, cy, r, color, startPosition, range, clockwise, lineWidth
                _baseType.apply(this, arguments);
                this.backColor = color;
                this.cx = x;
                this.cy = y;
                this.r = r;
                var that = this;
                this.addRenderHandler(function () {
                    this.wrapper.drawArc(this.cx, this.cy, this.r, this.backColor);
                });
            }
            inheritPrototype(circle, _baseType);
            _wrapper.addCircle = function (x, y, r, color,parentCtrl) {
                var _circle = new circle(this, x, y, r, color);
                _circle.setZIndex(7);
                _circle.setParent(parentCtrl);
                this.ctrlList.push(_circle);
                return _circle;
            }
            var circleStroke = function (wrapper, x, y, r, color,lineWidth) {//cx, cy, r, color, startPosition, range, clockwise, lineWidth
                _baseType.apply(this, arguments);
                this.borderColor = color;
                this.lineWidth = lineWidth;
                this.cx = x;
                this.cy = y;
                this.r = r;
                var that = this;
                this.addRenderHandler(function () {
                    this.wrapper.drawArcStroke(this.cx, this.cy, this.r, this.lineWidth,this.borderColor);
                });
            }
            inheritPrototype(circleStroke, _baseType);
            _wrapper.addcircleStroke = function (x, y, r, color,lineWidth, parentCtrl) {
                var _circleStroke = new circleStroke(this, x, y, r, color, lineWidth);
                _circleStroke.setZIndex(7);
                _circleStroke.setParent(parentCtrl);
                this.ctrlList.push(_circleStroke);
                return _circleStroke;
            }
            //telephone contrl
            var phone = function (wrapper, x, y, w, h, outcolor, innercolor) {
                _baseType.apply(this, arguments);
                this.backColor = outcolor ? outcolor : "#7fb546";
                this.topColor = innercolor ? innercolor : "#ffffff";
                var that = this;
                this.ex = function () {
                    return that.sx + that.w;
                }
                this.ey = function () {
                    return that.sy + that.h;
                }
                this.topRect = {
                    x: this.sx + this.w / 5,
                    y: this.sy + this.h / 8,
                    w: this.w / 5 * 3,
                    h: this.h / 8 * 5,
                    color:this.topColor
                }
                this.topCircle = {
                    x: this.sx + this.w / 2,
                    y: this.sy + this.h / 8 * 7,
                    r: this.w / 9,
                    color:this.topColor
                }
                this.addRenderHandler(function () {
                    this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, this.backColor);
                    this.wrapper.drawRect(this.topRect.x, this.topRect.y, this.topRect.w, this.topRect.h, this.topRect.color);
                    this.wrapper.drawArc(this.topCircle.x, this.topCircle.y, this.topCircle.r, this.topCircle.color);
                });
            }
            inheritPrototype(phone, _baseType);
            _wrapper.addPhone = function (x, y, w, h, outcolor, innercolor, parentCtrl) {
                var _phone = new phone(this, x, y, w, h, outcolor, innercolor);
                _phone.setZIndex(7);
                _phone.setParent(parentCtrl);
                this.ctrlList.push(_phone);
                return _phone;
            }

            //list contrl
            var listInt = function (wrapper, x, y, w, h, img, text, icontag) {
                _baseType.apply(this, arguments);
                this.img = img;
                this.imgRect = {
                    x: this.sx + this.w / 20,
                    y: this.sy + this.w / 20,
                    w: this.w / 5,
                    h: this.w / 5
                }
                this.fontSize = "12";
                this.family = "Arial";
                this.weight = "200";
                this.text = {
                    x: this.sx + this.w / 5,
                    y: this.sy + this.h / 3,
                    w: this.w / 2,
                    h: this.h / 3,
                    caption: text,
                    fontColor: "#686173",
                };

                this.line = {
                    x: this.sx,
                    y: this.sy + h,
                    w: this.w,
                    h: 1,
                    color:"#cccccc"
                }
                this.tag = icontag ? icontag : "phone";
                var that = this;
                this.ex = function () {
                    return that.sx + that.w;
                }
                this.addRenderHandler(function () {
                    //draw img
                    this.wrapper.drawImg(this.img, this.imgRect.x, this.imgRect.y, this.imgRect.w, this.imgRect.h);
                    //draw text
                    this.wrapper.writeText(this.text.x, this.text.y, this.text.w, this.text.h, this.text.caption, this.text.fontColor, this.fontSize, this.family, this.weight);
                    var px, py, pw, ph, pback, ptoback, cx, cy, cr, ccolor, bowidth;
                    //draw phone or circle
                    if (this.tag == "phone") {
                        px = this.sx + w / 7 * 6;
                        py = this.sy + h / 20 * 7;
                        pw = this.w / 20;
                        ph = this.h / 50 * 13;
                        pback = "#7fb546";
                        ptoback = "#ffffff";
                        this.topRect = {
                            x: px + pw / 5,
                            y: py + ph / 8,
                            w: pw / 5 * 3,
                            h: ph / 8 * 5,
                            color: ptoback
                        }
                        this.topCircle = {
                            x: px + pw / 2,
                            y: py + ph / 8 * 7,
                            r: pw / 9,
                            color: ptoback
                        }
                        this.wrapper.drawRect(px, py, pw, ph, pback);
                        this.wrapper.drawRect(this.topRect.x, this.topRect.y, this.topRect.w, this.topRect.h, this.topRect.color);
                        this.wrapper.drawArc(this.topCircle.x, this.topCircle.y, this.topCircle.r, this.topCircle.color);
                        
                    } else if (this.tag == "circle") {
                        cx = this.sx + w / 25 * 22;
                        cy = this.sy + h / 6 * 3;
                        cr = w / 40;
                        ccolor = "#cccccc";
                        bowidth = w / 250 * 2;
                        this.wrapper.drawArcStroke(cx, cy, cr, bowidth, ccolor);
                    }
                    
                    
                    //draw line
                    this.wrapper.drawRect(this.line.x, this.line.y, this.line.w, this.line.h, this.line.color);
                    
                });
            }
            inheritPrototype(listInt, _baseType);
            _wrapper.addList = function (x, y, w, h, img, text,icontag, parentCtrl) {
                var _listInt = new listInt(this, x, y, w, h, img, text,icontag);
                _listInt.setZIndex(7);
                _listInt.setParent(parentCtrl);
                this.ctrlList.push(_listInt);
                return _listInt;
            }
            return this;
        }
   }


}();

var _winonload = window.onload;

window.onload = function () {
    if (_winonload) {
        _winonload.apply(this);
    }

    var iCanvasInstance = new canvasWrapper("c1");
   
    var bigBack = iCanvasInstance.addBanner(0, 0, 711, 500, "white");
    (function () {
        odcCtrl.bindiCanvasInstance(iCanvasInstance).applyImgBtn();
        odcCtrl.bindiCanvasInstance(iCanvasInstance).applyInit();

        //draw the outside
        var lineKung = iCanvasInstance.addRectStroke(10.3, 10.3, 188, 244, "", "#ccc", 1, bigBack);//pointlist, color, r, parentCtrl

        //draw the title caption
        var titlebg = iCanvasInstance.addButton(10, 11, 188, 30, "", "#666", bigBack);
        var titlecir = iCanvasInstance.addCircle(25, 25, 4, "#7fb546", bigBack);
        var rowlable = iCanvasInstance.addRowLable(26, 10, 80, 30, "#fff", "Arial", bigBack);
        var rowlableText = rowlable.addText(15, "Online Now", "#fff", 12, "Arial", "700", "left");
        var toSmall = iCanvasInstance.addLine([[172, 27], [185, 27]], "#fff", 0, bigBack);//pointlist, color, r, parentCtrl

        //draw search for people
        var rowlable1 = iCanvasInstance.addRowLable(10, 40, 80, 30, "#686173", "Arial", bigBack);
        var rowlableText1 = rowlable1.addText(15, "Search for People", "#686173", 12, "Arial", "100", "left");
        var searchCir = iCanvasInstance.addcircleStroke(179, 52, 5, "#e7e7e7", 2, bigBack);
        var line1 = iCanvasInstance.addLine([[167, 62], [175, 55]], "#e7e7e7", 0, bigBack);
        var line2 = iCanvasInstance.addBanner(10, 70, 188, 2, "#dddddd", bigBack);
        //draw people title
        var peobg = iCanvasInstance.addButton(11, 71, 187, 30, "", "#e8e8e8", bigBack);
        var rowlable2 = iCanvasInstance.addRowLable(10, 71, 80, 30, "#686173", "Arial", bigBack);
        var rowlableText2 = rowlable2.addText(15, "People", "#686173", 12, "Arial", "100", "left");

        //draw list one
        var img1 = new Image();
        img1.src = "/img/img1.jpg";
        img1.onload = function () {
            var img1a = iCanvasInstance.addList(10, 100.1, 188, 56, img1, "Lenny Kim", "phone", bigBack);
            img1a.render();
        }
        
        //draw list two
        var img2 = new Image();
        img2.src = "/img/img2.jpg";
        img2.onload = function () {
            var img2a = iCanvasInstance.addList(10, 158.1, 188, 56, img2, "Lenny Kim", "circle", bigBack);
            img2a.render();
        }

        //draw the dialog
        var dialog = iCanvasInstance.addRectStroke(208.3, 54.3, 260, 200, "", "#ccc", 1, bigBack);

        //draw title
        var titlebg1 = iCanvasInstance.addButton(208, 54, 260, 30, "", "#666", bigBack);
        var phone = iCanvasInstance.addPhone(218, 62, 10, 15, "#7fb546", "#666", bigBack);//function (x, y, w, h, outcolor, innercolor, parentCtrl)
        var rowlable5 = iCanvasInstance.addRowLable(225, 54, 80, 30, "#fff", "Arial", bigBack);
        var rowlableText5 = rowlable5.addText(15, "Joyce Hon", "#fff", 12, "Arial", "700", "left");
        var toSmall1 = iCanvasInstance.addLine([[422, 73], [435, 73]], "#fff", 0, bigBack);
        var del1 = iCanvasInstance.addLine([[445, 74], [456, 64]], "#fff", 1, bigBack);
        var del2 = iCanvasInstance.addLine([[445, 64], [456, 74]], "#fff", 1, bigBack);

        //draw add people
        var rowlable6 = iCanvasInstance.addRowLable(208, 84, 80, 30, "#686173", "Arial", bigBack);
        var rowlableText6 = rowlable6.addText(15, "Add more people?", "#686173", 12, "Arial", "200", "left");
        var line4 = iCanvasInstance.addBanner(209,114,260,1, "#ccc", bigBack);
        var line6 = iCanvasInstance.addBanner(209,210,260,1, "#ccc", bigBack);
        var rowlable7 = iCanvasInstance.addRowLable(208, 210, 80, 30, "#686173", "Arial", bigBack);
        var rowlableText7 = rowlable7.addText(15, "Send a message...", "#686173", 10, "Arial", "200", "left");

        
        

    })();


    


    //iCanvasInstance.autoStart();

    iCanvasInstance.render();
}



