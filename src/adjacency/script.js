"use strict";

var CANVAS, CTX, NODES, N;

var COLOR = "hsl(0, 0%, 35%)";
var PI_2 = Math.PI * 2;
var RADIUS = 7;
var START = 3;
var STOP = 18;
var MAGNITUDE = 0.5;
var CENTER = MAGNITUDE / 2;
var FRAMES = 60;
var RESET = FRAMES * (STOP - START + 1);
var ELAPSED = RESET + 1;

function randomAverage(a, b) {
    /* NOTE: See `https://en.wikipedia.org/wiki/Linear_combination`. */
    var aWeight = Math.random();
    var bWeight = Math.random();
    return ((a * aWeight) + (b * bWeight)) / (aWeight + bWeight);
}

function loop() {
    if (RESET < ELAPSED) {
        N = START;
        var n = N - 1;
        NODES = new Array(STOP);
        for (var i = 0; i < N; i++) {
            NODES[i] = {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
                left: i === 0 ? n : i - 1,
                right: i === n ? 0 : i + 1,
            };
        }
        ELAPSED = 0;
    } else {
        for (var i = 0; i < N; i++) {
            NODES[i].x += (Math.random() * MAGNITUDE) - CENTER;
            NODES[i].y += (Math.random() * MAGNITUDE) - CENTER;
        }
        if ((ELAPSED % FRAMES === 0) && (N < STOP)) {
            var left = 0;
            var value = 0;
            for (var i = 0; i < N; i++) {
                var a = NODES[i];
                var b = NODES[NODES[i].right];
                var x = a.x - b.x;
                var y = a.y - b.y;
                var candidate = Math.sqrt((x * x) + (y * y));
                if (value < candidate) {
                    left = i;
                    value = candidate;
                }
            }
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
        ELAPSED += 1;
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (var i = 0; i < N; i++) {
        CTX.moveTo(NODES[i].x, NODES[i].y);
        CTX.lineTo(NODES[NODES[i].left].x, NODES[NODES[i].left].y);
    }
    CTX.stroke();
    CTX.beginPath();
    for (var i = 0; i < N; i++) {
        var x = NODES[i].x;
        var y = NODES[i].y;
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = COLOR;
    CTX.fillStyle = COLOR;
    CTX.lineWidth = 4;
    loop();
};
