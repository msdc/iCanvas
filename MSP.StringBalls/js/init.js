var balls = [];
var flag = true;

window.onload = function () {
    document.getElementById("log").value = "";
    var _svg = document.getElementById("svg");
    var _g = CreateDom("g", _svg);
    _g.setAttribute("transform", "translate(400,300)");
    var _counter = 16;

    for (var i = 0; i < _counter; i++) {
        //var _cord = CalculatePosition();
        var _ballInstance = new ball(5, GetRandom(-300, 300), GetRandom(-200, 200));
        _ballInstance.applyR(35);
        //_ballInstance.dom = CreateSingleCircle(_g, _ballInstance.vector.x, -_ballInstance.vector.y);
        balls.push(_ballInstance);
    }

    for (var i = 0, ci; ci = balls[i]; i++) {
        for (var j = i + 1, bi; bi = balls[j]; j++) {
            var _flag = Math.floor(GetRandom(0,3));
            //var _flag = 0;
            if (_flag<1) {
                ci.attachSingleBall(bi);
            }
        }
    }

    var ball1 = balls[0];
    var ball2 = balls[1];
    var ball3 = balls[2];
    var ball4 = balls[3];
    ball1.setFixed(true);
    ball1.vector.x = -200;
    ball1.vector.y = -200;
    //ball1.vector.x = 0;
    //ball1.vector.y = 0;
    var _logTxt = [];
   

    ball2.setFixed(true);
    ball2.vector.x = 200;
    ball2.vector.y = 200;

    ball3.setFixed(true);
    ball3.vector.x = -200;
    ball3.vector.y = 200;

    ball4.setFixed(true);
    ball4.vector.x = 200;
    ball4.vector.y = -200;

    var _lines = ball.prototype.lines;
    for (var i in _lines) {
        var _instance = _lines[i];
        _instance.line = CreateDom("line", _g);
    }


    for (var i = 0, _ballInstance; _ballInstance = balls[i]; i++) {
        _ballInstance.dom = CreateSingleCircle(_g, _ballInstance.vector.x, -_ballInstance.vector.y,_ballInstance.R);
    }

    ball1.logEvt.attach(function (x) {
        _logTxt.push(x);
        var _log = document.getElementById("log");
        _log.value = _logTxt.join("\n");
    });
       

    document.getElementById("stop").onclick = function () {
        flag = !flag;
        this.value = flag ? "stop" : "start";
        timer();
    }

    timer();
}

 function timer () {
     if (!flag) {
         return;
     }
     //balls[0].collision();

     for (var i = 0, ci; ci = balls[i]; i++) {
         ci.moveNew(0.5);
         ci.dom.setAttribute("cx", ci.vector.x);
         ci.dom.setAttribute("cy", -ci.vector.y);
     }
     drawLines();
     setTimeout(arguments.callee, 80);
 };


 function drawLines() {
     var _lines = ball.prototype.lines;
     for (var i in _lines) {
         var _instance = _lines[i];
         _instance.line.setAttribute("x1", _instance.a.vector.x);
         _instance.line.setAttribute("y1", -_instance.a.vector.y);
         _instance.line.setAttribute("x2", _instance.b.vector.x);
         _instance.line.setAttribute("y2", -_instance.b.vector.y);
         _instance.line.style.stroke = "gray";
         _instance.line.style.strokeWidth = 1;
     }
 }


function CreateDom(key, parent) {
    var _dom = document.createElementNS('http://www.w3.org/2000/svg', key);
    parent.appendChild(_dom);
    return _dom
}

function CreateCircle(parent, count) {
    var _count = (count == undefined ? 15 : count);
    for (var i = 0; i < _count; i++) {
        var _circle = CreateDom("circle", parent);
        _circle.setAttribute("cx", GetRandom(-300, 300));
        _circle.setAttribute("cy", GetRandom(-200, 200));
        _circle.setAttribute("r", GetRandom(10, 30));
        _circle.setAttribute("fill", "rgb(" + GetRandom(0, 255) + "," + GetRandom(0, 255) + "," + GetRandom(0, 255) + ")");

    }
}

function CreateSingleCircle(parent, x, y,r) {
    var _circle = CreateDom("circle", parent);
    _circle.setAttribute("cx", x);
    _circle.setAttribute("cy", y);
    _circle.setAttribute("r", r);
    _circle.setAttribute("fill", "rgb(" + GetRandom(0, 255) + "," + GetRandom(0, 255) + "," + GetRandom(0, 255) + ")");
    return _circle;
}

function GetRandom(num1, num2) {
    var _max = Math.max(num1, num2);
    var _min = Math.min(num1, num2);
    return parseInt(_min + (_max - _min) * Math.random());
}

function CalculatePosition() {
    var _sx = (Math.round(Math.random()) == 0 ? -1 : 1);
    var _sy = (Math.round(Math.random()) == 0 ? -1 : 1);

    var _x = GetRandom(0, 300);
    var _yMin = Math.sqrt(Math.max((10000 - _x * _x), 0));
    var _y = GetRandom(_yMin, 200);

    return [_sx * _x, _sy * _y];
}