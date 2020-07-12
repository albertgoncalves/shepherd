"use strict";

var CANVAS, CTX, N, GRID, TABLE;

var J = 0;
var I = 0;
var M = 16;
var T = 0;
var RESET_MS = 5000;
var CIRCLES = new Array(M);
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
var SIZE = Math.floor((Math.random() * 50.0) + 50.0);
var SCALE = 2.0;
var HALF_SCALE = SCALE / 2.0;
var RADIUS = 64.0;
var RADIUS_2 = RADIUS * 2.0;
var RADIUS_2_SQUARED = RADIUS_2 * RADIUS_2;

function numberToHex(x) {
    return x.toString(16).padStart(2, "0");
}

function colorToHex(color) {
    return "#" + numberToHex(color.red) + numberToHex(color.green) +
        numberToHex(color.blue) + numberToHex(color.alpha);
}

function getGridIndex(x, y) {
    var j = Math.floor(x / SIZE);
    var i = Math.floor(y / SIZE);
    return j + (i * J);
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

function init() {
    GRID = {
        x: new Float32Array(N),
        y: new Float32Array(N),
        color: new Array(N),
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

function loop(t) {
    if (RESET_MS < (t - T)) {
        init();
        T = t;
    }
    for (var i = 0; i < N; ++i) {
        TABLE[i] = [];
    }
    for (var i = 0; i < M; ++i) {
        var circle = CIRCLES[i];
        circle.x += (Math.random() * SCALE) - HALF_SCALE;
        circle.y += (Math.random() * SCALE) - HALF_SCALE;
        circle.collided = false;
    }
    for (var i = 0; i < O; ++i) {
        TESTED[i] = [];
        COLLISIONS[i] = [];
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < M; ++i) {
        var circle = CIRCLES[i];
        var indices = circleToGridIndices(circle);
        for (var j = indices.length - 1; 0 <= j; --j) {
            var index = indices[j];
            TABLE[index].push(i);
            CTX.fillStyle = circle.color;
            CTX.fillRect(GRID.x[index], GRID.y[index], SIZE, SIZE);
        }
    }
    for (var i = 0; i < N; ++i) {
        var indices = TABLE[i];
        var n = indices.length;
        if (1 < n) {
            for (var j = 0; j < n; ++j) {
                for (var k = j + 1; k < n; ++k) {
                    var a = indices[j];
                    var b = indices[k];
                    var tested = TESTED[a];
                    for (var l = tested.length - 1; 0 <= l; --l) {
                        if (b === tested[l]) {
                            continue;
                        }
                    }
                    var distanceSquared =
                        getDistanceSquared(CIRCLES[a], CIRCLES[b]);
                    if (distanceSquared < RADIUS_2_SQUARED) {
                        COLLISIONS[a].push(b);
                    }
                    tested.push(b);
                }
            }
        }
    }
    {
        CTX.lineWidth = 2;
        CTX.setLineDash([]);
        CTX.beginPath();
        for (var i = 0; i < M; ++i) {
            var circle = CIRCLES[i];
            var collision = COLLISIONS[i];
            for (var j = collision.length - 1; 0 <= j; --j) {
                var a = CIRCLES[i];
                var b = CIRCLES[collision[j]];
                a.collided = true;
                b.collided = true;
                CTX.moveTo(a.x, a.y);
                CTX.lineTo(b.x, b.y);
            }
        }
        CTX.stroke();
    }
    {
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
    }
    {
        CTX.lineWidth = 2;
        CTX.setLineDash([]);
        CTX.beginPath();
        for (var i = 0; i < M; ++i) {
            var circle = CIRCLES[i];
            if (!circle.collided) {
                CTX.moveTo(circle.x + RADIUS, circle.y);
                CTX.arc(circle.x, circle.y, RADIUS, 0.0, PI_2);
            }
        }
        CTX.stroke();
    }
    {
        CTX.setLineDash([2, 4]);
        CTX.beginPath();
        for (var i = 0; i < M; ++i) {
            var circle = CIRCLES[i];
            if (circle.collided) {
                CTX.moveTo(circle.x + RADIUS, circle.y);
                CTX.arc(circle.x, circle.y, RADIUS, 0.0, PI_2);
            }
        }
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = "hsl(0, 0%, 20%)";
    {
        for (var x = 0; x < CANVAS.width; x += SIZE) {
            ++J;
        }
        for (var y = 0; y < CANVAS.height; y += SIZE) {
            ++I;
        }
        N = J * I;
    }
    init();
    loop(0);
};
