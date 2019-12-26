/* jshint -W083 */

"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var WHITE = "hsl(0, 0%, 35%)";
var CYAN = "hsl(175, 75%, 50%)";
CTX.imageSmoothingEnabled = false;
CTX.fillStyle = WHITE;
CTX.lineWidth = 2;

var PI_2 = Math.PI * 2;
var RADIUS = 3;
var HALF_WIDTH = CANVAS.width / 2;
var HALF_HEIGHT = CANVAS.height / 2;
var START = 50;
var N, POINTS;
var SPREAD = 10;
var SEARCH_RADIUS = 30;
var DRAG = 10;
var LIMIT = 0.95;
var THRESHOLD = 15;
var RESET = 600;
var ELAPSED = RESET + 1;

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
    var next;
    if (axis === 0) {
        next = 1;
        tree.left = buildTree(left, next, xLower, point.x, yLower, yUpper);
        tree.right = buildTree(right, next, point.x, xUpper, yLower, yUpper);
    } else if (axis === 1) {
        next = 0;
        tree.left = buildTree(left, next, xLower, xUpper, yLower, point.y);
        tree.right = buildTree(right, next, xLower, xUpper, point.y, yUpper);
    }
    return tree;
}

function rectCircleOverlap(rectangle, circle) {
    var xDelta = circle.x -
        Math.max(rectangle.xLower, Math.min(circle.x, rectangle.xUpper));
    var yDelta = circle.y -
        Math.max(rectangle.yLower, Math.min(circle.y, rectangle.yUpper));
    return ((xDelta * xDelta) + (yDelta * yDelta)) <
        (circle.radius * circle.radius);
}

function pointInRadius(point, circle) {
    var xDelta = point.x - circle.x;
    var yDelta = point.y - circle.y;
    return ((xDelta * xDelta) + (yDelta * yDelta)) <
        (circle.radius * circle.radius);
}

function intersections(tree, circle, callback) {
    if (tree === null) {
        return;
    }
    if (rectCircleOverlap(tree, circle)) {
        callback(tree.point);
        intersections(tree.left, circle, callback);
        intersections(tree.right, circle, callback);
    }
}

function threshold(aPoint, bPoint) {
    var x = aPoint.x - bPoint.x;
    var y = aPoint.y - bPoint.y;
    return THRESHOLD < ((x * x) + (y * y));
}

function loop() {
    var i, j, n, point, angle, neighbor;
    if (RESET < ELAPSED) {
        ELAPSED = 0;
        N = START;
        POINTS = new Array(N);
        for (i = 0; i < N; i++) {
            POINTS[i] = {
                angle: Math.random() * PI_2,
            };
        }
        POINTS.sort(function(a, b) {
            return a.angle - b.angle;
        });
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            angle = point.angle;
            point.x = (Math.cos(angle) * SPREAD) + HALF_WIDTH;
            point.y = (Math.sin(angle) * SPREAD) + HALF_HEIGHT;
            point.radius = SEARCH_RADIUS;
        }
        n = N - 1;
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            point.left = POINTS[i === 0 ? n : i - 1];
            point.right = POINTS[i === n ? 0 : i + 1];
        }
    } else {
        ELAPSED += 1;
        var left, right, rejection, insert;
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            left = point.left;
            right = point.right;
            point.x += (((left.x + right.x) / 2) - point.x) / DRAG;
            point.y += (((left.y + right.y) / 2) - point.y) / DRAG;
            n = point.neighbors.length;
            if (0 < n) {
                rejection = {
                    x: 0,
                    y: 0,
                };
                for (j = 0; j < n; j++) {
                    neighbor = point.neighbors[j];
                    rejection.x += point.x - neighbor.x;
                    rejection.y += point.y - neighbor.y;
                }
                point.x += (rejection.x / n) / DRAG;
                point.y += (rejection.y / n) / DRAG;
            }
        }
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            left = point.left;
            if ((Math.random() < (LIMIT / N)) && (threshold(left, point))) {
                insert = {
                    x: (left.x + point.x) / 2,
                    y: (left.y + point.y) / 2,
                    radius: SEARCH_RADIUS,
                    left: left,
                    right: point,
                };
                point.left = insert;
                left.right = insert;
                POINTS.push(insert);
                N += 1;
            }
        }
    }
    var tree = buildTree(POINTS, 0, 0, CANVAS.width, 0, CANVAS.height);
    for (i = 0; i < N; i++) {
        point = POINTS[i];
        point.neighbors = [];
        intersections(tree, point, function(candidate) {
            if (pointInRadius(candidate, point)) {
                if (point !== candidate) {
                    point.neighbors.push(candidate);
                }
            }
        });
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            n = point.neighbors.length;
            for (j = 0; j < n; j++) {
                neighbor = point.neighbors[j];
                CTX.moveTo(point.x, point.y);
                CTX.lineTo(neighbor.x, neighbor.y);
            }
        }
        CTX.strokeStyle = CYAN;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            neighbor = point.left;
            CTX.moveTo(neighbor.x, neighbor.y);
            CTX.lineTo(point.x, point.y);
        }
        CTX.strokeStyle = WHITE;
        CTX.stroke();
    }
    {
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            CTX.moveTo(point.x + RADIUS, point.y);
            CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
        }
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
