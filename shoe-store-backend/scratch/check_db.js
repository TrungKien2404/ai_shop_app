const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

async function check() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '..', 'shoe-store-backend', 'database.sqlite'),
        logging: false
    });

    try {
        const Product = sequelize.define('Product', {
            name: DataTypes.STRING,
            brand: DataTypes.STRING,
            category: DataTypes.STRING,
            tag: DataTypes.STRING
        }, { tableName: 'Products' });

        const count = await Product.count();
        console.log(`Total products in database: ${count}`);
        
        const samples = await Product.findAll({ limit: 5 });
        console.log('Sample products:', JSON.stringify(samples, null, 2));

    } catch (e) {
        console.error('Error checking DB:', e);
    } finally {
        await sequelize.close();
    }
}

check();
