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
   },

   toString: function()
   {
      return 'SolarSystem [' + this.name + ']';
   }
});

upro.nav.SolarSystem.create = function(id, name, x, y, z, security, regionId, constellationId)
{
   return new upro.nav.SolarSystem(id, name, x, y, z, security, regionId, constellationId);
};
