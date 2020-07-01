"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.lineWidth = 4;

var N = 15;
var FLOAT32_BYTES = N * 4;
var XS = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var YS = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var XS_SPEED = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var YS_SPEED = new Float32Array(new ArrayBuffer(FLOAT32_BYTES));
var K = 0.025;
var L = 10;

for (var i = 0; i < N; i++) {
    XS[i] = Math.random() * CANVAS.width;
    YS[i] = Math.random() * CANVAS.height;
    XS_SPEED[i] = 0;
    YS_SPEED[i] = 0;
}

function loop() {
    var i;
    for (i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) {
            if (XS[i] < XS[j]) {
                XS_SPEED[i] += K;
                XS_SPEED[j] -= K;
            } else if (XS[j] < XS[i]) {
                XS_SPEED[i] -= K;
                XS_SPEED[j] += K;
            }
            if (YS[i] < YS[j]) {
                YS_SPEED[i] += K;
                YS_SPEED[j] -= K;
            } else if (YS[j] < YS[i]) {
                YS_SPEED[i] -= K;
                YS_SPEED[j] += K;
            }
        }
    }
    for (i = 0; i < N; i++) {
        XS[i] += XS_SPEED[i];
        YS[i] += YS_SPEED[i];
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        var x = XS[i];
        var y = YS[i];
        CTX.moveTo(x, y);
        CTX.lineTo(x - (XS_SPEED[i] * L), y - (YS_SPEED[i] * L));
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

window.onload = loop;
