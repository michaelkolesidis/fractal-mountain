/*
 * Copyright (c) 2023 Michael Kolesidis
 * GNU Affero General Public License v3.0
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 */

let polygons = [];
let noiseScale = 0.5;
let distanceDivider = 3;
let framesPerIteration = 24;

// Splitting
let splits = 0;
let maxSplits = 6;

// Setup
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
  frameRate(24);

  /*
    Initial triangle
  */
  polygons[0] = [
    [    0, 100,  80 ],
    [ -100, -20, -30 ],
    [   80, -50, -50 ],
  ];
}

// Draw
function draw() {
  background(20);
  camera(0, 40, -200, 0, 0, 0, 0, -1, 0);

  /*
    Rotation   
  */
    rotateY(-PI / 4 + frameCount / 600);

  /*
    Mouse rotation
  */
  if (mouseX !== 0 && mouseY !== 0) {
    rotateY(-PI / 2 + (mouseX / width) * PI);
    rotateX(-PI / 2 + (mouseY / height) * PI);
  }

  smooth();
  noFill();
  stroke(235);
  strokeWeight(0.25);
  
  for (var i = 0; i < polygons.length; i++) {
    beginShape();
    for (var j = 0; j < polygons[i].length; j++) {
      vertex(polygons[i][j][0], polygons[i][j][1], polygons[i][j][2]);
    }
    endShape(CLOSE);
  }

  if (frameCount % framesPerIteration == 0 && splits < maxSplits) {
    splits++;
    splitPolygons();
  }
}

// Split Polygons
function splitPolygons() {
  let newpolygons = [];
  for (var i = 0; i < polygons.length; i++) {
    /*
        Each polygon has 3 vertices, A, B, C
        We want to create 4 polygons:
            A, midpoint AB, midpoint AC
            B, midpoint BA, midpoint BC
            C, midpoint CA, midpoint CB
            midpoint AB, midpoint AC, midpoint BC
        but introduce some noise along the way
        */
    let A = polygons[i][0];
    let B = polygons[i][1];
    let C = polygons[i][2];
    let AB = mid(A, B);
    let BC = mid(B, C);
    let AC = mid(A, C);

    /*
        Perlin noise AND specific noiseMax distances are used such that
        two vertices that should always be in the same location as each other
        but are from two different polygons will always calculate the same noise
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

    newpolygons.push([A, AB, AC]);
    newpolygons.push([B, AB, BC]);
    newpolygons.push([C, AC, BC]);
    newpolygons.push([AB, BC, AC]);
  }
  polygons = newpolygons;
}

// Mid
function mid(A, B) {
  return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
}

// Resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Fullscreen
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
