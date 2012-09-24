/**
 * interest checker for local client/user
 */
upro.model.proxies.LocalBasedInterestChecker = Class.create(upro.model.InterestChecker,
{
   initialize: function($super, characterInfo, groupProxy)
   {
      $super();

      this.characterInfo = characterInfo;
      this.groupProxy = groupProxy;
   },

   /** {@inheritDoc} */
   hasInterest: function(interest)
   {
      var rCode = false;

      if (interest.scope === "Character")
      {
         rCode = this.characterInfo.characterId == interest.id;
      }
      else if (interest.scope === "Corporation")
      {
         rCode = this.characterInfo.corporationId == interest.id;
      }
      else if ((interest.scope === "Alliance") && this.characterInfo.allianceId)
      {
         rCode = this.characterInfo.allianceId == interest.id;
      }
      else if (interest.scope === "Group")
      {
         var group = this.groupProxy.getGroup(interest.id);

         rCode = group && group.isClientMember();
      }

      return rCode;
   }

});
