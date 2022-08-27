const contract = artifacts.require("PrescriptionNFT");

module.exports = function(deployer, network, accounts) {
    if(network == 'development') {
        deployer.deploy(contract,
          [accounts[1], accounts[2]],         //S-a specificat primele 2 adrese cunoscute in reteaua locala ganache
          ["Prof. Dr. Catalin Popescu", "Prof. Dr. Ioana Achim"]);
    }
    else {
        deployer.deploy(contract, ["0xe95f524fbe1443c2cfeEBE60bF4a6B17BE0f0D72"], ["Dr. Popescu"])
    }
};
