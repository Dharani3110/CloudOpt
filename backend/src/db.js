const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cloudopt';
  try {
    await mongoose.connect(uri);
    console.log('[db] connected to MongoDB');
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    console.error('[db] backend will keep running; job persistence will fail until DB is reachable');
  }
}

module.exports = connectDB;
