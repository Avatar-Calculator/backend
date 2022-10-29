import mongoose from 'mongoose'

export module Database {
    export const connect = async () => {
        try {
            if(process.env.MONGO_URI) {
                const conn = await mongoose.connect(process.env.MONGO_URI, {
                    autoIndex: false,
                    socketTimeoutMS: 10000,
                    maxPoolSize: 25,
                    minPoolSize: 5,
                });
                console.log('MongoDB Connected: ' + conn.connection.host);
            }
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    }
}