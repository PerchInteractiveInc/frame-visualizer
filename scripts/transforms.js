function normalizeAreas(areas, transforms){
  var normalized = areas.map(area => {
    if(!transforms){
      return area;
    }
    var width = transforms.width || 1;
    var height = transforms.height || 1;
    if(width){
      area.x = area.x/width;
      area.width = area.width/width;
    }
    if(height){
      area.y = area.y/height;
      area.height = area.height/height;
    }
    return area;
  })
  return normalized;
}


function flipX(regions){
  regions.areas.forEach(area => {
    area.x = regions.transforms.width - area.x - area.width;
  });
  return regions;
}

function flipY(regions){
  regions.areas.forEach(area => {
    area.y = regions.transforms.height - area.y - area.height;
  });
  return regions;
}


function rotateClockwise(regions){
  var normalized = normalizeAreas(regions.areas, regions.transforms);
  var rotated = normalized.map(area => {
    var x = 1 - area.y - area.height;
    var y = area.x;
    var height = area.width;
    var width = area.height;
    area.x = x;
    area.y = y;
    area.width = width;
    area.height = height;
    return area;
  });
  regions.areas = rotated;
  regions.areas = transformAreas(regions.areas, regions.transforms);
  regions.areas = roundAreas(regions.areas);
  return regions;
}


function transformAreas(areas, transforms){
  var transformed = areas.map(area => {
    if(!transforms){
      return area;
    }
    var width = transforms.width || 1;
    var height = transforms.height || 1;

    if(width){
      area.x = area.x * width;
      area.width = area.width * width;
    }
    if(height){
      area.y = area.y * height;
      area.height = area.height * height;
    }
    return area;
  })
  return transformed;
}

// Helper functions

function roundNumber(number, places){
  var mag = Math.pow(10, places || 0);
  return Math.floor(number * mag)/mag;
}

function roundAreas(areas){
  return areas.map(area => {
    area.x = roundNumber(area.x, 3);
    area.y = roundNumber(area.y, 3);
    area.width = roundNumber(area.width, 3);
    area.height = roundNumber(area.height, 3);
    return area;
  })
}

var transforms = {
  normalizeAreas: normalizeAreas,
  flipX: flipX,
  flipY: flipY,
  rotateClockwise: rotateClockwise,
  transformAreas: transformAreas
}
