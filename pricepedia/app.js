var app = require('express').createServer();
var events = require('events');
// var jsdom = require('jsdom');
var request = require('request');
var mongo = require('./mongo');
// var heapdump = require('heapdump');
var JD = require('./jd');

var config = require('./config');

var fs = require('fs');

// var jquery = fs.readFileSync("./jquery.min.js", "utf-8");

var mongoose = mongo.mongoose;

var emitter = new events.EventEmitter();

var jd = new JD(mongoose);

var parse = fs.createReadStream('./parsefunc.txt');

function getId(url) {
  return parseInt(url.match(/item.jd.com\/\d{6}.html/)[1]);
}

// function loadItemPage(url) {
//   jsdom.env(url, [jquery], function(err, window) {
//     readDetailFromDOM(window);
//   });
// }

function loadJdItemJson(id) {
  // console.log('loading json: ', id);
  var url = "http://diviner.jd.com/diviner?callback=jsonp1393163835877&_=1393163876491&sku="+id+"&p=102003&lid=1&lim=20&ec=utf-8";
  // console.log('using url: ', url);
  request.get({url:url, headers:
    {
      'Cookie': '_pst=josherich; pin=josherich; unick=jd_josh01; ceshi3.com=DE01AA9B232524E4F220F7B3AF3230FD5847A296E19883B1B107DE3853B494EE13FBD8FA478CBC08B90D376CAF125179FC6F3C8A55ECDCB476317E1591EE8BF852E6413C91163D31834726B758729834CA11A24130F7F4CFCED28EEFBFA762D96083411AB59DA02E83297A6EC370B889C037689F749490B8AB06930BB5642AB83B2F3DE30856B0124DE55BA929412D21; _tp=D8h7%2B4msn5RY5YfagTk3IA%3D%3D; __utma=1.73841771.1393211107.1393211107.1393211107.1; __utmb=1.4.10.1393211107; __utmc=1; __utmz=1.1393211107.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __utmv=1.|1=Addon=CR%20Y2014.02.13%2040209=1; __jda=122270672.2022920677.1393211159.1393211159.1393211159.1; __jdb=122270672.4.2022920677|1.1393211159; __jdc=122270672; __jdv=122270672|direct|-|none|-; __jdu=2022920677; _jzqco=%7C%7C%7C%7C%7C1.1750820986.1393211159816.1393211193333.1393211516579.1393211193333.1393211516579.0.0.0.3.3'
    }
  }, function(er, res, data){
    // console.log('loaded json: '+id, data);
    if (!er && res.statusCode == 200) {
      var links = JSON.parse(data.slice(19,-2))['data'];
      if (links) {
        links.forEach(function(item) {
          setTimeout(readJdDetailFromAPI.bind(null, item), 100);
        });
      }
    }
  });
}

function loadYhdItemJson(id) {
  var detailUrl = "http://gps.yihaodian.com/restful/detail?mcsite=1&provinceId=6&pmId=" + id + "&callback=jsonp1395160540718";
  request.get({url: url}, function(er, res, data) {
    if (!er && res.statusCode == 200) {
      var productId = JSON.parse(data.slice(19,-2))['productId'];
      var releatedUrl = "http://pms.yhd.com/pms/getUpRelatedProductsByProductIdByJson.do?productid="+ productId + "&merchantId=" + merchantId + "&subProductId=" + productId + "&pmid=" + id + "&showNum=10&callback=jsonp1395160540721";
      request.get({url: releatedUrl}, function(er, res, data) {
        if (!er && res.statusCode == 200) {
          var links = JSON.parse(data.slice(19,-2))['values'];
          if (links) {
            links.forEach(function(item) {
              setTimeout(readYhdDetailFromAPI.bind(null, item), 100);
            })
          }
        }
      })
    }
  })
}
function readJdDetailFromAPI(item) {
  jd.insert({
    item_id: item.sku,
    title: item.t,
    price: item.jp,
    img: item.img,
    cate: item.c3,
    site: 0
  }, function() {
    // console.log('loading item: ', item.sku);
    emitter.emit('linkJdAdded', item.sku);
  });
}

function readYhdDetailFromAPI(item) {
  jd.insert({
    item_id: item.pmId,
    title: item.cnName,
    price: item.salePrice,
    img: item.picUrl,
    cate: item.productId,
    site: 1
  }, function() {
    emitter.emit('linkYhdAdded', item.pmId);
  })
}
// function readDetailFromDOM(window) {
//   var $ = window.$;
//   jd.insert({
//     item_id: $(window.ajaxSettings.url),
//     title: $(config.id.title),
//     price: $(config.jd.price),
//     detail: $(),
//     rate: $(),
//   }, function() {
//     var links = $
//     events.emit('linkAdded', $(config.jd.buy2buy));
//   });
// }

// function onLinkLoaded(links) {
//   links.forEach(function(link) {
//     loadItemPage(link);
//   })
// }

function onJdLinkAdded(id) {
  loadJdItemJson(id);
}
function onYhdLinkAdded(id) {
  loadYhdItemJson(id)
}
// 319935
// 508522
function startJd(itemId) {
  console.log(itemId);
  emitter.on('linkJdAdded', onJdLinkAdded);
  if (itemId) {
    emitter.emit('linkJdAdded', itemId);
  } else {
    jd.lastItems(function(id) {
      emitter.emit('linkJdAdded', id);
    });
  }
}

function startJd0() {
  console.log('start jd from 0');
  emitter.on('linkJdAdded', onJdLinkAdded);
  cate = jd.JD_cate;
  for (var i in cate) {
    emitter.emit('linkJdAdded', cate[i]);
  }
}

function startYhd(itemId) {
  console.log(itemId);
  emitter.on('linkYhdAdded', onYhdLinkAdded);
  if (itemId) {
    emitter.emit('linkYhdAdded', itemId);
  } else {
    jd.lastItems(function(id) {
      emitter.emit('linkYhdAdded', id);
    });
  }
}

app.get('/', function(req, res) {
    // res.send('Hello from <a href="http://appfog.com">AppFog.com</a>');
    var s = new Date;
    // jsdom.env(
    //   "http://nodejs.org/dist/",
    //   [jquery],
    //   function (errors, window) {
    //     var t = new Date;
    //     console.log(t-s);
    //     res.send("there have been" + window.$("a").length + "nodejs releases!");
    //   }
    // );
  res.send('gotit');
});
app.get('/start/jd', function(req, res) {
  startJd0();
})
app.get('/continue/jd', function(req, res) {
  startJd();
});
app.get('/continue/yhd', function(req, res) {
  startYhd();
})
app.get('/new/:itemId', function(req, res) {
  console.log(req.params);
  start(req.params.itemId);
})
app.get('/parse/jd', function(req, res) {
  fs.readFile('./parsefunc.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    res.send(data);
  });
})
app.listen(process.env.VCAP_APP_PORT || 5000);

