"use strict";

function randomBetween(a, b) {
    return a + (Math.random() * (b - a));
}

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");

var PI_2 = Math.PI * 2;
var RADIUS = 6;
var LOWER = CANVAS.height / 5;
var UPPER = CANVAS.height - LOWER;
var DISTANCE = UPPER - LOWER;

function createCircle(x) {
    return {
        x: x,
        yTo: randomBetween(LOWER, UPPER),
        yFrom: randomBetween(LOWER, UPPER),
        radius: RADIUS,
        lineWidth: 0.85,
        color: "hsla(0, 0%, 25%, 0.45)",
        clock: 0,
        delta: 0,
    };
}

var N = 35;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = createCircle(CANVAS.width * ((i + 0.5) / N));
}

var DRAG = 40;
var THRESHOLD = 3;
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
        CIRCLES[j].clock += 1;
        if (RESET) {
            CIRCLES[j].yTo = randomBetween(LOWER, UPPER);
            CIRCLES[j].clock = 0;
        }
        CTX.beginPath();
        CTX.arc(CIRCLES[j].x, CIRCLES[j].yTo, CIRCLES[j].radius, 0, PI_2);
        CTX.strokeStyle = CIRCLES[j].color;
        CTX.lineWidth = CIRCLES[j].lineWidth;
        CTX.stroke();
        CTX.beginPath();
        CTX.arc(CIRCLES[j].x, CIRCLES[j].yFrom, CIRCLES[j].radius, 0, PI_2);
        CTX.fillStyle = CIRCLES[j].color;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
