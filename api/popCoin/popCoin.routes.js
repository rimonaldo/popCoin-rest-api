const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {sendCoins, getWallet,} = require('./popCoin.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

// router.get('/', getUsers)
// router.get('/:id', getUser)
// router.put('/:id', requireAuth,  updateUser)
// router.delete('/:id',  requireAuth, requireAdmin, deleteUser)
router.get('/wallet',getWallet)
router.post('/transaction',sendCoins)


module.exports = router