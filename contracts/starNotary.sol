pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

mapping(uint256 => string) public tokenIdToStarInfo;
mapping(uint256 => uint256) public starsForSale;

/**
* Requirement -1 : Add a name and a symbol for your starNotary token
*/
string public tokenName = "Star Notary Noken";
string public tokenSymbol = "SNC";
uint public decimals = 18;

function createStar(string _name, uint256 _tokenId) public {

    tokenIdToStarInfo[_tokenId] = _name;

    _mint(msg.sender, _tokenId);
}

function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
    require(this.ownerOf(_tokenId) == msg.sender);

    starsForSale[_tokenId] = _price;
}

function buyStar(uint256 _tokenId) public payable {
    require(starsForSale[_tokenId] > 0);

    uint256 starCost = starsForSale[_tokenId];
    address starOwner = this.ownerOf(_tokenId);
    require(msg.value >= starCost);

    _removeTokenFrom(starOwner, _tokenId);
    _addTokenTo(msg.sender, _tokenId);

    starOwner.transfer(starCost);

    if(msg.value > starCost) {
        msg.sender.transfer(msg.value - starCost);
    }

    starsForSale[_tokenId] = 0;
  }

/**
* Requirement -2 : Function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, 
* and then returns the name of the star.
*/
function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (string){

    return tokenIdToStarInfo[_tokenId] ;

}
/**
* Requirement -3 : Function  exchangeStars: Two users can exchange their star tokens...
* Do not worry about the price, just write code to exchange stars between users.
*/
function exchangeStars(address from, address to, uint256 _tokenId) public {

    _removeTokenFrom(from, _tokenId);
    _addTokenTo(to, _tokenId);

}

/**
* Requirement -4 : Function to Transfer a Star. The function should transfer a star from the address 
* of the caller. The function should accept 2 arguments, the address to transfer the star to, 
* and the token ID of the star.
*/
function transferStar(address from, uint256 _tokenId) public {

    _removeTokenFrom(from, _tokenId);
    _addTokenTo(msg.sender, _tokenId);

}

}
