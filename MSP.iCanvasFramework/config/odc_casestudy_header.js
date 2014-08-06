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
                    this.wrapper.drawImg(this.img, this.imgRect.sx, this.imgRect.sy, this.imgRect.sw, this.imgRect.sh, this.sx, this.sy, this.w, this.h);
                });
            }
            inheritPrototype(imgBtn, _baseType);
            _wrapper.drawImg = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
                var _c = this.ctx;
                _c.save();
                _c.translate(dx, dy);
                _c.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
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
    }

}();

var _winonload = window.onload;

window.onload = function () {
    if (_winonload) {
        _winonload.apply(this);
    }

    var iCanvasInstance = new canvasWrapper("c1");
    var bigBack = iCanvasInstance.addBanner(0, 0, 711, 143, "white");

    (function () {
        odcCtrl.bindiCanvasInstance(iCanvasInstance).applyImgBtn();

        var _img = new Image();
        _img.src = "/img/icon0916.PNG";

        var positionList = {
            0: { x: 0, y: 0, w: 1, h: 1, c: "rgb(130,193,202)", t: "" }
            , 1: { x: 1, y: 0, w: 1, h: 1, c: "rgb(169,194,148)", t: "" }
            , 2: { x: 0, y: 1, w: 2, h: 1, c: "rgb(217,146,114)", t: "oa" }
            , 3: { x: 2, y: 0, w: 2, h: 2, c: "rgb(236,162,153)", t: "html5" }
            , 4: { x: 4, y: 0, w: 1, h: 2, c: "rgb(169,194,148)", t: "" }
            , 5: { x: 5, y: 0, w: 2, h: 1, c: "rgb(231,169,111)", t: "sharepoint" }
            , 6: { x: 5, y: 1, w: 1, h: 1, c: "rgb(197,200,196)", t: "" }
            , 7: { x: 6, y: 1, w: 1, h: 1, c: "rgb(154,184,182)", t: "ux" }
            , 8: { x: 7, y: 0, w: 2, h: 2, c: "rgb(129,198,226)", t: "mobile" }
            , 9: { x: 9, y: 0, w: 1, h: 1, c: "rgb(236,162,153)", t: "bi" }
            , 10: { x: 9, y: 1, w: 1, h: 1, c: "rgb(231,169,111)", t: "" }
            , lenUnit: 70
            , imgLenUnit: 70
            , border: 1
        }

        var blocks = [];
        var _selected,_chosen;
        var bigBack = iCanvasInstance.addBanner(0, 0, 711, 143, "white");
      
        _img.onload = function () {
            for (var i in positionList) {
                if (!isNaN(i)) {
                    var curItem = positionList[i];
                    var unitLen = positionList["lenUnit"];
                    var imgunitLen = positionList["imgLenUnit"];
                    var border = positionList["border"]
                    var dx = border;
                    var dy = curItem.y * unitLen + (curItem.y + 1) * border;
                    var dw = curItem.w * unitLen + (curItem.w - 1) * border;
                    var dh = curItem.h * unitLen + (curItem.h - 1) * border;

                    var imgX = curItem.x * imgunitLen + (curItem.x + 1) * border;
                    var imgY = curItem.y * imgunitLen + (curItem.y + 1) * border;
                    var imgW = curItem.w * imgunitLen + (curItem.w - 1) * border;
                    var imgH = curItem.h * imgunitLen + (curItem.h - 1) * border;

                    (function (_dx, _dy, _dw, _dh, _imgX, _imgY, _imgW, _imgH) {
                        bigBack.addRenderHandler(function () {
                            this.wrapper.drawRect(_dx, _dy, _dw, _dh, "rgba(150,150,150,0.3)");
                            this.wrapper.drawImg(_img, _imgX, _imgY, _imgW, _imgH, _dx, _dy, _dw, _dh);
                        });
                    })(curItem.x * unitLen + (curItem.x + 1) * border, dy, dw, dh, imgX, imgY, imgW, imgH);
                    var temp = iCanvasInstance.addImgBtn(dx, dy, dw, dh, curItem.t, curItem.c, _img, imgX, imgY, imgW, imgH, bigBack)
                    blocks.push(temp);

                    var renderHandlers = temp._renderHandler.getHandlers();
                    temp._renderHandler.clear();
                    var _basicRender=function(item){
                        for (var i = 0, ci; ci = renderHandlers[i]; i++) {
                            ci.apply(item, arguments);
                        }
                    }

                    temp.addRenderHandler(function () {
                        _basicRender(this);
                        if (_chosen == this || _selected == this) {
                            return;
                        }
                        if ((_selected && _selected != this) || (_chosen && _chosen != this)) {
                            this.wrapper.drawRect(this.sx, this.sy, this.w, this.h, "rgba(0,0,0,.3)");
                        }
                    });
                }
            }

            var ani1 = iCanvasInstance.addAnimation(20);
            ani1.applyCtrl(bigBack);

            var _blockClickHandler = function () {
                if (this.caption == "") {
                    return;
                }

                if (_chosen == this) {
                    _chosen = undefined;
                    this.setZIndex(6);
                }
                else {
                    _chosen = this;
                    this.setZIndex(9);
                }
                _renderAll();
            }
            var _renderAll = function () {
                for (var i = 0, ci; ci = blocks[i]; i++) {
                        ci.render();
                }
            }
            var _blockMouseInHandler = function () {
                _selected = this;
                _renderAll();
            }
            var _blockMouseOutHandler = function () {
                if (_selected == this) { _selected = undefined };
                _renderAll();
            }

            iCanvasInstance.addMouseOutListener(function () {
                _selected = undefined
                _renderAll();
            });

            for (var i = 0, ci; ci = blocks[i]; i++) {
                ci.onclick(_blockClickHandler);
                ci.onmousein(_blockMouseInHandler);
                ci.onmouseout(_blockMouseOutHandler);

                var curItem = positionList[i];
                var unitLen = positionList["lenUnit"];
                var border = positionList["border"];
                ani1.logChanges(ci, { sx: curItem.x * unitLen + curItem.x * border}, (blocks.length - 1 - i) * 10, 2);
            }
            ani1.active();
            iCanvasInstance.autoStart();
            //iCanvasInstance.render();
        }
    })();
}



