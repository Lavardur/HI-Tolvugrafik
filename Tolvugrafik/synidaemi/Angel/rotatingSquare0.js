/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Óhagkvæm aðferð til að snúa ferningi.  Breyta hnitum
//     allra hnúta í JS forriti og senda nýju hnitin yfir í
//     GPU í hvert sinn (sendum mikið gagnamagn)
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
"use strict";
var canvas;
var gl;

var theta = 0.01;
var vertices = [ vec2(  0,  1 ),
                 vec2( -1,  0 ),
                 vec2(  1,  0 ),
                 vec2(  0, -1 )
               ];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Change the coordinates of all vertices
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    for (var i=0; i<4; i++) {
       vertices[i] = vec2(c*vertices[i][0] - s*vertices[i][1], s*vertices[i][0] + c*vertices[i][1]);
    }
    
    // Send new coordinates over to GPU
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

    // Draw!
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    window.requestAnimFrame(render);
}
