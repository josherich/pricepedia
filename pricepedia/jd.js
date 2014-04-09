var config = require('./config');
var async = require('async');

var JD = function(mongoose) {
  var JD_schema = new mongoose.Schema({
    item_id: {type: String, unique: true, index: true},
    title: String,
    price: String,
    detail: String,
    img: String,
    rate: String,
    cate: String,
    site: Number, // 0 for jd, 1 for yhd
    updateTime: {type: Date, default: Date.now },
  });
  this.model = mongoose.model('JDItem', JD_schema);
  this.q = [];
};
JD.prototype.JD_Cate = {
  book: "11258976",
  music: "20081545",
  game: "20075481",
  electronic: "842330",
  person: "853189",
  kitchen: "617068",
  house: "266885",
  phone: "1043963",
  digital: "323592",
  bedroom: "731233",
  wcloth: "1005856851",
  mcloth: "1002880197",
  jewell: "1048610059",
  wbeauty: "200991",
  mbeauty: "187698",
  wshoe: "1003132528",
  mshoe: "1020178519",
  pack: "915995",
  bag: "302886",
  sports: "1004569411",
  car: "140455",
  milk: "1029507",
  toy: "437213",
  food: "326347",
  cookie: "319873",
};

JD.prototype.lastItems = function(cb) {
  var query = this.model.find().sort({$natural:-1}).limit(15);
  query.exec(function(err, items) {
    for (var i in items) {
      cb(items[i]['item_id']);
    }
  })
};

JD.prototype.insert = function(detail, onSave) {
  var self = this;

  var exec = function() {
    this.model.findOne({item_id: detail['item_id']}, 'price', function(err, result) {
      if (result) {
        return;
      } else {
        // self.q.push(detail);
        console.log('in insert', detail.item_id + ': ' + detail.price + ': ' + detail.title.slice(0,20));
        // if (self.q.length > 200) {
        //   console.log('q length: ',self.q.length)
        //   async.each(self.q, function(item, onSave) {
        //     self.model.create(item, function() {});
        //   }, function(err) {
        //     self.q = [];
        //   });
        // }
        self.model.create(detail, function() {
          detail = null;
        });
        onSave();
      }
      // item.save(onSave);
    });
  };
  setTimeout(exec.bind(this), 0);
};

module.exports = JD;