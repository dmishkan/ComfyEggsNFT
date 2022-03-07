import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import ComfyEggs from '../abis/ComfyEggs.json';
const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');

//place merkle root in state 

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
    this.loadMerkle();
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
      window.alert('Non-Ethereum browser detected. You should consider installing MetaMask!')
      window.location.reload()
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
    const contract_adress = '0xCC40cb50fB54dDe2BC74dD0fB51C95a8DaF85898'; //replace with mainnet contract
    const contract = new web3.eth.Contract(abi, contract_adress)
    this.setState({ contract })
    this.setState({contract_adress})

    //Load tokenSupply 
    const tokenSupply = await contract.methods.totalSupply().call()
    this.setState({ tokenSupply })

    //Load price
    const price = parseInt(await contract.methods.COMFY_EGG_PRICE().call())
    this.setState({ price })

    //Load mintActive
    const mintActive = await contract.methods.mintActive().call()
    this.setState({ mintActive })

    //Load presaleActive
    const presaleActive = await contract.methods.presaleActive().call()
    this.setState({ presaleActive })

    //Load maxComfyEggsPerPurchase
    const maxComfyEggsPerPurchase = await contract.methods.MAX_COMFY_EGGS_PER_PURCHASE().call()
    this.setState({ maxComfyEggsPerPurchase })
  }

  connect = async () => {
    await this.connectToWeb3();
    this.revealMintOrNot();
  }

  toggleMenu = () => {
    if(!this.state.menuOpen) 
    {
      document.querySelector('.menu-btn').classList.add('open');
      document.getElementById('overlay').style.width = "100vw";
      this.setState({ menuOpen: true});
    } 
    else 
    {
      document.querySelector('.menu-btn').classList.remove('open');
      document.getElementById('overlay').style.width = "0vw";
      this.setState({ menuOpen: false});

    }
  }

  loadMerkle = () => {
    //have whitelist addresses ready
    let whitelist = 
    [
        "0x276e6AE9e171C5db63709Cc6Cc15dD78745D709f", 
        "0x603e91B7Cf098bE76EfF45542Fe046e33C797F3d"
    ];

    //merkleTree and rootHash need to be uploaded/updated to contract once you have all whitelist addresses ready
    const leafNodes = whitelist.map(addy => keccak256(addy));
    const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
    const rootHash = merkleTree.getRoot();

    //NEED TO CREATE BOTTOM 2 IN APP.JS TO SEND TO CONTRACT
    const claimingAddress = keccak256(this.state.account); //CHANGE ADDRESS IN HERE TO WHICHEVER CURRENT WHITELISTER IS TRYING TO MINT
    const hexProof = merkleTree.getHexProof(claimingAddress);
    this.setState({ hexProof })

    //INFO HERE TO UPLOAD/UPDATE TO SMART CONTRACT
    // console.log('Whitelist Merkle Tree\n', merkleTree.toString('hex'));
    // console.log('MERKLE ROOT (COPY THIS TO UPLOAD TO BLOCKCHAIN)\n', "0x" + rootHash.toString('hex'));
    // console.log('HEX PROOF\n', hexProof);

    //PROVES THAT claimingAddress IS VERIFIED/UNVERIFIED HERE, BUT SAME ANSWER HERE SHOULD ALSO BE ON THE BLOCKCHAIN/SMARTCONTRACT VERIFY FUNCTION
    const addressWhitelisted = merkleTree.verify(hexProof, claimingAddress, rootHash);
    this.setState({ addressWhitelisted })

    // console.log(addressWhitelisted) 
  }

  revealMintOrNot = () => {
    if (this.state.mintActive)
    {
      document.getElementById('mint').style.display = "block";
      document.getElementById('banner').style.animation = "fadeIn 1s";      
    }
    else if (this.state.presaleActive && this.state.addressWhitelisted) {
      document.getElementById('title').innerHTML = "COMFY EGGS WHITELIST";
      document.getElementById('mint').style.display = "block";
      document.getElementById('banner').style.animation = "fadeIn 1s"; 
    }
  }

  mint = async (amount) => {
    let cost = this.state.price * amount;
    if (this.state.mintActive)
    {
      this.state.contract.methods.publicMint(amount).send({ value: cost, from: this.state.account });
    }
    else if (this.state.presaleActive && this.state.addressWhitelisted) 
    {
      this.state.contract.methods.presaleMint(amount, this.state.hexProof).send({ value: cost, from: this.state.account });
    }
  }

  incrementCount = () => {

    if (this.state.count+1 <= this.state.maxComfyEggsPerPurchase)
    {
      this.setState({count: this.state.count+1});
    }
  
  }

  decrementCount = () => {
    if (this.state.count-1 >= 1) 
    {
      this.setState({count: this.state.count-1});
    }
    
  }

  constructor(props) {
    super(props)
    this.state = {
      contract: null,
      contract_adress: '',
      account: 'CONNECT',
      tokenSupply: 0,
      price: 0,
      mintActive: '',
      maxComfyEggsPerPurchase: 0,
      count: 1,
      menuOpen: false,
      hexProof: [],
      addressWhitelisted: false
    }
  }

  render() {
    return (
      <body>
          
          <nav>
            <div class="menu-btn" onClick={this.toggleMenu}><div class="menu-btn__burger"></div></div>
            <div id="first" class="items">
              <h2>COMFY EGGS</h2>
            </div>
            
            <div id="second" class="items">
              <button class="buttontheme" style={{outline: 'none'}} onClick={this.connect}>{this.state.account}</button>
            </div>
            
            <div id="third" class="items">
              <a target="._blank" href="https://www.discord.com/"><img class="socials" alt="" src={require('../images/discord.png')}/></a>
              <a target="._blank" href="https://www.twitter.com/"><img class="socials" alt="" src={require('../images/twitter.png')}/></a>
              <a target="._blank" href="https://www.opensea.io/"><img class="socials" alt="" src={require('../images/opensea.png')}/></a>
            </div>
          </nav>

        <div id="overlay">
          <div class="overlay-content">
            <a><button class="buttontheme" style={{outline: 'none'}} onClick={this.connect}>{this.state.account}</button></a>
            <a target="._blank" href="https://www.discord.com/"><img class="socials" alt="" src={require('../images/discord.png')}/></a>
            <a target="._blank" href="https://www.twitter.com/"><img class="socials" alt="" src={require('../images/twitter.png')}/></a>
            <a target="._blank" href="https://www.opensea.io/"><img class="socials" alt="" src={require('../images/opensea.png')}/></a>
          </div>
        </div>

        <div id="banner">
          <h1 id="title">COMFY EGGS</h1>
          <div id="mint">
            <div id="counter">
              <button class="buttontheme" style={{outline: 'none'}} onClick={this.decrementCount}>-</button>
              <div id="count">{this.state.count}</div>
              <button class="buttontheme" style={{outline: 'none'}} onClick={this.incrementCount}>+</button>
            </div>
            
            <button id="mintbutton" class="buttontheme" style={{outline: 'none'}} onClick={async () => {
              await this.changeNetworkEthMainnet();
              await this.mint(this.state.count);
              }}>MINT</button>
          </div>
        </div>
        <p>TEXT</p>
        <p>TEXT</p>
        <p>TEXT</p>
        <p>TEXT</p>

        
       
      </body>
    );
  }
}

export default App;
