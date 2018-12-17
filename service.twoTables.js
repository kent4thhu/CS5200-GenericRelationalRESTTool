var app = require('./express');
const mongoose = require('mongoose');
require('./db')();

var relations = {};        // Collections to store the relations between tables
app.post('/api/:table1/:id1/:table2/:id2', createRelationTable);

function createRelationTable(req, res){
    const table1 = req.params.table1;
    const table2 = req.params.table2;
    const id1 = req.params.id1;
    const id2 = req.params.id2;
    const relation_table1 = table1 + "s_" + table2;
    const relation_table2 = table2 + "s_" + table1;

    var pairs = {};
    // Create schema and insert into the collections when never face this before
    if (!(relation_table1 in relations) && !(relation_table2 in relations)){
        pairs[table1] = Number;
        pairs[table2] = Number;
        const relation_schema = mongoose.Schema(pairs);
        relations[relation_table1] = relation_schema;
    }

    var relation_model;

    if (relation_table1 in relations){
        relation_model = mongoose.model(relation_table1, relations[relation_table1]);
    }

    if (relation_table2 in relations){
        relation_model = mongoose.model(relation_table2, relations[relation_table2])
    }
    // Insert the record into the table
    pairs = {};
    pairs[table1] = id1;
    pairs[table2] = id2;
   relation_model.create(pairs).then(function (t){
        res.json(t);
    });
}