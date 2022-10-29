import { Wallets } from '../models/wallets'

export function collectUniqueWallets(wallets: string[]) {
    for(let wallet of wallets) {
        Wallets.findOne({ wallet: wallet })
            .then((res) => {
                if(!res) {
                    new Wallets({ wallet: wallet }).save();
                }
            });
    }
} 