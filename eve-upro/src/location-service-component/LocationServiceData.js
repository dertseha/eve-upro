var util = require('util');

function LocationServiceData(character, broadcaster, storage)
{
   this.character = character;
   this.broadcaster = broadcaster;
   this.storage = storage;

};

module.exports = LocationServiceData;
