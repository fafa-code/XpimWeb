//XpimWeb 工具栏
function XpimToolbar(){
	
	//当前对象
	var thatXpimToolbar = this;
	
	//containerId
	this.containerId = null;
	
	//xpim manager
	this.manager = null; 
	
	//所有工具栏按钮json
	this.buttonJArray = null; 

	//节点ID与json
	this.id2ButtonJsonMap = null;

	//初始化
	this.init = function(p){
		thatXpimToolbar.containerId = p.containerId;
		thatXpimToolbar.manager = p.manager; 
		thatXpimToolbar.buttonJArray = p.config.buttonJArray;		
		thatXpimToolbar.id2ButtonJsonMap = {};
		thatXpimToolbar.initId2ButtonJsonMap(p.config.buttonJArray, thatXpimToolbar.id2ButtonJsonMap);
		thatXpimToolbar.showToolbar(p.config.buttonJArray); 
	}
	
	//显示工具栏
	this.showToolbar = function(buttonJArray){
		//构造html
		var toolbarHtml = thatXpimToolbar.getToolbarHtml(buttonJArray);
		$("#" + thatXpimToolbar.containerId).append(toolbarHtml); 
		
		//水平居中
		var toolbarContainer = $("#" + thatXpimToolbar.containerId).find(".xpimToolbarContainer")[0];
		var toolbarWidth = $(toolbarContainer).width();
		$(toolbarContainer).css({"margin-left": (-toolbarWidth / 2) + "px"});
		
		//点击节点名称事件
		$("#" + thatXpimToolbar.containerId).find(".xpimToolbarBtnContainer").click(function(){
			var buttonId = $(this).attr("buttonId");
			var buttonJson = thatXpimToolbar.id2ButtonJsonMap[buttonId];
			buttonJson.onButtonClick({});
		}); 
	}
 
	//初始化节点id与json对照
	this.initId2ButtonJsonMap = function(buttonJArray, id2ButtonJsonMap){
		if(buttonJArray != null && buttonJArray.length > 0){
			for(var i = 0; i < buttonJArray.length; i++){
				var buttonJson = buttonJArray[i];
				id2ButtonJsonMap[buttonJson.id] = buttonJson;
				thatXpimToolbar.initId2ButtonJsonMap(buttonJson.children, id2ButtonJsonMap);
			}
		}
	}
	
	//获取工具栏html
	this.getToolbarHtml = function(buttonJArray){
		var toolbarHtml = "<div class=\"xpimToolbarContainer\">";
		toolbarHtml += "<div class=\"xpimToolbarBackground\"></div>";
		toolbarHtml += "<div class=\"xpimToolbarInnerContainer\">";
		for(var i = 0; i < buttonJArray.length; i++){
			var buttonJson = buttonJArray[i];
			var childButtonHtml = thatXpimToolbar.getButtonHtml(buttonJson);
			toolbarHtml += childButtonHtml;
		}
		toolbarHtml += "</div>";
		toolbarHtml += "</div>";
		return toolbarHtml;
	}
	
	//获取button html
	this.getButtonHtml = function(buttonJson){  
		var buttonHtml = "";
		buttonHtml += "<div class=\"xpimToolbarBtnContainer\" buttonId=\"" + buttonJson.id + "\" title=\"" + cmnPcr.html_encode(buttonJson.name) + "\">";
		buttonHtml += ("<img class=\"xpimToolbarBtnImg\" src=\"" + buttonJson.imgUrl + "\" />");
		buttonHtml += "</div>";  
		return buttonHtml;
	}
}