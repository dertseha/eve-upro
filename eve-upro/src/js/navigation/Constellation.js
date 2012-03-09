upro.nav.Constellation = Class.create(
{
   initialize: function(id, name, x, y, z, regionId)
   {
      var constellation = this;

      this.id = id;
      this.name = name;
      this.position = vec3.create([x, y, z]);

      this.galaxy = null;
      this.regionId = regionId;
      this.region = null;

      this.solarSystems = new upro.nav.IdentifiedObjectHolder(this);
      this.solarSystems.register(
      {
         onAdded: function(system) { constellation.onSolarSystemAdded(system); },
         onRemoved: function(system) { }
      });
   },

   toString: function()
   {
      return 'Constellation [' + this.name + ']';
   },

   onSolarSystemAdded: function(system)
   {
      system.constellation = this;
   }

});

upro.nav.Constellation.create = function(id, name, x, y, z, regionId)
{
   return new upro.nav.Constellation(id, name, x, y, z, regionId);
};
