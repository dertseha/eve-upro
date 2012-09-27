var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var AbstractLogInRequestState = require('./AbstractLogInRequestState.js');
var LogInRequestStateCorpInfo = require('./LogInRequestStateCorpInfo.js');

function LogInRequestStateKeyInfo(request)
{
   LogInRequestStateKeyInfo.super_.call(this, request);

   this.handleEveApiResult = function(struct)
   {
      if ((struct.response.key.accessMask === 0) && (struct.response.key.type == "Character")
            && (struct.response.characters.length == 1))
      {
         var character = struct.response.characters[0];
         var user =
         {
            characterId: character.characterID,
            characterName: character.characterName,
            corporationId: character.corporationID,
            corporationName: character.corporationName
         };

         if (request.getOwner().isUserAllowed(user))
         {
            var state = new LogInRequestStateCorpInfo(request, user);

            state.activate();
         }
         else
         {
            logger.warn('Denied login request for character ' + user.characterId + ' [' + user.characterName + ']');
            request.done(null, false);
         }
      }
      else
      {
         logger.warn('Failed login request, API key did not match expectations; Type: [' + struct.response.key.type
               + '], accessMask: ' + struct.response.key.accessMask + ' Character(s): '
               + struct.response.characters.length);
         request.done(null, false);
      }

   };
}
util.inherits(LogInRequestStateKeyInfo, AbstractLogInRequestState);

module.exports = LogInRequestStateKeyInfo;
