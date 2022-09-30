// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MintAccessNft is ERC721URIStorage {
    event NFTMinted(uint256 indexed NewItemId);
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    constructor() ERC721("AccessToken", "NFT") {}

    function giveAccess() 
        public
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);

        _tokenIds.increment();
        emit NFTMinted(newItemId);
        return newItemId;
    }
}