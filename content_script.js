// 2013 Josherich

// The background page is asking us to parse the price and append the unit price.
if (window == top) {
  chrome.runtime.connect({name:"capture_channel"});
  fire();
}


function fire() {
  var items, text, price, len, _len;
  var host = window.location.host;
  if (host.indexOf('jd') > 0) {
    items = 'ul.list-h li';
  } else if (host.indexOf('yhd') > 0) {
    items = 'ul#itemSearchList li';
  }
  chrome.runtime.sendMessage({ type: 'price', url: window.location.href}, function(response) {
    if (response) {
      var data = response;
      var id, price, weight, unit, uPrice, unitString;
      $(items).each(function(index, item) {

        if (host.indexOf('yhd') > 0) {
          id = $(item).find('span.color_red')[0].attributes['productid'].value;
          data[id]['net'] = data[id]['net'] || [0,0];
          price = data[id]['yhdprice'];
          weight = data[id]['net'][0];
          unit = data[id]['net'][1];
          if (unit === 'g') {
            uPrice = parseFloat(price) / weight * 100;
            uPrice = uPrice.toFixed(2);
            unitString = '/100克';
          }
          $(item).css('position', 'relative');
          $(item).append($("<div>", { style: 'position: absolute; top:0; left: 10px; font-size:20px; color:blue; z-index:100', text: '￥' + uPrice + unitString}));
        } else if (host.indexOf('jd') > 0) {
          id = item.attributes['sku'].value;
          data[id]['net'] = data[id]['net'] || [0,0];
          price = data[id]['jdprice'];
          weight = data[id]['net'][0];
          unit = data[id]['net'][1];
          if (unit === 'g') {
            uPrice = parseFloat(price) / weight * 100;
            uPrice = uPrice.toFixed(2);
            unitString = '/100克';
          }
          $(item).css('position', 'relative');
          $(item).append($("<div>", { style: 'position: absolute; top:0; left: 10px; font-size:20px; color:blue; z-index:100', text: '￥' + uPrice + unitString}));
        }
      });
    }
  });
}


// 13g*10条
var quant_mult = /\d+g\*\d+/g;
// 400g
var quant_g = /\d+(\.\d+)?g/g;
// 5kg
var quant_kg = /\d+(kg|KG)/g;
// 1L
var quant_l = /\d+(\.\d+)?L/g;
// 100ml
var quant_ml = /\d+ml/g;
// price
var p = /\d+\.\d+|\d+/g;

var normalize = function(text) {
  return text.replace('克', 'g').replace('升','L').replace('X', '*');
};

var calculate = function() {
  var items, text, price, len, _len;
  if (window.location.host.indexOf('jd') > 0) {
    items = 'ul.list-h li';
  } else if (window.location.host.indexOf('yhd') > 0) {
    items = 'ul#itemSearchList li';
  }
  console.log(items);

  var onchange = function(){
    len = $('ul#itemSearchList li').length;
    console.log(len);
    if (_len != len) {
      _len = len;
      $(items).each(function(index, item){
        $(item).css('position', 'relative');
        var g = 0.00, unitp = 0.00;

        if (window.location.host.indexOf('jd') > 0) {
          text = $(item).find('.p-name a')[0].innerText;
          price = $(item).find('.p-price')[0].innerText.match(p)[0]; //23.30
        } else if (window.location.host.indexOf('yhd') > 0) {
          text = $(item).find('p.title a')[0].innerText;
          price = $(item).find('span.color_red')[0].innerText.match(p)[0]; //23.30
        }

        text = normalize(text);

        var output = "";
        var q_m = text.match(quant_mult); // 13g*10条
        var q_g = text.match(quant_g); // 400g
        var q_kg = text.match(quant_kg);
        var q_l = text.match(quant_l);
        var q_ml = text.match(quant_ml);

        if (q_l) {
          q_l = q_l[0].replace('L', '');
          unitp = parseFloat(price) / q_l;
          output = unitp.toFixed(2) + '/L(升)';
        } else if (q_kg) {
          q_kg = q_kg[0].replace('kg', '');
          q_kg = q_kg[0].replace('KG', '');
          unitp = parseFloat(price) / q_kg;
          output = unitp.toFixed(2) + '/kg(公斤)';
        } else if (q_ml) {
          q_ml = q_ml[0].replace('ml', '');
          unitp = parseFloat(price) / q_ml * 100;
          output = unitp.toFixed(2) + '/100ml(毫升)';
        } else if (q_m) {
          q_m = q_m[0].replace('g', '').split('*');
          g = parseFloat(q_m[0].replace('g', '')) * parseFloat(q_m[1]);
          unitp = parseFloat(price) / g * 100;
          output = unitp.toFixed(2) + '/100g(克)';
        } else if (q_g) {
          q_g = q_g[0].replace('g', '');
          unitp = parseFloat(price) / q_g * 100;
          output = unitp.toFixed(2) + '/100g(克)';
        } else {
          console.log('price not found');
          return;
        }
        $(item).append("<div style='position: absolute; top:0; left: 10px; font-size:20px; color:blue; z-index:100'>￥" + output + "</div>");
        console.log('price: ', price);
        console.log('unitp: ', unitp);
      });
    }
  };

  setInterval(onchange, 1000);
};



