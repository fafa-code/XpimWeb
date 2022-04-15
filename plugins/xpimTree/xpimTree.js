//XpimWeb 模型结构树
function XpimTree(){	
	//当前对象
	var thatXpimTree = this;
	
	//containerId
	this.containerId = null;
	
	//xpim manager
	this.manager = null; 
	
	//所有节点数据（树形）
	this.nodeJArray = null;

	//节点ID与json
	this.id2NodeJsonMap = null;

	//事件
	this.eventFunctions = {};	
	this.addEventFunction = function(eventName, func){
		var allFuncs = thatXpimTree.eventFunctions[eventName];
		if(allFuncs == null){
			allFuncs = new Array();
			thatXpimTree.eventFunctions[eventName] = allFuncs;
		}
		allFuncs.push(func);
	}	
	this.doEventFunction = function(eventName, p){
		var allFuncs = thatXpimTree.eventFunctions[eventName];
		if(allFuncs != null){
			for(var i = 0; i < allFuncs.length; i++){
				var func = allFuncs[i];
				func(p);
			}
		} 
	}
	
	//获取节点json
	this.getNodeJson = function(nodeId){
		return thatXpimTree.id2NodeJsonMap[nodeId];
	}
	 
	//初始化
	this.init = function(p){
		thatXpimTree.containerId = p.containerId;
		thatXpimTree.manager = p.manager; 
		
		thatXpimTree.id2NodeJsonMap = {};
		thatXpimTree.initId2NodeJsonMap(p.manager.xpimObject.treeJson.children, thatXpimTree.id2NodeJsonMap);

		if(p.config.onNodeClick != null){
			thatXpimTree.addEventFunction("onNodeClick", p.config.onNodeClick); 
		} 
		if(p.config.onNodeCheckStatusChange != null){
			thatXpimTree.addEventFunction("onNodeCheckStatusChange", p.config.onNodeCheckStatusChange); 
		} 
		       
		thatXpimTree.showTree(p.config.title, p.manager.xpimObject.treeJson.children);

		$("#" + thatXpimTree.containerId).find(".xpimTreeCloseBtn").click(function(){
			thatXpimTree.hide();
		});
	}
	
	//隐藏
	this.hide = function(){
		$("#" + thatXpimTree.containerId).find(".xpimTreeContainer").css({"display": "none"});
	}
	
	//隐藏
	this.show = function(){
		$("#" + thatXpimTree.containerId).find(".xpimTreeContainer").css({"display": "block"});
	}
	
	//获取显示状态
	this.getVisible = function(){
		return $("#" + thatXpimTree.containerId).find(".xpimTreeContainer").css("display") == "block";
	}
	
	//显示结构树
	this.showTree = function(title, nodeJArray){
		//构造html
		var treeHtml = thatXpimTree.getTreeHtml(nodeJArray);
		$("#" + thatXpimTree.containerId).append(treeHtml);
		$("#" + thatXpimTree.containerId).find(".xpimTreeTitle").text(title);
		
		//点击节点名称事件
		$("#" + thatXpimTree.containerId).find(".xpimTreeNodeTitle").click(function(){
			var nodeId = $(this).parent().parent().attr("nodeId");
			var nodeJson = thatXpimTree.id2NodeJsonMap[nodeId];
			thatXpimTree.doEventFunction("onNodeClick", { 
				nodeJson: nodeJson,
				isLeaf: nodeJson.children == null || nodeJson.children.length == 0
			});
		});

		//点击折叠或展开
		$("#" + thatXpimTree.containerId).find(".xpimTreeNode").click(function(){
			if($(this).hasClass("xpimTreeNodeExpand")){
				$(this).removeClass("xpimTreeNodeExpand");
				$(this).addClass("xpimTreeNodeCollapse");
				$(this).parent().parent().children(".xpimTreeChildrenContainer").addClass("xpimTreeHidden");
			}
			else{
				$(this).removeClass("xpimTreeNodeCollapse");
				$(this).addClass("xpimTreeNodeExpand");
				$(this).parent().parent().children(".xpimTreeChildrenContainer").removeClass("xpimTreeHidden");
			}
		});
		
		//复选框
		$("#" + thatXpimTree.containerId).find(".xpimTreeNodeCheckbox").click(function(){
			var nodeItem = $(this).parent().parent()[0];
			var changedNodeIds = new Array();
			var checked = $(this).hasClass("xpimTreeNodeCheckboxNone") || $(this).hasClass("xpimTreeNodeCheckboxPart");  
			
			//改变选中状态，且更新所有children
			thatXpimTree.setNodeCheckStatus(nodeItem, checked, changedNodeIds);
			
			//更新所有的父级节点
			thatXpimTree.refreshAllParentCheckStatus(nodeItem);
			
			//出发选中状态改变事件
			thatXpimTree.doEventFunction("onNodeCheckStatusChange", {
				checked: checked,
				changedNodeIds: changedNodeIds
			});
			
		});
	}
	
	//设置节点选中状态
	this.setNodeCheckStatus = function(nodeItem, checked, changedNodeIds){
		var checkbox = $(nodeItem).children(".xpimTreeNodeHeader").children(".xpimTreeNodeCheckbox");
		var childrenContainers = $(nodeItem).children(".xpimTreeChildrenContainer");
		var hasChildren = childrenContainers.length != 0;
		if(hasChildren){
			var childrenNodeItems = $(childrenContainers[0]).children(".xpimTreeNodeContainer");
			for(var i = 0; i < childrenNodeItems.length; i++){
				var childNodeItem = childrenNodeItems[i];
				thatXpimTree.setNodeCheckStatus(childNodeItem, checked, changedNodeIds);
			}
		}	
		else{
			//记录变化状态的node
			if((checked && $(checkbox).hasClass("xpimTreeNodeCheckboxNone"))
				||(!checked && $(checkbox).hasClass("xpimTreeNodeCheckboxChecked"))){
				var nodeId = $(nodeItem).attr("nodeId");
				changedNodeIds.push(nodeId); 
			}
		}
		if(checked){
			$(checkbox).removeClass("xpimTreeNodeCheckboxPart");
			$(checkbox).removeClass("xpimTreeNodeCheckboxNone");
			$(checkbox).addClass("xpimTreeNodeCheckboxChecked");
		}
		else {
			$(checkbox).removeClass("xpimTreeNodeCheckboxPart");
			$(checkbox).removeClass("xpimTreeNodeCheckboxChecked");
			$(checkbox).addClass("xpimTreeNodeCheckboxNone");
		}
			
	} 
	
	//刷新所有父节点选中状态（递归）
	this.refreshAllParentCheckStatus = function(nodeItem){
		var parentNodeItem = $(nodeItem).parent().parent()[0];
		while($(parentNodeItem).hasClass("xpimTreeNodeContainer")){
			var checkStatus = thatXpimTree.getAllChildrenCheckStatus(parentNodeItem);
			var checkbox = $(parentNodeItem).children(".xpimTreeNodeHeader").children(".xpimTreeNodeCheckbox");
			if(checkStatus.allChecked){
				$(checkbox).removeClass("xpimTreeNodeCheckboxPart");
				$(checkbox).removeClass("xpimTreeNodeCheckboxNone");
				$(checkbox).addClass("xpimTreeNodeCheckboxChecked");
			}
			else if(checkStatus.allUnchecked){
				$(checkbox).removeClass("xpimTreeNodeCheckboxPart");
				$(checkbox).removeClass("xpimTreeNodeCheckboxChecked");
				$(checkbox).addClass("xpimTreeNodeCheckboxNone");
			}
			else {
				$(checkbox).removeClass("xpimTreeNodeCheckboxChecked");
				$(checkbox).removeClass("xpimTreeNodeCheckboxNone");
				$(checkbox).addClass("xpimTreeNodeCheckboxPart");
			}
			parentNodeItem = $(parentNodeItem).parent().parent();
		}
	}
	
	//获取子节点选中状态
	this.getAllChildrenCheckStatus = function(parentNodeItem){
		var allChecked = true;
		var allUnchecked = true;
		var childrenContainer = $(parentNodeItem).children(".xpimTreeChildrenContainer")[0];
		var allChildrenNodeItems = $(childrenContainer).children(".xpimTreeNodeContainer").children(".xpimTreeNodeHeader").children(".xpimTreeNodeCheckbox");
		for(var i = 0; i < allChildrenNodeItems.length; i++){
			var childNodeItem = allChildrenNodeItems[i];
			if($(childNodeItem).hasClass("xpimTreeNodeCheckboxNone")){
				allChecked = false;
			}
			else if($(childNodeItem).hasClass("xpimTreeNodeCheckboxPart")){
				allChecked = false;
				allUnchecked = false;
			}
			else{
				allUnchecked = false;
			}
		}
		return {
			allChecked: allChecked,
			allUnchecked: allUnchecked
		};
	}
	
	//初始化节点id与json对照
	this.initId2NodeJsonMap = function(nodeJArray, id2NodeJsonMap){
		if(nodeJArray != null && nodeJArray.length > 0){
			for(var i = 0; i < nodeJArray.length; i++){
				var nodeJson = nodeJArray[i];
				id2NodeJsonMap[nodeJson.id] = nodeJson;
				thatXpimTree.initId2NodeJsonMap(nodeJson.children, id2NodeJsonMap);
			}
		}
	}

	//该节点下的所有叶节点id
	this.getChildNodeIds = function(nodeId){
		var leafNodes = $("#" + thatXpimTree.containerId).find(".xpimTreeNodeContainer[nodeId='" + nodeId + "']").find(".xpimTreeNodeContainer[isLeaf='true']");
		var nodeIds = new Array();
		for(var i = 0; i < leafNodes.length; i++){
			var leafNode = leafNodes[i];
			nodeIds.push($(leafNode).attr("nodeId"));
		}
		return nodeIds;
	}
	
	//该节点下的所有叶节点Json
	this.getChildNodeJsons = function(nodeId){
		var leafNodes = $("#" + thatXpimTree.containerId).find(".xpimTreeNodeContainer[nodeId='" + nodeId + "']").find(".xpimTreeNodeContainer[isLeaf='true']");
		var nodeJsons = new Array();
		for(var i = 0; i < leafNodes.length; i++){
			var leafNode = leafNodes[i];
			var leafNodeId = $(leafNode).attr("nodeId");
			nodeJsons.push(thatXpimTree.id2NodeJsonMap[leafNodeId]);
		}
		return nodeJsons;
	}
	
	//是否包含子节点
	this.checkHasChildren = function(nodeId){
		return $("#" + thatXpimTree.containerId).find(".xpimTreeNodeContainer[nodeId='" + nodeId + "']").attr("isLeaf") == "false";
	}	
	
	//获取树html
	this.getTreeHtml = function(nodeJArray){
		var treeHtml = "<div class=\"xpimTreeContainer\">";
		treeHtml += "<div class=\"xpimTreeBackground\"></div>";
		treeHtml += "<div class=\"xpimTreeHeader\">";
		treeHtml += "<div class=\"xpimTreeTitle\"></div>";
		treeHtml += "<div class=\"xpimTreeCloseBtn\">×</div>";
		treeHtml += "</div>";
		treeHtml += "<div class=\"xpimTreeInnerContainer\">";
		for(var i = 0; i < nodeJArray.length; i++){
			var nodeJson = nodeJArray[i];
			var childNodeHtml = thatXpimTree.getNodeHtml(nodeJson, 1);
			treeHtml += childNodeHtml;
		}
		treeHtml += "</div>";
		treeHtml += "</div>";
		return treeHtml;
	}
	
	//获取node节点html
	this.getNodeHtml = function(nodeJson, levelIndex){
		var hasChildren = nodeJson.children != null && nodeJson.children.length > 0;
		var expanded = levelIndex == 0;
		var nodeHtml = "";
		nodeHtml += "<div class=\"xpimTreeNodeContainer\" nodeId=\"" + nodeJson.id + "\" isLeaf=\"" + (hasChildren ? "false" : "true") + "\">";
		nodeHtml += "<div class=\"xpimTreeNodeHeader\">";
		nodeHtml += ("<div class=\"xpimTreeNodeCheckbox xpimTreeNodeCheckboxChecked\"></div>");
		nodeHtml += (hasChildren ? ("<div class=\"xpimTreeNode " + (expanded ? "xpimTreeNodeExpand" : "xpimTreeNodeCollapse") + "\"></div>") : "");
		nodeHtml += ("<div class=\"xpimTreeNodeTitle\">" + cmnPcr.html_encode(nodeJson.name) + "</div>");
		nodeHtml += "</div>";
		if(hasChildren){
			nodeHtml += ("<div class=\"xpimTreeChildrenContainer" + (expanded ? "" : " xpimTreeHidden") + "\">");
			for(var i = 0; i < nodeJson.children.length; i++){
				var childNodeJson = nodeJson.children[i];
				var childNodenodeHtml = thatXpimTree.getNodeHtml(childNodeJson, levelIndex + 1);
				nodeHtml += childNodenodeHtml;
			}
			nodeHtml += "</div>";
		}
		nodeHtml += "</div>";
		return nodeHtml;
	}
}