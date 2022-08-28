const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId

module.exports = {
   query,
   getById,
   getByUsername,
   remove,
   update,
   add,
}

async function query(filterBy = {}) {
   const criteria = _buildCriteria(filterBy)
   try {
      const collection = await dbService.getCollection("user")
      var users = await collection.find(criteria).toArray()
      users = users.map(user => {
         delete user.password
         user.createdAt = ObjectId(user._id).getTimestamp()
         // Returning fake fresh data
         // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
         return user
      })
      return users
   } catch (err) {
      logger.error("cannot find users", err)
      throw err
   }
}

async function getById(userId) {
   try {
      const collection = await dbService.getCollection("user")
      console.log(userId)
      const user = await collection.findOne({ _id: ObjectId(userId) })
      delete user.password

      return user
   } catch (err) {
      logger.error(`while finding user by id: ${userId}`, err)
      throw err
   }
}
async function getByUsername(username) {
   try {
      const collection = await dbService.getCollection("user")
      const user = await collection.findOne({ username })
      return user
   } catch (err) {
      logger.error(`while finding user by username: ${username}`, err)
      throw err
   }
}

async function remove(userId) {
   try {
      const collection = await dbService.getCollection("user")
      await collection.deleteOne({ _id: ObjectId(userId) })
   } catch (err) {
      logger.error(`cannot remove user ${userId}`, err)
      throw err
   }
}

async function update(user) {
   try {
      // peek only updatable properties
      const userToSave = {
         _id: ObjectId(user._id), // needed for the returnd obj
         moves: user.moves,
      }
      const collection = await dbService.getCollection("user")
      await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
      console.log('userToSave',userToSave);
      return user
   } catch (err) {
      logger.error(`cannot update user ${user._id}`, err)
      throw err
   }
}

async function add(user) {
   try {
      // peek only updatable fields!
      const userToAdd = {
         username: user.username,
         password: user.password,
         privateKey: user.privateKey,
         walletAddress: user.walletAddress,
         email: `${user.username}@renovize.com`,
         phone: "+1 (968) 593-3824",
         moves: [],
         coins:1000
      }
      const collection = await dbService.getCollection("user")
      await collection.insertOne(userToAdd)
      return userToAdd
   } catch (err) {
      logger.error("cannot insert user", err)
      throw err
   }
}




function _buildCriteria(filterBy) {
   const criteria = {}
   if (filterBy.txt) {
      const txtCriteria = { $regex: filterBy.txt, $options: "i" }
      criteria.$or = [
         {
            username: txtCriteria,
         },
         {
            fullname: txtCriteria,
         },
      ]
   }
   if (filterBy.minBalance) {
      criteria.score = { $gte: filterBy.minBalance }
   }
   return criteria
}
