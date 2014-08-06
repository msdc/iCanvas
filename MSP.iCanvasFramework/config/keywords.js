var _winonload = window.onload;

window.onload = function () {
    if (_winonload) {
        _winonload.apply(this);
    }

    var iCanvasInstance = new canvasWrapper("c1");
    (function () {
        var positionList = {
            0: { x: 0, y: 0, w: 4, h: 2, c: "rgb(130,193,202)", t: "" }
        , 1: { x: 4, y: 0, w: 2, h: 2, c: "rgb(169,194,148)", t: "" }
        , 2: { x: 6, y: 0, w: 3, h: 1, c: "rgb(217,146,114)", t: "oa" }
        , 3: { x: 6, y: 1, w: 3, h: 1, c: "rgb(236,162,153)", t: "html5" }
        , 4: { x: 0, y: 2, w: 2, h: 1, c: "rgb(169,194,148)", t: "" }
        , 5: { x: 2, y: 2, w: 2, h: 1, c: "rgb(231,169,111)", t: "sharepoint" }
        , 6: { x: 4, y: 2, w: 2, h: 1, c: "rgb(197,200,196)", t: "" }
        , 7: { x: 6, y: 2, w: 3, h: 1, c: "rgb(154,184,182)", t: "ux" }
        , lenUnit: 50
        , imgLenUnit: 70
        , border: 1
        }

        var blocks = [];
        var _selected, _chosen;
        var bigBack = iCanvasInstance.addBanner(0, 0, 460, 154, "white");

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
                    });
                })(curItem.x * unitLen + (curItem.x + 1) * border, dy, dw, dh, imgX, imgY, imgW, imgH);
                var temp = iCanvasInstance.addButton(dx, dy, dw, dh, curItem.t, curItem.c, bigBack)
                blocks.push(temp);

                var renderHandlers = temp._renderHandler.getHandlers();
                temp._renderHandler.clear();
                var _basicRender = function (item) {
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
            ani1.logChanges(ci, { sx: curItem.x * unitLen + curItem.x * border }, (blocks.length - 1 - i) * 10, 1);
        }
        ani1.active();
        iCanvasInstance.autoStart();

    })();
}



