"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 1;

var PI_2 = Math.PI * 2;
var RADIUS = 5;

var SHORT_SIDE;
var DELTA;

if (CANVAS.width < CANVAS.height) {
    SHORT_SIDE = CANVAS.width;
    DELTA = (CANVAS.height - CANVAS.width) / 2;
} else {
    SHORT_SIDE = CANVAS.height;
    DELTA = (CANVAS.width - CANVAS.height) / 2;
}

var N = 9;
var M = N * N;
var CIRCLES = new Array(M);
var DRAG;

function init() {
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            var neighbors = [];
            if (j !== 0) {
                neighbors.push(j - 1 + (i * N));
            }
            if (j !== (N - 1)) {
                neighbors.push(j + 1 + (i * N));
            }
            if (i !== 0) {
                neighbors.push(j + ((i - 1) * N));
            }
            if (i !== (N - 1)) {
                neighbors.push(j + ((i + 1) * N));
            }
            CIRCLES[j + (i * N)] = {
                x: DELTA + (SHORT_SIDE * ((i + 0.5) / N)),
                y: SHORT_SIDE * ((j + 0.5) / N),
                neighbors: neighbors,
                weight: Math.random(),
                polarity: Math.random() < 0.5 ? true : false,
            };
        }
    }
}

var X;
var Y;
var NORM;
var INDEX;
var X_MOVE;
var Y_MOVE;

var RELOAD = 60 * 15;
var ELAPSED = RELOAD + 1;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    if (RELOAD < ELAPSED) {
        init();
        DRAG = 500;
        ELAPSED = 0;
    } else {
        DRAG += 1;
        ELAPSED += 1;
    }
    for (var i = 0; i < M; i++) {
        X = 0;
        Y = 0;
        NORM = 0;
        for (var j = 0; j < CIRCLES[i].neighbors.length; j++) {
            INDEX = CIRCLES[i].neighbors[j];
            X += CIRCLES[INDEX].x * CIRCLES[INDEX].weight;
            Y += CIRCLES[INDEX].y * CIRCLES[INDEX].weight;
            NORM += CIRCLES[INDEX].weight;
        }
        X_MOVE = ((X / NORM) - CIRCLES[i].x) / DRAG;
        Y_MOVE = ((Y / NORM) - CIRCLES[i].y) / DRAG;
        if (CIRCLES[i].polarity) {
            CIRCLES[i].x += X_MOVE;
            CIRCLES[i].y += Y_MOVE;
        } else {
            CIRCLES[i].x -= X_MOVE;
            CIRCLES[i].y -= Y_MOVE;
        }
        CTX.beginPath();
        CTX.arc(CIRCLES[i].x, CIRCLES[i].y, RADIUS, 0, PI_2);
        CTX.fill();
    }
    for (var k = 0; k < N; k++) {
        CTX.beginPath();
        for (var l = 0; l < N; l++) {
            INDEX = k + (l * N);
            CTX.lineTo(CIRCLES[INDEX].x, CIRCLES[INDEX].y);
        }
        CTX.stroke();
        CTX.beginPath();
        for (var m = 0; m < N; m++) {
            INDEX = m + (k * N);
            CTX.lineTo(CIRCLES[INDEX].x, CIRCLES[INDEX].y);
        }
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

loop();
