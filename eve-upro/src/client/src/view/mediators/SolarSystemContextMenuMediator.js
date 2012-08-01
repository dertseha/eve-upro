/**
 * Context menu mediator for solar systems. Expects the solar system as notification body at show()
 */
upro.view.mediators.SolarSystemContextMenuMediator = Class.create(upro.view.mediators.AbstractContextMenuMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SolarSystemContextMenuMediator.NAME, this.createVectorIcon.bind(this,
            upro.res.menu.IconData.SolarSystem));
   },

   onRegister: function()
   {
      var menu = this.getViewComponent();
      var mediator = this;

      { // routing
         var subMenu = menu.setSubMenu(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Routing),
               upro.res.text.Lang.format("routing.menuLabel"));

         this.commandActiveRouteAddCheckpoint = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.ActiveRouteAddCheckpoint);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.addCheckpoint"));
         subMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Checkpoint),
               this.commandActiveRouteAddCheckpoint);

         this.commandActiveRouteAddWaypoint = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.ActiveRouteAddWaypoint);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.addWaypoint"));
         subMenu.setCommand(5, this.createVectorIcon.bind(this, upro.res.menu.IconData.Waypoint),
               this.commandActiveRouteAddWaypoint);

         this.commandActiveRouteRemoveEntry = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.ActiveRouteRemoveEntry);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.remove"));
         subMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Delete),
               this.commandActiveRouteRemoveEntry);

         this.commandActiveRouteIgnoreSystem = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.UserIgnoredSolarSystemIgnoreToggle);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.toggleIgnore"));
         subMenu.setCommand(4, this.createVectorIcon.bind(this, upro.res.menu.IconData.Denied),
               this.commandActiveRouteIgnoreSystem);
      }
      { // jump corridor control
         var corridorMenu = menu.setSubMenu(5, this.createVectorIcon.bind(this, upro.res.menu.IconData.JumpCorridor),
               upro.res.text.Lang.format("corridor.menuLabel"));

         this.commandCorridorExit = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.NewCorridorSetExit);
            mediator.cancel();
         }, upro.res.text.Lang.format("corridor.exit"));
         corridorMenu.setCommand(4, this.createVectorIcon.bind(this, upro.res.menu.IconData.WormholeOut),
               this.commandCorridorExit);

         this.commandCorridorPrepWormhole = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.NewCorridorPrepareWormhole);
            mediator.cancel();
         }, upro.res.text.Lang.format("corridor.entry.wormhole"));
         corridorMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Wormhole),
               this.commandCorridorPrepWormhole);
         this.commandCorridorPrepJumpBridge = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.NewCorridorPrepareJumpBridge);
            mediator.cancel();
         }, upro.res.text.Lang.format("corridor.entry.jumpBridge"));
         corridorMenu.setCommand(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.Bridge),
               this.commandCorridorPrepJumpBridge);

      }
   },

   /** {@inheritDoc} */
   updateCommands: function()
   {
      this.updateCommandActiveRoute();
      this.updateCommandIgnored();
      this.updateCommandCorridor();
   },

   /**
    * Updates the commands for the active route
    */
   updateCommandActiveRoute: function()
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = this.getNotifyBody();

      this.commandActiveRouteAddCheckpoint.setPossible(solarSystem
            && activeRouteProxy.canEntryBeAdded(solarSystem, upro.nav.SystemRouteEntry.EntryType.Checkpoint));
      this.commandActiveRouteAddWaypoint.setPossible(solarSystem
            && activeRouteProxy.canEntryBeAdded(solarSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint));
      this.commandActiveRouteRemoveEntry.setPossible(solarSystem
            && activeRouteProxy.containsSolarSystemAsEntry(solarSystem));
   },

   updateCommandIgnored: function(list)
   {
      var solarSystem = this.getNotifyBody();

      if (!list)
      {
         var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

         list = settingsProxy.getIgnoredSolarSystemIds();
      }
      this.commandActiveRouteIgnoreSystem.setActive(solarSystem && (list.indexOf(solarSystem.id) >= 0));
   },

   updateCommandCorridor: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME);
      var solarSystem = this.getNotifyBody();
      var prepJumpType = sessionProxy.getCorridorPreparationJumpType();
      var isSystemNullSec = solarSystem
            && (solarSystem.galaxy.id == upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN)
            && (solarSystem.security == 0.0);
      var isCorridorPossible = false;

      if (prepJumpType == upro.nav.JumpType.DynamicWormhole)
      { // wormholes are possible always and anywhere
         isCorridorPossible = true;
      }
      else if (prepJumpType == upro.nav.JumpType.JumpBridge)
      { // jump bridges are only possible in NewEdens null sec and within 5ly
         // TODO: fetch other, get distance
         isCorridorPossible = isSystemNullSec; // && distance <= 5ly
      }

      this.commandCorridorExit.setPossible(isCorridorPossible);

      this.commandCorridorPrepJumpBridge.setPossible(isSystemNullSec);
   },

   /**
    * Notification handler
    */
   onNotifyActiveRoutePathChanged: function()
   {
      this.updateCommandActiveRoute();
   },

   onNotifyUserIgnoredSolarSystemsChanged: function(list)
   {
      this.updateCommandIgnored(list);
   }

});

upro.view.mediators.SolarSystemContextMenuMediator.NAME = "SolarSystemContextMenu";
