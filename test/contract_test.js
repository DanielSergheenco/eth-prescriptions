const PrescriptionNFT = artifacts.require("PrescriptionNFT");

contract("PrescriptionNFT", accounts => {
    it("should prescribe prescription to patient", async () => {
        let i = await PrescriptionNFT.deployed();
        let tx = await i.prescribe(accounts[1], 'Aspirin Complex', 'test', 23, 'ml', 3, 123, 234, {from: accounts[4]});
        assert.equal(tx.receipt.status, true, "Transaction failed");

        let tokens = await i.tokensOf(accounts[1]);
        assert.equal(tokens.length, 1, "Token was not created");
    });

    it("should retrieve the contents of an existing token and verify contents", async () => {
        let i = await PrescriptionNFT.deployed();
        let tokens = await i.tokensOf(accounts[1]);

        let prescription = await i.prescriptions(tokens[0]);
        assert.equal(prescription.metadata.doctor, accounts[4], "Wrong Doctor");
        assert.equal(prescription.metadata.medicationName, "Aspirin Complex", "Wrong Medication Name")
    });

    it("should transfer one prescription from a patient to a pharmacy", async () => {
        let i = await PrescriptionNFT.deployed();
        let tokens = await i.tokensOf(accounts[1]);

        assert.isAtLeast(tokens.length, 1, "Account has no tokens");

        let tx = await i.transfer(accounts[2], tokens[0], {from: accounts[1]});

        assert.equal(tx.receipt.status, true, "Transaction failed");

        let balance = await i.balanceOf.call(accounts[2]);
        let tokenBalance = balance.toNumber();

        assert.equal(tokenBalance, 1, "Token was not transferred");
    });

    it("should approve a new doctor ID and verify it", async() => {
        let i = await PrescriptionNFT.deployed()
    });


});
