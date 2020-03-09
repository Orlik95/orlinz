const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

function dbConnect(cb){
    mongoose.connect('mongodb://orlik95:ty66ty66@ds235877.mlab.com:35877/inz_main', cb)
}


var items_schema = new mongoose.Schema({
    name: {type: String, unique: true, required: true}
});

items_schema.plugin(uniqueValidator);

var Item = mongoose.model("Item", items_schema);

function newItem(itemName, cb) {

    Item.countDocuments({name: itemName}, function(err, count){

        if(count===0){

            var newItem = new Item({

                name: itemName

            });

            newItem.save().then(function(){cb()});

        }
        else
        {
            cb();
        }


    })




}

function findId(itemName, cb){


    Item.find({name: itemName}).exec(function(err, items){

        if(items!==null){
            if(err) {
                cb(err);
            } else {
                cb(null, items);
            }
        }

    });
}

module.exports = {
    newItem: newItem,
    connect: dbConnect,
    findId: findId
};