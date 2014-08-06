/*
 * 动画的核心处理类
 *
 * @author Mingli (v-minggu@microsoft.com \ guomilo@gmail.com)
 *
 * @describe：动画如果设置了loop或着无限重复的话将导致链表动画不能正常执行，
 *           设置了动画的repeat的次数后，链表动画会在重复完成后开始执行。
 *
 * 
 * from:                     指定属性的初始值
 * to:                       指定属性的目标值
 * start:                    启动动画
 * restart                   重新启动动画（包括链表动画）
 * stop                      停止动画
 * getAnimateStates          获取动画的状态
 * pause                     暂停动画
 * active                    继续暂停的动画
 * delay                     设置动画延迟执行的时间
 * onstep                    动画运行中回调函数
 * oncompleted               动画完成的回调函数
 * onstart                   动画开始时回调函数
 * update                    更新动画
 * easing                    添加缓动函数
 * isCompleted               动画是否完成。
 *
 *
 * example:
 var testDom=document.getElementById("test");
 var animate1=new AnimateCore(3000);
 animate1.from({x:0,y:0})
 .to({x:100,y:100})
 .delay(1000)
 .easing("linear")
 .start();
 animate1.onstep(function(data){
    testDom.style.width=data.x+"px";
    testDom.style.height=data.y+"px";
 });

 animate1.oncompleted(function(){
    alert("Completed");
 });

 var animate2=new AnimateCore(2000);
 //TODO: animate2的初始化同animate1.

 animate1.chainedAnimate(animate2);

 var interval;

 +function(){
    interval = requestAnimationFrame(arguments.callee);
    animate1.update(Date.now());
    if(animate1.getAnimateStates=="3"&&animate2.getAnimateStates=="3"){
        cancelAnimationFrame(interval);
    }
 }();
 *
 */
define(function (require) {
    var tools = require("../tools/util"),
       observer = require("../tools/observer"),
       log = require("../tools/log"),
       Tween = require("../animation/easing");

    if (!"now" in Date) {
        Date.now = function () {
            return new Date().getTime();
        }
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

    function AnimateCore(/* 生命周期,单位ms */duration, /*帧率 */fps) {
        var
        /*生命周期*/
            _duration = duration || 1000,

        /*帧率*/
            _fps = fps || 40,

        /*每帧间隔的最小时间*/
            _frameInterval = function () {
                return 1000 / _fps
            },

        /*当前帧*/
            _currentFrame = 0,

        /*帧数*/
            _frames = function () {
                return parseInt((_duration / _frameInterval()).toFixed(0), 10);
            },

        /*最后更新的时间*/
            _lastUpdateTime = 0,

        /*动画开始时间*/
            _startTime = 0,

        /*动画延迟执行的时间*/
            _delayTime = 0,

        /*延迟定时器句柄*/
            _delayInterval,

        /*缓动函数*/
            _tween = createTween("linear"),

        /*事件委托
         * frame:动画每步更新callback
         * completed:动画完成时触发
         */
            _eventHandler = new observer(this),

        /*动画的触发开关*/
            _trigger = false,

        /*属性的初始状态*/
            _startPropreties = {},

        /*属性的目标状态*/
            _endPropreties = {},


        /*暂停的时长*/
            _pauseStart = 0,
            _pauseEnd = 0,
            _pauseDuration = 0;

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
        this.getStates = function () {
            return _animateState;
        }
        /*启动动画*/
        this.start = function () {
            _trigger = true;

            var _state = this.getStates();
            if (_state != animateStates.PAUSE) {
                _startTime = Date.now();
            }
            if (_state == animateStates.PAUSE) {
                _startTime += Date.now() - _pauseStart;
            }
            setStates(animateStates.START);
        }
        /*停止/暂停动画*/
        this.stop = function () {
            _trigger = false;
            if (_currentFrame <= _frames()) {

                setStates(animateStates.PAUSE);
                _pauseStart = Date.now();

            }
        }

        /*设置动画的生命周期*/
        this.setDuration = function (duration) {
            _duration = duration;
            return this;
        }

        /*指定属性的初始值*/
        this.from = function (sPropreties) {
            _startPropreties = tools.clone(sPropreties);
            return this;
        };
        /* 指定属性的目标值*/
        this.to = function (ePropreties) {
            _endPropreties = tools.clone(ePropreties);
            return this;
        };

        /* 指定缓动函数*/
        this.easing = function (easing) {

            _tween = tools.isFunction(easing) ? easing : createTween(easing);

            return this;
        }

        /* 设置动画延迟执行的时间  */
        this.delay = function (delay) {
            _delayTime = delay;
            return this;
        }

        /* 动画运行时的回调函数 */
        this.onframe = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("frame", func);
            }
            return this;
        }
        /* 动画完成时的回调函数 */
        this.oncompleted = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("completed", func);
            }
            return this;
        }

        /* 克隆当前动画（仅clone动画的from,to,delay,easing.）*/
        this.clone = function () {
            var animate = new AnimateCore();
            animate.setDuration(_duration)
                .from(_startPropreties)
                .to(_endPropreties)
                .delay(_delayTime)
                .easing(_tween);
            return animate;
        }

        /*动画帧*/
        this.frame = function () {

            if (Date.now() - _startTime < _delayTime) {
                return;
            }
            update.apply(this);

        }

        function update() {
            var _curTime = Date.now(),
                _remainFrame,
                _property,
                _startValue,
                _endValue,
                _frame = _frames(),
                result = {};

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
            if (_curTime - _lastUpdateTime > _frameInterval()) {
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

                }
                else {
                    _trigger = false;
                    _currentFrame = 0;
                    setStates(animateStates.COMPLETED);
                    _eventHandler.notifyByKey("completed");
                }

                _lastUpdateTime = Date.now();
            }

        }

    }

    function Animate(segments) {

        this.animateCore = null;

        return this.init(segments);

    }

    Animate.prototype = function () {
        return {
            /*
             * 创建AnimateCore对象
             *
             * @param:{segment}            
                segmnet = {
                    duration: 1000,          //动画的生命周期
                    from: {},                //初始变化属性       
                    to: {},                  //目标变化属性 
                    delay: 0,                //动画的延迟执行时间
                    easing: "",              //缓动函数
                    onstep: null,            //动画变化过程中的更新操作
                    oncompleted: null        //动画完成后的回调
                }
             *
             *
             * @param:{defauls} 同 {segment}  
            */
            init: function (segment) {
                var _segmnet = {
                    duration: 1000,
                    from: {},
                    to: {},
                    delay: 0,
                    loop: 0,
                    repeat: 0,
                    easing: "",
                    onstep: null,
                    oncompleted: null
                }, aniCore;

                segment = tools.extend(_segmnet, segment || {});
                aniCore = new AnimateCore(segment.duration);
                aniCore.from(segment.from)
                              .to(segment.to)
                              .onframe(segment.onstep)
                              .oncompleted(segment.oncompleted)
                              .delay(segment.delay)
                              .easing(segment.easing);

                this.animateCore = aniCore;
                return aniCore;
            }
        }
    }();
    return Animate;

});