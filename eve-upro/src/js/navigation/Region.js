upro.nav.Region = Class.create(
{
   initialize: function(id, name, x, y, z, galaxyId)
   {
      var region = this;

      this.id = id;
      this.name = name;
      this.position = vec3.create([x, y, z]);

      this.galaxyId = galaxyId;
      this.galaxy = null;

      this.solarSystems = new upro.nav.IdentifiedObjectHolder(this);
      this.solarSystems.register(
      {
         onAdded: function(system) { region.onSolarSystemAdded(system); },
         onRemoved: function(system) { }
      });
      this.constellations = new upro.nav.IdentifiedObjectHolder(this);
      this.constellations.register(
      {
         onAdded: function(constellation) { region.onConstellationAdded(constellation); },
         onRemoved: function(constellation) { }
      });
   },

   toString: function()
   {
      return 'Region [' + this.name + ']';
   },

   onSolarSystemAdded: function(system)
   {
      var constellation = this.constellations.get(system.constellationId);

      system.region = this;
      if (constellation != undefined)
      {
         this.registerSolarSystemInConstellation(constellation, system);
      }
   },

   onConstellationAdded: function(constellation)
   {
      constellation.region = this;
      for (systemId in this.solarSystems.objects)
      {
         var system = this.solarSystems.get(systemId);

         if (system.constellationId === constellation.id)
         {
            this.registerSolarSystemInConstellation(constellation, system);
         }
      }
   },

   registerSolarSystemInConstellation: function(constellation, system)
   {
      if ((system.constellation === null) && (constellation.solarSystems.get(system.id) === undefined))
      {
         constellation.solarSystems.add(system);
      }
   }

});

upro.nav.Region.create = function(id, name, x, y, z)
{
   return new upro.nav.Region(id, name, x, y, z);
};
