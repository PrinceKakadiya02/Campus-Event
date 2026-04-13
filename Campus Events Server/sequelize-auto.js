require('dotenv').config();
const SequelizeAuto = require('sequelize-auto');

const auto = new SequelizeAuto(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    directory: './models', // where to write files
    port: process.env.DB_PORT,
    caseModel: 'c', // convert snake_case column names to camelCase field names: user_id -> userId
    caseFile: 'c', // file names created for each model use camelCase.js not snake_case.js
    singularize: true, // convert plural table names to singular model names
    additional: {
        timestamps: false
        // ...options added to each model
    },
    tables: ['users', 'events', 'user_registrations', 'contacts'] // use all tables, if omitted
    //...
})

auto.run().then(data => {
    console.log(data.tables);
    console.log(data.foreignKeys);
});