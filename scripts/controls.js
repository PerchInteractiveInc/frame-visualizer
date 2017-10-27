var controls = document.getElementById('controlPanel');
var controlsExpand = document.getElementById('controlExpandButton');
document.getElementById('canvasWidthInput').value = canvasWidth;
document.getElementById('canvasHeightInput').value = canvasHeight;

var regions = {
	"aggregate": {
		"delay": 300
	},
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
	render();
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
		return null;
  }
}

function render(){
  writeRegionsToJson();
	writeRegionsToInputs();
  applyRegionsToCanvas();
	renderProductControlPanel();
}

// Apply input to text
function applyInputsToRegions(){
	var inputMap = getInputMap();
	inputMap.forEach(input => {
		var el = document.getElementById(input[1]);
		if(el[input[2]] && regions[input[0][0]]){
			regions[input[0][0]][input[0][1]] = el[input[2]]
		} else if (!el[input[2]] && regions[input[0][0]] && regions[input[0][0]][input[0][1]]){
			regions[input[0][0]][input[0][1]] = el[input[2]]
		}
	})
	regions = regions || {};
	render();
}

function applyJsonToRegions(){
	var json = readRegionsJson();
	if(json){
		regions = json;
		render();
	}
	regions = regions || {};
}

function getInputMap(){
	regions.transforms = regions.transforms || {};
	var inputMap = [
		[['transforms', 'origin'], 'transformsOriginInput', 'value'],
		[['transforms', 'flipX'], 'transformsFlipXInput', 'checked'],
		[['transforms', 'flipY'], 'transformsFlipYInput', 'checked'],
		[['transforms', 'height'], 'transformsHeightInput', 'value'],
		[['transforms', 'width'], 'transformsWidthInput', 'value']
	]
	return inputMap;
}

// Controls DOM

function addListeners(){
	var el = document.getElementById('numOfProducts');
	el.addEventListener('input', () => {
		renderProductControlPanel();
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

// Product controls



function calibrateProduct(i){

}

function addProduct(){
	regions.transforms = regions.transforms || {};
	regions.areas.push({
		x: 0,
		y: 0,
		width: 0.2 * (regions.transforms.width || 1),
		height: 0.2 * (regions.transforms.height || 1),
		name: `Product${regions.areas.length + 1}`
	})
	render();
}

function removeProduct(i){
	console.log('Removing product ' + i)
	regions.areas = regions.areas || [];
	regions.areas = regions.areas.filter((area, a) => {
		return i == a ? false : true;
	})
	render();
}


// Rendering

function writeRegionsToInputs(){
	var inputMap = getInputMap();
	inputMap.map(input => {
		var el = document.getElementById(input[1]);
		if(regions[input[0][0]] && regions[input[0][0]][input[0][1]]){
			el[input[2]] = regions[input[0][0]][input[0][1]];
		}
	})
}

function writeRegionsToJson(){
	document.getElementById('regionsText').value = JSON.stringify(regions, null, 2);
}

function renderProductControlPanel(){
	var productContainer = document.getElementById('product-control-container');
	productContainer.innerHTML = null;
	if(regions.areas){
		regions.areas.map((area, a) => {
			var div = document.createElement('div');
			div.className = 'product-control'
			div.innerHTML = `
				<strong>${area.name || 'Product ' + (a + 1)}</strong>&nbsp;&nbsp;
				<button id="calibrateProduct(${a})">Calibrate</button>&nbsp;&nbsp;&nbsp;
				<a href="#" onclick="removeProduct(${a})">x</a>
				<br>
				x: <input class="single-digit" type="number" value="${area.x}" id="product-${a}-x">&nbsp;&nbsp;
				y: <input class="single-digit" type="number" value="${area.y}" id="product-${a}-y">&nbsp;&nbsp;
				width: <input class="four-digit" type="number" value="${area.width}" id="product-${a}-width">&nbsp;&nbsp;
				height: <input class="four-digit" type="number" value="${area.height}" id="product-${a}-height">
			`;
			productContainer.appendChild(div);
		})
	}
}
