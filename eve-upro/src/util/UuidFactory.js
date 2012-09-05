var crypto = require('crypto');

var uuid = require('node-uuid');
var mongodb = require('mongodb');

var v4Options =
{
   rng: uuid.nodeRNG
};

/**
 * Creates a UUID from a hash, which is used for either v3 or v5 variants
 * 
 * @param algorithm the algorithm to use. Works with 'sha1' and 'md5'
 * @param version the version - set in the UUID
 * @param namespace base namespace UUID to use
 * @param name a string which is to be incorporated into the ID
 * @returns UUID string
 */
function fromHash(algorithm, version, namespace, name)
{
   var hash = crypto.createHash(algorithm);
   var result = '';

   hash.update(exports.toBuffer(namespace));
   hash.update(name, 'utf8');
   var digest = hash.digest('hex');

   result += digest.substring(0, 12);
   result += version;
   result += digest.substring(13, 13 + 3);
   result += ((parseInt(digest.substring(16, 17), 16) & 0x3) | 0x8).toString(16);
   result += digest.substring(17, 17 + 15);

   return result;
}

exports.empty = function()
{
   return '00000000000000000000000000000000';
};

exports.v3 = function(namespace, name)
{
   return fromHash('md5', 3, namespace, name);
};

exports.v4 = function()
{
   return uuid.v4(v4Options).replace(/-/g, '');
};

exports.v5 = function(namespace, name)
{
   return fromHash('sha1', 5, namespace, name);
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
