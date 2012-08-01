uuidJs = require('uuid-js');

exports.empty = function()
{
   return '00000000000000000000000000000000';
};

exports.v4 = function()
{
   return uuidJs.create(4).toString().replace(/-/g, '');
};
