var canvas;
var gl;

// Current position of the center of the square
var box = vec2(0.0, 0.0);

// Direction (and speed) of the square
var dX;
var dY;

// The area is from -maxX to maxX and -maxY to maxY
var maxX = 1.0;
var maxY = 1.0;

// Half width/height of the square
var boxRad = 0.05;

// Vertices for the square
var squareVertices = [
    vec2(-0.05, -0.05),
    vec2(0.05, -0.05),
    vec2(0.05, 0.05),
    vec2(-0.05, 0.05)
];

// Vertices for the paddle
var paddleVertices = [
    vec2(-0.1, -0.9),
    vec2(-0.1, -0.86),
    vec2(0.1, -0.86),
    vec2(0.1, -0.9)
];

var mouseX; // Old value of x-coordinate
var movement = false; // Do we move the paddle?

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // Give the square a random direction initially
    dX = Math.random() * 0.1 - 0.05;
    dY = Math.random() * 0.1 - 0.05;

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the paddle data into the GPU
    var paddleBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paddleBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(paddleVertices), gl.DYNAMIC_DRAW);

    // Load the square data into the GPU
    var squareBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(squareVertices), gl.DYNAMIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    locBox = gl.getUniformLocation(program, "boxPos");

    // Event listeners for mouse
    canvas.addEventListener("mousedown", function(e) {
        movement = true;
        mouseX = e.offsetX;
    });

    canvas.addEventListener("mouseup", function(e) {
        movement = false;
    });

    canvas.addEventListener("mousemove", function(e) {
        if (movement) {
            var xmove = 2 * (e.offsetX - mouseX) / canvas.width;
            mouseX = e.offsetX;
            for (var i = 0; i < paddleVertices.length; i++) {
                paddleVertices[i][0] += xmove;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, paddleBufferId);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(paddleVertices));
        }
    });

    render();
};

function render() {
    // Make the square bounce off the walls
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Update the position of the square
    box[0] += dX;
    box[1] += dY;

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the paddle
    gl.bindBuffer(gl.ARRAY_BUFFER, paddleBufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Update the position of the square in the shader
    gl.uniform2fv(locBox, flatten(box));

    // Draw the square
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    window.requestAnimFrame(render);
}
