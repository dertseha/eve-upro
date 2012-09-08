/**
 * The galaxy is the entry point for everything contained in it. An application should add any smaller entities via this
 * class, which then takes care to register all references within it.
 * 
 * Regions, Constellations, Systems and Jump Corridors can be added at any time, in any order. The idea is that an
 * application can load the corresponding data in a timer, bit by bit, to prohibit stalling during startup.
 * 
 */
upro.nav.Galaxy = Class.create(
{
   initialize: function(id, name, x, y, z, scale)
   {
      var galaxy = this;

      this.id = id;
      this.name = name;
      this.scale = scale ? scale : 1;
      this.position = vec3.create([ x, y, z ]);

      this.solarSystems = new upro.nav.IdentifiedObjectHolder(this);
      this.solarSystems.register(
      {
         onAdded: function(system)
         {
            galaxy.onSolarSystemAdded(system);
         },
         onRemoved: function(system)
         {
         }
      });
      this.constellations = new upro.nav.IdentifiedObjectHolder(this);
      this.constellations.register(
      {
         onAdded: function(constellation)
         {
            galaxy.onConstellationAdded(constellation);
         },
         onRemoved: function(constellation)
         {
         }
      });
      this.regions = new upro.nav.IdentifiedObjectHolder(this);
      this.regions.register(
      {
         onAdded: function(region)
         {
            galaxy.onRegionAdded(region);
         },
         onRemoved: function(region)
         {
         }
      });

      this.jumpCorridors = [];
   },

   toString: function()
   {
      return 'Galaxy [' + this.name + ']';
   },

   /**
    * Adds a static jump corridor within this galaxy. Only suitable for NewEden's gates or possibly W-Space internal
    * statics
    */
   addStaticJumpCorridor: function(systemId1, systemId2, jumpType)
   {
      var corridor = new upro.nav.JumpCorridor(this, systemId1, this, systemId2, jumpType);

      this.jumpCorridors.push(corridor);
   },

   onSolarSystemAdded: function(system)
   {
      var region = this.regions.get(system.regionId);

      system.galaxy = this;
      if (region != undefined)
      {
         this.registerSolarSystemInRegion(region, system);
      }
   },

   onConstellationAdded: function(constellation)
   {
      constellation.galaxy = this;
      for (regionId in this.regions.objects)
      {
         var region = this.regions.get(regionId);

         if (constellation.regionId === region.id)
         {
            this.registerConstellationInRegion(region, constellation);
         }
      }
   },

   onRegionAdded: function(region)
   {
      region.galaxy = this;
      for (constellationId in this.constellations.objects)
      {
         var constellation = this.constellations.get(constellationId);

         if (constellation.regionId === region.id)
         {
            this.registerConstellationInRegion(region, constellation);
         }
      }
      for (systemId in this.solarSystems.objects)
      {
         var system = this.solarSystems.get(systemId);

         if (system.regionId === region.id)
         {
            this.registerSolarSystemInRegion(region, system);
         }
      }
   },

   registerConstellationInRegion: function(region, constellation)
   {
      if ((constellation.region === null) && (region.constellations.get(constellation.id) === undefined))
      {
         region.constellations.add(constellation);
      }
   },

   registerSolarSystemInRegion: function(region, system)
   {
      if ((system.region === null) && (region.solarSystems.get(system.id) === undefined))
      {
         region.solarSystems.add(system);
      }
   }

});

upro.nav.Galaxy.create = function(id, name, x, y, z, scale)
{
   return new upro.nav.Galaxy(id, name, x, y, z, scale);
};
