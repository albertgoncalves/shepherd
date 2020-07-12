"use strict";

var CANVAS, CTX, LOWER, UPPER;

var COLOR = "hsl(0, 0%, 90%)";
var PI_2 = Math.PI * 2;
var RADIUS = 3;
var N = 300;
var M = N - 1;
var POINTS = {
    x: new Float32Array(N),
    y: new Float32Array(N),
    speed: new Float32Array(N),
    neighborSpeed: new Float32Array(N),
};
var L = 15.0;
var SCALE = 1.1;
var HALF_SCALE = SCALE / 2;
var OFFSET = 0.3;
var OFFSET_LOWER = HALF_SCALE * (1.0 - OFFSET);
var OFFSET_UPPER = HALF_SCALE * (1.0 + OFFSET);

function loop() {
    for (var i = 0; i < N; ++i) {
        POINTS.speed[i] += (Math.random() * SCALE) - HALF_SCALE;
        var norm = 0.0;
        if (POINTS.neighborSpeed[i] < 0.0) {
            for (var j = 0; j < i; ++j) {
                POINTS.neighborSpeed[i] += POINTS.speed[j];
                norm += 1.0;
            }
        } else {
            for (var j = i + 1; j < N; ++j) {
                POINTS.neighborSpeed[i] += POINTS.speed[j];
                norm += 1.0;
            }
        }
        POINTS.y[i] += POINTS.neighborSpeed[i] / norm;
        if (POINTS.y[i] < LOWER) {
            POINTS.y[i] = LOWER;
            POINTS.speed[i] = (Math.random() * SCALE) - OFFSET_LOWER;
            POINTS.neighborSpeed[i] = 0.0;
        } else if (UPPER < POINTS.y[i]) {
            POINTS.y[i] = UPPER;
            POINTS.speed[i] = (Math.random() * SCALE) - OFFSET_UPPER;
            POINTS.neighborSpeed[i] = 0.0;
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (var i = 1; i < M; ++i) {
        var x = POINTS.x[i];
        var y = POINTS.y[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    CTX.beginPath();
    for (var i = 1; i < M; ++i) {
        var x = POINTS.x[i];
        var y = POINTS.y[i];
        CTX.moveTo(x, y);
        CTX.lineTo(x, y + (POINTS.speed[i] * L));
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = COLOR;
    CTX.fillStyle = COLOR;
    CTX.lineWidth = 1;
    LOWER = CANVAS.height / 10.0;
    UPPER = CANVAS.height - LOWER;
    var halfHeight = CANVAS.height / 2.0;
    for (var i = 0; i < N; ++i) {
        POINTS.x[i] = CANVAS.width * ((i + 0.5) / N);
        POINTS.y[i] = halfHeight;
        POINTS.speed[i] = 0.0;
        POINTS.neighborSpeed[i] = 0.0;
    }
    loop();
};
