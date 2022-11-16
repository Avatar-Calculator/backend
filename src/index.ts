import express from 'express'
import dotenv from 'dotenv'
import { initializeApp } from 'firebase-admin/app'

import { Database } from './config/db'
import { initCron } from './config/nftPricing'
import { Account } from './routes/account'
import { Finance } from './routes/finance'
import { Private } from './routes/private'

dotenv.config();
Database.connect();

const firebaseApp = initializeApp();

initCron();

const app = express();
const port = 5000;

app.use(express.json());

app.use('/account', Account.router);
app.use('/finance', Finance.router);
app.use('/private', Private.isPrivate, Private.router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})