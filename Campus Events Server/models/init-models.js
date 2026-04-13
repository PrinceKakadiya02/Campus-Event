var DataTypes = require("sequelize").DataTypes;
var _event = require("./event");
var _userRegistration = require("./userRegistration");
var _user = require("./user");
var _otpVerification = require("./otpVerification");
var _contact = require("./contact");

function initModels(sequelize) {
  var event = _event(sequelize, DataTypes);
  var userRegistration = _userRegistration(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var otpVerification = _otpVerification(sequelize, DataTypes);
  var Contact = _contact(sequelize, DataTypes);

  userRegistration.belongsTo(event, { as: "event", foreignKey: "event_id" });
  event.hasMany(userRegistration, { as: "user_registrations", foreignKey: "event_id" });
  userRegistration.belongsTo(userRegistration, { as: "parent", foreignKey: "parent_id", constraints: false });
  userRegistration.hasMany(userRegistration, { as: "user_registrations", foreignKey: "parent_id", constraints: false });
  event.belongsTo(user, { as: "organizer", foreignKey: "organizer_id" });
  user.hasMany(event, { as: "events", foreignKey: "organizer_id" });
  userRegistration.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(userRegistration, { as: "user_registrations", foreignKey: "user_id" });

  return {
    event,
    userRegistration,
    user,
    otpVerification,
    Contact,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
