"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
CTX.fillStyle = "hsla(0, 0%, 85%, 0.2)";

var PI_2 = Math.PI * 2;
var RADIUS = 0.5;
var HALF_HEIGHT = CANVAS.height / 2;

function createCircle(x) {
    return {
        x: x,
        y: HALF_HEIGHT,
        speedRegular: 0,
        speedSpecial: 0,
    };
}

var N = CANVAS.width;
var HIDDEN = 20;
var M = N - HIDDEN;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = createCircle(CANVAS.width * ((i + 0.5) / N));
}

var LOWER = CANVAS.height / 10;
var UPPER = CANVAS.height - LOWER;
var MAGNITUDE = 0.1;
var CENTER = MAGNITUDE / 2;
var K;

var RELOAD = 60 * 5;
var L = 0;

function loop() {
    L += 1;
    if (RELOAD < L) {
        location.reload();
    }
    for (var i = 0; i < N; i++) {
        CIRCLES[i].speedRegular += (Math.random() * MAGNITUDE) - CENTER;
        K = 0;
        if (CIRCLES[i].speedSpecial < 0) {
            for (var j = 0; j < i; j++) {
                CIRCLES[i].speedSpecial += CIRCLES[j].speedRegular;
                K += 1;
            }
        } else {
            for (var k = i + 1; k < N; k++) {
                CIRCLES[i].speedSpecial += CIRCLES[k].speedRegular;
                K += 1;
            }
        }
        CIRCLES[i].y += CIRCLES[i].speedSpecial / K;
        if (CIRCLES[i].y < LOWER) {
            CIRCLES[i].y = LOWER;
        } else if (UPPER < CIRCLES[i].y) {
            CIRCLES[i].y = UPPER;
        }
    }
    for (var l = HIDDEN; l < M; l++) {
        CTX.beginPath();
        CTX.arc(CIRCLES[l].x, CIRCLES[l].y, RADIUS, 0, PI_2);
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
