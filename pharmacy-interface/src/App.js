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
  Media, Table, Button
} from 'reactstrap';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
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
                Pharmacy public address: <code>{this.state.accounts[0]}</code>
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
      </div>
    );
  }
}

App.contextTypes = {
  web3: PropTypes.object
};
export default App;
