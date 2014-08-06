define(function (require) {
    var tools = require("../tools/util"),
      observer = require("../tools/observer"),
      log = require("../tools/log"),
      core = require("../../../animation/core");

    if (! "indexOf" in Array) {
        Array.prototype.indexOf = function (item) {

        }
    }

    function Animate(duration, fps) {
        this.properties = {};
        this.times = [];
        this.animateCore = new core(duration,fps);
    }
    Animate.prototype = function () {
        return {
            when: function (time, options) {
                this.properties = this.properties || {};
                if (time in this.properties) {
                    this.properties[time] = tools.extend(this.properties[time], options, true);
                }
                else {
                    this.properties[time] = options;
                    this.times.push(time);
                }
            },
            onframe: function (func) {

            }


        }
    }();


});