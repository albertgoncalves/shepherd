"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 25%)";
CTX.imageSmoothingEnabled = false;
CTX.fillStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 1;

var PI_2 = Math.PI * 2;
var RADIUS = 3;

var N = 20;
var OFFSET = 50;
var HALF_WIDTH = CANVAS.width / 2;
var HALF_HEIGHT = CANVAS.height / 2;
var ANGLES = new Array(N);
var CIRCLES = new Array(N);

function init() {
    for (var i = 0; i < N; i++) {
        ANGLES[i] = Math.random() * PI_2;
    }
    ANGLES.sort();
    for (i = 0; i < N; i++) {
        CIRCLES[i] = {
            x: (Math.cos(ANGLES[i]) * OFFSET) + HALF_WIDTH,
            y: (Math.sin(ANGLES[i]) * OFFSET) + HALF_HEIGHT,
        };
    }
}

function drawPoints() {
    for (var i = 0; i < N; i++) {
        CTX.beginPath();
        CTX.arc(CIRCLES[i].x, CIRCLES[i].y, RADIUS, 0, PI_2);
        CTX.fill();
    }
}

function drawLines() {
    CTX.beginPath();
    for (var i = 0; i < N; i++) {
        CTX.lineTo(CIRCLES[i].x, CIRCLES[i].y);
    }
    CTX.lineTo(CIRCLES[0].x, CIRCLES[0].y);
    CTX.stroke();
}

init();

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    drawPoints();
    drawLines();
    requestAnimationFrame(loop);
}

loop();
