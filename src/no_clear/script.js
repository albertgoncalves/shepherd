"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
CTX.fillStyle = "hsla(0, 0%, 85%, 0.4)";

var PI_2 = Math.PI * 2;
var RADIUS = 0.5;
var HALF_HEIGHT = CANVAS.height / 2;

function createPixel(x) {
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
var PIXELS = new Array(N);
for (var i = 0; i < N; i++) {
    PIXELS[i] = createPixel(CANVAS.width * ((i + 0.5) / N));
}

var LOWER = CANVAS.height / 10;
var UPPER = CANVAS.height - LOWER;
var MAGNITUDE = 0.1;
var CENTER = MAGNITUDE / 2;
var K;

var RELOAD = 60 * 10;
var L = 0;

function loop() {
    L += 1;
    if (RELOAD < L) {
        location.reload();
    }
    for (var i = 0; i < N; i++) {
        PIXELS[i].speedRegular += (Math.random() * MAGNITUDE) - CENTER;
        K = 0;
        if (PIXELS[i].speedSpecial < 0) {
            for (var j = 0; j < i; j++) {
                PIXELS[i].speedSpecial += PIXELS[j].speedRegular;
                K += 1;
            }
        } else {
            for (var k = i + 1; k < N; k++) {
                PIXELS[i].speedSpecial += PIXELS[k].speedRegular;
                K += 1;
            }
        }
        PIXELS[i].y += PIXELS[i].speedSpecial / K;
        if (PIXELS[i].y < LOWER) {
            PIXELS[i].y = LOWER;
            PIXELS[i].speedRegular = (Math.random() * MAGNITUDE) - CENTER;
            PIXELS[i].speedSpecial = 0;
        } else if (UPPER < PIXELS[i].y) {
            PIXELS[i].y = UPPER;
            PIXELS[i].speedRegular = (Math.random() * MAGNITUDE) - CENTER;
            PIXELS[i].speedSpecial = 0;
        }
    }
    for (var l = HIDDEN; l < M; l++) {
        CTX.beginPath();
        CTX.arc(PIXELS[l].x, PIXELS[l].y, RADIUS, 0, PI_2);
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
