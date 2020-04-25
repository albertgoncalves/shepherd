"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var WHITE = "hsl(0, 0%, 90%)";
var GREEN = "hsl(165, 100%, 75%)";
var CYAN = "hsla(175, 65%, 50%, 0.35)";
var RED = "hsl(0, 75%, 70%)";
CTX.imageSmoothingEnabled = false;
CTX.lineWidth = 3;

var PI_2 = Math.PI * 2;
var RADIUS = 8;
var RADIUS_2 = RADIUS * 2;
var N = 10;
var POINTS = new Array(N);
var POINT;
var PAD = 30;
var PAD_2 = PAD * 2;
var MAGNITUDE = 1;
var SCALE = MAGNITUDE / 2;
var RESET = 360;
var ELAPSED = RESET + 1;

function buildTree(points, axis) {
    var n = points.length;
    if (n <= 0) {
        return null;
    }
    if (axis === 0) {
        points.sort(function(a, b) {
            return a.x - b.x;
        });
    } else if (axis === 1) {
        points.sort(function(a, b) {
            return a.y - b.y;
        });
    }
    var median = Math.floor(n / 2);
    var next = axis === 1 ? 0 : 1;
    return {
        point: points[median],
        left: buildTree(points.slice(0, median), next),
        right: buildTree(points.slice(median + 1), next),
        axis: axis,
    };
}

function distanceSquared(a, b) {
    var x = a.x - b.x;
    var y = a.y - b.y;
    return (x * x) + (y * y);
}

function branchDistance(point, a, b) {
    if (a === null) {
        return b;
    } else if (b === null) {
        return a;
    }
    if (distanceSquared(point, a) < distanceSquared(point, b)) {
        return a;
    } else {
        return b;
    }
}

function nearestNeighbor(tree, point) {
    if (tree === null) {
        return null;
    }
    var pointAxis = tree.axis === 0 ? point.x : point.y;
    var treeAxis = tree.axis === 0 ? tree.point.x : tree.point.y;
    var nextBranch, oppositeBranch;
    if (pointAxis < treeAxis) {
        nextBranch = tree.left;
        oppositeBranch = tree.right;
    } else {
        oppositeBranch = tree.left;
        nextBranch = tree.right;
    }
    var best =
        branchDistance(point, nearestNeighbor(nextBranch, point), tree.point);
    var delta = pointAxis - treeAxis;
    if ((delta * delta) < distanceSquared(point, best)) {
        best = branchDistance(point, nearestNeighbor(oppositeBranch, point),
                              best);
    }
    return best;
}

function drawTree(tree, xLower, xUpper, yLower, yUpper) {
    if (tree === null) {
        return;
    } else if (tree.axis === 0) {
        CTX.moveTo(tree.point.x, yLower);
        CTX.lineTo(tree.point.x, yUpper);
        drawTree(tree.left, xLower, tree.point.x, yLower, yUpper);
        drawTree(tree.right, tree.point.x, xUpper, yLower, yUpper);
    } else if (tree.axis === 1) {
        CTX.moveTo(xLower, tree.point.y);
        CTX.lineTo(xUpper, tree.point.y);
        drawTree(tree.left, xLower, xUpper, yLower, tree.point.y);
        drawTree(tree.right, xLower, xUpper, tree.point.y, yUpper);
    }
}

function loop() {
    var i;
    if (RESET < ELAPSED) {
        POINT = {
            x: Math.random() * CANVAS.width,
            y: Math.random() * CANVAS.height,
        };
        for (i = 0; i < N; i++) {
            POINTS[i] = {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
            };
        }
        ELAPSED = 0;
    } else {
        POINT.x += (Math.random() * MAGNITUDE) - SCALE;
        POINT.y += (Math.random() * MAGNITUDE) - SCALE;
        for (i = 0; i < N; i++) {
            POINTS[i].x += (Math.random() * MAGNITUDE) - SCALE;
            POINTS[i].y += (Math.random() * MAGNITUDE) - SCALE;
        }
        ELAPSED += 1;
    }
    var tree = buildTree(POINTS, 0);
    var neighbor = nearestNeighbor(tree, POINT);
    var boundingBox = {
        x: Math.min(POINT.x, neighbor.x),
        y: Math.min(POINT.y, neighbor.y),
    };
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.fillStyle = CYAN;
    CTX.fillRect(boundingBox.x - PAD, boundingBox.y - PAD,
                 (Math.max(POINT.x, neighbor.x) - boundingBox.x) + PAD_2,
                 (Math.max(POINT.y, neighbor.y) - boundingBox.y) + PAD_2);
    {
        CTX.beginPath();
        CTX.moveTo(neighbor.x + RADIUS_2, neighbor.y);
        CTX.arc(neighbor.x, neighbor.y, RADIUS_2, 0, PI_2);
        CTX.fillStyle = RED;
        CTX.fill();
    }
    {
        var point;
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            CTX.moveTo(point.x + RADIUS, point.y);
            CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
        }
        CTX.fillStyle = WHITE;
        CTX.fill();
    }
    {
        CTX.beginPath();
        drawTree(tree, 0, CANVAS.width, 0, CANVAS.height);
        CTX.strokeStyle = WHITE;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        CTX.moveTo(POINT.x + RADIUS, POINT.y);
        CTX.arc(POINT.x, POINT.y, RADIUS, 0, PI_2);
        CTX.fillStyle = GREEN;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

window.onload = loop;
