class IndexController {
  constructor(){
    this.CampaignManager = new CampaignManager();
  }

  init(){
    this.CampaignManager.getAll()
    .then(campaigns => {
      this.campaigns = campaigns;
      this.render();
    })
    .catch(err => console.error(err));
  }

  render(){
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
        <a href="./edit.html?campaignId=${campaign.id}">
          <button>Load</button>
        </a>
      `
      campaignsPanel.appendChild(div);
    })
  }
}
