class CanvasController {
  constructor(){
    this.CampaignManager = new CampaignManager();
    this.TransformService = new TransformService();
    this.PerchUnit = new PerchUnit();
    this.campaigns = [];
    this.canvas;
    this.canvasContainer = document.getElementById('canvasContainer');
    this.points = [];
    this.canvasWidth = window.outerWidth;
    this.canvasHeight = window.outerHeight;

    this.PerchUnit.on('sensing', e => this.handleHubEvent(e));
  }

  setCampaign(campaign){
    console.log(campaign);
    this.campaign = campaign;
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
      currentLife: life,
      regions: []
    };
    this.campaign.regions.areas.map((area, a) => {
      if(this.TransformService.rawPointIsWithinArea(point, area, this.campaign.regions.transforms)){
        point.regions.push(a);
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
        this.points[i].regions.indexOf(a) > -1 &&
        this.points[i].totalLife - this.points[i].currentLife < activeLife
      ){
        return true;
      }
    }
    return false;
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
      this.drawArea(area, a);
    });
    this.points.map(point => {
      this.drawPoint(point);
    });

    // Update
    this.agePoints();
  }

  drawBackground(){
    noStroke();
    fill(80, 80, 80);
    rect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  drawArea(area, a){
    var scaled = this.TransformService.scaleAreaToCanvas(
      area,
      this.campaign.regions.transforms.width,
      this.campaign.regions.transforms.height,
      this.canvasWidth, this.canvasHeight
    );
    this.areaIsActive(a) ? fill(252, 63, 63) : fill(255);
    stroke(1);
    rect(scaled.x, scaled.y, scaled.width, scaled.height);
    noStroke();
    fill(0);
    textSize(14);
    textAlign(CENTER, CENTER);
    text(area.name, scaled.x, scaled.y, scaled.width, scaled.height);
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
