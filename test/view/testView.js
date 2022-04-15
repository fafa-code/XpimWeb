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
					xpimManager.propertyList.refreshProperties(p.nodeJArray);
				}
			},
			toolbar: { 
				buttonJArray: [{
					id: "homeViewport",
					name: "主视角",
					imgUrl: "../../plugins/xpimToolbar/images/home.png",
					onButtonClick: function(p){
						xpimManager.viewer.setNormalViewport(xpimNormalViewport.init); 
					}
				},
				{
					id: "xpimTree",
					name: "结构树",
					imgUrl: "../../plugins/xpimToolbar/images/tree.png",
					onButtonClick: function(p){
						if(xpimManager.tree.getVisible()){
							xpimManager.tree.hide();
						}
						else{
							xpimManager.tree.show();
						}
					}
				},
				{
					id: "xpimProperty",
					name: "属性",
					imgUrl: "../../plugins/xpimToolbar/images/property.png",
					onButtonClick: function(p){
						if(xpimManager.propertyList.getVisible()){
							xpimManager.propertyList.hide();
						}
						else{
							xpimManager.propertyList.show();
						}
					}
				}]
			},
			tree: {
				title: "结构",
				onNodeClick: function(p){
					var nodeId = p.nodeJson.id;
					var selectNodeIds = null;
					if(p.isLeaf){
						selectNodeIds = [nodeId];
					}
					else{
						selectNodeIds = xpimManager.tree.getChildNodeIds(nodeId);
					}
					xpimManager.viewer.selectObject3Ds(selectNodeIds); 
				},
				onNodeCheckStatusChange: function(p){
					xpimManager.viewer.setObject3DsVisible(p.changedNodeIds, p.checked);
				}
			},
			propertyList: {
				title: "属性"
			}
		}
	});			
});  