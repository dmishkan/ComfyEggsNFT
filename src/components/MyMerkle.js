const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');
const Whitelist = require('../abis/Whitelist.json');


// ONCE UPLOADING ROOT HASH TO BLOCKCHAIN, DO NOT MODIFY WHITELIST, OTHERWISE YOU HAVE TO UPLOAD NEW ROOTHASH TO BLOCKCHAIN
const whitelist = Whitelist.whitelist;
console.log("WHITELIST:\n", whitelist)

//merkleTree and rootHash need to be uploaded/updated to contract once you have all whitelist addresses ready
const leafNodes = whitelist.map(addy => keccak256(addy));
const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
const rootHash = merkleTree.getRoot();

//NEED TO CREATE BOTTOM 2 IN APP.JS TO SEND TO CONTRACT
const claimingAddress = keccak256("0xF0F262946eba3536C616F0BbBC0AA1692476B850"); //CHANGE ADDRESS IN HERE TO WHICHEVER CURRENT WHITELISTER IS TRYING TO MINT
const hexProof = merkleTree.getHexProof(claimingAddress);

//INFO HERE TO UPLOAD/UPDATE TO SMART CONTRACT
console.log('Whitelist Merkle Tree\n', merkleTree.toString('hex'));
console.log('MERKLE ROOT (COPY THIS TO UPLOAD TO BLOCKCHAIN)\n', "0x" + rootHash.toString('hex'));
console.log('HEX PROOF\n', hexProof);

//PROVES THAT claimingAddress IS VERIFIED/UNVERIFIED HERE, BUT SAME ANSWER HERE SHOULD ALSO BE ON THE BLOCKCHAIN/SMARTCONTRACT VERIFY FUNCTION
console.log(merkleTree.verify(hexProof, claimingAddress, rootHash)) 
