const mongoose = require("mongoose");


var Items = new mongoose.Schema({
    id: String,
    value: Number,
    name: String
},{ _id : false });

var rw_schema = new mongoose.Schema({
    number: String,
    day: Number,
    month: Number,
    year: Number,
    status: String,
    items: [Items]


});

var RW = mongoose.model("RW", rw_schema, "rw_docs");

function dbConnect(link, cb){
    mongoose.connect(link, cb)
}

function listRW(cb) {

    RW.find({status: {$ne: 'deleted'}}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });

}

function inspectRW(cb, id){
    RW.find({_id: id}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });
}

function newRW(status, items, cb){

    var d = new Date();


    RW.countDocuments({month: (d.getMonth()+1), year: d.getFullYear()}, function(err, count){
        var newRW = new RW({

            day: d.getDate(),
            month: (d.getMonth()+1),
            year: d.getFullYear(),
            number: count+1 + "/" + (d.getMonth()+1) + "/" + d.getFullYear(),
            status: status,
            items: items

        });

        newRW.save();
        cb();

    });


}

function cancelRW(id, cb){

    RW.findByIdAndUpdate(id, {status: 'created'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na created");
    });

    cb();

}

function confirmRW(id, cb){

    RW.findByIdAndUpdate(id, {status: 'accepted'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na created");
    });

    cb();

}

function deleteRW(id, cb){

    RW.findByIdAndUpdate(id, {status: 'deleted'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na deleted");
    });

    cb();
}





module.exports = {
    list: listRW,
    connect: dbConnect,
    inspect: inspectRW,
    newRW: newRW,
    cancel: cancelRW,
    confirm: confirmRW,
    delete: deleteRW
};