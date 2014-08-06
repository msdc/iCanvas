/// <reference path="../lib/sea-debug.js" />
define(function (require) {
    /*
     * get the absolute position of an element from the top left corner
    */
    function getOffSet(e) {
        var t = e.offsetTop;
        var l = e.offsetLeft;
        while (e = e.offsetParent) {
            t += e.offsetTop;
            l += e.offsetLeft;
        }
        return { dx: l, dy: t };
    }
    /*
     * get Mouse position
    */
    function getMouseCord(sender, evt) {
        var _offset = getOffSet(sender);
        var _xfix = _offset.dx;
        var _yfix = _offset.dy;
        return evt.pageX || evt.pageY ? { x: evt.pageX - _xfix, y: evt.pageY - _yfix, e: evt } : {
            x: evt.clientX + document.body.scrollLeft - _xfix,
            y: evt.clientY + document.body.scrollTop - _yfix,
            e: evt
        };
    }
    /*
     *get touch position
    */
    function getTouchCord(sender, evt) {
        var _evt = evt || window.event;
        var _x = _evt.pageX;
        var _y = _evt.pageY;
        if (_evt.targetTouches && _evt.targetTouches.length > 0) {
            _x = _evt.targetTouches[0].pageX;
            _y = _evt.targetTouches[0].pageY;
        }
        var cord = { x: _x, y: _y };
        var _offset = getOffSet(sender);
        var _xfix = _offset.dx;
        var _yfix = _offset.dy;
        return { x: cord.x - _xfix, y: cord.y - _yfix, e: _evt };
    }

    var opCodes = function () {
        var _operators = ["+", "-", "*", "/", "(", ")"];
        var _operators = [
            { v: "+", p: 1 }
            , { v: "-", p: 1 }
            , { v: "*", p: 2 }
            , { v: "/", p: 2 }
            , { v: "(", p: 0 }
            , { v: ")", p: 0 }
        ]

        var _temp = {};
        for (var i = 0, ci; ci = _operators[i]; i++) {
            _temp[ci.v.charCodeAt(0)] = ci;
        }
        return _temp;

    }();
    function RPN(string) {
        //Reverse Polish notation
        var _ops = this.opCodes;
        //two stacks one for chars the other for oprators
        var _charStack = [];
        var _opStack = [];
        //save the string value, like "1px"
        var _val = [];
        string.replace(/./g, function (x) {
            if (_ops[x.charCodeAt(0)] == undefined) {
                _val.push(x);
            }
            else {
                //save the string
                if (_val.length > 0) {
                    _charStack.push(_val.join(""));
                    _val = [];
                }
                var _op = _ops[x.charCodeAt(0)];
                //deal with the operators
                //when "("
                if (_op.v == "(" || _opStack.length == 0) {
                    _opStack.push(_op);
                    return;
                }
                //when close ")"
                if (_op.v == ")") {
                    (function () {
                        var _temp = _opStack.pop();
                        if (_temp.v == "(") {
                            return;
                        }
                        _charStack.push(_temp.v);
                        arguments.callee.apply(null)
                    })();
                    return;
                }
                //when other operators:
                //when the incoming has higher priority than the one in stack, like * vs. -
                //then just push the new operator into the stack
                //otherwise, pop out the one in stack, do the same loop again
                (function () {
                    var _temp = _opStack.pop();
                    if (_temp == undefined) {
                        _opStack.push(_op);
                        return;
                    }
                    if (_op.p > _temp.p) {
                        _opStack.push(_temp);
                        _opStack.push(_op);
                        return;
                    }
                    _charStack.push(_temp.v);
                    arguments.callee.apply(null)
                })();
                return;
            }
        });
        if (_val.length > 0) {
            _charStack.push(_val.join(""));
            _val = [];
        }
        var _remainingOp = _opStack.reverse();
        for (var i = 0, ci; ci = _opStack[i]; i++) {
            _charStack.push(ci.v);
        }
        return _charStack;
    }
    function matchNum(value) {
        if (CONS.REGEXP.PX.test(value)) {
            return {
                v: CONS.REGEXP.PX.exec(value)[0]
                , unit: "px"
                , c: value
            }
        }
        if (CONS.REGEXP.ABSNUM.test(value)) {
            return {
                v: CONS.REGEXP.NUM.exec(value)[0]
                , unit: "num"
                , c: value
            }
        }
        return {
            v: CONS.REGEXP.NUM.exec(value)[0]
            , unit: "%"
            , c: value
        }
    }
    function getVolume(value, all) {
        var _this = this;
        function process(value, all) {
            var volume = _this.matchNum(value);
            if (volume.unit == "px") {
                return Number(volume.v);
            }
            if (volume.unit == "num") {
                return Number(volume.v)
            }
            return Number(CONS.REGEXP.NUM.exec(all)[0]) / 100 * volume.v;
        }
        if (!CONS.REGEXP.OPERATOR.test(value.toString())) {
            return process(value, all);
        }

        var _stack = this.RPN(value.toString());
        var _result = [];
        for (var i = 0, ci; ci = _stack[i]; i++) {
            if (this.opCodes[ci.charCodeAt(0)]) {
                //operator
                var _num1 = _result.pop();
                var _num2 = _result.pop();
                var _calResult = eval(_num2 + ci + _num1);
                _result.push(_calResult);
            }
            else {
                //numbers
                _result.push(process(ci, all));
            }
        }
        return Number(_result[0]);
    }


    return {
        getOffset: getOffSet,
        getMouseCord: getMouseCord,
        getTouchCord: getTouchCord,
        opCodes: opCodes,
        RPN: RPN,
        matchNum: matchNum,
        getVolume: getVolume
    }

});