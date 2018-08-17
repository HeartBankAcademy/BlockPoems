import React, { Component } from "react";
import CryptoJS from "crypto-js";
import BlockPoemFactory from "../build/contracts/BlockPoemFactory.json";
import getWeb3 from "./utils/getWeb3";

import "./css/oswald.css";
import "./css/open-sans.css";
import "./css/pure-min.css";
import "./App.css";

import { Button, Card, Form, Input, Message } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      poem: "",
      hash: "",
      web3: null,
      errorMessage: "",
      loading: false,
      poemHashDict: {},
      poems: [],
      factory: ""
    };
  }

  /* Used for hashing poems and their extra messages */
  hashString256(text) {
    let hash = CryptoJS.SHA256(text);
    return hash;
  }

  /* Used for creating BlockPoems */
  onCreate = async event => {
    event.preventDefault();
    this.setState({ errorMessage: "", loading: true });

    try {
      const accounts = this.state.web3.eth.getAccounts();

      /* need to hash poem text for better storage on blockchain */
      console.log(this.state.factory);

      await this.state.factory.methods.createPoem(this.state.hash, accounts[0]);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

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
    const blockPoemFactory = contract(BlockPoemFactory);

    blockPoemFactory.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on BlockPoem.
    let blockPoemFactoryInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      blockPoemFactory.deployed().then(
        instance =>
          async function() {
            blockPoemFactoryInstance = instance;

            // Get the Poems
            const poems = await blockPoemFactoryInstance.methods.getDeployedPoems.call();
            this.setState({ poems: poems, factory: blockPoemFactoryInstance });
          }
      );
    });
  }

  renderPoems() {
    const items = this.state.poems.map(address => {
      return {
        header: address,
        description: <a>View Campaign</a>,
        fluid: true
      };
    });

    return <Card.Group items={items} />;
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
              <Form onSubmit={this.onCreate} error={!!this.state.errorMessage}>
                <Form.Field>
                  <label>Your Poem</label>
                  <Input
                    value={this.state.poem}
                    onChange={event => {
                      let dictCopy = JSON.parse(
                        JSON.stringify(this.state.poemHashDict)
                      );
                      let hash = this.hashString256(event.target.value);
                      dictCopy[hash] = event.target.value;
                      this.setState({
                        poem: event.target.value,
                        hash: hash,
                        poemHashDict: dictCopy
                      });
                    }}
                  />
                </Form.Field>
                <Message
                  error
                  header="Oops!"
                  content={this.state.errorMessage}
                />
                <Button primary loading={this.state.loading}>
                  Create
                </Button>
              </Form>
              <p>Give it some text</p>
              <h2>Poem List</h2>
              {this.renderPoems()}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
