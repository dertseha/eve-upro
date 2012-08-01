/**
 * A path finder waypoint is a system that was reached by some
 * means of transporation and a certain amount of cost from
 * a previous waypoint. The type of the jump is also noted.
 */
upro.nav.finder.PathFinderWaypoint = Class.create(
{
   initialize: function(finder, system, previousWaypoint, cost, jumpType)
   {
      this.system = system;
      this.previousWaypoint = previousWaypoint;
      this.totalCost = cost;
      this.jumpType = jumpType;
   },

   /**
    * Returns true if the waypoint is uni-directional (can not be travelled back)
    * @return true if the waypoint is uni-directional
    */
   isUnidirectional: function()
   {
      return this.jumpType == upro.nav.JumpType.JumpDrive; // or clone, ...
   },

   /**
    * Returns the path to this waypoint as text
    * @return the path to this waypoint as text form representing a pseudo array (no quotes)
    */
   getPathInNames: function()
   {
      var text = "[";
      var pathList = [];
      var temp = this.previousWaypoint;

      pathList.push(this.system.name);
      while (temp != null)
      {
         pathList.push(temp.system.name + ", ");
         temp = temp.previousWaypoint;
      }
      pathList.reverse();
      for (var i = 0; i < pathList.length; i++)
      {
         text += pathList[i];
      }
      text += "]";

      return text;
   }
});
