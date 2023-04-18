const mongoose = require(`mongoose`);
const validator = require(`validator`);
const bcrypt = require(`bcrypt`);
const crypto = require(`crypto`);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please insert your name"],
    trim: true,
    maxLength: [30, "Name can be only 30 characters long!"],
    minLength: [2, `Name can't be less thenn 2 characters long!`],
  },

  email: {
    type: String,
    required: [true, "Please provide your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, `Please provide valid email!`],
  },

  role: {
    type: String,
    enum: [`admin`, `user`, `guide`, `lead-guide`],
    default: `user`,
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    select: false,
  },

  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    unique: true,
    validate: {
      validator: function (v) {
        return /\b(09[1|2|5|7|8|9])+([0-9]{7,8})\b/.test(v);
      },
      message: "Please enter a valid phone number",
    },
  },

  passwordConfirm: {
    type: String,
    required: [false, "Please confirm your password"],
  },

  profilePicture: {
    data: Buffer,
    contentType: String,
  },

  passwordResetToken: String,
  passwordResetExpires: Date,
});

//HASH PASSWORD AND SAVE IT TO DATABASE
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  providedPassword,
  databasePassword
) {
  return await bcrypt.compare(providedPassword, databasePassword);
};

//PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString(`hex`);

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model(`User`, userSchema);
module.exports = User;
