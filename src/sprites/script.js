"use strict";

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    var spriteSheet = document.getElementById("sprites");
    var sprite = {
        cols: 6,
        rows: 3,
        width: 24,
        height: 16,
        position: {
            x: undefined,
            y: undefined,
        },
    };
    sprite.position.x = Math.floor((canvas.width / 2) - (sprite.width / 2));
    sprite.position.y = Math.floor((canvas.height / 2) - (sprite.height / 2));
    var state = {
        index: 0,
    };
    function loop(t) {
        state.index = Math.floor(t / 72) % sprite.cols;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(spriteSheet,
                      sprite.width * state.index,
                      sprite.height * 2,
                      sprite.width,
                      sprite.height,
                      sprite.position.x,
                      sprite.position.y,
                      sprite.width,
                      sprite.height);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    console.log("Done!");
};
