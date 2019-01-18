//import 'babel-polyfill';
const StarNotary = artifacts.require('./starNotary.sol')

let instance;
let accounts;


contract('StarNotary', async (accs) => {
    accounts = accs;
    instance = await StarNotary.deployed();
  });

  it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
  });

  it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1]
    let starId = 2;
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    assert.equal(await instance.starsForSale.call(starId), starPrice)
  });

  it('lets user1 get the funds after the sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 3
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
    await instance.buyStar(starId, {from: user2, value: starPrice})
    let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)
    assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), balanceOfUser1AfterTransaction.toNumber());
  });

  it('lets user2 buy a star, if it is put up for sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 4
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice});
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it('lets user2 buy a star and decreases its balance in ether', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 5
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice:0})
    const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)
    assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice);
  });

/**
* Test Requirement -1 : Test, that the token name and token symbol are added properly.
*/
  it('The token name is added properly', async() => {
    assert.equal(await instance.tokenName.call(), 'Star Notary Noken')
   });
   it('The token symbol is added properly', async() => {
    assert.equal(await instance.tokenSymbol.call(), 'SNC')
   });
/**
* Test Requirement -2 : Test, that 2 users can exchange their stars.
*/
it('lets exchange token from user2 to user1', async() => {

  // create a star owned by accounts[1]
  let user1 = accounts[0]
  let user2 = accounts[1]
  let starId = 21
  await instance.createStar('awesome star 21 for user2', starId, {from: user2})
  // transfer token owned by user2 to user1
  await instance.exchangeStars(user2, user1, starId)
  // check if the token is now owned by user1 
  assert.equal(await instance.ownerOf(starId), user1)

});

/**
* Test Requirement -3 : Test, that Star Tokens can be transferred from one address to another.
*/
it('lets transfer token from address[1] to address[0]', async() => {
  // create a star owned by accounts[1]
  let user2 = accounts[1]
  let starId = 31
  await instance.createStar('awesome star 31 for user2', starId, {from: user2})
  // transfer token owned by accounts[1] to accounts[0]
  await instance.transferStar(user2, starId, {from: accounts[0]})
  // check if the token is now owned by accounts[0] 
  assert.equal(await instance.ownerOf(starId), accounts[0])

});

