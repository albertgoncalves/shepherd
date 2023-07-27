"use strict";

var TAU = Math.PI * 2;

var COLOR = "hsl(0, 0%, 35%)";

var LINE_WIDTH = 2.25;
var POINT_RADIUS = 3;

function Room(x, y, w, h, k) {
    var f = function(c, s, k) {
        return c + (s * ((Math.random() * (1 - k)) + (k / 2)));
    };

    var kW = k / w;
    var kH = k / h;

    var kS = k / 2;

    var x0 = f(x, w, kW);
    var x1 = f(x, w, kW);

    var y0 = f(y, h, kH);
    var y1 = f(y, h, kH);

    var xW = x + w;
    var yH = y + h;

    this.nodes = [
        [x, y],       // 0
        [x0 - kS, y], //
        [x0, y],      //
        [x0 + kS, y], //

        [xW, y],       // 4
        [xW, y0 - kS], //
        [xW, y0],      //
        [xW, y0 + kS], //

        [xW, yH],      // 8
        [x1 + kS, yH], //
        [x1, yH],      //
        [x1 - kS, yH], //

        [x, yH],      // 12
        [x, y1 + kS], //
        [x, y1],      //
        [x, y1 - kS], //

        [x0, y0], // 16
        [x0, y1], //
        [x1, y1], //
        [x1, y0], //
    ];
    this.edges = [
        [0, 1],
        [3, 4],
        //
        [4, 5],
        [7, 8],
        //
        [8, 9],
        [11, 12],
        //
        [12, 13],
        [15, 0],
        //
        [16, 17],
        [17, 18],
        [18, 19],
        [19, 16],
    ];

    if (y0 < y1) {
        this.edges.push([2, 16]);
        this.edges.push([10, 18]);
    } else {
        this.edges.push([2, 17]);
        this.edges.push([10, 19]);
    }

    if (x0 < x1) {
        this.edges.push([6, 19]);
        this.edges.push([14, 17]);
    } else {
        this.edges.push([6, 16]);
        this.edges.push([14, 18]);
    }
}

function update(rooms) {
    for (var i = 0; i < rooms.length; ++i) {
        for (var j = 0; j < rooms[i].nodes.length; ++j) {
            rooms[i].nodes[j][0] += (Math.random() * 0.5) - 0.25;
            rooms[i].nodes[j][1] += (Math.random() * 0.5) - 0.25;
        }
    }
}

function draw(canvas, context, rooms) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    for (var i = 0; i < rooms.length; ++i) {
        for (var j = 0; j < rooms[i].nodes.length; ++j) {
            context.moveTo(rooms[i].nodes[j][0], rooms[i].nodes[j][1]);
            context.arc(rooms[i].nodes[j][0],
                        rooms[i].nodes[j][1],
                        POINT_RADIUS,
                        0,
                        TAU);
        }
    }
    context.fill();

    for (var i = 0; i < rooms.length; ++i) {
        for (var j = 0; j < rooms[i].edges.length; ++j) {
            var a = rooms[i].nodes[rooms[i].edges[j][0]];
            var b = rooms[i].nodes[rooms[i].edges[j][1]];
            context.moveTo(a[0], a[1]);
            context.lineTo(b[0], b[1]);
        }
    }
    context.stroke();
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.strokeStyle = COLOR;
    context.fillStyle = COLOR;
    context.lineWidth = LINE_WIDTH;

    var rooms = [
        new Room(50, 50, 800, 450, 150),
    ];

    var loop = function(now) {
        update(rooms);
        draw(canvas, context, rooms);
        window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);

    console.log("Done!");
};
