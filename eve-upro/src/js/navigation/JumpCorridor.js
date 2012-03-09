/**
 * A Jump corridor is a general pair of two jump portals; It could be for
 * jump gates, (static) worm holes and jump bridges.
 */
upro.nav.JumpCorridor = Class.create(
{
   initialize: function(galaxy1, systemId1, galaxy2, systemId2, jumpType)
   {
      var local = this;

      this.jumpType = jumpType;

      this.galaxy1 = galaxy1;
      this.systemId1 = systemId1;
      this.system1 = null;
      this.portal1 = null;

      this.galaxy2 = galaxy2;
      this.systemId2 = systemId2;
      this.system2 = null;
      this.portal2 = null;

      if ((galaxy1.id < galaxy2.id) || ((galaxy1.id === galaxy2.id) && (systemId1 < systemId2)))
      {
         this.id = this.createId(galaxy1, systemId1, galaxy2, systemId2);
      }
      else
      {
         this.id = this.createId(galaxy2, systemId2, galaxy1, systemId1);
      }

      this.waiter1 = function(solarSystem) { local.onSystem1Added(solarSystem); };
      this.galaxy1.solarSystems.waitFor(this.systemId1, this.waiter1);
      this.waiter2 = function(solarSystem) { local.onSystem2Added(solarSystem); };
      this.galaxy2.solarSystems.waitFor(this.systemId2, this.waiter2);
   },

   toString: function()
   {
      return 'JumpCorridor [' + this.id + ']';
   },

   /**
    * Returns the jump type
    * @return the jump type
    */
   getJumpType: function()
   {
      return this.jumpType;
   },

   createId: function(galaxy1, systemId1, galaxy2, systemId2)
   {
      return "" + galaxy1.id + "." + systemId1 + "-" + galaxy2.id + "." + systemId2;
   },

   dispose: function()
   {
      this.galaxy1.solarSystems.stopWaitingFor(this.systemId1, this.waiter1);
      if (this.system1 != null)
      {
         this.system1.jumpPortals.remove(this.portal1.id);
      }
      this.galaxy2.solarSystems.stopWaitingFor(this.systemId2, this.waiter2);
      if (this.system2 != null)
      {
         this.system2.jumpPortals.remove(this.portal2.id);
      }
   },

   onSystem1Added: function(solarSystem)
   {
      this.system1 = solarSystem;
      this.checkPassage();
   },

   onSystem2Added: function(solarSystem)
   {
      this.system2 = solarSystem;
      this.checkPassage();
   },

   checkPassage: function()
   {
      if ((this.system1 != null) && (this.system2 != null))
      {
         this.portal1 = this.addPortal(this.system1, this.system2);
         this.portal2 = this.addPortal(this.system2, this.system1);
      }
   },

   addPortal: function(sourceSystem, destSystem)
   {
      var portal = this.createPortal(destSystem);

      sourceSystem.jumpPortals.add(portal);

      return portal;
   },

   createPortal: function(destSystem)
   {
      return new upro.nav.JumpPortal(this, destSystem);
   }
});
