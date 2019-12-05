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
var CIRCLES = new Array(N);

for (var i = 0; i < N; i++) {
    CIRCLES[i] = {
        x: CANVAS.width * ((i + 0.5) / N),
        yTo: randomBetween(),
        yFrom: randomBetween(),
        delta: 0,
    };
}

var DRAG = 50;
var THRESHOLD = 1;
var RESET;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    RESET = true;
    for (var i = 0; i < N; i++) {
        CIRCLES[i].delta = (CIRCLES[i].yTo - CIRCLES[i].yFrom);
        if (RESET && (THRESHOLD < CIRCLES[i].delta)) {
            RESET = false;
        }
    }
    for (var j = 0; j < N; j++) {
        CIRCLES[j].yFrom += CIRCLES[j].delta / DRAG;
        if (RESET) {
            CIRCLES[j].yTo = randomBetween();
        }
        CTX.beginPath();
        CTX.arc(CIRCLES[j].x, CIRCLES[j].yTo, RADIUS, 0, PI_2);
        CTX.stroke();
        CTX.beginPath();
        CTX.arc(CIRCLES[j].x, CIRCLES[j].yFrom, RADIUS, 0, PI_2);
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
