var app = require('./express');
require('./db');
const mongoose = require('mongoose');

var tables = {};
app.get('/api/:table', findTable);
app.post('/api/:table', createInsertTable)

function findTable(req, res) {
    console.log('entering findTable');
    var table = req.params.table;
    // Check if this table is in the tables collections
    if (table in tables){
        res.json(table);
    }
    else{
        res.json();
    }
}


function createInsertTable(req, res){
    var table_body = req.body;
    var table_name = req.params.table;

    // Check if there exist such a table
    if (table_name in tables) {
        const table_model = mongoose.model(table_name + 'Model', tables[table_name]);
    }
    else{
        attributes = {};
        for (attr in table_body){
            attributes[attr] = typeof attr;
        }
        const table_schema = mongoose.Schema(attributes);
        tables[table_name] = table_schema;
        mongoose.model('', table_schema).create(table_body);
        res.json(table_body);
    }
    console.log("Finishing createInsertTable");
}