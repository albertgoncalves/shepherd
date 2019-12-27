"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
CTX.imageSmoothingEnabled = false;
CTX.fillStyle = "hsla(0, 0%, 85%, 0.35)";

var HALF_HEIGHT = CANVAS.height / 2;
var N = CANVAS.width;
var FLOAT32_BYTES = N * 4;
var XS_BUFFER = new ArrayBuffer(FLOAT32_BYTES);
var YS_BUFFER = new ArrayBuffer(FLOAT32_BYTES);
var SPEEDS_IND_BUFFER = new ArrayBuffer(FLOAT32_BYTES);
var SPEEDS_AGG_BUFFER = new ArrayBuffer(FLOAT32_BYTES);
var XS = new Float32Array(XS_BUFFER);
var YS = new Float32Array(YS_BUFFER);
var SPEEDS_IND = new Float32Array(SPEEDS_IND_BUFFER);
var SPEEDS_AGG = new Float32Array(SPEEDS_AGG_BUFFER);
var LOWER = CANVAS.height / 10;
var UPPER = CANVAS.height - LOWER;
var MAGNITUDE = 0.1;
var CENTER = MAGNITUDE / 2;
var RELOAD = 60 * 12;
var ELAPSED = RELOAD + 1;

function loop() {
    var i, j, norm;
    if (RELOAD < ELAPSED) {
        for (i = 0; i < N; i++) {
            XS[i] = CANVAS.width * ((i + 0.5) / N);
            YS[i] = HALF_HEIGHT;
            SPEEDS_IND[i] = 0;
            SPEEDS_AGG[i] = 0;
        }
        ELAPSED = 0;
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    } else {
        ELAPSED += 1;
    }
    for (i = 0; i < N; i++) {
        SPEEDS_IND[i] += (Math.random() * MAGNITUDE) - CENTER;
        norm = 0;
        for (j = 0; j <= i; j++) {
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
    for (i = 0; i < N; i++) {
        CTX.fillRect(XS[i], YS[i], 1, 1);
    }
    requestAnimationFrame(loop);
}

loop();
