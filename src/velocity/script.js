"use strict";

var CANVAS, CTX, HALF_HEIGHT, LOWER, UPPER;

var COLOR = "hsl(0, 0%, 90%)";
var PI_2 = Math.PI * 2;
var RADIUS = 3;
var N = 300;
var M = N - 1;
var XS = new Float32Array(N);
var YS = new Float32Array(N);
var POINT_SPEED = new Float32Array(N);
var AGGREGATE_SPEED = new Float32Array(N);
var SCALE = 15;
var MAGNITUDE = 1.1;
var CENTER = MAGNITUDE / 2;
var OFFSET = 0.3;
var OFFSET_LOWER = CENTER * (1 - OFFSET);
var OFFSET_UPPER = CENTER * (1 + OFFSET);

function loop() {
    for (var i = 0; i < N; i++) {
        POINT_SPEED[i] += (Math.random() * MAGNITUDE) - CENTER;
        var norm = 0;
        if (AGGREGATE_SPEED[i] < 0) {
            for (var j = 0; j < i; j++) {
                AGGREGATE_SPEED[i] += POINT_SPEED[j];
                norm += 1;
            }
        } else {
            for (var j = i + 1; j < N; j++) {
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
    for (var i = 1; i < M; i++) {
        var x = XS[i];
        var y = YS[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    CTX.beginPath();
    for (var i = 1; i < M; i++) {
        var x = XS[i];
        var y = YS[i];
        CTX.moveTo(x, y);
        CTX.lineTo(x, y + (POINT_SPEED[i] * SCALE));
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
    HALF_HEIGHT = CANVAS.height / 2;
    LOWER = CANVAS.height / 10;
    UPPER = CANVAS.height - LOWER;
    for (var i = 0; i < N; i++) {
        XS[i] = CANVAS.width * ((i + 0.5) / N);
        YS[i] = HALF_HEIGHT;
        POINT_SPEED[i] = 0;
        AGGREGATE_SPEED[i] = 0;
    }
    loop();
};
