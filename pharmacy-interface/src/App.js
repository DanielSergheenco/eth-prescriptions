/**
 * web3Context = {
 *   accounts: {Array<string>} - All accounts
 *   selectedAccount: {string} - Default ETH account address (coinbase)
 *   network: {string} - One of 'MAINNET', 'ROPSTEN', or 'UNKNOWN'
 *   networkId: {string} - The network ID (e.g. '1' for main net)
 }
*/

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './App.css';

import 'bootstrap/dist/css/bootstrap.css';
import {
  Media, Table, Button,
  Modal, ModalHeader,
  ModalBody, ModalFooter, Form, FormGroup,
  Label, Input
} from 'reactstrap';

class ModalForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: { "dosage-unit": "ml" },
    };
  }

  componentDidMount() {
    const MyContract = window.web3.eth.contract([{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"approvedFor","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"tokensOf","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_doctorToApprove","type":"uint256"}],"name":"approveDoctor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_pharmacyAddress","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"fillPrescription","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"takeOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_patientAddress","type":"address"},{"name":"_doctorId","type":"uint256"},{"name":"_medicationName","type":"string"},{"name":"_brandName","type":"string"},{"name":"_dosage","type":"uint8"},{"name":"_dosageUnit","type":"string"},{"name":"_dateFilled","type":"uint256"},{"name":"_expirationTime","type":"uint256"}],"name":"prescribe","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"doctorIdsToApprove","type":"uint256[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_approved","type":"address"},{"indexed":false,"name":"_tokenId","type":"uint256"}],"name":"Approval","type":"event"}]);

    this.state.ContractInstance = MyContract.at("0x3F99865D325E070131a34d391E79DAB56FDf3e0E")
  }

  sendPrescription() {
    debugger;

    this.state.ContractInstance.prescribe(
      this.state.formState["patient-address"],
      1, // hard-coded doctor ID.
      this.state.formState["medication-name"],
      this.state.formState["brand-name"],
      this.state.formState["dosage-quantity"],
      this.state.formState["dosage-unit"],
      this.state.formState["pill-quantity"],
      Date.now(),
      Date.now(this.state.formState["expiration-date"]),
      {
        gas: 300000,
        gasPrice: 400000000000,
        from: this.context.web3.selectedAccount,
        value: 0
      },
      (err, result) => {
        console.log("Err", err);
        console.log("Res", result);
        if (result) { this.props.toggle(); }
      }
    );

    return false;
  }

  inputUpdate(event) {
    this.setState({ formState: { ...this.state.formState, [event.target.name]: event.target.value }});
    return false;
  }

  render () {
    console.log(this.state.formState);
    return (
      <Modal isOpen={this.props.visibility} toggle={this.props.toggle}>
        <ModalHeader toggle={this.props.toggle}>Create a prescription</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="exampleEmail">Patient wallet address:</Label>
              <Input type="text" name="patient-address" onChange={this.inputUpdate.bind(this)} value={this.state.formState["patient-address"] || ""} placeholder="0x123f681646d4a755815f9cb19e1acc8565a0c2ac" />
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Medication Name</Label>
              <Input type="text" name="medication-name" onChange={this.inputUpdate.bind(this)} value={this.state.formState["medication-name"] || ""} />
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Brand Name</Label>
              <Input type="text" name="brand-name" onChange={this.inputUpdate.bind(this)} value={this.state.formState["brand-name"] || ""} />
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Dosage</Label>
              <Input type="number" name="dosage-quantity" onChange={this.inputUpdate.bind(this)} value={this.state.formState["dosage-quantity"] || ""} />
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Dosage Unit</Label>
              <Input type="select" name="dosage-unit" onChange={this.inputUpdate.bind(this)} value={this.state.formState["dosage-unit"] || ""} >
                <option value="ml">ml</option>
                <option value="mg">mg</option>
                <option value="tablets">tablets</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Number of pills</Label>
              <Input type="number" name="pill-quantity" onChange={this.inputUpdate.bind(this)} value={this.state.formState["pill-quantity"] || ""} />
            </FormGroup>
            <FormGroup>
              <Label for="exampleEmail">Expirate Date</Label>
              <Input type="date" name="expiration-date" placeholder="" onChange={this.inputUpdate.bind(this)} value={this.state.formState["expiration-date"] || ""} />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>{' '}
          <Button color="primary" onClick={this.sendPrescription.bind(this)}>Send Prescription</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

ModalForm.contextTypes = {
  web3: PropTypes.object
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      transactionLogs: [
        // some sample transaction logs to populate the demo
        {
          expiryTime: new Date("3/31/18"),
          prescribedAt: new Date("3/7/18"),
          patientWalletAddress: "0x1a0e14c6c2d16dd42b00b4152645a8b51f2698d6",
          medicationName: "Atorvastatin Calcium",
          brandName: "Lipitor",
          dosage: "120",
          dosageUnit: "mg",
        },
        {
          expiryTime: new Date("3/17/18"),
          prescribedAt: new Date("3/2/18"),
          patientWalletAddress: "0x1a0e14c6c2d16dd42b00b4152645a8b51f2698d6",
          medicationName: "Omeprazole",
          brandName: "Prilosec",
          dosage: "20",
          dosageUnit: "tablets",
        },
        {
          expiryTime: new Date("3/31/18"),
          prescribedAt: new Date("3/1/18"),
          patientWalletAddress: "0x4b5d44c6c2d16cc42b00b4152645a8b51f2698d6",
          medicationName: "Amlodipine",
          brandName: "Norvasc",
          dosage: "20",
          dosageUnit: "mg",
        },
        {
          expiryTime: new Date("3/15/18"),
          prescribedAt: new Date("3/3/18"),
          patientWalletAddress: "0x7b5d44c6c2d16dd42b00b4152645a8b51f2698d6",
          medicationName: "Amlodipine",
          brandName: "Norvasc",
          dosage: "50",
          dosageUnit: "mg",
        },
        {
          expiryTime: new Date("3/12/18"),
          prescribedAt: new Date("3/4/18"),
          patientWalletAddress: "0x1a0e14c6c2d16dd42b00b4152645a8b51f2698d6",
          medicationName: "Simvastatin",
          brandName: "Zocor",
          dosage: "400",
          dosageUnit: "mg",
        },
        {
          expiryTime: new Date("3/12/18"),
          prescribedAt: new Date("3/6/18"),
          patientWalletAddress: "0x1a0e14c6c2d16dd42b00b4152645a8b51f2698d6",
          medicationName: "Acetaminophen",
          brandName: "Lortab",
          dosage: "150",
          dosageUnit: "mg",
        },
      ]
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({modal: !this.state.modal});
  }

  renderTableRow(tx) {
    return (
      <tr>
        <th>
          <small>
            <img src="https://cdn1.iconfinder.com/data/icons/interface-elements/32/accept-circle-512.png" width="15" height="15" alt="" /> Verified by:<br />
            Dr. Greg: {tx.patientWalletAddress}
          </small>
        </th>
        <td>{new Date(tx.expiryTime).toLocaleDateString("en-US")}</td>
        <td>{new Date(tx.prescribedAt).toLocaleDateString("en-US")}</td>
        <td>{tx.dosage}{tx.dosageUnit} of {tx.brandName} ({tx.medicationName})</td>
        <td>
          <Button color="default" size="sm" disabled>Filled</Button>
        </td>
      </tr>
    )
  }

  render() {
    const web3Context = this.context.web3;

    return (
      <div className="App container">
        <strong>Generic Pharmacy brand portal</strong>
        <hr />
        <div className="row">
          <div className="col-md-10">
            <Media>
              <Media className="rounded-circle" object src="http://www.clker.com/cliparts/l/f/L/k/Q/e/blank-pill-bottles-md.png" alt="Generic placeholder image" style={{ marginRight: 15 }} width="100" height="100" />
              <Media body>
                <h1>Generic Pharmacy brand</h1>
                <h4>Prescription requiring filling</h4>
                Pharmacy public address: <code>{web3Context.selectedAccount}</code>
              </Media>
            </Media>
          </div>
          <div className="col-md-2">
            <br />
          </div>
        </div>
        <br />
        <Table>
          <thead>
            <tr>
              <th>Patient address</th>
              <th>Expires at</th>
              <th>Prescribed at</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.state.transactionLogs.map(this.renderTableRow.bind(this))}
          </tbody>
        </Table>

        <ModalForm visibility={this.state.modal} toggle={this.toggle}/>
      </div>
    );
  }
}

App.contextTypes = {
  web3: PropTypes.object
};
export default App;
