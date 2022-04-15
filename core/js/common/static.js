//字段类型
var valueType={string:"string", decimal:"decimal", boolean:"boolean", date:"date", time:"time", object:"object"};

//消息对话框
var msgBox = new MsgBox();

//一般通用处理
var cmnPcr = new CommonProcessor(); 

//处理jquery1.9后不支持$.browser的问题
$.browser={};(function(){$.browser.msie=false; $.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)./)){ $.browser.msie=true;$.browser.version=RegExp.$1;}})();

//viewer的视角
var xpimNormalViewport = {init: "init", front: "front", back: "back", top: "top", bottom: "bottom", left: "left", right: "right"};

//viewer的状态
var xpimViewerStatus = {normalView: "normalView", specialView: "specialView", disable: "disable", edit: "edit"};