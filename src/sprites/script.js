"use strict";

function update(sprite, t) {
    if (sprite.running) {
        sprite.index = (Math.floor(t / 72) % sprite.cols) * sprite.width;
    }
}

function draw(canvas, ctx, sprite) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (sprite.running) {
        ctx.drawImage(sprite.frames,
                      sprite.index,
                      sprite.offsetRunning,
                      sprite.width,
                      sprite.height,
                      sprite.position.x,
                      sprite.position.y,
                      sprite.width,
                      sprite.height);
    } else {
        ctx.drawImage(sprite.frames,
                      sprite.offsetIdle,
                      0,
                      sprite.width,
                      sprite.height,
                      sprite.position.x,
                      sprite.position.y,
                      sprite.width,
                      sprite.height);
    }
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    var sprite = {
        frames: document.getElementById("sprites"),
        cols: 6,
        rows: 3,
        width: 24,
        height: 16,
        offsetIdle: undefined,
        offsetRunning: undefined,
        position: {
            x: undefined,
            y: undefined,
        },
        running: false,
        index: 0,
    };
    sprite.offsetIdle = sprite.width * 3;
    sprite.offsetRunning = sprite.height * 2;
    sprite.position.x = Math.floor((canvas.width / 2) - (sprite.width / 2));
    sprite.position.y = Math.floor((canvas.height / 2) - (sprite.height / 2));
    window.addEventListener("keydown", function(event) {
        if (event.keyCode === 74) {
            sprite.running = true;
        }
    });
    window.addEventListener("keyup", function(event) {
        if (event.keyCode === 74) {
            sprite.running = false;
        }
    });
    function loop(t) {
        update(sprite, t);
        draw(canvas, ctx, sprite);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    console.log("Done!");
};
