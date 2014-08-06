/// <reference path="../framework/iCanvas_v1_1_1.js" />
/// <reference path="heartbeatLine.js" />

window.addEventListener("load", function () {
    var nCount = 13, aData = [], aDatax = [], aLabels = [], dObjDate = new Date(), dCurTime = dObjDate.getTime();
    dObjDate.setMinutes(0);
    dObjDate.setSeconds(0);

    var $$ = function (id) { return document.getElementById(id); }
    var ePopup = $$("popup");
    var eCvs_c1 = $$("c1");
    var eCvs_c2 = $$("c2");
    var eCvs_c3 = $$("c3");
    var arrow = $$("arrow");
    ePopup.onmouseleave = function () {
        this.style.display = "none";
    }

    /*空气质量（AQI）监控图*/
    for (var i = nCount; i >= 0; i--) {
        var _time = dCurTime - i * 3600000;
        var _result = buildData(_time, 200, 500);
        aData.push(_result.v);
        aDatax.push(buildData(_time, 0, 120).v);
        aLabels.push(_result.k);
    }
    function buildData(ms, min, max) {
        max = max || 500;
        min = min || 0;
        var dObj = ms == undefined ? new Date() : new Date(ms);
        var sKey = dObj.getHours() + ":00";
        var nData = parseInt(Math.random() * max, 10);
        nData = nData < min ? nData + min : nData;
        return { k: sKey, v: nData };
    }

    //aData = [
    //    [
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] }

    //    ], [
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] },
    //        { key: "", value: "", links: [{ text: "", url: "" }, { text: "", url: "" }] }
    //    ]
    //];
    aData = [];


    for (var ii = 0; ii < 2; ii++) {
        var adata = [];
        for (var i = nCount; i >= 0; i--) {
            var _time = dCurTime - i * 3600000;
            var _result = buildData1(_time, 200, 500);
            adata.push(_result);
        }
        aData.push(adata);
    }
    function buildData1(ms, min, max) {
        max = max || 500;
        min = min || 0;
        var dObj = ms == undefined ? new Date() : new Date(ms);
        var sKey = dObj.getHours() + ":00";
        var nData = parseInt(Math.random() * max, 10);
        nData = nData < min ? nData + min : nData;
        return { key: sKey, value: nData, links: [{ text: "", url: "" }, { text: "", url: "" }] };
    }

    var heartbeat1 = heartbeatLineChart({
        cvsId: "c1",
        width: 850,
        height: 396,
        data: aData,       
        pointCount: nCount,
        lineWidth: 4,
        pointRadius: 7,
        axisLinePosition: [80, 100, 120, 300, 500],
        axisRange: [0, 500],
        originalValue: 0,
        lineColor: ["#F48029", "#00B294"],
        pointColor: ["#F48029", "#00B294"],
        pointFontColor: ["#F48029", "#00B294"]
    });
    heartbeat1.onPointClick(function (point, coord) {
        var _offsetLeft = parseInt(eCvs_c1.offsetLeft, 10);
        var _offsetTop = parseInt(eCvs_c1.offsetTop, 10);
        // if ((parseInt(point.text, 10) > 300 && point.pointTag == "0") || (parseInt(point.text, 10) > 90 && point.pointTag == "1")) {
        ePopup.style.cssText = "display:block;border-color:" + point.backColor + ";";
        var _w = parseInt(ePopup.offsetWidth, 10);
        var _h = parseInt(ePopup.offsetHeight, 10);
        var _aw = parseInt(arrow.offsetWidth, 10);
        var _ah = parseInt(arrow.offsetHeight, 10);
        var duijiao = Math.sqrt(_aw * _aw + _ah * _ah);
        ePopup.style.cssText += "left:" + (_offsetLeft + point.cx - _w - point.r - duijiao / 2) + "px;top:" + (point.cy + _offsetTop - _h / 2) + "px";
        arrow.style.cssText = "margin-top:" + (_h - duijiao) / 2 + "px;border-color:" + point.backColor + ";";
        //}
    });
    heartbeat1.addMoveCompletedHandler(function (value) {
        //$$("txt").innerHTML = value[0];
    });


    setTimeout(function () {
        var _result = buildData(null, 200, 500);
        heartbeat1.addData(_result.k, [_result.v, buildData(null, 0, 120).v]);
        heartbeat1.activedRenderAnimation();
        setTimeout(arguments.callee, 3600000);
    }, 3600000);

    /*环境质量舆情指数监控图*/

    /*
    * 初始化数据
    */

    var aData1 = [];
    var aLabels1 = [];
    function initData(nCount) {
        var _result = { keys: [], values: [] }
        dCurTime = dObjDate.getTime();
        for (var i = nCount; i >= 0; i--) {
            _result.values.push(parseInt(Math.random() * 120, 10));
            var _objDate = new Date(dCurTime - i * 3600000 * 24);
            _result.keys.push((_objDate.getMonth() + 1) + "/" + _objDate.getDate());
        }
        return _result;
    }
    var result = initData(nCount);
    aData1 = result.values;
    aLabels1 = result.keys;
    var heartbeat2 = heartbeatLineChart({
        cvsId: "c2",
        width: 850,
        height: 160,
        data: [aData1],
        labels: aLabels1,
        pointCount: nCount,
        lineWidth: 4,
        pointRadius: 7,
        axisLinePosition: [80, 100, 120],
        axisRange: [0, 120],
        originalValue: 0,
        lineColor: "#00B294",
        pointColor: "#00B294",
        pointFontColor: "#00B294"
    });
    heartbeat2.onPointClick(function (point, coord) {
        var _offsetLeft = parseInt(eCvs_c2.offsetLeft, 10);
        var _offsetTop = parseInt(eCvs_c2.offsetTop, 10);
        if (parseInt(point.text, 10) > 90) {
            ePopup.style.cssText = "display:block;border-color:#00B294;";
            var _w = parseInt(ePopup.offsetWidth, 10);
            var _h = parseInt(ePopup.offsetHeight, 10);
            var _aw = parseInt(arrow.offsetWidth, 10);
            var _ah = parseInt(arrow.offsetHeight, 10);
            var duijiao = Math.sqrt(_aw * _aw + _ah * _ah);
            ePopup.style.cssText += "left:" + (_offsetLeft + point.cx - _w - point.r - duijiao / 2) + "px;top:" + (point.cy + _offsetTop - _h / 2) + "px";
            arrow.style.cssText = "margin-top:" + (_h - duijiao) / 2 + "px;border-color:#00B294;";
        }
    });
    heartbeat2.addMoveCompletedHandler(function (value) {
        $$("txt").innerHTML = value;
    });


    /*
    */

    var result = initData(nCount);
    aData2 = result.values;
    aLabels2 = result.keys;
    var heartbeat3 = heartbeatLineChart({
        cvsId: "c3",
        width: 850,
        height: 160,
        data: [aData2],
        labels: aLabels2,
        pointCount: nCount,
        lineWidth: 4,
        pointRadius: 7,
        axisLinePosition: [80, 100, 120],
        axisRange: [0, 120],
        originalValue: 0,
        lineColor: ["#00BCF2"],
        pointColor: ["#00BCF2"],
        pointFontColor: ["#00BCF2"]
    });
    heartbeat3.onPointClick(function (point, coord) {
        var _offsetLeft = parseInt(eCvs_c3.offsetLeft, 10);
        var _offsetTop = parseInt(eCvs_c3.offsetTop, 10);
        if (parseInt(point.text, 10) > 90) {
            ePopup.style.cssText = "display:block;border-color:#00BCF2;";
            var _w = parseInt(ePopup.offsetWidth, 10);
            var _h = parseInt(ePopup.offsetHeight, 10);
            var _aw = parseInt(arrow.offsetWidth, 10);
            var _ah = parseInt(arrow.offsetHeight, 10);
            var duijiao = Math.sqrt(_aw * _aw + _ah * _ah);
            ePopup.style.cssText += "left:" + (_offsetLeft + point.cx - _w - point.r - duijiao / 2) + "px;top:" + (point.cy + _offsetTop - _h / 2) + "px";
            arrow.style.cssText = "margin-top:" + (_h - duijiao) / 2 + "px;border-color:#00BCF2";
        }
    });
    heartbeat3.addMoveCompletedHandler(function (value) {
        $$("txt").innerHTML = value;
    });


});
