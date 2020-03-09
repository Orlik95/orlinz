const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const hbs = require("express-handlebars");
const session = require("express-session");
const warehouses = require("./own_modules/warehouses");
const inventory = require("./own_modules/inventory.js");
const wz = require("./own_modules/wz.js");
const rw = require("./own_modules/rw.js");
const pz = require("./own_modules/pz.js");
const inw = require("./own_modules/inw.js");
const itemsMain = require("./own_modules/itemsMain.js");
const app = express();

app.engine("handlebars", hbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded());

app.use(express.static("public"));
app.use(session({resave: true, saveUninitialized: true, secret: "asdfgh"}));

var sess = {
    name: "",
    link: ""
};



app.post("/", function(req, res){


    sess=req.session;
    sess.name = req.body.name;
    sess.link = req.body.link;

});

app.post("/inventory/add", function(req, res){

//console.log("Nazwa dla nowego artykułu: " + req.body.itemName);
    //console.log("test: " + items[0]._id);
    itemsMain.connect(function(){
        itemsMain.newItem(req.body.itemName, function(){
            itemsMain.findId(req.body.itemName, function(err, items){
                inventory.connect(sess.link, function(){
                    inventory.newItem(req.body.itemName, items[0]._id)
                })
            })
        })
    })



});

app.post("/inventory/:id", function(req, res){

    var id = req.params.id;
    var comment = req.body.comment;
    inventory.connect(sess.link);
    inventory.edit(id, comment);

});


app.post("/rw/add", function(req, res){

    var items = [];

    rw.connect(sess.link, function(){

        inventory.nameToId(req.body.array, function(err, ids){

            for(var i=0; i<ids.length; i++){

                items.push({
                    id: ids[i],
                    value: req.body.array[i].value
                })
            }

            rw.newRW(req.body.status, items, function(){

                inventory.rwModify(req.body.status, items, function(){

                    console.log("Dodano nowy dokument RW do kolekcji rw_docs i zmodyfikowano stany w kolekcji inventory");

                });


            });
        });

    });
});

app.post("/wz/add", function(req, res){

    var items = [];

    wz.connect(sess.link, function(){

        inventory.nameToId(req.body.array, function(err, ids){

            for(var i=0; i<ids.length; i++){

                items.push({
                    id: ids[i],
                    value: req.body.array[i].value
                })
            }

            wz.newWZ(req.body.status, req.body.receiver, items, function(){

                inventory.wzModify(req.body.status, items, function(){

                    console.log("Dodano nowy dokument WZ do kolekcji wz_docs i zmodyfikowano stany w kolekcji inventory");

                });


            });
    });






    });
});



app.post("/inw/add", function(req, res){

    var items = [];

    inw.connect(sess.link, function(){

        inventory.nameToId(req.body.array, function(err, ids){

            for(var i=0; i<ids.length; i++){

                items.push({
                    id: ids[i],
                    value: req.body.array[i].value
                })
            }

            inw.newINW(req.body.status, req.body.full, items, function(){

                inventory.inwModify(req.body.status, req.body.full, items, function(){

                    console.log("Dodano nowy dokument WZ do kolekcji inw_docs i zmodyfikowano stany w kolekcji inventory");

                });


            });
        });






    });
});

app.post("/pz/add", function(req, res){

    var items = [];

    pz.connect(sess.link, function(){

        inventory.nameToId(req.body.array, function(err, ids){

            for(var i=0; i<ids.length; i++){

                items.push({
                    id: ids[i],
                    value: req.body.array[i].value
                })
            }

            pz.newPZ(req.body.status, req.body.sender, items, function(){

                inventory.pzModify(req.body.status, items, function(){

                    console.log("Dodano nowy dokument PZ do kolekcji pz_docs i zmodyfikowano stany w kolekcji inventory");

                });


            });
        });






    });
});


app.get("/", function(req, res) {

    warehouses.connect(function(){

        warehouses.list(function(err, warehouses) {

            res.render("home", {
                warehouses: err ? [] : warehouses,
                name: sess.name
            });


        });


    });



});

app.get("/inventory", function(req, res) {

    inventory.connect(sess.link, function(){

        inventory.list(function(err, items) {

            res.render("inventory", {
                inventory: err ? [] : items,
                name: sess.name
            });

        })

    });

});

app.get("/inventory/add", function(req, res){

    res.render("inventory_add",{
        name: sess.name
    });

});



app.get("/inventory/:id", function(req, res){
    res.render("comment_edit",{
        name: sess.name
    });

});



app.get("/wz", function(req, res) {

    wz.connect(sess.link, function(){

        wz.list(function (err, items) {


            res.render("wz", {
                wz: err ? [] : items,
                name: sess.name
            });


        })

    });

});


app.get("/pz", function(req, res) {

    pz.connect(sess.link, function(){

        pz.list(function (err, items) {


            res.render("pz", {
                pz: err ? [] : items,
                name: sess.name
            });


        })

    });

});

app.get("/rw", function(req, res) {

    rw.connect(sess.link, function(){

        rw.list(function (err, items) {


            res.render("rw", {
                rw: err ? [] : items,
                name: sess.name
            });


        })

    });

});

app.get("/inw", function(req, res) {

    inw.connect(sess.link, function(){

        inw.list(function (err, items) {


            res.render("inw", {
                inw: err ? [] : items,
                name: sess.name
            });


        })

    });

});



app.get("/rw/add", function(req, res){

    res.render("rw_add",{
        name: sess.name

    });
});

app.get("/rw/:id", function(req, res){
    if(sess.link){

        rw.connect(sess.link, function(){

            rw.inspect(function(err, data) {

                inventory.idToName(data[0].items, function(err, names){


                    for(var i=0; i<names.length; i++){
                        data[0].items[i].nazwa=names[i];
                    }

                    res.render("rw_inspect", {
                        data: err ? [] : data,
                        names: err ? [] : names,
                        name: sess.name,
                        status: data.status,
                        id: data.id,
                        helpers: {
                            ifvalue: function (conditional, options) {
                                if (options.hash.value === conditional) {
                                    return options.fn(this)
                                } else {
                                    return options.inverse(this);
                                }
                            }
                        }
                    });

                });

            }, req.params.id)

        });

    }
    else
    {
        res.send("Wystapil blad - nie wybrano żadnego magazynu");
    }

});

app.put("/rw/:id/cancel", function(req, res){

    console.log("Otrzymany request PUT o anulowanie dokumentu dla dokumentu o ID " + req.params.id);

    rw.connect(sess.link, function(){
        rw.cancel(req.params.id, function(){
            rw.inspect(function(err, data){
                var items = data[0].items;
                inventory.rwCancel(items);

            }, req.params.id)
        });
    });


});

app.put("/rw/:id/confirm", function(req, res){

    console.log("Otrzymany request PUT o zatwierdzenie dokumentu dla dokumentu o ID " + req.params.id);

    rw.connect(sess.link, function(){
        rw.confirm(req.params.id, function(){
            rw.inspect(function(err, data){
                var items = data[0].items;
                inventory.rwConfirm(items);

            }, req.params.id)
        });
    });


});

app.delete("/rw/:id", function(req, res){

    console.log("Otrzymany request DELETE o usunięcię dokumentu dla dokumentu o ID " + req.params.id);

    rw.connect(sess.link, function(){
        rw.delete(req.params.id, function(){
            rw.inspect(function(err, data){
                var items = data[0].items;
                inventory.rwDelete(items);

            }, req.params.id)
        });
    });


});

app.get("/wz/add", function(req, res){

    res.render("wz_add",{
        name: sess.name

    });


});


app.get("/wz/:id", function(req, res){
    if(sess.link){

        wz.connect(sess.link, function(){

            wz.inspect(function(err, data) {

                inventory.idToName(data[0].items, function(err, names){


                    for(var i=0; i<names.length; i++){
                        data[0].items[i].nazwa=names[i];
                    }

                    res.render("wz_inspect", {
                        data: err ? [] : data,
                        names: err ? [] : names,
                        name: sess.name,
                        status: data.status,
                        id: data.id,
                        helpers: {
                            ifvalue: function (conditional, options) {
                                if (options.hash.value === conditional) {
                                    return options.fn(this)
                                } else {
                                    return options.inverse(this);
                                }
                            }
                        }
                    });

                });

            }, req.params.id)

        });

    }
    else
    {
        res.send("Wystapil blad - nie wybrano żadnego magazynu");
    }

});

app.put("/wz/:id/cancel", function(req, res){

    console.log("Otrzymany request PUT o anulowanie dokumentu dla dokumentu o ID " + req.params.id);

    wz.connect(sess.link, function(){
        wz.cancel(req.params.id, function(){
            wz.inspect(function(err, data){
                var items = data[0].items;
                inventory.wzCancel(items);

            }, req.params.id)
        });
    });


});

app.put("/wz/:id/confirm", function(req, res){

    console.log("Otrzymany request PUT o zatwierdzenie dokumentu dla dokumentu o ID " + req.params.id);

    wz.connect(sess.link, function(){
        wz.confirm(req.params.id, function(){
            wz.inspect(function(err, data){
                var items = data[0].items;
                inventory.wzConfirm(items);

            }, req.params.id)
        });
    });


});

app.delete("/wz/:id", function(req, res){

    console.log("Otrzymany request DELETE o usunięcię dokumentu dla dokumentu o ID " + req.params.id);

    wz.connect(sess.link, function(){
        wz.delete(req.params.id, function(){
            wz.inspect(function(err, data){
                var items = data[0].items;
                inventory.wzDelete(items);

            }, req.params.id)
        });
    });


});


app.get("/pz/add", function(req, res){

    res.render("pz_add",{
        name: sess.name

    });


});

app.get("/inw/add", function(req, res){

    res.render("inw_add",{
        name: sess.name

    });


});

app.get("/pz/:id", function(req, res){
    if(sess.link){

        pz.connect(sess.link, function(){

            pz.inspect(function(err, data) {

                inventory.idToName(data[0].items, function(err, names){


                    for(var i=0; i<names.length; i++){
                        data[0].items[i].nazwa=names[i];
                    }

                    res.render("pz_inspect", {
                        data: err ? [] : data,
                        names: err ? [] : names,
                        name: sess.name,
                        status: data.status,
                        id: data.id,
                        helpers: {
                            ifvalue: function (conditional, options) {
                                if (options.hash.value === conditional) {
                                    return options.fn(this)
                                } else {
                                    return options.inverse(this);
                                }
                            }
                        }
                    });

                });

            }, req.params.id)

        });

    }
    else
    {
        res.send("Wystapil blad - nie wybrano żadnego magazynu");
    }

});

app.put("/pz/:id/cancel", function(req, res){

    console.log("Otrzymany request PUT o anulowanie dokumentu dla dokumentu o ID " + req.params.id);

    pz.connect(sess.link, function(){
        pz.cancel(req.params.id, function(){
            pz.inspect(function(err, data){
                var items = data[0].items;
                inventory.pzCancel(items);

            }, req.params.id)
        });
    });


});

app.put("/pz/:id/confirm", function(req, res){

    console.log("Otrzymany request PUT o zatwierdzenie dokumentu dla dokumentu o ID " + req.params.id);

    pz.connect(sess.link, function(){
        pz.confirm(req.params.id, function(){
            pz.inspect(function(err, data){
                var items = data[0].items;
                inventory.pzConfirm(items);

            }, req.params.id)
        });
    });


});

app.delete("/pz/:id", function(req, res){

    console.log("Otrzymany request DELETE o usunięcię dokumentu dla dokumentu o ID " + req.params.id);

    pz.connect(sess.link, function(){
        pz.delete(req.params.id, function(){
            pz.inspect(function(err, data){
                var items = data[0].items;
                inventory.pzDelete(items);

            }, req.params.id)
        });
    });


});

app.get("/inw/:id", function(req, res){
    if(sess.link){

        inw.connect(sess.link, function(){

            inw.inspect(function(err, data) {

                inventory.idToName(data[0].items, function(err, names){


                    for(var i=0; i<names.length; i++){
                        data[0].items[i].nazwa=names[i];
                    }

                    res.render("inw_inspect", {
                        data: err ? [] : data,
                        names: err ? [] : names,
                        name: sess.name
                    });

                });

            }, req.params.id)

        });

    }
    else
    {
        res.send("Wystapil blad - nie wybrano żadnego magazynu");
    }

});


app.listen(process.env.PORT || 8080, () => {

    console.log("Uruchomiono serwer pod adresem http://localhost:8080/");

});