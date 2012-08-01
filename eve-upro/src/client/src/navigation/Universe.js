/**
 * The universe contains... well, not everything per se, but at least the
 * galaxies of EVE. So far, that's typically New Eden and the Wormhole galaxy.
 *
 */
upro.nav.Universe = Class.create(
{
   initialize: function()
   {
      this.galaxies = new upro.nav.IdentifiedObjectHolder({ position: vec3.create(0.0, 0.0, 0.0) });
   }

});
