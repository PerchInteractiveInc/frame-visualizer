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
  clearBucketById(bucketId){
    if(this.calibrationTarget && this.calibrationTarget.id === bucketId){
      this.calibrationTarget = null;
    }
    this.buckets = this.buckets.filter(bucket => {
      return bucket.id !== bucketId;
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
}

function calculateAreaFromPoints(points){
  var bounds = getBoundsFromPoints(points);
  var padded = padBounds(bounds);
  var nonZero = ensureNonZeroDims(padded);
  var constrained = constrainBoundsToCanvas(nonZero);
  return constrained;
}

function getBoundsFromPoints(points){
  var dims = ['x', 'y']
  var bounds = [[null, null], [null, null]]
  points.map(point => {
    dims.map((dim, d) => {
      var min = bounds[d][0];
      var max = bounds[d][1];
      if(min === null || point[dim] < min){
        bounds[d][0] = point[dim];
      }
      if(max === null || point[dim] > max){
        bounds[d][1] = point[dim];
      }
    })
  })
  return {
    x: bounds[0][0],
    y: bounds[1][0],
    width: bounds[0][1] - bounds[0][0],
    height: bounds[1][1] - bounds[1][0]
  }
}

function padBounds(bounds){
  var percent = 0.2;
  return {
    x: bounds.x - bounds.width * percent,
    y: bounds.y - bounds.height * percent,
    width: bounds.width * (1 + percent * 2),
    height: bounds.height * (1 + percent * 2)
  }
}


function ensureNonZeroDims(bounds){
  return {
    x: bounds.x,
    y: bounds.y,
    width: Math.max(bounds.width, 0.05),
    height: Math.max(bounds.height, 0.05)
  }
}

function constrainBoundsToCanvas(bounds){
  var res = {
    x: Math.max(bounds.x, 0),
    y: Math.max(bounds.y, 0)
  };
  res.width = Math.min(bounds.width, 1 - res.x);
  res.height = Math.min(bounds.height, 1 - res.y);
  return res;
}
