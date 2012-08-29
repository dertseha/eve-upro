var uuidJs = require('uuid-js');
var mongodb = require('mongodb');

exports.empty = function()
{
   return '00000000000000000000000000000000';
};

exports.v4 = function()
{
   return uuidJs.create(4).toString().replace(/-/g, '');
};

exports.toBuffer = function(uuid)
{
   return new Buffer(uuid, 'hex');
};

exports.fromBuffer = function(buffer)
{
   return buffer.toString('hex');
};

exports.toMongoId = function(uuid)
{
   var buf = exports.toBuffer(uuid);

   return new mongodb.Binary(buf, 4);
};

exports.fromMongoId = function(id)
{
   var buf = id.read(0, id.length());

   return exports.fromBuffer(buf);
};
