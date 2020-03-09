const mongoose = require("mongoose");


var Items = new mongoose.Schema({
    id: String,
    value: Number,
    name: String
},{ _id : false });

var inw_schema = new mongoose.Schema({
    number: String,
    day: Number,
    month: Number,
    year: Number,
    full: Boolean,
    status: String,
    items: [Items]

});

var INW = mongoose.model("INW", inw_schema, "inw_docs");

function dbConnect(link, cb){
    mongoose.connect(link, cb)
}

function listINW(cb) {

    INW.find({status: {$ne: 'deleted'}}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });

}

function inspectINW(cb, id){
    INW.find({_id: id}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });
}

function newINW(status, full, items, cb){

    var d = new Date();



    INW.countDocuments({month: (d.getMonth()+1), year: d.getFullYear()}, function(err, count){

        var newINW = new INW({

            day: d.getDate(),
            month: (d.getMonth()+1),
            year: d.getFullYear(),
            number: count+1 + "/" + (d.getMonth()+1) + "/" + d.getFullYear(),
            status: status,
            full: full,
            items: items

        });

        newINW.save();
        cb();

    });


}







module.exports = {
    list: listINW,
    connect: dbConnect,
    inspect: inspectINW,
    newINW: newINW
};