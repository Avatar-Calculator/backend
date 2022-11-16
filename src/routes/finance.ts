import express, { Request, Response } from 'express'
import Web3Utils from 'web3-utils'

import { collectUniqueWallets } from '../config/dataCollection'
import { isAuthenticated } from '../config/firebaseAuthMiddleware'
import { conversion, determineAvatars, lastSyncTime, prices, priceTimeseries } from '../config/nftPricing'
import { Accounts } from '../models/accounts'

export module Finance {
    export const router = express.Router();
    const termsOfService = "The data provided is available for users of https://avatarcalculator.com/ for personal uses. No commercial derivatives from this data will be allowed without written permission from the " +
        "owner of https://avatarcalculator.com/. Other developers may use this data with written permission from the owner of https://avatarcalculator.com/.";

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
            "sync": lastSyncTime,
            "termsOfService": termsOfService
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
            "sync": lastSyncTime,
            "termsOfService": termsOfService
        });
    })

    router.get('/avatars/prices', (req:Request, res:Response) => {
        res.status(201).send({
            "prices": prices,
            "termsOfService": termsOfService
        });
    })

    router.get('/avatars/timeseries', (req:Request, res:Response) => {
        res.status(201).send({
            "timeseries": priceTimeseries,
            "termsOfService": termsOfService
        });
    })
}