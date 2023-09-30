import mongoose from "mongoose";

async function connectDb(){
    try {
        await mongoose.connect(process.env.MONGODB_URI as string)
        console.log('DB Connected ✅')
    } catch (error) {
        console.log('DB Error ❌', error)
    }
}

export default connectDb