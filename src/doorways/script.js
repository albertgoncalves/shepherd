"use strict";

var TAU = Math.PI * 2;

var COLOR = "hsl(0, 0%, 35%)";

var LINE_WIDTH = 2.5;
var POINT_RADIUS = 3.5;

function Point(x, y) {
    this.x = x;
    this.y = y;
    this.equals = function(other) {
        return (this.x === other.x) && (this.y === other.y);
    };
    this.lerp = function(other, t) {
        return new Point(this.x + ((other.x - this.x) * t),
                         this.y + ((other.y - this.y) * t));
    };
}

function Line(x0, y0, x1, y1) {
    this.a = new Point(x0, y0);
    this.b = new Point(x1, y1);
    this.equals = function(other) {
        return this.a.equals(other.a) && this.b.equals(other.b);
    };
}

function Rect(x, y, w, h) {
    this.points = [
        new Point(x, y),
        new Point(x + w, y),
        new Point(x, y + h),
        new Point(x + w, y + h),
    ];
    this.lines = [
        new Line(x, y, x + w, y),
        new Line(x + w, y, x + w, y + h),
        new Line(x + w, y + h, x, y + h),
        new Line(x, y + h, x, y),
    ];
}

function Room(x, y, w, h, k) {
    this.rect = new Rect(x, y, w, h);
    this.points = [];
    this.lines = [];

    for (var i = 0; i < this.rect.lines.length; ++i) {
        var splits = splitAt(this.rect.lines[i], Math.random(), k);

        this.points.push(splits[1].a.lerp(splits[1].b, 0.5));

        this.lines.push(splits[0]);
        this.lines.push(splits[2]);
    }

    var n;
    if (Math.random() < 0.5) {
        this.points.sort(function(a, b) {
            return a.x - b.x;
        });
        this.lines.push(new Line(this.points[0].x,
                                 this.points[0].y,
                                 this.points[2].x,
                                 this.points[0].y));
        this.lines.push(new Line(this.points[1].x,
                                 this.points[1].y,
                                 this.points[1].x,
                                 this.points[0].y));
        this.lines.push(new Line(this.points[2].x,
                                 this.points[0].y,
                                 this.points[2].x,
                                 this.points[2].y));

        n = this.lines.length;
        var y0, y1;
        if (this.lines[n - 2].a.y <= this.lines[n - 2].b.y) {
            y0 = this.lines[n - 2].a.y;
            y1 = this.lines[n - 2].b.y;
        } else {
            y0 = this.lines[n - 2].b.y;
            y1 = this.lines[n - 2].a.y;
        }

        if ((this.points[3].y <= y1) && (y0 <= this.points[3].y)) {
            this.lines.push(new Line(this.lines[n - 2].a.x,
                                     this.points[3].y,
                                     this.points[3].x,
                                     this.points[3].y));
        } else {
            this.lines.push(new Line(this.lines[n - 1].a.x,
                                     this.points[3].y,
                                     this.points[3].x,
                                     this.points[3].y));
        }
    } else {
        this.points.sort(function(a, b) {
            return a.y - b.y;
        });

        this.lines.push(new Line(this.points[0].x,
                                 this.points[0].y,
                                 this.points[0].x,
                                 this.points[2].y));
        this.lines.push(new Line(this.points[1].x,
                                 this.points[1].y,
                                 this.points[0].x,
                                 this.points[1].y));
        this.lines.push(new Line(this.points[0].x,
                                 this.points[2].y,
                                 this.points[2].x,
                                 this.points[2].y));

        n = this.lines.length;
        var x0, x1;
        if (this.lines[n - 2].a.x <= this.lines[n - 2].b.x) {
            x0 = this.lines[n - 2].a.x;
            x1 = this.lines[n - 2].b.x;
        } else {
            x0 = this.lines[n - 2].b.x;
            x1 = this.lines[n - 2].a.x;
        }

        if ((this.points[3].x <= x1) && (x0 <= this.points[3].x)) {
            this.lines.push(new Line(this.points[3].x,
                                     this.lines[n - 2].a.y,
                                     this.points[3].x,
                                     this.points[3].y));
        } else {
            this.lines.push(new Line(this.points[3].x,
                                     this.lines[n - 1].a.y,
                                     this.points[3].x,
                                     this.points[3].y));
        }
    }

    n = this.lines.length;
    for (var i = 0; i < 4; ++i) {
        this.points.push(new Point(this.lines[n - (4 - i)].a.x,
                                   this.lines[n - (4 - i)].a.y));
        this.points.push(new Point(this.lines[n - (4 - i)].b.x,
                                   this.lines[n - (4 - i)].b.y));
    }

    this.points = unique(this.points);
    this.lines = unique(this.lines);
}

function contains(array, x) {
    for (var i = 0; i < array.length; ++i) {
        if (array[i].equals(x)) {
            return true;
        }
    }
    return false;
}

function unique(a) {
    var b = [];
    for (var i = 0; i < a.length; ++i) {
        if (contains(b, a[i])) {
            continue;
        }
        b.push(a[i]);
    }
    return b;
}

function draw(canvas, context, rooms) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    for (var j = 0; j < rooms.length; ++j) {
        for (var i = 0; i < rooms[j].points.length; ++i) {
            context.moveTo(rooms[j].points[i].x, rooms[j].points[i].y);
            context.arc(rooms[j].points[i].x,
                        rooms[j].points[i].y,
                        POINT_RADIUS,
                        0,
                        TAU);
        }
        context.fill();

        for (var i = 0; i < rooms[j].lines.length; ++i) {
            context.moveTo(rooms[j].lines[i].a.x, rooms[j].lines[i].a.y);
            context.lineTo(rooms[j].lines[i].b.x, rooms[j].lines[i].b.y);
        }
    }
    context.stroke();
}

function splitAt(line, t, k) {
    if (line.a.x === line.b.x) {
        if (Math.abs(line.b.y - line.a.y) < (k * 2)) {
            throw new Error();
        }

        var x = line.a.x;
        var y = line.a.y + ((line.b.y - line.a.y) * t);

        var a = Math.min(line.a.y, line.b.y);
        var b = Math.max(line.a.y, line.b.y);

        if ((y - k) < a) {
            y += a - (y - k);
        }
        if (b < (y + k)) {
            y -= (y + k) - b;
        }

        return [
            new Line(x, a, x, y - k),
            new Line(x, y - k, x, y + k),
            new Line(x, y + k, x, b),
        ];
    } else if (line.a.y === line.b.y) {
        if (Math.abs(line.b.x - line.a.x) < (k * 2)) {
            throw new Error();
        }

        var x = line.a.x + ((line.b.x - line.a.x) * t);
        var y = line.a.y;

        var a = Math.min(line.a.x, line.b.x);
        var b = Math.max(line.a.x, line.b.x);

        if ((x - k) < a) {
            x += a - (x - k);
        }
        if (b < (x + k)) {
            x -= (x + k) - b;
        }

        return [
            new Line(a, y, x - k, y),
            new Line(x - k, y, x + k, y),
            new Line(x + k, y, b, y),
        ];
    }
    throw new Error();
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.strokeStyle = COLOR;
    context.fillStyle = COLOR;
    context.lineWidth = LINE_WIDTH;

    var rooms = [
        new Room(50, 50, 800, 450, 50),
    ];

    var loop = function(now) {
        draw(canvas, context, rooms);
        // window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);

    console.log("Done!");
};
