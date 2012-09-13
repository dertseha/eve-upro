/**
 * A jump portal is an entry to a jump corridor, with given system on the other end
 */
upro.nav.JumpPortal = Class.create(
{
   initialize: function(corridor, system)
   {
      this.corridor = corridor;
      this.system = system;

      this.id = corridor.id;
      this.name = system.name;
   },

   /**
    * Returns the JumpCorridor this instance is bound to
    * 
    * @return the JumpCorridor this instance is bound to
    */
   getJumpCorridor: function()
   {
      return this.corridor;
   },

   toString: function()
   {
      return 'JumpPortal [' + this.name + '] (' + this.corridor.jumpType + ')';
   }

});
