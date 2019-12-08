"use strict";

function randomBetween(a, b) {
    return a + (Math.random() * (b - a));
}

function randomAverage(a, b) {
    /* https://en.wikipedia.org/wiki/Linear_combination */
    var wA = Math.random();
    var wB = Math.random();
    return ((a * wA) + (b * wB)) / (wA + wB);
}

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 35%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;

var PI_2 = Math.PI * 2;
var RADIUS = 7;
var SEED = 3;
var STOP = 18;
var NODES, N, M;

function init() {
    N = SEED;
    M = N - 1;
    NODES = new Array(STOP);
    for (var i = 0; i < N; i++) {
        NODES[i] = {
            x: randomBetween(0, CANVAS.width),
            y: randomBetween(0, CANVAS.height),
            left: i === 0 ? M : i - 1,
            right: i === M ? 0 : i + 1,
        };
    }
}

function insert(left) {
    var right = NODES[left].right;
    NODES[left].right = N;
    NODES[right].left = N;
    NODES[N] = {
        x: randomAverage(NODES[left].x, NODES[right].x),
        y: randomAverage(NODES[left].y, NODES[right].y),
        left: left,
        right: right,
    };
    N += 1;
}

function distance(i, j) {
    var left = NODES[i];
    var right = NODES[j];
    var x = left.x - right.x;
    var y = left.y - right.y;
    return Math.sqrt((x * x) + (y * y));
}

var FRAMES = 60;
var RESET = FRAMES * (STOP - SEED + 1);
var ELAPSED = RESET + 1;
var MAGNITUDE = 0.5;
var CENTER = MAGNITUDE / 2;

function loop() {
    var i, x, y, index, value, candidate;
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    if (RESET < ELAPSED) {
        init();
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
        if ((ELAPSED % FRAMES === 0) && (N < STOP)) {
            index = 0;
            value = 0;
            for (i = 0; i < N; i++) {
                candidate = distance(i, NODES[i].right);
                if (value < candidate) {
                    index = i;
                    value = candidate;
                }
            }
            insert(index);
        }
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
