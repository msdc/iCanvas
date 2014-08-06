﻿define(function (require) {
    var tools = require("./util"),
        handler = require("./observer");
    require("../tools/requestAnimationFrame");
    function Timer() {

        this.interval = undefined;
        this._handler = new handler(this);
        /*  
        // 单例的实现
        if (tools.isUndefined(Timer.instance)) {
            return getInstance();
        }
        else {
            return Timer.instance;
        }
        function getInstance() {
            Timer.instance = that;
            return that;
        }
        
        */
    }
    Timer.prototype = {
        addHandler: function (func, caller) {
            if (!tools.isUndefined(caller)) {
                func = tools.bind(func, caller);
            }
            this._handler.attach("timer", func);
        },
        start: function () {
            var that = this;
            (function () {
                that.interval = window.requestAnimationFrame(arguments.callee);
                that._handler.notifyByKey("timer");
            })();
        },
        stop: function () {
            window.cancelAnimationFrame(this.interval);
        }

    };
    return Timer;

});