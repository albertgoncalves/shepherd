"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 35%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;

var PI_2 = Math.PI * 2;
var RADIUS = 6;
var SHORT_SIDE, DELTA;

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
var NEIGHBORS, INDEX;

for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
        NEIGHBORS = [];
        if (j !== 0) {
            NEIGHBORS.push(j - 1 + (i * N));
        }
        if (j !== (N - 1)) {
            NEIGHBORS.push(j + 1 + (i * N));
        }
        if (i !== 0) {
            NEIGHBORS.push(j + ((i - 1) * N));
        }
        if (i !== (N - 1)) {
            NEIGHBORS.push(j + ((i + 1) * N));
        }
        CIRCLES[j + (i * N)] = {
            neighbors: NEIGHBORS,
            x: 0,
            y: 0,
            weight: 0,
            polarity: true,
        };
    }
}

function init() {
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            INDEX = j + (i * N);
            CIRCLES[INDEX].x = DELTA + (SHORT_SIDE * ((i + 0.5) / N));
            CIRCLES[INDEX].y = SHORT_SIDE * ((j + 0.5) / N);
            CIRCLES[INDEX].weight = Math.random();
            CIRCLES[INDEX].polarity = Math.random() < 0.5 ? true : false;
        }
    }
}

var DRAG, X, Y, NORM, X_MOVE, Y_MOVE, LEFT, RIGHT;
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
    CTX.beginPath();
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
        CTX.moveTo(CIRCLES[i].x, CIRCLES[i].y);
        CTX.arc(CIRCLES[i].x, CIRCLES[i].y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    CTX.beginPath();
    for (var k = 0; k < N; k++) {
        for (var l = 1; l < N; l++) {
            LEFT = k + ((l - 1) * N);
            RIGHT = k + (l * N);
            CTX.moveTo(CIRCLES[LEFT].x, CIRCLES[LEFT].y);
            CTX.lineTo(CIRCLES[RIGHT].x, CIRCLES[RIGHT].y);
        }
        for (var m = 1; m < N; m++) {
            LEFT = (m - 1) + (k * N);
            RIGHT = m + (k * N);
            CTX.moveTo(CIRCLES[LEFT].x, CIRCLES[LEFT].y);
            CTX.lineTo(CIRCLES[RIGHT].x, CIRCLES[RIGHT].y);
        }
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

loop();
