const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minLength: 3
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
  },
  blogs: [
    {
      // type: mongoose.Schema.Types.ObjectId,
      title: String,
      author: String,
      url: String,
      id: String,
      _id: mongoose.Schema.Types.ObjectId,
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User