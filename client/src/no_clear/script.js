"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
CTX.imageSmoothingEnabled = false;
CTX.fillStyle = "hsla(0, 0%, 85%, 0.35)";

var HALF_HEIGHT = CANVAS.height / 2;
var N = CANVAS.width;
var PIXELS = new Array(N);

function init() {
    for (var i = 0; i < N; i++) {
        PIXELS[i] = {
            x: CANVAS.width * ((i + 0.5) / N),
            y: HALF_HEIGHT,
            speedRegular: 0,
            speedSpecial: 0,
        };
    }
}

var LOWER = CANVAS.height / 10;
var UPPER = CANVAS.height - LOWER;
var MAGNITUDE = 0.1;
var CENTER = MAGNITUDE / 2;
var K;
var RELOAD = 60 * 12;
var ELAPSED = RELOAD + 1;

function loop() {
    if (RELOAD < ELAPSED) {
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
        init();
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
    }
    for (var i = 0; i < N; i++) {
        PIXELS[i].speedRegular += (Math.random() * MAGNITUDE) - CENTER;
        K = 0;
        for (var j = 0; j <= i; j++) {
            PIXELS[i].speedSpecial += PIXELS[j].speedRegular;
            K += 1;
        }
        PIXELS[i].y += PIXELS[i].speedSpecial / K;
        if (PIXELS[i].y < LOWER) {
            PIXELS[i].y = LOWER;
            PIXELS[i].speedSpecial = 0;
        } else if (UPPER < PIXELS[i].y) {
            PIXELS[i].y = UPPER;
            PIXELS[i].speedSpecial = 0;
        }
    }
    for (var k = 0; k < N; k++) {
        CTX.beginPath();
        CTX.fillRect(PIXELS[k].x, PIXELS[k].y, 1, 1);
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
