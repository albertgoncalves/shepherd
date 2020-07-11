"use strict";

var CANVAS, CTX, HALF_HEIGHT, N, LOWER, UPPER, XS, YS, SPEEDS_IND, SPEEDS_AGG;

var MAGNITUDE = 0.1;
var CENTER = MAGNITUDE / 2;
var RESET = 60 * 12;
var ELAPSED = RESET + 1;

function loop() {
    if (RESET < ELAPSED) {
        for (var i = 0; i < N; i++) {
            XS[i] = CANVAS.width * ((i + 0.5) / N);
            YS[i] = HALF_HEIGHT;
            SPEEDS_IND[i] = 0;
            SPEEDS_AGG[i] = 0;
        }
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
    }
    for (var i = 0; i < N; i++) {
        SPEEDS_IND[i] += (Math.random() * MAGNITUDE) - CENTER;
        var norm = 0;
        for (var j = 0; j <= i; j++) {
            SPEEDS_AGG[i] += SPEEDS_IND[j];
            norm += 1;
        }
        YS[i] += SPEEDS_AGG[i] / norm;
        if (YS[i] < LOWER) {
            YS[i] = LOWER;
            SPEEDS_AGG[i] = 0;
        } else if (UPPER < YS[i]) {
            YS[i] = UPPER;
            SPEEDS_AGG[i] = 0;
        }
    }
    for (var i = 0; i < N; i++) {
        CTX.fillRect(XS[i], YS[i], 1, 1);
    }
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.fillStyle = "hsla(0, 0%, 85%, 0.35)";
    HALF_HEIGHT = CANVAS.height / 2;
    N = CANVAS.width;
    LOWER = CANVAS.height / 10;
    UPPER = CANVAS.height - LOWER;
    XS = new Float32Array(N);
    YS = new Float32Array(N);
    SPEEDS_IND = new Float32Array(N);
    SPEEDS_AGG = new Float32Array(N);
    loop();
};
