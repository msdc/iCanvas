define(function (require) {
    var util = require("./util"), observer;
    observer = function (sender) {
        this._sender = sender;
        this._listeners = {};
    }
    observer.prototype = {
        attach: function (key, handler) {
            if (util.isUndefined(key)) return;
            if (!util.isFunction(handler)) return;
            if (util.isUndefined(this._listeners[key])) {
                this._listeners[key] = [];
            }
            this._listeners[key].push(handler);
        },
        notify: function () {
            var listeners = this._listeners,
                args = Array.prototype.slice.call(arguments);
            for (var ci in listeners) {
                this.notifyByKey.apply(this, Array.prototype.concat([ci], args));
            }
        },
        notifyByKey: function (key) {
            if (util.isUndefined(key)) return;
            var listeners = this._listeners;
            if (util.isUndefined(listeners[key])) { return; }
            for (var i = 0, cii; cii = listeners[key][i]; i++) {
                cii.apply(this._sender, Array.prototype.slice.call(arguments, 1));
            }
        },
        remove: function (key, index) {
            if (util.isUndefined(key)) return;
            if (util.isUndefined(index)) {
                delete this._listeners[key];
            }
            else {
                this._listeners[key].splice(index, 1);
            }
        },
        getHandlerByKey: function (key) {
            if (util.isUndefined(key)) return undefined;
            var listeners = this._listeners;
            if (util.isUndefined(listeners[key])) { return undefined; }
            return listeners[key];
        },
        clear: function () {
            this._listeners = {};
        }
    }

    return observer;
})



///*
// * expression 
// * @author: jiyong Han (v-jiyhan@microsoft.com) 
// *
//*/
//define(function (require) {

//    var evtWrapper = function (sender) {
//        this._sender = sender;
//        this._listeners = [];
//    }
//    evtWrapper.prototype.attach = function (handler) {
//        if (typeof handler == "function") {
//            this._listeners.push(handler);
//        }
//    }
//    evtWrapper.prototype.notify = function () {
//        for (var i = 0, ci; ci = this._listeners[i]; i++) {
//            ci.apply(this._sender, arguments);
//        }
//    }
//    evtWrapper.prototype.clear = function () {
//        this._listeners = [];
//    }
//    evtWrapper.prototype.getHandlers = function () {
//        return this._listeners;
//    }


//    //event collection
//    var evtCollection = function (sender) {
//        this.sender = sender;
//    }
//    evtCollection.prototype.RegisterEvent = function (key, func) {
//        if (this[key] == undefined) {
//            this[key] = new evtWrapper(this.sender);
//        }
//        this[key].attach(func);
//    }



//    return evtWrapper;

//})

