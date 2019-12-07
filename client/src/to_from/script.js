"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 0.65;

var PI_2 = Math.PI * 2;
var RADIUS = 5;
var LOWER = CANVAS.height / 10;
var DELTA = CANVAS.height - (LOWER * 2);

function randomBetween() {
    return LOWER + (Math.random() * DELTA);
}

var N = 50;
var XS = new Array(N);
var YS_TO = new Array(N);
var YS_FROM = new Array(N);
var DELTAS = new Array(N);

for (var i = 0; i < N; i++) {
    XS[i] = CANVAS.width * ((i + 0.5) / N);
    YS_TO[i] = randomBetween();
    YS_FROM[i] = randomBetween();
    DELTAS[i] = 0;
}

var DRAG = 50;
var THRESHOLD = 1;
var RESET;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    RESET = true;
    var i;
    for (i = 0; i < N; i++) {
        DELTAS[i] = (YS_TO[i] - YS_FROM[i]);
        if (RESET && (THRESHOLD < DELTAS[i])) {
            RESET = false;
        }
    }
    for (i = 0; i < N; i++) {
        if (RESET) {
            YS_TO[i] = randomBetween();
        }
        CTX.beginPath();
        CTX.arc(XS[i], YS_TO[i], RADIUS, 0, PI_2);
        CTX.stroke();
    }
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        YS_FROM[i] += DELTAS[i] / DRAG;
        CTX.moveTo(XS[i], YS_FROM[i]);
        CTX.arc(XS[i], YS_FROM[i], RADIUS, 0, PI_2);
    }
    CTX.fill();
    requestAnimationFrame(loop);
}

loop();
