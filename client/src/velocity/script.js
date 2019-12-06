"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.fillStyle = COLOR;
CTX.strokeStyle = COLOR;

var PI_2 = Math.PI * 2;
var RADIUS = 3;
var HALF_HEIGHT = CANVAS.height / 2;
var N = 300;
var M = N - 1;
var XS = new Array(N);
var YS = new Array(N);
var SPEEDS_IND = new Array(N);
var SPEEDS_AGG = new Array(N);

for (var i = 0; i < N; i++) {
    XS[i] = CANVAS.width * ((i + 0.5) / N);
    YS[i] = HALF_HEIGHT;
    SPEEDS_IND[i] = 0;
    SPEEDS_AGG[i] = 0;
}

var LOWER = CANVAS.height / 10;
var UPPER = CANVAS.height - LOWER;
var SCALE = 15;
var MAGNITUDE = 1.1;
var CENTER = MAGNITUDE / 2;
var OFFSET = 0.3;
var OFFSET_LOWER = CENTER * (1 - OFFSET);
var OFFSET_UPPER = CENTER * (1 + OFFSET);
var K;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < N; i++) {
        SPEEDS_IND[i] += (Math.random() * MAGNITUDE) - CENTER;
        K = 0;
        if (SPEEDS_AGG[i] < 0) {
            for (var j = 0; j < i; j++) {
                SPEEDS_AGG[i] += SPEEDS_IND[j];
                K += 1;
            }
        } else {
            for (var k = i + 1; k < N; k++) {
                SPEEDS_AGG[i] += SPEEDS_IND[k];
                K += 1;
            }
        }
        YS[i] += SPEEDS_AGG[i] / K;
        if (YS[i] < LOWER) {
            YS[i] = LOWER;
            SPEEDS_IND[i] = (Math.random() * MAGNITUDE) - OFFSET_LOWER;
            SPEEDS_AGG[i] = 0;
        } else if (UPPER < YS[i]) {
            YS[i] = UPPER;
            SPEEDS_IND[i] = (Math.random() * MAGNITUDE) - OFFSET_UPPER;
            SPEEDS_AGG[i] = 0;
        }
    }
    for (var l = 1; l < M; l++) {
        CTX.beginPath();
        CTX.arc(XS[l], YS[l], RADIUS, 0, PI_2);
        CTX.fill();
        CTX.beginPath();
        CTX.moveTo(XS[l], YS[l]);
        CTX.lineTo(XS[l], YS[l] + (SPEEDS_IND[l] * SCALE));
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

loop();
