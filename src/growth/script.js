"use strict";

var CANVAS, CTX, HALF_WIDTH, HALF_HEIGHT;

var GRAY = "hsl(0, 0%, 35%)";
var CYAN = "hsl(175, 75%, 50%)";
var PI_2 = Math.PI * 2;
var RADIUS = 3;
var START = 10;
var STOP = 200;
var N = STOP + 1;
var THRESHOLD = STOP - 1;
var POINTS;
var SPREAD = 35;
var SEARCH_RADIUS = 65;
var LIMIT = 0.5;
var CUTOFF = 100;
var DRAG_ATTRACT = 5;
var DRAG_REJECT = 10;

function buildTree(points, axis, xLower, xUpper, yLower, yUpper) {
    var n = points.length;
    if (n === 0) {
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
    var point = points[median];
    var tree = {
        point: point,
        axis: axis,
        xLower: xLower,
        xUpper: xUpper,
        yLower: yLower,
        yUpper: yUpper,
    };
    var left = points.slice(0, median);
    var right = points.slice(median + 1);
    if (axis === 0) {
        var next = 1;
        tree.left = buildTree(left, next, xLower, point.x, yLower, yUpper);
        tree.right = buildTree(right, next, point.x, xUpper, yLower, yUpper);
    } else if (axis === 1) {
        var next = 0;
        tree.left = buildTree(left, next, xLower, xUpper, yLower, point.y);
        tree.right = buildTree(right, next, xLower, xUpper, point.y, yUpper);
    }
    return tree;
}

function intersections(tree, circle, callback) {
    if (tree === null) {
        return;
    }
    var x = circle.x - Math.max(tree.xLower, Math.min(circle.x, tree.xUpper));
    var y = circle.y - Math.max(tree.yLower, Math.min(circle.y, tree.yUpper));
    if (((x * x) + (y * y)) < (circle.radius * circle.radius)) {
        callback(tree.point);
        intersections(tree.left, circle, callback);
        intersections(tree.right, circle, callback);
    }
}

function init() {
    N = START;
    POINTS = new Array(STOP);
    for (var i = 0; i < N; ++i) {
        POINTS[i] = {
            angle: Math.random() * PI_2,
            neighbors: [],
        };
    }
    POINTS.sort(function(a, b) {
        return a.angle - b.angle;
    });
    for (var i = 0; i < N; ++i) {
        var point = POINTS[i];
        point.x = (Math.cos(point.angle) * SPREAD) + HALF_WIDTH;
        point.y = (Math.sin(point.angle) * SPREAD) + HALF_HEIGHT;
        point.radius = SEARCH_RADIUS;
    }
    var n = N - 1;
    for (var i = 0; i < N; ++i) {
        var point = POINTS[i];
        point.left = POINTS[i === 0 ? n : i - 1];
        point.right = POINTS[i === n ? 0 : i + 1];
    }
}

function insert() {
    var k = null;
    for (var i = 0; i < N; ++i) {
        var point = POINTS[i];
        if (Math.random() < (LIMIT / N)) {
            var x = point.left.x - point.x;
            var y = point.left.y - point.y;
            if (CUTOFF < ((x * x) + (y * y))) {
                k = i;
                break;
            }
        }
    }
    if (k !== null) {
        var point = POINTS[k];
        var insert = {
            x: (point.left.x + point.x) / 2,
            y: (point.left.y + point.y) / 2,
            radius: SEARCH_RADIUS,
            neighbors: [],
            left: point.left,
            right: point,
        };
        point.left.right = insert;
        point.left = insert;
        POINTS[N] = insert;
        N += 1;
    }
}

function updatePositions() {
    for (var i = 0; i < N; ++i) {
        var point = POINTS[i];
        var x = point.left.x + point.right.x;
        var y = point.left.y + point.right.y;
        point.xNext = point.x + (((x / 2) - point.x) / DRAG_ATTRACT);
        point.yNext = point.y + (((y / 2) - point.y) / DRAG_ATTRACT);
        var n = point.neighbors.length;
        if (0 < n) {
            var rejection = {
                x: 0,
                y: 0,
            };
            for (var j = 0; j < n; ++j) {
                var neighbor = point.neighbors[j];
                rejection.x += point.x - neighbor.x;
                rejection.y += point.y - neighbor.y;
            }
            point.xNext += (rejection.x / n) / DRAG_REJECT;
            point.yNext += (rejection.y / n) / DRAG_REJECT;
        }
    }
    for (var i = 0; i < N; ++i) {
        var point = POINTS[i];
        point.x = point.xNext;
        point.y = point.yNext;
    }
}

function updateNeighbors() {
    var tree =
        buildTree(POINTS.slice(0, N), 0, 0, CANVAS.width, 0, CANVAS.height);
    for (var i = 0; i < N; ++i) {
        var point = POINTS[i];
        point.neighbors = [];
        intersections(tree, point, function(candidate) {
            var x = point.x - candidate.x;
            var y = point.y - candidate.y;
            if ((((x * x) + (y * y)) < (point.radius * point.radius)) &&
                (point !== candidate))
            {
                point.neighbors.push(candidate);
            }
        });
    }
}

function draw() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        CTX.beginPath();
        for (var i = 0; i < N; ++i) {
            var point = POINTS[i];
            var n = point.neighbors.length;
            for (var j = 0; j < n; ++j) {
                var neighbor = point.neighbors[j];
                CTX.moveTo(point.x, point.y);
                CTX.lineTo(neighbor.x, neighbor.y);
            }
        }
        CTX.strokeStyle = CYAN;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        for (var i = 0; i < N; ++i) {
            var point = POINTS[i];
            CTX.moveTo(point.left.x, point.left.y);
            CTX.lineTo(point.x, point.y);
        }
        CTX.strokeStyle = GRAY;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        for (var i = 0; i < N; ++i) {
            var point = POINTS[i];
            CTX.moveTo(point.x + RADIUS, point.y);
            CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
        }
        CTX.fill();
    }
}

function loop() {
    if (THRESHOLD < N) {
        init();
    } else {
        insert();
        updatePositions();
    }
    updateNeighbors();
    draw();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.fillStyle = GRAY;
    CTX.lineWidth = 2;
    HALF_WIDTH = CANVAS.width / 2;
    HALF_HEIGHT = CANVAS.height / 2;
    loop();
};
