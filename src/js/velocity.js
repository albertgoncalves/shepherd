"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");

var PI_2 = Math.PI * 2;
var RADIUS = 3;
var HALF_HEIGHT = CANVAS.height / 2;

function createCircle(x) {
    return {
        x: x,
        y: HALF_HEIGHT,
        radius: RADIUS,
        speed: 0,
        fillStyle: "hsla(0, 0%, 35%, 0.75)",
    };
}

var N = 75;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = createCircle(CANVAS.width * ((i + 0.5) / N));
}

var LOWER = CANVAS.height / 7;
var UPPER = CANVAS.height - LOWER;
var SCALE = 25;
var MAX_SPEED = 1;
var MIN_SPEED = -1;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < N; i++) {
        CIRCLES[i].speed += (Math.random() * 0.25) - 0.125;
        CIRCLES[i].y += CIRCLES[i].speed;
        if (CIRCLES[i].y < LOWER) {
            CIRCLES[i].y = LOWER;
        } else if (UPPER < CIRCLES[i].y) {
            CIRCLES[i].y = UPPER;
        }
        if (CIRCLES[i].speed < MIN_SPEED) {
            CIRCLES[i].speed = MIN_SPEED;
        } else if (MAX_SPEED < CIRCLES[i].speed) {
            CIRCLES[i].speed = MAX_SPEED;
        }
        CTX.beginPath();
        CTX.arc(CIRCLES[i].x, CIRCLES[i].y, CIRCLES[i].radius, 0, PI_2);
        CTX.fillStyle = CIRCLES[i].fillStyle;
        CTX.fill();
        CTX.beginPath();
        CTX.moveTo(CIRCLES[i].x, CIRCLES[i].y);
        CTX.lineTo(CIRCLES[i].x, CIRCLES[i].y + (CIRCLES[i].speed * SCALE));
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
