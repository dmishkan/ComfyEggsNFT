// // SPDX-License-Identifier: MIT
// pragma solidity >=0.4.22 <0.9.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
// import "./ERC721A.sol";

// contract ComfyEggs is ERC721A, Ownable,ReentrancyGuard {
//     using SafeMath for uint256;
//     using Strings for uint256;

//     uint256 public MAX_COMFY_EGGS = 20;
//     uint256 public RESERVED_COMFY_EGGS = 10;
//     uint256 public MAX_COMFY_EGGS_PER_PURCHASE = 20;
//     uint256 public MAX_COMFY_EGGS_WHITELIST_CAP = 2;
//     uint256 public COMFY_EGG_PRICE = 0.01 ether;
    
//     string private tokenBaseURI;
//     string private unrevealedURI;
//     bool public revealed = false;
//     bool public presaleActive = false;
//     bool public mintActive = false;
//     bool public reservesMinted = false;

//     bytes32 public merkleRoot;
//     mapping(address => uint256) private whitelistAddressMintCount;
//     mapping(address => bool) private whitelistClaimed;

//     constructor(string memory _initBaseURI, string memory _initUnrevealedURI, bytes32 _allowlistMerkleRoot) ERC721A("Comfy Eggs", "CE") 
//     {
//         tokenBaseURI = _initBaseURI;
//         unrevealedURI = _initUnrevealedURI;
//         merkleRoot = _allowlistMerkleRoot;
//     }

//     // OWNER FUNCTIONS

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

//     function setWhitelistCap(uint256 _whitelist_cap) external onlyOwner 
//     {
//         require(_whitelist_cap > RESERVED_COMFY_EGGS, "New reserved count must be higher than old");
//         RESERVED_COMFY_EGGS = _whitelist_cap;
//     }

//     function setPresaleActive(bool _active) external onlyOwner 
//     {
//         presaleActive = _active;
//     }

//     function setMintActive(bool _active) external onlyOwner 
//     {
//         mintActive = _active;
//     }

//     function getBalance() public view onlyOwner returns (uint256) 
//     {
//         return address(this).balance;
//     }

//     function withdraw() public onlyOwner 
//     {
//         payable(msg.sender).transfer(address(this).balance);
//     }

//     function mintReservedEggs() external onlyOwner 
//     {
//         require(!reservesMinted, "Reserves have already been minted");
//         require(totalSupply().add(RESERVED_COMFY_EGGS) <= MAX_COMFY_EGGS, "This mint would exceed max supply of Comfy Eggs");
//         _safeMint(msg.sender, RESERVED_COMFY_EGGS);    
//         reservesMinted = true;
//     }

//     function setAllowlistMerkleRoot(bytes32 _allowlistMerkleRoot) external onlyOwner
//     {
//         merkleRoot = _allowlistMerkleRoot;
//     }


//     // MINT FUNCTIONS

//     function presaleMint(uint256 _quantity, bytes32[] calldata _merkleProof) external payable
//     {
//         require(presaleActive, "Presale is inactive");
//         require(!whitelistClaimed[msg.sender], "Whitelist already claimed.");
//         require(MerkleProof.verify(_merkleProof, merkleRoot, keccak256(abi.encodePacked(msg.sender))), "Invalid Merkle Proof");
//         require(_quantity <= MAX_COMFY_EGGS_WHITELIST_CAP, "You can only mint a maximum of 2 for presale");
//         require(whitelistAddressMintCount[msg.sender].add(_quantity) <= MAX_COMFY_EGGS_WHITELIST_CAP, "This purchase would exceed the maximum Comfy Eggs you are allowed to mint in the presale");
//         whitelistClaimed[msg.sender] = true;
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