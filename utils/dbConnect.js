const mongoose = require('mongoose');

const dbURL = 'mongodb+srv://Codeplayadmin:Codeplayadmin@codeplay.yquzy4x.mongodb.net/Codeplay?retryWrites=true&w=majority&appName=Codeplay';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
      return cached.conn;
    }
  
    if (!cached.promise) {
      const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
      };
  
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    }
    cached.conn = await cached.promise;
    return cached.conn;
  }
  
  module.exports = dbConnect;