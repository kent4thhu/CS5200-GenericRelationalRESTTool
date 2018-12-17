var app = require('./express');
const mongoose = require('mongoose');
require('./db')();

var tables = {};        // Collections to store the table name and its corresponding schema
app.get('/api/:table', findTable);
app.post('/api/:table', createInsertTable)
app.get('/api/:table/:id', findTableById);
app.put('/api/:table/:id', updateRecordById);
app.delete('/api/:table/:id', removeRecordById);
app.delete('/api/:table', truncateTable);

var relations = {};        // Collections to store the relations between tables
app.post('/api/:table1/:id1/:table2/:id2', createRelationTable);
app.get('/api/:table1/:id/:table2', findRelationsForTables);

function removeRecordById(req, res){
    const table = req.params.table;
    const id = req.params.id;

    if (table in tables){
        // Delete records with the target id
        mongoose.model(table, tables[table]).deleteMany({id: id}).then(function (t) {
            if (typeof t == 'undefined' || t == ""){
                res.json(t);
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
    // Truncate the collections
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
        mongoose.model(table, tables[table]).find({'id': id}).then(function (t){
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
        mongoose.model(table, tables[table]).find({'id':id}).then(function (t){
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
        mongoose.model(table, tables[table]).find().then(function (records){
            res.json(records);
        })
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

    // Extract the fields from the body of the request
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

        // Update the schema when there is new field comes in
        if (typeof table_model != 'undefined' && !(attr in table_model.schema.paths)){
            const new_attribute = {};
            new_attribute[attr] = attributes[attr];
            table_model.schema.add(new_attribute);
            tables[table_name].add(new_attribute);
        }
    }

    // If this is a new table
    if (typeof table_model == 'undefined'){
        console.log(attributes);
        const table_schema = mongoose.Schema(attributes);
        table_model = mongoose.model(table_name, table_schema);
        tables[table_name] = table_schema;
    }

    table_model.create(table_body).then(function (record){
        res.json(record);
    });
    console.log("Finishing createInsertTable");
}

function findRelationsForTables(req, res){
    const table1 = req.params.table1;
    const table2 = req.params.table2;
    const id = req.params.id;
    const relation_table1 = table1 + "s_" + table2;
    const relation_table2 = table2 + "s_" + table1;

    if (!(table2 in tables)){
        res.json();
        return;
    }
    console.log('-----------');
    var ids = [];
    const condition = {};
    condition[table1] = id;
    if (relation_table2 in relations){
        mongoose.model(relation_table2, relations[relation_table2]).find(condition, {table2}).then(function (records){
            for (const record in records){
                ids.push(record);
            }
        });
    }

    if (relation_table1 in relations){
        mongoose.model(relation_table1, relations[relation_table1]).find(condition, {table2}).then(function (records){
            for (const record in records){
                ids.push(record);
            }
        });
    }
    console.log(ids);
    mongoose.model(table2, tables[table2]).find({'id': {$in: res}}).then(function (records){
        res.json(records);
    });
}


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

    // Define the model of the relation of these two tables
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