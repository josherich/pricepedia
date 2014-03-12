var config = require('./config');
var async = require('async');

var JD = function(mongoose) {
  var JD_schema = new mongoose.Schema({
    item_id: {type: String, unique: true},
    title: String,
    price: String,
    detail: String,
    img: String,
    rate: String,
    cate: String,
    updateTime: {type: Date, default: Date.now },
  });
  this.model = mongoose.model('JDItem', JD_schema);
  this.q = [];
};

JD.prototype.insert = function(detail, onSave) {
  var self = this;

  this.model.findOne({item_id: detail['item_id']}, 'price', function(err, result) {
    console.log(result)
    if (result)
      return;
    else
      self.q.push(detail);

      if (self.q.length > 200) {
        async.each(self.q, function(item, onSave) {
          self.model.create(item, function() {});
        }, function(err) {
          self.q = [];
        });
      }
      onSave();

    // item.save(onSave);
  });
};

module.exports = JD;