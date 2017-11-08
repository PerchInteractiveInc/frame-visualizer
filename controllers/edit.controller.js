class EditController {
	constructor(){
		this.Calibrator = new Calibrator();
		this.CampaignManager = new CampaignManager();
		this.campaign;
		this.regions;
		this.canvasController;
		this.calibrationTarget;
		this.calibrationPoints = [];
		this.listeners = {};
	}

	init(){
		console.log('Initializing...');
		this.hideControlPanel();
		this.addListeners();
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
				this.render();
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
			e.raw &&
			typeof e.raw.xPos === 'number' &&
			typeof e.raw.yPos === 'number'
		){
			this.addPoint(e.raw.xPos, e.raw.yPos)
		}
	}

	addPoint(x, y){
		this.Calibrator.addPoint({
			x: x,
			y: y
		});
		this.render();
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

		var useAggregate  = document.getElementById('useAggregateInput')
		useAggregate.addEventListener('change', () => {
			var updated = this.getRegions();
			if(useAggregate.checked){
				updated.aggregate = updated.aggregate || {};
				if(!updated.aggregate.delay){
					updated.aggregate.delay = 300;
				}
			} else {
				delete updated.aggregate;
			}
			this.setRegions(updated);
			this.render();
		})

		var jsonInput = document.getElementById('regionsText');

		jsonInput.addEventListener('input', () => {
			var json = readRegionsJson();
			if(json){
				if(JSON.stringify(this.regions) == JSON.stringify(json)){
					return;
				}
				this.setRegions(json);
				this.renderRegionsToInputs(this.regions);
				this.renderProductsPanel(this.regions);
			}
			this.renderErrors();
		})
	}

	updateRegionsData(map, value, type){
		var updated = Object.assign({}, this.regions);
		if(value && updated[map[0]]){
			if(type === 'number'){
				value = Number(value);
			}
			updated[map[0]][map[1]] = value;
		} else if(updated[map[0]]){
			delete updated[map[0]][map[1]];
		}
		this.setRegions(updated);
		this.render();
	}

	getRegions(){
		return Object.assign({}, this.regions);
	}

	setRegions(regions){
		var useAggregate = document.getElementById('useAggregateInput');

		var updated = Object.assign({}, regions);
		updated.areas = updated.areas || [];
		updated.transforms = updated.transforms || {};
		if(useAggregate.checked){
			updated.aggregate = updated.aggregate || {};
		}
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
		console.log(`Starting calibration for area`, this.regions.areas[i])
		var bucket = this.Calibrator.startCalibration(this.regions.areas[i]);
		this.render();
	}

	stopCalibration(){
		this.Calibrator.stopCalibration();
		this.render();
	}

	clearBucket(i){
		this.Calibrator.clearBucketByArea(this.regions.areas[i]);
		this.render();
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
		this.renderErrors()
	}

	// Render functions

	renderCampaignTitle(title){
		var el = document.getElementById('campaign-title');
		el.innerHTML = title;
	}

	renderRegionsToJson(regions){
		document.getElementById('regionsText').value = JSON.stringify(regions, null, 2);
		document.getElementById('useAggregateInput').checked = !!regions.aggregate;
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
		while (container.lastChild) {
		    container.removeChild(container.lastChild);
		}
		regions.areas.forEach((area, a) => {
			var activeBucket = this.Calibrator.getCalibrationTarget(area);
			var bucket = this.Calibrator.getBucketByArea(area);
			var div = document.createElement('div');
			var str = '';

			div.className = 'product-item';
			str = `${area.name || '[unnamed]'}&nbsp;&nbsp;`
			if(bucket){
				str += `${bucket.points.length} points&nbsp;&nbsp;
					<button onclick="editController.clearBucket(${a})">Clear</button>
				`

			}
			if(activeBucket && activeBucket.area === area){
				str += `
					[calibrating]
					<button onclick="editController.stopCalibration()">Stop</button>
				`
			} else {
				str += `<button class="default-button" onclick="editController.startCalibration(${a})">Calibrate</button>
					&nbsp;&nbsp;
				`
			}
			str += `
				<a href="#" onclick="editController.removeProduct(${a})">x</a>
			`
			div.innerHTML = str;
			container.appendChild(div);
		})
	}

	renderErrors(){
		var errorBox = document.getElementById('error-box');
		var json = readRegionsJson();
		if(!json){
			errorBox.innerHTML = 'Regions text not valid JSON.'
		} else {
			errorBox.innerHTML = '';
		}
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
