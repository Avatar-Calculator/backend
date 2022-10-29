import mongoose from 'mongoose'

const Schema = new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },
    wallets : [
        {
            type: String,
            required: true
        }
    ]
})

export const Accounts = mongoose.model('Account', Schema);