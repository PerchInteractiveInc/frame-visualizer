var controls = document.getElementById('controlPanel');
var controlsExpand = document.getElementById('controlExpandButton');
document.getElementById('canvasWidthInput').value = canvasWidth;
document.getElementById('canvasHeightInput').value = canvasHeight;


var regions = {
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

function init(){
	console.log('Initializing...');
	updateRegions(regions);
	var input = document.getElementById('regionsText');
	input.addEventListener('input', () => {
		updateRegionsFromInput();
	});
}

function readRegionsJson(){
  var regionsStr = document.getElementById('regionsText').value;
	var errorBox = document.getElementById('error-box');
  try {
    regions = JSON.parse(regionsStr);
		regions.transforms = regions.transforms || {};
		regions.areas = regions.areas || [];
		errorBox.innerHTML = '';
		return regions;
  } catch (e){
    errorBox.innerHTML = 'Regions text is not valid JSON.';
		return regions;
  }

}

function writeRegionsJson(regions){
  document.getElementById('regionsText').value = JSON.stringify(regions);
}

function updateRegions(regions){
  writeRegionsJson(regions);
  updateCanvasRegions(regions)
}

function updateRegionsFromInput(){
	var regions = readRegionsJson();
	updateRegions(regions);
}

//

function applyRegionsTransform(type){
	var fn = transforms[type];
	if(typeof fn === 'function'){
		var transformed = fn(regions);
		updateRegions(transformed);
	}
}

// Controls DOM

function renderControls(){
	var regions = readRegionsJson();
	var inputs = [
		{
			value: screen.x,
			el: 'canvasWidthInput'
		}
	]
	var canvasInput = {
		width: document.getElementById('canvasWidthInput'),
		height: document.getElementById('canvasHeightInput')
	}
}

function hideControls(){
  controls.style.display = 'none';
  controlsExpand.style.display = '';
}

function showControls(){
  controls.style.display = '';
  controlsExpand.style.display = 'none';
}


function renderAreaControlPanel(){
	var regions = readRegionsJson();
	var areaContainer = document.getElementById('area-container');
	areaContainer.innerHTML = null;
	if(regions.areas){
		regions.areas.map((area, a) => {
			var div = document.createElement('div');
			div.innerHTML = `
				<span>${area.name || 'Area ' + (a + 1)}</span>
				<button id="calibrate(${a})">Calibrate</button>
			`
			areaContainer.appendChild(div)
		})
	}
}

// Helper transforms
