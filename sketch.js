var visualized = [];
var canvasWidth = 1080;
var canvasHeight = 1920;
var canvas;
var controls = document.getElementById('controlPanel');
var controlsExpand = document.getElementById('controlExpandButton');
document.getElementById('canvasWidthInput').value = canvasWidth;
document.getElementById('canvasHeightInput').value = canvasHeight;

var sample = {
	"transforms": {
		"origin": "bottom-right",
		"width": 93,
		"height": 77
	},
	"screen": {
		"x": 32.875,
		"y": 10.5,
		"width": 27.251,
		"height": 47.75,
		"triggers": ["addPoint","updatePoint"]
	},
	"areas": [
		{
			"name": "Product1",
			"x": 0,
			"y": 27,
			"width": 11.75,
			"height": 14
		},
		{
			"name": "Product2",
			"x": 11.75,
			"y": 27,
			"width": 11.75,
			"height": 14
		},
		{
			"name": "Product3",
			"x": 69,
			"y": 27,
			"width": 11.75,
			"height": 14
		},
		{
			"name": "Product4",
			"x": 80.75,
			"y": 27,
			"width": 11.75,
			"height": 14
		},
		{
			"name": "Product5",
			"x": 0,
			"y": 15,
			"width": 11.75,
			"height": 12
		},
		{
			"name": "Product6",
			"x": 11.75,
			"y": 15,
			"width": 11.75,
			"height": 12
		},
		{
			"name": "Product7",
			"x": 69,
			"y": 15,
			"width": 11.75,
			"height": 12
		},
		{
			"name": "Product8",
			"x": 80.75,
			"y": 15,
			"width": 11.75,
			"height": 12
		}
	]
}

writeRegionsJson(sample);


function readRegionsJson(){
  var regionsStr = document.getElementById('regionsText').value;
  var regions;
  try {
    regions = JSON.parse(regionsStr);
  } catch (e){
    window.alert('Regions text is not valid JSON.');
  }
  if(regions){
    regions.transforms = regions.transforms || {};
    regions.areas = regions.areas || [];
  }

  return regions;
}

function writeRegionsJson(regions){
  document.getElementById('regionsText').value = JSON.stringify(regions);
}

function updateCanvas(){
  var regions = readRegionsJson();
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

function normalizeAreas(areas, transforms){
  var normalized = areas.map(area => {
    if(!transforms){
      return area;
    }
    var width = transforms.width || 1;
    var height = transforms.height || 1;
    if(width){
      area.x = area.x/width;
      area.width = area.width/width;
    }
    if(height){
      area.y = area.y/height;
      area.height = area.height/height;
    }
    return area;
  })
  return normalized;
}

function transformAreas(areas, transforms){
  var transformed = areas.map(area => {
    if(!transforms){
      return area;
    }
    var width = transforms.width || 1;
    var height = transforms.height || 1;

    if(width){
      area.x = area.x * width;
      area.width = area.width * width;
    }
    if(height){
      area.y = area.y * height;
      area.height = area.height * height;
    }
    return area;
  })
  return transformed;
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

function setup(){
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvasContainer');
  updateCanvas();
}

function setupBackground(){
  noStroke();
  fill(227, 254, 211);
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

function hideControls(){
  controls.style.display = 'none';
  controlsExpand.style.display = '';
}

function showControls(){
  controls.style.display = '';
  controlsExpand.style.display = 'none';
}

function flipX(){
  var regions = readRegionsJson();
  regions.areas.forEach(area => {
    area.x = regions.transforms.width - area.x;
  })
  writeRegionsJson(regions);
  updateCanvas();
}

function flipY(){
  var regions = readRegionsJson();
  regions.areas.forEach(area => {
    area.y = regions.transforms.height - area.y;
  })
  writeRegionsJson(regions);
  updateCanvas();
}

function roundAreas(areas){
  return areas.map(area => {
    area.x = roundNumber(area.x, 3);
    area.y = roundNumber(area.y, 3);
    area.width = roundNumber(area.width, 3);
    area.height = roundNumber(area.height, 3);
    return area;
  })
}

function roundNumber(number, places){
  var mag = Math.pow(10, places || 0);
  return Math.floor(number * mag)/mag;
}

function rotateClockwise(){
  var regions = readRegionsJson();
  var normalized = normalizeAreas(regions.areas, regions.transforms);
  var rotated = normalized.map(area => {
    var x = 1 - area.y - area.height;
    var y = area.x;
    var height = area.width;
    var width = area.height;
    area.x = x;
    area.y = y;
    area.width = width;
    area.height = height;
    return area;
  });
  regions.areas = rotated;
  regions.areas = transformAreas(regions.areas, regions.transforms);
  regions.areas = roundAreas(regions.areas);
  writeRegionsJson(regions);
  updateCanvas();
}
