const mongoose = require("mongoose");

function dbConnect(cb){
    mongoose.connect('mongodb://orlik95:ty66ty66@ds235877.mlab.com:35877/inz_main', cb)
}


var warehouses_schema = new mongoose.Schema({
    name: String,
    link: String
});

var Warehouse = mongoose.model("Warehouse", warehouses_schema);

function listWarehouses(cb) {

    Warehouse.find({}).exec(function(err, warehouses) {

        if(err) {
            cb(err);
        } else {
            cb(null, warehouses);
        }

    });

}

module.exports = {
    list: listWarehouses,
    connect: dbConnect
};