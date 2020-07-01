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
var FLOAT32_BYTES = N * 4;
var XS = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var YS = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var POINT_SPEED = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var AGGREGATE_SPEED = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var SCALE = 15;
var LOWER = CANVAS.height / 10;
var UPPER = CANVAS.height - LOWER;
var MAGNITUDE = 1.1;
var CENTER = MAGNITUDE / 2;
var OFFSET = 0.3;
var OFFSET_LOWER = CENTER * (1 - OFFSET);
var OFFSET_UPPER = CENTER * (1 + OFFSET);

for (var i = 0; i < N; i++) {
    XS[i] = CANVAS.width * ((i + 0.5) / N);
    YS[i] = HALF_HEIGHT;
    POINT_SPEED[i] = 0;
    AGGREGATE_SPEED[i] = 0;
}

function loop() {
    var i, j, x, y, norm;
    for (i = 0; i < N; i++) {
        POINT_SPEED[i] += (Math.random() * MAGNITUDE) - CENTER;
        norm = 0;
        if (AGGREGATE_SPEED[i] < 0) {
            for (j = 0; j < i; j++) {
                AGGREGATE_SPEED[i] += POINT_SPEED[j];
                norm += 1;
            }
        } else {
            for (j = i + 1; j < N; j++) {
                AGGREGATE_SPEED[i] += POINT_SPEED[j];
                norm += 1;
            }
        }
        YS[i] += AGGREGATE_SPEED[i] / norm;
        if (YS[i] < LOWER) {
            YS[i] = LOWER;
            POINT_SPEED[i] = (Math.random() * MAGNITUDE) - OFFSET_LOWER;
            AGGREGATE_SPEED[i] = 0;
        } else if (UPPER < YS[i]) {
            YS[i] = UPPER;
            POINT_SPEED[i] = (Math.random() * MAGNITUDE) - OFFSET_UPPER;
            AGGREGATE_SPEED[i] = 0;
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
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
        CTX.lineTo(x, y + (POINT_SPEED[i] * SCALE));
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

window.onload = loop;
