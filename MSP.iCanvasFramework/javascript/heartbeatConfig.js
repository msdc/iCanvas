/// <reference path="../framework/iCanvas_v1_1_1.js" />
/// <reference path="heartbeatLine.js" />
/// <reference path="jquery-2.0.3.js" />

window.onload = function () {
    var nCount = 13, aData = [], dObjDate = new Date(), dCurTime = dObjDate.getTime();
    dObjDate.setMinutes(0);
    dObjDate.setSeconds(0);

    var $$ = function (id) { return document.getElementById(id); }
    var ePopup = $$("popup");
    var ePopup_content = $$("content");
    var eCvs_c1 = $$("c1");
    var eCvs_c2 = $$("c2");
    // var eCvs_c3 = $$("c3");
    var arrow = $$("arrow");
    ePopup.onmouseleave = function () {
        this.style.display = "none";
    }


    $.ajax({
        url: "/js/getData.h",
        data: { timeunit: "hours", linecount: 2, pointcount: nCount, dataformat: "array" },
        type: "get",
        dataType: "json",
        async: true,
        success: function (data) {
            var heartbeat1 = heartbeatLineChart({
                cvsId: "c1",
                width: 785,
                height: 350,
                data: data,
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
                var str = [];
                for (var i = 0, ci; ci = point.pointTag.tag[i]; i++) {
                    str.push("<a href=" + ci.url + ">" + ci.text + "</a>");
                }
                ePopup_content.innerHTML = str.concat();
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
                $.ajax({
                    url: "/js/getData.h",
                    data: { timeunit: "hours", linecount: 2, pointcount: nCount, dataformat: "one", t: new Date().getTime() },
                    type: "get",
                    dataType: "json",
                    async: false,
                    success: function (data) {
                        heartbeat1.addData(data);
                        heartbeat1.activedRenderAnimation();
                    }
                });
                setTimeout(arguments.callee, 3600000);
            }, 3600000);
        }
    });

    /*空气质量（AQI）监控图*/
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
    //aData = [];
    //for (var ii = 0; ii < 2; ii++) {
    //    var adata = [];
    //    for (var i = nCount; i >= 0; i--) {
    //        var _time = dCurTime - i * 3600000;
    //        var _result = buildData1(_time, 200, 500);
    //        adata.push(_result);
    //    }
    //    aData.push(adata);
    //}
    //function buildData1(ms, min, max) {
    //    max = max || 500;
    //    min = min || 0;
    //    var dObj = ms == undefined ? new Date() : new Date(ms);
    //    var sKey = dObj.getHours() + ":00";
    //    var nData = parseInt(Math.random() * max, 10);
    //    nData = nData < min ? nData + min : nData;
    //    return { key: sKey, value: nData, links: [{ text: "", url: "" }, { text: "", url: "" }] };
    //}



    /*环境质量舆情指数监控图*/

    /*
    * 初始化数据
    */

    $.ajax({
        url: "/js/getData.h",
        data: { timeunit: "day", linecount: 1, pointcount: nCount, dataformat: "array" },
        type: "get",
        dataType: "json",
        async: true,
        success: function (data) {
            var heartbeat2 = heartbeatLineChart({
                cvsId: "c2",
                width: 785,
                height: 160,
                data: data,
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
            heartbeat2.onPointClick(function (point, coord) {
                var _offsetLeft = parseInt(eCvs_c2.offsetLeft, 10);
                var _offsetTop = parseInt(eCvs_c2.offsetTop, 10);
                // if ((parseInt(point.text, 10) > 300 && point.pointTag == "0") || (parseInt(point.text, 10) > 90 && point.pointTag == "1")) {

                var str = [];
                for (var i = 0, ci; ci = point.pointTag.tag[i]; i++) {
                    str.push("<a href=" + ci.url + ">" + ci.text + "</a>");
                }
                ePopup_content.innerHTML = str.concat();
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
            heartbeat2.addMoveCompletedHandler(function (value) {
                //$$("txt").innerHTML = value[0];
            });
        }
    })


}
