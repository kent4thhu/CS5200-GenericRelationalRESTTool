var app = require('./express');
const mongoose = require('mongoose');
require('./db')();

var tables = {};
app.get('/api/:table', findTable);
app.post('/api/:table', createInsertTable)
app.get('/api/:table/:id', findTableById);

function findTableById(req, res){
    const table = req.params.table;
    const id = req.params.id;

    // Check if this table is in the tables collections
    if (table in tables){
        mongoose.model(table, tables[table]).findById(id).then(function (t){
            res.json(t);
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
            table_model.schema.add(attributes[attr]);
            tables[table_name].add(attributes[attr]);
        }
    }

    if (typeof table_model == 'undefined'){
        const table_schema = mongoose.Schema(attributes);
        table_model = mongoose.model(table_name, table_schema);
        tables[table_name] = table_schema;
    }

    table_model.create(table_body, function (err){
        console.log(err);
    });

    res.json(table_body);

    console.log("Finishing createInsertTable");
}