const express = require("express")
const { requireAuth, requireAdmin } = require("../../middlewares/requireAuth.middleware")
const { getPending, minePending } = require("./miner.controller")
const router = express.Router()

router.get("/pending", requireAuth, getPending)
router.post("/mine", requireAuth, minePending)

module.exports = router
