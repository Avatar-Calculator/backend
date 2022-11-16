import https from 'https'
import cron from 'node-cron'
import AnkrProvider from '@ankr.com/ankr.js'

import { Avatars } from '../models/avatar'
import { PremiumWallets } from '../models/premium_wallets'
import { WalletCaches } from '../models/wallet_caches'

//Every 30 minutes
export const initCron = () => {
    getETHToUSDConversion();
    getAvatarPrices();
    cron.schedule('*/30 * * * *', () => {
        getETHToUSDConversion();
        getAvatarPrices();
    });
}

export let prices : { [key:string]: { floor_price: number, floor_price_change: number, last_sale: number, last_sale_change: number, generation: string, hyperlink: string }} = {};
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

const CONTRACT_ADDRESS_TO_COLLECTION_SLUG = {
    "0x5846728730366d686cdc95dae80a70b44ec9eab2": "imagination-station-x-reddit-collectible-avatars",
    "0xfbed9640e37666fe2ac78e1d263670976354cb69": "the-butterfly-garden-x-reddit-collectible-avatars",
    "0xe0743141df04a6b9f3df890429cc994e46db03d9": "drag-queens-of-big-gay-baby-x-reddit-collectible",
    "0x97439ee4c93ff9f76417696ce648aa6f35ab3b25": "creatures-of-the-nighties-x-reddit-collectible",
    "0xf43bc3f4F1edb7d4C373C8510A2888d69d83cEB7": "joy-girls-club-x-reddit-collectible-avatars",
    "0x425bf054Ef7bAD65B7BDd8E6587B1c3500E4F4CA": "avatar-rock-out-x-reddit-collectible-avatars",
    "0x2956409293da98603025Cc0121C06A4244752039": "protectors-of-the-forest-x-reddit-collectible-avat",
    "0xa7Bb50d90B43752199c45Be04053641C3cb5f53f": "bites-of-brazil-x-reddit-collectible-avatars",
    "0x47749C5B970e63F3a0ed57Cd6ceF773E74FaFe9d": "cute-cool-and-creepy-x-reddit-collectible-avatars",
    "0x838c1CD42929543daF9C3ef294Fee8c1b3224B37": "creatures-without-pants-x-reddit-collectible-avata",
    "0xC5Aa1F91b0d52e26D2847f8e51f505d6e2ECe795": "lightspeed-lads-x-reddit-collectible-avatars",
    "0xeE1Ee80338958fA596471CEb70F0177DafF80323": "growl-gang-x-reddit-collectible-avatars",
    "0x4670e4890Bc1b76F3aE5c7660aA98E0B6668C6F3": "old-school-cool-x-reddit-collectible-avatars",
    "0x2d58a44d6c0a355de25761fb33a1f6269a97e2c5": "aylia-x-reddit-collectible-avatars",
    "0xD8cF23bF309DE778609d234BD2410B0156118c26": "magic-of-the-woods-x-reddit-collectible-avatars",
    "0x91E51B92a2EfEA89bF1B6f66ad719737264724bE": "cute-snacks-x-reddit-collectible-avatars",
    "0xd6261320F49d38c137f6e229a2EA4Ab0F4Fae6DE": "peculiar-gang-x-reddit-collectible-avatars",
    "0xFC190440E8f357fFE8A75940e7D8A291E165d019": "gettin-groovy-x-reddit-collectible-avatars",
    "0x808ED3E23aac685126524aA4416d8eaeB2E767B9": "wearing-your-emotions-x-reddit-collectible-avatars",
    "0x65a83530Ca8abc27969907913Fe5E641a5DA2e9f": "i-quit-my-job-to-be-an-artist-x-reddit-collectibl",
    "0x6d1c3646e8Cce8537E6ec9eCAb26762bfAf1f891": "baked-goods-evils-x-reddit-collectible-avatars",
    "0x63e2f0C058Ce9A194eC68F04320b7Eb8cA555BD3": "enlightenment-x-reddit-collectible-avatars",
    "0x45308788743bBDAe5DE7ba9e565c0502d0EBb81F": "doodle-collection-x-reddit-collectible-avatars",
    "0x907808732079863886443057C65827a0F1c64357": "foustlings-x-reddit-collectible-avatars",
    "0x8D0501d85becDA92B89E56177dDfcEA5Fc1f0AF2": "the-senses-x-reddit-collectible-avatars",
    "0x6ad08588568E258b2BdF065e7769FCE398F68A1C": "the-minds-eyes-x-reddit-collectible-avatars",
    "0x946aD8E53db653053E8ef7C02DFCA83ce8bA8022": "natsukashii-x-reddit-collectible-avatars",
    "0x27B37E4Befacc50B02102d1E2117c4EA8A54bEFf": "5-boro-bodega-x-reddit-collectible-avatars",
    "0x71DC46607F31f30510f0ccc670B0963F431b212A": "celestial-assembly-x-reddit-collectible-avatars",
    "0x6acB8fb82880d39c2B8446F8778A14d34Ee6cFb7": "aww-friends-x-reddit-collectible-avatars",
    "0xbfd670667053e517a97AFE56C91e4f83f1160Bd3": "drip-squad-x-reddit-collectible-avatars",
    "0xb9C042c3275BC49799688EEA1A29b1405D02946B": "meme-team-x-reddit-collectible-avatars",
    "0x466a330887bDF62D53f968EA824793150f07762e": "the-singularity-x-reddit-collectible-avatars",
    "0x7E680862c572e4B945CF45912130C8D884109b59": "spooky-season-bodegacatceo-x-reddit-collectible-av",
    "0xD5ae5A16fBAf964f96E242645a4a6F10b98fD0C4": "spooky-season-dubbl3bee-x-reddit-collectible-avata",
    "0x04f087e3191d7a050800A2e04cb20046D2633E35": "spooky-season-puzzled-panther-x-reddit-collectible",
    "0x81BA34b90876F42F34a4f232CfC0FE4b6ec949a3": "spooky-season-stuttervoid-x-reddit-collectible-ava",
    "0x2E90e8AF4C319095942C84cFA446E1f206795517": "spooky-season-oana193-x-reddit-collectible-avatars",
    "0x83feea011baeb1c6d1df7d23903efad83d3c781f": "spooky-season-hoppy-doodle-x-reddit-collectible-av",
    "0xdaa6e4ba2d4022ed820460bb501b9e061d9614fb": "spooky-season-sys32template-x-reddit-collectible-a",
    "0x37db2523d221d19838632eb62d1af911e52632c3": "spooky-season-tandizojere-x-reddit-collectible-ava",
    "0xc70a7496716b3e25546901fe88215531abbd5a10": "spooky-season-genuineardvark-x-reddit-collectible",
    "0x621ce7e7e44d43a428a183d5390c4f4572c9ff9d": "spooky-season-eando9745-x-reddit-collectible-avata",
    "0xFeC90bc707Fc93AeFeb0C18c2Eb56bc79d32163e": "spooky-season-fmarxy-x-reddit-collectible-avatars",
    "0x0985cb10c5d57dbf44aa473f33839ed38d80f111": "spooky-season-thefattybagz-x-reddit-collectible-av",
    "0xdDbDB65138131DBf2d01b4a5140E1979680c90Bb": "spooky-season-aliciafreemandesigns-x-reddit-collec",
    "0xe1b5e23fdbc003aec16e6e79726a0b5f75ff93f5": "spooky-season-tfoust10-x-reddit-collectible-avatar",
    "0x5fd4d6fef3b87b91c7df8658727b5edd7210cf5a": "spooky-season-substantial-law-910-x-reddit-collect",
    "0xbc096988fa38c78d65c0637453fd3d3c38b1cfd4": "spooky-season-raunchyrancor-x-reddit-collectible-a",
    "0xe4989961ebfdac3e65fcf0059c916452c77d8503": "spooky-season-worsttwitchever-x-reddit-collectible",
    "0x3458161f2dc5d7eafa48e7c8d9acd7f415cf6da6": "spooky-season-conall-in-space-x-reddit-collectible",
    "0x3e4627665bf2e52c69be03788e664ab545f2be71": "spooky-season-rojom-x-reddit-collectible-avatars",
    "0x8264e2bad3d2f7afd72a00233b9f841fe4b388cd": "spooky-season-earthtoplanet-x-reddit-collectible-a",
    "0x334ad326a787dd332f26cbe8b4d7adfa8bd25f92": "spooky-season-laura-dumitriu-x-reddit-collectible",
    "0x91ac106090fe2b0fa7d01efdf4487a5bfafad7fa": "spooky-season-poieeeyee-x-reddit-collectible-avata",
    "0x04f7a676af597f847053b6c02ed42d02fa4046aa": "spooky-season-canetoonist-x-reddit-collectible-ava",
    "0x45ee1caed83525673843321107bccadecb9065d7": "spooky-season-tirli-x-reddit-collectible-avatars",
    "0x150afa2dfcaaada471472dfa6ad4b79e718a197c": "spooky-season-treasureofophiel-x-reddit-collectibl",
    "0x04125a97a0f2583cd485be2c34b651cc13c38a27": "spooky-season-avirenft-x-reddit-collectible-ava",
    "0x21d426e2B88Fbf8b93adf0591A2D5B08d58F089f": "spooky-season-baldtuesdays-x-reddit-collectible",
    "0x622d8fea4603ba9edaf1084b407052d8b0a9bed7": "reddit-cup-2022-x-reddit-collectible-avatars",
}

const ankrFilters = Object.keys(CONTRACT_ADDRESS_TO_COLLECTION_SLUG).map((obj) => { 
    const curr: { [key:string]: []} = {};
    curr[obj] = [];
    return curr;
})

const provider = new AnkrProvider();

export async function determineAvatars(wallets: string[]) {
    let nfts: String[] = [];
    
    for(let wallet of wallets) {
        try {
            const cache = await WalletCaches.findOne({"wallet": wallet});
            if(cache) {
                nfts = nfts.concat(cache.avatars);
            } else {
                while(ankrLock) {
                    await new Promise(resolve => setTimeout(resolve, 1250));
                }
                const results = await getWalletCollections(wallet);
                const expiry = await PremiumWallets.findOne({"wallet": wallet}) ?
                    new Date(new Date().getTime() + 30 * 60000)
                    :
                    new Date(new Date().getTime() + 720 * 60000);
                WalletCaches.create({
                    timestamp: new Date(),
                    wallet: wallet,
                    avatars: results,
                    expireAt: expiry
                });
                nfts = nfts.concat(results);
            }
        }
        catch(err) {
            console.log(err);
            ankrLock = false;
        }
    }

    return nfts;
}

//ANKR API LIMIT: 50 requests/minute
let ankrLock = false; //mutual exclusion
async function getWalletCollections(wallet: string, nextPageToken?: string) {
    ankrLock = true;
    console.log(nextPageToken === undefined ? "Searching: " + wallet : "Searching: " + wallet + " with next page token");
    
    const resultsPromise = nextPageToken !== undefined ?
        provider.getNFTsByOwner({
            blockchain: 'polygon',
            walletAddress: wallet,
            filter: ankrFilters,
            pageToken: nextPageToken
        })
        :
        provider.getNFTsByOwner({
            blockchain: 'polygon',
            walletAddress: wallet,
            filter: ankrFilters,
        });

    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1200))

    const results = await resultsPromise;
    let nfts = results.assets.map((obj) => {
        return obj.name.split("#")[0].slice(0, -1);
    }).filter(str => str.length > 0);

    if(results.nextPageToken !== '') {
        await timeoutPromise;
        nfts = nfts.concat(await getWalletCollections(wallet, results.nextPageToken));
    }
    else {
        timeoutPromise.then(() => ankrLock = false);
    }
    
    return nfts;
}