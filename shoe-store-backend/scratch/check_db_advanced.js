const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

async function check() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'shoe-store-backend', 'database.sqlite'),
        logging: false
    });

    try {
        console.log("Checking for tables...");
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log("Tables in database:", tables);

        if (tables.length > 0) {
            const tableName = tables.find(t => t.toLowerCase().includes('product')) || tables[0];
            console.log(`Checking table: ${tableName}`);
            
            const results = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`, { type: Sequelize.QueryTypes.SELECT });
            console.log(`Total rows in ${tableName}:`, results[0].count);

            if (results[0].count > 0) {
                const samples = await sequelize.query(`SELECT * FROM ${tableName} LIMIT 5`, { type: Sequelize.QueryTypes.SELECT });
                console.log('Sample rows:', JSON.stringify(samples, null, 2));
            }
        } else {
            console.log("No tables found in the database.");
        }

    } catch (e) {
        console.error('Error during database check:', e);
    } finally {
        await sequelize.close();
    }
}

check();
