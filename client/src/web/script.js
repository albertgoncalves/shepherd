"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var WHITE = "hsl(0, 0%, 90%)";
var GREEN = "hsl(165, 100%, 75%)";
var CYAN = "hsla(175, 65%, 50%, 0.35)";
CTX.imageSmoothingEnabled = false;
CTX.lineWidth = 2;

var PI_2 = Math.PI * 2;
var RADIUS = 3;
var START = 2;
var STOP = 400;
var N, M, NODES, EDGES;
var MEMORY = 800;
var THRESHOLD = MEMORY - 3;
var CUTOFF = 100;
var DRAG = 0.0025;
var PAD = 25;
var PAD_2 = PAD * 2;
var FRAMES = 10;
var RESET = FRAMES * (STOP - START + 1);
var ELAPSED = RESET + 1;

function squaredDistance(aPoint, bPoint) {
    var x = aPoint.x - bPoint.x;
    var y = aPoint.y - bPoint.y;
    return (x * x) + (y * y);
}

function pointOfIntersection(aPoint1, aPoint2, bPoint1, bPoint2) {
    var x1 = aPoint1.x;
    var x2 = aPoint2.x;
    var x3 = bPoint1.x;
    var x4 = bPoint2.x;
    var y1 = aPoint1.y;
    var y2 = aPoint2.y;
    var y3 = bPoint1.y;
    var y4 = bPoint2.y;
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
    var i, j, a, b, aNode, bNode, candidate, edge, point, points, n, p, m;
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
            point = pointOfIntersection(candidate.a, candidate.b,
                                        NODES[edge.a], NODES[edge.b]);
            if (point !== null) {
                points.push({
                    coord: point,
                    index: i,
                });
            }
        }
        n = points.length;
        if (n === 1) {
            m = M + 1;
            p = N + 1;
            point = points[0];
            j = point.index;
            edge = EDGES[j];
            a = edge.a;
            b = edge.b;
            NODES[M] = point.coord;
            NODES[m] = candidate.a;
            NODES[M].neighbors = [a, b, m];
            NODES[m].neighbors = [M];
            aNode = NODES[a];
            bNode = NODES[b];
            aNode.neighbors[aNode.neighbors.indexOf(b)] = M;
            bNode.neighbors[bNode.neighbors.indexOf(a)] = M;
            EDGES[j] = {
                a: a,
                b: M,
            };
            EDGES[N] = {
                a: M,
                b: b,
            };
            EDGES[p] = {
                a: m,
                b: M,
            };
            N += 2;
            M += 2;
            return;
        } else if (1 < n) {
            var l, k, c, d, aPoint, bPoint, aEdge, bEdge, cNode, dNode, q;
            points.sort(function(a, b) {
                return a.coord.x - b.coord.x;
            });
            l = Math.floor(Math.random() * (n - 1));
            m = M + 1;
            p = N + 1;
            q = N + 2;
            aPoint = points[l];
            bPoint = points[l + 1];
            j = aPoint.index;
            k = bPoint.index;
            aEdge = EDGES[j];
            bEdge = EDGES[k];
            a = aEdge.a;
            b = aEdge.b;
            c = bEdge.a;
            d = bEdge.b;
            NODES[M] = aPoint.coord;
            NODES[m] = bPoint.coord;
            NODES[M].neighbors = [a, b, m];
            NODES[m].neighbors = [c, d, M];
            aNode = NODES[a];
            bNode = NODES[b];
            cNode = NODES[c];
            dNode = NODES[d];
            aNode.neighbors[aNode.neighbors.indexOf(b)] = M;
            bNode.neighbors[bNode.neighbors.indexOf(a)] = M;
            cNode.neighbors[cNode.neighbors.indexOf(d)] = m;
            dNode.neighbors[dNode.neighbors.indexOf(c)] = m;
            EDGES[j] = {
                a: a,
                b: M,
            };
            EDGES[k] = {
                a: M,
                b: b,
            };
            EDGES[N] = {
                a: c,
                b: m,
            };
            EDGES[p] = {
                a: m,
                b: d,
            };
            EDGES[q] = {
                a: m,
                b: M,
            };
            N += 3;
            M += 2;
            return;
        }
    }
}

function boundingBox(edge) {
    var aEdge = NODES[edge.a];
    var bEdge = NODES[edge.b];
    var rect;
    if (aEdge.x < bEdge.x) {
        rect = {
            x: aEdge.x,
            width: bEdge.x - aEdge.x,
        };
    } else {
        rect = {
            x: bEdge.x,
            width: aEdge.x - bEdge.x,
        };
    }
    if (aEdge.y < bEdge.y) {
        rect.y = aEdge.y;
        rect.height = bEdge.y - aEdge.y;
    } else {
        rect.y = bEdge.y;
        rect.height = aEdge.y - bEdge.y;
    }
    return rect;
}

function drawArc(point) {
    CTX.moveTo(point.x + RADIUS, point.y);
    CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
}

function loop() {
    var i, j, n, edge;
    if ((RESET < ELAPSED) || (THRESHOLD < N) || (THRESHOLD < M)) {
        ELAPSED = 0;
        N = START;
        M = N * 2;
        EDGES = new Array(MEMORY);
        NODES = new Array(MEMORY);
        var k;
        for (i = 0; i < N; i++) {
            j = i * 2;
            k = j + 1;
            NODES[j] = {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
                neighbors: [k],
            };
            NODES[k] = {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
                neighbors: [j],
            };
            EDGES[i] = {
                a: j,
                b: k,
            };
        }
    } else {
        ELAPSED += 1;
        if (ELAPSED % FRAMES === 0) {
            insert();
        }
        var node, neighbor, m, x, y;
        var start = START * 2;
        for (i = start; i < M; i++) {
            node = NODES[i];
            n = node.neighbors.length;
            m = 0;
            x = 0;
            y = 0;
            for (j = 0; j < n; j++) {
                neighbor = NODES[node.neighbors[j]];
                if (CUTOFF < squaredDistance(node, neighbor)) {
                    m += 1;
                    x += node.x - neighbor.x;
                    y += node.y - neighbor.y;
                }
            }
            if (0 < m) {
                node.xNext = node.x - ((x / m) * DRAG);
                node.yNext = node.y - ((y / m) * DRAG);
            } else {
                node.xNext = node.x;
                node.yNext = node.y;
            }
        }
        for (i = start; i < M; i++) {
            node = NODES[i];
            node.x = node.xNext;
            node.y = node.yNext;
        }
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        var rect = boundingBox(EDGES[N - 1]);
        CTX.fillStyle = CYAN;
        CTX.fillRect(rect.x - PAD, rect.y - PAD, rect.width + PAD_2,
                     rect.height + PAD_2);
    }
    n = N - 1;
    {
        CTX.beginPath();
        for (i = 0; i < n; i++) {
            edge = EDGES[i];
            CTX.moveTo(NODES[edge.a].x, NODES[edge.a].y);
            CTX.lineTo(NODES[edge.b].x, NODES[edge.b].y);
        }
        CTX.strokeStyle = WHITE;
        CTX.stroke();
    }
    {
        edge = EDGES[n];
        CTX.beginPath();
        CTX.moveTo(NODES[edge.a].x, NODES[edge.a].y);
        CTX.lineTo(NODES[edge.b].x, NODES[edge.b].y);
        CTX.strokeStyle = GREEN;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        drawArc(NODES[edge.a]);
        drawArc(NODES[edge.b]);
        CTX.fillStyle = GREEN;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
