const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");


var inventory_schema = new mongoose.Schema({
    item_id: String,
    name: {type: String, required: true, unique: true},
    availability: Number,
    pending: Number,
    incoming: Number,
    comment: String
});

inventory_schema.plugin(uniqueValidator);

var Inventory = mongoose.model("Inventory", inventory_schema, "inventory");

function dbConnect(link, cb){
    mongoose.connect(link, cb)
}

function listInventory(cb) {

    Inventory.find({}).exec(function(err, items) {

        if(err) {
            cb(err);
        } else {
            cb(null, items);
        }

    });

}

function editComment(item_id, comment){

    Inventory.findOneAndUpdate({item_id: item_id}, {comment: comment}).exec();

}

function idToName(data, cb){

    var array = [];
    for(var i=0; i<data.length; i++){
        Inventory.find({item_id: data[i].id}).exec(function(err, item){
            array.push(item[0].name);

            if(data.length===array.length){

                if(err) {
                    cb(err)
                }
                else {
                    cb(null, array)
                }

            }


        });

    }

}

function nameToId(data, cb){

    var array = [];
    for(var i=0; i<data.length; i++){
        Inventory.find({name: data[i].name}).exec(function(err, item){

            if(item[0]!==undefined){
                array.push(item[0].item_id);
            }


            if(data.length===array.length){

                if(err) {
                    cb(err)
                }
                else {
                    cb(null, array)
                }

            }


        });

    }



}


function wzrwModify(status, items, cb){

    if(status==="created"){

        for(var i=0; i<items.length; i++){

            Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"pending": items[i].value}}).exec();
            Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"availability": -items[i].value}}).exec();

        }

        cb();

    }
    else if(status==="sent" || status==="accepted"){

        for(var i=0; i<items.length; i++){

            Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"availability": -items[i].value}}).exec();

        }

        cb();

    }

}


function pzModify(status, items, cb){

    if(status==="created"){

        for(var i=0; i<items.length; i++){

            Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"incoming": items[i].value}}).exec();

        }

        cb();

    }
    else if(status==="received"){

        for(var i=0; i<items.length; i++){

            Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"availability": items[i].value}}).exec();

        }

        cb();

    }

}


function inwModify(status, full, items, cb){

    if(status==="created"){

        cb();

    }
    else if(status==="accepted"){

        if(full){


            Inventory.updateMany({}, {availability: 0}).exec();

            for(var i=0; i<items.length; i++){

                Inventory.findOneAndUpdate({item_id: items[i].id}, {"availability": items[i].value}).exec();

            }

        }
        else
        {

            for(var i=0; i<items.length; i++){

                Inventory.findOneAndUpdate({item_id: items[i].id}, {"availability": items[i].value}).exec();

            }

        }



        cb();

    }

}

function wzrwCancel(items){

    for(var i=0; i<items.length; i++){

        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"pending": items[i].value}}).exec();

    }

}

function wzrwConfirm(items){

    for(var i=0; i<items.length; i++){

        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"pending": -items[i].value}}).exec();

    }

}

function wzrwDelete(items){

    for(var i=0; i<items.length; i++){

        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"pending": -items[i].value}}).exec();
        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"availability": items[i].value}}).exec();

    }

}

function pzCancel(items){

    for(var i=0; i<items.length; i++){

        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"incoming": items[i].value}}).exec();
        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"availability": -items[i].value}}).exec();

    }

}

function pzConfirm(items){

    for(var i=0; i<items.length; i++){

        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"incoming": -items[i].value}}).exec();
        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"availability": items[i].value}}).exec();


    }

}

function pzDelete(items){

    for(var i=0; i<items.length; i++){

        Inventory.findOneAndUpdate({item_id: items[i].id}, {$inc: {"incoming": -items[i].value}}).exec();

    }

}

function newItem(name, item_id){

    var newItem = new Inventory({

        name: name,
        item_id: item_id,
        comment: "",
        availability: 0,
        pending: 0,
        incoming: 0

    });

    newItem.save();
}

module.exports = {
    list: listInventory,
    connect: dbConnect,
    edit: editComment,
    idToName: idToName,
    nameToId: nameToId,
    wzModify: wzrwModify,
    rwModify: wzrwModify,
    pzModify: pzModify,
    inwModify: inwModify,
    wzCancel: wzrwCancel,
    wzConfirm: wzrwConfirm,
    wzDelete: wzrwDelete,
    pzCancel: pzCancel,
    pzConfirm: pzConfirm,
    pzDelete: pzDelete,
    rwCancel: wzrwCancel,
    rwConfirm: wzrwConfirm,
    rwDelete: wzrwDelete,
    newItem: newItem,
}