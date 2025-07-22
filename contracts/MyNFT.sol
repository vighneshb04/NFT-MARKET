// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Mapping to store the price of each token
    mapping(uint256 => uint256) public tokenPrices;
    
    // The marketplace contract address that is allowed to manage sales
    address public marketplaceAddress;

    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI, uint256 price);
    event NFTPriceSet(uint256 indexed tokenId, uint256 newPrice);

    constructor(address initialOwner)
        ERC721("CyberMarketNFT", "CMN")
        Ownable(initialOwner)
    {}

    function setMarketplaceAddress(address _marketplaceAddress) public onlyOwner {
        require(_marketplaceAddress != address(0), "Marketplace address cannot be zero");
        marketplaceAddress = _marketplaceAddress;
    }

    function mintNFT(address recipient, string memory tokenURI, uint256 price)
        public onlyOwner returns (uint256)
    {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenPrices[newTokenId] = price; // Set initial price

        emit NFTMinted(newTokenId, recipient, tokenURI, price);
        return newTokenId;
    }

    // Function to update the price of an NFT. Only the current owner or the marketplace can call this.
    function setTokenPrice(uint256 tokenId, uint256 newPrice) public {
        require(ownerOf(tokenId) == msg.sender || msg.sender == marketplaceAddress, "Only owner or marketplace can set price");
        require(newPrice > 0, "Price must be greater than 0");
        tokenPrices[tokenId] = newPrice;
        emit NFTPriceSet(tokenId, newPrice);
    }

    // The following functions are required to be overridden for ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}