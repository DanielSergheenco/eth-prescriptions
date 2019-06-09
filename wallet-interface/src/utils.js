import ABI from "./ABI";
let ethers = require('ethers')
let contract = '0x1854140B3782bCfabC05123603746AF1Df2d782d'

export async function setupContract(){

    const provider = new ethers.providers.JsonRpcProvider('http://localhost:7545')
    let accounts = await provider.listAccounts();
    let signer = provider.getSigner();
    let instance = new ethers.Contract(contract, ABI, signer);
    return {accounts: accounts, instance: instance};
}