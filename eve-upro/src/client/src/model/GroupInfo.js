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
      this.advertisements = [];
      this.clientAdvertised = false;
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
      return this.groupData.name.escapeHTML();
   },

   hasMembers: function()
   {
      return this.members.length > 0;
   },

   forEachMember: function(callback)
   {
      this.members.forEach(callback);
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
            that.removeOwner(memberId);
            rCode = true;
         }
      });

      return rCode;
   },

   removeOwner: function(ownerId)
   {
      var index = this.groupData.owner.indexOf(ownerId);
      var rCode = false;

      if (index >= 0)
      {
         var part1 = this.groupData.owner.slice(0, index);
         var part2 = this.groupData.owner.slice(index + 1);

         this.groupData.owner = part1.concat(part2);
         rCode = true;
      }

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

   isCharacterAllowedControl: function(characterId)
   {
      return !this.hasExplicitOwner() || this.isCharacterOwner(characterId);
   },

   isClientAllowedControl: function()
   {
      return this.isCharacterAllowedControl(this.clientCharacterId);
   },

   isCharacterMember: function(characterId)
   {
      return this.members.indexOf(characterId) >= 0;
   },

   isClientMember: function()
   {
      return this.isCharacterMember(this.clientCharacterId);
   },

   setAdvertisements: function(list)
   {
      this.advertisements = list;
   },

   getAdvertisements: function()
   {
      return this.advertisements;
   },

   setClientAdvertised: function(value)
   {
      var rCode = false;

      if (this.clientAdvertised != value)
      {
         this.clientAdvertised = value;
         rCode = true;
      }

      return rCode;
   },

   isClientAdvertised: function()
   {
      return this.clientAdvertised;
   }

});
