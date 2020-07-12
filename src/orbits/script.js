"use strict";

var CANVAS, CTX;

var COLOR = "hsl(0, 0%, 90%)";
var N = 15;
var POINTS = {
    x: new Float32Array(N),
    y: new Float32Array(N),
    xSpeed: new Float32Array(N),
    ySpeed: new Float32Array(N),
};
var K = 0.025;
var L = 10;

function loop() {
    for (var i = 0; i < N; ++i) {
        for (var j = i + 1; j < N; ++j) {
            if (POINTS.x[i] < POINTS.x[j]) {
                POINTS.xSpeed[i] += K;
                POINTS.xSpeed[j] -= K;
            } else if (POINTS.x[j] < POINTS.x[i]) {
                POINTS.xSpeed[i] -= K;
                POINTS.xSpeed[j] += K;
            }
            if (POINTS.y[i] < POINTS.y[j]) {
                POINTS.ySpeed[i] += K;
                POINTS.ySpeed[j] -= K;
            } else if (POINTS.y[j] < POINTS.y[i]) {
                POINTS.ySpeed[i] -= K;
                POINTS.ySpeed[j] += K;
            }
        }
    }
    for (var i = 0; i < N; ++i) {
        POINTS.x[i] += POINTS.xSpeed[i];
        POINTS.y[i] += POINTS.ySpeed[i];
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        var x = POINTS.x[i];
        var y = POINTS.y[i];
        CTX.moveTo(x, y);
        CTX.lineTo(x - (POINTS.xSpeed[i] * L), y - (POINTS.ySpeed[i] * L));
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = COLOR;
    for (var i = 0; i < N; ++i) {
        POINTS.x[i] = Math.random() * CANVAS.width;
        POINTS.y[i] = Math.random() * CANVAS.height;
        POINTS.xSpeed[i] = 0;
        POINTS.ySpeed[i] = 0;
    }
    CTX.lineWidth = 4;
    loop();
};
