import https from 'https'
import cron from 'node-cron'

import { Avatars } from '../models/avatar'
import { AvatarTimeSeries } from '../models/avatar_timeseries'
import { WalletCaches } from '../models/wallet_caches'
import { getUserContracts, getUserNFTs } from './blockchain'
import { RedisDB } from './redis'

//Every 30 minutes
export const initCron = () => {
    getAvatarTimeSeries();
    getETHToUSDConversion();
    getAvatarPrices();
    cron.schedule('*/30 * * * *', () => {
        getETHToUSDConversion();
        getAvatarPrices();
    });
}

export let prices : { [key:string]: { floor_price: number, floor_price_change: number, last_sale: number, last_sale_change: number, generation: string, hyperlink: string }} = {};
export let priceTimeseries: { [key:string]: {floor_price: number, last_sale: number, createdAt: Date}[]} = {};
export let conversion: number = 0;

async function getAvatarPrices() {
    const avatars = await Avatars.find({}).lean();
    for(let avatar of avatars) {
        prices[avatar.name] = {
            floor_price: avatar.floor_price,
            floor_price_change: avatar.floor_price_change,
            last_sale: avatar.last_sale,
            last_sale_change: avatar.last_sale_change,
            generation: avatar.generation,
            hyperlink: avatar.hyperlink
        }
    }
    lastSyncTime = new Date();
    console.log("Refreshed Avatar prices at " + new Date().toISOString());
}

export async function getAvatarTimeSeries() {
    const timeseries = await AvatarTimeSeries.find({}).lean();
    for(let timeserie of timeseries) {
        priceTimeseries[timeserie.name] = timeserie.timeseries.map((el) => {
            return {
                floor_price: el.floor_price, 
                last_sale: el.last_sale, 
                createdAt: el.createdAt
            }
        })
    }
    console.log("Refreshed Avatar timeseries at " + new Date().toISOString());
}

const coinGeckoOptions = {
    path: '/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    method: 'GET',
    host: 'api.coingecko.com',
    port: 443,
    timeout: 30000,
}
async function getETHToUSDConversion() {
    const req = https.request(coinGeckoOptions, (res) => {
        let body = '';

        //Set body on data
        res.on('data', (chunk) => {
            body = body + chunk;
        });

        //On end, end the Promise
        res.on('end', () => {
            //Check if page is returned instead of JSON
            if (body.startsWith('<!DOCTYPE html>')) {
                console.warn('Invalid request: There was a problem with your request. The parameter(s) you gave are missing or incorrect.');
                console.log('Body: ' + body);
                console.log('Parameters: ' + coinGeckoOptions);
            } else if (body.startsWith('Throttled')) {
                console.warn('Throttled request: There was a problem with request limit.');
            }
            else {
                const result = JSON.parse(body);
                conversion = result.ethereum.usd;
                console.log("Refreshed ETH to USD conversion with value $" + conversion + " at " + new Date().toISOString());
            }
        });
    });

    req.on('error', (error) => console.log("Error with CoinGecko: " + error));

    //End request
    req.end();
}

export let lastSyncTime = new Date();

const CONTRACT_ADDRESSES = new Set([
    "0x5846728730366d686cdc95dae80a70b44ec9eab2",
    "0xfbed9640e37666fe2ac78e1d263670976354cb69",
    "0xe0743141df04a6b9f3df890429cc994e46db03d9",
    "0x97439ee4c93ff9f76417696ce648aa6f35ab3b25",
    "0xf43bc3f4F1edb7d4C373C8510A2888d69d83cEB7",
    "0x425bf054Ef7bAD65B7BDd8E6587B1c3500E4F4CA",
    "0x2956409293da98603025Cc0121C06A4244752039",
    "0xa7Bb50d90B43752199c45Be04053641C3cb5f53f",
    "0x47749C5B970e63F3a0ed57Cd6ceF773E74FaFe9d",
    "0x838c1CD42929543daF9C3ef294Fee8c1b3224B37",
    "0xC5Aa1F91b0d52e26D2847f8e51f505d6e2ECe795",
    "0xeE1Ee80338958fA596471CEb70F0177DafF80323",
    "0x4670e4890Bc1b76F3aE5c7660aA98E0B6668C6F3",
    "0x2d58a44d6c0a355de25761fb33a1f6269a97e2c5",
    "0xD8cF23bF309DE778609d234BD2410B0156118c26",
    "0x91E51B92a2EfEA89bF1B6f66ad719737264724bE",
    "0xd6261320F49d38c137f6e229a2EA4Ab0F4Fae6DE",
    "0xFC190440E8f357fFE8A75940e7D8A291E165d019",
    "0x808ED3E23aac685126524aA4416d8eaeB2E767B9",
    "0x65a83530Ca8abc27969907913Fe5E641a5DA2e9f",
    "0x6d1c3646e8Cce8537E6ec9eCAb26762bfAf1f891",
    "0x63e2f0C058Ce9A194eC68F04320b7Eb8cA555BD3",
    "0x45308788743bBDAe5DE7ba9e565c0502d0EBb81F",
    "0x907808732079863886443057C65827a0F1c64357",
    "0x8D0501d85becDA92B89E56177dDfcEA5Fc1f0AF2",
    "0x6ad08588568E258b2BdF065e7769FCE398F68A1C",
    "0x946aD8E53db653053E8ef7C02DFCA83ce8bA8022",
    "0x27B37E4Befacc50B02102d1E2117c4EA8A54bEFf",
    "0x71DC46607F31f30510f0ccc670B0963F431b212A",
    "0x6acB8fb82880d39c2B8446F8778A14d34Ee6cFb7",
    "0xbfd670667053e517a97AFE56C91e4f83f1160Bd3",
    "0xb9C042c3275BC49799688EEA1A29b1405D02946B",
    "0x466a330887bDF62D53f968EA824793150f07762e",
    "0x7E680862c572e4B945CF45912130C8D884109b59",
    "0xD5ae5A16fBAf964f96E242645a4a6F10b98fD0C4",
    "0x04f087e3191d7a050800A2e04cb20046D2633E35",
    "0x81BA34b90876F42F34a4f232CfC0FE4b6ec949a3",
    "0x2E90e8AF4C319095942C84cFA446E1f206795517",
    "0x83feea011baeb1c6d1df7d23903efad83d3c781f",
    "0xdaa6e4ba2d4022ed820460bb501b9e061d9614fb",
    "0x37db2523d221d19838632eb62d1af911e52632c3",
    "0xc70a7496716b3e25546901fe88215531abbd5a10",
    "0x621ce7e7e44d43a428a183d5390c4f4572c9ff9d",
    "0xFeC90bc707Fc93AeFeb0C18c2Eb56bc79d32163e",
    "0x0985cb10c5d57dbf44aa473f33839ed38d80f111",
    "0xdDbDB65138131DBf2d01b4a5140E1979680c90Bb",
    "0xe1b5e23fdbc003aec16e6e79726a0b5f75ff93f5",
    "0x5fd4d6fef3b87b91c7df8658727b5edd7210cf5a",
    "0xbc096988fa38c78d65c0637453fd3d3c38b1cfd4",
    "0xe4989961ebfdac3e65fcf0059c916452c77d8503",
    "0x3458161f2dc5d7eafa48e7c8d9acd7f415cf6da6",
    "0x3e4627665bf2e52c69be03788e664ab545f2be71",
    "0x8264e2bad3d2f7afd72a00233b9f841fe4b388cd",
    "0x334ad326a787dd332f26cbe8b4d7adfa8bd25f92",
    "0x91ac106090fe2b0fa7d01efdf4487a5bfafad7fa",
    "0x04f7a676af597f847053b6c02ed42d02fa4046aa",
    "0x45ee1caed83525673843321107bccadecb9065d7",
    "0x150afa2dfcaaada471472dfa6ad4b79e718a197c",
    "0x04125a97a0f2583cd485be2c34b651cc13c38a27",
    "0x21d426e2B88Fbf8b93adf0591A2D5B08d58F089f",
    "0xa3396af20ce52bd3c7ab6d7046be617257f60eb9",
    "0xc8d3a3a83bde5dad06d436694e3e22ac3e64d577"
].map(address => address.toLowerCase()));

let web3Lock = false; //mutual exclusion
export async function determineAvatars(wallets: string[]) {
    let nfts: String[] = [];
    
    for(let wallet of wallets) {
        try {
            const cache = await RedisDB.getData(`wallet_${wallet}`);
            if(cache) {
                nfts = nfts.concat(cache);
            } else {
                while(web3Lock) {
                    await new Promise(resolve => setTimeout(resolve, 1250));
                }

                web3Lock = true;
                const allNftContracts = await getUserContracts(wallet);
                const redditNftContracts = filterRedditContracts(allNftContracts);
                const results = await getUserNFTs(wallet, redditNftContracts);
                web3Lock = false;
                
                await RedisDB.setData(`wallet_${wallet}`, results, 86400); //1 day
                nfts = nfts.concat(results);
            }
        }
        catch(err) {
            console.log(err);
            web3Lock = false;
        }
    }

    return nfts;
}

function filterRedditContracts(contracts: string[]) {
    const results = [];
    for(const contract of contracts) {
        if(CONTRACT_ADDRESSES.has(contract)) {
            results.push(contract);
        }
    }

    return results;
}