/**
 * Created by kent4 on 12/16/2018.
 */

module.exports = function () {
    const mongoose = require('mongoose');
    const databaseName = 'white-board';
    var   connectionString =
        '@ds135704.mlab.com:35704/heroku_g4s147t1';
    const username = process.env.MONG_WEB_USERNAME;
    const password = process.env.MONG_WEB_PASSWORD;
    connectionString = 'mongodb://' + username + ":" + password + connectionString;
    mongoose.connect(connectionString);
};