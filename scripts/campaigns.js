class CampaignManager {
  constructor(){

  }

  getAll(){
    return new Promise((resolve, reject) => {
      http.get('http://localhost:5050/api/campaigns', (err, body) => {
        if(err){
          return reject(error)
        }
        var campaigns = body.results.map(campaign => {
          campaign.regions = campaign.regions || {};
          campaign.transforms = campaign.transforms || {};
          campaign.regions.areas = campaign.regions.areas || [];
          return campaign;
        })
        resolve(campaigns);
      })
    })
  }

  setRegions(campaignId, regions){
    return new Promise((resolve, reject) => {
      http.post(`http://localhost:5050/api/campaigns/${campaignId}/regions`, regions, (err, body) => {
        if(err){
          return reject(error)
        }
        resolve(body);
      })
    })
  }
}

var http = {
  get: httpGet,
  post: httpPost
}

// Helper functions

function httpGet(path, cb){
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function(){
    var res;
    try {
      res = JSON.parse(this.responseText);
    } catch (err) {
      cb(err);
    }
    if(res){
      cb(null, res);
    } else {
      cb('No response.')
    }
  });

  oReq.open("GET", path);
  oReq.send();
}

function httpPost(path, body, cb){
  console.log('posting to ' + path, body)
  var oReq = new XMLHttpRequest();
  var bodyString;
  oReq.addEventListener("load", function(){
    try {
      cb(null, JSON.parse(this.responseText));
    } catch (err) {
      try {
        cb(this.responseText);
      } catch (err){
        cb(err)
      }
    }
  });
  if(body && typeof body === 'object'){
    oReq.setRequestHeader("Content-type", "application/json");
    bodyString = JSON.stringify(body);
  }
  oReq.open("POST", path);
  oReq.send(bodyString);
}
