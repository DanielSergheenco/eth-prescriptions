const contract = artifacts.require("PrescriptionNFT");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(contract,
        [accounts[4], accounts[5]],
        ["Dr. med. Bob Smith", "Dr. med. Michael Brown"]);
};
