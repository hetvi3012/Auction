const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Support DATABASE_URL (Render, Railway, Heroku) or individual vars (local/Docker)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production'
          ? { require: true, rejectUnauthorized: false }
          : false,
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'fairplay_auction',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '301204',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
      }
    );

module.exports = sequelize;
