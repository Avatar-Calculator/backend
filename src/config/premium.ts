import dotenv from 'dotenv'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

import { Database } from '../config/db'
import { PremiumAccounts } from '../models/premium_accounts'
import { PremiumWallets } from '../models/premium_wallets'
import { Accounts } from '../models/accounts'

dotenv.config();
Database.connect();

//ENTER PREMIUM USERS EMAIL HERE
const email = "";

giverUserPremium(email);
export async function giverUserPremium(email: string) {
    const firebaseApp = initializeApp();
    const userInfo = await getAuth().getUserByEmail(email);

    const walletInfo = await Accounts.findOne({ uid: userInfo.uid }).lean();
    const currentDate = new Date();
    const expiryDate = new Date().setMonth(currentDate.getMonth() + 1); //expires in 1 month
    await PremiumAccounts.create({
        timestamp: new Date(),
        uid: userInfo.uid,
        expireAt: expiryDate
    });

    for(const wallet of walletInfo.wallets) {
        await PremiumWallets.create({
            timestamp: new Date(),
            uid: userInfo.uid,
            wallet: wallet,
            expireAt: expiryDate
        });
    }

    console.log("Upgraded account to premium.");
}