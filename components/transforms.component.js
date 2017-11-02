class TransformService {
  constructor(){

  }

  rawPointIsWithinArea(point, area, transforms){
    var transformWidth = transforms.width || 1;
    var transformHeight = transforms.height || 1;
    var isWithinWidth = point.x > area.x / transformWidth && point.x < (area.x + area.width) / transformWidth;
    var isWithinHeight = point.y > area.y / transformHeight && point.y < (area.y + area.height) / transformHeight;
    return isWithinWidth && isWithinHeight;
  }

  normalizeAreas(areas, transforms){
    var normalized = [];

    areas.map(area => {
      var pushed = {
        x: area.x,
        y: area.y,
        width: area.width,
        height: area.height,
        name: area.name
      }
      var width = transforms.width || 1;
      var height = transforms.height || 1;
      if(width){
        pushed.x = pushed.x/width;
        pushed.width = pushed.width/width;
      }
      if(height){
        pushed.y = pushed.y/height;
        pushed.height = pushed.height/height;
      }
      normalized.push(pushed);
    })

    return normalized;
  }

  flipX(regions){
    regions.areas.forEach(area => {
      area.x = regions.transforms.width - area.x - area.width;
    });
    return regions;
  }

  flipY(regions){
    regions.areas.forEach(area => {
      area.y = regions.transforms.height - area.y - area.height;
    });
    return regions;
  }

  rotateClockwise(regions){
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

  transformAreas(areas, transforms){
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

  scaleAreaToCanvas(area, frameWidth, frameHeight, canvasWidth, canvasHeight){
    if(!width || !height){
      throw Error('Needs width and height to scale canvas area.')
    }
    var newArea = {
      name: area.name || 'unnamed',
      x: area.x / (frameWidth || 1) * canvasWidth,
      y: area.y / (frameHeight || 1) * canvasHeight,
      width: area.width / (frameWidth || 1)* canvasWidth,
      height: area.height / (frameHeight || 1)* canvasHeight
    }
    return newArea;
  }

}

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
