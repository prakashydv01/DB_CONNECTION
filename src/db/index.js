import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async()=>{
    try {
        const connectioninstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Mongodb connected sucessfully|| DB HOST ${connectioninstance.connection.host}`)
    } catch (error) {
        console.log(" Mongodb connection fail", error);
        process.exit(1)
    }
}
export default connectDB
