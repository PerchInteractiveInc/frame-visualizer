/*

PerchUnit
----------
This class allows Perch apps to listen to sensing signals.
Upon instantiation, it automatically opens a Websocket connection
to the Perch device and passes
along any signals it receives to its listeners. In addition,
it listens to keypresses and can simulate a signal for
demonstration or development purposes.

*/

'use strict';

class PerchUnit {
  constructor() {
    this.listeners = {
      sensing: []
    };
    // Set up analytics socket
    this.hubSocket = new WebSocket('ws://localhost:8090')
    this.hubSocket.onopen = () => console.log('Perch unit websocket connected.');

    // Set up sensing socket
    this.hubSocket.onmessage = this.onSensingMessage.bind(this)
    this.hubSocket.onerror = (e) => console.error('Hub socket error: ', e);

    this.setupKeyboardListener();
    this.setDevice('frame');
  }

  on(type, cb){
    if(type === 'sensing'){
      this.listeners.sensing.push(cb);
    }
  }

  removeAllEventListeners(){
    this.listeners.sensing = [];
  }

  trackProduct(product){
    console.log("Tracked product: " + product);
    if(this.hubSocket && this.hubSocket.readyState === 1){
      return this.hubSocket.send(JSON.stringify({
        type:'track',
        product:product,
        button:'none',
        actions:'pickup'
      }))
    } else {
      console.error(new Error('Websocket not connected.'));
    }
  }

  trackButton(product, button){
    console.log("Tracked button: " + product + " " + button );
    if(this.hubSocket && this.hubSocket.readyState === 1){
      return this.hubSocket.send(JSON.stringify({
        type:'track',
        product:product,
        button:button,
        actions:'touch'
      }));
    } else {
      console.error(new Error('Websocket not connected.'));
    }
  }

  onSensingMessage(e){
    try {
      var msg = JSON.parse(e.data);
      console.log(msg)
      this.emitPerchEvent(msg);
    } catch (err) {
      console.log('ERROR parsing message', e.data)
      console.error(err)
    }
  }

  setupKeyboardListener() {
    document.onkeypress = (e) => {
      e = e || window.event;
      var mainMap = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        '5': 4,
        '6': 5,
        '7': 6,
        '8': 7,
        '9': 8,
        '0': 9,
        'q': 10,
        'w': 11,
        'e': 12,
        'r': 13,
        't': 14,
        'y': 15,
        'u': 16,
        'i': 17,
        'o': 18,
        'p': 19
      }
      var altMap = {
        '!': 0,
        '@': 1,
        '#': 2,
        '$': 3,
        '%': 4,
        '^': 5,
        '&': 6,
        '*': 7,
        '(': 8,
        ')': 9,
        'Q': 10,
        'W': 11,
        'E': 12,
        'R': 13,
        'T': 14,
        'Y': 15,
        'U': 16,
        'I': 17,
        'O': 18,
        'P': 19
      }

      var evt = {
        type: 'sensing',
        headers: {
          device: 'keyboard',
          event: 'keypress'
        },
        data: {
          regions: []
        },
        raw: {
          key: e.key
        }
      };
      if (typeof mainMap[e.key] !== 'undefined'){
        evt.data.regions = buildRegionMap(mainMap[e.key], false, this.deviceType);
        evt.raw.region = mainMap[e.key];
        this.emitPerchEvent(evt)
      } else if (typeof altMap[e.key] !== 'undefined'){
        evt.data.regions = buildRegionMap(altMap[e.key], true, this.deviceType);
        evt.raw.region = altMap[e.key];
        this.emitPerchEvent(evt)
      }

      function buildRegionMap(productNum, isAlt, deviceType){
        var regions = [];
        for(var i = 0; i < 10; i++){
          var region = {
            name: 'Product' + (i + 1),
            state: deviceType === 'frame' ? false : true,
            statechange: false
          }
          if(i === productNum){
            region.statechange = true;
            if(deviceType === 'frame'){
              region.state = !isAlt;
            } else if (deviceType === 'vision'){
              region.state = isAlt;
            }
          }
          regions.push(region);
        }
        return regions;
      }

      if (e.key === "c"){
        console.log("Showing cursor.");
        document.getElementsByTagName("BODY")[0].style.cursor = "auto";
      }
    }
  }

  emitPerchEvent(obj) {
    this.listeners.sensing.forEach((listener, l) => { listener(obj) })
  }

  click(x, y){
    var ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    });

    var el = document.elementFromPoint(x, y);
    if(el){
      el.dispatchEvent(ev);
    }
  }

  // Use to transform x to y
  screenClick(percentX, percentY, screenWidth, screenHeight){
    this.click(Math.floor(percentX * screenWidth), Math.floor(percentY * screenHeight));
  }

  setDevice(type){
    if(type !== 'frame' && type !== 'vision'){
      throw new Error(`Device type cannot be ${type}. Must be frame or vision.`);
    }
    this.deviceType = type;
  }

}
