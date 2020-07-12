"use strict";

var CANVAS, CTX, LOWER, DELTA, RESET;

var COLOR = "hsl(0, 0%, 90%)";
var PI_2 = Math.PI * 2;
var RADIUS = 6;
var N = 50;
var XS = new Float32Array(N);
var YS_TO = new Float32Array(N);
var YS_FROM = new Float32Array(N);
var DELTAS = new Float32Array(N);
var DRAG = 50;
var THRESHOLD = 1;

function loop() {
    RESET = true;
    for (var i = 0; i < N; ++i) {
        DELTAS[i] = (YS_TO[i] - YS_FROM[i]);
        if (RESET && (THRESHOLD < DELTAS[i])) {
            RESET = false;
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        if (RESET) {
            YS_TO[i] = LOWER + (Math.random() * DELTA);
        }
        var x = XS[i];
        var y = YS_TO[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.stroke();
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        YS_FROM[i] += DELTAS[i] / DRAG;
        var x = XS[i];
        var y = YS_FROM[i];
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
        XS[i] = CANVAS.width * ((i + 0.5) / N);
        YS_TO[i] = LOWER + (Math.random() * DELTA);
        YS_FROM[i] = LOWER + (Math.random() * DELTA);
        DELTAS[i] = 0;
    }
    loop();
};
