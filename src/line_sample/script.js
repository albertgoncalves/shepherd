"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
CTX.imageSmoothingEnabled = false;
CTX.fillStyle = "hsla(0, 0%, 90%, 0.035)";

var PI_2 = Math.PI * 2;
var RADIUS = 7;
var N = 65;
var M = 50;
var FLOAT32_BYTES = N * 4;
var XS = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var HALF_HEIGHT = CANVAS.height / 2;
var MAGNITUDE = CANVAS.height;
var MAGNITUDE_CENTER = MAGNITUDE / 2;
var ERROR = 0.15;
var ERROR_CENTER = ERROR / 2;
var RESET = 600;
var ELAPSED = RESET + 1;

for (var i = 0; i < N; i++) {
    XS[i] = CANVAS.width * ((i + 1) / N);
}

function randomError(offset) {
    return offset + ((Math.random() * ERROR) - ERROR_CENTER);
}

function randomOffset(weight) {
    return weight * ((Math.random() * MAGNITUDE) - MAGNITUDE_CENTER);
}

function randomLerp(aPoint, bPoint) {
    var weight = Math.random();
    return {
        x: aPoint.x + ((bPoint.x - aPoint.x) * weight),
        y: aPoint.y + ((bPoint.y - aPoint.y) * weight),
    };
}

function loop() {
    if (RESET < ELAPSED) {
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
    }
    for (var i = 1; i < N; i++) {
        var x = XS[i];
        var xPrev = XS[i - 1];
        var offset = (CANVAS.width - x) / CANVAS.width;
        for (var j = 0; j < M; j++) {
            var sample = randomLerp(
                {
                    x: x + randomOffset(randomError(offset)),
                    y: HALF_HEIGHT + randomOffset(randomError(offset)),
                },
                {
                    x: xPrev + randomOffset(randomError(offset)),
                    y: HALF_HEIGHT + randomOffset(randomError(offset)),
                });
            CTX.fillRect(sample.x, sample.y, 1, 1);
        }
    }
    requestAnimationFrame(loop);
}

window.onload = loop;
