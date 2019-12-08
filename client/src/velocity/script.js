"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 1;

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

function loop() {
    var i, j, x, y, norm;
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (i = 0; i < N; i++) {
        SPEEDS_IND[i] += (Math.random() * MAGNITUDE) - CENTER;
        norm = 0;
        if (SPEEDS_AGG[i] < 0) {
            for (j = 0; j < i; j++) {
                SPEEDS_AGG[i] += SPEEDS_IND[j];
                norm += 1;
            }
        } else {
            for (j = i + 1; j < N; j++) {
                SPEEDS_AGG[i] += SPEEDS_IND[j];
                norm += 1;
            }
        }
        YS[i] += SPEEDS_AGG[i] / norm;
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
    CTX.beginPath();
    for (i = 1; i < M; i++) {
        x = XS[i];
        y = YS[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    CTX.beginPath();
    for (i = 1; i < M; i++) {
        x = XS[i];
        y = YS[i];
        CTX.moveTo(x, y);
        CTX.lineTo(x, y + (SPEEDS_IND[i] * SCALE));
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

loop();
