require("dotenv").config();
const mongoose = require("mongoose");

const connectToDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "MongoDB URI is not provided. Please set the MONGODB_URI environment variable."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = { connectToDatabase };
