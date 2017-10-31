var unit = new PerchUnit();

unit.on('sensing', handleHubEvent);

function handleHubEvent(e){
  console.log(e);
  if(e.raw && e.raw.x && e.raw.y){
    handlePoint(e.raw.x, e.raw.y);
  }
}

function handlePoint(x, y){
  // express point on canvas;
  // send to calibrator
}

function calibrate(product){

}
