(function (exports) {
    //Define common functions
    var tools = {
        isTouchEvent: function (e) {
            if (e.type.toString().indexOf("touch") >= 0) {
                return true;
            } else {
                if (e.pointerType && e.pointerType == e.MSPOINTER_TYPE_TOUCH) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        isSupportMSPointer: function () {
            return exports.navigator.msPointerEnabled;
        },
        extend: function () {
            var target = arguments[0] || {}, i = 1, length = arguments.length, source, name;
            for (; i < length; i++) {
                if ((source = arguments[i]) != null) {
                    for (name in source) {
                        target[name] = source[name];
                    }
                }
            }
            return target;
        },
        createCustomEvent: function (type, target, args) {
            var cEvent = document.createEvent('Event');
            cEvent.initEvent(type, true, true);
            for (var o in args) {
                cEvent[o] = args[o];
            }
            target.dispatchEvent(cEvent);
        },
        getType: function (obj) {

            var type = Object.prototype.toString.call(obj);
            return type.replace(/^\[object\s*/gi, "").replace(/\]$/, "").toLowerCase();

        }
    };
    ///Create a point object that stores event data
    var pointer = function (identifier, type, event, timeStamp) {
        this.screenX = event.screenX || 0;
        this.screenY = event.screenY || 0;
        this.pageX = event.pageX || 0;
        this.pageY = event.pageY || 0;
        this.clientX = event.clientX || 0;
        this.clientY = event.clientY || 0;
        this.tiltX = event.tiltX || 0;
        this.tiltY = event.tiltY || 0;
        this.timestamp = event.timeStamp || timeStamp;
        this.pointerType = type;
        this.identifier = identifier;
    };
    //Define the type of touch events 
    var eventType = {
        TOUCH_START: "start",
        TOUCH_MOVE: "move",
        TOUCH_END: "end",
        getTouchTypeByEvent: function (evt) {
            var type = evt.type;
            if (type.match(/(start|down)$/i)) {
                return this.TOUCH_START;
            } else if (type.match(/(move)$/i)) {
                return this.TOUCH_MOVE;
            } else if (type.match(/(up|end)/)) {
                return this.TOUCH_END;
            } else {
                return this.TOUCH_END;
            }
        }
    };
    var touchStart,
        touchMove,
        touchEnd,
        ptouchStart = "ptouchstart",
        ptouchMove = "ptouchmove",
        ptouchEnd = "ptouchend",
        ptouchClear = "ptouchclear";

    if (tools.isSupportMSPointer()) {
        touchStart = "MSPointerDown";
        touchMove = "MSPointerMove";
        touchEnd = "MSPointerUp";
    }
    else {
        touchStart = "touchstart";
        touchMove = "touchmove";
        touchEnd = "touchend";
    }
    //register gesture
    var gesture = function (selector, params) {
        var sType = tools.getType(selector);
        if (sType == "string") {
            this.sender = document.querySelector(selector);
        }
        else if (sType.indexOf("html") >= 0 || sType == "object") {
            this.sender = selector;
        }
        else {
            throw new Error("Parameters 'selector' isn't element object or string");
        }

        if (tools.isSupportMSPointer()) {
            this.sender.style.msTouchAction = "none";
        }
        var that = this, gestureCollection;
        var eventParam = {
            tap_duration: 200,
            swipe_duration: 750,
            swipe_horizontalDistance: 30,
            swipe_verticalDistance: 75,
            hold_duration: 700,
            tap_hold_horizontalDistance: 10,
            tap_hold_verticalDistance: 10,
            slider_trigger_horizontalDistance: 10,
            slider_trigger_verticalDistance: 75,
            slider_trigger_druation: 10
        };
        this.settings = tools.extend({}, eventParam, params);
        this.events = [];
        this.holdTimeOut = undefined;

        //register touch event handler 
        //Store all touch points to the target property of the event
        function touchHandler(evt) {
            var event = evt || window.event;
           
            var etype = eventType.getTouchTypeByEvent(event);
            if (!tools.isTouchEvent(event)) return;
            that.sender.touchList = that.sender.touchList || {};
            var touchs = tools.getType(event.changedTouches) != "undefined" ? event.changedTouches : [event];

            for (var i = 0; i < touchs.length; i++) {
                var point = touchs[i];
                var id = tools.getType(point.identifier) != "undefined" ? point.identifier : point.pointerId;
                that.sender.touchList[id] = point;
            }


            var ptouchEvent = {
                getPointerList: getPointerList,
                eventType: etype,
                orginEvent: event
            };
            tools.createCustomEvent("ptouch" + etype, that.sender, ptouchEvent);
            tools.createCustomEvent(ptouchClear, that.sender, ptouchEvent);
        }
        //Get all touch points when user touch the screen 
        function getPointerList() {
            var pointers = [];

            if (this.target.touchList) {
                for (var id in this.target.touchList) {
                    var point = this.target.touchList[id];
                    pointers.push(new pointer(id, this.type, point, this.timeStamp));
                }
            }
            return pointers;
        }
        //calculate distance of two points and time difference
        function getPointerDistanceTimediff(startpointer, endpointer) {
            if (!(startpointer instanceof pointer && endpointer instanceof pointer)) {
                return null;
            }
            return {
                horizontal: endpointer.pageX - startpointer.pageX,
                vertical: endpointer.pageY - startpointer.pageY,
                timediff: endpointer.timestamp - startpointer.timestamp
            };
        }

        function getStraightLineDistance(startPointer, endpointer) {
            var result = getPointerDistanceTimediff(startPointer, endpointer);
            var distance = Math.floor(Math.sqrt(result.horizontal * result.horizontal + result.vertical * result.vertical));
            return distance;
        }

        gestureCollection = {
            tap: function () {
                that.sender.addEventListener(ptouchStart, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {
                        evt.target.tapStartPointers = pointers;
                    }
                }, false);
                that.sender.addEventListener(ptouchMove, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {
                        evt.target.tapMovePointers = pointers;
                    }
                }, false);
                that.sender.addEventListener(ptouchEnd, function (evt) {
                    if (!evt.target.tapMovePointers) return;
                    if (evt.target.tapStartPointers.length == 1) {
                        var nowTime = new Date().getTime();
                        var startTime = evt.target.tapStartPointers[0].timestamp;
                        var result = getPointerDistanceTimediff(evt.target.tapStartPointers[0], evt.target.tapMovePointers[0]);
                        if (nowTime - startTime <= that.settings.tap_duration && Math.abs(result.horizontal) < that.settings.tap_hold_horizontalDistance && Math.abs(result.vertical) < that.settings.tap_hold_verticalDistance) {
                            evt.touchPoint = evt.target.tapMovePointers;
                            tools.createCustomEvent("tap", that.sender, evt);
                        }
                    }
                }, false);
            },
            hold: function () {
                that.sender.addEventListener(ptouchStart, function (evt) {
                    clearTimeout(that.holdTimeOut);
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {
                        evt.target.holdStartPointers = pointers;
                        that.holdTimeOut = setTimeout(function () {
                            evt.touchPoint = pointers;
                            tools.createCustomEvent("hold", that.sender, evt);
                        }, that.settings.hold_duration);
                    }
                }, false);
                that.sender.addEventListener(ptouchMove, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {
                        var result = getPointerDistanceTimediff(pointers[0], evt.target.holdStartPointers[0]);
                        if (Math.abs(result.horizontal) > that.settings.tap_hold_horizontalDistance && Math.abs(result.vertical) > that.settings.tap_hold_verticalDistance) {
                            clearTimeout(that.holdTimeOut);
                        }
                    }
                }, false);
                that.sender.addEventListener(ptouchEnd, function () {
                    clearTimeout(that.holdTimeOut);
                }, false);
            },
            swipeleft: function () {
                that.sender.addEventListener(ptouchStart, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {

                        evt.target.swipeleftStartPointers = pointers;
                    }
                }, false);
                that.sender.addEventListener(ptouchMove, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {
                        evt.target.swipeleftMovePointers = pointers;
                    }
                }, false);
                that.sender.addEventListener(ptouchEnd, function (evt) {
                    if (!(!evt.target.swipeleftStartPointers || !evt.target.swipeleftMovePointers || evt.target.swipeleftStartPointers.length != 1)) {
                        var startPointers = evt.target.swipeleftStartPointers;
                        var endPointers = evt.target.swipeleftMovePointers;
                        var result;
                        for (var i = 0, len; len = endPointers.length, i < len; i++) {
                            result = getPointerDistanceTimediff(startPointers[i], endPointers[i]);
                            if (result.timediff <= that.settings.swipe_duration && Math.abs(result.horizontal) >= that.settings.swipe_horizontalDistance && Math.abs(result.vertical) <= that.settings.swipe_verticalDistance) {
                                if (result.horizontal < 0) {
                                    tools.createCustomEvent("swipeleft", that.sender, evt);
                                    evt.target.isSwipeLeft = true;
                                    break;
                                }
                            }
                        }
                    }
                }, false);
            },
            swiperight: function () {
                that.sender.addEventListener(ptouchStart, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {
                        evt.target.swiperightStartPointers = pointers;
                    }
                }, false);
                that.sender.addEventListener(ptouchMove, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {
                        evt.target.swiperightMovePointers = pointers;
                    }
                }, false);
                that.sender.addEventListener(ptouchEnd, function (evt) {
                    if (!(!evt.target.swiperightStartPointers || !evt.target.swiperightMovePointers || evt.target.swiperightStartPointers.length != 1)) {
                        var startPointers = evt.target.swiperightStartPointers;
                        var endPointers = evt.target.swiperightMovePointers;
                        var result;
                        for (var i = 0, len; len = endPointers.length, i < len; i++) {
                            result = getPointerDistanceTimediff(startPointers[i], endPointers[i]);
                            if (result.timediff <= that.settings.swipe_duration && Math.abs(result.horizontal) >= that.settings.swipe_horizontalDistance && Math.abs(result.vertical) <= that.settings.swipe_verticalDistance) {
                                if (result.horizontal > 0) {
                                    tools.createCustomEvent("swiperight", that.sender, evt);
                                    evt.target.isSwipeLeft = true;
                                    break;

                                }
                            }
                        }
                    }
                }, false);
            },
            slider: function () {
                that.sender.addEventListener(ptouchStart, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 1) {

                        evt.target.sliderStartPointers = pointers;
                        evt.target.isSlider = false;
                    }
                }, false);
                that.sender.addEventListener(ptouchMove, function (evt) {
                    var epointers = evt.getPointerList();
                    if (epointers.length == 1) {
                        var spointers = evt.target.sliderStartPointers;
                        var result;
                        if (!evt.target.isSlider) {
                            for (var i = 0, len; len = epointers.length, i < len; i++) {
                                result = getPointerDistanceTimediff(spointers[i], epointers[i]);

                                if (result.timediff > that.settings.slider_trigger_druation && Math.abs(result.horizontal) > that.settings.slider_trigger_horizontalDistance) {
                                    evt.target.isSlider = true;
                                    evt.target.sliderDirection = result.horizontal;
                                    break;
                                }
                            }
                        }

                        if (evt.target.isSlider) {
                            evt.target.sliderMovePointers = epointers;
                            tools.createCustomEvent("slider", that.sender, evt);

                            evt.target.sliderStartPointers = Object.create(evt.target.sliderMovePointers);
                        }
                    }

                }, false);
                that.sender.addEventListener(ptouchEnd, function (evt) {
                    tools.createCustomEvent("slidercompleted", that.sender, evt);
                }, false);
            },
            scale: function () {
                that.sender.addEventListener(ptouchStart, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 2) {
                        evt.target.scaleStartPointers = pointers;
                    }
                }, false);
                that.sender.addEventListener(ptouchMove, function (evt) {
                    var pointers = evt.getPointerList();
                    if (pointers.length == 2) {
                        var startPointers = evt.target.scaleStartPointers;
                        var scale = getStraightLineDistance(pointers[0], pointers[1]) / getStraightLineDistance(startPointers[0], startPointers[1]);
                        evt.scale = scale;
                        tools.createCustomEvent("scale", that.sender, evt);
                        evt.target.scaleStartPointers = Object.create(pointers);
                        evt.target.isScale = true;
                    }
                }, false);
                that.sender.addEventListener(ptouchEnd, function(evt) {
                    tools.createCustomEvent("scalecompleted", that.sender, evt);
                }, false);
            }
        };


        this.sender.addEventListener(touchStart, touchHandler, false);
        this.sender.addEventListener(touchMove, touchHandler, false);
        this.sender.addEventListener(touchEnd, touchHandler, false);
        this.sender.addEventListener(ptouchClear, function (e) {
            if (e.eventType == eventType.TOUCH_END) {
                this.touchList = {};
            }
        }, false);
        this.registerEvents = function (eventName, func,completed) {
            if (this.events.indexOf(eventName) >= 0) {
                this.sender.addEventListener(eventName, function (e) {
                    func.call(this, e);
                }, false);
                return;
            }
            this.events.push(eventName);
            if (tools.getType(gestureCollection[eventName]) == "function" && tools.getType(func) == "function") {
                gestureCollection[eventName].call(this);
                this.sender.addEventListener(eventName, function (e) {
                    func.call(this, e);
                }, false);
                if (tools.getType(completed) == 'function') {
                    this.sender.addEventListener(eventName + "completed", function(e) {
                        completed.call(this, e);
                    });
                }
            }
        };

    };
    gesture.prototype = {
        ontap: function (func) {
            this.registerEvents("tap", func);
        },
        onhold: function (func) {
            this.registerEvents("hold", func);
        },
        onswiperight: function (func) {
            this.registerEvents("swiperight", func);
        },
        onswipeleft: function (func) {
            this.registerEvents("swipeleft", func);
        },
        onswipe: function (funcleft, funcright) {
            if (tools.getType(funcleft) == "function") {
                this.registerEvents("swipeleft", funcleft);
            }
            if (tools.getType(funcright) == "function") {
                this.registerEvents("swiperight", funcright);
            }
        },
        onslider: function (func,completed) {
            this.registerEvents("slider", func,completed);
        },
        onscale: function (func,completed) {
            this.registerEvents("scale", func,completed);
        }
    };
    exports.Gesture = gesture;
})(window);


