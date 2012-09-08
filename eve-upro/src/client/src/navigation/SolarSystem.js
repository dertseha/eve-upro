upro.nav.SolarSystem = Class.create(
{
   initialize: function(id, name, x, y, z, security, regionId, constellationId)
   {
      this.id = id;
      this.name = name;
      this.position = vec3.create([ x, y, z ]);
      this.trueSec = security;
      this.security = (Math.floor((security + 0.05) * 10) / 10.0).toFixed(1);
      if (this.security < 0.0)
      {
         this.security = 0.0;
      }

      this.galaxy = null;
      this.regionId = regionId;
      this.region = null;
      this.constellationId = constellationId;
      this.constellation = null;

      this.jumpPortals = new upro.nav.IdentifiedObjectHolder(this);

      this.nearJumps = {};
      this.getNearJumps = this.calculateNearJumps;
   },

   /**
    * @return string presentation of the object
    */
   toString: function()
   {
      return 'SolarSystem [' + this.name + ']';
   },

   /**
    * @returns the ID of the system
    */
   getId: function()
   {
      return this.id;
   },

   /**
    * Calculates the near jumps and modifies the object to return the result immediately the next time.
    */
   calculateNearJumps: function()
   {
      var allSystems = this.galaxy.solarSystems;
      var tempVec = vec3.create();

      for ( var systemId in allSystems.objects)
      {
         var other = allSystems.get(systemId);

         if ((other.security < 0.5) && (systemId !== this.id) && !this.nearJumps[systemId])
         {
            var dist = vec3.length(vec3.subtract(this.position, other.position, tempVec));
            var ly = dist / upro.nav.Constants.MeterUnitsInLightYears;

            if (ly <= upro.nav.Constants.MaxJumpDistanceLightYears)
            {
               this.nearJumps[systemId] = ly;
               if (this.security < 0.5)
               {
                  other.nearJumps[this.id] = ly;
               }
            }
         }
      }
      this.getNearJumps = this.returnNearJumps;

      return this.nearJumps;
   },

   /**
    * @returns map of system id to distance in light years
    */
   returnNearJumps: function()
   {
      return this.nearJumps;
   }
});

upro.nav.SolarSystem.create = function(id, name, x, y, z, security, regionId, constellationId)
{
   return new upro.nav.SolarSystem(id, name, x, y, z, security, regionId, constellationId);
};
