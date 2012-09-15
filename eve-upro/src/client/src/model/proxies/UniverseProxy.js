/**
 * Proxy for the universe data - filling the map information
 * 
 * Note that the Y components are all inverted from the data. It was either a) handle the inversion at every point in
 * the view b) handle it once at the source
 */
upro.model.proxies.UniverseProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UniverseProxy.NAME, new upro.nav.Universe());

      this.loadTimer = null;
      this.loaded = 0;

      this.jumpCorridors = {};
   },

   onRegister: function()
   {
      this.createGalaxies();
   },

   /**
    * Returns the universe reference
    * 
    * @return the universe reference
    */
   getUniverse: function()
   {
      return this.getData();
   },

   /**
    * Returns the galaxy of given id
    * 
    * @return the galaxy of given id
    */
   getGalaxy: function(galaxyId)
   {
      return this.getUniverse().galaxies.get(galaxyId);
   },

   /**
    * Tries to find a solar system by its id. Assumes IDs are unique across galaxies.
    * 
    * @param solarSystemId Id to look for
    * @return SolarSystem matching the given id
    */
   findSolarSystemById: function(solarSystemId)
   {
      var solarSystem = null;
      var universe = this.getUniverse();
      var galaxy = null;

      // Do a blunt approach - no loops or anything.
      galaxy = universe.galaxies.get(upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN);
      solarSystem = galaxy.solarSystems.get(solarSystemId);
      if (!solarSystem)
      {
         galaxy = universe.galaxies.get(upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE);
         solarSystem = galaxy.solarSystems.get(solarSystemId);
      }

      return solarSystem;
   },

   /**
    * Creates the galaxies known within the EVE universe. Currently: New Eden and W-Space.
    */
   createGalaxies: function()
   {
      var universe = this.getUniverse();

      // The values have been extracted from the database. They shouldn't change that often.
      {
         var galaxy = upro.nav.Galaxy.create(upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN, "New Eden", -78415,
               -40007, 18791, 25000.0);

         universe.galaxies.add(galaxy);
         this.fillGalaxy(galaxy, upro.nav.JumpType.JumpGate);
      }
      {
         var galaxy = upro.nav.Galaxy.create(upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE, "W-Space", 7704164,
               -15393, 9519056, 25000.0);

         universe.galaxies.add(galaxy);
         this.fillGalaxy(galaxy, upro.nav.JumpType.StaticWormhole);
      }
   },

   /**
    * Fills given galaxy with all known map data
    * 
    * @param galaxy to fill
    * @param staticJumpType type of static jumps in this galaxy
    */
   fillGalaxy: function(galaxy, staticJumpType)
   {
      var mapData = upro.res.eve.MapData[galaxy.id];

      /*
       * Initially it was planned to load the whole map data based on a timer to allow the app to be responsive and have
       * some sort-of-cool gathering effect to see (as the systems flash up over time). It turned out to be not only
       * slow, but very CPU demanding as well. In contrast, downloading the whole map data in bulk takes less than a
       * second (on my machine - field tests will show how this works out).
       */
      if (mapData != undefined)
      {
         this.loadRegions(galaxy, mapData);
         this.loadConstellations(galaxy, mapData);
         this.loadSolarSystems(galaxy, mapData);
         this.loadSolarSystemJumps(galaxy, mapData, staticJumpType);
      }
   },

   /**
    * Loads the regions into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    */
   loadRegions: function(galaxy, mapData)
   {
      var regionData = mapData.regionData;
      var entry, region;

      for ( var i = 0; i < regionData.length; i++)
      {
         entry = regionData[i];
         region = upro.nav.Region.create(entry[0], entry[1], entry[2], -entry[3], entry[4]);
         galaxy.regions.add(region);
      }
   },

   /**
    * Loads the constellations into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    */
   loadConstellations: function(galaxy, mapData)
   {
      var constellationData = mapData.constellationData;
      var entry, constellation;

      for ( var i = 0; i < constellationData.length; i++)
      {
         entry = constellationData[i];
         constellation = upro.nav.Constellation.create(entry[1], entry[2], entry[3], -entry[4], entry[5], entry[0]);
         galaxy.constellations.add(constellation);
      }
   },

   /**
    * Loads the solar systems into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    */
   loadSolarSystems: function(galaxy, mapData)
   {
      var solarSystemData = mapData.solarSystemData;
      var entry, system;

      for ( var i = 0; i < solarSystemData.length; i++)
      {
         entry = solarSystemData[i];
         system = upro.nav.SolarSystem.create(entry[0], entry[3], entry[4], -entry[5], entry[6], entry[7], entry[1],
               entry[2]);
         galaxy.solarSystems.add(system);
      }
   },

   /**
    * Loads the static solar system jumps into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    * @param staticJumpType type of static jumps in this galaxy
    */
   loadSolarSystemJumps: function(galaxy, mapData, staticJumpType)
   {
      var jumpData = mapData.solarSystemJumpData;
      var entry;

      for ( var i = 0; i < jumpData.length; i++)
      {
         entry = jumpData[i];
         galaxy.addStaticJumpCorridor(entry[0], entry[1], staticJumpType);
      }
   },

   /**
    * Adds a jump corridor to the universe
    * 
    * @param id key for later removal
    * @param entrySolarSystem entry system
    * @param exitSolarSystem exit system
    * @param jumpType jump type for the corridor
    */
   addJumpCorridor: function(id, entrySolarSystem, exitSolarSystem, jumpType)
   {
      var jumpCorridor = new upro.nav.JumpCorridor(id, entrySolarSystem.galaxy, entrySolarSystem.id,
            exitSolarSystem.galaxy, exitSolarSystem.id, jumpType);

      this.jumpCorridors[id] = jumpCorridor;
      this.facade().sendNotification(upro.app.Notifications.UniverseJumpCorridorsChanged);
   },

   /**
    * Removes a previously added jump corridor by given key
    * 
    * @param id identification of corridor
    */
   removeJumpCorridor: function(id)
   {
      var jumpCorridor = this.jumpCorridors[id];

      if (jumpCorridor)
      {
         jumpCorridor.dispose();
         delete this.jumpCorridors[id];
         this.facade().sendNotification(upro.app.Notifications.UniverseJumpCorridorsChanged);
      }
   }

});

upro.model.proxies.UniverseProxy.NAME = "Universe";

upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN = 9;
upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE = 9000001;
