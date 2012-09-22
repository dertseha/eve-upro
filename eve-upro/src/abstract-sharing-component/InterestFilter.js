/**
 * @returns a function for Array.fold(), filtering interest that match the given character
 */
module.exports.filterFunctionForCharacter = function(character)
{
   return function(interest)
   {
      var interestFunc = character['hasInterestFor' + interest.scope];

      return interestFunc && interestFunc.call(character, interest.id);
   };
};
