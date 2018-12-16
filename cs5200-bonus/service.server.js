var app = require('./express');
const mongoose = require('mongoose');
require('./db')();

var tables = {};
app.get('/api/:table', findTable);
app.post('/api/:table', createInsertTable)
app.get('/api/:table/:id', findTableById);
app.put('/api/:table/:id', updateRecordById);
app.delete('/api/:table/:id', removeRecordById);
app.delete('/api/:table', truncateTable);

function removeRecordById(req, res){
    const table = req.params.table;
    const id = req.params.id;

    if (table in tables){
        mongoose.model(table, tables[table]).deleteMany({id: id}).then(function (t) {
            if (typeof t == 'undefined'){
                res.json();
            }
            else{
                res.sendStatus(200);
            }
        }, function (err) {
            res.send(err);
        });
    }
    else{
        res.json();
    }
}

function truncateTable(req, res){
    const table = req.params.table;
    mongoose.model(table, tables[table]).remove({},function (err){
        console.log(err);
    });
    res.json();
}

function updateRecordById(req, res){
    const table = req.params.table;
    const id = req.params.id;
    const body = req.body;

    // Check if this table is in the tables collections
    if (table in tables){
        mongoose.model(table, tables[table]).findById(id).then(function (t){
            req.body = body;
            createInsertTable(req, res);
        });
    }
    else{
        res.json();
    }
}

function findTableById(req, res){
    const table = req.params.table;
    const id = req.params.id;

    // Check if this table is in the tables collections
    if (table in tables){
        mongoose.model(table, tables[table]).findById(id).then(function (t){
            req.body = t;
        });
    }
    else{
        res.json();
    }
}

function findTable(req, res) {
    const table = req.params.table;
    // Check if this table is in the tables collections
    if (table in tables){
        res.json(table);
    }
    else{
        res.json();
    }
    console.log('Finishing findTable');
}


function createInsertTable(req, res){
    var table_body = req.body;
    var table_name = req.params.table;
    var table_model = undefined;

    // Check if there exist such a table
    if (table_name in tables) {
        table_model = mongoose.model(table_name, tables[table_name]);
    }

    attributes = {};
    for (attr in table_body){
        if (typeof attr == 'string'){
            attributes[attr] = {type: String, default: null};
        }
        else if (typeof attr == 'date'){
            attributes[attr] = {type: Date, default: null};
        }

        else if (typeof attr == 'number'){
            attributes[attr] = {type: Number, default: null};
        }

        if (typeof table_model != 'undefined' && !(attr in table_model.schema.paths)){
            const new_attribute = {};
            new_attribute[attr] = attributes[attr];
            table_model.schema.add(new_attribute);
            tables[table_name].add(new_attribute);
        }
    }

    if (typeof table_model == 'undefined'){
        const table_schema = mongoose.Schema(attributes);
        table_model = mongoose.model(table_name, table_schema);
        tables[table_name] = table_schema;
    }

    table_model.create(table_body);

    res.json(table_body);

    console.log("Finishing createInsertTable");
}