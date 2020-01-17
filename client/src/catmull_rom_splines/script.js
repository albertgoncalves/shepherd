"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = "hsl(0, 0%, 35%)";
CTX.fillStyle = "hsla(175, 65%, 50%, 0.35)";
CTX.lineWidth = 4;
CTX.lineCap = "round";

var PI_2 = Math.PI * 2;
var RADIUS = 7;
var POINTS = new Array(N);
var N = 10;
var MAGNITUDE = 1.5;
var CENTER = MAGNITUDE / 2;

for (var i = 0; i < N; i++) {
    POINTS[i] = {
        x: Math.random() * CANVAS.width,
        y: Math.random() * CANVAS.height,
    };
}

/* NOTE:
 * https://qroph.github.io/2018/07/30/smooth-paths-using-catmull-rom-splines.html
 */
var ALPHA = 0.5;
var TENSION = 0;
var RESOLUTION = 100;
var M = N - 3;
var P = RESOLUTION * M;
var Q = P - 1;
var SPLINES = new Array(P);

function distance(pointA, pointB) {
    var x = pointA.x - pointB.x;
    var y = pointA.y - pointB.x;
    return Math.sqrt((x * x) + (y * y));
}

function ptAddPt(pointA, pointB) {
    return {
        x: pointA.x + pointB.x,
        y: pointA.y + pointB.y,
    };
}

function ptSubPt(pointA, pointB) {
    return {
        x: pointA.x - pointB.x,
        y: pointA.y - pointB.y,
    };
}

function ptDivFl(point, float) {
    return {
        x: point.x / float,
        y: point.y / float,
    };
}

function flMulPt(float, point) {
    return {
        x: float * point.x,
        y: float * point.y,
    };
}

function loop() {
    var i, j, x, y;
    for (i = 0; i < N; i++) {
        POINTS[i].x += (Math.random() * MAGNITUDE) - CENTER;
        POINTS[i].y += (Math.random() * MAGNITUDE) - CENTER;
    }
    for (i = 0; i < M; i++) {
        var p0 = POINTS[i];
        var p1 = POINTS[i + 1];
        var p2 = POINTS[i + 2];
        var p3 = POINTS[i + 3];
        var t01 = Math.pow(distance(p0, p1), ALPHA);
        var t12 = Math.pow(distance(p1, p2), ALPHA);
        var t23 = Math.pow(distance(p2, p3), ALPHA);
        var tension = 1 - TENSION;
        var p2SubP1 = ptSubPt(p2, p1);
        var m1 = flMulPt(
            tension,
            ptAddPt(p2SubP1,
                    flMulPt(t12,
                            ptSubPt(ptDivFl(ptSubPt(p1, p0), t01),
                                    ptDivFl(ptSubPt(p2, p0), t01 + t12)))));
        var m2 = flMulPt(
            tension,
            ptAddPt(p2SubP1,
                    flMulPt(t12,
                            ptSubPt(ptDivFl(ptSubPt(p3, p2), t23),
                                    ptDivFl(ptSubPt(p3, p1), t12 + t23)))));
        var p1SubP2 = ptSubPt(p1, p2);
        var sA = ptAddPt(ptAddPt(flMulPt(2, p1SubP2), m1), m2);
        var sB = ptSubPt(ptSubPt(ptSubPt(flMulPt(-3, p1SubP2), m1), m1), m2);
        var sC = m1;
        var sD = p1;
        var t, t2, t3;
        for (j = 0; j < RESOLUTION; j++) {
            t = j / RESOLUTION;
            t2 = t * t;
            t3 = t2 * t;
            SPLINES[j + (i * RESOLUTION)] =
                ptAddPt(ptAddPt(ptAddPt(flMulPt(t3, sA), flMulPt(t2, sB)),
                                flMulPt(t, sC)),
                        sD);
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (i = 0; i < Q; i++) {
        CTX.moveTo(SPLINES[i].x, SPLINES[i].y);
        CTX.lineTo(SPLINES[i + 1].x, SPLINES[i + 1].y);
    }
    CTX.stroke();
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        x = POINTS[i].x;
        y = POINTS[i].y;
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    requestAnimationFrame(loop);
}

loop();
