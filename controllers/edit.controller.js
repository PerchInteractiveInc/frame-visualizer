class EditController {
	constructor(){
		this.campaign;
		this.regions;
		this.CampaignManager = new CampaignManager();
		this.PerchUnit = new PerchUnit();
		this.PerchUnit.on('sensing', e => this.handleHubEvent(e));
		this.campaignId = getParameterByName('campaignId');
		this.calibrationTarget;
		this.calibrationPoints = [];
		this.setup();
		this.addListeners();
	}

	setup(){
		console.log('Initializing...');
		this.CampaignManager.getAll()
		.then(campaigns => {
			campaigns.map(campaign => {
				if(campaign.id === this.campaignId){
					this.campaign = campaign;
					this.setRegions(this.campaign.regions);
				}
			});
			if(!this.campaign){
				throw new Error('No campaign found with id ' + this.campaignId)
			}
			console.log(this.campaign);
			this.render();
		})
		.catch(err => console.error(err))
	}

	handleHubEvent(e){
		if(
			typeof this.calibrationTarget === 'number' &&
			this.regions.areas[this.calibrationTarget] &&
			e.raw &&
			typeof e.raw.xPos === 'number' &&
			typeof e.raw.yPos === 'number'
		){
			this.calibrationPoints.push({
				x: e.raw.xPos,
				y: e.raw.yPos
			})
		}
	}

	addListeners(){
		var inputs = getInputMap();
		inputs.map(input => {
			var el = document.getElementById(input[1]);
			var controller = this;
			el.addEventListener(input[3], () => {
				controller.updateRegionsData(input[0], el[input[2]], el.type)
				this.render();
			})
		})

		var jsonInput = document.getElementById('regionsText');
		var errorBox = document.getElementById('error-box');

		jsonInput.addEventListener('input', () => {
			var json = readRegionsJson();
			if(json){
				errorBox.innerHTML = '';
				if(JSON.stringify(this.regions) == JSON.stringify(json)){
					return;
				}
				this.regions = json;
				this.render();
			} else {
				errorBox.innerHTML = 'Regions text is not valid JSON.';
			}
		})
	}

	updateRegionsData(map, value, type){
		if(value){
			if(type === 'number'){
				value = Number(value);
			}
			this.regions[map[0]][map[1]] = value;
		} else {
			delete this.regions[map[0]][map[1]];
		}
	}

	setRegions(regions){
		this.regions = Object.assign({}, regions);
		this.validateRegions(this.regions);
		this.regions.areas = this.regions.areas.map(area => {
			area.x = area.x / (this.regions.transforms.width || 1);
			area.y = area.y / (this.regions.transforms.height || 1);
			area.width = area.width / (this.regions.transforms.width || 1);
			area.height = area.height / (this.regions.transforms.height || 1);
			return area;
		})
		delete this.regions.transforms.width;
		delete this.regions.transforms.height;
	}

	writeRegionsFile(){
		var regions = readRegionsJson();
		if(!regions){
			window.alert('JSON invalid.');
			return;
		}
		this.CampaignManager.writeRegionsFile(this.campaignId, regions)
		.then(() => {
			window.alert('Successful!');
		})
		.catch(err => {
			console.log(err);
			window.alert(err)
		})
	}

	addProduct(){
		this.regions.areas.push({
			x: 0,
			y: 0,
			width: 0.2 * (this.regions.transforms.width || 1),
			height: 0.2 * (this.regions.transforms.height || 1),
			name: `Product${this.regions.areas.length + 1}`
		});
		this.render();
	}

	removeProduct(i){
		console.log('Removing product ' + i)
		this.regions.areas = this.regions.areas.filter((area, a) => {
			return i == a ? false : true;
		})
		this.render();
	}

	startCalibration(i){
		this.calibrationTarget = i;
		this.calibrationPoints = [];
	}

	endCalibration(){
		// find external bounding box
		// calculate new region
		//
		this.calibrationPoints = [];
	}

	clearCalibrationPoints(i){

	}

	applyJsonToRegions(){
		var json = readRegionsJson();
		if(json){
			this.regions = json;
			this.render();
		}
	}

	validateRegions(regions){
		this.regions.areas = this.regions.areas || [];
		this.regions.transforms = this.regions.transforms || {};
		this.regions.aggregate = this.regions.aggregate || {};
	}


	// DOM

	showCampaignsPanel(){
		var campaignsPanel = document.getElementById('campaigns-panel');
		campaignsPanel.style.display = 'inline-block';
		this.canvasContainer.style.display = 'none';
	}

	hideCampaignsPanel(){
		var campaignsPanel = document.getElementById('campaigns-panel');
		campaignsPanel.style.display = 'none';
		this.canvasContainer.style.display = '';
	}

	render(){
		this.validateRegions(this.regions);
		this.renderRegionsToJson(this.regions);
		this.renderRegionsToInputs(this.regions);
		this.renderProductsPanel(this.regions);
		this.renderCampaignTitle();
	}

	// Render functions

	renderCampaignTitle(){
		var el = document.getElementById('campaign-title');
		el.innerHTML = this.campaign.name;
	}

	renderRegionsToJson(regions){
		document.getElementById('regionsText').value = JSON.stringify(regions, null, 2);
	}

	renderRegionsToInputs(regions){
		var inputMap = getInputMap();
		inputMap.map(input => {
			var el = document.getElementById(input[1]);
			if(regions[input[0][0]] && regions[input[0][0]][input[0][1]]){
				if(el.type === 'number'){
					el[input[2]] = Number(regions[input[0][0]][input[0][1]]);
				} else {
					el[input[2]] = regions[input[0][0]][input[0][1]];
				}
			} else {
				if (el.type === 'checked'){
					el[input[2]] = false;
				} else {
					el[input[2]] = '';
				}
			}
		})
	}

	renderProductsPanel(regions){
		var container = document.getElementById('products-container');
		container.innerHTML = '';
		regions.areas.map((area, a) => {
			var div = document.createElement('div');
			div.className = 'product-item';
			div.innerHTML = `
				${area.name || '[unnamed]'}&nbsp;&nbsp;<button class="default-button">Calibrate</button>
				&nbsp;&nbsp;
				<a href="#" onclick="editController.removeProduct(${a})">x</a>
			`
			container.appendChild(div);
		})
	}
}

function readRegionsJson(){
  var regionsStr = document.getElementById('regionsText').value;
	var res = null;
  try {
    res = JSON.parse(regionsStr);
		res.transforms = res.transforms || {};
		res.areas = res.areas || [];
  } catch (e){};
	return res;
}

function getInputMap(){
	var inputMap = [
		[['transforms', 'origin'], 'transformsOriginInput', 'value', 'change'],
		[['transforms', 'flipX'], 'transformsFlipXInput', 'checked', 'change'],
		[['transforms', 'flipY'], 'transformsFlipYInput', 'checked', 'change'],
		[['aggregate', 'delay'], 'aggregateDelayInput', 'value', 'input']
	]
	return inputMap;
}

// Rendering

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
