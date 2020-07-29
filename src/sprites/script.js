"use strict";

var SPRITE_COLS = 6;
var SPRITE_WIDTH = 24;
var SPRITE_HEIGHT = 16;
var SPRITE_OFFSET_IDLE = SPRITE_WIDTH * 3;
var SPRITE_OFFSET_RUNNING = SPRITE_HEIGHT * 2;
var KEY_CODE = 74;
var FRAME_SPEED = 72.0;

function update(sprite, t) {
    sprite.index = (Math.floor(t / FRAME_SPEED) % SPRITE_COLS) * SPRITE_WIDTH;
}

function draw(ctx, sprite) {
    ctx.clearRect(sprite.position.x,
                  sprite.position.y,
                  SPRITE_WIDTH,
                  SPRITE_HEIGHT);
    if (sprite.running) {
        ctx.drawImage(sprite.frames,
                      sprite.index,
                      SPRITE_OFFSET_RUNNING,
                      SPRITE_WIDTH,
                      SPRITE_HEIGHT,
                      sprite.position.x,
                      sprite.position.y,
                      SPRITE_WIDTH,
                      SPRITE_HEIGHT);
    } else {
        ctx.drawImage(sprite.frames,
                      SPRITE_OFFSET_IDLE,
                      0,
                      SPRITE_WIDTH,
                      SPRITE_HEIGHT,
                      sprite.position.x,
                      sprite.position.y,
                      SPRITE_WIDTH,
                      SPRITE_HEIGHT);
    }
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    var sprite = {
        frames: document.getElementById("sprites"),
        position: {
            x: Math.floor((canvas.width / 2) - (SPRITE_WIDTH / 2)),
            y: Math.floor((canvas.height / 2) - (SPRITE_HEIGHT / 2)),
        },
        running: false,
        index: 0,
    };
    window.addEventListener("keydown", function(event) {
        if (event.keyCode === KEY_CODE) {
            sprite.running = true;
        }
    });
    window.addEventListener("keyup", function(event) {
        if (event.keyCode === KEY_CODE) {
            sprite.running = false;
        }
    });
    function loop(t) {
        update(sprite, t);
        draw(ctx, sprite);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    console.log("Done!");
};
