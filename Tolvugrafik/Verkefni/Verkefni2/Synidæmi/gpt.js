var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var movement = false;     // Do we rotate?
var spinX = -30;
var spinY = -45;
var origX;
var origY;

var zDist = -7;

var fovy = 50;
var near = 0.1;
var far = 100.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 150.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var mv, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var gridSize = 10; // You can adjust the grid size as needed
var grid = createGrid(gridSize); // Initialize grid with random live/dead states

// **Added for Interpolation**
var prevGrid = copyGrid(grid); // Keep track of the previous state
var transitionStartTime = createEmptyGrid(gridSize, 0); // Record the start time of transition for each cell
var animationDuration = 500; // How long (in ms) the interpolation lasts

// Time-related variables for animation
var updateInterval = 1000; // Time between grid updates in milliseconds (1 second)

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    

    // This allows WebGL to properly determine which objects or parts of objects are in front of others.
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // helps improve rendering performance
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    normalCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    projectionMatrix = perspective( fovy, 1.0, near, far );

    
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

    // Event listeners for mouse interactions
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            spinY = ( spinY + (e.clientX - origX) ) % 360;
            spinX = ( spinX + (origY - e.clientY) ) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    } );
    
    // Event listener for mousewheel
    window.addEventListener("wheel", function(e){
        if( e.deltaY > 0.0 ) {
            zDist += 0.2;
        } else {
            zDist -= 0.2;
        }
    }  );  

    // Start the rendering loop
    window.requestAnimationFrame(render);

    // Update grid periodically based on the Game of Life rules
    setInterval(updateGrid, updateInterval);
}

// Grid Logic -------------------------------------------- //

function createGrid(size) {
    let grid = [];
    for (let x = 0; x < size; x++) {
        grid[x] = [];
        for (let y = 0; y < size; y++) {
            grid[x][y] = [];
            for (let z = 0; z < size; z++) {
                // Randomly initialize each cell as alive (1) or dead (0)
                grid[x][y][z] = Math.random() > 0.7 ? 1 : 0; 
            }
        }
    }
    return grid;
}

function createEmptyGrid(size, initialValue = 0) {
    let grid = [];
    for (let x = 0; x < size; x++) {
        grid[x] = [];
        for (let y = 0; y < size; y++) {
            grid[x][y] = [];
            for (let z = 0; z < size; z++) {
                grid[x][y][z] = initialValue;
            }
        }
    }
    return grid;
}

function copyGrid(originalGrid) {
    let newGrid = [];
    for (let x = 0; x < gridSize; x++) {
        newGrid[x] = [];
        for (let y = 0; y < gridSize; y++) {
            newGrid[x][y] = [];
            for (let z = 0; z < gridSize; z++) {
                newGrid[x][y][z] = originalGrid[x][y][z];
            }
        }
    }
    return newGrid;
}

function countNeighbors(x, y, z) {
    let neighbors = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (i === 0 && j === 0 && k === 0) continue; // Skip the current cell
                let nx = x + i;
                let ny = y + j;
                let nz = z + k;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && nz >= 0 && nz < gridSize) {
                    neighbors += grid[nx][ny][nz];
                }
            }
        }
    }
    return neighbors;
}

function updateGrid() {
    prevGrid = copyGrid(grid); // Copy the current grid to keep track of the previous state
    let newGrid = createEmptyGrid(gridSize); // Create a new grid to store the next generation

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                let neighbors = countNeighbors(x, y, z);

                if (grid[x][y][z] === 1) {
                    // A live cell stays alive if it has 5-7 neighbors, otherwise it dies
                    newGrid[x][y][z] = (neighbors >= 5 && neighbors <= 7) ? 1 : 0;
                } else {
                    // A dead cell becomes alive if it has exactly 6 neighbors
                    newGrid[x][y][z] = (neighbors === 6) ? 1 : 0;
                }

                // **Record transition start time if the state is changing**
                if (newGrid[x][y][z] !== grid[x][y][z]) {
                    transitionStartTime[x][y][z] = Date.now(); // Record start time
                }
            }
        }
    }

    grid = newGrid; // Update the grid
}

// Cube  ------------------------------------------------- //

function normalCube()
{
    quad( 1, 0, 3, 2, 0 );
    quad( 2, 3, 7, 6, 1 );
    quad( 3, 0, 4, 7, 2 );
    quad( 6, 5, 1, 2, 3 );
    quad( 4, 5, 6, 7, 4 );
    quad( 5, 4, 0, 1, 5 );
}

function quad(a, b, c, d, n) 
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var faceNormals = [
        vec4( 0.0, 0.0,  1.0, 0.0 ),  // front
        vec4(  1.0, 0.0, 0.0, 0.0 ),  // right
        vec4( 0.0, -1.0, 0.0, 0.0 ),  // down
        vec4( 0.0,  1.0, 0.0, 0.0 ),  // up
        vec4( 0.0, 0.0, -1.0, 0.0 ),  // back
        vec4( -1.0, 0.0, 0.0, 0.0 )   // left
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
        
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( vertices[indices[i]] );
        normalsArray.push(faceNormals[n]);
    }
}

// Render  ------------------------------------------------- //

function render(currentTime) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calculate current time
    if (!currentTime) {
        currentTime = Date.now();
    }

    // Precompute camera view matrix and apply rotation (for all cubes)
    let viewMatrix = lookAt(vec3(0.0, 0.0, zDist), at, up);
    viewMatrix = mult(viewMatrix, rotateX(spinX));
    viewMatrix = mult(viewMatrix, rotateY(spinY));

    // Set the projection matrix once, outside the loop
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Base scale factor for the cubes
    let baseScaleFactor = 0.2;

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {

                let isPrevAlive = prevGrid[x][y][z] === 1;
                let isNowAlive = grid[x][y][z] === 1;

                // Check if the cell is transitioning
                let isAnimating = isPrevAlive !== isNowAlive;

                if (isAnimating) {
                    let startTime = transitionStartTime[x][y][z];
                    let timeSinceTransition = currentTime - startTime;
                    let progress = timeSinceTransition / animationDuration;
                    if (progress > 1) {
                        progress = 1;
                    }

                    // Interpolate the scale: grow when becoming alive, shrink when dying
                    let scale = isNowAlive ? progress : 1 - progress;
                    if (scale > 0) {
                        drawCube(x, y, z, viewMatrix, scale * baseScaleFactor);
                    }
                } else if (isNowAlive) {
                    // If no animation, draw normally (alive cells)
                    drawCube(x, y, z, viewMatrix, baseScaleFactor);
                }
            }
        }
    }

    // Request the next frame for animation
    window.requestAnimationFrame(render);
}

function drawCube(x, y, z, globalTransform, scaleFactor) {
    let modelMatrix = mat4();

    let spacing = 0.25; // Adjust spacing as needed
    let centerOffset = (gridSize - 1) / 2;

    // Translate each cube to its position in the grid
    modelMatrix = mult(modelMatrix, translate(
        (x - centerOffset) * spacing,
        (y - centerOffset) * spacing,
        (z - centerOffset) * spacing
    ));

    // Apply scaling
    let scale = scalem(scaleFactor, scaleFactor, scaleFactor);
    modelMatrix = mult(modelMatrix, scale);

    let mv = mult(globalTransform, modelMatrix);

    // Send the model-view matrix to the shaders
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv));

    // Compute and send the normal matrix for lighting
    normalMatrix = mat3(
        vec3(mv[0][0], mv[0][1], mv[0][2]),
        vec3(mv[1][0], mv[1][1], mv[1][2]),
        vec3(mv[2][0], mv[2][1], mv[2][2])
    );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    // Draw the cube
    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}
