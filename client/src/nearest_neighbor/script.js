"use strict";

function distanceSquared(a, b) {
    var x, y;
    x = a.x - b.x;
    y = a.y - b.y;
    return (x * x) + (y * y);
}

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var WHITE = "hsl(0, 0%, 90%)";
var RED = "hsl(0, 75%, 70%)";
CTX.imageSmoothingEnabled = false;
CTX.lineWidth = 3;

function randomPoint() {
    return {
        x: Math.random() * CANVAS.width,
        y: Math.random() * CANVAS.height,
    };
}

var PI_2 = Math.PI * 2;
var RADIUS = 8;
var N = 10;
var POINTS = new Array(N);
var POINT;

function order(axis) {
    if (axis === 0) {
        return function(a, b) {
            return a.x - b.x;
        };
    } else if (axis === 1) {
        return function(a, b) {
            return a.y - b.y;
        };
    }
}

function buildTree(points, axis) {
    var n, median, next;
    n = points.length;
    if (n <= 0) {
        return null;
    }
    points.sort(order(axis));
    median = Math.floor(n / 2);
    next = axis === 1 ? 0 : 1;
    return {
        point: points[median],
        left: buildTree(points.slice(0, median), next),
        right: buildTree(points.slice(median + 1), next),
        axis: axis,
    };
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
    var pointAxis, treeAxis, nextBranch, oppositeBranch, best, delta;
    if (tree === null) {
        return null;
    }
    pointAxis = tree.axis === 0 ? point.x : point.y;
    treeAxis = tree.axis === 0 ? tree.point.x : tree.point.y;
    if (pointAxis < treeAxis) {
        nextBranch = tree.left;
        oppositeBranch = tree.right;
    } else {
        oppositeBranch = tree.left;
        nextBranch = tree.right;
    }
    best =
        branchDistance(point, nearestNeighbor(nextBranch, point), tree.point);
    delta = pointAxis - treeAxis;
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

var MAGNITUDE = 1;
var SCALE = MAGNITUDE / 2;
var RESET = 360;
var ELAPSED = RESET + 1;

function drawCircle(point) {
    var x, y;
    x = point.x;
    y = point.y;
    CTX.moveTo(x + RADIUS, y);
    CTX.arc(x, y, RADIUS, 0, PI_2);
}

function loop() {
    var i, x, y, tree, neighbor;
    if (RESET < ELAPSED) {
        ELAPSED = 0;
        POINT = randomPoint();
        for (i = 0; i < N; i++) {
            POINTS[i] = randomPoint();
        }
    } else {
        ELAPSED += 1;
    }
    POINT.x += (Math.random() * MAGNITUDE) - SCALE;
    POINT.y += (Math.random() * MAGNITUDE) - SCALE;
    for (i = 0; i < N; i++) {
        POINTS[i].x += (Math.random() * MAGNITUDE) - SCALE;
        POINTS[i].y += (Math.random() * MAGNITUDE) - SCALE;
    }
    tree = buildTree(POINTS, 0);
    neighbor = nearestNeighbor(tree, POINT);
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        CTX.beginPath();
        drawTree(tree, 0, CANVAS.width, 0, CANVAS.height);
        CTX.strokeStyle = WHITE;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        CTX.moveTo(POINT.x, POINT.y);
        CTX.lineTo(neighbor.x, neighbor.y);
        CTX.strokeStyle = RED;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            drawCircle(POINTS[i]);
        }
        CTX.fillStyle = WHITE;
        CTX.fill();
    }
    {
        CTX.beginPath();
        drawCircle(POINT);
        CTX.fillStyle = RED;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
