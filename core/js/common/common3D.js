var common3DFunction = {
    mm2m: function(mm){
    	return mm / 1000;
    },
    m2mm: function(m){
    	return m * 1000;
    },
	cloneObject3D: function(object3D){
		var newObject3D = object3D.clone();
		if(newObject3D.children != null){
			for(var i = 0 ; i < newObject3D.children.length; i++){
				var childObj = newObject3D.children[i]; 
				var materials = childObj.material;
				var newMaterials = new Array();
				for(var j = 0; j < materials.length; j++){
					newMaterials.push(materials[j]);
				}
				childObj.material = newMaterials;				
				childObj.geometry = childObj.geometry.clone(); 
			}
		}
		return newObject3D;
	},
	//字符串转rgb added by lixin 202201
    stringToRGBArray: function(color){ 
        let r = parseInt(color.substring(0, 2), 16);
        let g = parseInt(color.substring(2, 4), 16);
        let b = parseInt(color.substring(4, 6), 16) 
        return [r,g,b]
    },
    stringToRGBInt: function(color){
        let r = parseInt(color.substring(0, 2), 16);
        let g = parseInt(color.substring(2, 4), 16);
        let b = parseInt(color.substring(4, 6), 16) 
        return r * 256*256 + g * 256 + b;
    },
    //rgb转字符串 added by lixin 202201
    rgbToString: function(r,g,b) {
        return "#"+r.toString(16)+g.toString(16)+b.toString(16);
    }
}
