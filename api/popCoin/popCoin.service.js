const dbService = require("../../services/db.service");
const logger = require("../../services/logger.service");
const ObjectId = require("mongodb").ObjectId;
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
module.exports = {
  getWalletAddress,
};

async function getWalletAddress(privateKey) {
    const myKey = ec.keyFromPrivate(privateKey)
    return myKey.getPublic('hex')
}


async function _createWallet(transaction,wallet) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            username: user.username,
            password: user.password,
            privateKey: user.privateKey
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

async function updateWallet(transaction, wallet) {
    try {
        // peek only updatable properties
        const userToSave = {
            _id: ObjectId(wallet._id), // needed for the returnd obj
            fullname: user.fullname,
            score: user.score,
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}