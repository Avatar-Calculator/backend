import express, { Request, Response, NextFunction } from 'express'
import AES from 'crypto-js/aes'
import encoding from 'crypto-js/enc-utf8'

import { getAvatarTimeSeries } from "../config/nftPricing";

export module Private {
    export const router = express.Router();
    export const isPrivate = async (req:Request, res:Response, next:NextFunction) => {
        try {
            var decryptedBytes = AES.decrypt(req.body.ciphertext, process.env.APP_AES_SECRET);
            var plaintext = decryptedBytes.toString(encoding);
            if(plaintext !== process.env.APP_AES_SECRET) {
                throw new Error();
            }
            return next();
        } catch (e) {
            return res
                .status(401)
                .send({ error: 'You are not authorized to make this request' });
        }
    }

    router.post('/timeseries', async (req:Request, res:Response) => {
        getAvatarTimeSeries();
        res.sendStatus(200);
    })
}