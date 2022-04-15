//XpimWeb 标注
function XpimTag(){
	
	//当前对象
	var thatXpimTag = this;
	
	//containerId
	this.containerId = null;
	
	//xpim manager
	this.manager = null;  

	//节点ID与tag object3D
	this.nodeId2TagObject3D = null;

	//初始化
	this.init = function(p){
		thatXpimTag.containerId = p.containerId;
		thatXpimTag.manager = p.manager;
		thatXpimTag.nodeId2TagObject3D = {};
		thatXpimTag.initContainer();
	}
	
	//添加标注
	this.addTag = function(p){ 
		var existTag3D = thatXpimTag.nodeId2TagObject3D[p.nodeId];
		if(existTag3D != null){
			thatXpimTag.removeTag(p);
		}
		var object3D = thatXpimTag.manager.viewer.getObject3DById(p.nodeId);		
		if(object3D == null){
			throw "Unknown object3D. nodeId = " + p.nodeId;
		}
		p.tagId = cmnPcr.getRandomValue();
		var tagHtml = thatXpimTag.getTagHtml(p);
		$("#" + thatXpimTag.containerId).find(".xpimTagLayerContainer").append(tagHtml);
		var tagDiv = $("#" + p.tagId)[0]; 
		var tag2D = new THREE.CSS2DObject(tagDiv);
		tag2D.isTag = true;
		var posToRoot = thatXpimTag.manager.viewer.getPositionInRoot(object3D);
		if(p.shift == null){
			tag2D.position.set(posToRoot.x, posToRoot.y, posToRoot.z);		
		}
		else {
			tag2D.position.set(posToRoot.x + p.shift.x, posToRoot.y + p.shift.y, posToRoot.z + p.shift.z);		
		}
		var rootObject3D = thatXpimTag.manager.viewer.getRootObject3D(); 
		rootObject3D.add(tag2D);
		thatXpimTag.nodeId2TagObject3D[p.nodeId] = tag2D;
	}
	
	this.removeTag = function(p){
		var existTag3D = thatXpimTag.nodeId2TagObject3D[p.nodeId];
		if(existTag3D != null){
			var rootObject3D = thatXpimTag.manager.viewer.getRootObject3D(); 
			rootObject3D.remove(existTag3D);
			delete thatXpimTag.nodeId2TagObject3D[p.nodeId];			
		}
	}
	
	//获取tag html
	this.getTagHtml = function(p){  
		var html = "<div class=\"xpimTagContainer\" id=\"" + p.tagId + "\" nodeId=\"" + p.nodeId + "\">"
		 	+ "<div class=\"xpimTagBackground\"></div>"
		 	+ "<div class=\"xpimTagContent\">" + cmnPcr.html_encode(p.content) + "</div>"
			+ "</div>"
		return html;
	}
	
	this.initContainer = function(){
		var html = "<div class=\"xpimTagLayerContainer\"></div>"
		$("#" + thatXpimTag.containerId).append(html);
	}
}