const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');

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
const claimingAddress = keccak256("0x603e91B7Cf098bE76EfF45542Fe046e33C797F3d"); //CHANGE ADDRESS IN HERE TO WHICHEVER CURRENT WHITELISTER IS TRYING TO MINT
const hexProof = merkleTree.getHexProof(claimingAddress);

//INFO HERE TO UPLOAD/UPDATE TO SMART CONTRACT
console.log('Whitelist Merkle Tree\n', merkleTree.toString('hex'));
console.log('MERKLE ROOT (COPY THIS TO UPLOAD TO BLOCKCHAIN)\n', "0x" + rootHash.toString('hex'));
console.log('HEX PROOF\n', hexProof);

//PROVES THAT claimingAddress IS VERIFIED/UNVERIFIED HERE, BUT SAME ANSWER HERE SHOULD ALSO BE ON THE BLOCKCHAIN/SMARTCONTRACT VERIFY FUNCTION
console.log(merkleTree.verify(hexProof, claimingAddress, rootHash)) 
