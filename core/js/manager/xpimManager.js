function XpimManager(){
	var thatXpimManager = this; 
	
	this.configs = null;

	//3D模型相关
	this.xpimObject = null;
	 
	//应用插件
	this.loader = null;
	
	this.viewer = null;
	
	this.tree = null;
	
	this.propertyList = null;
	
	this.toolbar = null;
	
	this.tag = null;
	
	this.init = function(initParams){
		thatXpimManager.configs = initParams.configs;
		thatXpimManager.initLoader(initParams.configs.loader);
	}
	
	this.initLoader = function(loaderConfig){
		thatXpimManager.loader = new XpimLoader(); 
		thatXpimManager.loader.init({
			containerId: thatXpimManager.configs.containerId,
			manager: thatXpimManager.manager,
			config:{
				xpimFileUrl: loaderConfig.xpimFileUrl,
				zipJsDir: loaderConfig.zipJsDir,
				afterLoadXpimFile: function(p){
					thatXpimManager.xpimObject = p.xpimObject;
	
					//viewer
					if(typeof XpimViewer != "undefined" && thatXpimManager.configs.viewer != null){
						thatXpimManager.initViewer(thatXpimManager.configs.viewer);
					}
					
					//toolbar 
					if(typeof XpimToolbar != "undefined" && thatXpimManager.configs.toolbar != null){
						thatXpimManager.initToolbar(thatXpimManager.configs.toolbar);
					}
					
					//tree 
					if(typeof XpimTree != "undefined" && thatXpimManager.configs.tree != null){
						thatXpimManager.initTree(thatXpimManager.configs.tree);
					}
					
					//propertyList 
					if(typeof XpimPropertyList != "undefined" && thatXpimManager.configs.propertyList != null){
						thatXpimManager.initPropertyList(thatXpimManager.configs.propertyList);
					}	
					
					//tag 
					if(typeof XpimTag != "undefined" && thatXpimManager.configs.tag != null){
						thatXpimManager.initTag(thatXpimManager.configs.tag);
					}				 				
				}
			}
		});	
	}

	this.initViewer = function(viewerConfig){
		thatXpimManager.viewer = new XpimViewer(); 
		thatXpimManager.viewer.init({
			containerId: thatXpimManager.configs.containerId,
			manager: thatXpimManager,
			config: viewerConfig
		});	
	}
	
	this.initTree = function(treeConfig){
		thatXpimManager.tree = new XpimTree(); 
		thatXpimManager.tree.init({
			containerId: thatXpimManager.configs.containerId,
			manager: thatXpimManager,
			config: treeConfig
		});
	}
	
	this.initTag = function(tagConfig){
		thatXpimManager.tag = new XpimTag(); 
		thatXpimManager.tag.init({
			containerId: thatXpimManager.configs.containerId,
			manager: thatXpimManager,
			config: tagConfig
		});
	}
	
	this.initPropertyList = function(propertyListConfig){
		thatXpimManager.propertyList = new XpimPropertyList(); 
		thatXpimManager.propertyList.init({
			containerId: thatXpimManager.configs.containerId,
			manager: thatXpimManager,
			config: propertyListConfig
		});
	}
	
	this.initToolbar = function(toolbarConfig){
		thatXpimManager.toolbar = new XpimToolbar();
		thatXpimManager.toolbar.init({
			containerId: thatXpimManager.configs.containerId,
			manager: thatXpimManager, 
			config: toolbarConfig
		});
	}
}