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
var N = 10;
var M = N - 1;
var POINTS = new Array(N);
var DISTANCES = new Array(M);
var MAGNITUDE = 1.5;
var CENTER = MAGNITUDE / 2;
var RESET = 300;
var ELAPSED = RESET + 1;

var ALPHA = 0.15;
var TENSION = 0;
var INVERSE_TENSION = 1 - TENSION;
var RESOLUTION = 100;
var R = N - 3;
var P = RESOLUTION * R;
var Q = P - 1;
var SPLINES = new Array(P);
var TS = new Array(RESOLUTION);
var OFFSETS = new Array(R);

for (var i = 0; i < RESOLUTION; i++) {
    var t = i / RESOLUTION;
    var t2 = t * t;
    TS[i] = {
        t: t,
        t2: t2,
        t3: t2 * t,
    };
}

for (var i = 0; i < R; i++) {
    OFFSETS[i] = i * RESOLUTION;
}

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

function ptMulFl(point, float) {
    return {
        x: point.x * float,
        y: point.y * float,
    };
}

function ptDivFl(point, float) {
    return {
        x: point.x / float,
        y: point.y / float,
    };
}

function updateSplines() {
    var i;
    for (i = 0; i < M; i++) {
        DISTANCES[i] = Math.pow(distance(POINTS[i], POINTS[i + 1]), ALPHA);
    }
    for (i = 0; i < R; i++) {
        var p0 = POINTS[i];
        var p1 = POINTS[i + 1];
        var p2 = POINTS[i + 2];
        var p3 = POINTS[i + 3];
        var d01 = DISTANCES[i];
        var d12 = DISTANCES[i + 1];
        var d23 = DISTANCES[i + 2];
        var p2SubP1 = ptSubPt(p2, p1);
        var m1 = ptMulFl(
            ptAddPt(p2SubP1,
                    ptMulFl(ptSubPt(ptDivFl(ptSubPt(p1, p0), d01),
                                    ptDivFl(ptSubPt(p2, p0), d01 + d12)),
                            d12)),
            INVERSE_TENSION);
        var m2 = ptMulFl(
            ptAddPt(p2SubP1,
                    ptMulFl(ptSubPt(ptDivFl(ptSubPt(p3, p2), d23),
                                    ptDivFl(ptSubPt(p3, p1), d12 + d23)),
                            d12)),
            INVERSE_TENSION);
        var p1SubP2 = ptSubPt(p1, p2);
        var sA = ptAddPt(ptAddPt(ptMulFl(p1SubP2, 2), m1), m2);
        var sB = ptSubPt(ptSubPt(ptSubPt(ptMulFl(p1SubP2, -3), m1), m1), m2);
        for (var j = 0; j < RESOLUTION; j++) {
            SPLINES[j + OFFSETS[i]] = ptAddPt(
                ptAddPt(ptAddPt(ptMulFl(sA, TS[j].t3), ptMulFl(sB, TS[j].t2)),
                        ptMulFl(m1, TS[j].t)),
                p1);
        }
    }
}

function loop() {
    var i;
    if (RESET < ELAPSED) {
        for (i = 0; i < N; i++) {
            POINTS[i] = {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
            };
        }
        ELAPSED = 0;
    } else {
        for (i = 0; i < N; i++) {
            POINTS[i].x += (Math.random() * MAGNITUDE) - CENTER;
            POINTS[i].y += (Math.random() * MAGNITUDE) - CENTER;
        }
        ELAPSED += 1;
    }
    updateSplines();
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.beginPath();
    for (i = 0; i < Q; i++) {
        CTX.moveTo(SPLINES[i].x, SPLINES[i].y);
        CTX.lineTo(SPLINES[i + 1].x, SPLINES[i + 1].y);
    }
    CTX.stroke();
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        var x = POINTS[i].x;
        var y = POINTS[i].y;
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    requestAnimationFrame(loop);
}

window.onload = loop;
