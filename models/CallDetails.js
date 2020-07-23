const mongoose = require('mongoose');

const CallDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  Incomingcall_Count: {
    type: Number,
    default:0
  },
  outgoingcall_Count: {
    type: Number,
    default:0
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String
  },
  number: {
    type: Number
  }
});

module.exports = CallDetails = mongoose.model('callDetails', CallDetailsSchema);
