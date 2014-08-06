/*
 * expression 
 * @author: jiyong Han (v-jiyhan@microsoft.com) 
 *
*/
define(function (require) {
    var tool = require("./canvas_util.js");

    var exp = function (value) {
        var _result = (value instanceof exp) ? value : tool.matchNum(value);
        for (i in _result) {
            this[i] = _result[i];
        }
    }

    exp.prototype.merge = function (value, operator) {
        var _tempV = (value instanceof exp) ? value : tool.matchNum(value);
        if ((this.unit == _tempV.unit || (_tempV.unit == "num" && (operator == "*" || operator == "/"))) && _tempV.unit != "text") {
            this.v = eval(this.v + operator + _tempV.v);
            switch (this.unit) {
                case "px":
                    this.c = this.v + "px";
                case "num":
                    this.c = "{" + this.v + "}";
                case "%":
                    this.c = this.v;
            }
            return;
        }
        this.v = "(" + this.c + operator + _tempV.c + ")";
        this.unit = "text";
        this.c = this.v;
    }
    exp.prototype.ADD = function (value) {
        this.merge(value, "+");
        return this;
    }
    exp.prototype.SUB = function (value) {
        this.merge(value, "-");
        return this;
    }
    exp.prototype.MUL = function (value) {
        this.merge(value, "*");
        return this;
    }
    exp.prototype.DIV = function (value) {
        this.merge(value, "/");
        return this;
    }
    exp.prototype.DivNum = function (value) {
        return this.DIV("{" + value + "}");
    }
    exp.prototype.MulNum = function (value) {
        return this.MUL("{" + value + "}");
    }

    return exp;
});