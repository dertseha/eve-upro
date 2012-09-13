/**
 * This mediator handles the display of jump corridors on the map
 */
upro.view.mediators.JumpCorridorSceneMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.JumpCorridorSceneMediator.NAME, null);

   },

   onRegister: function()
   {
      this.updateJumpCorridors();
   },

   updateJumpCorridors: function()
   {
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);

      sceneMediator.clearRoute('JumpCorridors');
      jumpCorridorProxy.forEachInfo(function(info)
      {
         var color = [ 0.0, 1.0, 0.0, 1.5 ];

         if (info.getJumpType() == upro.nav.JumpType.StaticWormhole)
         {
            color = [ 0.0, 1.0, 1.0, 1.0 ];
         }
         else if (info.getJumpType() == upro.nav.JumpType.DynamicWormhole)
         {
            color = [ 1.0, 0.5, 0.0, 1.5 ];
         }

         sceneMediator.addRouteEdge('JumpCorridors', info.getEntrySolarSystem(), info.getExitSolarSystem(), color);
      });

   },

   onNotifyJumpCorridorListChanged: function()
   {
      this.updateJumpCorridors();
   }

});

upro.view.mediators.JumpCorridorSceneMediator.NAME = "JumpCorridorScene";
