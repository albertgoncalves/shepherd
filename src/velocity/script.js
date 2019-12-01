"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.fillStyle = COLOR;
CTX.strokeStyle = COLOR;

var PI_2 = Math.PI * 2;
var RADIUS = 3;
var HALF_HEIGHT = CANVAS.height / 2;

function createCircle(x) {
    return {
        x: x,
        y: HALF_HEIGHT,
        speedRegular: 0,
        speedSpecial: 0,
    };
}

var N = 250;
var M = N - 1;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = createCircle(CANVAS.width * ((i + 0.5) / N));
}

var LOWER = CANVAS.height / 7;
var UPPER = CANVAS.height - LOWER;
var SCALE = 10;
var MAX_SPEED = 0.05;
var MIN_SPEED = MAX_SPEED * -1;
var MAGNITUDE = 1 / (N * 3);
var CENTER = MAGNITUDE / 2;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < N; i++) {
        CIRCLES[i].speedRegular += (Math.random() * MAGNITUDE) - CENTER;
        if (CIRCLES[i].speedRegular < MIN_SPEED) {
            CIRCLES[i].speedRegular = MIN_SPEED;
        } else if (MAX_SPEED < CIRCLES[i].speedRegular) {
            CIRCLES[i].speedRegular = MAX_SPEED;
        }
        if (CIRCLES[i].speedSpecial < 0) {
            for (var j = 0; j < i; j++) {
                CIRCLES[i].speedSpecial += CIRCLES[j].speedRegular;
            }
        } else {
            for (var k = i + 1; k < N; k++) {
                CIRCLES[i].speedSpecial += CIRCLES[k].speedRegular;
            }
        }
        CIRCLES[i].y += CIRCLES[i].speedSpecial;
        if (CIRCLES[i].y < LOWER) {
            CIRCLES[i].y = LOWER;
        } else if (UPPER < CIRCLES[i].y) {
            CIRCLES[i].y = UPPER;
        }
    }
    for (var l = 1; l < M; l++) {
        CTX.beginPath();
        CTX.arc(CIRCLES[l].x, CIRCLES[l].y, RADIUS, 0, PI_2);
        CTX.fill();
        CTX.beginPath();
        CTX.moveTo(CIRCLES[l].x, CIRCLES[l].y);
        CTX.lineTo(CIRCLES[l].x,
                   CIRCLES[l].y + (CIRCLES[l].speedSpecial * SCALE));
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
