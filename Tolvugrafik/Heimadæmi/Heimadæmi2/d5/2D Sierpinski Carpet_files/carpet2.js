"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2( -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )

    ];

    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}
function square(a, b, c , d){
    triangle(a, b, d);
    triangle(b, c, d)
}

function divideSquare(a, b, c, d, count) {
    // Check for end of recursion
    if (count === 0) {
        // Base case: draw the square
        square(a, b, c, d);
    } else {
        // Bisect the sides to find the midpoints
        var ab = mix(a, b, 1/3);
        var ab2 = mix(a, b, 2/3);
        var bc = mix(b, c, 1/3);
        var bc2 = mix(b, c, 2/3);
        var cd = mix(c, d, 1/3);
        var cd2 = mix(c, d, 2/3);
        var da = mix(d, a, 1/3);
        var da2 = mix(d, a, 2/3);
        var center1 = vec2( da2[0], ab[1] );
        var center2 = vec2( da2[0], ab2[1] );
        var center3 = vec2( da[0], ab2[1] );
        var center4 = vec2( da[0], ab[1] );

        --count;

        // Recursively divide the 8 surrounding squares (excluding the center square)
        divideSquare(a, ab, center1, da2, count);       // Bottom left
        divideSquare(ab, ab2, center2, center1, count);  // left middle
        divideSquare(ab2, b, bc, center2, count);      // Top-left
        divideSquare(center2, bc, bc2, center3, count);  // top middle
        // Center square is omitted to create the "hole"
        divideSquare(center3, bc2, c, cd, count);  // top right
        divideSquare(center4, center3, cd, cd2, count);  // right middle
        divideSquare(da, center4, cd2, d, count);  // bottom right
        divideSquare(da2, center1, center4, da, count);  // Bottom-middle square
    }
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

