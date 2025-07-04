const mongoose = require("mongoose");
const PORT = process.env.PORT;

const connectionWithMongooseDB = (app)=>{
    try {
        mongoose.connect(process.env.DB_URL)
        .then((res)=>{
            console.log("connecation has been successfully!")
            app.listen(PORT, ()=> console.log("server is running on PORT", PORT))
            
        })
        .catch((err)=>{
            console.log(err)
            process.exit(1);
        })
    } catch (error) {
            console.log(err)
            process.exit(1);
    }
}

module.exports = connectionWithMongooseDB;