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

var DRAG;
var RESET = 60 * 15;
var ELAPSED = RESET + 1;

function loop() {
    var i, j, k, x, y, xMove, yMove, norm, left, right;
    if (RESET < ELAPSED) {
        for (i = 0; i < N; i++) {
            for (j = 0; j < N; j++) {
                k = j + (i * N);
                CIRCLES[k].x = DELTA + (SHORT_SIDE * ((i + 0.5) / N));
                CIRCLES[k].y = SHORT_SIDE * ((j + 0.5) / N);
                CIRCLES[k].weight = Math.random();
                CIRCLES[k].polarity = Math.random() < 0.5 ? true : false;
            }
        }
        DRAG = 500;
        ELAPSED = 0;
    } else {
        DRAG += 1;
        ELAPSED += 1;
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (i = 0; i < M; i++) {
        xMove = 0;
        yMove = 0;
        norm = 0;
        for (j = 0; j < CIRCLES[i].neighbors.length; j++) {
            k = CIRCLES[i].neighbors[j];
            xMove += CIRCLES[k].x * CIRCLES[k].weight;
            yMove += CIRCLES[k].y * CIRCLES[k].weight;
            norm += CIRCLES[k].weight;
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
        CTX.moveTo(x + RADIUS, y);
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
