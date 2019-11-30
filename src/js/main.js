"use strict";

/* global randomBetween */

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");

var PI_2 = Math.PI * 2;
var RADIUS = 8;
var LOWER = CANVAS.height / 5;
var UPPER = CANVAS.height - LOWER;

function createCircle(x) {
    return {
        x: x,
        yTo: randomBetween(LOWER, UPPER),
        yFrom: randomBetween(LOWER, UPPER),
        radius: RADIUS,
        lineWidth: 0.45,
        strokeStyle: "hsla(0, 0%, 25%, 0.75)",
        clock: 0,
    };
}

var N = 25;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = createCircle(CANVAS.width * ((i + 0.5) / N));
}

var DRAG = 35;   /* higher is slower */
var CLOCK = 100; /* duration of move loop (# frames) */
var Y_DELTA_MIN;
var Y_DELTA_MAX;

function blueToGray(y, yMin, yMax) {
    var yNorm = Math.floor(((y - yMin) / (yMax - yMin)) * 100);
    return "hsla(210, " + yNorm.toString() + "%, 35%, 0.35)";
}

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    Y_DELTA_MIN = Number.MAX_VALUE;
    Y_DELTA_MAX = 0;
    for (var i = 0; i < N; i++) {
        /* move */
        var yDelta = (CIRCLES[i].yTo - CIRCLES[i].yFrom);
        if (yDelta < Y_DELTA_MIN) {
            Y_DELTA_MIN = yDelta;
        }
        if (Y_DELTA_MAX < yDelta) {
            Y_DELTA_MAX = yDelta;
        }
        CIRCLES[i].yFrom += yDelta / DRAG;
        CIRCLES[i].clock += 1;
        if (CLOCK < CIRCLES[i].clock) {
            CIRCLES[i].yTo = randomBetween(LOWER, UPPER);
            CIRCLES[i].clock = 0;
        }
        /* draw `to` */
        CTX.beginPath();
        CTX.arc(CIRCLES[i].x, CIRCLES[i].yTo, CIRCLES[i].radius, 0, PI_2);
        CTX.strokeStyle = CIRCLES[i].strokeStyle;
        CTX.lineWidth = CIRCLES[i].lineWidth;
        CTX.stroke();
        /* draw `from` */
        CTX.beginPath();
        CTX.arc(CIRCLES[i].x, CIRCLES[i].yFrom, CIRCLES[i].radius, 0, PI_2);
        CTX.fillStyle = blueToGray(yDelta, Y_DELTA_MIN, Y_DELTA_MAX);
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
