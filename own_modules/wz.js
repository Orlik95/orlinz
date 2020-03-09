const mongoose = require("mongoose");


var Items = new mongoose.Schema({
    id: String,
    value: Number,
    name: String
},{ _id : false });

var wz_schema = new mongoose.Schema({
    number: String,
    day: Number,
    month: Number,
    year: Number,
    status: String,
    receiver: String,
    items: [Items]

});

var WZ = mongoose.model("WZ", wz_schema, "wz_docs");

function dbConnect(link, cb){
    mongoose.connect(link, cb)
}

function listWZ(cb) {

    WZ.find({status: {$ne: 'deleted'}}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });

}

function inspectWZ(cb, id){
    WZ.find({_id: id}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });
}

function newWZ(status, receiver, items, cb){

    var d = new Date();

    WZ.countDocuments({month: (d.getMonth()+1), year: d.getFullYear()}, function(err, count){

        var newWZ = new WZ({

            day: d.getDate(),
            month: (d.getMonth()+1),
            year: d.getFullYear(),
            number: count+1 + "/" + (d.getMonth()+1) + "/" + d.getFullYear(),
            status: status,
            receiver: receiver,
            items: items

        });

        newWZ.save();
        cb();

    });




}

function cancelWZ(id, cb){

    WZ.findByIdAndUpdate(id, {status: 'created'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na created");
    });

    cb();

}

function confirmWZ(id, cb){

    WZ.findByIdAndUpdate(id, {status: 'sent'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na created");
    });

    cb();

}

function deleteWZ(id, cb){

    WZ.findByIdAndUpdate(id, {status: 'deleted'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na deleted");
    });

    cb();
}





module.exports = {
    list: listWZ,
    connect: dbConnect,
    inspect: inspectWZ,
    newWZ: newWZ,
    cancel: cancelWZ,
    confirm: confirmWZ,
    delete: deleteWZ
};