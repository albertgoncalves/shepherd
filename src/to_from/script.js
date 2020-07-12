"use strict";

var CANVAS, CTX, LOWER, DELTA;

var COLOR = "hsl(0, 0%, 90%)";
var PI_2 = Math.PI * 2;
var RADIUS = 6;
var N = 50;
var POINTS = {
    x: new Float32Array(N),
    yTo: new Float32Array(N),
    yFrom: new Float32Array(N),
};
var SPEED = 0.0175;
var THRESHOLD = 1;

function lerp(a, b, t) {
    return a + (t * (b - a));
}

function loop() {
    var reset = true;
    for (var i = 0; i < N; ++i) {
        if (THRESHOLD < (POINTS.yTo[i] - POINTS.yFrom[i])) {
            reset = false;
            break;
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        if (reset) {
            POINTS.yTo[i] = LOWER + (Math.random() * DELTA);
        }
        var x = POINTS.x[i];
        var y = POINTS.yTo[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.stroke();
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        POINTS.yFrom[i] = lerp(POINTS.yFrom[i], POINTS.yTo[i], SPEED);
        var x = POINTS.x[i];
        var y = POINTS.yFrom[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = COLOR;
    CTX.fillStyle = COLOR;
    CTX.lineWidth = 0.65;
    LOWER = CANVAS.height / 10;
    DELTA = CANVAS.height - (LOWER * 2);
    for (var i = 0; i < N; ++i) {
        POINTS.x[i] = CANVAS.width * ((i + 0.5) / N);
        POINTS.yTo[i] = LOWER + (Math.random() * DELTA);
        POINTS.yFrom[i] = LOWER + (Math.random() * DELTA);
    }
    loop();
};
