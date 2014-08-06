/// <reference path="../src/lib/sea-debug.js" />

seajs.config({
    paths: {
        "animation": "../src/animation",
        "tools": "../src/tools"
    },
    alias: {
        "iCanvas": "../framework/iCanvas_v1_2_1.js",
        "ctrls": "../ctrls/ctrls.js",
        "timer": "tools/timer",
        "util": "tools/util",
        "animate": "animation/core"
    },
    preload: ["iCanvas", "ctrls"]

});
define(function (require) {
    require("iCanvas");
    var timer = require("timer"),
          util = require("util"),
          animate = require("animate");
    var timeObj = new timer();

    require.async("ctrls", function () {


        var wrapper = iCanvas.createWrapper("container");

        //establish ctrl instances
        var _back = iCanvas.ctrls.rect(wrapper, 100, 100, 0, 0, "white");
        var _header = iCanvas.ctrls.rect(wrapper, 100, 10, 0, 0, "#f0f0f0");
        var _switchLine = iCanvas.ctrls.rect(wrapper, 100, 6, 0, 0, "#7e7e7e");
        var _floatLayer = iCanvas.ctrls.rect(wrapper, 30, "100+1px", 0, 0, "white");
        var _btnLeft = iCanvas.ctrls.rect(wrapper, 30, 100, 0, 0, "transparent");
        var _btnRight = iCanvas.ctrls.rect(wrapper, 30, 100, 0, 0, "transparent");
        var _qTxt = iCanvas.ctrls.txt(wrapper, 50, 50, "Quarterly");
        var _yTxt = iCanvas.ctrls.txt(wrapper, 50, 50, "Year To Date");

        var _axisBack = iCanvas.ctrls.rect(wrapper, 100, 84, 0, 0, "white");
        var _axis = new axis(wrapper, 100, 90, 0, 10, "yellow");
        _axis.applyRange(24, 0);
        _axis.setLineCount(4);
        _axis.applyBoundary(6, 95, 5, 95, 6, 78);
        _axis.applyXLabs("Q113");
        _axis.applyXLabs("Q213");
        _axis.applyXLabs("Q313");
        _axis.applyXLabs("Q413");

        var _bars = new bars(wrapper, 100, 100, 0, 0);
        _bars.applyAxis(_axis);
        _bars.applyColors("#00b193", "#008e76");
        _bars.applySingleValue("Q113", 0);
        _bars.applySingleValue("Q213", 0);
        _bars.applySingleValue("Q313", 0);
        _bars.applySingleValue("Q413", 0);


        var _line = new PathLine(wrapper, 100, 100, 0, 0, "#ffd800");
        _line.applyAxis(_axis);
        _line.applySingleValue("Q113", 0);
        _line.applySingleValue("Q213", 0);
        _line.applySingleValue("Q313", 0);
        _line.applySingleValue("Q413", 0);


        var ani = new animate({
            duration: 1000,
            easing: 'easeInOutElastic',
            from: { bar1: 0, bar2: 0, bar3: 0, bar4: 0 },
            to: { bar1: 16, bar2: 19, bar3: 15, bar4: 16, line1: 17, line2: 19, line3: 20, line4: 22 },
            onstep: function (d) {

                _bars.applySingleValue("Q113", d.bar1);
                _bars.applySingleValue("Q213", d.bar2);
                _bars.applySingleValue("Q313", d.bar3);
                _bars.applySingleValue("Q413", d.bar4);


            }


        });
        ani.start();
        ani.oncompleted(function () {
            ani1.start();
            ani2.start();
            ani3.start();
            ani4.start();
        })

        var ani1 = new animate({
            duration: 1000,
            from: {},
            to: { bar1: 16, bar2: 19, bar3: 15, bar4: 16, line1: 17, line2: 19, line3: 20, line4: 22 },
            delay: 100,
            easing: 'easeInOutElastic',
            onstep: function (d) {

                _line.applySingleValue("Q113", d.line1);
                //_bars.applySingleValue("Q113", d.bar1);

            }


        });
        //ani1.start();
        var ani2 = new animate({
            duration: 1000,
            from: {},
            to: { bar1: 16, bar2: 19, bar3: 15, bar4: 16, line1: 17, line2: 19, line3: 20, line4: 22 },
            delay: 250, easing: 'easeInOutElastic',
            onstep: function (d) {
                _line.applySingleValue("Q213", d.line2);
                //_bars.applySingleValue("Q213", d.bar2);

            }


        });
        // ani2.start();
        var ani3 = new animate({
            duration: 1000,
            from: {},
            to: { bar1: 16, bar2: 19, bar3: 15, bar4: 16, line1: 17, line2: 19, line3: 20, line4: 22 },
            delay: 400, easing: 'easeInOutElastic',
            onstep: function (d) {


                _line.applySingleValue("Q313", d.line3);
                // _bars.applySingleValue("Q313", d.bar3);

            }


        });
        // ani3.start();
        var ani4 = new animate({
            duration: 1000,
            from: {},
            to: { bar1: 16, bar2: 19, bar3: 15, bar4: 16, line1: 17, line2: 19, line3: 20, line4: 22 },
            delay: 550, easing: 'easeInOutElastic',
            onstep: function (d) {

                _line.applySingleValue("Q413", d.line4);

                // _bars.applySingleValue("Q413", d.bar4);
            }


        });

        var ani5 = new animate({
            duration: 500,
            from: { w: 420, h: 336 },
            to: { w: 520, h: 436 },
            delay: 550,
            onstep: function (d) {

                wrapper.changeWH(d.w + "px", d.h + "px");

                // _bars.applySingleValue("Q413", d.bar4);
            }


        });
        ani5.start();

        var isZoomOut = true;

        //easeInOutElastic  

        timeObj.start(function () {

            ani.frame();
            ani1.frame();
            ani2.frame();
            ani3.frame();
            ani4.frame();
            ani5.frame();

            wrapper.render();

        });



        var _pushPin = new PushPin(wrapper, 10, 80, 90.4, 10, "transparent");
        _pushPin.applyBorder("#7e7e7e", 1.1);

        //set basic properties
        _floatLayer.setPosition("absolute");
        _btnRight.setFloat("left");
        _yTxt.applyFontColor("white");

        _header.appendChild(_pushPin);

        //build ctrl hierachies
        _back.appendChild(_header);
        _back.appendChild(_switchLine);
        _back.appendChild(_axisBack);
        _axisBack.appendChild(_axis);
        _switchLine.appendChild(_floatLayer);
        _switchLine.appendChild(_btnLeft);
        _switchLine.appendChild(_btnRight);
        _btnLeft.appendChild(_qTxt);
        _btnRight.appendChild(_yTxt);

        wrapper.initRoot(_back);
        wrapper.render();

        document.getElementById("zin").onclick = function () {
            wrapper.changeWH(-5, -5);
            wrapper.render();
        }

        document.getElementById("zout").onclick = function () {
            wrapper.changeWH(5, 5);

            wrapper.render();

        }
        var tween1 = document.getElementById("tween1");
        var tween2 = document.getElementById("tween2");
        document.getElementById("run").onclick = function () {
            isZoomOut = false;
            _bars.applySingleValue("Q113", 0);
            _bars.applySingleValue("Q213", 0);
            _bars.applySingleValue("Q313", 0);
            _bars.applySingleValue("Q413", 0);
            _line.applySingleValue("Q113", 0);
            _line.applySingleValue("Q213", 0);
            _line.applySingleValue("Q313", 0);
            _line.applySingleValue("Q413", 0);
            var easing = tween1.options[tween1.selectedIndex].text + tween2.options[tween2.selectedIndex].text;
            ani.easing(easing);
            ani1.easing(easing);
            ani2.easing(easing);
            ani3.easing(easing);
            ani4.easing(easing);
            ani.start();

        }





    });

    

});





