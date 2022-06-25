// CONTRACT UPLOADED THRU remix.ethereum.org

// SPDX-License-Identifier: MIT
// pragma solidity >= 0.4.22 < 0.9.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
// import "./ERC721A.sol";

// contract ComfyEggs is ERC721A, Ownable {
//     using SafeMath for uint256;
//     using Strings for uint256;

//     uint256 public MAX_COMFY_EGGS = 20;
//     uint256 public MAX_COMFY_EGGS_PER_PURCHASE = 20;
//     uint256 public MAX_COMFY_EGGS_WHITELIST_CAP = 5;
//     uint256 public COMFY_EGG_PRICE = 0.02 ether;
    
//     string private tokenBaseURI;
//     string private unrevealedURI;
//     bool public revealed = false;
//     bool public presaleActive = false;
//     bool public mintActive = false;

//     bytes32 public merkleRoot;
//     mapping(address => uint256) private whitelistAddressMintCount;

//     constructor(string memory _initBaseURI, string memory _initUnrevealedURI, bytes32 _allowlistMerkleRoot) ERC721A("Comfy Eggs", "CE") 
//     {
//         tokenBaseURI = _initBaseURI;
//         unrevealedURI = _initUnrevealedURI;
//         merkleRoot = _allowlistMerkleRoot;
//     }

//     //OWNER FUNCTIONS

//     function setTokenBaseURI(string memory _baseURI) external onlyOwner 
//     {
//         tokenBaseURI = _baseURI;
//     }

//     function setUnrevealedURI(string memory _unrevealedUri) external onlyOwner 
//     {
//         unrevealedURI = _unrevealedUri;
//     }

//     function reveal() external onlyOwner 
//     {
//         revealed = true;
//     }

//     function setPresaleActive(bool _active) external onlyOwner 
//     {
//         presaleActive = _active;
//     }

//     function setMintActive(bool _active) external onlyOwner 
//     {
//         mintActive = _active;
//     }

//     function setPrice(uint256 _newPrice) external onlyOwner 
//     {
//         COMFY_EGG_PRICE = _newPrice;
//     }

//     function getBalance() public view onlyOwner returns (uint256) 
//     {
//         return address(this).balance;
//     }

//     function withdraw() public onlyOwner 
//     {
//         payable(msg.sender).transfer(address(this).balance);
//     }

//     function setAllowlistMerkleRoot(bytes32 _allowlistMerkleRoot) external onlyOwner
//     {
//         merkleRoot = _allowlistMerkleRoot;
//     }


//     function gift(uint256[] calldata quantity, address[] calldata recipient) external onlyOwner
//     {
//         require(quantity.length == recipient.length, "Provide a quantity for each recipent");
//         uint256 totalQuantity = 0;
//         for (uint256 i = 0; i < quantity.length; ++i) 
//         {
//             totalQuantity += quantity[i];
//         }
//         require(totalSupply().add(totalQuantity) <= MAX_COMFY_EGGS, "Trying to mint goes over Max Egg Supply");
//         for (uint256 i = 0; i < recipient.length; ++i) 
//         {
//             _safeMint(recipient[i], quantity[i]);
//         }
//     }


//     //USER MINT FUNCTIONS

//     function presaleMint(uint256 _quantity, bytes32[] calldata _merkleProof) external payable
//     {
//         require(presaleActive, "Presale is inactive");
//         require(MerkleProof.verify(_merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender))), "Invalid Merkle Proof");
//         require(_quantity <= MAX_COMFY_EGGS_WHITELIST_CAP, "This would exceed maximum quantity presale allowance");
//         require(whitelistAddressMintCount[msg.sender].add(_quantity) <= MAX_COMFY_EGGS_WHITELIST_CAP, "This purchase would exceed the maximum Comfy Eggs you are allowed to mint in the presale");
//         whitelistAddressMintCount[msg.sender] += _quantity;
//         _safeMintEggs(_quantity);
//     }

//     function publicMint(uint256 _quantity) external payable 
//     {
//         require(mintActive, "Sale is inactive");
//         require(_quantity <= MAX_COMFY_EGGS_PER_PURCHASE, "Quantity is more than allowed per transaction");
//         _safeMintEggs(_quantity);
//     }

//     function _safeMintEggs(uint256 _quantity) internal 
//     {
//         require(_quantity > 0, "You must mint at least 1 Comfy Egg");    
//         require(totalSupply().add(_quantity) <= MAX_COMFY_EGGS, "This purchase would exceed max supply of Comfy Eggs");
//         require(msg.value >= COMFY_EGG_PRICE.mul(_quantity), "The ether value sent is not correct");
//         _safeMint(msg.sender, _quantity);    
//     }


//     //EVERYTHING ELSE

//     function tokenURI(uint256 _tokenId) public view override returns (string memory)
//     {
//         if (!revealed) 
//         {
//             return unrevealedURI;
//         }
//         require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
//         return string(abi.encodePacked(tokenBaseURI, "/", _tokenId.toString(), ".json"));
//     }

// }