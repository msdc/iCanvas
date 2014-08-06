define("src/tools/timer-debug", [ "./util-debug", "./observer-debug", "../tools/requestAnimationFrame-debug" ], function(require) {
    var tools = require("./util-debug"), handler = require("./observer-debug");
    require("../tools/requestAnimationFrame-debug");
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
