class IndexController {
	constructor(){
		this.campaigns = [];
		this.regions = sample || {};
		this.CampaignManager = new CampaignManager();
		this.Components = new IndexComponents();
	}

	init(){
		console.log('Initializing...');
		this.render();
	}

	hideControls(){
		controls.style.display = 'none';
		controlsExpand.style.display = '';
	}

	showControls(){
		controls.style.display = '';
		controlsExpand.style.display = 'none';
	}

	setRegions(){
		this.CampaignManger.setRegions(campaignId, this.regions)
		.then(() => {
			window.alert('Successful!');
		})
		.catch(err => window.alert(err))
	}

	getCampaigns(){
		this.CampaignManager.getAll()
		.then(data => {
			campaigns = data;
			this.render();
		})
		.catch(err => console.error(err))
	}

	addProduct(){
		this.regions.transforms = this.regions.transforms || {};
		this.regions.areas.push({
			x: 0,
			y: 0,
			width: 0.2 * (this.regions.transforms.width || 1),
			height: 0.2 * (this.regions.transforms.height || 1),
			name: `Product${this.regions.areas.length + 1}`
		})
		this.render();
	}

	removeProduct(i){
		console.log('Removing product ' + i)
		this.regions.areas = this.regions.areas || [];
		this.regions.areas = this.regions.areas.filter((area, a) => {
			return i == a ? false : true;
		})
		this.render();
	}

	calibrateProduct(i){

	}

	applyInputsToRegions(){
		var inputMap = getInputMap();
		inputMap.forEach(input => {
			var el = document.getElementById(input[1]);
			if(el[input[2]] && this.regions[input[0][0]]){
				this.regions[input[0][0]][input[0][1]] = el[input[2]]
			} else if (!el[input[2]] && this.regions[input[0][0]] && this.regions[input[0][0]][input[0][1]]){
				this.regions[input[0][0]][input[0][1]] = el[input[2]]
			}
		})
		this.regions = this.regions || {};
		this.render();
	}

	applyJsonToRegions(){
		var json = readRegionsJson();
		if(json){
			this.regions = json;
			this.render();
		}
		this.regions = this.regions || {};
	}

	render(){
		writeRegionsToJson(this.regions);
		writeRegionsToInputs(this.regions);
		applyRegionsToCanvas(this.regions);
		this.Components.renderProducts(this.regions);
		this.Components.renderCampaigns(this.campaigns);
	}
}

function readRegionsJson(){
  var regionsStr = document.getElementById('regionsText').value;
	var errorBox = document.getElementById('error-box');
	var res = null;
  try {
    res = JSON.parse(regionsStr);
		res.transforms = res.transforms || {};
		res.areas = res.areas || [];
		errorBox.innerHTML = '';
  } catch (e){
    errorBox.innerHTML = 'Regions text is not valid JSON.';
  }
	return res;
}

function getInputMap(){
	var inputMap = [
		[['transforms', 'origin'], 'transformsOriginInput', 'value'],
		[['transforms', 'flipX'], 'transformsFlipXInput', 'checked'],
		[['transforms', 'flipY'], 'transformsFlipYInput', 'checked'],
		[['transforms', 'height'], 'transformsHeightInput', 'value'],
		[['transforms', 'width'], 'transformsWidthInput', 'value']
	]
	return inputMap;
}

// Product controls

// Rendering

function writeRegionsToInputs(regions){
	var inputMap = getInputMap();
	inputMap.map(input => {
		var el = document.getElementById(input[1]);
		if(regions[input[0][0]] && regions[input[0][0]][input[0][1]]){
			el[input[2]] = regions[input[0][0]][input[0][1]];
		}
	})
}

function writeRegionsToJson(regions){
	document.getElementById('regionsText').value = JSON.stringify(regions, null, 2);
}
