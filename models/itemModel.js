const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    condition: { type: String },
    price: { type: Number, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
