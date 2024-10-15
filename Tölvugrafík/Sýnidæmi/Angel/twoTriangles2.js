/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Hvernig hægt er að lita hluti með mismunandi litum.
//     Hver hnútur hefur hnita- og litaeiginleika ("attribute") 
//     Litir þríhyrninganna byggjast á lit hnútanna sem mynda þá.
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

    
    // Two triangles: coordinates
    var vertices = [ vec2( -0.9, -0.5 ), vec2( -0.5,  0.5 ), vec2( -0.1, -0.5 ), 
                      vec2(  0.1, -0.5 ), vec2(  0.5,  0.5 ), vec2(  0.9, -0.5 ) ];

    // ... and their colors
    var colors = [ vec4( 1.0, 0.0, 0.0, 1.0 ), vec4( 1.0, 0.0, 0.0, 1.0 ), vec4( 1.0, 0.0, 0.0, 1.0 ),
                   vec4( 0.0, 1.0, 0.0, 1.0 ), vec4( 0.0, 1.0, 0.0, 1.0 ), vec4( 0.0, 0.0, 1.0, 1.0 ) ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Tökum frá pláss fyrir hnútahnitin og tengjum við litarabreytuna vPosition    
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( locPosition );

    // Tökum frá pláss fyrir hnútalitina og tengjum við litarabreytuna vColor    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.drawArrays( gl.TRIANGLES, 0, 6 );


}
