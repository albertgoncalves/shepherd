"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var WHITE = "hsl(0, 0%, 90%)";
var GREEN = "hsl(165, 100%, 75%)";
var CYAN = "hsla(175, 65%, 50%, 0.35)";
CTX.imageSmoothingEnabled = false;
CTX.lineWidth = 3;

var PI_2 = Math.PI * 2;
var RADIUS = 6;
var START = 1;
var STOP = 100;
var N, EDGES;
var FRAMES = 30;
var PAD = 20;
var PAD_2 = PAD * 2;
var RESET = FRAMES * (STOP - START + 1);
var ELAPSED = RESET + 1;

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

function insert() {
    var i, candidate, edge, point, points, n;
    while (true) {
        candidate = {
            a: {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
            },
            b: {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
            },
        };
        points = [];
        for (i = 0; i < N; i++) {
            edge = EDGES[i];
            point = pointOfIntersection(candidate, edge);
            if (point !== null) {
                points.push(point);
            }
        }
        n = points.length;
        if (n === 1) {
            EDGES[N] = {
                a: candidate.a,
                b: points[0],
            };
            N += 1;
            return;
        } else if (1 < n) {
            points.sort(function(a, b) {
                return a.x - b.x;
            });
            var j = Math.floor(Math.random() * (n - 1));
            EDGES[N] = {
                a: points[j],
                b: points[j + 1],
            };
            N += 1;
            return;
        }
    }
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

function drawArc(point) {
    CTX.moveTo(point.x + RADIUS, point.y);
    CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
}

function loop() {
    var i;
    if (RESET < ELAPSED) {
        ELAPSED = 0;
        N = START;
        EDGES = new Array(STOP);
        for (i = 0; i < N; i++) {
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
    } else {
        ELAPSED += 1;
        if ((ELAPSED % FRAMES === 0) && (N < STOP)) {
            insert();
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        var rect = boundingBox(EDGES[N - 1]);
        CTX.fillStyle = CYAN;
        CTX.fillRect(rect.x - PAD, rect.y - PAD, rect.width + PAD_2,
                     rect.height + PAD_2);
    }
    var edge;
    var n = N - 1;
    {
        CTX.beginPath();
        for (i = 0; i < n; i++) {
            edge = EDGES[i];
            CTX.moveTo(edge.a.x, edge.a.y);
            CTX.lineTo(edge.b.x, edge.b.y);
        }
        CTX.strokeStyle = WHITE;
        CTX.stroke();
    }
    {
        edge = EDGES[n];
        CTX.beginPath();
        CTX.moveTo(edge.a.x, edge.a.y);
        CTX.lineTo(edge.b.x, edge.b.y);
        CTX.strokeStyle = GREEN;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        drawArc(edge.a);
        drawArc(edge.b);
        CTX.fillStyle = GREEN;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
