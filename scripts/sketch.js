var visualized = [];
var canvas;
var canvasWidth = 1080;
var canvasHeight = 1920;

// p5 functions
function setup(){
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvasContainer');
  init();
}

// Drawing
function setupBackground(){
  noStroke();
  fill(80, 80, 80);
  rect(0, 0, canvasWidth, canvasHeight);
}

function draw(){
  visualized.map(area => {
    fill(255);
    stroke(1);
    rect(area.x, area.y, area.width, area.height);
    noStroke();
    fill(0);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(area.name, area.x, area.y, area.width, area.height);
  })
}


// Transform regions file to visualization


function applyRegionsToCanvas(){
  if(!regions){
    return;
  }
  canvasWidth = Number(document.getElementById('canvasWidthInput').value);
  canvasHeight = Number(document.getElementById('canvasHeightInput').value);

  resizeCanvas(canvasWidth, canvasHeight);
  setupBackground();

  if(!regions.areas){
    window.alert('No region areas to visualize.');
    return;
  }
  visualized = [];
  var areas = normalizeAreas(regions.areas, regions.transforms);
  areas.map(area => {
    setVisual(area);
  });
}

function setVisual(area){
  visualized.push(scaleAreaToCanvas(area));
}

function scaleAreaToCanvas(area){
  var newArea = {
    name: area.name || 'unnamed',
    x: area.x * canvasWidth,
    y: area.y * canvasHeight,
    width: area.width * canvasWidth,
    height: area.height * canvasHeight
  }
  return newArea;
}
