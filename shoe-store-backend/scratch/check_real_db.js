const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

async function check() {
    // ACTIVE DB based on file size (80KB)
    const dbPath = 'D:\\Github\\project_cki_PTUD\\ai_shop_app\\shoe-store-backend\\database.sqlite';
    console.log(`Checking REAL database: ${dbPath}`);
    
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbPath,
        logging: false
    });

    try {
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log("Tables in database:", tables);

        if (tables.includes('Products')) {
            const results = await sequelize.query(`SELECT COUNT(*) as count FROM Products`, { type: Sequelize.QueryTypes.SELECT });
            console.log(`Total rows in Products:`, results[0].count);

            if (results[0].count > 0) {
                const samples = await sequelize.query(`SELECT id, name, brand, category, tag FROM Products LIMIT 10`, { type: Sequelize.QueryTypes.SELECT });
                console.log('Sample rows:', JSON.stringify(samples, null, 2));
            }
        } else {
            console.log("Products table NOT found.");
        }

    } catch (e) {
        console.error('Error during database check:', e);
    } finally {
        await sequelize.close();
    }
}

check();
