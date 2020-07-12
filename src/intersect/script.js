"use strict";

var CANVAS, CTX;

var WHITE = "hsl(0, 0%, 90%)";
var CYAN = "hsla(175, 65%, 50%, 0.35)";
var RED = "hsl(0, 75%, 70%)";
var PI_2 = Math.PI * 2;
var RADIUS = 6;
var N = 10;
var EDGES = new Array(N);
var CANDIDATE;
var PAD = 20;
var PAD_2 = PAD * 2;
var MAGNITUDE = 0.5;
var CENTER = MAGNITUDE / 2;
var RESET = 240;
var ELAPSED = RESET + 1;

function randomLerp(aPoint, bPoint) {
    var weight = Math.random();
    return {
        x: aPoint.x + (weight * (bPoint.x - aPoint.x)),
        y: aPoint.y + (weight * (bPoint.y - aPoint.y)),
    };
}

function drawEdge(edge) {
    CTX.moveTo(edge.a.x, edge.a.y);
    CTX.lineTo(edge.b.x, edge.b.y);
}

function drawArc(point) {
    CTX.moveTo(point.x + RADIUS, point.y);
    CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
}

function boundingBox(edge) {
    var rect;
    if (edge.a.x < edge.b.x) {
        rect = {
            x: edge.a.x,
            width: edge.b.x - edge.a.x,
        };
    } else {
        rect = {
            x: edge.b.x,
            width: edge.a.x - edge.b.x,
        };
    }
    if (edge.a.y < edge.b.y) {
        rect.y = edge.a.y;
        rect.height = edge.b.y - edge.a.y;
    } else {
        rect.y = edge.b.y;
        rect.height = edge.a.y - edge.b.y;
    }
    return rect;
}

function pointOfIntersection(aEdge, bEdge) {
    var x1 = aEdge.a.x;
    var x2 = aEdge.b.x;
    var x3 = bEdge.a.x;
    var x4 = bEdge.b.x;
    var y1 = aEdge.a.y;
    var y2 = aEdge.b.y;
    var y3 = bEdge.a.y;
    var y4 = bEdge.b.y;
    var denominator = ((x1 - x2) * (y3 - y4)) - ((y1 - y2) * (x3 - x4));
    if (denominator !== 0.0) {
        var t =
            (((x1 - x3) * (y3 - y4)) - ((y1 - y3) * (x3 - x4))) / denominator;
        var u =
            -(((x1 - x2) * (y1 - y3)) - ((y1 - y2) * (x1 - x3))) / denominator;
        if ((0.0 <= t) && (t <= 1.0) && (0.0 <= u) && (u <= 1.0)) {
            return {
                x: x1 + (t * (x2 - x1)),
                y: y1 + (t * (y2 - y1)),
            };
        }
    }
    return null;
}

function loop() {
    if (RESET < ELAPSED) {
        for (var i = 0; i < N; ++i) {
            EDGES[i] = {
                a: {
                    x: Math.random() * CANVAS.width,
                    y: Math.random() * CANVAS.height,
                },
                b: {
                    x: Math.random() * CANVAS.width,
                    y: Math.random() * CANVAS.height,
                },
            };
        }
        CANDIDATE = {
            a: randomLerp(EDGES[0].a, EDGES[0].b),
            b: randomLerp(EDGES[1].a, EDGES[1].b),
        };
        ELAPSED = 0;
    } else {
        for (var i = 0; i < N; ++i) {
            var edge = EDGES[i];
            edge.a.x += (Math.random() * MAGNITUDE) - CENTER;
            edge.a.y += (Math.random() * MAGNITUDE) - CENTER;
            edge.b.x += (Math.random() * MAGNITUDE) - CENTER;
            edge.b.y += (Math.random() * MAGNITUDE) - CENTER;
        }
        CANDIDATE.a.x += (Math.random() * MAGNITUDE) - CENTER;
        CANDIDATE.a.y += (Math.random() * MAGNITUDE) - CENTER;
        CANDIDATE.b.x += (Math.random() * MAGNITUDE) - CENTER;
        CANDIDATE.b.y += (Math.random() * MAGNITUDE) - CENTER;
        ELAPSED += 1;
    }
    var points = [];
    for (var i = 0; i < N; ++i) {
        var edge = EDGES[i];
        var point = pointOfIntersection(CANDIDATE, edge);
        if (point !== null) {
            points.push(point);
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        var rect = boundingBox(CANDIDATE);
        CTX.fillStyle = CYAN;
        CTX.fillRect(rect.x - PAD,
                     rect.y - PAD,
                     rect.width + PAD_2,
                     rect.height + PAD_2);
    }
    {
        CTX.beginPath();
        for (var i = 0; i < N; ++i) {
            drawEdge(EDGES[i]);
        }
        CTX.strokeStyle = WHITE;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        drawEdge(CANDIDATE);
        CTX.strokeStyle = RED;
        CTX.stroke();
    }
    {
        var n = points.length;
        CTX.beginPath();
        for (var i = 0; i < n; ++i) {
            drawArc(points[i]);
        }
        CTX.fillStyle = WHITE;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.fillStyle = WHITE;
    CTX.lineWidth = 3;
    loop();
};
