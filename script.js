/*
Original code taken from webglacademy tutorials and changed to fit the requirements of the project.
Only runs in Firefox because of the context menu.
*/

//Global variables used in code with default values (overwritten by later parts of code)
var pathToObjFile = "input/cube.obj";
var MTLFileName = "input/";

//object information array
var obj_info = [];

var world = [];
var aliens = [];
var alien_center = [];

var barriers = [];
var barriers_center = [];

var player = [];
var player_center = [];

var bullet = [];
var bullet_coords = [];

var laser = [];
var laser_coords = [];

//mode variables
var textureNum = 1;
var modelNum = 1;
var displayTexture = 0;

var directionMove = 0;
var moved = 0;
var display = 0;

var MOVE = 1;

var game_over = false;

//gets info from OBJ file and MTL file and places the information in a suitable format
var getInfo = function(pathName, num){
	//define varibales
	var vertexArray = [];
	var triangleArray = [];
	var groupArray = [];
	
	var object_vertex = [];
	var object_face = [];
	var object_textureless =[];
	
	var mtllib;
	//read obj file
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", pathName, false);
	rawFile.onreadystatechange = function(){
		if(rawFile.readyState == 4){
			var allText = rawFile.responseText;
//			alert(allText);
			var textArray = allText.split('\n');
			var groupName = "name";
			for(i=0; i<textArray.length; i++){
				var line = textArray[i].split(' ');
			//	alert(line[0]);
				if(line[0] == 'v'){
					var addBy = 0;
					while(line[1+addBy] == ''){
						addBy++;
					}
					var x = line[1+addBy];
					while(line[2+addBy] == ''){
						addBy++;
					}
					var y = line[2+addBy];
					while(line[3+addBy] == ''){
						addBy++;
					}
					var z = line[3+addBy];
					vertexArray[vertexArray.length] = x;
					vertexArray[vertexArray.length] = y;
					vertexArray[vertexArray.length] = z;
				} else if(line[0] == 'f'){
					if(line.length < 5){
						while(line[1+addBy] == ''){
							addBy++;
						}
						var word = line[1+addBy].split('/');
						triangleArray[triangleArray.length] = word[0];
						while(line[2+addBy] == ''){
							addBy++;
						}
						word = line[2+addBy].split('/');
						triangleArray[triangleArray.length] = word[0];
						while(line[3+addBy] == ''){
							addBy++;
						}
						word = line[3+addBy].split('/');
						triangleArray[triangleArray.length] = word[0];
						triangleArray[triangleArray.length] = groupName;
					} else {
						var max_vertex = line.length;
						
						var one = 1;
						for(var two=2; two<=line.length-2; two++){
							//var two = one+1;
							var three = two+1;
							while(line[one+addBy] == ''){
								addBy++;
							}
							var word = line[one+addBy].split('/');
							triangleArray[triangleArray.length] = word[0];
							while(line[two+addBy] == ''){
								addBy++;
							}
							word = line[two+addBy].split('/');
							triangleArray[triangleArray.length] = word[0];
							while(line[three+addBy] == ''){
								addBy++;
							}
							word = line[three+addBy].split('/');
							triangleArray[triangleArray.length] = word[0];
							triangleArray[triangleArray.length] = groupName;
						}
					}
				} else if(line[0] == 'g' || line[0] == 'usemtl'){
					groupName = line[1];
				} else if(line[0] == 'mtllib'){
					mtllib ="input/"+line[1];
				}
			}
		}
	}
	rawFile.send(null);
	//read mtl file
	var mtlFile = new XMLHttpRequest();
	mtlFile.open("GET", mtllib, false);
	mtlFile.onreadystatechange = function(){
		if(mtlFile.readyState == 4){
			var allText = mtlFile.responseText;
//			alert(allText);
			var textArray = allText.split('\n');
			var groupName = "name";
			for(i=0; i<textArray.length; i++){
				var line = textArray[i].split(' ');
				
				//MTL
				if(line[0] == 'newmtl'){
					groupArray[groupArray.length] = line[1];
				} else if(line[0] == 'Ka'){
					groupArray[groupArray.length] = line[0];
					groupArray[groupArray.length] = line[1];
					groupArray[groupArray.length] = line[2];
					groupArray[groupArray.length] = line[3];
				} else if(line[0] == 'Kd'){
					groupArray[groupArray.length] = line[0];
					groupArray[groupArray.length] = line[1];
					groupArray[groupArray.length] = line[2];
					groupArray[groupArray.length] = line[3];
				} else if(line[0] == 'Ks'){
					groupArray[groupArray.length] = line[0];
					groupArray[groupArray.length] = line[1];
					groupArray[groupArray.length] = line[2];
					groupArray[groupArray.length] = line[3];
				} else if(line[0] == 'N'){
					groupArray[groupArray.length] = line[0];
					groupArray[groupArray.length] = line[1]*(128/1000);
				} else if(line[0] == 'Ns'){
					groupArray[groupArray.length] = 'N';
					groupArray[groupArray.length] = line[1];
				}
			}
		}
	}
	mtlFile.send(null);
	
	var MAX_WIDTH = 10
	//resize vertices
	var maxX = -10000;
	var minX = 10000;
	var maxY = -10000;
	var minY = 100000;
	var maxZ = -100000;
	var minZ = 100000;
	for(i=0; i<vertexArray.length; i+=3){
		if(vertexArray[i] < minX){
			minX = vertexArray[i];
		} else if(vertexArray[i] > maxX){
			maxX = vertexArray[i];
		}
		
		if(vertexArray[i+1] < minY){
			minY = vertexArray[i+1];
		} else if(vertexArray[i+1] > maxY){
			maxY = vertexArray[i+1];
		}
		
		if(vertexArray[i+2] < minZ){
			minZ = vertexArray[i+2];
		} else if(vertexArray[i+2] > maxZ){
			maxZ = vertexArray[i+2];
		}
	}
	var diffX = maxX - minX;
	var diffY = maxY - minY;
	var diffZ = maxZ - minZ;
	
	//find largest value of differences
	var diffL;
	if(diffX > diffY){
		diffL = diffX;
	} else {
		diffL = diffY;
	}
	
	if(diffZ > diffL){
		diffL = diffZ;
	}
	
	if(diffL > MAX_WIDTH){
		for(i=0; i<vertexArray.length; i+=3){
			vertexArray[i] = vertexArray[i]*(MAX_WIDTH/diffL);
			vertexArray[i+1] = vertexArray[i+1]*(MAX_WIDTH/diffL);
			vertexArray[i+2] = vertexArray[i+2]*(MAX_WIDTH/diffL);
		}
	}
	
	//move to center
	maxX = maxX*(1/diffL);
	minX = minX*(1/diffL);
	maxY = maxY*(1/diffL);
	minY = minY*(1/diffL);
	maxZ = maxZ*(1/diffL);
	minZ = minZ*(1/diffL);
	
	var centerX = (maxX + minX)/2;
	var centerY = (maxY + minY)/2;
	var centerZ = (maxZ + minZ)/2;
	
	for(i=0; i<vertexArray.length; i+=3){
		vertexArray[i] -= centerX;
		vertexArray[i+1] -= centerY;
		vertexArray[i+2] -= centerZ;
	}
	
	maxX -= centerX;
	minX -= centerX;
	maxY -= centerY;
	minY -= centerY;
	maxZ -= centerZ;
	minZ -= centerZ;
	
	//x, y, z, u, v, kax, kay, kaz, kdx, kdy, kdz, ks...
	var count = 0;
	for(i=0; i<triangleArray.length; i+=4){
		var group_name = triangleArray[i+3];
		for(k=0; k<3; k++){
			//get the face of the object
			object_face[object_face.length] = object_face.length;
			
			//put x, y, z in vertex array
			object_vertex[object_vertex.length] = vertexArray[(triangleArray[i+k]-1)*3];
			object_vertex[object_vertex.length] = vertexArray[(triangleArray[i+k]-1)*3+1];
			object_vertex[object_vertex.length] = vertexArray[(triangleArray[i+k]-1)*3+2];
			
			object_textureless[object_textureless.length] = vertexArray[(triangleArray[i+k]-1)*3];
			object_textureless[object_textureless.length] = vertexArray[(triangleArray[i+k]-1)*3+1];
			object_textureless[object_textureless.length] = vertexArray[(triangleArray[i+k]-1)*3+2];
			
			var x, y, z;
			x = vertexArray[(triangleArray[i+k]-1)*3];
			y = vertexArray[(triangleArray[i+k]-1)*3+1];
			z = vertexArray[(triangleArray[i+k]-1)*3+2];
			//put u, v in vertex array
			var get_angle = function(coord1, coord2){
				var u, v;
				var r = Math.sqrt(coord1*coord1+coord2*coord2);
				
				u = Math.acos(coord1/r);
				v = Math.asin(coord2/r);
				
				if(v < 0){
					u = 2*Math.PI - u;
				}
				return u;
			};
			
			var angle = get_angle(x, z);
			
			object_vertex[object_vertex.length] = angle/(2*Math.PI);
			object_vertex[object_vertex.length] = (y-minY)/(maxY-minY);
			object_textureless[object_textureless.length] = angle/(2*Math.PI);
			object_textureless[object_textureless.length] = (y-minY)/(maxY-minY);
			
			object_vertex[object_vertex.length] = 0;
			object_vertex[object_vertex.length] = 0;
			object_vertex[object_vertex.length] = 0;

			object_vertex[object_vertex.length] = 0;
			object_vertex[object_vertex.length] = 0;
			object_vertex[object_vertex.length] = 0;
					
			object_vertex[object_vertex.length] = 0;
			object_vertex[object_vertex.length] = 0;
			object_vertex[object_vertex.length] = 0;
					
			object_vertex[object_vertex.length] = 0;
			object_vertex[object_vertex.length] = 0;
			
			//get the material information
			for(l=0; l<groupArray.length; l++){
				if(groupArray[l] == group_name){
					if(groupArray[l+1] == "Ka"){
						object_vertex[object_vertex.length-11] = groupArray[l+2];
						object_vertex[object_vertex.length-10] = groupArray[l+3];
						object_vertex[object_vertex.length-9] = groupArray[l+4];
					}
					if(groupArray[l+5] == "Kd"){
						object_vertex[object_vertex.length-8] = groupArray[l+6];
						object_vertex[object_vertex.length-7] = groupArray[l+7];
						object_vertex[object_vertex.length-6] = groupArray[l+8];
					}
					if(groupArray[l+9] == "Ks"){
						object_vertex[object_vertex.length-5] = groupArray[l+10];
						object_vertex[object_vertex.length-4] = groupArray[l+11];
						object_vertex[object_vertex.length-3] = groupArray[l+12];
					}
					if(groupArray[l+13] == 'N'){
						object_vertex[object_vertex.length-2] = groupArray[l+14];
					} else{
						object_vertex[object_vertex.length-2] = 1;
					}
					object_vertex[object_vertex.length-1] = object_vertex[object_vertex.length-1];
				}
			}
			for(l=0; l<11; l++){
				object_textureless[object_textureless.length] = 1;
			}
		}
	}
	//places information in proper array
	obj_info[num*3-3] = object_textureless;
	obj_info[num*3-2] = object_vertex;
	obj_info[num*3-1] = object_face;
}

var getRecenteredObjectArray = function(x, y, z, vertexArray){
	var object_temp = vertexArray.slice(0);

	var maxX = -3;
	var minX = 3;
	
	var maxY = -3;
	var minY = 3;

	var maxZ = -3;
	var minZ = 3;
	
	for(i=0; i<object_temp.length; i+=(3+2+3+3+3+2)){
		if(maxX < object_temp[i]){
			maxX = object_temp[i];
		} 
		if(minX > object_temp[i]){
			minX = object_temp[i];
		}

		if(maxY < object_temp[i+1]){
			maxY = object_temp[i+1];
		} 
		if(minY > object_temp[i+1]){
			minY = object_temp[i+1];
		}
		
		if(maxZ < object_temp[i+2]){
			maxZ = object_temp[i+2];
		} 
		if(minZ > object_temp[i+2]){
			minZ = object_temp[i+2];
		}
	}
	
	var centerX = (maxX + minX) / 2;
	var centerY = (maxY + minY) / 2;
	var centerZ = (maxZ + minZ) / 2;
	
	for(i=0; i<object_temp.length; i+=(3+2+3+3+3+1+1)){
		object_temp[i] = object_temp[i] - centerX + x;
		object_temp[i+1] = object_temp[i+1] - centerY + y;
		object_temp[i+2] = object_temp[i+2] - centerZ + z;
	}
	
	return object_temp;
}

var putObjectArraysTogether = function(vertexArray1, faceArray1, vertexArray2, faceArray2){
	var object1_vertex = vertexArray1.slice(0);
	var object1_face = faceArray1.slice(0);
	
	var object2_vertex = vertexArray2.slice(0);
	var object2_face = faceArray2.slice(0);
	
	var putTogetherVertex= [];
	var putTogetherFace = [];
	var faceNum = 0;
	
	for(i=0; i<object1_vertex.length; i+=(3+2+3+3+3+2)){
		for(j=0; j<(3+2+3+3+3+2); j++){
			putTogetherVertex[putTogetherVertex.length] = object1_vertex[i+j];
		}
	}
	for(i=0; i<object1_face.length; i++){
		putTogetherFace[putTogetherFace.length] = object1_face[i];
		faceNum++;
	}
	for(i=0; i<object2_vertex.length; i+=(3+2+3+3+3+2)){
		for(j=0; j<(3+2+3+3+3+2); j++){
			putTogetherVertex[putTogetherVertex.length] = object2_vertex[i+j];
		}
	}
	for(i=0; i<object2_face.length; i++){
		putTogetherFace[putTogetherFace.length] = object2_face[i]+faceNum;
	}
	
	var putTogetherArray = [];
	putTogetherArray[putTogetherArray.length] = putTogetherVertex;
	putTogetherArray[putTogetherArray.length] = putTogetherFace;
	
	return putTogetherArray;
}

var getResizedObjectArray = function(squareMax, vertexArray){
/*
		//find varibles from array that go into the shaders above
		GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),0);
		GL.vertexAttribPointer(_uv, 2, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3)*4);
		GL.vertexAttribPointer(_ambient, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2)*4);
		GL.vertexAttribPointer(_diffuse, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2+3)*4);
		GL.vertexAttribPointer(_specular, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2+3+3)*4);
		GL.vertexAttribPointer(_shininess, 2, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2+3+3+3)*4);
	*/
	
	var object_temp = vertexArray.slice(0);

	var maxX = -3;
	var minX = 3;
	
	var maxY = -3;
	var minY = 3;

	var maxZ = -3;
	var minZ = 3;
	
	for(i=0; i<object_temp.length; i+=(3+2+3+3+3+2)){
		if(maxX < object_temp[i]){
			maxX = object_temp[i];
		} 
		if(minX > object_temp[i]){
			minX = object_temp[i];
		}

		if(maxY < object_temp[i+1]){
			maxY = object_temp[i+1];
		} 
		if(minY > object_temp[i+1]){
			minY = object_temp[i+1];
		}
		
		if(maxZ < object_temp[i+2]){
			maxZ = object_temp[i+2];
		} 
		if(minZ > object_temp[i+2]){
			minZ = object_temp[i+2];
		}
	}
	
	//get the largest difference
	var diffX, diffY, diffZ;
	
	diffX = maxX - minX;
	diffY = maxY - minY;
	diffZ = maxZ - minZ;
	var diffL;
	
	if(diffX > diffY){
		diffL = diffX;
	} else{
		diffL = diffY;
	}
	if(diffZ > diffL){
		diffL = diffZ;
	}	
//	alert(diffL);
	for(i=0; i<object_temp.length; i+=(3+2+3+3+3+2)){
		for(j=0; j<3; j++){
			object_temp[i+j] = object_temp[i+j]*(squareMax/diffL);
		}
	}
	
	return object_temp;
}	

var getMaximumXInArray = function(vertexArray){
	var object_temp = vertexArray.slice(0);

	var maxX = -3;
	
	for(i=0; i<object_temp.length; i+=(3+2+3+3+3+2)){
		if(maxX < object_temp[i]){
			maxX = object_temp[i];
		}
	}	
	return maxX;
}

var getMinimumXInArray = function(vertexArray){
	var object_temp = vertexArray.slice(0);

	var minX = 3;
	
	for(i=0; i<object_temp.length; i+=(3+2+3+3+3+2)){
		if(minX > object_temp[i]){
			minX = object_temp[i];
		}
	}	
	return minX;
}

var addCoords = function(array, x, y, z){
	array[array.length] = x;
	array[array.length] = y;
	array[array.length] = z;
}

var moveCenterArrayBy = function(array, x, y, z){
	for(i=0; i<array.length; i+=3){
		array[i] = array[i] + x;
		array[i+1] = array[i+1] + y;
		array[i+2] = array[i+2] + z;
	}
}

var eraseCoords = function(array, startNum){
	var newArray = [];
	var oldArray = array.slice(0);
	
	for(i=0; i<oldArray.length; i+=3){
		if(i != startNum){
			newArray[newArray.length] = oldArray[i];
			newArray[newArray.length] = oldArray[i+1];
			newArray[newArray.length] = oldArray[i+2];
		}
	}
	return newArray;
}

var bulletsHit = function(bullets, alien){
	var startValues = [];
	
	for(i=0; i<bullets.length; i+=3){
		for(j=0; j<alien.length; j+=3){
			if(bullets[i] >= alien[j]-0.2 && bullets[i] <= alien[j]+0.2){
				if(bullets[i+1] >= alien[j+1]-0.2 && bullets[i+1] <= alien[j+1]+0.2){
			//		if(bullets[i+2] >= alien[j+2]-0.2 && bullets[i+2] <= alien[j+1]+0.2){
						startValues[startValues.length] = i; //bullets
						startValues[startValues.length] = j; //alien
			//		}
				}
			}
		}
	}
	return startValues;
}

var main=function() {
	//gets the canvas in which obj is rendered
	var CANVAS=document.getElementById("your_canvas"); 
	CANVAS.width=window.innerWidth - 10;
	CANVAS.height=window.innerHeight - 10;

  	/*========================= CAPTURE Key EVENTS ========================= */
	
	//variables needed for moving object and rotating object
	var drag=false;
	var keyX = 0;
	var MOVEY = 0;
	var MOVEZ = 0;
	var MOVEX = 0;
	var WIDTH = 1;
	
	var keyDown = function(e){
		if(e.keyCode == 81){ //q
//			keyX = -5;
//			THETA+=keyX*2*Math.PI/CANVAS.width;
		} else if(e.keyCode == 87){ //w
//			keyX = 5;
//			THETA+=keyX*2*Math.PI/CANVAS.width;
		} else if(e.keyCode == 37){ //left arrow
			if(player_center[0] > -2)
				moveCenterArrayBy(player_center, -0.1, 0, 0);
//			MOVEX-=0.1;
		} else if(e.keyCode == 38){ //up arrow
//			MOVEY+=0.1;
		} else if(e.keyCode == 39){ //right arrow
			if(player_center[0] < 2)
				moveCenterArrayBy(player_center, 0.1, 0, 0);
//			MOVEX+=0.1;
		} else if(e.keyCode == 40){ //down arrow
//			MOVEY-=0.1;
		} else if(e.keyCode == 219){ //[
//			MOVEZ+=0.1;
		} else if(e.keyCode == 221){ //]
//			MOVEZ-=0.1;
		} else if(e.keyCode == 90){ //z
//			WIDTH=1.1;
		} else if(e.keyCode == 88){ //x
			alert("pause");
		} else if(e.keyCode ==32){
			//alert("shoot");
			addCoords(bullet_coords, player_center[0], player_center[1], player_center[2]);
//			alert(bullet_coords);
		}
	}

	//functions that move obj around based on mouse clicks (part of webglacademy code)
	var old_x, old_y;	

	var mouseUp=function(e){
		drag=false;
	}	
	
	var mouseDown=function(e) {
		drag=true;
		old_x=e.pageX, old_y=e.pageY;
		e.preventDefault();
		return false;
	}
	
	var mouseMove=function(e) {
		if (!drag) return false;
		var dX=e.pageX-old_x,
			dY=e.pageY-old_y;
		THETA+=dX*2*Math.PI/CANVAS.width;
		old_x=e.pageX, old_y=e.pageY;
		e.preventDefault();
	}	

	//makes the canvas listen the mouse and keys
	CANVAS.addEventListener("mousedown", mouseDown, false);
	CANVAS.addEventListener("mouseup", mouseUp, false);
	CANVAS.addEventListener("mouseout", mouseUp, false);
	CANVAS.addEventListener("mousemove", mouseMove, false);
	document.addEventListener("keydown", keyDown, false);

  /*========================= GET WEBGL CONTEXT ========================= */
	//from webglacademy
	try {
		var GL = CANVAS.getContext("experimental-webgl", {antialias: true});
	} catch (e) {
		alert("You are not webgl compatible :(") ;
		return false;
	} ;

  /*========================= SHADERS ========================= */
	//runs the Blinn-Phong code
	var shader_vertex_source="\n\
		attribute vec3 position;\n\
		attribute vec2 uv;\n\
		attribute vec3 color;\n\
		attribute vec3 ambient;\n\
		attribute vec3 diffuse;\n\
		attribute vec3 specular;\n\
		attribute vec2 shininess;\n\
		uniform mat4 Pmatrix;\n\
		uniform mat4 Vmatrix;\n\
		uniform mat4 Mmatrix;\n\
		varying vec2 vUV;\n\
		varying vec3 vColor;\n\
		varying vec3 vAmbient;\n\
		varying vec3 vDiffuse;\n\
		varying vec3 vSpecular;\n\
		varying vec2 vShininess;\n\
		varying vec3 vPosition;\n\
		\n\
		void main(void) {\n\
			gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);\n\
			vUV=uv;\n\
			vColor = color;\n\
			vAmbient = ambient;\n\
			vDiffuse = diffuse;\n\
			vSpecular = specular;\n\
			vShininess = shininess;\n\
			vPosition = position;\n\
		}";

	var shader_fragment_source="\n\
		precision mediump float;\n\
		uniform sampler2D sampler;\n\
		\n\
		const vec3 eye = vec3(0,0,10);\n\
		//-0.1875,0.999,1.0499999999999998,-0.2875,0.999,1.0499999999999998\n\
		const vec3 light_position = vec3(10,-9,-5);\n\
		const vec3 light_intensity = vec3(1,1,1);\n\
		\n\
		const vec3 tempAmbient = vec3(1,1,1);\n\
		const vec3 tempDiffuse = vec3(1,1,1);\n\
		const vec3 tempSpecular = vec3(1,1,1);\n\
		\n\
		varying vec2 vUV;\n\
		varying vec3 vColor;\n\
		varying vec3 vAmbient;\n\
		varying vec3 vDiffuse;\n\
		varying vec3 vSpecular;\n\
		varying vec2 vShininess;\n\
		varying vec3 vPosition;\n\
		\n\
		\n\
		void main(void) {\n\
			vec3 color = vec3(texture2D(sampler, vUV));\n\
			vec3 light_vector = normalize(vPosition + light_position);\n\
			vec3 eye_vector = normalize(eye + vPosition);\n\
			\n\
			vec3 normal_vector = normalize(light_vector*eye_vector);\n\
			\n\
			\n\
			vec3 lightMinusEye = light_vector - eye_vector;\n\
			vec3 half_vector = normalize(lightMinusEye);\n\
			vec3 ambientWithLight = light_intensity*vAmbient;\n\
			\n\
			float scalar = max(dot(normal_vector, light_vector), 0.0);\n\
			vec3 diffuseWithLight = (vDiffuse*light_intensity) * scalar;\n\
			\n\
			scalar = 0.0;\n\
			float lambertian = max(dot(light_vector, normal_vector), 0.0);\n\
			if(lambertian > 0.0){\n\
				float mulBy = max(dot(half_vector, normal_vector), 0.0);\n\
				scalar = pow(mulBy, vShininess[0]);\n\
			}\n\
			\n\
			vec3 specularWithLight = (light_intensity*vSpecular)*scalar;\n\
			\n\
			vec3 I = ambientWithLight + diffuseWithLight + specularWithLight;\n\
			\n\
			\n\
			gl_FragColor = vec4(I*color, 1000);\n\
		}";
		
	//returns the shader
	var get_shader=function(source, type, typeString) {
		var shader = GL.createShader(type);
		GL.shaderSource(shader, source);
		GL.compileShader(shader);
		if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
			alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
			return false;
		}
		return shader;
	};

	//makes it so the shaders can work in code
	var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
	var shader_fragment=get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

	var SHADER_PROGRAM=GL.createProgram();
	GL.attachShader(SHADER_PROGRAM, shader_vertex);
	GL.attachShader(SHADER_PROGRAM, shader_fragment);

	GL.linkProgram(SHADER_PROGRAM);

	var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
	var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
	var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");

	var _sampler = GL.getUniformLocation(SHADER_PROGRAM, "sampler");
	var _uv = GL.getAttribLocation(SHADER_PROGRAM, "uv");
	var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
  
	//ambient, diffuse, specular, shininess
	var _ambient = GL.getAttribLocation(SHADER_PROGRAM, "ambient");
	var _diffuse = GL.getAttribLocation(SHADER_PROGRAM, "diffuse");
	var _specular = GL.getAttribLocation(SHADER_PROGRAM, "specular");
	var _shininess = GL.getAttribLocation(SHADER_PROGRAM, "shininess");

	GL.enableVertexAttribArray(_uv);
	GL.enableVertexAttribArray(_position);
	GL.enableVertexAttribArray(_ambient);
	GL.enableVertexAttribArray(_diffuse);
	GL.enableVertexAttribArray(_specular);
	GL.enableVertexAttribArray(_shininess);

	GL.useProgram(SHADER_PROGRAM);
	GL.uniform1i(_sampler, 0);

  /*========================= THE OBJECTS ========================= */
	//READ FROM FILE:
	getInfo("input/player.obj", 1); //0, 1	0, 1, 2  (3n-3 to 3n-1)
	getInfo("input/barrier.obj", 2); //2, 3		3, 4, 5
	getInfo("input/alien.obj", 3); //4, 5		6, 7, 8
	getInfo("input/bullet.obj", 4);
	getInfo("input/laser.obj", 5);
	getInfo("input/floor.obj", 6);
	
	//JUMP HERE
	aliens[0] = [];
	aliens[1] = [];
	world = putObjectArraysTogether(getResizedObjectArray(.2, getRecenteredObjectArray(-5, 0, 0, obj_info[3*3-2])), obj_info[3*3-1], 
		getResizedObjectArray(.2, getRecenteredObjectArray(5, 0, 0, obj_info[3*3-2])), obj_info[3*3-1]);


	//resize, then recenter
	var alienModelVertex = obj_info[3*3-2].slice(0);
	var alienModelFaces = obj_info[3*3-1].slice(0);
	
//	var iteration = 0;
	
	addCoords(alien_center, -1.8, 0.2, -0.2);
	addCoords(alien_center, -1.4, 0.2, -0.2);
	addCoords(alien_center, -1.0, 0.2, -0.2);
	addCoords(alien_center, -0.6, 0.2, -0.2);
	addCoords(alien_center, -0.2, 0.2, -0.2);
	addCoords(alien_center, 0.2, 0.2, -0.2);
	addCoords(alien_center, 0.6, 0.2, -0.2);
	addCoords(alien_center, 1.0, 0.2, -0.2);
	
	addCoords(alien_center, -1.8, 0.4, -0.4);
	addCoords(alien_center, -1.4, 0.4, -0.4);
	addCoords(alien_center, -1.0, 0.4, -0.4);
	addCoords(alien_center, -0.6, 0.4, -0.4);
	addCoords(alien_center, -0.2, 0.4, -0.4);
	addCoords(alien_center, 0.2, 0.4, -0.4);
	addCoords(alien_center, 0.6, 0.4, -0.4);
	addCoords(alien_center, 1.0, 0.4, -0.4);
	
	addCoords(alien_center, -1.8, 0.6, -0.6);
	addCoords(alien_center, -1.4, 0.6, -0.6);
	addCoords(alien_center, -1.0, 0.6, -0.6);
	addCoords(alien_center, -0.6, 0.6, -0.6);
	addCoords(alien_center, -0.2, 0.6, -0.6);
	addCoords(alien_center, 0.2, 0.6, -0.6);
	addCoords(alien_center, 0.6, 0.6, -0.6);
	addCoords(alien_center, 1.0, 0.6, -0.6);
	
	addCoords(alien_center, -1.8, 0.8, -0.8);
	addCoords(alien_center, -1.4, 0.8, -0.8);
	addCoords(alien_center, -1.0, 0.8, -0.8);
	addCoords(alien_center, -0.6, 0.8, -0.8);
	addCoords(alien_center, -0.2, 0.8, -0.8);
	addCoords(alien_center, 0.2, 0.8, -0.8);
	addCoords(alien_center, 0.6, 0.8, -0.8);
	addCoords(alien_center, 1.0, 0.8, -0.8);
	
	addCoords(alien_center, -1.8, 1, -1);
	addCoords(alien_center, -1.4, 1, -1);
	addCoords(alien_center, -1.0, 1, -1);
	addCoords(alien_center, -0.6, 1, -1);
	addCoords(alien_center, -0.2, 1, -1);
	addCoords(alien_center, 0.2, 1, -1);
	addCoords(alien_center, 0.6, 1, -1);
	addCoords(alien_center, 1.0, 1, -1);

	

	//barriers
	barriers[0] = [];
	barriers[1] = [];
	
	var barrierModelVertex = obj_info[3*2-2].slice(0);
	var barrierModelFaces = obj_info[3*2-1].slice(0);
	
	addCoords(barriers_center, -0.2, -0.8, 0.8);
	addCoords(barriers_center, 0, -0.8, 0.8);
	addCoords(barriers_center, 0.2, -0.8, 0.8);
	
	addCoords(barriers_center, -1.2, -0.8, 0.8);
	addCoords(barriers_center, -1.0, -0.8, 0.8);
	addCoords(barriers_center, -0.8, -0.8, 0.8);
	
	addCoords(barriers_center, 1.2, -0.8, 0.8);
	addCoords(barriers_center, 1.0, -0.8, 0.8);
	addCoords(barriers_center, 0.8, -0.8, 0.8);
	
	//create player
	
	player[0] = [];
	player[1] = [];
	
	var playerModelVertex = obj_info[3*1-2].slice(0);
	var playerModelFaces = obj_info[3*1-1].slice(0);
	
	player_center[0] = 0;
	player_center[1] = -1;
	player_center[2] = 1;
	
	var bulletModelVertex = obj_info[3*4-2].slice(0);
	var bulletModelFaces = obj_info[3*4-1].slice(0);
	
	var laserModelVertex = obj_info[3*5-2].slice(0);
	var laserModelFaces = obj_info[3*5-1].slice(0);
	
	var floorModelVertex = obj_info[3*6-2].slice(0);
	var floorModelFaces = obj_info[3*6-1].slice(0);

	//putObjectArraysTogether(getRecenteredObjectArray(0, 0, 0, getResizedObjectArray(0.1, obj_info[3*3-2])), obj_info[3*3-1],
		//getRecenteredObjectArray(0.5, 0, 0, getResizedObjectArray(0.1, obj_info[3*3-2])), obj_info[3*3-1]);
	//add extra object files using the given code below, replacing <name> with the actual name of the object file. Place it and
	//the mtl file in the input folder
	
	//ADD OBJ
	//getInfo("input/<name>.obj, 6);
	//getInfo("input/<name>.obj, 7);
	//getInfo("input/<name>.obj, 8);
	//getInfo("input/<name>.obj, 9);
  /*========================= MATRIX ========================= */

	var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
	var MOVEMATRIX=LIBS.get_I4();
	var VIEWMATRIX=LIBS.get_I4();

	LIBS.translateZ(VIEWMATRIX, -6);
	var THETA=0,
		PHI=0;
  /*========================= TEXTURES ========================= */
	var get_texture=function(image_URL){
		var image=new Image();

		image.src=image_URL;
		image.webglTexture=false;


		image.onload=function(e) {
			var texture=GL.createTexture();
			GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);	
			GL.bindTexture(GL.TEXTURE_2D, texture);
			
			
			//next 4 lines taken from http://msdn.microsoft.com/en-us/library/ie/dn302435%28v=vs.85%29.aspx
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			
			GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, image);
			
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
			GL.bindTexture(GL.TEXTURE_2D, null);
			image.webglTexture=texture;
		}

		return image;
	}
	
	var tex = [];
	
	tex[tex.length] = get_texture("input/texture.png");
	tex[tex.length] = get_texture("input/Koala.bmp");
	tex[tex.length] = get_texture("input/amber.png");
	tex[tex.length] = get_texture("input/butterfly.jpg");
	tex[tex.length] = get_texture("input/swirl.bmp");
	
		//ADD TEXTURES
	//add new textures using the commented out code below
	//tex[tex.length] = get_texture("input/<file name>");
	//tex[tex.length] = get_texture("input/<file name>");
	//tex[tex.length] = get_texture("input/<file name>");
	//tex[tex.length] = get_texture("input/<file name>");
	//tex[tex.length] = get_texture("input/<file name>");
	
	tex[tex.length] = get_texture("input/nomtl.png"); //must always be the last texture
	
	cube_texture=tex[0];
	/*========================= DRAWING ========================= */
	GL.enable(GL.DEPTH_TEST);
	GL.depthFunc(GL.LEQUAL);
	GL.clearColor(0.0, 0.0, 0.0, 0.0);
	GL.clearDepth(1.0);

	var time_old=0;
	var move = 0;
	var animate=function(time) {

		move++;
		cube_vertex = world[0];
		cube_faces = world[1];
		
		var CUBE_VERTEX= GL.createBuffer ();
		GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
		GL.bufferData(GL.ARRAY_BUFFER,
					new Float32Array(cube_vertex),
			GL.STATIC_DRAW);
		var CUBE_FACES= GL.createBuffer ();
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
					new Uint16Array(cube_faces),
			GL.STATIC_DRAW);
		var dt=time-time_old;
		LIBS.set_I4(MOVEMATRIX);
		LIBS.rotateY(MOVEMATRIX, THETA);
		LIBS.rotateX(MOVEMATRIX, PHI);
		LIBS.translateY(VIEWMATRIX, MOVEY);
		LIBS.translateZ(VIEWMATRIX, MOVEZ);
		LIBS.translateX(VIEWMATRIX, MOVEX);
		LIBS.scale(VIEWMATRIX, WIDTH);
		MOVEY=0;
		MOVEZ=0;
		MOVEX=0;
		WIDTH=1;
		time_old=time;
		
		if(alien_center.length == 0){
			game_over = true;
		}
		
		if(move%10 == 0){
			
			if(alien_center.length > 0){
				var minY = 1000;
				
				for(i=0; i<alien_center.length; i+=3){
					if(alien_center[i+1] < minY){
						minY = alien_center[i+1];
					}
				}
				var random = Math.floor(Math.random() * (alien_center.length/3));
				var valid = false;
				while(valid == false){
//					alert(alien_center[random+1]);
					if(alien_center[random+1] == minY){
						valid = true;
					} else{
						random = Math.floor(Math.random() * (alien_center.length/3))
					}
				}
				
				//laser start coordinates
				laser_coords[laser_coords.length] = alien_center[random];
				laser_coords[laser_coords.length] = alien_center[random+1];
				laser_coords[laser_coords.length] = alien_center[random+2];
				for(i=0; i<laser_coords.length; i+=3){
					if(laser_coords[i+1] < -3){
						laser_coords = eraseCoords(laser_coords, i);
					}
				}
			}
		}
		
		var divideBy = 1;
		if(alien_center.length < 20)
			divideBy = 3;
		if(move%(divideBy) == 0){
			moveCenterArrayBy(laser_coords, 0, -.1, .1);
		}
		if(move%divideBy == 0){
			moveCenterArrayBy(bullet_coords, 0, .1, -.1);
			
			for(i=0; i<bullet_coords.length; i+=3){
				if(bullet_coords[i+1] > 3){
					bullet_coords = eraseCoords(bullet_coords, i);
				}
			}
			var values = bulletsHit(bullet_coords, alien_center);
			var temp_bullets = [];
			var temp_aliens = [];
			for(i=0; i<bullet_coords.length; i+=3){
				var erased = false;
				for(j=0; j<values.length; j+=2){
					if(values[j] == i){
						erased = true;
					}
				}
				
				if(erased == false){
					temp_bullets[temp_bullets.length] = bullet_coords[i];
					temp_bullets[temp_bullets.length] = bullet_coords[i+1];
					temp_bullets[temp_bullets.length] = bullet_coords[i+2];
				}
			}
			for(k=0; k<alien_center.length; k+=3){
				var erased = false;
				for(j=0; j<values.length; j+=2){
					if(values[j+1] == k){
						erased = true;
					}
				}
				
				if(erased == false){
					temp_aliens[temp_aliens.length] = alien_center[k];
					temp_aliens[temp_aliens.length] = alien_center[k+1];
					temp_aliens[temp_aliens.length] = alien_center[k+2];
				}
			}
			bullet_coords = temp_bullets;
			alien_center = temp_aliens;
			
			var temp_lasers = [];
			var temp_barriers = [];
	
			values = [];
			for(i=0; i<laser_coords.length; i+=3){
				for(j=0; j<barriers_center.length; j+=3){
					if(((laser_coords[i+2]) >= (barriers_center[j+2]-.1)) && ((laser_coords[i+2]) <= (barriers_center[j+2]+.1))){
						if(laser_coords[i] >= barriers_center[j]-.1 && laser_coords[i] <= barriers_center[j]+.1){
							values[values.length] = i;
							values[values.length] = j;
						}
					}
				}
			}
			for(i=0; i<laser_coords.length; i+=3){
				var erased = false;
				for(j=0; j<values.length; j+=2){
					if(values[j] == i){
						erased = true;
					}
				}
				
				if(erased == false){
					temp_lasers[temp_lasers.length] = laser_coords[i];
					temp_lasers[temp_lasers.length] = laser_coords[i+1];
					temp_lasers[temp_lasers.length] = laser_coords[i+2];
				}
			}
			for(k=0; k<barriers_center.length; k+=3){
				var erased = false;
				for(j=0; j<values.length; j+=2){
					if(values[j+1] == k){
						erased = true;
					}
				}
				
				if(erased == false){
					temp_barriers[temp_barriers.length] = barriers_center[k];
					temp_barriers[temp_barriers.length] = barriers_center[k+1];
					temp_barriers[temp_barriers.length] = barriers_center[k+2];
				}
			}
			barriers_center = temp_barriers;
			laser_coords = temp_lasers;
			
			for(i=0; i<laser_coords.length; i+=3){
				if(((laser_coords[i+2]) >= (player_center[j+2]-.1)) && ((laser_coords[i+2]) <= (player_center[j+2]+.1))){
					if(laser_coords[i] >= player_center[j]-.1 && laser_coords[i] <= player_center[j]+.1){
						game_over = true;
					}
				}
			}
		}		
		
		var minZ = 100;
		for(t=0; t<alien_center.length; t+=3){
			if(alien_center[t+2] < minZ){
				minZ = alien_center[t+2];
			}
		}
		minZ = (-(minZ) + 11)/2;
		minZ = Math.round(minZ);
		if(move%(minZ) == 0){
		//	alert(directionMove);
			if(directionMove == 0){
				moveCenterArrayBy(alien_center, 0, -.1, .1);
				directionMove = 1;
				
				var minY = 3;
				
				for(i=0; i<alien_center.length; i+=3){
					if(alien_center[i+1] < minY){
						minY = alien_center[i+1];
					}
				}
				if(minY <= -MOVE+0.2){
					directionMove = 5;
					game_over = true;
				}
			} else if(directionMove == 1){
				moveCenterArrayBy(alien_center, .1, 0, 0);
				var maxX = -3;
				
				for(i=0; i<alien_center.length; i+=3){
					if(alien_center[i] > maxX){
						maxX = alien_center[i];
					}
				}
				if(maxX >= 2)
					directionMove = 4;
			} else if(directionMove == 2){
				moveCenterArrayBy(alien_center, -.1, 0, 0);
				
				var minX = 3;
				
				for(i=0; i<alien_center.length; i+=3){
					if(alien_center[i] < minX){
						minX = alien_center[i];
					}
				}
				if(minX <= -2)
					directionMove = 0;
			} else if(directionMove == 4){
				moveCenterArrayBy(alien_center, 0, -.1, .1);
				directionMove = 2;
				
				var minY = 3;
				
				for(i=0; i<alien_center.length; i+=3){
					if(alien_center[i+1] < minY){
						minY = alien_center[i+1];
					}
				}
				if(minY <= -MOVE+0.2){
					directionMove = 5;
					game_over = true;
				}
			}
		}
		
		aliens[0] = [];
		aliens[1] = [];
		barriers[0] = [];
		barriers[1] = [];
		player[0] = [];
		player[1] = [];
		bullet[0] = [];
		bullet[1] = [];
		laser[0] = [];
		laser[1] = [];
		

			for(m=0; m<alien_center.length; m+=3){
				aliens = putObjectArraysTogether(aliens[0], aliens[1], getRecenteredObjectArray(alien_center[m],alien_center[m+1],
							alien_center[m+2], getResizedObjectArray(.2, alienModelVertex)), alienModelFaces);
			}
		
			world[0] = aliens[0];
			world[1] = aliens[1];

			for(m=0; m<barriers_center.length; m+=3){
				barriers = putObjectArraysTogether(barriers[0], barriers[1], getRecenteredObjectArray(barriers_center[m],
								barriers_center[m+1], barriers_center[m+2], getResizedObjectArray(.2, barrierModelVertex)), barrierModelFaces);
			}
	
	
			world = putObjectArraysTogether(world[0], world[1], barriers[0], barriers[1]);
		
			player = putObjectArraysTogether(player[0], player[1], getRecenteredObjectArray(player_center[0],player_center[1],player_center[2],
						getResizedObjectArray(.2, playerModelVertex)), playerModelFaces);
		
			world = putObjectArraysTogether(world[0], world[1], player[0], player[1]);
		
			for(m=0; m<bullet_coords.length; m+=3){
				bullet = putObjectArraysTogether(bullet[0], bullet[1], getRecenteredObjectArray(bullet_coords[m], bullet_coords[m+1], 
							bullet_coords[m+2], getResizedObjectArray(.05, bulletModelVertex)), bulletModelFaces);
			}
			world = putObjectArraysTogether(world[0], world[1], bullet[0], bullet[1]);
		
			for(m=0; m<laser_coords.length; m+=3){
				laser = putObjectArraysTogether(laser[0], laser[1], getRecenteredObjectArray(laser_coords[m], laser_coords[m+1],
							laser_coords[m+2], getResizedObjectArray(.05, laserModelVertex)), laserModelFaces);
			}
		
			world = putObjectArraysTogether(world[0], world[1], laser[0], laser[1]);
		
			world = putObjectArraysTogether(world[0], world[1], getResizedObjectArray(20, getRecenteredObjectArray(0,-1,0,floorModelVertex)),
						floorModelFaces);

		if(game_over == true){
			world[0] = [];
			world[1] = [];
			if(alien_center.length == 0 && display == 0){
				alert("You won!");
				display = 1;
			} else if(display == 0){
				alert("Sorry. You lost.");
				display = 1;
			}
		}
		
	
		GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
		GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
		GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
		GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
		
		//define the texture based on the earlier code
		cube_texture = tex[tex.length - 1];
		if(displayTexture == 1){
			cube_texture = tex[textureNum-1];
		}
		
		if (cube_texture.webglTexture) {
			GL.activeTexture(GL.TEXTURE0);
			GL.bindTexture(GL.TEXTURE_2D, cube_texture.webglTexture);
		}
		
		//find varibles from array that go into the shaders above
		GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),0);
		GL.vertexAttribPointer(_uv, 2, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3)*4);
		GL.vertexAttribPointer(_ambient, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2)*4);
		GL.vertexAttribPointer(_diffuse, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2+3)*4);
		GL.vertexAttribPointer(_specular, 3, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2+3+3)*4);
		GL.vertexAttribPointer(_shininess, 2, GL.FLOAT, false,4*(3+2+3+3+3+1+1),(3+2+3+3+3)*4);
		
		GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
		GL.drawElements(GL.TRIANGLES, cube_faces.length, GL.UNSIGNED_SHORT, 0);

		GL.flush();
		window.requestAnimationFrame(animate);
	}
	animate(0);
}