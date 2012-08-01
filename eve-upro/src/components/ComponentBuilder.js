/**
 * A component builder provides meta information about the service the component provides and holds initialization
 * parameters for later construction.
 */
function ComponentBuilder()
{
   /**
    * @returns the unique name of the component
    */
   this.getServiceName = function()
   {
      throw new Error('Not implemented');

      return 'unnamed';
   };

   /**
    * @returns an array of component names this one is dependent on
    */
   this.getServiceDependencies = function()
   {
      return [];
   };

   /**
    * Called when an instance shall be created.
    * 
    * @param an object containing the dependent services
    * @returns a component instance
    */
   this.getInstance = function(services)
   {
      throw new Error('Not implemented');

      return null;
   };
}

module.exports = ComponentBuilder;
