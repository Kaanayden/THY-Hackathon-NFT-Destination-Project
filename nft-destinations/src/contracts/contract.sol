// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTDestinations is ERC721, ERC721Enumerable, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;

  // input: id, output: last use time as unix time
  mapping(uint256 => uint256) lastUseTime;
  uint256 public constant reuseDelay = 1 days;

  string public baseTokenURI;
  string internal contractURIData;

  constructor() ERC721("NFTDestinations", "DSTN") {
    //bunu contract URI'ya ayarla
    contractURIData = "";

    baseTokenURI = "";
  }

  function setUsed(uint256 id) external onlyOwner {
    require(isReusable(id), "Not reusable yet");

    lastUseTime[id] = block.timestamp;
  }

  function isReusable(uint256 id) public view returns (bool) {
    if (_exists(id) && block.timestamp > lastUseTime[id] + reuseDelay) {
      return true;
    } else {
      return false;
    }
  }

  /// @dev Returns an URI for a given token ID
  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }

  function setContractURI(string calldata newURI) external onlyOwner {
    contractURIData = newURI;
  }

  function contractURI() public view returns (string memory) {
    return contractURIData;
  }

  /// @dev Sets the base token URI prefix.
  function setBaseTokenURI(string memory _baseTokenURI) public onlyOwner {
    baseTokenURI = _baseTokenURI;
  }

  function safeMint(address to) public onlyOwner {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
  }

  //upper limit is included
  function mintUpper(address to, uint256 upper) external onlyOwner {
    uint256 tokenId = _tokenIdCounter.current();
    for (uint256 i = tokenId; i <= upper; i++) {
      _tokenIdCounter.increment();
      _safeMint(to, i);
    }
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
