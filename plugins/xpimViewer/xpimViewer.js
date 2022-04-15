//XpimWeb Viewer
function XpimViewer(){
	//当前对象
	var thatXpimViewer = this; 
	
	//containerId
	this.containerId = null;
	
	//xpim manager
	this.manager = null; 
	
	//lod
	this.lod = null;
	
	//状态，默认为常规
	this.status = xpimViewerStatus.normalView;	 
		
	//被选中的object3D（多选）
	this.selectedObject3Ds = new Array();
	
	//所有object3D
	this.allObject3DMap = {};
	
	//根节点object3D
	this.rootObject3D = null;
	
	//可视化和交互相关
	this.scene = null;
	this.camera = null;
	this.renderer = null;
	this.renderer2d = null;
	this.orbitControl = null; 
	this.raycaster = null; //光投射器

	//运行环境变量
	this.backgroundColor = 0xCCE9FF; 
	this.groundPlaneSize = 100;
	this.groundPlaneColor = 0xEEEEEE;
	this.showCameraHelper = false;
	this.showShadow = false;
	this.controlConfig = {
		minZoom: 0.5,
		maxZoom: 2,
		minPolarAngle: -Math.PI,
		maxPolarAngle: Math.PI 
	};
	this.hightLightMaterial = new THREE.MeshStandardMaterial({
    	color: 0x4CFF00,
  		transparent: true,
  		opacity: 0.9,  
		flatShading: true,
    	side: THREE.FrontSide,
    	depthTest: false
	});
	this.highlightEdgeMaterial = new THREE.LineBasicMaterial({
		color: 0x888888, 
		linewidth: 1
	});
	
	//交互参数
	this.mouseDownPosition = null;
	this.containerPos = {x: 0, y: 0};
	
	//事件
	this.eventFunctions = {};	
	this.addEventFunction = function(eventName, func){
		var allFuncs = thatXpimViewer.eventFunctions[eventName];
		if(allFuncs == null){
			allFuncs = new Array();
			thatXpimViewer.eventFunctions[eventName] = allFuncs;
		}
		allFuncs.push(func);
	}	
	this.doEventFunction = function(eventName, p){
		var allFuncs = thatXpimViewer.eventFunctions[eventName];
		if(allFuncs != null){
			for(var i = 0; i < allFuncs.length; i++){
				var func = allFuncs[i];
				func(p);
			}
		} 
	}
	 
	//初始化
	this.init = function(p){
		thatXpimViewer.containerId = p.containerId; 
		thatXpimViewer.manager = p.manager;
		thatXpimViewer.showShadow = p.config.showShadow;
		thatXpimViewer.lod = p.config.lod;
		
		
		//初始化环境
		thatXpimViewer.initHtml();
		thatXpimViewer.initScene();
		thatXpimViewer.initRender();
		thatXpimViewer.initRender2D();
		thatXpimViewer.initCamera();
		thatXpimViewer.initControls(); 
		thatXpimViewer.initLight();         
		thatXpimViewer.initGroundPlane(); 
		thatXpimViewer.initRaycaster();
        thatXpimViewer.animate();  
		
		//绑定事件
        if(p.config.onSelectChanged != null){
        	thatXpimViewer.addEventFunction("onSelectChanged", p.config.onSelectChanged); 
        }

		//鼠标事件
        $("#" + thatXpimViewer.containerId).find(".viewContainer").mousedown(thatXpimViewer.onMouseDown);
        $("#" + thatXpimViewer.containerId).find(".viewContainer").mouseup(thatXpimViewer.onMouseUp);
        
		//系统事件
        window.addEventListener('resize', thatXpimViewer.onWindowResize, false); 

        //初始化交互参数
        var viewContainer = $("#" + p.containerId).find(".viewContainer")[0];
        var viewContainerOffset = $(viewContainer).offset();
        thatXpimViewer.containerPos = {
			x: viewContainerOffset.left,
			y: viewContainerOffset.top
		}; 
        
        thatXpimViewer.addXpimToScene(thatXpimViewer.manager.xpimObject);
        //thatXpimViewer.test();
	} 
	
    //初始化光投射器
    this.initRaycaster = function() { 
    	thatXpimViewer.raycaster = new THREE.Raycaster();
    }; 
	
	//初始化html
	this.initHtml = function(){
		var html = "<div class=\"viewContainer\"><div class=\"viewInnerContainer\"></div></div>";
		$("#" + thatXpimViewer.containerId).append(html);
	}
	
	//测试
	this.test = function(){ 
        var boxGeometry = new THREE.BoxGeometry(10, 10, 10);
        var boxMaterial = new THREE.MeshLambertMaterial({
        	color: 0x444444
        });
        var box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(0, 0, 0); 
        thatXpimViewer.scene.add(box);  
	}

	//初始化GroundPlane
    this.initGroundPlane = function(){    
        var planeGeometry = new THREE.PlaneGeometry(thatXpimViewer.groundPlaneSize, thatXpimViewer.groundPlaneSize);
        var planeMaterial = new THREE.MeshLambertMaterial({
        	color: thatXpimViewer.groundPlaneColor
        });
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI; 
        plane.position.set(0, 0, 0);
        plane.isGroundPlane = true;
        plane.castShadow = true;
        plane.receiveShadow = true;
        thatXpimViewer.scene.add(plane);  	
	}
    
    //初始化Scene
    this.initScene = function() {
    	thatXpimViewer.scene = new THREE.Scene();
    }; 

    //初始化Camera
    this.initCamera = function() { 
        var width = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").width();
        var height = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").height();  
		var aspect = width / height; 
		thatXpimViewer.camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 1000 )
        thatXpimViewer.camera.position.set(40, 50, 60);   
    };

    //初始化Render
    this.initRender = function() { 
    	thatXpimViewer.renderer = new THREE.WebGLRenderer({ 
    		antialias: true
		}); 
    	thatXpimViewer.renderer.shadowMap.enabled = true;
    	thatXpimViewer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        var width = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").width();
        var height = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").height();
        thatXpimViewer.renderer.setSize(width, height);  
        thatXpimViewer.renderer.setClearColor(thatXpimViewer.backgroundColor); 
        $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").append(thatXpimViewer.renderer.domElement); 
    };

    //初始化Render2D
    this.initRender2D = function() { 
    	thatXpimViewer.renderer2d = new THREE.CSS2DRenderer();
        var width = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").width();
        var height = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").height();
        thatXpimViewer.renderer2d.setSize( width, height );
        thatXpimViewer.renderer2d.domElement.style.position = 'absolute';
        thatXpimViewer.renderer2d.domElement.style.top = '0px';
        thatXpimViewer.renderer2d.domElement.tabIndex = 0;
        thatXpimViewer.renderer2d.domElement.className = "viewInnerRenderer2d";
        $("#" + thatXpimViewer.containerId).find(".viewContainer").append(thatXpimViewer.renderer2d.domElement); 
    };

    //window变化事件
    this.onWindowResize = function() { 
        var width = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").width();
        var height = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer").height();
		var aspect = width / height; 
		thatXpimViewer.renderer.setSize(width, height);         
		thatXpimViewer.renderer2d.setSize( width, height);         	 
    };

    //初始化Controls
    this.initControls = function() {    	
    	var orbitControl = new THREE.OrbitControls(thatXpimViewer.camera, thatXpimViewer.renderer2d.domElement); 
    	orbitControl.target = new THREE.Vector3(0, 0, 0);

    	orbitControl.minZoom = thatXpimViewer.controlConfig.minZoom;
    	orbitControl.maxZoom = thatXpimViewer.controlConfig.maxZoom;
    	orbitControl.minPolarAngle = thatXpimViewer.controlConfig.minPolarAngle;
    	orbitControl.maxPolarAngle = thatXpimViewer.controlConfig.maxPolarAngle; 
		
    	orbitControl.update();     	
    	thatXpimViewer.orbitControl = orbitControl;
    };

    //初始化Light
    this.initLight = function() {  
    	var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
    	thatXpimViewer.scene.add(ambientLight); 
    	
    	var lightSize = 10;    
    	
    	var lights = [ 
  	    	{
	    		x: lightSize * 2.5,
	    		y: lightSize * 7,
	    		z: lightSize * 2,
	    		color: 0xFFFFFF,
	    		size: 0.50,
	    		castShadow: thatXpimViewer.showShadow
	    	},
	    	{
	    		x: -lightSize * 5,
	    		y: 0,
	    		z: -lightSize * 10,
	    		color: 0xFFFFFF,
	    		size: 0.20,
	    		castShadow: false
	    	} 
    	];
    	for(var i = 0; i < lights.length; i++) {
    		var light = lights[i];
	    	var dirLight = new THREE.DirectionalLight(light.color, light.size);
	    	dirLight.position.set(light.x, light.y, light.z);
	    	var dirLightTarget = new THREE.Object3D();
	    	dirLightTarget.position.set(0, 0, 0);
	    	thatXpimViewer.scene.add(dirLightTarget);

	    	dirLight.target = dirLightTarget; 
	    	dirLight.shadow.camera.near = 10;
	    	dirLight.shadow.camera.far = lightSize * 10;
	    	dirLight.shadow.camera.left = lightSize * 5;
	    	dirLight.shadow.camera.right = -lightSize * 5;
	    	dirLight.shadow.camera.top = lightSize * 5;
	    	dirLight.shadow.camera.bottom = -lightSize * 5;
	    	dirLight.shadow.mapSize.height = 1024 * 8;
	    	dirLight.shadow.mapSize.width = 1024 * 8;
	    	dirLight.shadow.bias = -0.001;
	    	dirLight.castShadow = light.castShadow;
	    	thatXpimViewer.scene.add(dirLight);
	    	if(light.castShadow && thatXpimViewer.showCameraHelper){
		        var debug = new THREE.CameraHelper(dirLight.shadow.camera);
		        debug.name = "debug" + i;
		        thatXpimViewer.scene.add(debug);
	    	}
    	} 
    };  
    
    //animate
    this.animate = function() { 
    	thatXpimViewer.renderer.render(thatXpimViewer.scene, thatXpimViewer.camera);  
    	thatXpimViewer.renderer2d.render(thatXpimViewer.scene, thatXpimViewer.camera);    
        requestAnimationFrame(thatXpimViewer.animate); 
    }; 
    
    
    //根据xpim构造object3d显示到scene中
    this.addXpimToScene = function(xpimObject){ 
    	
		var object3D = thatXpimViewer.convertXpimObjectTo3DObject(xpimObject, thatXpimViewer.lod);

		//如果Z轴朝上，那么翻转一下
		if(xpimObject.pimJson.upAxis == "Z"){
			object3D.rotation.set(-Math.PI / 2, 0, 0);
		}
		
		//居中处理
        var box = new THREE.Box3().setFromObject(object3D);
        var centerPoint = {
        	x: (box.min.x + box.max.x) / 2,
        	y: (box.min.y + box.max.y) / 2,
        	z: (box.min.z + box.max.z) / 2
        };
        var size = {
        	x: (box.max.x - box.min.x),
        	y: (box.max.y - box.min.y),
        	z: (box.max.z - box.min.z)
        };
        object3D.position.set(-centerPoint.x, -centerPoint.y + size.y / 2, -centerPoint.z);

        //外部加一层object3D，放入到scene中
		var outerObject3D = new THREE.Object3D();
		outerObject3D.add(object3D);    
		
    	//打上标记
		outerObject3D.isXpimObject = true;   		
   	 	thatXpimViewer.addObject3DToScene(outerObject3D); 
   	 	thatXpimViewer.rootObject3D = outerObject3D;
   	 	
   	 	//初始化allObject3DMap
   	 	thatXpimViewer.initObject3DMap(object3D);
   	 	
    	thatXpimViewer.setNormalViewport(xpimNormalViewport.init); 
    }
    
    //获取与根节点object3D的相对位置
    this.getPositionInRoot = function(object3D){
    	var box = new THREE.Box3().setFromObject(object3D);
    	var rootPos = thatXpimViewer.rootObject3D.position;
    	var pos = {
    		x: (box.min.x + box.max.x) / 2 - rootPos.x,
    		y: (box.min.y + box.max.y) / 2 - rootPos.y,
    		z: (box.min.z + box.max.z) / 2 - rootPos.z
    	};
    	return pos;
    }
    
    
    //根节点object3D
    this.getRootObject3D = function(){
    	return thatXpimViewer.rootObject3D;
    }
    
    //初始化id与object3d的对照
    this.initObject3DMap = function(rootObject3D){
    	var allObject3DMap = {};
    	for(var i = 0; i < rootObject3D.children.length; i++){
    		var childObject3D = rootObject3D.children[i];
    		var nodeId = childObject3D.nodeData.name;
    		allObject3DMap[nodeId] = childObject3D;
    	}
    	thatXpimViewer.allObject3DMap = allObject3DMap;
    }
    
    //将xpim解析为object3D
    this.convertXpimObjectTo3DObject = function(xpimObject, lod){
    	//构造所有geometry
    	var geometryMap = new Object();
    	for(var meshKey in xpimObject.meshesJson){
    		var meshJson = xpimObject.meshesJson[meshKey];
        	var geo = thatXpimViewer.createGeometryFromJson(meshJson);
        	geometryMap[meshKey] = geo;
    	}
    	
    	//暂不处理parameter
    	
    	//处理所有的material
    	var materialMap = new Object();
    	for(var materialName in xpimObject.pimJson.materials){
    		var materialJson = xpimObject.pimJson.materials[materialName];
    		var mat = thatXpimViewer.createMaterialFromJson(materialJson);
    		materialMap[materialName] = mat;
    	}
    	
    	//处理所有的node
    	var allNodeJsons = xpimObject.pimJson.nodes;
    	var allUnitJsons = xpimObject.pimJson.units;
    	var rootNodeJson = allNodeJsons[0]; 	
    	var object3D = thatXpimViewer.createNodeObject3D(rootNodeJson, allNodeJsons, allUnitJsons, geometryMap, materialMap, lod);
    	object3D.isRootXpimObject = true;
    	return object3D;
    }
    
    //进行坐标变换
    this.setObject3DTransform = function(nodeJson, object3D){
    	if(nodeJson.transform != null && nodeJson.transform.length > 0){
    		var tvs = new Array();
    		var tvStrs = nodeJson.transform.replaceAll("(", "").replaceAll(")", "").split(",");
    		for(var i = 0; i < tvStrs.length; i++){
    			tvs.push(parseFloat(tvStrs[i]));
    		}  
    		var m = new THREE.Matrix4();
    		m.set(tvs[0], tvs[4], tvs[8], tvs[12], tvs[1], tvs[5], tvs[9], tvs[13], tvs[2], tvs[6], tvs[10], tvs[14], tvs[3], tvs[7], tvs[11], tvs[15]);                 
    		object3D.applyMatrix4(m); 
    	}
    	else {
    		if(nodeJson.position != null){
    			throw "未实现position";
    		}
    		if(nodeJson.rotation != null){
    			throw "未实现rotation";
    		}
    	}
    }
    
    //根据xpim里的node，构造object3D
    this.createNodeObject3D = function(nodeJson, allNodeJsons, allUnitJsons, geometryMap, materialMap, lod){
    	if(nodeJson.nodes != null){
    		var object3D = new THREE.Object3D();
    		
        	//打上标记
    		object3D.isXpimObject = true; 
    		
    		//包含子node
    		for(var i = 0; i < nodeJson.nodes.length; i++){
    			var childNodeJson = allNodeJsons[nodeJson.nodes[i]];
    			var childObject3D = thatXpimViewer.createNodeObject3D(childNodeJson, allNodeJsons, allUnitJsons, geometryMap, materialMap, lod);
    			if(childObject3D != null){
    				object3D.add(childObject3D);
    			}
    		}
    		thatXpimViewer.setObject3DTransform(nodeJson, object3D);
    		object3D.name = nodeJson.name;
    		object3D.nodeData = {
    			id: nodeJson.name,
    			name: nodeJson.name,
    			paramUrl: nodeJson.paramUrl
    		};
    		return object3D;
    	}
    	else if(nodeJson.unit != null){
    		//关联了unit
    		var unitJson = allUnitJsons[nodeJson.unit];
    		var geoKey = unitJson[lod];
    		var geo = geometryMap[geoKey].clone();
    		var materials = new Array();
    		for(var i = 0; i < nodeJson.materials.length; i++){
    			materials.push(materialMap[nodeJson.materials[i]]);
    		}
    		var mesh = new THREE.Mesh(geo, materials[0]); 
    		
        	//打上标记
    		mesh.isXpimMesh = true; 
    		mesh.isXpimObject = true; 
    		
    		mesh.castShadow = true;
    		mesh.receiveShadow = true;
    		thatXpimViewer.setObject3DTransform(nodeJson, mesh);
    		mesh.name = nodeJson.name;
    		mesh.nodeData = {
    			id: nodeJson.name,
    			name: nodeJson.name,
    			paramUrl: nodeJson.paramUrl
    		};
    		return mesh;
    	}
    	else{
    		//关联了图例，暂不处理
    		
    	}
    }
    
    //根据xpim里的material json，构造material
    this.createMaterialFromJson = function(materialJson){
    	var material = new THREE.MeshStandardMaterial({
      		color: common3DFunction.stringToRGBInt(materialJson.color),  
      		transparent: materialJson.opacity == 100 ? false : true,
      		opacity: materialJson.opacity / 100,
			metalness: materialJson.metalness / 100,
			roughness:materialJson.roughness / 100,
			flatShading: true, 
        	side: THREE.FrontSide  
      	}); 
    	return material;
    }
        
    //将object3D添加到scene中
    this.addObject3DToScene = function(object3D){ 
    	object3D.position.set(0, 0, 0);
    	thatXpimViewer.scene.add(object3D);    	
    }    
    
    //根据unit的mesh json信息，构造geometry
	this.createGeometryFromJson = function(meshJson){
		var pointStrs = meshJson.points.split(",");
		var faceStrs = meshJson.faces.split(",");
		var pointCount = pointStrs.length;
		var faceCount = faceStrs.length;
		var vertices = [];
		var positions = [];
		var faces = [];
		var indices = [];
		for(var i = 0; i < pointCount; i++){
			var parts = pointStrs[i].split(" ");
			vertices.push(parseFloat(parts[0]));
			vertices.push(parseFloat(parts[1]));
			vertices.push(parseFloat(parts[2]));
		}
		var positionIndex = 0;
		for(var i = 0; i < faceCount; i++){
			var parts = faceStrs[i].split(" ");
			faces.push(parseInt(parts[0]));
			faces.push(parseInt(parts[1]));
			faces.push(parseInt(parts[2])); 
			positions.push(vertices[parseInt(parts[0]) * 3]);
			positions.push(vertices[parseInt(parts[0]) * 3 + 1]);
			positions.push(vertices[parseInt(parts[0]) * 3 + 2]);
			positions.push(vertices[parseInt(parts[1]) * 3]);
			positions.push(vertices[parseInt(parts[1]) * 3 + 1]);
			positions.push(vertices[parseInt(parts[1]) * 3 + 2]);
			positions.push(vertices[parseInt(parts[2]) * 3]);
			positions.push(vertices[parseInt(parts[2]) * 3 + 1]);
			positions.push(vertices[parseInt(parts[2]) * 3 + 2]);
			indices.push(positionIndex);
			indices.push(positionIndex + 1);
			indices.push(positionIndex + 2);
			positionIndex = positionIndex + 3;
		}	

    	var geometry = new THREE.BufferGeometry(); 
    	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3 ) ); 
    	geometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1 ));  
    	geometry.computeVertexNormals();
		return geometry;
	}    
    
	//获取Scene的外框
    this.getSceneBoxValues = function(){
    	var boxValues = {
    		min: {x: Infinity, y: Infinity, z: Infinity},
    		max: {x: -Infinity, y: -Infinity, z: -Infinity}
    	};
    	for(var i = 0; i < thatXpimViewer.scene.children.length; i++){
    		var object3D = thatXpimViewer.scene.children[i];
    		if(object3D.isXpimObject != null){
    			var box = new THREE.Box3().setFromObject(object3D);
    			if(box.min.x < boxValues.min.x){
    				boxValues.min.x = box.min.x;
    			}
    			if(box.min.y < boxValues.min.y){
    				boxValues.min.y = box.min.y;
    			}
    			if(box.min.z < boxValues.min.z){
    				boxValues.min.z = box.min.z;
    			}
    			if(box.max.x > boxValues.max.x){
    				boxValues.max.x = box.max.x;
    			}
    			if(box.max.y > boxValues.max.y){
    				boxValues.max.y = box.max.y;
    			}
    			if(box.max.z > boxValues.max.z){
    				boxValues.max.z = box.max.z;
    			}
    		}
    	}
    	return boxValues;
    }

    //设置常见视角
    this.setNormalViewport = function(viewport){    	
    	var cameraPosition = thatXpimViewer.camera.position; 
    	    	
    	//取外框盒子，用于计算外框的camera
    	var sceneBox = thatXpimViewer.getSceneBoxValues();
    	var xSize = sceneBox.max.x - sceneBox.min.x;
    	var ySize = sceneBox.max.y - sceneBox.min.y;
    	var zSize = sceneBox.max.z - sceneBox.min.z;
    	var xCenter = (sceneBox.max.x + sceneBox.min.x) / 2;
    	var yCenter = (sceneBox.max.y + sceneBox.min.y) / 2;
    	var zCenter = (sceneBox.max.z + sceneBox.min.z) / 2;
    	var cameraDistance = Math.sqrt(xSize * xSize + ySize * ySize + zSize * zSize);
    	
    	var position = new Array();
    	switch(viewport){ 
	    	case xpimNormalViewport.init:{
	    		position[0] = cameraDistance * 2 / 2;
	    		position[1] = cameraDistance * 1 / 2;
	    		position[2] = cameraDistance * 2 / 2;
	    		break;
	    	}
	    	case xpimNormalViewport.front:{ 
	    		position[0] = xCenter;
	    		position[1] = yCenter;
	    		position[2] = cameraDistance; 
	    		break;
	    	}
	    	case xpimNormalViewport.back:{
	    		position[0] = xCenter;
	    		position[1] = yCenter;
	    		position[2] = cameraDistance; 
	    		break;
	    	}
	    	case xpimNormalViewport.top:{
	    		position[0] = xCenter;
	    		position[1] = cameraDistance;
	    		position[2] = zCenter; 
	    		break;
	    	}
	    	case xpimNormalViewport.bottom:{
	    		position[0] = xCenter;
	    		position[1] = cameraDistance;
	    		position[2] = zCenter; 
	    		break;
	    	}
	    	case xpimNormalViewport.left:{
	    		position[0] = cameraDistance;
	    		position[1] = yCenter;
	    		position[2] = zCenter;
	    		break; 
	    	}
	    	case xpimNormalViewport.right:{
	    		position[0] = cameraDistance;
	    		position[1] = yCenter;
	    		position[2] = zCenter;
	    		break;
	    	}
	    	default:{
	    		alert("Unknown viewport = " + viewport);
	    	}	    		
    	}  
    	var target = [xCenter, yCenter, zCenter];
    	thatXpimViewer.setViewport(target, position, thatXpimViewer.camera.zoom);  
    }
    
    //设置视角
    this.setViewport = function(target, position, zoom){   
    	thatXpimViewer.orbitControl.target0 = new THREE.Vector3(target[0], target[1], target[2]); 
    	thatXpimViewer.orbitControl.position0 = new THREE.Vector3(position[0], position[1], position[2]); 
    	thatXpimViewer.orbitControl.zoom0 = zoom;
    	thatXpimViewer.orbitControl.reset();
    }
    
    //设置某个object3D为中心
    this.setCenterObject = function(object3D){
		if(object3D != null){
    		var box = new THREE.Box3().setFromObject(object3D);
			var target = [(box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2, (box.min.z + box.max.z) / 2];
	    	thatXpimViewer.orbitControl.target0 = new THREE.Vector3(target[0], target[1], target[2]);
	    	thatXpimViewer.orbitControl.reset();
    	}     
    }

    //设置显示状态
    this.setObject3DsVisible = function(ids, isVisible){ 
    	var selectedObject3Ds = new Array(); 
    	for(var i = 0; i < ids.length; i++){
    		var id = ids[i];
    		var object3D = thatXpimViewer.allObject3DMap[id];
    		selectedObject3Ds.push(object3D);
    	} 
    	for(var i = 0; i < selectedObject3Ds.length; i++){
    		var object3D = selectedObject3Ds[i];
    		object3D.visible = isVisible;
    	}
    }
    
    //根据id获取object3d
    this.getObject3DById = function(id){
		var object3D = thatXpimViewer.allObject3DMap[id];
    	return object3D;
    }
    
    //点击
    this.clickXpimObject = function(object3D, isCtrlKey){
    	if(object3D == null){
    		if(isCtrlKey){
    			//多选时，点到了没有object的地方，不做处理
    		}
    		else{
    			//单选时，点到了没有object的地方，那么取消所有选中
    			thatXpimViewer.cancelSelectObject3Ds(); 
    		}
    	}
    	else {
    		if(isCtrlKey){
	        	if(object3D.isSelected){ 
	        		thatXpimViewer.unSelectObject3D(object3D);
	        	}
	        	else{ 
	        		thatXpimViewer.selectObject3D(object3D);
	        	}
	    	}
	    	else{
    			thatXpimViewer.cancelSelectObject3Ds(); 
	    		thatXpimViewer.selectObject3D(object3D);
	    	}
    	}
    } 
    
    //选中object3D
    this.selectObject3D = function(object3D){
    	thatXpimViewer.addToSelectedObject3Ds(object3D);
    	thatXpimViewer.highlightObject3D(object3D);
    }

    //取消选中object3D
    this.unSelectObject3D = function(object3D){
    	thatXpimViewer.removeFromSelectedObject3Ds(object3D);
    	thatXpimViewer.unHighlightObject3D(object3D);
    }
    
    this.onSelectChanged = function(selectedObject3Ds){
    	var nodeJArray = new Array();
    	for(var i = 0; i < selectedObject3Ds.length; i++){
    		var object3D = selectedObject3Ds[i];
    		var id = object3D.nodeData.id;
    		var name = object3D.nodeData.name;
    		var paramUrl = object3D.nodeData.paramUrl;
    		nodeJArray.push({
    			id: id,
    			name: name,
    			propertyJArray: thatXpimViewer.manager.xpimObject.parametersJson[paramUrl]
    		});
    	}
    	this.doEventFunction("onSelectChanged", {
    		selectedCount: nodeJArray.length,
    		nodeJArray: nodeJArray
    	});
    }

    //取消选中所有
    this.cancelSelectObject3Ds = function(){
    	var object3Ds = thatXpimViewer.selectedObject3Ds;
    	for(var i = 0; i < object3Ds.length; i++){
    		var object3D = object3Ds[i];
        	thatXpimViewer.unHighlightObject3D(object3D);
    	}
    	thatXpimViewer.selectedObject3Ds = new Array();
    	thatXpimViewer.onSelectChanged(thatXpimViewer.selectedObject3Ds);
    }

    //批量多选
    this.selectObject3Ds = function(ids){
    	thatXpimViewer.cancelSelectObject3Ds();
    	var selectedObject3Ds = new Array(); 
    	for(var i = 0; i < ids.length; i++){
    		var id = ids[i];
    		var object3D = thatXpimViewer.allObject3DMap[id];
    		selectedObject3Ds.push(object3D);
    	}
		thatXpimViewer.selectedObject3Ds = selectedObject3Ds;
    	for(var i = 0; i < selectedObject3Ds.length; i++){
    		var object3D = selectedObject3Ds[i];
        	thatXpimViewer.highlightObject3D(object3D);
    	}
    	thatXpimViewer.onSelectChanged(thatXpimViewer.selectedObject3Ds);
    }

    //添加到选中列表
    this.addToSelectedObject3Ds = function(object3D){
    	var needAdd = true;
    	for(var i = 0; i < thatXpimViewer.selectedObject3Ds.length; i++){
    		var obj3D = thatXpimViewer.selectedObject3Ds[i];
    		if(obj3D == object3D){
    			needAdd = false;
    		}
    	}
    	if(needAdd){
    		thatXpimViewer.selectedObject3Ds.push(object3D);
        	thatXpimViewer.onSelectChanged(thatXpimViewer.selectedObject3Ds);
    	}
    } 

    //从到选中列表移除
    this.removeFromSelectedObject3Ds = function(object3D){
    	var needRemove = false;
    	var object3Ds = new Array();
    	for(var i = 0; i < thatXpimViewer.selectedObject3Ds.length; i++){
    		var obj3D = thatXpimViewer.selectedObject3Ds[i];
    		if(obj3D != object3D){
    			object3Ds.push(obj3D);
    		}
    		else{
    			needRemove = true;
    		}
    	}
    	if(needRemove){
        	thatXpimViewer.selectedObject3Ds = object3Ds;
        	thatXpimViewer.onSelectChanged(thatXpimViewer.selectedObject3Ds);
    	}
    } 
    
    //高亮显示某个object3D
    this.highlightObject3D = function(object3D){
    	object3D.isSelected = true;	
    	if(object3D.isXpimMesh){
    		thatXpimViewer.highlightMesh(object3D);
    		thatXpimViewer.addMeshEdges(object3D);
    	}
    	else if(object3D.isXpimObject){
    		for(var i = 0; i < object3D.children.length; i++){
    			var childObject3D = object3D.children[i];
        		thatXpimViewer.highlightObject3D(childObject3D);
    		}
    	}    
    }

    //高亮显示某个mesh
    this.highlightMesh = function(mesh){
    	if(mesh.originalMaterial == null){
    		mesh.originalMaterial = mesh.material;
    	}
    	if(mesh.material.length > 0){
    		var highlightMaterials = new Array();
    		for(var i = 0; i < mesh.originalMaterial.length; i++){
    			hightLightMaterials.push(thatXpimViewer.hightLightMaterial);
    		}
    		mesh.material = hightLightMaterials;
    	} 
    	else{
    		mesh.material = thatXpimViewer.hightLightMaterial;
    	}
    } 
    
    //取消高亮显示
    this.unHighlightObject3D = function(object3D){
    	object3D.isSelected = false;
    	if(object3D.isXpimMesh){
    		thatXpimViewer.unHighlightMesh(object3D);
    		thatXpimViewer.removeMeshEdges(object3D);
    	}
    	else if(object3D.isXpimObject){
    		for(var i = 0; i < object3D.children.length; i++){
    			var childObject3D = object3D.children[i];
        		thatXpimViewer.unHighlightObject3D(childObject3D);
    		}
    	}
    }

    //取消高亮显示某个mesh
    this.unHighlightMesh = function(mesh){
		mesh.material = mesh.originalMaterial;
    }

    //添加边框
    this.addMeshEdges = function(mesh){   
        var edges= new THREE.EdgesGeometry(mesh.geometry, 25);
        var line = new THREE.LineSegments(edges, thatXpimViewer.highlightEdgeMaterial);
        line.isLine = true; 
        mesh.add(line); 
    }

    //移除边框
    this.removeMeshEdges = function(mesh){   
    	var line = mesh.children[0]; 
        mesh.remove(line); 
    }
    
    //判定是否为弹出窗口
    this.checkIsPopContainer = function(targetElement){
    	var tempElement = $(targetElement);
    	while(tempElement.length != 0 && !$(tempElement).hasClass("viewInnerContainer")){
    		if($(tempElement).hasClass("zlpPopBox") || $(tempElement).hasClass("zlpOpacityBox")){
    			return true;
    		}
    		else{
        		tempElement = $(tempElement[0]).parent();
    		}    		
    	}
    	return !$(tempElement).hasClass("viewInnerContainer");
    } 

    //鼠标按下
    this.onMouseDown = function(ev) { 
    	var targetElement = ev.target;     
    	thatXpimViewer.mouseDownPosition = {
    		x: ev.clientX - thatXpimViewer.containerPos.x,
    		y: ev.clientY - thatXpimViewer.containerPos.y 
    	};
    };

    //找到它属于哪个xpim object3D
    this.getXpimObject3D = function(checkObj){ 
    	if(!checkObj.isLine){
	    	while(checkObj.type != "Scene"){
	    		if(checkObj.parent.isRootXpimObject && checkObj.visible){
	    			return checkObj;
	    		}
	    		else{
	    			checkObj = checkObj.parent;
	    		}
	    	} 
    	}
    	return null;
    }
    
    //使用射线获取xpim object
    this.getXpimObject3DByRaycaster = function(intersects) {  
        if (intersects.length > 0) {
        	var index = 0;
        	while(index < intersects.length){ 
        		var object3D = thatXpimViewer.getXpimObject3D(intersects[index].object);
        		if(object3D != null){  
        			return object3D;
        		}
        		else{
        			index++;
        		}
        	} 
        }
        return null;
    }; 
    
    //鼠标抬起
    this.onMouseUp = function(ev) {
        if (thatXpimViewer.mouseDownPosition != null) {
        	var mouseUpPosition = {
        		x: ev.clientX - thatXpimViewer.containerPos.x,
        		y: ev.clientY - thatXpimViewer.containerPos.y  
        	};
        	if(ev.button == 0 || ev.button == 2){
	        	if(Math.abs(mouseUpPosition.x - thatXpimViewer.mouseDownPosition.x) < 2 && Math.abs(mouseUpPosition.y - thatXpimViewer.mouseDownPosition.y) < 2 ){ 
	                event.preventDefault();
	            	var mouse = new THREE.Vector2(); //二维向量 
	            	var viewInnerContainer = $("#" + thatXpimViewer.containerId).find(".viewInnerContainer")[0];
	                mouse.x = ((event.clientX - thatXpimViewer.containerPos.x) / $(viewInnerContainer).width()) * 2 - 1;
	                mouse.y = -((event.clientY - thatXpimViewer.containerPos.y) / $(viewInnerContainer).height()) * 2 + 1;   
	                
	                thatXpimViewer.raycaster.setFromCamera(mouse, thatXpimViewer.camera); 
	                
	                var intersects = thatXpimViewer.raycaster.intersectObjects(thatXpimViewer.scene.children, true); //将遍历数组内的所有模型的子类，也就是深度遍历
	                switch(thatXpimViewer.status){
		                case xpimViewerStatus.normalView: {
			                var object3D = thatXpimViewer.getXpimObject3DByRaycaster(intersects); 
			                thatXpimViewer.clickXpimObject(object3D, ev.ctrlKey);   
			        		break;
		                }
		                default:{
		                	throw "暂未支持 status = " + thatXpimViewer.status;
		                	break;
		                }
	                }

	                thatXpimViewer.doEventFunction("onMouseUp", { 
        				x: ev.clientX - thatXpimViewer.containerPos.x,
        				y: ev.clientY - thatXpimViewer.containerPos.y,
	    	       		intersects: intersects
	    	       	});	                
	        	}
	        	else{
	        		//移动后，松开鼠标左键，为后续做拖拽操作扩展用
	        	}
        	}
        } 
    }; 
}