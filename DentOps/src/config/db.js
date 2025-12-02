const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    const conn = await mongoose.connect(mongoURI, { //TODO:remove this variable conn... 
      // These options are no longer needed in mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected 💫`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Please make sure your .env file exists with a valid MONGO_URI');
    process.exit(1);
  }
};

module.exports = connectDB;
