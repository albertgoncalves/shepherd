"use strict";

/* global randomBetween */

var CANVAS = document.getElementById("canvas");

var CTX = CANVAS.getContext("2d");

var PI_2 = Math.PI * 2;
var RADIUS = 9;
var LOWER = CANVAS.height / 4;
var UPPER = CANVAS.height - LOWER;
var DRAG = 20;
var CLOCK = 75;
var TOLERANCE = 0.1;

function createCircle(x) {
    return {
        x: x,
        yTo: randomBetween(LOWER, UPPER),
        yFrom: randomBetween(LOWER, UPPER),
        radius: RADIUS,
        lineWidth: 0.5,
        fillStyle: "hsla(200, 20%, 35%, 0.35)",
        strokeStyle: "hsla(0, 0%, 25%, 0.75)",
        clock: 0,
    };
}

var N = 20;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = createCircle(CANVAS.width * ((i + 0.5) / N));
}

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < N; i++) {
        /* move */
        var deltaY = (CIRCLES[i].yTo - CIRCLES[i].yFrom) / DRAG;
        CIRCLES[i].yFrom += deltaY;
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
        CTX.fillStyle = CIRCLES[i].fillStyle;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
