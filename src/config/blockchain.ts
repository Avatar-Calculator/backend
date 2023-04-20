// @ts-nocheck
import axios from 'axios'

export async function getUserContracts(wallet: string, nextPageToken?: string)
{
    const url = nextPageToken !== undefined ?
        process.env.WEB3_HTTP_PROVIDER + `/getContractsForOwner?owner=${wallet}&pageKey=${nextPageToken}&pageSize=100`
        :
        process.env.WEB3_HTTP_PROVIDER + `/getContractsForOwner?owner=${wallet}&pageSize=100`;
    
    const results = (await axios.get(url)).data;
    let contracts = results.contracts.map(contract => contract.address);
    if(results.pageKey !== undefined) {
        contracts = contracts.concat(await getUserContracts(wallet, results.pageKey));
    }

    return contracts;
}

export async function getUserNFTs(wallet: string, contracts: string[], nextPageToken?: string)
{
    let nfts: String[] = [];
    console.log(nextPageToken === undefined ? "Searching: " + wallet : "Searching: " + wallet + " with next page token");

    //MAX 45 contracts per query
    if(contracts.length > 45) {
        const maxContracts = contracts.splice(0, 45);
        nfts = nfts.concat(await getUserNFTs(wallet, contracts));
        contracts = maxContracts;
    }

    let contractString = "";
    for(const contract of contracts) {
        contractString = contractString + `&contractAddresses[]=${contract}`
    }
    
    const url = nextPageToken !== undefined ?
        process.env.WEB3_HTTP_PROVIDER + `/getNFTs?owner=${wallet}&pageKey=${nextPageToken}&pageSize=100${contractString}&withMetadata=true`
        :
        process.env.WEB3_HTTP_PROVIDER + `/getNFTs?owner=${wallet}&pageSize=100&${contractString}&withMetadata=true`;

    const results = (await axios.get(url)).data;
    nfts = nfts.concat(results.ownedNfts.map(nft => nft.title.split("#")[0].slice(0, -1)).filter(str => str.length > 0));
    if(results.pageKey !== undefined) {
        nfts = nfts.concat(await getUserNFTs(wallet, contracts, results.pageKey));
    }

    return nfts;
}