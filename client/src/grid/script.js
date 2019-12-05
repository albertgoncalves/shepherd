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
var DIAMETER = RADIUS * 2;
var BUFFER_WIDTH = CANVAS.width - RADIUS;
var BUFFER_HEIGHT = CANVAS.height - RADIUS;

var EDGE;
var DELTA;

if (CANVAS.width < CANVAS.height) {
    EDGE = CANVAS.width;
    DELTA = (CANVAS.height - CANVAS.width) / 2;
} else {
    EDGE = CANVAS.height;
    DELTA = (CANVAS.width - CANVAS.height) / 2;
}

var N = 13;
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
                x: DELTA + (EDGE * ((i + 0.5) / N)),
                y: EDGE * ((j + 0.5) / N),
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
var X_SPEED;
var Y_SPEED;

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
        for (var m = 0; m < CIRCLES[i].neighbors.length; m++) {
            INDEX = CIRCLES[i].neighbors[m];
            X += CIRCLES[INDEX].x * CIRCLES[INDEX].weight;
            Y += CIRCLES[INDEX].y * CIRCLES[INDEX].weight;
            NORM += CIRCLES[INDEX].weight;
        }
        X_SPEED = ((X / NORM) - CIRCLES[i].x) / DRAG;
        Y_SPEED = ((Y / NORM) - CIRCLES[i].y) / DRAG;
        if (CIRCLES[i].polarity) {
            CIRCLES[i].x += X_SPEED;
            CIRCLES[i].y += Y_SPEED;
        } else {
            CIRCLES[i].x -= X_SPEED;
            CIRCLES[i].y -= Y_SPEED;
        }
        CTX.beginPath();
        CTX.arc(CIRCLES[i].x, CIRCLES[i].y, RADIUS, 0, PI_2);
        CTX.fill();
    }
    for (var j = 0; j < N; j++) {
        CTX.beginPath();
        for (var k = 0; k < N; k++) {
            INDEX = k + (j * N);
            CTX.lineTo(CIRCLES[INDEX].x, CIRCLES[INDEX].y);
        }
        CTX.stroke();
        CTX.beginPath();
        for (var l = 0; l < N; l++) {
            INDEX = j + (l * N);
            CTX.lineTo(CIRCLES[INDEX].x, CIRCLES[INDEX].y);
        }
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

loop();
