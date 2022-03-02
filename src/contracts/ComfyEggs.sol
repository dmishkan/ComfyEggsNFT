// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ComfyEggs is ERC721, Ownable,ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    using ECDSA for bytes32;
    using Strings for uint256;

    uint256 public MAX_COMFY_EGGS = 20;
    uint256 public RESERVED_COMFY_EGGS = 10;
    uint256 public MAX_COMFY_EGGS_PER_PURCHASE = 20;
    uint256 public MAX_COMFY_EGGS_WHITELIST_CAP = 2;
    uint256 public COMFY_EGG_PRICE = 0.01 ether;
    
    string private tokenBaseURI;
    string private unrevealedURI;
    bool public revealed = false;
    bool public presaleActive = false;
    bool public mintActive = false;
    bool public reservesMinted = false;

    mapping(address => uint256) private whitelistAddressMintCount;
    Counters.Counter public tokenSupply;

    constructor(string memory _initBaseURI, string memory _initUnrevealedURI) ERC721("Comfy Eggs", "CE") 
    {
        tokenBaseURI = _initBaseURI;
        unrevealedURI = _initUnrevealedURI;
    }

    // OWNER FUNCTIONS

    function setTokenBaseURI(string memory _baseURI) external onlyOwner 
    {
        tokenBaseURI = _baseURI;
    }

    function setUnrevealedURI(string memory _unrevealedUri) external onlyOwner 
    {
        unrevealedURI = _unrevealedUri;
    }

    function reveal() external onlyOwner 
    {
        revealed = true;
    }

    function setWhitelistCap(uint256 _whitelist_cap) external onlyOwner 
    {
        require(_whitelist_cap > RESERVED_COMFY_EGGS, "New reserved count must be higher than old");
        RESERVED_COMFY_EGGS = _whitelist_cap;
    }

    function setPresaleActive(bool _active) external onlyOwner 
    {
        presaleActive = _active;
    }

    function setMintActive(bool _active) external onlyOwner 
    {
        mintActive = _active;
    }

    function getBalance() public view onlyOwner returns (uint256) 
    {
        return address(this).balance;
    }

    function withdraw() public onlyOwner 
    {
        payable(msg.sender).transfer(address(this).balance);
    }

    function mintReservedEggs() external onlyOwner 
    {
        require(!reservesMinted, "Reserves have already been minted");
        require(tokenSupply.current().add(RESERVED_COMFY_EGGS) <= MAX_COMFY_EGGS, "This mint would exceed max supply of Comfy Eggs");

        for (uint256 i = 0; i < RESERVED_COMFY_EGGS; i++) 
        {
            uint256 mintIndex = tokenSupply.current().add(1);
            if (mintIndex <= MAX_COMFY_EGGS) 
            {
                tokenSupply.increment();
                _safeMint(msg.sender, mintIndex);
            }
        }

        reservesMinted = true;
    }


    // MINT FUNCTIONS

    function presaleMint(uint256 _quantity, bytes calldata _whitelistSignature) external payable nonReentrant
    {
        require(verifyOwnerSignature(keccak256(abi.encode(msg.sender)),_whitelistSignature),"Invalid whitelist signature");
        require(presaleActive, "Presale is inactive");
        require(_quantity <= MAX_COMFY_EGGS_WHITELIST_CAP, "You can only mint a maximum of 2 for presale");
        require(whitelistAddressMintCount[msg.sender].add(_quantity) <= MAX_COMFY_EGGS_WHITELIST_CAP, "This purchase would exceed the maximum Comfy Eggs you are allowed to mint in the presale");
        
        whitelistAddressMintCount[msg.sender] += _quantity;
        _safeMintEggs(_quantity);
    }

    function publicMint(uint256 _quantity) external payable 
    {
        require(mintActive, "Sale is inactive");
        require(_quantity <= MAX_COMFY_EGGS_PER_PURCHASE, "Quantity is more than allowed per transaction");

        _safeMintEggs(_quantity);
    }

    function _safeMintEggs(uint256 _quantity) internal 
    {
        require(_quantity > 0, "You must mint at least 1 Comfy Egg");    
        require(tokenSupply.current().add(_quantity) <= MAX_COMFY_EGGS, "This purchase would exceed max supply of Comfy Eggs");
        require(msg.value >= COMFY_EGG_PRICE.mul(_quantity), "The ether value sent is not correct");

        for (uint256 i = 0; i < _quantity; i++) 
        {
            uint256 mintIndex = tokenSupply.current().add(1);

            if (mintIndex <= MAX_COMFY_EGGS) 
            {
                tokenSupply.increment();
                _safeMint(msg.sender, mintIndex);
            }
        }
    }



    //EVERYTHING ELSE

    function tokenURI(uint256 _tokenId) public view override returns (string memory)
    {
        if (!revealed) 
        {
            return unrevealedURI;
        }
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(tokenBaseURI, "/", _tokenId.toString(), ".json"));
    }

    function verifyOwnerSignature(bytes32 hash, bytes memory signature) private view returns (bool)
    {
        return hash.toEthSignedMessageHash().recover(signature) == owner();
    }
}