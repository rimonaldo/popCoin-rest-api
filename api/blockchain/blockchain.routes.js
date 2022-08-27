const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {addTransaction, getWallet,postWallet,postBlockchain,minePending,validateChain} = require('./blockchain.controller')
const router = express.Router()

router.get('/wallet',getWallet)
router.post('/wallet',requireAuth,postWallet)
router.post('/transaction',requireAuth,addTransaction)
router.post('/mine',requireAuth,minePending)


module.exports = router