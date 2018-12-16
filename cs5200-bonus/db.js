/**
 * Created by kent4 on 12/16/2018.
 */

module.exports = function () {
    const mongoose = require('mongoose');
    const databaseName = 'white-board';
    var   connectionString =
        'mongodb://localhost/';
    connectionString += databaseName;
    mongoose.connect(connectionString);
};