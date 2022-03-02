import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import ComfyEggs from '../abis/ComfyEggs.json';



class App extends Component {

  // async componentWillMount() {
  //   await this.loadWeb3()
  //   await this.changeNetworkEthMainnet()
  //   await this.loadBlockchainData()
  // }
 

  connectToWeb3 = async () => {
    await this.loadWeb3()
    await this.changeNetworkEthMainnet()
    await this.loadBlockchainData()
  }


  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async changeNetworkEthMainnet() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: '0x4' }], //0x1 = eth mainnet, 0x4 = rinkeby testnet
      });
      } catch (error) {
        console.log(error.message);
      }
  }

  async loadBlockchainData() {
    
    const web3 = window.web3
    
    //window.ethereum.on("chainChanged", () => window.location.reload());
    window.ethereum.on("accountsChanged", () => window.location.reload());
    
    //Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    //Load contract
    const abi = ComfyEggs.abi; //replace abi file with mainnet abi
    const address = '0xA63eDc550811C5ECd4Aa883F7A975DB8950cA07A'; //replace with mainnet contract
    const contract = new web3.eth.Contract(abi, address)
    this.setState({ contract })

    //Load tokenSupply 
    const tokenSupply = await contract.methods.tokenSupply().call()
    this.setState({ tokenSupply })

    //Load price
    const price = parseInt(await contract.methods.COMFY_EGG_PRICE().call())
    this.setState({ price })

    //Load mintActive
    const mintActive = await contract.methods.mintActive().call()
    this.setState({ mintActive })

    //Load maxComfyEggsPerPurchase
    const maxComfyEggsPerPurchase = await contract.methods.MAX_COMFY_EGGS_PER_PURCHASE().call()
    this.setState({ maxComfyEggsPerPurchase })
  }

  revealMintOrNot = () => {
    if (this.state.mintActive)
    {
      document.getElementById('mint').style.display = "block";
    }
  }

  mint = (amount) => {
    let cost = this.state.price * amount;
    this.state.contract.methods.publicMint(amount).send({ value: cost, from: this.state.account });
  }

  incrementCount = () => {

    if (this.state.mintActive && this.state.count+1 <= this.state.maxComfyEggsPerPurchase)
    {
      this.setState({count: this.state.count+1});
    }
  
  }

  decrementCount = () => {
    if (this.state.mintActive && this.state.count-1 >= 1) 
    {
      this.setState({count: this.state.count-1});
    }
    
  }

  constructor(props) {
    super(props)
    this.state = {
      contract: null,
      account: 'CONNECT',
      tokenSupply: 0,
      price: 0,
      mintActive: '',
      maxComfyEggsPerPurchase: 0,
      count: 1
    }
  }

  render() {
    return (
      <body>
          <header>
            <ul>
              <li>COMFY EGGS</li>
            </ul>
            <ul>
              <button class="buttontheme" style={{outline: 'none'}} onClick={async () => {
                await this.connectToWeb3();
                this.revealMintOrNot();
              }}>{this.state.account}</button>

            </ul>
            <ul>
              <li>DISCORD</li>
              <li>TWITTER</li>
              <li>OPENSEA</li>
            </ul>
          </header>

        <div id="banner">
          <h1>COMFY EGGS</h1>
          <div id="mint">
            <div id="counter">
              <button class="buttontheme" style={{outline: 'none'}} onClick={this.decrementCount}>-</button>
              <div id="count">{this.state.count}</div>
              <button class="buttontheme" style={{outline: 'none'}} onClick={this.incrementCount}>+</button>
            </div>
            
            <button id="mintbutton" class="buttontheme" style={{outline: 'none'}} onClick={async () => {
              await this.changeNetworkEthMainnet();
              this.mint(this.state.count);
              }}>MINT</button>
          </div>
            

        </div>
       
      </body>
    );
  }
}

export default App;
