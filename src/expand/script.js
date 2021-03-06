"use strict";

var CANVAS, CTX, HALF_WIDTH, HALF_HEIGHT;

var COLOR = "hsl(0, 0%, 35%)";
var PI_2 = Math.PI * 2;
var RADIUS = 7;
var N = 12;
var M = N - 1;
var SPREAD = 10;
var ANGLES = new Float32Array(N);
var XS = new Float32Array(N);
var YS = new Float32Array(N);
var XS_NEXT = new Float32Array(N);
var YS_NEXT = new Float32Array(N);
var NORMS = new Float32Array(N);
var RESET = 60 * 5;
var ELAPSED = RESET + 1;
var DRAG = 45;
var PROXIMITY = 100;
var MAGNITUDE = 1.25;
var CENTER = MAGNITUDE / 2;

function distance(i, j) {
    var x = XS[i] - XS[j];
    var y = YS[i] - YS[j];
    return Math.sqrt((x * x) + (y * y));
}

function loop() {
    if (RESET < ELAPSED) {
        for (var i = 0; i < N; ++i) {
            ANGLES[i] = Math.random() * PI_2;
        }
        ANGLES.sort();
        for (var i = 0; i < N; ++i) {
            XS[i] = (Math.cos(ANGLES[i]) * SPREAD) + HALF_WIDTH;
            YS[i] = (Math.sin(ANGLES[i]) * SPREAD) + HALF_HEIGHT;
            XS_NEXT[i] = 0;
            YS_NEXT[i] = 0;
            NORMS[i] = 0;
        }
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
    }
    for (var i = 0; i < N; ++i) {
        XS_NEXT[i] = 0;
        YS_NEXT[i] = 0;
        NORMS[i] = 0;
        for (var j = i + 1; j < N; ++j) {
            if (distance(i, j) < PROXIMITY) {
                XS_NEXT[i] += (XS[i] - XS[j]);
                YS_NEXT[i] += (YS[i] - YS[j]);
                XS_NEXT[j] -= (XS[i] - XS[j]);
                YS_NEXT[j] -= (YS[i] - YS[j]);
                NORMS[i] += 1;
            }
        }
    }
    for (var i = 0; i < N; ++i) {
        if (0 < NORMS[i]) {
            XS[i] += (XS_NEXT[i] / NORMS[i]) / DRAG;
            YS[i] += (YS_NEXT[i] / NORMS[i]) / DRAG;
        } else {
            XS[i] += (Math.random() * MAGNITUDE) - CENTER;
            YS[i] += (Math.random() * MAGNITUDE) - CENTER;
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        var j = i === 0 ? M : i - 1;
        CTX.moveTo(XS[j], YS[j]);
        CTX.lineTo(XS[i], YS[i]);
    }
    CTX.stroke();
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        var x = XS[i];
        var y = YS[i];
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
    CTX.lineWidth = 4;
    HALF_WIDTH = CANVAS.width / 2;
    HALF_HEIGHT = CANVAS.height / 2;
    loop();
};
