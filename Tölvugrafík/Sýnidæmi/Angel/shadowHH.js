/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Skuggi búinn til með ofanvarpi.  Sýnidæmi úr kennslubók
//     breytt þannig að hægt að hreyfa ljósið með örvalyklum og
//     hægt að snúa líkaninu í hringi (og ljósið er sýnt).
//
//    Hjálmtýr Hafsteinsson, október 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var pointsArray = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var theta  = 0.0;
var posX = 0.0;
var posZ = 1.0;

var zDist = -4.0;

var fovy = 60.0;
var near = 0.2;
var far = 100.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var fColor;
var light = vec3(0.0, 2.0, 0.0);

var m;

var red = vec4(1.0, 0.0, 0.0, 1.0);
var black = vec4(0.2, 0.0, 0.0, 1.0);
var yellow = vec4(1.0, 0.6, 0.0, 1.0);
var gray = vec4(0.5, 0.5, 0.5, 1.0);


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    

// matrix for shadow projection

    m = mat4();
    m[3][3] = 0;
    m[3][1] = -1/light[1];

    // color square red and shadow black
    
    // square
    pointsArray.push(vec4( -0.5, 0.5,  -0.5, 1.0 ));     
    pointsArray.push(vec4( -0.5,  0.5,  0.5, 1.0 ));  
    pointsArray.push(vec4( 0.5, 0.5,  0.5, 1.0 ));
    pointsArray.push(vec4( 0.5,  0.5,  -0.5, 1.0 ));                  

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    fColor = gl.getUniformLocation(program, "fColor");
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    projectionMatrix = perspective( fovy, 1.0, near, far );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    // Meðhöndlun örvalykla
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:    // vinstri ör
                posX -= 0.05;
                break;
            case 39:    // hægri ör
                posX += 0.05;
                break;
            case 38:	// upp ör
                posZ -= 0.05;
                break;
            case 40:	// niður ör
                posZ += 0.05;
                break;
        }
    } );

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (e.offsetX - origX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Event listener for mousewheel
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zDist += 0.1;
         } else {
             zDist -= 0.1;
         }
     }  );  

    render();
 
}


var render = function() {

    theta += 0.02;
    if(theta > 2*Math.PI) theta -= 2*Math.PI;

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
    // model-view matrix for square
    var modelViewMatrix = lookAt( vec3(1.0, 1.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    modelViewMatrix = mult( modelViewMatrix, rotateX(spinX) );
    modelViewMatrix = mult( modelViewMatrix, rotateY(spinY) );
    
    // send color and matrix for square then render
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniform4fv(fColor, flatten(red));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    
    // draw the floor as a larger square in the right place
    var floorMV = modelViewMatrix;
    floorMV = mult( floorMV, scalem(3.0, 1.0, 3.0) );
    floorMV = mult( floorMV, translate(0.0, -0.5001, 0.0) );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(floorMV) );
    gl.uniform4fv(fColor, flatten(gray));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    
    // draw the lightsource
    mvl = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
    mvl = mult(mvl, scalem(0.05, 0.05, 0.05));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(mvl) );
    gl.uniform4fv(fColor, flatten(yellow));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // move light source
    light[0] = Math.sin(theta);
    light[2] = Math.cos(theta);

    // model-view matrix for shadow then render
    modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
    modelViewMatrix = mult(modelViewMatrix, m);
    modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1], -light[2]));

    // send color and matrix for shadow
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniform4fv(fColor, flatten(black));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    requestAnimFrame(render);
}
