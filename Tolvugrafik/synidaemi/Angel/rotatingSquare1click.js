/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Snúningi á ferningi er stjórnað með vinstri/hægri
//     músarsmelli (ath. slökkt á "context menu" við
//     skilgreiningu á canvas)
//
//    Hjálmtýr Hafsteinsson, september 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var rotate = true;
var direction = 1;

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
    
    var vertices = [
        vec2(  0,  1 ),
        vec2(  1,  0 ),
        vec2( -1,  0 ),
        vec2(  0, -1 )
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    thetaLoc = gl.getUniformLocation( program, "theta" );

    canvas.addEventListener("mousedown", function(e){
        if( e.button === 0 ) rotate = !rotate;
        if( e.button === 2 ) direction = -1*direction;
    } );

    render();
};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    if( rotate ) {
        theta += 0.1*direction;
        gl.uniform1f( thetaLoc, theta );
    }
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    window.requestAnimFrame(render);
}
