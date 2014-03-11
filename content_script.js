// 2013 Josherich

// The background page is asking us to parse the price and append the unit price.
if (window == top) {
  chrome.runtime.connect({name:"capture_channel"});
  fire();
}

function fire() {
  chrome.runtime.sendMessage({ type: 'price', url: window.location.href}, function(response) {
    if (response) {
      eval(response);
    }
  });
}






