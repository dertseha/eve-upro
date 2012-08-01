/**
 * A scene render object is a scene object that can be added, displayed and picked
 * within a scene - i.e. something visible
 */
upro.scene.SceneRenderObject = Class.create(upro.scene.SceneObject,
{
   initialize: function($super)
   {
      $super();

      this.scene = null;
      this.mvMatrix = mat4.create();

      this.projectionTrackers = {};
      this.projectionHelperVec = vec3.create();
   },

   /**
    * Requests to add this to the given scene.
    * Inheritance typically creates some buffers in here
    * This method stores the provided reference and registers itself at the scene
    *
    * @param scene the scene to add to
    */
   addToScene: function(scene)
   {
      this.scene = scene;
      scene.addRenderObject(this);
   },

   /** {@inheritDoc} */
   setOrientationModified: function($super, value)
   {
      $super(value);
   },

   /**
    * Adds given projection tracker
    * @tracker A TrackedProjection instance
    */
   addProjectionTracker: function(tracker)
   {
      this.projectionTrackers[tracker.getId()] = tracker;
   },

   /**
    * Removes the projection tracker with given id
    * @param id the identification of the tracker to remove
    */
   removeProjectionTracker: function(id)
   {
      delete this.projectionTrackers[id];
   },

   /**
    * Rests all registered projection trackers.
    * @param doCallback whether the callback should be called
    */
   resetProjectionTrackers: function(doCallback)
   {
      var tracker;

      for (var id in this.projectionTrackers)
      {
         tracker = this.projectionTrackers[id];
         tracker.reset(doCallback);
      }
   },

   /**
    * Updates the projection tracks
    */
   updateProjectionTrackers: function()
   {
      var tracker = null;
      var isModified = this.isOrientationModified();

      for (var id in this.projectionTrackers)
      {
         tracker = this.projectionTrackers[id];

         if (isModified || !tracker.isProjectionConfirmed())
         {
            vec3.add(tracker.position, this.position, this.projectionHelperVec);
            // rotation - if necessary!

            tracker.setProjectedPosition(this.scene.project(this.projectionHelperVec));
         }
      }
   },

   /**
    * Requests to render this object.
    * @param timeDiffMSec the time since the last frame
    */
   render: function(timeDiffMSec)
   {

   },

   /**
    * Picks the or an information object at given view position
    * @param viewPosition to look at
    * @return a PickResult instance nearest to viewPosition or null
    */
   pick: function(viewPosition)
   {

   }

});
