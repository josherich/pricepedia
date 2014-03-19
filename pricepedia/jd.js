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

module.exports = JD;