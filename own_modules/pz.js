const mongoose = require("mongoose");


var Items = new mongoose.Schema({
    id: String,
    value: Number,
    name: String
},{ _id : false });

var pz_schema = new mongoose.Schema({
    number: String,
    day: Number,
    month: Number,
    year: Number,
    status: String,
    sender: String,
    items: [Items]

});

var PZ = mongoose.model("PZ", pz_schema, "pz_docs");

function dbConnect(link, cb){
    mongoose.connect(link, cb)
}

function listPZ(cb) {

    PZ.find({status: {$ne: 'deleted'}}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });

}

function inspectPZ(cb, id){
    PZ.find({_id: id}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });
}

function newPZ(status, sender, items, cb){

    var d = new Date();


    PZ.countDocuments({month: (d.getMonth()+1), year: d.getFullYear()}, function(err, count){

        var newPZ = new PZ({

            day: d.getDate(),
            month: (d.getMonth()+1),
            year: d.getFullYear(),
            number: count+1 + "/" + (d.getMonth()+1) + "/" + d.getFullYear(),
            status: status,
            sender: sender,
            items: items

        });

        newPZ.save();
        cb();

    });




}

function cancelPZ(id, cb){

    PZ.findByIdAndUpdate(id, {status: 'created'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na created");
    });

    cb();

}

function confirmPZ(id, cb){

    PZ.findByIdAndUpdate(id, {status: 'received'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na incoming");
    });

    cb();

}

function deletePZ(id, cb){

    PZ.findByIdAndUpdate(id, {status: 'deleted'}, function(){
        console.log("Zmieniono status dokumentu o ID " + id + " na deleted");
    });

    cb();
}






module.exports = {
    list: listPZ,
    connect: dbConnect,
    inspect: inspectPZ,
    newPZ: newPZ,
    cancel: cancelPZ,
    confirm: confirmPZ,
    delete: deletePZ
};