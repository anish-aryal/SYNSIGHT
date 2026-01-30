import mongoose from 'mongoose';

// Database connection setup.

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. MongoDB is running (if local)');
    console.error('2. Connection string is correct');
    console.error('3. IP is whitelisted (if Atlas)');
    console.error('4. Username/password are correct');
    process.exit(1);
  }
};

export default connectDB;