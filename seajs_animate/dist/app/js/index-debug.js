/**
 * Created by ming on 14-2-22.
 */
define("app/js/index-debug", [ "../../src/lib/animate-debug", "../../src/tools/timer-debug", "../../src/tools/util-debug", "../../src/tools/observer-debug", "../../src/tools/requestAnimationFrame-debug", "../../src/lib/core-debug", "../../src/tools/easing-debug" ], function(require) {
    //var Core = require("../../src/lib/core");
    //var Timer = require("../../src/tools/timer");
    var AnimateContext = require("../../src/lib/animate-debug");
    function $$(id) {
        return document.getElementById(id);
    }
    var aniContxt = new AnimateContext();
    var animate1 = aniContxt.create({
        from: {
            top: 50,
            left: 500,
            w: 100,
            h: 100
        },
        to: {
            top: 150,
            left: 400,
            w: 10,
            h: 10
        },
        easing: "easeOutBounce",
        delay: 0,
        duration: 2e3
    });
    var animate2 = aniContxt.create({
        from: {
            top: 300,
            left: 0
        },
        to: {
            top: 300,
            left: 800,
            deg: 720
        },
        easing: "easeOutBounce",
        delay: 0,
        duration: 2e3
    });
    animate2.onframe(function(d) {
        $$("rect").style.cssText = "top:" + d.top + "px;left:" + d.left + "px;-webkit-transform:rotate(" + d.deg + "deg);-webkit-transform-origin:top";
    });
    animate1.onframe(function(d) {
        $$("circle").style.cssText = "top:" + d.top + "px;left:" + d.left + "px;width:" + d.w + "px;height:" + d.h + "px";
    });
    animate1.oncompleted(function() {
        console.log(Date.now());
        animate2.start();
    });
    animate1.start();
    console.log(Date.now());
    aniContxt.start();
});

/**
 * Created by mlguo on 3/10/14.
 */
define("src/lib/animate-debug", [ "src/tools/timer-debug", "src/tools/util-debug", "src/tools/observer-debug", "src/tools/requestAnimationFrame-debug", "src/lib/core-debug", "src/tools/easing-debug" ], function(require) {
    var Timer = require("src/tools/timer-debug"), Animate = require("src/lib/core-debug"), tools = require("src/tools/util-debug");
    function Animation() {
        this.timer = new Timer();
        var that = this;
        this.timer.addHandler(function() {
            for (var i = 0, ci; ci = that.animates[i]; i++) {
                ci.frame();
            }
        });
        this.animates = [];
    }
    Animation.prototype = function() {
        var _options = {
            from: {},
            to: {},
            easing: "",
            delay: 0,
            duration: 1e3
        };
        return {
            create: function(options, onstep, oncompleted) {
                var settings = tools.extend(_options, options);
                var animate = new Animate(settings.duration, settings.fps);
                animate.from(settings.from);
                animate.to(settings.to);
                animate.easing(settings.easing);
                animate.delay(settings.delay);
                if (tools.isFunction(onstep)) {
                    animate.onstep(onstep);
                }
                if (tools.isFunction(oncompleted)) {
                    animate.oncompleted(oncompleted);
                }
                this.animates.push(animate);
                return animate;
            },
            start: function() {
                this.timer.start();
            },
            stop: function() {
                this.timer.stop();
            }
        };
    }();
    return Animation;
});

define("src/tools/timer-debug", [ "src/tools/util-debug", "src/tools/observer-debug", "src/tools/requestAnimationFrame-debug" ], function(require) {
    var tools = require("src/tools/util-debug"), handler = require("src/tools/observer-debug");
    require("src/tools/requestAnimationFrame-debug");
    function Timer() {
        this.interval = undefined;
        this._handler = new handler(this);
    }
    Timer.prototype = {
        addHandler: function(func, caller) {
            if (!tools.isUndefined(caller)) {
                func = tools.bind(func, caller);
            }
            this._handler.attach("timer", func);
        },
        start: function() {
            var that = this;
            (function() {
                that.interval = window.requestAnimationFrame(arguments.callee);
                that._handler.notifyByKey("timer");
            })();
        },
        stop: function() {
            window.cancelAnimationFrame(this.interval);
        }
    };
    return Timer;
});

/* 公共辅助函数
 *
 * @author MingLi (v-minggu@microsoft.com)
 *
 * getType: 获取对象的类型
 * isNumber:判定对象是否是Number
 * isFunction: 判定对象是否是function
 * isString: 判定对象是否是String
 * isUndefined: 判定对象是否是Undefined
 * isArray: 判定对象是否是Array
 * isBool:判定对象是否是boolean
 * isEmptyOrNullObject: 判定对象是否是空对象
 * isCanvas: 判定对象是否是HtmlCanvasElement
 * isHtmlElement: 判定对象是否是HtmlElement
 * isSvgElement: 判定对象是否是SvgElement,
 * isSvg: 判定对象是否是svg.<svg> </svg>
 * getStyles: 获取对象的style集合
 * inheritPrototype:继承对象的prototype
 * clone: 深度克隆
 * extend: 合并源对象的属性到目标对象
 * fireCustomEvent: 触发自定义事件
 * 
 */
define("src/tools/util-debug", [], function(require) {
    /*
    *获取对象的类型
    *@param  
    *@return 对象类型。
    */
    function getType(obj) {
        var type = typeof obj;
        if (type == "object") {
            type = Object.prototype.toString.call(obj);
            return type.replace(/^\[object\s*/gi, "").replace(/\]$/, "").toLowerCase();
        } else {
            return type.toLocaleLowerCase();
        }
    }
    /*
     *判定对象是否是Number
     *@return bool
   */
    function isNumber(obj) {
        return getType(obj) == "number";
    }
    /*
     *判定对象是否是Number
     *@return bool
   */
    function isBool(obj) {
        return getType(obj) == "boolean";
    }
    /*
    *判定对象是否是function
    *@return bool
    */
    function isFunction(func) {
        return getType(func) == "function";
    }
    /*
   *判定对象是否是undefined
   *@return bool
   */
    function isUndefined(obj) {
        var _type = getType(obj);
        return _type == "undefined" || _type == "null";
    }
    /*
   *判定对象是否是Array
   *@return bool
   */
    function isArray(obj) {
        return getType(obj) == "array";
    }
    /*
   *判定对象是否是空对象
   *@return bool
   */
    function isEmptyOrNullObject(obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    }
    /*
     *判定对象是否是object
     *@return bool
     */
    function isObject(obj) {
        return typeof obj == "object" && getType(obj) == "object";
    }
    /*
   *判定对象是否是string
   *@return bool
   */
    function isString(obj) {
        return getType(obj) == "string";
    }
    /*
   *判定对象是否是canvas
   *@return bool
   */
    function isCanvas(obj) {
        return isHtmlElement(obj) && getType(obj) == "htmlcanvaselement";
    }
    /*
   *判定对象是否是Html Element
   *@return bool
   */
    function isHtmlElement(obj) {
        return getType(obj).search(/^html[a-z]*?element$/) >= 0;
    }
    /*
   *判定对象是否是svg Element.例 <rect />, <g/>
   *@return bool
   */
    function isSvgElement(obj) {
        return getType(obj).search(/^svg[a-z]*?element$/) >= 0;
    }
    /*
   *判定对象是否是svg.<svg> </svg>
   *@return bool
   */
    function isSvg(obj) {
        return getType(obj).search(/^svgsvgelement$/) >= 0;
    }
    /*
    *获取对象的style集合
    *@param  HtmlElement，SvgElement 或者 自定义控件
    *@return {}    
    */
    var getStyles = function() {
        if (window.getComputedStyle) {
            return function(ele) {
                return isHtmlElement(ele) ? window.getComputedStyle(ele) : isSvgElement(ele) ? ele : ele.style || ele;
            };
        } else {
            return function(ele) {
                return isHtmlElement(ele) ? ele.currentStyle : isSvgElement(ele) ? ele : ele.style || ele;
            };
        }
    }();
    /*
    *继承指定对象的prototype。
    *
    *@param:子类
    *@param:父类，可以有多个。
    *
    */
    function inheritPrototype(subType) {
        var args = Array.prototype.slice.call(arguments, 1), prototype;
        if (getType(args) == "undefined" || args.length == 0) {
            return;
        }
        if (!("create" in Object)) {
            Object.create = function(obj) {
                function F() {}
                F.prototype = obj;
                return new F();
            };
        }
        for (var i = 0, ci; ci = args[i]; i++) {
            prototype = Object.create(ci.prototype);
            prototype.constructor = subType;
            for (var p in prototype) {
                subType.prototype[p] = prototype[p];
            }
        }
    }
    /*
    function swap(obj1,obj2)
    {
        var tmp;
        tmp=isObject(obj1)?clone(obj1):obj1;
        obj1=isObject(obj2)?clone(obj2):obj2;
        obj2=tmp;
    }*/
    /**
    * 对一个object进行深度拷贝
    * @param {Any} source 需要进行拷贝的对象
    * @return {Any} 拷贝后的新对象
    */
    function clone(source) {
        // buildInObject, 用于处理无法遍历Date等对象的问题
        var buildInObject = {
            "[object Function]": 1,
            "[object RegExp]": 1,
            "[object Date]": 1,
            "[object Error]": 1,
            "[object CanvasGradient]": 1
        }, result = source, i, len;
        if (!source || source instanceof Number || source instanceof String || source instanceof Boolean) {
            return result;
        } else if (source instanceof Array) {
            result = [];
            var resultLen = 0;
            for (i = 0, len = source.length; i < len; i++) {
                result[resultLen++] = this.clone(source[i]);
            }
        } else if ("object" == typeof source) {
            if (buildInObject[Object.prototype.toString.call(source)] || source.__nonRecursion) {
                return result;
            }
            result = {};
            for (i in source) {
                if (source.hasOwnProperty(i)) {
                    result[i] = this.clone(source[i]);
                }
            }
        }
        return result;
    }
    /**
    * 合并源对象的属性到目标对象    
    * @param {*} target 目标对象
    * @param {*} source 源对象    
    * @param {boolean} optOptions.recursive 是否递归  
    */
    function extend(target, source, recursive) {
        var target = arguments[0] || {}, i = 1, length = arguments.length, source, name;
        for (;i < length; i++) {
            if ((source = arguments[i]) != null) {
                for (name in source) {
                    if (recursive && !isArray(source[name]) && getType(source[name]) == "object") {
                        target[name] = arguments.callee(target[name], source[name]);
                    } else if (recursive && isArray(source[name])) {
                        if (name in target) {
                            if (isArray(target[name])) {
                                target[name] = target[name].concat(source[name]);
                            } else {
                                var tarry = [];
                                target[name] = tarry.concat(target[name]).concat(source[name]);
                            }
                        } else {
                            target[name] = source[name];
                        }
                    } else if (recursive && isArray(target[name])) {
                        target[name] = target[name].concat(source[name]);
                    } else {
                        target[name] = source[name];
                    }
                }
            }
        }
        return target;
    }
    /*
    * 触发自定义的事件
    *@param: 事件的类型
    *@param: 事件的目标
    *@param: 事件参数
    */
    var fireCustomEvent = function() {
        if ("createEvent" in document) {
            return function(type, target, args) {
                var cEvent = document.createEvent("Event");
                cEvent.initEvent(type, true, true);
                for (var o in args) {
                    cEvent[o] = args[o];
                }
                target.dispatchEvent(cEvent);
            };
        } else {
            return function(type, target, args) {
                var cEvent = document.createEventObject();
                for (var o in args) {
                    cEvent[o] = args[o];
                }
                target.fireEvent(type, cEvent);
            };
        }
    }();
    /*******Start*************/
    /* if the browser does not support bind method of function object ,
    ** add a bind method for all  function object .
    ** the method can change caller of function object
    */
    if (!("bind" in Function)) {
        Function.prototype.bind = function() {
            var args = Array.prototype.slice.call(arguments);
            var obj = args.shift();
            var _method = this;
            return function() {
                return _method.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
            };
        };
    }
    function bind(func, caller) {
        if (isFunction(func) && !isUndefined(caller)) {
            return func.bind(caller);
        } else {
            return func;
        }
    }
    /*
     * 生成GUID 
    */
    function newId() {
        function S4() {
            return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }
    return {
        getType: getType,
        isFunction: isFunction,
        isString: isString,
        isNumber: isNumber,
        isUndefined: isUndefined,
        isObject: isObject,
        isArray: isArray,
        isBool: isBool,
        isEmptyOrNullObject: isEmptyOrNullObject,
        isCanvas: isCanvas,
        isHtmlElement: isHtmlElement,
        isSvgElement: isSvgElement,
        isSvg: isSvg,
        getStyles: getStyles,
        inheritPrototype: inheritPrototype,
        clone: clone,
        extend: extend,
        bind: bind,
        newId: newId,
        fireCustomEvent: fireCustomEvent
    };
});

/*
 *
 * @author MingLi (guomilo@gmail.com)
 */
define("src/tools/observer-debug", [ "src/tools/util-debug" ], function(require) {
    var tools = require("src/tools/util-debug"), observer;
    observer = function(sender) {
        this._sender = sender;
        this._listeners = {};
    };
    observer.prototype = {
        attach: function(key, handler) {
            if (tools.isUndefined(key)) return;
            if (!tools.isFunction(handler)) return;
            if (tools.isUndefined(this._listeners[key])) {
                this._listeners[key] = [];
            }
            this._listeners[key].push(handler);
        },
        notify: function() {
            var listeners = this._listeners, args = Array.prototype.slice.call(arguments);
            for (var ci in listeners) {
                this.notifyByKey.apply(this, Array.prototype.concat([ ci ], args));
            }
        },
        notifyByKey: function(key) {
            if (tools.isUndefined(key)) return;
            var listeners = this._listeners;
            if (tools.isUndefined(listeners[key])) {
                return;
            }
            for (var i = 0, cii; cii = listeners[key][i]; i++) {
                cii.apply(this._sender, Array.prototype.slice.call(arguments, 1));
            }
        },
        remove: function(key, index) {
            if (tools.isUndefined(key)) return;
            if (tools.isUndefined(index)) {
                delete this._listeners[key];
            } else {
                this._listeners[key].splice(index, 1);
            }
        },
        getHandlerByKey: function(key) {
            if (tools.isUndefined(key)) return undefined;
            var listeners = this._listeners;
            if (tools.isUndefined(listeners[key])) {
                return undefined;
            }
            return listeners[key];
        },
        clear: function() {
            this._listeners = {};
        }
    };
    return observer;
});

define("src/tools/requestAnimationFrame-debug", [], function(require) {
    var lastTime = 0, id;
    var vendors = [ "ms", "moz", "webkit", "o" ];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback) {
        id = setTimeout(callback, 16);
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
});

/*
 * 动画的核心处理类
 *
 * @author Mingli (guomilo@gmail.com)
 * @vision 1.0.0
 *
 * 
 * from:                     指定属性的初始值
 * to:                       指定属性的目标值
 * start:                    启动动画
 * stop                      停止动画
 * getStates                 获取动画的状态
 * delay                     设置动画延迟执行的时间
 * onframe                   动画运行中回调函数
 * oncompleted               动画完成的回调函数
 * frame                     更新动画
 * easing                    添加缓动函数
 *
 *
 */
define("src/lib/core-debug", [ "src/tools/util-debug", "src/tools/observer-debug", "src/tools/easing-debug" ], function(require) {
    var tools = require("src/tools/util-debug"), observer = require("src/tools/observer-debug"), /*log = require("../tools/log"),*/
    Tween = require("src/tools/easing-debug");
    if (!"now" in Date) {
        Date.now = function() {
            return new Date().getTime();
        };
    }
    /*
     * 动画运行的状态
     * READY:动画开始前的状态
     * START:动画开始
     * RUNNING:动画正在运行
     * COMPLETED:动画完成
     * PAUSE:动画暂停
     */
    var animateStates = {
        READY: "1",
        START: "2",
        RUNNING: "3",
        PAUSE: "4",
        COMPLETED: "5"
    };
    function AnimateCore(/* 生命周期,单位ms */ duration, /*帧率 */ fps) {
        var /*生命周期*/
        _duration = duration || 1e3, /*帧率*/
        _fps = fps || 20, /*每帧间隔的最小时间*/
        _frameInterval = function() {
            return 1e3 / _fps;
        }, /*当前帧*/
        _currentFrame = 0, /*帧数*/
        _frames = function() {
            return parseInt((_duration / _frameInterval()).toFixed(0), 10);
        }, _frameCount = _frames(), /*最后更新的时间*/
        _lastUpdateTime = 0, /*动画开始时间*/
        _startTime = 0, /*动画延迟执行的时间*/
        _delayTime = 0, /*延迟定时器句柄*/
        _delayInterval, /*缓动函数*/
        _tween = createTween("linear"), /*事件委托
         * frame:动画每步更新callback
         * completed:动画完成时触发
         */
        _eventHandler = new observer(this), /*动画的触发开关*/
        _trigger = false, /*属性的初始状态*/
        _startPropreties = {}, /*属性的目标状态*/
        _endPropreties = {}, /*暂停的时长*/
        _pauseStart = 0, _pauseEnd = 0, _pauseDuration = 0;
        /*当前动画的状态*/
        _animateState = animateStates.READY;
        /* 创建缓动函数 */
        function createTween(easing) {
            if (!(tools.isString(easing) && easing in Tween)) {
                easing = "linear";
            }
            return tools.bind(Tween[easing], Tween);
        }
        /* 唯一识别码 */
        this._guid = tools.newId();
        /* 设置动画的状态 */
        function setStates(state) {
            _animateState = state;
        }
        /*获取动画的运行状态*/
        this.getStates = function() {
            return _animateState;
        };
        /*启动动画*/
        this.start = function() {
            _trigger = true;
            var _state = this.getStates();
            if (_state != animateStates.PAUSE) {
                _startTime = Date.now();
            }
            if (_state == animateStates.PAUSE) {
                _startTime += Date.now() - _pauseStart;
            }
            setStates(animateStates.START);
        };
        /*停止/暂停动画*/
        this.stop = function() {
            _trigger = false;
            if (_currentFrame <= _frameCount) {
                setStates(animateStates.PAUSE);
                _pauseStart = Date.now();
            }
        };
        /*设置动画的生命周期*/
        this.setDuration = function(duration) {
            _duration = duration;
            _frameCount = _frames();
            return this;
        };
        /*设置动画的帧率*/
        this.setDuration = function(fps) {
            _fps = fps;
            _frameCount = _frames();
            return this;
        };
        /*指定属性的初始值*/
        this.from = function(sPropreties) {
            _startPropreties = sPropreties;
            return this;
        };
        /* 指定属性的目标值*/
        this.to = function(ePropreties) {
            _endPropreties = ePropreties;
            return this;
        };
        /* 指定缓动函数*/
        this.easing = function(easing) {
            _tween = createTween(easing);
            return this;
        };
        /* 设置动画延迟执行的时间  */
        this.delay = function(delay) {
            _delayTime = delay;
        };
        /* 动画运行时的回调函数 */
        this.onframe = function(func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("frame", func);
            }
        };
        /* 动画完成时的回调函数 */
        this.oncompleted = function(func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("completed", func);
            }
        };
        /* 克隆当前动画（）*/
        this.clone = function() {
            var animate = new AnimateCore();
            animate.setDuration(_duration).from(_startPropreties).to(_endPropreties).delay(_delayTime).easing(_tween);
            return animate;
        };
        /*动画帧*/
        this.frame = function() {
            if (Date.now() - _startTime < _delayTime) {
                return;
            }
            update.apply(this);
        };
        function update() {
            var _curTime = Date.now(), _remainFrame, _property, _startValue, _endValue, _frame = _frameCount, result = {};
            if (!_trigger) {
                return;
            }
            if (this.getStates() == animateStates.STOP) {
                return;
            }
            _remainFrame = _frame - _currentFrame;
            /*
             * 更新时间间隔必须大于帧的时间间隔,才可一继续下一帧的更新。
             */
            if (_curTime - _lastUpdateTime >= _frameInterval()) {
                /*
                 * 当前帧数小于动画的帧数，则更新动画。
                 */
                if (_currentFrame <= _frame) {
                    for (_property in _endPropreties) {
                        startValue = _startPropreties[_property] || 0;
                        endValue = Number(_endPropreties[_property]);
                        if (!tools.isNumber(endValue)) {
                            endValue = startValue;
                        }
                        result[_property] = _tween(_currentFrame, startValue, endValue - startValue, _frame);
                    }
                    _currentFrame++;
                    setStates(animateStates.RUNNING);
                    _eventHandler.notifyByKey("frame", result);
                } else {
                    _trigger = false;
                    _currentFrame = 0;
                    setStates(animateStates.COMPLETED);
                    _eventHandler.notifyByKey("completed");
                }
                _lastUpdateTime = Date.now();
            }
        }
    }
    return AnimateCore;
});

/*
 * 缓动函数参考jQuery Easing http://gsgd.co.uk/sandbox/jquery/easing/
 * 
 * @Author: Mingli Guo (v-minggu@microsoft.com \ guomilo@gmail.com)
 *
*/
define("src/tools/easing-debug", [], function(require) {
    return {
        linear: function(t, b, c, d) {
            return b + t / d * c;
        },
        easeInQuad: function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * (--t * (t - 2) - 1) + b;
        },
        easeInCubic: function(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function(t, b, c, d) {
            return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function(t, b, c, d) {
            return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function(t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p)) + b;
        },
        easeOutElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + c + b;
        },
        easeInOutElastic: function(t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * .3 * 1.5;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) * .5 + c + b;
        },
        easeInBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * t * t * (((s *= 1.525) + 1) * t - s) + b;
            return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },
        easeInBounce: function(t, b, c, d) {
            return c - this.easeOutBounce(d - t, 0, c, d) + b;
        },
        easeOutBounce: function(t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * 7.5625 * t * t + b;
            } else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
            } else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
            }
        },
        easeInOutBounce: function(t, b, c, d) {
            if (t < d / 2) return this.easeInBounce(t * 2, 0, c, d) * .5 + b;
            return this.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    };
});
