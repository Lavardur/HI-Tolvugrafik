"use strict";

var gl;
var points;
var program;

var NumPoints = 10000;
var scale = 0.5;
var scaleUniformLocation;
var offset = vec2(0, 0);
var offsetUniformLocation;
var isDragging = false;
var lastMousePosition = vec2(0, 0);
var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    setCanvasSize(canvas);
    setUniformVariables();

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );

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

    scaleUniformLocation = gl.getUniformLocation(program, "scale");
    offsetUniformLocation = gl.getUniformLocation(program, "offset");
    colorLoc = gl.getUniformLocation( program, "fColor" );

    document.body.onkeyup = function(e) {
        if (e.key == " " ||
            e.code == "Space" ||      
            e.keyCode == 32      
        ) {
            gl.clear( gl.COLOR_BUFFER_BIT );

            gl.uniform4fv( colorLoc, vec4(Math.random(), Math.random(), Math.random(), 1.0));
            gl.drawArrays( gl.POINTS, 0, points.length);

            // Change the rotating angle
            vPosition += 0.01;

            // Send the new angle over to GPU
            gl.uniform1f( vPositionLoc, theta );
        }
    }


    window.addEventListener("resize", function () {
        setCanvasSize(canvas);
        setUniformVariables();
    });


    canvas.addEventListener("wheel", function (event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            scale *= 1.03;
        } else {
            scale *= 0.97;
        }
        setUniformVariables();
    });


    canvas.addEventListener("mousedown", function (event) {
        isDragging = true;
        lastMousePosition = vec2(event.clientX, event.clientY);
    });


    canvas.addEventListener("mousemove", function (event) {
        if (isDragging) {
            var currentPosition = vec2(event.clientX, event.clientY);
            var delta = subtract(currentPosition, lastMousePosition);
            offset = add(offset, vec2(delta[0] * 2.0 / canvas.width, delta[1] * -2.0 / canvas.width));
            lastMousePosition = currentPosition;
            setUniformVariables();
        }
    });


    canvas.addEventListener("mouseup", function () {
        isDragging = false;
    });


    canvas.addEventListener("mouseleave", function () {
        isDragging = false;
    });

    function setUniformVariables() {
        var scaleUniformLocation = gl.getUniformLocation(program, "scale");
        var offsetUniformLocation = gl.getUniformLocation(program, "offset");
    
        gl.uniform1f(scaleUniformLocation, scale);
        gl.uniform2fv(offsetUniformLocation, offset);
    }
    
    function setCanvasSize(canvas) {
        var size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.8);
        canvas.width = size;
        canvas.height = size;
        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }
    
    render();
};


function render() {
    setUniformVariables();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length);

    window.requestAnimFrame(render);
}
