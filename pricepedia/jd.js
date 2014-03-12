var config = require('./config');

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
};

JD.prototype.makeReceiver = function() {
  var self = this;
  var q = []
  return function(detail, onSave) {
    console.log(detail);
    self.model.findOne({item_id:detail['item_id']}, 'price', function(err, result) {
      if (result) return;
      q.push(detail);
      console.log(detail);
      if (q.length > 200) {
        self.model.collection.insert(q, function() {
          q = [];
        });
      }
      onSave();

      // item.save(onSave);
    });
  }
};

module.exports = JD;