class IndexComponents {
  constructor(){

  }


  renderProducts(regions){
  	var productContainer = document.getElementById('product-control-container');
  	productContainer.innerHTML = null;
  	if(regions.areas){
  		regions.areas.map((area, a) => {
  			var div = document.createElement('div');
  			div.className = 'product-control'
  			div.innerHTML = `
  				<input value="${area.name || 'Product ' + (a + 1)}">
  				&nbsp;&nbsp;
  				<button id="calibrateProduct(${a})" class="default-button">Calibrate</button>&nbsp;&nbsp;&nbsp;
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

  renderCampaigns(campaigns){
  	var campaignsContainer = document.getElementById('campaigns-control-container');
  	campaignsContainer.innerHTML = null;
  		campaigns.map((campaign, c) => {
  			var div = document.createElement('div');
  			div.className = 'campaign-control'
  			div.innerHTML = `
  				${campaign.name}
  				&nbsp;&nbsp;
  				<button id="setRegions(${campaign._id})" class="default-button">Calibrate</button>&nbsp;&nbsp;&nbsp;
  			`;
  			productContainer.appendChild(div);
  		})

  }

}
