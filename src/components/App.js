import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import ComfyEggs from '../abis/ComfyEggs.json';
import Whitelist from '../abis/Whitelist.json';
const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');

class App extends Component {

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

    window.ethereum.on("accountsChanged", () => window.location.reload());
    
    //Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    //Load contract
    const abi = ComfyEggs.abi; //replace abi file with mainnet abi
    const contract_adress = '0xbF1Ba4F04BC95C1D7bD5e8a934ea545EC54CC7A3'; //replace with mainnet contract address
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

    //Load maxComfyEggsWhitelistCap
    const maxComfyEggsWhitelistCap = await contract.methods.MAX_COMFY_EGGS_WHITELIST_CAP().call()
    this.setState({maxComfyEggsWhitelistCap})
  }

  connect = async () => {
    document.getElementById("connect").disabled = true;
    document.getElementById("connect").style.cursor = "auto";
    document.getElementById("connect2").disabled = true;
    document.getElementById("connect2").style.cursor = "auto";
    await this.connectToWeb3();
    this.revealMintHTMLOrNot();
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

    const whitelist = Whitelist.whitelist;
    const leafNodes = whitelist.map(addy => keccak256(addy));
    const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
    const rootHash = merkleTree.getRoot();

    const claimingAddress = keccak256(this.state.account);
    const hexProof = merkleTree.getHexProof(claimingAddress);
    this.setState({ hexProof })

    const addressWhitelisted = merkleTree.verify(hexProof, claimingAddress, rootHash);
    this.setState({ addressWhitelisted })

  }

  revealMintHTMLOrNot = () => {
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

    if (this.state.mintActive) 
    {
      if (this.state.count+1 <= this.state.maxComfyEggsPerPurchase)
      {
        this.setState({count: this.state.count+1});
      }
    }
    else if (this.state.presaleActive)
    {
      if (this.state.count+1 <= this.state.maxComfyEggsWhitelistCap)
      {
        this.setState({count: this.state.count+1});
      }
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
      maxComfyEggsWhitelistCap: 0,
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
              <a href="./"><img id="home" alt="" src={require('../images/icon.png')}/></a>
            </div>
            
            <div id="second" class="items">
              <button id="connect" class="buttontheme" style={{outline: 'none'}} onClick={this.connect}>{this.state.account}</button>
            </div>
            
            <div id="third" class="items">
              <a target="._blank" href="https://discord.gg/DUj9CA7GXR"><img class="socials" alt="" src={require('../images/discord.png')}/></a>
              <a target="._blank" href="https://twitter.com/ComfyEggsNFT"><img class="socials" alt="" src={require('../images/twitter.png')}/></a>
              <a target="._blank" href="https://www.opensea.io/"><img class="socials" alt="" src={require('../images/opensea.png')}/></a>
            </div>
          </nav>

        <div id="overlay">
          <div class="overlay-content">
            <a><button id="connect2" class="buttontheme" style={{outline: 'none'}} onClick={this.connect}>{this.state.account}</button></a>
            <a target="._blank" href="https://discord.gg/DUj9CA7GXR"><img class="socials" alt="" src={require('../images/discord.png')}/></a>
            <a target="._blank" href="https://twitter.com/ComfyEggsNFT"><img class="socials" alt="" src={require('../images/twitter.png')}/></a>
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
        <p id="terms">Terms and Conditions</p>
        <p id="terms_paragraph">
        You Own Your NFT: By connecting your Ethereum wallet and minting a NFT with our smart contract, you gain full and complete ownership of your NFT.
        Limitations of Liability for Gas, Failed Transactions, and other Bugs. We have worked very hard to make sure that there are no bugs in our smart
        contract and that our initial NFT launch is smooth as possible. As we have seen in many previous projects, however, sometimes things break. 
        You agree to not hold NFTs accountable for any losses you may incur as a consequence of minting your NFT. These potential losses include any gas
        fees for failed transactions, and any excessive gas fees during the minting process. NFTs Are Not Intended as Investments: NFTs serve exclusively
        as Non-Fungible Tokens for you to collect. They are not intended for any investment purposes. We make absolutely no promise or guarantee that 
        these NFTs will hold any particular value once minted on our website. You are responsible for any tax liability which may arise from minting or 
        reselling your NFT(s). Class Action Waiver: You agree to waive any class action status, and any legal dispute around the NFTs project. Children: 
        You agree that you are over the age of 18, or the legal age within your jurisdiction. Arbitration: In the event that a legal dispute arises from 
        anything related to the NFTs project, you agree to bring the case to binding arbitration according to appropriate Federal guidelines. 
        Jurisdiction and Choice of Law: You agree that for purposes of any legal dispute, you will be subject to the jurisdiction of the United States 
        and that any legal proceeding will be brought in the United States.
        </p>
      </body>
    );
  }
}

export default App;
