var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * ServiceControl is a dependency injection system for components with service characteristics (which need to be started
 * asynchronously). Components are registered directly or via their builders. Dependency problems as reported from the
 * builders are resolved during registration or start request (fail early).
 */
function ServiceControl()
{
   ServiceControl.super_.call(this);

   this.builders = {};

   this.services = {};
   this.components = {};

   /**
    * Registers a component builder. Its dependencies dicate when it will be created and started
    * 
    * @param builder the component builder to register
    * @throws Error on circular dependencies
    */
   this.setBuilder = function(builder)
   {
      var name = builder.getServiceName();

      this.builders[name] = builder;
      if (this.hasDependency(name, name))
      {
         delete this.builders[name];
         throw new Error('Circular dependency detected for ' + name);
      }
   };

   /**
    * Registers a (started) component. Initialization and/or dependency was handled outside the service control.
    * 
    * @param name name of the service
    * @param service the component
    */
   this.setService = function(name, service)
   {
      this.services[name] = service;
   };

   /**
    * @returns the service by given name or undefined if not started
    */
   this.getService = function(name)
   {
      return this.services[name];
   };

   /**
    * Requests to build and start the list of registered components per dependency chain. Will emit a 'started' event
    * when all is finished.
    * 
    * @throws Error when dependencies are missing
    */
   this.start = function()
   {
      this.checkDependenciesAndThrowIfMissing();
      this.buildAndStartSatisfiedComponents();
   };

   /**
    * Performs a hard reset of all the running components
    */
   this.tearDown = function()
   {
      for ( var name in this.services)
      {
         var service = this.services[name];

         service.tearDown();
      }
      this.services = {};
      this.components = {};
   };

   /**
    * Checks whether a component of name 'source' is dependent on another named 'target'
    * 
    * @param source the source component of which to check the dependencies
    * @param target the target dependency to look for
    * @returns true if a dependency exists
    */
   this.hasDependency = function(source, target)
   {
      var builder = this.builders[source];
      var rCode = false;

      if (builder)
      {
         var dependencies = builder.getServiceDependencies();
         var self = this;

         dependencies.forEach(function(dependency)
         {
            if ((dependency == target) || self.hasDependency(dependency, target))
            {
               rCode = true;
            }
         });
      }

      return rCode;
   };

   /**
    * Checks all registered builders whether their dependencies are registered.
    * 
    * @throws Error if dependencies are missing
    */
   this.checkDependenciesAndThrowIfMissing = function()
   {
      var self = this;
      var missing = [];

      for (name in this.builders)
      {
         var builder = this.builders[name];
         var dependencies = builder.getServiceDependencies();

         dependencies.forEach(function(dependency)
         {
            if (!self.services[dependency] && !self.builders[dependency])
            {
               missing.push(dependency);
            }
         });
      }
      if (missing.length > 0)
      {
         throw new Error('Dependencies not met, missing: ' + missing);
      }
   };

   /**
    * Iterates through the list of registered builders and tests if their dependencies are met and not having a
    * component built yet. When satisified, a component is created and started. Emits 'started' when there is nothing
    * more left to start
    */
   this.buildAndStartSatisfiedComponents = function()
   {
      var pending = 0;

      for (name in this.builders)
      {
         if (!this.components[name])
         { // not yet starting
            this.tryBuildAndStartComponent(name);
            pending++;
         }
         else if (!this.services[name])
         { // still starting
            pending++;
         }
      }

      if (pending == 0)
      {
         this.onStarted();
      }
   };

   /**
    * Tries to build and start the component with given name
    * 
    * @param name of the builder to query
    */
   this.tryBuildAndStartComponent = function(name)
   {
      var self = this;
      var builder = this.builders[name];
      var dependencies = builder.getServiceDependencies();
      var satisfied = true;
      var services = {};

      dependencies.forEach(function(dependency)
      {
         var service = self.services[dependency];

         if (service)
         {
            services[dependency] = service;
         }
         else
         {
            satisfied = false;
         }
      });

      if (satisfied)
      {
         var component = builder.getInstance(services);

         this.components[name] = component;

         component.on('started', function()
         {
            self.onComponentStarted(name, component);
         });
         component.start();
      }
   };

   /**
    * Callback for a started component
    * 
    * @param name the name of the started component
    * @param component the component itself
    */
   this.onComponentStarted = function(name, component)
   {
      if (this.components[name])
      {
         this.setService(name, component);
         this.buildAndStartSatisfiedComponents();
      }
      else
      { // control might have been torn down while this one was starting
         component.tearDown();
      }
   };

   /**
    * Started handler - emits 'started'
    */
   this.onStarted = function()
   {
      this.emit('started');
   };
}
util.inherits(ServiceControl, EventEmitter);

module.exports = ServiceControl;
