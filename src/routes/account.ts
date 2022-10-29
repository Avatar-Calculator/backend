import express, { Request, Response } from 'express'
import Web3Utils from 'web3-utils'

import { collectUniqueWallets } from '../config/dataCollection'
import { isAuthenticated } from '../config/firebaseAuthMiddleware'
import { Accounts } from '../models/accounts'
import { PremiumAccounts } from '../models/premium_accounts'
import { PremiumWallets } from '../models/premium_wallets'

export module Account {
    export const router = express.Router();

    router.get('/wallets', isAuthenticated, async (req:Request, res:Response) => {
        const account = await Accounts.findOne({ uid: res.locals.uid }).exec();
        
        if(!account) return res.sendStatus(404);
        
        res.status(201).send({
            "wallets": account.wallets
        });
    })

    router.post('/wallets', isAuthenticated, async (req:Request, res:Response) => {
        for(const wallet of req.body) {
            if(Web3Utils.isAddress(wallet) === false || (wallet).substring(0, 2) !== '0x')
                return res.sendStatus(404);
        }

        if(process.env.NODE_ENV === "production")
            collectUniqueWallets(req.body);

        let account = await Accounts.findOne({ uid: res.locals.uid }).exec();
        let premiumAccount= await PremiumAccounts.findOne({ uid: res.locals.uid }).exec();

        if(premiumAccount) {
            // @ts-ignore
            const addWallets = req.body.filter((val) => !account.wallets.includes(val));
            // @ts-ignore
            const removeWallets = account.wallets.filter((val) => !req.body.includes(val));

            for(const wallet of addWallets) {
                await PremiumWallets.create({
                    timestamp: new Date(),
                    uid: account.uid,
                    wallet: wallet,
                    expireAt: premiumAccount.expireAt
                });
            }

            for(const wallet of removeWallets) {
                await PremiumWallets.deleteOne({ uid: account.uid, wallet: wallet });
            }
        }

        if(account) {
            account.wallets = req.body;
        }
        else {
            account = new Accounts({
                uid: res.locals.uid,
                wallets: req.body
            })
        }

        account.save()
            .then(() => res.sendStatus(201))
            .catch(() => res.sendStatus(500));
    })
}