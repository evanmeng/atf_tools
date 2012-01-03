    var gl;

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialize WebGL, sorry :-(");
        }
    }


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    var shaderProgram;

    function initShaders() {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    }


    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    function degToScale(degrees) {
        if(degrees ==0)
            return 1.0;
            
        var value = degrees /2.0;
        if(value > 0)
            return value;
        else
            return -(1.0/value);
    }
    
    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    
    var cubeRotationMatrix = mat4.create();
    mat4.identity(cubeRotationMatrix);
    
    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }


    function handleMouseUp(event) {
        mouseDown = false;
    }
    
    function handleMouseMove(event){
        if(!mouseDown){
            return;
        }
        if(event.button==0){
            handleLeftMouseMove(event);
        }
        else if(event.button==1){
            handleMiddleMouseMove(event);
        }
        else{
            handleRightMouseMove(event);
        }    
    }

    function handleLeftMouseMove(event) {

        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degToRad(deltaX), [0, 1, 0]);

        var deltaY = newY - lastMouseY;
        mat4.rotate(newRotationMatrix, degToRad(deltaY), [1, 0, 0]);

        mat4.multiply(newRotationMatrix, cubeRotationMatrix, cubeRotationMatrix);

        lastMouseX = newX
        lastMouseY = newY;
    }
    
    function handleMiddleMouseMove(event) {

        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX
        var deltaY = newY - lastMouseY;
        var newTranslationMatrix = mat4.create();
        mat4.identity(newTranslationMatrix);
        mat4.translate(newTranslationMatrix, [deltaX/20, -deltaY/20, 0]);

        mat4.multiply(newTranslationMatrix, cubeRotationMatrix, cubeRotationMatrix);

        lastMouseX = newX
        lastMouseY = newY;
    }
    
    function handleRightMouseMove(event) {

        var newX = event.clientX;
        var newY = event.clientY;

        var deltaX = newX - lastMouseX
        var deltaY = newY - lastMouseY;  
        //alert ("deltaX=" + deltaX + "; deltaY=" + deltaY);
        var scaleValue = degToScale(deltaY);
        var newScaleMatrix = mat4.create();
        mat4.identity(newScaleMatrix);
        mat4.scale(newScaleMatrix, [scaleValue, scaleValue, scaleValue]);

        mat4.multiply(newScaleMatrix, cubeRotationMatrix, cubeRotationMatrix);

        lastMouseX = newX
        lastMouseY = newY;
    }



    var cubeVertexPositionBuffer;
    var cubeVertexColorBuffer;
    var cubeVertexIndexBuffer;

    function handleCube(CubeData) {

        cubeVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeData.vertexPositions), gl.STATIC_DRAW);
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;

        cubeVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);

        colors = CubeData.vertexColors;
        var unpackedColors = [];
        for (var i in colors) {
            var color = colors[i];
            for (var j=0; j < 4; j++) {
                unpackedColors = unpackedColors.concat(color);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
        cubeVertexColorBuffer.itemSize = 4;
        cubeVertexColorBuffer.numItems = 24;

        cubeVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(CubeData.vertexIndices), gl.STATIC_DRAW);
        cubeVertexIndexBuffer.itemSize = 1;
        cubeVertexIndexBuffer.numItems = 36;
    }

    function loadCube() {
        var request = new XMLHttpRequest();
        serverFolder = "http://localhost/utilities/jQuery-File-Upload/php/files/";
        filename = "cube.json";
        remoteFilename = serverFolder + filename;
        request.open("GET", remoteFilename);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
            	status = request.status;
            	if(status == 200){
                handleCube(JSON.parse(request.responseText));
               }
               else{
               	alert("Can not download the translated jason file!");
               }
            }
        }
        request.send();
    }

    function clearview(){

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    function drawScene() {
    
        clearview();

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
        mat4.identity(mvMatrix);
        //mat4.translate(mvMatrix, [-1.5, 0.0, -8.0]);
        mat4.translate(mvMatrix, [0, 0.0, -10.0]);
        mat4.rotate(mvMatrix, Math.PI/4, [1, 1, 0]);
        mat4.multiply(mvMatrix, cubeRotationMatrix);

        //setMatrixUniforms();
        if(cubeVertexPositionBuffer){
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
            setMatrixUniforms();
            gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
    }

    function tick() {
        requestAnimFrame(tick);
        drawScene();
    }


    function webGLStart() {
        var canvas = document.getElementById("test01-canvas");
        initGL(canvas);
        initShaders();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        
        canvas.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;

        //gl.bindFramebuffer(gl.FRAMEBUFFER, null);        
        clearview();

    }
    
    function zoomAll(){
        alert("Zoom All!");
    }

    function draw(){ 

    	/*fileinput = $("#uploadfiles");
    	 files = $(":file").files;
    	 if(files.length>0){
    	 	filename = files[0].name;
    	 	alert(filename);
    	 }
    	 else{
    	 	alert("Please select one file!");
    	 }
    	 */
       loadCube();
       tick();
    }
    

