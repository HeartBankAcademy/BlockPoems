import React, { Component } from "react";
import BlockPoemContract from "../build/contracts/BlockPoem.json";
import getWeb3 from "./utils/getWeb3";

import "./css/oswald.css";
import "./css/open-sans.css";
import "./css/pure-min.css";
import "./App.css";

import { Card, Button, Form, Input } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      poems: [],
      web3: null
    };
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        console.log("Error finding web3.");
      });
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require("truffle-contract");
    const blockPoem = contract(BlockPoemContract);
    blockPoem.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on BlockPoem.
    var blockPoemInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      blockPoem.deployed().then(instance => {
        blockPoemInstance = instance;

        // Get the Poems
      });
    });
  }

  render() {
    return (
      <div className="App">
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.3.3/semantic.min.css"
        />
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            Block Poems
          </a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <Form>
                <Form.Field>
                  <label>Your Poem</label>
                  <Input value="" />
                </Form.Field>
              </Form>
              <p>Your Truffle Box is installed and ready.</p>
              <h2>Smart Contract Example</h2>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;