const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    msg: { type: String, required: true, trim: true, maxlength: 500 },
    thumbUp: { type: Number, default: 0 },
    thumbDown: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// stored in the "messages" collection, same as the original app
module.exports = mongoose.model("Message", messageSchema);
