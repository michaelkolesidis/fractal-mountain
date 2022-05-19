/*
/* Copyright (c) 2022 Michael Kolesidis
 * MIT License
 */

let framesPerIteration = 25;
let polys = [];
let noiseScale = 0.5;
let distanceDivider = 3;
let maxSplits = 6;
let splits = 0;

let captureVideoFrames = false;
let capturer;
if (captureVideoFrames) {
  capturer = new CCapture({
    format: "png",
    framerate: 25,
    name: "fractallandscapevid",
    verbose: true,
  });
}
let canv;

function setup() {
  let p5canvas;
  if (captureVideoFrames) {
    p5canvas = createCanvas(1920, 1080, WEBGL);
  } else {
    p5canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  }
  canv = p5canvas.canvas;
  frameRate(25);

  polys[0] = [
    [0, 100, 80],
    [-100, -20, -30],
    [80, -50, -50],
  ];

  if (captureVideoFrames) {
    capturer.start();
  }
}

function draw() {
  background(0);
  camera(0, 40, -200, 0, 0, 0, 0, -1, 0);
  // rotateY(-PI/2 + (mouseX/width) * PI);
  // rotateX(-PI/2 + (mouseY/height) * PI);
  rotateY(-PI / 4 + frameCount / 600);

  smooth();
  noFill();
  stroke(255);
  strokeWeight(0.3);
  for (var i = 0; i < polys.length; i++) {
    beginShape();
    for (var j = 0; j < polys[i].length; j++) {
      vertex(polys[i][j][0], polys[i][j][1], polys[i][j][2]);
    }
    endShape(CLOSE);
  }

  if (captureVideoFrames) {
    capturer.capture(canv);
  }

  if (frameCount % framesPerIteration == 0 && splits < maxSplits) {
    splits++;
    splitPolys();
  }

  if (captureVideoFrames && frameCount == 800) {
    noLoop();
    capturer.stop();
    capturer.save();
  }
}

function splitPolys() {
  let newPolys = [];
  for (var i = 0; i < polys.length; i++) {
    /*
        Each poly has 3 vertices, A, B, C
        We want to create 4 polys:
            A, midpoint AB, midpoint AC
            B, midpoint BA, midpoint BC
            C, midpoint CA, midpoint CB
            midpoint AB, midpoint AC, midpoint BC
        but introduce some noise along the way
        */
    let A = polys[i][0];
    let B = polys[i][1];
    let C = polys[i][2];
    let AB = mid(A, B);
    let BC = mid(B, C);
    let AC = mid(A, C);

    /*
        Perlin noise AND specific noiseMax distances are used such that
        two vertices that should always be in the same location as each other
        but are from two different polys will always calculate the same noise
        values, preventing them from causing gaps in the mesh
        */
    let noiseMax = dist(...A, ...B) / distanceDivider;
    AB[1] += map(
      noise(AB[0] * noiseScale, AB[2] * noiseScale),
      0,
      1,
      -noiseMax,
      noiseMax
    );
    noiseMax = dist(...B, ...C) / distanceDivider;
    BC[1] += map(
      noise(BC[0] * noiseScale, BC[2] * noiseScale),
      0,
      1,
      -noiseMax,
      noiseMax
    );
    noiseMax = dist(...A, ...C) / distanceDivider;
    AC[1] += map(
      noise(AC[0] * noiseScale, AC[2] * noiseScale),
      0,
      1,
      -noiseMax,
      noiseMax
    );

    newPolys.push([A, AB, AC]);
    newPolys.push([B, AB, BC]);
    newPolys.push([C, AC, BC]);
    newPolys.push([AB, BC, AC]);
  }
  polys = newPolys;
}

function mid(A, B) {
  return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Fullscreen mode
window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});
