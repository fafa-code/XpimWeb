//XpimWeb 属性列表
function XpimPropertyList(){	
	//当前对象
	var thatXpimPropertyList = this;
	
	//containerId
	this.containerId = null;
	
	//xpim manager
	this.manager = null;  

	//事件
	this.eventFunctions = {};	
	this.addEventFunction = function(eventName, func){
		var allFuncs = thatXpimPropertyList.eventFunctions[eventName];
		if(allFuncs == null){
			allFuncs = new Array();
			thatXpimViewer.eventFunctions[eventName] = allFuncs;
		}
		allFuncs.push(func);
	}	
	this.doEventFunction = function(eventName, p){
		var allFuncs = thatXpimPropertyList.eventFunctions[eventName];
		if(allFuncs != null){
			for(var i = 0; i < allFuncs.length; i++){
				var func = allFuncs[i];
				func(p);
			}
		} 
	}
	 
	//初始化
	this.init = function(p){
		thatXpimPropertyList.containerId = p.containerId;
		thatXpimPropertyList.manager = p.manager; 		       
		thatXpimPropertyList.showPropertyList(p.config.title);
		thatXpimPropertyList.refreshProperties(null);
		$("#" + thatXpimPropertyList.containerId).find(".xpimPropertyListCloseBtn").click(function(){
			thatXpimPropertyList.hide();
		});
	}
	
	//隐藏
	this.hide = function(){
		$("#" + thatXpimPropertyList.containerId).find(".xpimPropertyListContainer").css({"display": "none"});
	}
	
	//隐藏
	this.show = function(){
		$("#" + thatXpimPropertyList.containerId).find(".xpimPropertyListContainer").css({"display": "block"});
	}
	
	//获取显示状态
	this.getVisible = function(){
		return $("#" + thatXpimPropertyList.containerId).find(".xpimPropertyListContainer").css("display") == "block";
	}
	
	//显示结构树
	this.showPropertyList = function(title, propertyJArray){
		//构造html
		var listHtml = thatXpimPropertyList.getListHtml(propertyJArray);
		$("#" + thatXpimPropertyList.containerId).append(listHtml);
		$("#" + thatXpimPropertyList.containerId).find(".xpimPropertyListTitle").text(title);  
	} 
	
	//获取list html
	this.getListHtml = function(propertyJArray){
			var listHtml = "<div class=\"xpimPropertyListContainer\">";
			listHtml += "<div class=\"xpimPropertyListBackground\"></div>";
			listHtml += "<div class=\"xpimPropertyListHeader\">";
			listHtml += "<div class=\"xpimPropertyListTitle\"></div>";
			listHtml += "<div class=\"xpimPropertyListSubTitle\"></div>";
			listHtml += "<div class=\"xpimPropertyListCloseBtn\">×</div>";
			listHtml += "</div>";
			listHtml += "<div class=\"xpimPropertyListInnerContainer\">";
			listHtml += "</div>";
			listHtml += "</div>";
			return listHtml; 
	} 
	
	this.refreshProperties = function(nodeJArray){
		var propertyListInnerContainer = $("#" + thatXpimPropertyList.containerId).find(".xpimPropertyListInnerContainer")[0];
		var propertyListSubTitle = $("#" + thatXpimPropertyList.containerId).find(".xpimPropertyListSubTitle")[0];
		if(nodeJArray == null || nodeJArray.length == 0){
			$(propertyListSubTitle).html(" - 请选择单个图元查看属性"); 
			$(propertyListInnerContainer).html("已选择 0 个图元");
		}
		else if(nodeJArray.length > 1){ 
			$(propertyListSubTitle).html(" - 请选择单个图元查看属性"); 
			$(propertyListInnerContainer).html("已选择 " + nodeJArray.length + " 个图元");
		}
		else{
			var allPropertyHtml = "";
			var nodeJson = nodeJArray[0];
			for(var i = 0; i < nodeJson.propertyJArray.length; i++){
				var propertyJson = nodeJson.propertyJArray[i];
				var propertyHtml = thatXpimPropertyList.getPropertyHtml(propertyJson);
				allPropertyHtml += propertyHtml;
			}
			$(propertyListSubTitle).html(" - " + nodeJson.name);
			$(propertyListInnerContainer).html(allPropertyHtml);
		}
	}
	
	//获取property html
	this.getPropertyHtml = function(propertyJson){
		var propertyHtml = "";
		propertyHtml += "<div class=\"xpimPropertyListItemContainer\">";
		propertyHtml += "<div class=\"xpimPropertyListItemTitle\">" + cmnPcr.html_encode(propertyJson.name) + "</div>";
		propertyHtml += "<div class=\"xpimPropertyListItemValue\">" + cmnPcr.html_encode(propertyJson.value) + "</div>";
		propertyHtml += "</div>";
		return propertyHtml;
	}
}