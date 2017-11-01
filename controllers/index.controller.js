class IndexController {
  constructor(){
    this.CampaignManager = new CampaignManager();
    this.TransformService = new TransformService();
    this.PerchUnit = new PerchUnit();
    this.campaigns = [];
    this.campaign = sample || {};
    this.canvas;
    this.canvasContainer = document.getElementById('canvasContainer');
    this.points = [];
    this.canvasWidth = window.outerWidth;
    this.canvasHeight = window.outerHeight;

    this.PerchUnit.on('sensing', e => this.handleHubEvent(e));
    this.CampaignManager.getAll()
    .then(campaigns => {
      this.campaigns = campaigns;
      this.render();
    })
    .catch(err => console.error(err));
  }

  handleHubEvent(e){
    if(e.raw && typeof e.raw.xPos === 'number' && typeof e.raw.yPos === 'number'){
      this.addPoint(e.raw.xPos, e.raw.yPos);
    }
  }

  addPoint(x, y, life){
    life = life || 100;
    var point = {
      x: x,
      y: y,
      totalLife: life,
      currentLife: life
    };
    this.campaign.regions.areas.map((area, a) => {
      if(this.TransformService.rawPointIsWithinArea(point, area, this.campaign.regions.transforms)){
        point.regionIndex = a;
      }
    })
    this.points.push(point);
  }

  agePoints(){
    this.points = this.points.map(point => {
      point.currentLife -= 1;
      return point;
    })
    this.points = this.points.filter(point => {
      return point.currentLife > 0;
    });
  }

  areaIsActive(a){
    var activeLife = 30;
    for(var i = 0; i < this.points.length; i++){
      if(
        this.points[i].regionIndex == a &&
        this.points[i].totalLife - this.points[i].currentLife < activeLife
      ){
        return true;
      }
    }
    return false;
  }

  loadCampaign(c){
    this.campaign = this.campaigns[c];
    console.log(this.campaign);
    this.hideCampaignsPanel();
    this.render();
  }

  // DOM manipulation

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

  renderCampaignsPanel(){
    var campaignsPanel = document.getElementById('campaigns-panel');
    campaignsPanel.innerHTML = '';
    this.campaigns.map((campaign, c) => {
      var div = document.createElement('div');
      div.innerHTML = `
        ${campaign.name}
        &nbsp;&nbsp;
      `
      if(!campaign || !campaign.regions || !campaign.regions.areas || !campaign.regions.areas.length){
        div.innerHTML += '(no areas)&nbsp;'
      }
      div.innerHTML += `
        <button onclick="controller.loadCampaign(${c})">Load</button>
      `
      campaignsPanel.appendChild(div);
    })
  }

  renderCampaignTitle(){
    var campaignTitle = document.getElementById('campaign-title');
    campaignTitle.innerHTML = this.campaign.name + '&nbsp;&nbsp;';
  }

  renderEditButton(){
    if(!this.campaign.id){
      return;
    }
    var campaignEdit = document.getElementById('campaign-edit');
    campaignEdit.innerHTML = '';
    var link = document.createElement('a');
    link.href = './edit.html?campaignId=' + this.campaign.id;
    var button = document.createElement('button');
    button.innerHTML = 'Edit';
    campaignEdit.appendChild(link);
    link.appendChild(button);
  }

  render(){
    this.renderCampaignTitle();
    this.renderEditButton();
    this.renderCampaignsPanel();
  }

  // Canvas functions

  setup(){
    this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);
    this.canvas.parent('canvasContainer');
    for (var i = 0; i < 10; i++){
      for(var j = 0; j < 10; j++){
        this.addPoint(i/10, j/10, 20);
      }
    }
  }

  draw(){
    // Draw
    this.drawBackground();

    this.campaign.regions.areas.map((area, a) => {
      this.drawArea(area, this.areaIsActive(a), this.campaign.regions.transforms.width, this.campaign.regions.transforms.height);
    })
    this.points.map(point => {
      this.drawPoint(point);
    })

    // Update
    this.agePoints();
  }

  drawBackground(){
    noStroke();
    fill(80, 80, 80);
    rect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  drawArea(area, isActive, frameWidth, frameHeight){
    var scaled = this.TransformService.scaleAreaToCanvas(area, frameWidth, frameHeight, this.canvasWidth, this.canvasHeight);
    isActive ? fill(252, 63, 63) : fill(255);
    stroke(1);
    rect(scaled.x, scaled.y, scaled.width, scaled.height);
    noStroke();
    fill(0);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(scaled.name, scaled.x, scaled.y, scaled.width, scaled.height);
  }

  drawPoint(point){
    var opacity = Math.floor(point.currentLife/point.totalLife * 100)/100 * 255;
    noStroke();
    stroke(255, opacity);
    fill(252, 63, 63, opacity);
    ellipse(point.x * this.canvasWidth, point.y * this.canvasHeight, 10, 10);
  }

  resizeCanvas(width, height){
    console.log(`Resizing canvas to ${width}px by ${height}px`);
    this.canvasHeight = height;
    this.canvasWidth = width;
    resizeCanvas(width, height);
  }
}
