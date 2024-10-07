/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun hnútahnit og hnútalita í sitthvoru
//     minnissvæðinu (buffers) í GPU
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var vertices = [ vec2( -0.5, -0.5 ), vec2( 0.0, 0.5 ), vec2( 0.5, -0.5 ) ];
var colors = [ vec4( 1.0, 0.0, 0.0, 1.0 ), vec4( 0.0, 1.0, 0.0, 1.0 ), vec4( 0.0, 0.0, 1.0, 1.0 ) ];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    // Tökum frá pláss fyrir hnútahnitin og tengjum við litarabreytuna vPosition    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Tökum frá pláss fyrir hnútalitina og tengjum við litarabreytuna vColor    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();

}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );

    window.requestAnimFrame(render);

}
