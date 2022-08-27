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
import QRModal from './QRModal';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import drugs from './drugs.json';
import 'font-awesome/css/font-awesome.min.css';
import {
  Media, Table, Button,
  Modal, ModalHeader,
  ModalBody, ModalFooter, Form, FormGroup,
  Label, Input
} from 'reactstrap';
let QRCode = require('qrcode.react');
let FontAwesome = require('react-fontawesome');

require('@metamask/legacy-web3');

const { web3 } = window;
const selectedAddress = web3.eth.defaultAccount;


let utils = require('./utils.js');

class ModalForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formState: {},
      transactionTriggered: false
    };
  }
  async fill() {
    this.setState({
      transactionTriggered: true
    });

    this.props.state.ContractInstance.fillPrescription(
      this.state.formState["pharmacy-address"],
      this.props.state.tokenId
    ).then((tx) => {
      this._reactInternalFiber._debugOwner.stateNode.updatePrescription(this.props.state.tokenId);
      this.props.toggle();
    })
    .catch((err) => {})
    .finally(() => {
      this.setState({
        transactionTriggered: false
      });
    })
  }

  inputUpdate(event) {
    this.setState({ formState: { ...this.state.formState, [event.target.name]: event.target.value }});
    return false;
  }

  render () {
    if(this.props.state.address) this.state.formState["pharmacy-address"] = this.props.state.address;
    return (
      <Modal isOpen={this.props.visibility} toggle={this.props.toggle}>
        <ModalHeader toggle={this.props.toggle}>Utilizează prescripția</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="exampleEmail">Adresa farmaciei:</Label>
              <Input type="text" name="pharmacy-address" onChange={this.inputUpdate.bind(this)} value={this.state.formState["pharmacy-address"] || ""} placeholder="0x123f681646d4a755815f9cb19e1acc8565a0c2ac" />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <div className="container mt-0">
            <div className="row">
            <Button className="col mr-1" color="secondary" onClick={this.props.toggle}>Anulare</Button>{' '}
            <Button className="col" color="primary" onClick={this.fill.bind(this)} disabled={this.state.transactionTriggered}>Trimite</Button>
            </div>
            {this.state.transactionTriggered &&
              <div className="row mt-2"><p className="mb-0">Tranzactia a fost initiata. Confirmati in Metamask!</p></div>
            }
          </div>
        </ModalFooter>
      </Modal>
    );
  }
}

class QRAddressModal  extends Component {
  constructor(props) {
    super(props);
  }
  render () {
    return (
      <Modal isOpen={this.props.visibility} toggle={this.props.toggle}>
        <ModalHeader toggle={this.props.toggle}>Your Account Address</ModalHeader>
        <ModalBody>
          <code>{this.props.account}</code><br />< br/>
          <QRCode size="512" value={this.props.account} style={{width: "100%"}}/>
        </ModalBody>
      </Modal>
    )
  }
}

class DrugModal  extends Component {
  constructor(props) {
    super(props);

  }
  initDrug(){
    let drug = drugs.filter(f => f.PZN == this.props.pzn);
    if(drug.length > 0){
      drug = drug[0];
    }
    this.state = {
      drug: drug
    };
  }

  render () {
    this.initDrug();
    return (
      <Modal isOpen={this.props.visibility} toggle={this.props.toggle}>
        <ModalHeader toggle={this.props.toggle}>Informații despre medicament</ModalHeader>
        <ModalBody>
          <p><strong>Medicament</strong><br/>
            {this.state.drug['Medikament']}</p>
          <p><strong>Firma</strong><br/>
            {this.state.drug['Firma']}</p>
          <p><strong>Sugestii</strong><br/>
            {this.state.drug['Hinweise']}</p>
          <p><strong>Compoziție</strong><br/>
            {this.state.drug['Zusammensetzung (Zus.):']}</p>
          <p><strong>Conținut</strong><br/>
            {this.state.drug['Packungsangaben']}</p>
          <p><strong>Preț recomandat</strong><br/>
            {this.state.drug['AVP/UVP (EUR)']} EUR</p>
          <p><strong>Cod bare</strong><br/>
            {this.state.drug['PZN']}</p>
          <p><strong>Domenii de aplicare</strong><br/>
            {this.state.drug['Anwendungsgebiete']}</p>
          <p><strong>Dozare</strong><br/>
            {this.state.drug['Dosierung']}</p>
        </ModalBody>
      </Modal>
    )
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
      transactionLogs: [],
      accounts: [],
      loading: true,
    };

    this.toggle = this.toggle.bind(this);
    this.toggleQR = this.toggleQR.bind(this);
    this.toggleQRAddress = this.toggleQRAddress.bind(this);
    this.toggleDrug = this.toggleDrug.bind(this);
  }

  async componentDidMount() {
    let {accounts, instance} = await utils.setupContract();
    this.state.accounts = accounts;
    this.state.ContractInstance = instance;
    await this.getFunding();
    await this.getPrescriptions();
  }

  async getFunding(){
    let account = window.web3.eth.accounts[0];
    window.web3.eth.getBalance(account, (err, balance) => {
      if(balance.toNumber() === 0){
        var xhr = new XMLHttpRequest()
        xhr.open('GET', "http://" + window.location.hostname + ":3333/" + account)
        xhr.send()
      }
      balance = window.web3.fromWei(balance, "ether") + " ETH";
    });
  }

  async getPrescriptions(page) {
    let tokens = await this.state.ContractInstance.tokensOf(this.state.accounts[0]);
    let transactionLogs = await Promise.all(tokens.reverse().map(this.getPrescription, this));
    this.setState({transactionLogs: transactionLogs, loading: false})
  };

  async getPrescription(token) {
    let f = await this.state.ContractInstance.prescriptions(token);
    return {
      id: token.toNumber(),
      expiryTime: new Date(f.metadata.expirationTime.toNumber()),
      prescribedAt: new Date(f.metadata.dateFilled.toNumber()),
      patientWalletAddress: f.metadata.prescribedPatient,
      medicationName: f.metadata.medicationName,
      dosage: f.metadata.dosage,
      dosageUnit: f.metadata.dosageUnit,
      filled: f.filled,
      pzn: f.metadata.pzn
    };
  }

  toggle() {
    this.setState({modal: !this.state.modal});
  }

  toggleQR() {
    this.setState({modalQR: !this.state.modalQR});
  }

  toggleQRAddress() {
    this.setState({modalQRAddress: !this.state.modalQRAddress});
  }

  showDrug(pzn){
    this.setState({pzn: pzn});
    this.toggleDrug()
  }

  toggleDrug() {
    this.setState({modalDrug: !this.state.modalDrug});
  }

  saveAddress(address){
    this.state.address = address;
  }

  fill(tx) {
    this.setState({tokenId: tx.id})
    this.toggle()
  }

  updatePrescription(id){
    let i = this.state.transactionLogs.findIndex(tx => tx.id === id);
    this.state.transactionLogs[i].filled = true;
    this.forceUpdate();
  }

  renderTableRow(tx) {
    return (
      <tr key={tx.id}>
        <td>{tx.id}</td>
        <td>{
          drugs.filter(f => f.PZN == tx.pzn).length > 0 &&
          (<FontAwesome className="info-circle clickable" onClick={ ()=> { this.showDrug(tx.pzn) }} name='info-circle' alt="User" style={{paddingRight: 5}}/>)
        }
          {tx.dosage}{tx.dosageUnit} of {tx.medicationName}</td>
        <td>{new Date(tx.expiryTime).toLocaleDateString("en-US")}</td>
        <td>{new Date(tx.prescribedAt).toLocaleDateString("en-US")}</td>
        <td>
        {tx.filled ? 
          <Button color="default" size="sm" disabled>Prescriptie utilizată</Button> :
          <Button color="success" size="sm" className="btn-block" onClick={() => {this.fill(tx)}}>Utilizează prescripție </Button>
        }
        </td>
      </tr>
    )
  }

  render() {
    return (
      <div className="App container">
       <Media object src="./banner.png" width="100%"/>
        <hr />
        <div className="row  position-relative">
          <div className="col-md-8">
            <Media>
              <FontAwesome className="user-icon clickable" onClick={() => { this.toggleQRAddress() }} name='user-circle' alt="User" size={"5x"}/>
              <Media body>
                <h1>Salut Pacient,</h1>
                { this.state.transactionLogs.length !== 0 &&
                <h4>Ai prescripții medicale valide.</h4>
                }
                { (!this.state.transactionLogs.length && !this.state.loading) &&
                <h4>La moment nu ai prescripții valide.</h4>
                }
                { this.state.accounts[0] !== undefined &&
                  <p>Apasă pe poza de profil pentru a vizualiza adresa. <br /></p>
                }
                { this.state.transactionLogs.length  !== 0 &&
                  <p>Apasă pe prescripți pentru a vizualiza detaliile.</p>
                }
              </Media>
            </Media>
          </div>
          <div className="col-md-4 text-right position-absolute" style={{bottom: 0, right: 0}}>
            <Button color="secondary" className="m-1" onClick= { ()=> { this.toggleQR() }}><FontAwesome name='camera' className="mr-2"/> Scanează farmacia</Button>
          </div>
        </div>
        <br />
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descriere</th>
              <th>Expiră la</th>
              <th>Prescris la</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {this.state.transactionLogs.map(this.renderTableRow.bind(this))}
          </tbody>
        </Table>

        <ModalForm visibility={this.state.modal} toggle={this.toggle} state={this.state}/>
        <QRAddressModal visibility={this.state.modalQRAddress} toggle={this.toggleQRAddress} account={this.state.accounts[0]}/>
        <QRModal visibility={this.state.modalQR} toggle={this.toggleQR} state={this.state} onScan={this.saveAddress}/>
        <DrugModal visibility={this.state.modalDrug} toggle={this.toggleDrug} pzn={this.state.pzn}/>
      </div>
    );
  }
}

App.contextTypes = {
  web3: PropTypes.object
};
export default App;
