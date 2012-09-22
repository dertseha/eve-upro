/**
 * This proxy is the primary entry point for everything group related
 */
upro.model.GroupInfo = Class.create(upro.model.AbstractSharedObjectInfo,
{
   initialize: function($super, id, controller, interestChecker, clientCharacterId)
   {
      $super(id, "Group", controller, interestChecker);

      this.clientCharacterId = clientCharacterId;
      this.data = {};
      this.members = [];
      this.blackList = [];
   },

   toString: function()
   {
      return this.id + ' [' + this.data.name + ']';
   },

   getId: function()
   {
      return this.id;
   },

   getName: function()
   {
      return this.data.name;
   },

   /**
    * Updates the data
    * 
    * @param data data object to extract from
    */
   updateData: function(data)
   {
      this.data.name = data.name;
   },

   hasMembers: function()
   {
      return this.members.length > 0;
   },

   isCharacterMember: function(characterId)
   {
      return this.members.indexOf(characterId) >= 0;
   },

   isClientMember: function()
   {
      return this.isCharacterMember(this.clientCharacterId);
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
            that.members.splice(index, 1);
            rCode = true;
         }
      });

      return rCode;
   },

   forEachBanned: function(callback)
   {
      this.blackList.forEach(callback);
   },

   isClientBanned: function()
   {
      return this.blackList.indexOf(this.clientCharacterId) >= 0;
   }
});
