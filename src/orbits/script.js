"use strict";

var CANVAS, CTX;

var COLOR = "hsl(0, 0%, 90%)";
var N = 15;
var XS = new Float32Array(N);
var YS = new Float32Array(N);
var XS_SPEED = new Float32Array(N);
var YS_SPEED = new Float32Array(N);
var K = 0.025;
var L = 10;

function loop() {
    for (var i = 0; i < N; i++) {
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
    for (var i = 0; i < N; i++) {
        XS[i] += XS_SPEED[i];
        YS[i] += YS_SPEED[i];
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (var i = 0; i < N; i++) {
        var x = XS[i];
        var y = YS[i];
        CTX.moveTo(x, y);
        CTX.lineTo(x - (XS_SPEED[i] * L), y - (YS_SPEED[i] * L));
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = COLOR;
    for (var i = 0; i < N; i++) {
        XS[i] = Math.random() * CANVAS.width;
        YS[i] = Math.random() * CANVAS.height;
        XS_SPEED[i] = 0;
        YS_SPEED[i] = 0;
    }
    CTX.lineWidth = 4;
    loop();
};
