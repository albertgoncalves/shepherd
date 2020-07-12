"use strict";

var CANVAS, CTX, N, GRID;

var J = 0;
var I = 0;
var M = 4;
var CIRCLES = new Array(M);
var PI_2 = Math.PI * 2.0;
var SIZE = Math.floor((Math.random() * 25.0) + 75.0);
var SCALE = 4.0;
var HALF_SCALE = SCALE / 2.0;

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
    var xMin = Math.max(0.0, circle.x - circle.radiusOuter);
    var xMax = Math.min(CANVAS.width, circle.x + circle.radiusOuter);
    var yMin = Math.max(0.0, circle.y - circle.radiusOuter);
    var yMax = Math.min(CANVAS.height, circle.y + circle.radiusOuter);
    var topLeft = getGridIndex(xMin, yMin);
    var topRight = getGridIndex(xMax, yMin);
    var bottomLeft = getGridIndex(xMin, yMax);
    var jDelta = topRight - topLeft;
    var iDelta = bottomLeft - topLeft;
    var jLimit = xMin / SIZE;
    for (var i = 0; i <= iDelta; i += J) {
        for (var j = 0; (j <= jDelta) && ((jLimit + j) < J); ++j) {
            indices.push(topLeft + j + i);
        }
    }
    return indices;
}

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < M; ++i) {
        var circle = CIRCLES[i];
        circle.x += (Math.random() * SCALE) - HALF_SCALE;
        circle.y += (Math.random() * SCALE) - HALF_SCALE;
        CTX.beginPath();
        CTX.moveTo(circle.x + circle.radiusInner, circle.y);
        CTX.arc(circle.x, circle.y, circle.radiusInner, 0, PI_2);
        CTX.moveTo(circle.x + circle.radiusOuter, circle.y);
        CTX.arc(circle.x, circle.y, circle.radiusOuter, 0, PI_2);
        CTX.stroke();
        var indices = circleToGridIndices(circle);
        for (var j = indices.length - 1; 0 <= j; --j) {
            var index = indices[j];
            if (index < 0) {
                console.log("index < 0");
                continue;
            }
            if (N <= index) {
                console.log("N <= index");
                continue;
            }
            CTX.fillStyle = circle.color;
            CTX.fillRect(GRID.x[index], GRID.y[index], SIZE, SIZE);
        }
    }
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
    requestAnimationFrame(loop);
}

function init() {
    for (var x = 0; x < CANVAS.width; x += SIZE) {
        ++J;
    }
    for (var y = 0; y < CANVAS.height; y += SIZE) {
        ++I;
    }
    N = J * I;
    GRID = {
        x: new Float32Array(N),
        y: new Float32Array(N),
        color: new Array(N),
    };
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
            radiusInner: 1.0,
            radiusOuter: 100.0,
            color: colorToHex({
                red: Math.floor(Math.random() * 256),
                green: Math.floor(Math.random() * 256),
                blue: Math.floor(Math.random() * 256),
                alpha: 64,
            }),
        };
    }
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = "hsl(0, 0%, 20%)";
    CTX.lineWidth = 2;
    init();
    loop();
};
