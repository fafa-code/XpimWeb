//XpimWeb 加载器
function XpimLoader(){
	
	//当前对象
	var thatXpimLoader = this;
	
	//containerId
	this.containerId = null;
	
	//xpim manager
	this.manager = null;  
	
	//xpimFileUrl
	this.xpimFileUrl = null;	
		
	//3D模型相关
	this.xpimObject = {
		pimJson: null,
		parametersJson: null,
		meshesJson: null,
		treeJson: null		
	};
	
	//zip js dir
	this.zipJsDir = null;
	
	//事件
	this.eventFunctions = {};	
	this.addEventFunction = function(eventName, func){
		var allFuncs = thatXpimLoader.eventFunctions[eventName];
		if(allFuncs == null){
			allFuncs = new Array();
			thatXpimLoader.eventFunctions[eventName] = allFuncs;
		}
		allFuncs.push(func);
	}	
	this.doEventFunction = function(eventName, p){
		var allFuncs = thatXpimLoader.eventFunctions[eventName];
		if(allFuncs != null){
			for(var i = 0; i < allFuncs.length; i++){
				var func = allFuncs[i];
				func(p);
			}
		} 
	}

	//初始化
	this.init = function(p){
		thatXpimLoader.containerId = p.containerId;
		thatXpimLoader.manager = p.manager;   
		thatXpimLoader.xpimFileUrl = p.config.xpimFileUrl;	
		thatXpimLoader.zipJsDir = p.config.zipJsDir;
		if(p.config.afterLoadXpimFile != null){
			thatXpimLoader.addEventFunction("afterLoadXpimFile", p.config.afterLoadXpimFile);
		}		
		thatXpimLoader.show();		
		thatXpimLoader.loadXpim(p.config.xpimFileUrl); 
	}

    //加载读取xpim文件
    this.loadXpim = function(xpimFileUrl){    	
    	thatXpimLoader.showStatus({
    		status: "Loading",
    		message: "Loading xpim file. (1/8)"
    	});
    	
    	//加载压缩文件
    	zip.workerScriptsPath = thatXpimLoader.zipJsDir;
		var zipFs = new zip.fs.FS();  
		zipFs.importHttpContent(xpimFileUrl, false, function(){ 
			thatXpimLoader.showStatus({
	    		status: "Reading",
	    		message: "Reading xpim file. (2/8)"
	    	});
	    	
			//处理root.pim文件		
			var pimEntry = zipFs.root.getChildByName("root.pim");
			pimEntry.getText(function(data) {  
				thatXpimLoader.xpimObject.pimJson = cmnPcr.strToJson(data);
				thatXpimLoader.showStatus({
    	    		status: "PIMProcessed",
    	    		message: "PIM data processed. (3/8)"
    	    	});    	    	
				thatXpimLoader.showXpimInViewer();  
	    	});  
			
			//处理mesh文件
			var meshesEntry = zipFs.root.getChildByName("meshes"); 
			meshesEntry.getText(function(data) {  
				thatXpimLoader.xpimObject.meshesJson = cmnPcr.strToJson(data);
				thatXpimLoader.showStatus({
    	    		status: "MeshesProcessed",
    	    		message: "Meshes data processed. (4/8)"
    	    	});    	    	
				thatXpimLoader.showXpimInViewer();  
	    	});  
				
			//处理parameter文件
			var parametersEntry = zipFs.root.getChildByName("parameters");
			parametersEntry.getText(function(data) {  
				thatXpimLoader.xpimObject.parametersJson = cmnPcr.strToJson(data);
				thatXpimLoader.showStatus({
    	    		status: "ParametersProcessed",
    	    		message: "Parameters data processed. (5/8)"
    	    	});    	    	
				thatXpimLoader.showXpimInViewer();
	    	});   
				
			//处理parameter文件
			var treeEntry = zipFs.root.getChildByName("tree");
			treeEntry.getText(function(data) {  
				thatXpimLoader.xpimObject.treeJson = cmnPcr.strToJson(data);
				thatXpimLoader.showStatus({
    	    		status: "TreeDataProcessed",
    	    		message: "Tree data processed. (6/8)"
    	    	});    	    	
				thatXpimLoader.showXpimInViewer();
	    	});   
		}, 
		function(er){
			throw er;
		});
    }
    
    this.showXpimInViewer = function(){
    	var xpimObject = thatXpimLoader.xpimObject;
    	if(xpimObject.pimJson != null
		  && xpimObject.meshesJson != null
		  && xpimObject.parametersJson != null){
    		thatXpimLoader.showStatus({
        		status: "Creating",
        		message: "Creating 3d objects. (7/8)"
        	});
    		
    		thatXpimLoader.doEventFunction("afterLoadXpimFile", {
    			xpimObject: xpimObject
    		})

    		thatXpimLoader.showStatus({
        		status: "Completed",
        		message: "Completed."
        	});
    		thatXpimLoader.hide();
    	}
	}
	
	//显示
	this.show = function(){
		var winHtml = thatXpimLoader.getWinHtml();
		$("#" + thatXpimLoader.containerId).append(winHtml);		 
	} 
	
	//显示状态
	this.showStatus = function(p){
		$("#" + thatXpimLoader.containerId).find(".statusText").html(p.message);
	}
	
	//隐藏
	this.hide = function(p){
		$("#" + thatXpimLoader.containerId).find(".statusContainer").fadeOut(2000);
	}
	
	//获取html
	this.getWinHtml = function(){
		var winHtml = "<div class=\"statusContainer\">"
			+ "<div class=\"statusInnerContainer\">"
			+ "<div class=\"statusBackground\"></div>"
			+ "<div class=\"statusText\"></div>"
			+ "</div>"
			+ "</div>";
		return winHtml;
	}
}