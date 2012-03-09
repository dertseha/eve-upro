
TestInfo = Class.create(upro.data.DataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.references = {};
   },

   onReferenceAdded: function(info)
   {
      this.references[info.getInfoId().toString()] = info;
   },

   onReferenceRemoved: function(info)
   {
      delete this.references[info.getInfoId().toString()];
   }

});
