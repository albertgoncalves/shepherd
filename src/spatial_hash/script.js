"use strict";

var CANVAS;
var CTX;
var SIZE;
var J;
var I;
var N;
var GRID;
var TABLE;

var T = 0;
var RESET_MS = 5000;
var M = 16;
var CIRCLES = new Array(M);
var INDICES = new Array(M);
/* NOTE: Because the grid will capture `CIRCLES` indices in ascending order, we
 * can count on collision detection to occur only between ascending pairs of
 * indices. If the final object in `CIRCLES` collides with another other
 * object, that collision should have been captured when we iterated the other
 * object. For the following arrays, we don't need to reserve a position for
 * that last object; unless there is a bug, that position *should* always be
 * empty.
 */
var O = M - 1;
var TESTED = new Array(O);
var COLLISIONS = new Array(O);
var PI_2 = Math.PI * 2.0;
var SCALE = 2.0;
var HALF_SCALE = SCALE / 2.0;
var RADIUS = 64.0;
var DIAMETER = RADIUS * 2.0;
var DIAMETER_SQUARED = DIAMETER * DIAMETER;

function numberToHex(x) {
    return x.toString(16).padStart(2, "0");
}

function colorToHex(color) {
    return "#" + numberToHex(color.red) + numberToHex(color.green) +
        numberToHex(color.blue) + numberToHex(color.alpha);
}

function init() {
    SIZE = Math.floor((Math.random() * 50.0) + 50.0);
    J = Math.ceil(CANVAS.width / SIZE);
    I = Math.ceil(CANVAS.height / SIZE);
    N = J * I;
    GRID = {
        x: new Float32Array(N),
        y: new Float32Array(N),
    };
    TABLE = new Array(N);
    for (var i = 0; i < N; ++i) {
        TABLE[i] = [];
    }
    var index = 0;
    for (var y = 0; y < I; ++y) {
        for (var x = 0; x < J; ++x) {
            GRID.x[index] = x * SIZE;
            GRID.y[index++] = y * SIZE;
        }
    }
    for (var i = 0; i < M; ++i) {
        CIRCLES[i] = {
            x: Math.random() * CANVAS.width,
            y: Math.random() * CANVAS.height,
            color: colorToHex({
                red: Math.floor(Math.random() * 256.0),
                green: Math.floor(Math.random() * 256.0),
                blue: Math.floor(Math.random() * 256.0),
                alpha: 64,
            }),
            collided: false,
        };
        COLLISIONS[i] = [];
    }
}

function getGridIndex(x, y) {
    return Math.floor(x / SIZE) + (Math.floor(y / SIZE) * J);
}

function circleToGridIndices(circle) {
    var indices = [];
    var xMin = Math.max(0.0, circle.x - RADIUS);
    var xMax = Math.min(CANVAS.width - 1, circle.x + RADIUS);
    var yMin = Math.max(0.0, circle.y - RADIUS);
    var yMax = Math.min(CANVAS.height - 1, circle.y + RADIUS);
    var topLeft = getGridIndex(xMin, yMin);
    var topRight = getGridIndex(xMax, yMin);
    var bottomLeft = getGridIndex(xMin, yMax);
    var jDelta = topRight - topLeft;
    var iDelta = bottomLeft - topLeft;
    var jLimit = Math.floor(xMin / SIZE);
    for (var i = 0; i <= iDelta; i += J) {
        for (var j = 0; (j <= jDelta) && ((jLimit + j) < J); ++j) {
            indices.push(topLeft + j + i);
        }
    }
    return indices;
}

function getDistanceSquared(a, b) {
    var x = a.x - b.x;
    var y = a.y - b.y;
    return (x * x) + (y * y);
}

function testIndices(i, j) {
    var tested = TESTED[i];
    for (var k = tested.length - 1; 0 <= k; --k) {
        if (j === tested[k]) {
            return;
        }
    }
    var a = CIRCLES[i];
    var b = CIRCLES[j];
    if (getDistanceSquared(a, b) < DIAMETER_SQUARED) {
        COLLISIONS[i].push(j);
        a.collided = true;
        b.collided = true;
    }
    tested.push(j);
}

function update() {
    for (var i = 0; i < N; ++i) {
        TABLE[i] = [];
        if (i < O) {
            TESTED[i] = [];
            COLLISIONS[i] = [];
        }
    }
    for (var i = 0; i < M; ++i) {
        var circle = CIRCLES[i];
        circle.x += (Math.random() * SCALE) - HALF_SCALE;
        circle.y += (Math.random() * SCALE) - HALF_SCALE;
        circle.collided = false;
        var indices = circleToGridIndices(circle);
        for (var j = indices.length - 1; 0 <= j; --j) {
            TABLE[indices[j]].push(i);
        }
        INDICES[i] = indices;
    }
    for (var i = 0; i < N; ++i) {
        var n = TABLE[i].length;
        if (1 < n) {
            for (var j = 0; j < n; ++j) {
                for (var k = j + 1; k < n; ++k) {
                    testIndices(TABLE[i][j], TABLE[i][k]);
                }
            }
        }
    }
}

function draw() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    /* NOTE: Grid cell colors via intersecting circles. */
    for (var i = 0; i < M; ++i) {
        var indices = INDICES[i];
        for (var j = indices.length - 1; 0 <= j; --j) {
            var index = indices[j];
            CTX.fillStyle = CIRCLES[i].color;
            CTX.fillRect(GRID.x[index], GRID.y[index], SIZE, SIZE);
        }
    }
    /* NOTE: Grid lines. */
    CTX.lineWidth = 1;
    CTX.setLineDash([2, 8]);
    CTX.beginPath();
    for (var x = SIZE; x < CANVAS.width; x += SIZE) {
        CTX.moveTo(x, 0);
        CTX.lineTo(x, CANVAS.height);
    }
    for (var y = SIZE; y < CANVAS.height; y += SIZE) {
        CTX.moveTo(0, y);
        CTX.lineTo(CANVAS.width, y);
    }
    CTX.stroke();
    /* NOTE: Collided circles with dashed perimeter. */
    CTX.lineWidth = 2;
    CTX.setLineDash([2, 4]);
    CTX.beginPath();
    for (var i = 0; i < M; ++i) {
        if (CIRCLES[i].collided) {
            CTX.moveTo(CIRCLES[i].x + RADIUS, CIRCLES[i].y);
            CTX.arc(CIRCLES[i].x, CIRCLES[i].y, RADIUS, 0.0, PI_2);
        }
    }
    CTX.stroke();
    /* NOTE: Un-collided circles with solid perimeter. */
    CTX.setLineDash([]);
    CTX.beginPath();
    for (var i = 0; i < M; ++i) {
        if (!CIRCLES[i].collided) {
            CTX.moveTo(CIRCLES[i].x + RADIUS, CIRCLES[i].y);
            CTX.arc(CIRCLES[i].x, CIRCLES[i].y, RADIUS, 0.0, PI_2);
        }
    }
    /* NOTE: Center-to-center lines for colliding circles. */
    for (var i = 0; i < M; ++i) {
        var collision = COLLISIONS[i];
        for (var j = collision.length - 1; 0 <= j; --j) {
            var a = CIRCLES[i];
            var b = CIRCLES[collision[j]];
            CTX.moveTo(a.x, a.y);
            CTX.lineTo(b.x, b.y);
        }
    }
    CTX.stroke();
}

function loop(t) {
    if (RESET_MS < (t - T)) {
        init();
        T = t;
    }
    update();
    draw();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = "hsl(0, 0%, 20%)";
    init();
    loop(0);
};
