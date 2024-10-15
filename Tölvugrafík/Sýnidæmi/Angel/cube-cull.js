/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Teningur ásamt hnitakerfisásum.  Notum bakhliðareyðingu
//     og getum snúið við hnútaröð þríhyrninga.
//
//    Hjálmtýr Hafsteinsson, október 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var vBuffer;
var cBuffer;
var avBuffer;
var acBuffer;

var vColor;
var vPosition;

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -4.0;

var proLoc;
var mvLoc;

// Endapunktar hnitakerfisásann þriggja
var axes = [
    [ -1.5,  0.0,  0.0 ],
    [  1.5,  0.0,  0.0 ],
    [  0.0, -1.5,  0.0 ],
    [  0.0,  1.5,  0.0 ],
    [  0.0,  0.0, -1.5 ],
    [  0.0,  0.0,  1.5 ]
   ];
    
// Litir ásanna
var axes_colors = [
    [ 1.0, 0.0, 0.0, 1.0 ],     // X-ás er rauður
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],     // Y-ás er grænn
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 0.0, 1.0, 1.0 ],     // Z-ás er blár
    [ 0.0, 0.0, 1.0, 1.0 ]
   ];


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    gl.frontFace(gl.CCW);
    document.getElementById("Orient").innerHTML = "gl.CCW";
    
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    document.getElementById("Cull").innerHTML = "gl.BACK";

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    // uppsetning á minni (VBO) fyrir ása
    acBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, acBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(axes_colors), gl.STATIC_DRAW );

    avBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, avBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(axes), gl.STATIC_DRAW );

    gl.lineWidth(100.0);

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    var proj = perspective( 50.0, 1.0, 0.2, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    
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
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (e.offsetY - origY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Event listener for keyboard
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp ör
                zDist += 0.2;
                break;
            case 40:	// niður ör
                zDist -= 0.2;
                break;
         }
     }  );  

    // Event listener for mousewheel
     window.addEventListener("wheel", function(e){
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );  


    // Event listeners for buttons
    document.getElementById("btnBack").onclick = function(){
        gl.cullFace(gl.BACK);
        document.getElementById("Cull").innerHTML = "gl.BACK";
        render();
    };

    document.getElementById("btnFront").onclick = function(){
        gl.cullFace(gl.FRONT);
        document.getElementById("Cull").innerHTML = "gl.FRONT";
        render();
    };

    document.getElementById("btnFrontBack").onclick = function(){
        gl.cullFace(gl.FRONT_AND_BACK);
        document.getElementById("Cull").innerHTML = "gl.FRONT_AND_BACK";
        render();
    };

    document.getElementById("btnCCW").onclick = function(){
        gl.frontFace(gl.CCW);
        document.getElementById("Orient").innerHTML = "gl.CCW";
        render();
    };

    document.getElementById("btnCW").onclick = function(){
        gl.frontFace(gl.CW);
        document.getElementById("Orient").innerHTML = "gl.CW";
        render();
    };


    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        colors.push(vertexColors[a]);
        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var ctm = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    ctm = mult( ctm, rotateX( -spinX ) );
    ctm = mult( ctm, rotateY( -spinY ) );
    
    gl.uniformMatrix4fv(mvLoc, false, flatten(ctm));

    // teikna fyrst teninginn
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // teikna svo ásana (röð á tening/ásum skiptir ekki máli því dýptarminni er í gangi)
    gl.bindBuffer( gl.ARRAY_BUFFER, acBuffer );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, avBuffer );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.LINES, 0, 6 );

    requestAnimFrame( render );
}

