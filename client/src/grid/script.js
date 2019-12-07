"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 35%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;

var PI_2 = Math.PI * 2;
var RADIUS = 7;
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

for (var i = 0; i < N; i++) {
    var neighbors;
    for (var j = 0; j < N; j++) {
        neighbors = [];
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
            neighbors: neighbors,
            x: 0,
            y: 0,
            weight: 0,
            polarity: true,
        };
    }
}

function init() {
    var index;
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            index = j + (i * N);
            CIRCLES[index].x = DELTA + (SHORT_SIDE * ((i + 0.5) / N));
            CIRCLES[index].y = SHORT_SIDE * ((j + 0.5) / N);
            CIRCLES[index].weight = Math.random();
            CIRCLES[index].polarity = Math.random() < 0.5 ? true : false;
        }
    }
}

var RELOAD = 60 * 15;
var ELAPSED = RELOAD + 1;
var DRAG;

function loop() {
    var i, j, index, x, y, xMove, yMove, norm, left, right;
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
    for (i = 0; i < M; i++) {
        xMove = 0;
        yMove = 0;
        norm = 0;
        for (j = 0; j < CIRCLES[i].neighbors.length; j++) {
            index = CIRCLES[i].neighbors[j];
            xMove += CIRCLES[index].x * CIRCLES[index].weight;
            yMove += CIRCLES[index].y * CIRCLES[index].weight;
            norm += CIRCLES[index].weight;
        }
        xMove = ((xMove / norm) - CIRCLES[i].x) / DRAG;
        yMove = ((yMove / norm) - CIRCLES[i].y) / DRAG;
        if (CIRCLES[i].polarity) {
            CIRCLES[i].x += xMove;
            CIRCLES[i].y += yMove;
        } else {
            CIRCLES[i].x -= xMove;
            CIRCLES[i].y -= yMove;
        }
        x = CIRCLES[i].x;
        y = CIRCLES[i].y;
        CTX.moveTo(x, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        for (j = 1; j < N; j++) {
            left = i + ((j - 1) * N);
            right = i + (j * N);
            CTX.moveTo(CIRCLES[left].x, CIRCLES[left].y);
            CTX.lineTo(CIRCLES[right].x, CIRCLES[right].y);
        }
        for (j = 1; j < N; j++) {
            left = (j - 1) + (i * N);
            right = j + (i * N);
            CTX.moveTo(CIRCLES[left].x, CIRCLES[left].y);
            CTX.lineTo(CIRCLES[right].x, CIRCLES[right].y);
        }
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

loop();
