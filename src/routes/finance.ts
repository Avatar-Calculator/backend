import express, { Request, Response } from 'express'
import Web3Utils from 'web3-utils'

import { collectUniqueWallets } from '../config/dataCollection'
import { isAuthenticated } from '../config/firebaseAuthMiddleware'
import { conversion, determineAvatars, lastSyncTime, prices } from '../config/nftPricing'
import { Accounts } from '../models/accounts'

export module Finance {
    export const router = express.Router();

    router.get('/avatars', async (req:Request, res:Response) => {
        if(Web3Utils.isAddress(req.query.wallet as string) === false || (req.query.wallet as string).substring(0, 2) !== '0x')
            return res.sendStatus(404);

        if(process.env.NODE_ENV === "production")
           collectUniqueWallets([req.query.wallet] as string[]);
        
        const result = await determineAvatars([req.query.wallet] as string[]);
        res.status(201).send({
            "avatars": result,
            "conversion": conversion,
            "prices": prices,
            "sync": lastSyncTime
        });
    })

    router.get('/avatars/auth', isAuthenticated, async (req:Request, res:Response) => {
        const account = await Accounts.findOne({ uid: res.locals.uid }).exec();
        
        if(!account) return res.sendStatus(404);

        const result = await determineAvatars(account.wallets as string[]);
        res.status(201).send({
            "avatars": result,
            "conversion": conversion,
            "prices": prices,
            "sync": lastSyncTime
        });
    })
}