var xpimManager = null;  
$(document).ready(function(){
	xpimManager = new XpimManager();
	xpimManager.init({
		configs: {
			containerId: "xpimViewerContainerId",
			loader: {
				zipJsDir: "../../core/js/zip/", 
				xpimFileUrl: "../../models/building5.xpim"
			},
			viewer: {
				showShadow: false,
				lod: "LOD300",
				onSelectChanged: function(p){
					if(p.nodeJArray.length > 0){
						var nodeId = p.nodeJArray[0].id;
						$("#tagNodeId").val(nodeId);
					}
					else{
						$("#tagNodeId").val("");
					}
				}				
			},
			tag: {}
		}
	});
	
	$("#tagAddBtnId").click(function(){
		var nodeId = $("#tagNodeId").val();
		if(nodeId.length != 0){
			var content = $("#tagContentId").val();
			xpimManager.tag.addTag({
				nodeId: nodeId,
				content: content,
				shift: {
					x: 0,
					y: 1,
					z: 0
				}
			});
		}
		else{
			msgBox.alert({info: "请先选择图元"});
		}
	});
	
	$("#tagRemoveBtnId").click(function(){
		var nodeId = $("#tagNodeId").val();
		if(nodeId.length != 0){
			xpimManager.tag.removeTag({
				nodeId: nodeId
			});
		}
		else{
			msgBox.alert({info: "请先选择图元"});
		}
	});
	
});  