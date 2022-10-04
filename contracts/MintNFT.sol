// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MintAccessNft is ERC721URIStorage {
    event NFTMinted(uint256 indexed NewItemId);
    uint256 tokenId = 1;
    mapping (address => uint256) public tokenAddress;
    mapping (uint256 => bool) public tokenExists;

    constructor() ERC721("dStorAccess", "DSA") {}

    function mintToken() 
        public
    {  
        require(!tokenExists[tokenId], "token already exists");
        _safeMint(msg.sender, tokenId);
        tokenAddress[msg.sender] = tokenId;
        tokenExists[tokenId] = true;
        tokenId++;
    }

    function getMyTokens() public view returns (uint256) {
        return tokenAddress[msg.sender];
    }
}