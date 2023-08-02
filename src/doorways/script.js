"use strict";

var TAU = Math.PI * 2;

var COLORS = [
    "hsl(0, 0%, 35%)",
    "hsl(0, 0%, 78.5%)",
    "hsla(0, 0%, 82.5%, 0.75)",
];

var LINE_WIDTH = 3;
var LINE_CAP = "square";

var POINT_RADIUS = 4;

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
        points.push([x + (w / 2), y + (h / 2)]);
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
            if ((lines[i][0][1] !== lines[i][1][1]) ||
                ((lines[i][0][0] !== xK) && (lines[i][1][0] !== xK)))
            {
                continue;
            }
            var yS = lines[i][0][1];
            if ((yS <= start) || (end <= yS) || (0 <= splits.indexOf(yS))) {
                continue;
            }
            splits.push(yS);
        }
        splits.push(start);
        splits.sort(subtract);
        splits.push(end);

        for (var i = 1; i < splits.length; ++i) {
            lines.push([[xK, splits[i - 1]], [xK, splits[i]]]);
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
            if ((lines[i][0][0] !== lines[i][1][0]) ||
                ((lines[i][0][1] !== yK) && (lines[i][1][1] !== yK)))
            {
                continue;
            }
            var xS = lines[i][0][0];
            if ((xS <= start) || (end <= xS) || (0 <= splits.indexOf(xS))) {
                continue;
            }
            splits.push(lines[i][0][0]);
        }
        splits.push(start);
        splits.sort(subtract);
        splits.push(end);

        for (var i = 1; i < splits.length; ++i) {
            lines.push([[splits[i - 1], yK], [splits[i], yK]]);
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
    var x0 = a[0][0] - a[1][0];
    var y0 = a[0][1] - a[1][1];

    var x1 = a[0][0] - b[0][0];
    var y1 = a[0][1] - b[0][1];

    var x2 = b[0][0] - b[1][0];
    var y2 = b[0][1] - b[1][1];

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
        for (var j = 0; j < points.length; ++j) {
            point = [
                lerp(lines[i][0][0], lines[i][1][0], 0.5),
                lerp(lines[i][0][1], lines[i][1][1], 0.5),
            ];
            var line = [
                point,
                points[j],
            ];
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
                lines[i].push(points[j]);
            }
        }
    }

    var walls = [];
    var links = [];
    for (var i = 0; i < lines.length; ++i) {
        var x0 = lines[i][0][0];
        var y0 = lines[i][0][1];
        var x1 = lines[i][1][0];
        var y1 = lines[i][1][1];

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

        point = [lerp(x0, x1, t), lerp(y0, y1, t)];
        points.push(point);

        walls.push([[x0, y0], [lerp(x0, x1, t - m), lerp(y0, y1, t - m)]]);
        walls.push([[lerp(x0, x1, t + m), lerp(y0, y1, t + m)], [x1, y1]]);

        links.push([lines[i], point, flag]);
    }
    return {
        walls: walls,
        links: links,
        points: points,
    };
}

function update(state, flag) {
    state.paths = [];
    for (var i = 0; i < state.links.length; ++i) {
        var line = state.links[i][0];
        var point = state.links[i][1];

        for (var j = 2; j < line.length; ++j) {
            if (flag) {
                var link = state.links[i][2] ? [point[0], line[j][1]]
                                             : [line[j][0], point[1]];
                state.paths.push([point, link]);
                state.paths.push([link, line[j]]);
            } else {
                state.paths.push([point, line[j]]);
            }
        }
    }
}

function draw(canvas, context, state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = COLORS[0];
    context.beginPath();
    for (var i = 0; i < state.walls.length; ++i) {
        context.moveTo(state.walls[i][0][0], state.walls[i][0][1]);
        context.lineTo(state.walls[i][1][0], state.walls[i][1][1]);
    }
    context.stroke();

    context.strokeStyle = COLORS[2];
    context.beginPath();
    for (var i = 0; i < state.paths.length; ++i) {
        context.moveTo(state.paths[i][0][0], state.paths[i][0][1]);
        context.lineTo(state.paths[i][1][0], state.paths[i][1][1]);
    }
    context.stroke();

    context.beginPath();
    for (var i = 0; i < state.points.length; ++i) {
        context.moveTo(state.points[i][0], state.points[i][1]);
        context.arc(state.points[i][0],
                    state.points[i][1],
                    POINT_RADIUS,
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
