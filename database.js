const mongoose = require("mongoose");

exports.connectWithMongoDb = () => {
  mongoose
    .connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) =>
      console.log(`Database connected to ${data.connection.host} `)
    )
    .catch((error) => console.log(error));
};
