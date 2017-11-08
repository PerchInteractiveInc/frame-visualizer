class Calibrator {
  constructor(){
    this.calibrationTarget = null;
    this.buckets = []
  }
  getBuckets(){
    return this.buckets;
  }
  getCalibrationTarget(){
    return this.calibrationTarget;
  }
  startCalibration(area){
    var bucket = this.getBucketByArea(area);
    if(!bucket){
      bucket = this.createBucket(area);
    }
    this.calibrationTarget = bucket;
    return bucket;
  }
  stopCalibration(){
    this.calibrationTarget = null;
  }
  createBucket(area){
    var newBucket = new CalibrationBucket(area);
    this.buckets.push(newBucket);
    return newBucket;
  }
  getBucketByArea(area){
    for (var i = 0; i < this.buckets.length; i++){
      var bucket = this.buckets[i];
      if(bucket.area === area){
        return bucket;
      }
    }
    return null;
  }
  clearBucketByArea(area){
    if(this.calibrationTarget && this.calibrationTarget.area === area){
      this.calibrationTarget = null;
    }
    this.buckets = this.buckets.filter(bucket => {
      return bucket.area !== area;
    })
  }
  clearAllBuckets(){
    this.buckets = [];
  }
  addPoint(x, y){
    if(this.calibrationTarget){
      this.calibrationTarget.addPoint(x, y);
    }
  }
  calculateRegions(regions){
    console.log(`Calculating regions from ${this.buckets.length} buckets...`);
    regions.areas = regions.areas.map(area => {
      this.buckets.map(bucket => {
        if(area === bucket.area){
          var recalculated = calculateAreaFromPoints(bucket.points);
          area.x = recalculated.x;
          area.y = recalculated.y;
          area.width = recalculated.width,
          area.height = recalculated.height
        }
      });
      return area;
    })
    return regions;
  }
}

class CalibrationBucket {
  constructor(area){
    this.id = `a${new Date().valueOf()}`;
    this.points = [];
    this.area = area;
  }
  addPoint(x, y){
    this.points.push({
      x: x,
      y: y
    })
  }
  calculateRegionFromPoints(){
    var minX, minY, maxX, maxY;
    this.points.map(point => {
      if(!minX || point.x < minX){
        minX = point.x;
      }
      if(!maxX || point.x > maxX){
        maxX = point.x;
      }
      if(!minY || point.y < minY){
        minY = point.y;
      }
      if(!maxY || point.y > maxY){
        maxY = point.y;
      }
    })
    var width = maxX - minX;
    var height = maxY - minY;
    var xPad = width / 10;
    var yPad = height / 10;
    var region = {
      x: minX - xPad,
      y: minY - yPad,
      width: width + xPad * 2,
      height: height + yPad * 2
    }
    return region;
  }
}

function calculateAreaFromPoints(points){
  return {
    x: 0,
    y: 0,
    width: 1,
    height: 1
  }
}
