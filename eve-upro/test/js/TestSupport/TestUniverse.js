TestUniverse = Class.create(
{
   initialize: function()
   {
      this.universe = new upro.nav.Universe();
   },

   givenNewEden: function()
   {
      if (typeof (globalNewEden) == "undefined")
      {
         var galaxyId = 9;
         var solarSystems = upro.res.eve.MapData[galaxyId].solarSystemData;
         var jumpCorridors = upro.res.eve.MapData[galaxyId].solarSystemJumpData;

         this.givenAGalaxy(galaxyId, "New Eden");
         globalNewEden = this.galaxy;
         for ( var i = 0; i < solarSystems.length; i++)
         {
            var data = solarSystems[i];

            this.givenASolarSystem(data[0], data[3], data[4], data[5], data[6], data[7], data[1], data[2]);
         }
         for ( var i = 0; i < jumpCorridors.length; i++)
         {
            var data = jumpCorridors[i];

            this.givenASimpleStaticJumpCorridor(data[0], data[1]);
         }
      }
      else
      {
         this.galaxy = globalNewEden;
         this.universe.galaxies.add(this.galaxy);
      }
   },

   givenAGalaxy: function(id, name)
   {
      var galaxy = upro.nav.Galaxy.create(id, name);

      this.galaxy = galaxy;
      this.universe.galaxies.add(galaxy);
   },

   givenASolarSystem: function(id, name, x, y, z, security, regionId, constellationId)
   {
      var system = upro.nav.SolarSystem.create(id, name, x, y, z, security, regionId, constellationId);

      this.galaxy.solarSystems.add(system);
   },

   givenASimpleStaticJumpCorridor: function(systemId1, systemId2)
   {
      this.galaxy.addStaticJumpCorridor(systemId1, systemId2, upro.nav.JumpType.JumpGate);
   },

   findSolarSystem: function(systemIdOrName)
   {
      var system = this.galaxy.solarSystems.get(systemIdOrName);

      if (system === undefined)
      {
         system = this.galaxy.solarSystems.findExact(systemIdOrName);
      }

      return system;
   }

});
