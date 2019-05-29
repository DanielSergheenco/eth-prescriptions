import ABI from "./ABI";
let ethers = require('ethers')
require('dotenv').config();

export async function setupContract(){

    const provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    let accounts = await provider.listAccounts();
    let signer = provider.getSigner();
    let instance = new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, ABI, signer);
    return {accounts: accounts, instance: instance};
}