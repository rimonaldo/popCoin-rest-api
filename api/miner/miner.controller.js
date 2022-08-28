const logger = require('../../services/logger.service')
const blockchainService = require('../blockchain/blockchain.service')
const { Transaction, Blockchain, Block } = require('../../src/blockchain')

module.exports = {
   minePending,
   getPending,
}

async function minePending(req, res) {
   let popCoin = new Blockchain()
   try {
      // SET DATA
      const popCoinData = await blockchainService.getBlockchainData('popCoin')
      popCoin = blockchainService.setCoinData(popCoinData)
      // MINE
      popCoin.minePendingTransactions()
      // VALIDATE
      const isValidChain = await blockchainService.isChainValid()
      if (!isValidChain) res.send('not valid chain')
      // UPDATE
      blockchainService.updateBlockchainData(popCoin)
      res.send(popCoin)
   } catch (err) {
      logger.error('Failed to mine pending', err)
      res.status(500).send({ err: 'Failed to mine pending' })
   }
}

async function getPending(req, res) {
   try {
      const popCoinData = await blockchainService.getBlockchainData('popCoin')
      const { pendingTransactions } = popCoinData
      res.send(pendingTransactions)
   } catch (err) {
      logger.error('Failed to get users', err)
      res.status(500).send({ err: 'Failed to get users' })
   }
}
