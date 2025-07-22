// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MyNFT.sol"; // Import your NFT contract

contract NFTMarketplace is Ownable {
    MyNFT public nftContract; // Reference to your NFT contract
    address payable public marketplaceOwner; // This will be your Sepolia account

    // Struct to represent a listed item
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool isListed;
    }

    // Mapping from tokenId to MarketItem
    mapping(uint256 => MarketItem) public marketItems;

    // Events
    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ItemSold(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price);
    event ItemUnlisted(uint256 indexed tokenId, address indexed seller);

    constructor(address _nftContractAddress, address payable _marketplaceOwner) Ownable(_marketplaceOwner) {
        require(_nftContractAddress != address(0), "NFT contract address cannot be zero");
        require(_marketplaceOwner != address(0), "Marketplace owner address cannot be zero");
        nftContract = MyNFT(_nftContractAddress);
        marketplaceOwner = _marketplaceOwner;

        // !!! IMPORTANT: The line below was removed as it caused the deployment revert. !!!
        // !!! You must manually call setMarketplaceAddress on MyNFT contract after deploying NFTMarketplace. !!!
        // nftContract.setMarketplaceAddress(address(this));
    }

    // Function for sellers to list their NFTs
    function listItem(uint256 tokenId, uint256 price) public {
        require(price > 0, "Price must be greater than 0");
        require(nftContract.ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        require(!marketItems[tokenId].isListed, "NFT is already listed");

        // The seller must approve the marketplace contract to transfer their NFT
        // This is done off-chain by calling approve on the MyNFT contract
        require(nftContract.getApproved(tokenId) == address(this), "Marketplace not approved to transfer NFT");

        marketItems[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            price,
            true
        );

        // Update the price in the NFT contract
        nftContract.setTokenPrice(tokenId, price);

        // Transfer NFT from seller to marketplace contract
        // This needs approval from the owner first (done by approve() on MyNFT contract)
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        emit ItemListed(tokenId, msg.sender, price);
    }

    // Function for buyers to purchase NFTs
    function buyItem(uint256 tokenId) public payable {
        MarketItem storage item = marketItems[tokenId];
        require(item.isListed, "NFT is not listed for sale");
        require(msg.value == item.price, "Please send the exact listing price");
        require(item.seller != msg.sender, "Cannot buy your own NFT"); // Prevent buying own NFT

        // Transfer ETH to the seller
        (bool success, ) = item.seller.call{value: msg.value}("");
        require(success, "Failed to send ETH to seller");

        // Transfer NFT from marketplace contract to buyer
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // Mark item as no longer listed
        item.isListed = false;

        emit ItemSold(tokenId, msg.sender, item.seller, item.price);
    }

    // Function for sellers to unlist their NFTs
    function unlistItem(uint256 tokenId) public {
        MarketItem storage item = marketItems[tokenId];
        require(item.isListed, "NFT is not listed");
        require(item.seller == msg.sender, "You are not the seller of this NFT");

        // Transfer NFT back to the seller from the marketplace contract
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // Mark item as no longer listed
        item.isListed = false;

        emit ItemUnlisted(tokenId, msg.sender);
    }

    // Function to get the owner of a specific NFT from MyNFT contract
    function getNFTOwner(uint256 tokenId) public view returns (address) {
        return nftContract.ownerOf(tokenId);
    }

    // Function to get the tokenURI of a specific NFT from MyNFT contract
    function getNFTTokenURI(uint256 tokenId) public view returns (string memory) {
        return nftContract.tokenURI(tokenId);
    }
}