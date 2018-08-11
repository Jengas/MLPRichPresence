const {
  webFrame
} = require('electron');
const {
  remote
} = require('electron')
const mainProcess = remote.require('./main.js');
const os = require('os');
var storage = require('electron-json-storage');
window.$ = window.jQuery = require('jquery');
if (os.type() !== 'Darwin') {
  document.body.style.backgroundColor = '#4C4C4C'
}

function init() {
  document.getElementById("min-btn").addEventListener("click", function(e) {
    const window = remote.getCurrentWindow();
    window.minimize();
  });

  document.getElementById("close-btn").addEventListener("click", function(e) {
    const window = remote.getCurrentWindow();
    window.close();
  });
};

document.onreadystatechange = function() {
  if (document.readyState == "complete") {
    init();
  }
};

//webFrame.setZoomLevelLimits(1, 1);

storage.get('activity', function(error, data) {
  if (error) throw error;

  var stateload = data.state;
  var detailsload = data.details;

  const config = require('./config.json')
  var city = require('./assets/city.json')
  var text = "textContent" in document.body ? "textContent" : "innerText";
  document.getElementById('details').value = detailsload
  document.getElementById('state')[text] = city[stateload].city
  document.getElementById('ltext')[text] = city[stateload].city
  document.getElementById('lkey')[text] = city[stateload].state
  if (config.imageConfig.showButton == false) {
    document.getElementById('button').style.display = 'none'
  }
});
