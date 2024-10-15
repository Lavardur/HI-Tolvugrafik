/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun á tveimur minnissvæðum (VBO) og hvernig þau
//     eru virkjuð rétt fyrir teikningu í render().
//     Tvö VBO teiknuð með sömu liturum (og "uniform" breytu)
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
var gl;

// Global variables (accessed in render)
var locPosition;
var locColor;
var bufferIdA;
var bufferIdB;
var colorA = vec4(1.0, 0.0, 0.0, 1.0);
var colorB = vec4(0.0, 1.0, 0.0, 1.0);

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Two triangles
    var verticesA = [ vec2( -0.9, -0.5 ), vec2( -0.5,  0.5 ), vec2( -0.1, -0.5 ) ]; 
    var verticesB = [ vec2(  0.1, -0.5 ), vec2(  0.5,  0.5 ), vec2(  0.9, -0.5 ) ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Define two VBOs and load the data into the GPU
    bufferIdA = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdA );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesA), gl.STATIC_DRAW );

    bufferIdB = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdB );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verticesB), gl.STATIC_DRAW );

    // Get location of shader variable vPosition
    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );

    locColor = gl.getUniformLocation( program, "rcolor" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Draw first triangle    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdA );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorA) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    // Draw second triangle
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdB );
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorB) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

}
