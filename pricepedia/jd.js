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
  console.log(JD_schema);
};

JD.prototype.makeReceiver = function(detail, onSave) {
  var self = this;
  var q = []
  return function() {
    this.model.findOne({item_id:detail['item_id']}, 'price', function(err, result) {
      if (result) return;
      q.push(detail);
      if (q.length > 200) {
        collection.insert(q);
        q = [];
      }
      // item.save(onSave);
    });
  }
};

module.exports = JD;