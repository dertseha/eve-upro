
upro.view.mediators.SceneMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SceneMediator.NAME, null);

      this.galaxies = {};
      this.visibleGalaxyId = null;
   },

   onRegister: function()
   {
      var context = new upro.sys.ResizableContextWindow("scene");
      var sceneSystem = new upro.scene.SceneSystem(context);

      this.basicShader = sceneSystem.loadShaderProgram(upro.scene.ShaderProgram,
         [ $('basic-vertex-shader'), $('basic-fragment-shader') ]);
      this.systemShader = sceneSystem.loadShaderProgram(upro.scene.ShaderProgram,
         [ $('system-vertex-shader'), $('system-fragment-shader') ]);

      this.setViewComponent(sceneSystem);
   },

   resetCamera: function()
   {
      var sceneSystem = this.getViewComponent();

      // start with a top down view
      vec3.set([0, 0, 0], sceneSystem.camera.position);
      vec3.set([Math.PI / -2, 0, 0], sceneSystem.camera.rotation);
   },

   createGalaxies: function()
   {
      this.resetCamera();

      this.createGalaxy(upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN);
      this.createGalaxy(upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE);

      this.registerPointerOperations();
   },

   createGalaxy: function(galaxyId)
   {
      var sceneSystem = this.getViewComponent();
      var galaxyRender = new upro.scene.GalaxyRenderObject(this.basicShader, this.systemShader);
      var galaxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME).getGalaxy(galaxyId);

      this.galaxies[galaxyId] = galaxyRender;
      vec3.set([0, -20, 0], galaxyRender.position);
      for (var systemId in galaxy.solarSystems.objects)
      {
         var solarSystem = galaxy.solarSystems.get(systemId);

         galaxyRender.addSolarSystem(solarSystem);
      }
      for (var i = 0; i < galaxy.jumpCorridors.length; i++)
      {
         var jumpCorridor = galaxy.jumpCorridors[i];

         galaxyRender.addJumpCorridor(jumpCorridor);
      }
      galaxyRender.addToScene(sceneSystem);
   },

   pick: function(realPos)
   {
      var result = null;

      if (this.visibleGalaxyId)
      {
         var galaxyRender = this.galaxies[this.visibleGalaxyId];

         result = galaxyRender.pick(realPos);
      }

      return result;
   },

   projectSolarSystem: function(solarSystem)
   {
      var result = null;

      if (this.visibleGalaxyId == solarSystem.galaxy.id)
      {
         var galaxyRender = this.galaxies[this.visibleGalaxyId];

         result = galaxyRender.projectSolarSystem(solarSystem, vec3.create());
      }

      return result;
   },

   addRouteEdge: function(system1, system2, valid)
   {
      this.addRouteEdgeBySystem1(system1, system2, valid);
      if (system1.galaxy.id != system2.galaxy.id)
      {
         this.addRouteEdgeBySystem1(system2, system1, valid);
      }
   },

   addRouteEdgeBySystem1: function(system1, system2, valid)
   {
      var galaxyRender = this.galaxies[system1.galaxy.id];

      galaxyRender.addRouteEdge(system1, system2, valid);
   },

   clearRoute: function()
   {
      for (var id in this.galaxies)
      {
         var galaxyRender = this.galaxies[id];

         galaxyRender.clearRoute();
      }
   },

   /**
    * Adds a TrackedProjection for given solar system
    * @param key to register the tracker for
    * @param solarSystem for which solar system it should be registered
    * @param callback to call for changes in projection
    */
   addSolarSystemTrack: function(key, solarSystem, callback)
   {
      var galaxyRender = this.galaxies[solarSystem.galaxy.id];
      var temp = vec3.create();

      vec3.subtract(solarSystem.position, solarSystem.galaxy.position, temp);
      vec3.scale(temp, 1 / solarSystem.galaxy.scale);

      galaxyRender.addProjectionTracker(new upro.scene.TrackedProjection(key, temp, callback));
   },

   /**
    * Removes a tracked projection
    * @param key that was used for addSolarSystemTrack
    * @param solarSystem that was used for addSolarSystemTrack
    */
   removeSolarSystemTrack: function(key, solarSystem)
   {
      var galaxyRender = this.galaxies[solarSystem.galaxy.id];

      galaxyRender.removeProjectionTracker(key);
   },

   /**
    * Registers the pointer operations this mediator handles
    */
   registerPointerOperations: function()
   {
      var registry = this.facade().retrieveMediator(upro.view.mediators.DocumentMouseMediator.NAME).getViewComponent();
      var sceneSystem = this.getViewComponent();

      {
         var rotOp = new upro.view.SceneObjectRotationOperation(sceneSystem, sceneSystem.camera);

         registry.registerOperation([true, false, false], rotOp);
      }
      {
         var moveOp = new upro.view.OrientedMoveOperation(sceneSystem, sceneSystem.getCameraRotationBuffer(),
            this.onMove.bind(this));

         registry.registerOperation([false, true, false], moveOp);
      }
      {
         var idleOp = new upro.view.IdlePointerOperation(this);

         registry.registerOperation([false, false, false], idleOp);
      }
   },

   onIdlePrimaryClick: function(realPos)
   {
      this.facade().sendNotification(upro.app.Notifications.ScenePointerActivation, realPos);
   },

   onIdleTertiaryClick: function()
   {
      var nextId = this.visibleGalaxyId ? this.visibleGalaxyId : 0;
      var lowestId = null;
      var nextHigherId = null;

      for (var galaxyId in this.galaxies)
      {
         if ((lowestId == null) || (lowestId > galaxyId))
         {
            lowestId = galaxyId;
         }
         if ((galaxyId > nextId) && ((nextHigherId == null) || (nextHigherId > galaxyId)))
         {
            nextHigherId = galaxyId;
         }
      }
      nextId = nextHigherId ? nextHigherId : lowestId;
      this.facade().sendNotification(upro.app.Notifications.SetActiveGalaxy, nextId);
   },

   onHover: function(realPos)
   {
      var sceneSystem = this.getViewComponent();
      var result = sceneSystem.pickAt(realPos);

      if (result)
      {
         this.facade().sendNotification(upro.app.Notifications.SetHighlightedObject, result.getRefObject());
      }
      else
      {
         this.facade().sendNotification(upro.app.Notifications.SetHighlightedObject, null);
      }
   },

   stopHover: function()
   {
      this.facade().sendNotification(upro.app.Notifications.SetHighlightedObject, null);
   },

   onMove: function(vec)
   {
      if (this.visibleGalaxyId)
      {
         var galaxyRender = this.galaxies[this.visibleGalaxyId];
         // scale the movement according to distance to center - faster if farther out
         var scale = vec3.length(galaxyRender.position) / 1.5;

         if (scale < 5)
         {
            scale = 5;
         }
         var translation = vec3.scale(vec, scale, vec3.create());
         vec3.add(galaxyRender.position, translation);

         var distance = vec3.length(galaxyRender.position);

         if (galaxyRender.position[1] > 2)
         {
            galaxyRender.position[1] = 2;
         }
         if (galaxyRender.position[1] < -20)
         {
            galaxyRender.position[1] = -20;
         }

         if (distance > 30)
         {
            vec3.normalize(galaxyRender.position);
            vec3.scale(galaxyRender.position, 30);
         }
         galaxyRender.setOrientationModified(true);
      }
   },

   onNotifyActiveGalaxyChanged: function(galaxyId)
   {
      var galaxyRender = this.galaxies[galaxyId];

      if ((this.visibleGalaxyId != null) && (this.visibleGalaxyId != galaxyId))
      {
         var oldRender = this.galaxies[this.visibleGalaxyId];

         oldRender.setVisible(false);
         this.visibleGalaxyId = null;
      }
      if (galaxyRender)
      {
         this.visibleGalaxyId = galaxyId;
         galaxyRender.setVisible(true);
      }
   }

});

upro.view.mediators.SceneMediator.NAME = "Scene";
