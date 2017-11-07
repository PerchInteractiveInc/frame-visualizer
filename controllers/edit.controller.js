class EditController {
	constructor(){
		this.campaign;
		this.regions;
		this.CampaignManager = new CampaignManager();
		this.PerchUnit = new PerchUnit();
		this.PerchUnit.on('sensing', e => this.handleHubEvent(e));
		this.canvasController;
		this.calibrationTarget;
		this.calibrationPoints = [];
		this.listeners = {};
		this.setup();
		this.addListeners();
	}

	setup(){
		console.log('Initializing...');
		this.hideControlPanel();
	}

	loadCampaign(campaignId){
		return new Promise((resolve, reject) => {
			this.CampaignManager.getAll()
			.then(campaigns => {
				campaigns.map(campaign => {
					if(campaign.id === campaignId){
						this.campaign = campaign;
						this.setRegions(this.campaign.regions);
					}
				});
				if(!this.campaign){
					throw new Error('No campaign found with id ' + this.campaignId)
				}
				console.log('Loaded campaign', this.campaign);
				resolve(this.campaign);
			})
			.catch(err => reject(err))
		})
	}

	on(type, cb){
		this.listeners[type] = this.listeners[type] || [];
		this.listeners[type].push(cb);
	}

	emit(type, data){
		if(this.listeners[type]){
			this.listeners[type].map(cb => {
				cb(data);
			})
		}
	}

	getCampaign(){
		return this.campaign;
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
				this.setRegions(json);
				this.render();
			} else {
				errorBox.innerHTML = 'Regions text is not valid JSON.';
			}
		})
	}

	updateRegionsData(map, value, type){
		var updated = Object.assign({}, this.regions);
		if(value){
			if(type === 'number'){
				value = Number(value);
			}
			updated[map[0]][map[1]] = value;
			this.setRegions(updated);
		} else {
			delete updated[map[0]][map[1]];
			this.setRegions(updated);
		}
	}

	getRegions(){
		return Object.assign({}, this.regions);
	}

	setRegions(regions){
		var updated = Object.assign({}, regions);
		updated.areas = updated.areas || [];
		updated.transforms = updated.transforms || {};
		updated.aggregate = updated.aggregate || {};
		updated.areas = updated.areas.map(area => {
			area.x = area.x / (updated.transforms.width || 1);
			area.y = area.y / (updated.transforms.height || 1);
			area.width = area.width / (updated.transforms.width || 1);
			area.height = area.height / (updated.transforms.height || 1);
			return area;
		})
		delete updated.transforms.width;
		delete updated.transforms.height;
		this.regions = Object.assign({}, updated);
		var campaign = Object.assign({}, this.campaign);
		campaign.regions = updated;
		this.emit('campaign-update', campaign);
		this.render();
	}

	writeRegionsFile(){
		var regions = readRegionsJson();
		if(!regions){
			window.alert('JSON invalid.');
			return;
		}
		if(!this.campaignId){
			window.alert('Need campaign id to write json.')
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
		var updated = this.getRegions();
		updated.areas.push({
			x: 0,
			y: 0,
			width: 0.2 * (updated.transforms.width || 1),
			height: 0.2 * (updated.transforms.height || 1),
			name: `Product${updated.areas.length + 1}`
		});
		this.setRegions(updated);
		this.render();
	}

	removeProduct(i){
		console.log('Removing product ' + i)
		var updated = this.getRegions();
		updated.areas = updated.areas.filter((area, a) => {
			return i == a ? false : true;
		})
		this.setRegions(updated);
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
			this.setRegions(json);
			this.render();
		}
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
		this.renderRegionsToJson(this.regions);
		this.renderRegionsToInputs(this.regions);
		this.renderProductsPanel(this.regions);
		this.renderCampaignTitle(this.campaign.name);
	}

	// Render functions

	renderCampaignTitle(title){
		var el = document.getElementById('campaign-title');
		el.innerHTML = title;
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

	showControlPanel(){
		var showButton = document.getElementById('control-toggle-show');
		var hideButton = document.getElementById('control-toggle-hide');
		var controlPanel = document.getElementById('control-panel');
		showButton.style.display = 'none';
		hideButton.style.display = 'inline-block';
		controlPanel.style.display = 'inline-block';
	}

	hideControlPanel(){
		var showButton = document.getElementById('control-toggle-show');
		var hideButton = document.getElementById('control-toggle-hide');
		var controlPanel = document.getElementById('control-panel');
		showButton.style.display = 'inline-block';
		hideButton.style.display = 'none';
		controlPanel.style.display = 'none';
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
