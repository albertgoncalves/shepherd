"use strict";

function randomBetween(a, b) {
    return a + (Math.random() * (b - a));
}

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 0.85;

var PI_2 = Math.PI * 2;
var RADIUS = 6;
var LOWER = CANVAS.height / 5;
var UPPER = CANVAS.height - LOWER;

function createCircle(x) {
    return {
        x: x,
        yTo: randomBetween(LOWER, UPPER),
        yFrom: randomBetween(LOWER, UPPER),
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
        if (RESET) {
            CIRCLES[j].yTo = randomBetween(LOWER, UPPER);
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
