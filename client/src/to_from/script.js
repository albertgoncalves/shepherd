"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 0.65;

var PI_2 = Math.PI * 2;
var RADIUS = 6;
var LOWER = CANVAS.height / 10;
var DELTA = CANVAS.height - (LOWER * 2);

function randomPosition() {
    return LOWER + (Math.random() * DELTA);
}

var N = 50;
var XS = new Array(N);
var YS_TO = new Array(N);
var YS_FROM = new Array(N);
var DELTAS = new Array(N);

for (var i = 0; i < N; i++) {
    XS[i] = CANVAS.width * ((i + 0.5) / N);
    YS_TO[i] = randomPosition();
    YS_FROM[i] = randomPosition();
    DELTAS[i] = 0;
}

var DRAG = 50;
var THRESHOLD = 1;
var RESET;

function loop() {
    var i, x, y;
    RESET = true;
    for (i = 0; i < N; i++) {
        DELTAS[i] = (YS_TO[i] - YS_FROM[i]);
        if (RESET && (THRESHOLD < DELTAS[i])) {
            RESET = false;
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        if (RESET) {
            YS_TO[i] = randomPosition();
        }
        x = XS[i];
        y = YS_TO[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.stroke();
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        YS_FROM[i] += DELTAS[i] / DRAG;
        x = XS[i];
        y = YS_FROM[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    requestAnimationFrame(loop);
}

loop();
