"use strict";

function randomBetween(a, b) {
    return a + (Math.random() * (b - a));
}

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");

var PI_2 = Math.PI * 2;
var RADIUS = 8;
var LOWER = CANVAS.height / 8;
var UPPER = CANVAS.height - LOWER;
var DISTANCE = UPPER - LOWER;

function createCircle(x) {
    return {
        x: x,
        yTo: randomBetween(LOWER, UPPER),
        yFrom: randomBetween(LOWER, UPPER),
        radius: RADIUS,
        lineWidth: 0.5,
        strokeStyle: "hsla(0, 0%, 25%, 0.75)",
        clock: 0,
        delta: 0,
    };
}

var N = 25;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = createCircle(CANVAS.width * ((i + 0.5) / N));
}

var DRAG = 40;     /* higher is slower */
var THRESHOLD = 3; /* threshold to reset positions */
var RESET;

function hueToGray(x, y, yMin, yMax) {
    var xNorm = Math.floor((x / CANVAS.width) * 356);
    var yNorm = Math.floor(((y - yMin) / (yMax - yMin)) * 100);
    return "hsla(" + xNorm.toString() + ", " + yNorm.toString() +
        "%, 40%, 0.35)";
}

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
        /* draw `to` */
        CTX.beginPath();
        CTX.arc(CIRCLES[j].x, CIRCLES[j].yTo, CIRCLES[j].radius, 0, PI_2);
        CTX.strokeStyle = CIRCLES[j].strokeStyle;
        CTX.lineWidth = CIRCLES[j].lineWidth;
        CTX.stroke();
        /* draw `from` */
        CTX.beginPath();
        CTX.arc(CIRCLES[j].x, CIRCLES[j].yFrom, CIRCLES[j].radius, 0, PI_2);
        CTX.fillStyle =
            hueToGray(CIRCLES[j].x, Math.abs(CIRCLES[j].delta), 0, DISTANCE);
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
