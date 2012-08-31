/**
 * This proxy is the primary entry point for everything group related
 */
upro.model.GroupInfo = Class.create(
{
   initialize: function(id, groupData, clientCharacterId)
   {
      this.id = id;
      this.groupData = groupData;
      this.clientCharacterId = clientCharacterId;
      this.members = [];
   },

   toString: function()
   {
      return this.id + ' [' + this.groupData.name + ']';
   },

   getId: function()
   {
      return this.id;
   },

   getName: function()
   {
      return this.groupData.name;
   },

   hasMembers: function()
   {
      return this.members.length > 0;
   },

   addMembers: function(members)
   {
      var that = this;
      var rCode = false;

      members.forEach(function(memberId)
      {
         if (!that.isCharacterMember(memberId))
         {
            that.members.push(memberId);
            rCode = true;
         }
      });

      return rCode;
   },

   removeMembers: function(members)
   {
      var that = this;
      var rCode = false;

      members.forEach(function(memberId)
      {
         var index = that.members.indexOf(memberId);

         if (index >= 0)
         {
            var part1 = that.members.slice(0, index);
            var part2 = that.members.slice(index + 1);

            that.members = part1.concat(part2);
            rCode = true;
         }
      });

      return rCode;
   },

   /**
    * @returns true if the group has ownership explicitly identified
    */
   hasExplicitOwner: function()
   {
      return this.groupData.owner.length > 0;
   },

   /**
    * @returns true if the given character is owning this group
    */
   isCharacterOwner: function(characterId)
   {
      return this.groupData.owner.indexOf(characterId) >= 0;
   },

   isClientOwner: function()
   {
      return !this.hasExplicitOwner() || this.isCharacterOwner(this.clientCharacterId);
   },

   isCharacterMember: function(characterId)
   {
      return this.members.indexOf(characterId) >= 0;
   },

   isClientMember: function()
   {
      return this.isCharacterMember(this.clientCharacterId);
   },

   isClientAdvertised: function()
   {
      return false;
   }

});