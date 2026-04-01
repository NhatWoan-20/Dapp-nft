// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    uint256 public constant MINT_FEE = 0.001 ether;
    uint256 public constant MAX_SUPPLY = 100;

    constructor() ERC721("MyNFTCollection", "MNC") Ownable(msg.sender) {}

    function safeMint(address to, string calldata uri) external payable {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        unchecked {
            _tokenIdCounter++;
        }
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    function totalSupply() public view returns (uint256) {
    return _tokenIdCounter;
    }
}
