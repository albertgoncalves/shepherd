"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 20%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;

var PI_2 = Math.PI * 2;
var RADIUS = 7;

function randomBetween(a, b) {
    return a + (Math.random() * (b - a));
}

var N = 3;
var M = N - 1;
var LIMIT = 15;
var NODES = new Array(LIMIT);
for (var i = 0; i < N; i++) {
    NODES[i] = {
        x: randomBetween(0, CANVAS.width),
        y: randomBetween(0, CANVAS.height),
        left: i === 0 ? M : i - 1,
        right: i === M ? 0 : i + 1,
    };
}

var MAGNITUDE = 1;
var CENTER = MAGNITUDE / 2;

function loop() {
    var i, index, x, y, left, right, w1, w2, w3, w4;
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    if (N < LIMIT) {
        left = Math.floor(Math.random() * N);
        right = NODES[left].right;
        w1 = Math.random();
        w2 = Math.random();
        w3 = Math.random();
        w4 = Math.random();
        NODES[left].right = N;
        NODES[right].left = N;
        NODES[N] = {
            x: ((w1 * NODES[left].x) + (w2 * NODES[right].x)) / (w1 + w2),
            y: ((w3 * NODES[left].y) + (w4 * NODES[right].y)) / (w3 + w4),
            left: left,
            right: right,
        };
        N += 1;
    }
    for (i = 0; i < N; i++) {
        NODES[i].x += (Math.random() * MAGNITUDE) - CENTER;
        NODES[i].y += (Math.random() * MAGNITUDE) - CENTER;
    }
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        x = NODES[i].x;
        y = NODES[i].y;
        CTX.moveTo(x, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        CTX.moveTo(NODES[i].x, NODES[i].y);
        CTX.lineTo(NODES[NODES[i].left].x, NODES[NODES[i].left].y);
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

loop();
