"use strict";

var TAU = Math.PI * 2;

var COLORS = [
    "hsl(0, 0%, 35%)",
    "hsl(0, 0%, 78.5%)",
    "hsla(0, 0%, 82.5%, 0.75)",
];

var LINE_WIDTH = 3;
var LINE_CAP = "square";

var POINT_RADIUS = 2;

var THRESHOLD_SPLIT = 80;
var THRESHOLD_WALL = THRESHOLD_SPLIT * 1.15;

var INTERVAL = 10000;

var X = 10;
var Y = 10;

function subtract(a, b) {
    return a - b;
}

function split(lines, points, x, y, w, h, flag) {
    if (Math.min(w, h) <= (THRESHOLD_SPLIT * 2)) {
        points.push({x: x + (w / 2), y: y + (h / 2)});
        return;
    }

    var start, end;
    var splits = [];
    if (flag) {
        var k =
            Math.min(Math.max(Math.round(Math.random() * w), THRESHOLD_SPLIT),
                     w - THRESHOLD_SPLIT);
        var xK = x + k;
        split(lines, points, x, y, k, h, false);
        split(lines, points, xK, y, w - k, h, false);

        start = y;
        end = y + h;
        for (var i = 0; i < lines.length; ++i) {
            if ((lines[i].a.y !== lines[i].b.y) ||
                ((lines[i].a.x !== xK) && (lines[i].b.x !== xK)))
            {
                continue;
            }
            var yS = lines[i].a.y;
            if ((yS <= start) || (end <= yS) || (0 <= splits.indexOf(yS))) {
                continue;
            }
            splits.push(yS);
        }
        splits.push(start);
        splits.sort(subtract);
        splits.push(end);

        for (var i = 1; i < splits.length; ++i) {
            lines.push({
                a: {x: xK, y: splits[i - 1]},
                b: {x: xK, y: splits[i]},
            });
        }
    } else {
        var k =
            Math.min(Math.max(Math.round(Math.random() * h), THRESHOLD_SPLIT),
                     h - THRESHOLD_SPLIT);
        var yK = y + k;
        split(lines, points, x, y, w, k, true);
        split(lines, points, x, yK, w, h - k, true);

        start = x;
        end = x + w;
        for (var i = 0; i < lines.length; ++i) {
            if ((lines[i].a.x !== lines[i].b.x) ||
                ((lines[i].a.y !== yK) && (lines[i].b.y !== yK)))
            {
                continue;
            }
            var xS = lines[i].a.x;
            if ((xS <= start) || (end <= xS) || (0 <= splits.indexOf(xS))) {
                continue;
            }
            splits.push(xS);
        }
        splits.push(start);
        splits.sort(subtract);
        splits.push(end);

        for (var i = 1; i < splits.length; ++i) {
            lines.push({
                a: {x: splits[i - 1], y: yK},
                b: {x: splits[i], y: yK},
            });
        }
    }
}

function lerp(a, b, t) {
    return a + ((b - a) * t);
}

function len(x0, y0, x1, y1) {
    var x2 = x1 - x0;
    var y2 = y1 - y0;
    return Math.sqrt((x2 * x2) + (y2 * y2));
}

function intersects(a, b) {
    var x0 = a.a.x - a.b.x;
    var y0 = a.a.y - a.b.y;

    var x1 = a.a.x - b.a.x;
    var y1 = a.a.y - b.a.y;

    var x2 = b.a.x - b.b.x;
    var y2 = b.a.y - b.b.y;

    var denominator = (x0 * y2) - (y0 * x2);
    if (denominator !== 0) {
        var t = ((x1 * y2) - (y1 * x2)) / denominator;
        var u = -((x0 * y1) - (y0 * x1)) / denominator;
        return (0 <= t) && (t <= 1) && (0 <= u) && (u <= 1);
    }
    return false;
}

function init(canvas) {
    var lines = [];
    var points = [];
    split(lines,
          points,
          X,
          Y,
          canvas.width - (X * 2),
          canvas.height - (Y * 2),
          true);

    var point;
    for (var i = 0; i < lines.length; ++i) {
        lines[i].neighbors = [];
        for (var j = 0; j < points.length; ++j) {
            point = {
                x: lerp(lines[i].a.x, lines[i].b.x, 0.5),
                y: lerp(lines[i].a.y, lines[i].b.y, 0.5),
            };
            var line = {a: point, b: points[j]};
            var ok = true;
            for (var k = 0; k < lines.length; ++k) {
                if (i === k) {
                    continue;
                }
                if (intersects(line, lines[k])) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                lines[i].neighbors.push(points[j]);
            }
        }
    }

    var walls = [];
    var links = [];
    for (var i = 0; i < lines.length; ++i) {
        var x0 = lines[i].a.x;
        var y0 = lines[i].a.y;
        var x1 = lines[i].b.x;
        var y1 = lines[i].b.y;

        var flag;
        if (x0 === x1) {
            flag = false;
        } else if (y0 === y1) {
            flag = true;
        } else {
            throw new Error();
        }

        var l = len(x0, y0, x1, y1);

        if (l < THRESHOLD_WALL) {
            walls.push(lines[i]);
            continue;
        }

        var k = THRESHOLD_SPLIT / l;
        var t = ((1 - k) * Math.random()) + (k / 2);
        var m = k / 2;

        point = {x: lerp(x0, x1, t), y: lerp(y0, y1, t)};
        points.push(point);

        walls.push({
            a: {x: x0, y: y0},
            b: {x: lerp(x0, x1, t - m), y: lerp(y0, y1, t - m)},
        });
        walls.push({
            a: {x: lerp(x0, x1, t + m), y: lerp(y0, y1, t + m)},
            b: {x: x1, y: y1},
        });

        links.push({
            point: point,
            neighbors: lines[i].neighbors,
            flag: flag,
        });
    }
    return {
        walls: walls,
        links: links,
        points: points,
    };
}

function update(state, flag) {
    var neighbors, point;

    state.paths = [];
    for (var i = 0; i < state.links.length; ++i) {
        neighbors = state.links[i].neighbors;
        point = state.links[i].point;

        for (var j = 0; j < neighbors.length; ++j) {
            if (flag) {
                var link = state.links[i].flag
                    ? {x: point.x, y: neighbors[j].y}
                    : {x: neighbors[j].x, y: point.y};
                state.paths.push({a: point, b: link});
                state.paths.push({a: link, b: neighbors[j]});
            } else {
                state.paths.push({a: point, b: neighbors[j]});
            }
        }
    }

    state.graph = [];
    for (var i = 0; i < state.links.length; ++i) {
        neighbors = state.links[i].neighbors;
        point = state.links[i].point;

        state.graph.push([]);

        for (var j = 0; j < neighbors.length; ++j) {
            for (var k = 0; k < state.links.length; ++k) {
                if (i === k) {
                    continue;
                }
                // NOTE: We're lucky we're passing a pointer around. If we were
                // making a copy of the object `indexOf` wouldn't work here.
                if (state.links[k].neighbors.indexOf(neighbors[j]) < 0) {
                    continue;
                }
                state.graph[i].push({
                    through: neighbors[j],
                    destination: k,
                });
            }
        }
    }
}

function draw(canvas, context, state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = COLORS[0];
    context.beginPath();
    for (var i = 0; i < state.walls.length; ++i) {
        context.moveTo(state.walls[i].a.x, state.walls[i].a.y);
        context.lineTo(state.walls[i].b.x, state.walls[i].b.y);
    }
    context.stroke();

    context.strokeStyle = COLORS[2];
    context.beginPath();
    for (var i = 0; i < state.paths.length; ++i) {
        context.moveTo(state.paths[i].a.x, state.paths[i].a.y);
        context.lineTo(state.paths[i].b.x, state.paths[i].b.y);
    }
    context.stroke();

    context.beginPath();
    for (var i = 0; i < state.links.length; ++i) {
        var size = state.graph[i].length;
        context.moveTo(state.links[i].point.x, state.links[i].point.y);
        context.arc(state.links[i].point.x,
                    state.links[i].point.y,
                    (POINT_RADIUS * size) + 2,
                    0,
                    TAU);
    }
    context.fill();
}

function check(state) {
    for (var i = 0; i < state.paths.length; ++i) {
        for (var j = 0; j < state.walls.length; ++j) {
            if (intersects(state.paths[i], state.walls[j])) {
                throw new Error();
            }
        }
    }
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    if (canvas === null) {
        throw new Error();
    }
    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.lineWidth = LINE_WIDTH;
    context.lineCap = LINE_CAP;
    context.fillStyle = COLORS[1];

    var flag = document.getElementById("flag");
    if (flag === null) {
        throw new Error();
    }

    var state = init(canvas);
    update(state, flag.checked);
    draw(canvas, context, state);
    check(state);

    flag.addEventListener("change", function() {
        update(state, this.checked);
        draw(canvas, context, state);
        check(state);
    });

    var prev = performance.now();
    var loop = function(now) {
        if (INTERVAL <= (now - prev)) {
            state = init(canvas);
            update(state, flag.checked);
            draw(canvas, context, state);
            check(state);
            prev = now;
        }
        window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);

    console.log("Done!");
};
