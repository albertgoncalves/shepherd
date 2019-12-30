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
var N = 9;
var M = N * N;
var CIRCLES = new Array(M);
var DRAG, SHORT_SIDE, DELTA;
var RESET = 60 * 15;
var ELAPSED = RESET + 1;

if (CANVAS.width < CANVAS.height) {
    SHORT_SIDE = CANVAS.width;
    DELTA = (CANVAS.height - CANVAS.width) / 2;
} else {
    SHORT_SIDE = CANVAS.height;
    DELTA = (CANVAS.width - CANVAS.height) / 2;
}

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

function loop() {
    var i, j, k;
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
    var x, y, norm, circle;
    for (i = 0; i < M; i++) {
        circle = CIRCLES[i];
        x = 0;
        y = 0;
        norm = 0;
        for (j = 0; j < circle.neighbors.length; j++) {
            k = circle.neighbors[j];
            x += CIRCLES[k].x * CIRCLES[k].weight;
            y += CIRCLES[k].y * CIRCLES[k].weight;
            norm += CIRCLES[k].weight;
        }
        x = ((x / norm) - circle.x) / DRAG;
        y = ((y / norm) - circle.y) / DRAG;
        if (circle.polarity) {
            circle.x += x;
            circle.y += y;
        } else {
            circle.x -= x;
            circle.y -= y;
        }
        x = circle.x;
        y = circle.y;
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    CTX.beginPath();
    var left, right;
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
