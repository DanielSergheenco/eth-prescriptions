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
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Media,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table
} from 'reactstrap';

let utils = require('./utils.js')

class ModalForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: { "dosage-unit": "ml" },
    };
  }

  async sendPrescription() {
    let tx = await this.props.state.ContractInstance.prescribe(
      this.state.formState["patient-address"],
      this.state.formState["medication-name"],
      this.state.formState["brand-name"],
      this.state.formState["dosage-quantity"],
      this.state.formState["dosage-unit"],
      0,
      Date.now(),
      Date.now(this.state.formState["expiration-date"]),
      {
        gasLimit: 300000,
        gasPrice: 400000000000
      });
    console.log(tx);
    this.setState({ transactionId: tx.hash });
      //this.props.toggle();
    }

  inputUpdate(event) {
    this.setState({ formState: { ...this.state.formState, [event.target.name]: event.target.value }});
    return false;
  }

  render () {
    if(this.props.input !== undefined && this.state.id !== this.props.input.id){
      this.state.id = this.props.input.id;
      this.state.formState["patient-address"] = this.props.input.patientWalletAddress;
      this.state.formState["medication-name"] = this.props.input.medicationName;
      this.state.formState["brand-name"] = this.props.input.brandName;
      this.state.formState["dosage-quantity"] = this.props.input.dosage;
      this.state.formState["dosage-unit"] = this.props.input.dosageUnit;
      this.state.formState["expiration-date"] = this.props.input.expiryTime;
    }

    if (this.state.transactionId) {
    return (
      <Modal isOpen={this.props.visibility} toggle={this.props.toggle}>
        <ModalHeader toggle={this.props.toggle}><img src="https://cdn1.iconfinder.com/data/icons/interface-elements/32/accept-circle-512.png" width="30" height="30"/> Your prescription has been sent!</ModalHeader>
        <ModalBody>
          <p>Your prescription has successfully been sent to the patient and is available at the following transaction address: <code>{this.state.transactionId}</code></p>
        </ModalBody>
      </Modal>);
    } else {
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
              <Label for="exampleEmail">Expiration Date</Label>
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
}

ModalForm.contextTypes = {
  web3: PropTypes.object
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      accounts: [],
      transactionLogs: []
    };

    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    let {accounts, instance} = await utils.setupContract();
    this.state.accounts = accounts;
    this.state.ContractInstance = instance;
    await this.getPrescriptions();
  }


  async getPrescriptions() {
    let tokens = await this.state.ContractInstance.tokensOf(this.state.accounts[0]);
    let transactionLogs = await Promise.all(tokens.map(this.getPrescription, this));
    this.setState({transactionLogs: transactionLogs})
  };

  async getPrescription(token){
    let f = await this.state.ContractInstance.prescriptions(token);
    return {
      id: token,
      expiryTime: new Date(f.metadata.expirationTime.toNumber()),
      prescribedAt: new Date(f.metadata.dateFilled.toNumber()),
      patientWalletAddress: f.metadata.prescribedPatient,
      medicationName: f.metadata.medicationName,
      brandName: f.metadata.brandName,
      dosage: f.metadata.dosage,
      dosageUnit: f.metadata.dosageUnit
    };
  }
  toggle() {
    this.setState({modal: !this.state.modal});
  }

  new(){
    this.state.prior = {};
    this.toggle()
  }

  renew(tx) {
    this.state.prior = tx;
    this.toggle()
  }

  renderTableRow(tx) {
    return (
      <tr>
        <th>
          <small>
            {tx.patientWalletAddress}
          </small>
        </th>
        <td>{new Date(tx.expiryTime).toLocaleDateString("en-US")}</td>
        <td>{new Date(tx.prescribedAt).toLocaleDateString("en-US")}</td>
        <td>{tx.dosage}{tx.dosageUnit} of {tx.brandName} ({tx.medicationName})</td>
        <td>
          <Button color="primary" size="sm" onClick={() => { this.renew(tx) }}>Renew</Button>{' '}
          <Button color="secondary" size="sm">Cancel</Button>
        </td>
      </tr>
    )
  }

  render() {
    return (
      <div className="App container">
        <strong>George Washington University Hospital</strong>
        <hr />
        <div className="row">
          <div className="col-md-10">
            <Media>
              <Media className="rounded-circle" object src="https://cdn.ratemds.com/media/doctors/doctor/image/doctor-armin-tehrany-orthopedics-sports_RD4hDWC.jpg_thumbs/v1_at_100x100.jpg" alt="Generic placeholder image" style={{ marginRight: 15 }} width="100" height="100" />
              <Media body>
                <h1>Hello, Dr. Laun</h1>
                <h4>Your recent prescriptions.</h4>
                <code>{this.state.accounts[0]}</code>
              </Media>
            </Media>
          </div>
          <div className="col-md-2">
            <br />
            <Button color="success" onClick= { ()=> { this.new(this) }}>Create a prescription</Button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.transactionLogs.map(this.renderTableRow.bind(this))}
          </tbody>
        </Table>

        <ModalForm visibility={this.state.modal} toggle={this.toggle} input={this.state.prior} state={this.state}/>
      </div>
    );
  }
}

App.contextTypes = {
  web3: PropTypes.object
};
export default App;
