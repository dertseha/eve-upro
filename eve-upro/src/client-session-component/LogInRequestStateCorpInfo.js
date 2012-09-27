var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var AbstractLogInRequestState = require('./AbstractLogInRequestState.js');

function LogInRequestStateCorpInfo(request, user)
{
   LogInRequestStateCorpInfo.super_.call(this, request);

   this.activate = function()
   {
      var parameters =
      {
         corporationID: user.corporationId
      };

      request.setState(this);
      request.getOwner().eveApiRequest('CorpCorporationSheet', parameters, request.getId());
   };

   this.handleEveApiResult = function(struct)
   {
      if (struct.response.corporation.allianceId)
      {
         user.allianceId = struct.response.corporation.allianceId;
         user.allianceName = struct.response.corporation.allianceName;
      }

      logger.info('Successful login request for character ' + user.characterId + ' [' + user.characterName + ']');
      request.done(null, user);
   };
}
util.inherits(LogInRequestStateCorpInfo, AbstractLogInRequestState);

module.exports = LogInRequestStateCorpInfo;
