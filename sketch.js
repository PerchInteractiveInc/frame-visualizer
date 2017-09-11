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

document.getElementById('regionsText').value = JSON.stringify(sample, 2);


function updateCanvas(){
  var regionsStr = document.getElementById('regionsText').value;
  var regions;
  console.log(regionsStr)
  try {
    regions = JSON.parse(regionsStr);
  } catch (e){
    window.alert('Regions text is not valid JSON.');
  }

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

  regions.areas.map(area => {
    setVisual(area, regions.transforms);
  })
  console.log(visualized);
}

function setVisual(area, transforms){
  transforms = transforms || {};
  area = scaleArea(area, transforms.width, transforms.height);
  visualized.push(area);
}

function scaleArea(area, width, height){
  var newArea = {
    name: area.name || 'unnamed',
    x: area.x * canvasWidth,
    y: area.y * canvasHeight,
    width: area.width * canvasWidth,
    height: area.height * canvasHeight
  }
  if(width){
    newArea.x = newArea.x/width;
    newArea.width = newArea.width/width;
  }
  if(height){
    newArea.y = newArea.y/height;
    newArea.height = newArea.height/height;
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
