"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 35%)";
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;
CTX.imageSmoothingEnabled = false;

var PI_2 = Math.PI * 2;
var RADIUS = 5;
var N = 30;
var OFFSET = 250;
var HALF_WIDTH = CANVAS.width / 2;
var HALF_HEIGHT = CANVAS.height / 2;
var ANGLES = new Array(N);
var XS = new Array(N);
var YS = new Array(N);

function init() {
    for (var i = 0; i < N; i++) {
        ANGLES[i] = Math.random() * PI_2;
    }
    ANGLES.sort();
    for (i = 0; i < N; i++) {
        XS[i] = (Math.cos(ANGLES[i]) * OFFSET) + HALF_WIDTH;
        YS[i] = (Math.sin(ANGLES[i]) * OFFSET) + HALF_HEIGHT;
    }
}

var DRAG = 50;
var RESET = 60 * 8;
var ELAPSED = RESET + 1;
var LEFT, RIGHT;

function reset() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    if (RESET < ELAPSED) {
        init();
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
    }
}

function update() {
    for (var i = 0; i < N; i++) {
        LEFT = (N + i - 1) % N;
        RIGHT = (N + i + 1) % N;
        XS[i] += (((XS[LEFT] + XS[RIGHT]) / 2) - XS[i]) / DRAG;
        YS[i] += (((YS[LEFT] + YS[RIGHT]) / 2) - YS[i]) / DRAG;
    }
}

function drawPoints() {
    for (var i = 0; i < N; i++) {
        CTX.beginPath();
        CTX.arc(XS[i], YS[i], RADIUS, 0, PI_2);
        CTX.fill();
    }
}

function drawLines() {
    CTX.beginPath();
    for (var i = 0; i < N; i++) {
        CTX.lineTo(XS[i], YS[i]);
    }
    CTX.lineTo(XS[0], YS[0]);
    CTX.stroke();
}

function loop() {
    reset();
    update();
    drawPoints();
    drawLines();
    requestAnimationFrame(loop);
}

loop();
