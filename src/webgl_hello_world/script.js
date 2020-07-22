"use strict";

/* NOTE: See
 * `https://avikdas.com/2020/07/08/barebones-webgl-in-75-lines-of-code.html`
 */

var GL;

var DATA = new Float32Array([
    -0.85, //     <- `x`
    -0.85, //  1  <- `y`
    0.0,   // ___ <- ... `opacity` ?
    0.85,  //
    -0.85, //  2
    0.0,   // ___
    0.0,   //
    0.85,  //  3
    0.0,   // ___
]);
var SCALE = 0.0035;
var HALF_SCALE = SCALE / 2.0;

function getSource(id) {
    return document.getElementById(id).innerHTML;
}

function compileShader(shader, source) {
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        console.error(GL.getShaderInfoLog(shader));
        return false;
    }
    return true;
}

function update() {
    DATA[0] += (Math.random() * SCALE) - HALF_SCALE;
    DATA[1] += (Math.random() * SCALE) - HALF_SCALE;
    DATA[3] += (Math.random() * SCALE) - HALF_SCALE;
    DATA[4] += (Math.random() * SCALE) - HALF_SCALE;
    DATA[6] += (Math.random() * SCALE) - HALF_SCALE;
    DATA[7] += (Math.random() * SCALE) - HALF_SCALE;
}

function draw() {
    GL.bufferData(GL.ARRAY_BUFFER, DATA, GL.STATIC_DRAW);
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.drawArrays(GL.TRIANGLES, 0, 3);
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    GL = canvas.getContext("webgl");
    var vertexShader = GL.createShader(GL.VERTEX_SHADER);
    if (!compileShader(vertexShader, getSource("vertex-shader"))) {
        return;
    }
    var fragmentShader = GL.createShader(GL.FRAGMENT_SHADER);
    if (!compileShader(fragmentShader, getSource("fragment-shader"))) {
        return;
    }
    var program = GL.createProgram();
    GL.attachShader(program, vertexShader);
    GL.attachShader(program, fragmentShader);
    GL.linkProgram(program);
    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) {
        console.error(GL.getProgramInfoLog(program));
        return;
    }
    GL.useProgram(program);
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    var attribute = GL.getAttribLocation(program, "position");
    GL.enableVertexAttribArray(attribute);
    GL.clearColor(0.9, 0.9, 0.9, 1);
    GL.vertexAttribPointer(attribute, 3, GL.FLOAT, false, 0, 0);
    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
};
