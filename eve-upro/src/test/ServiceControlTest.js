var ServiceControl = require('../components/ServiceControl.js');
var Component = require('../components/Component.js');
var ComponentBuilder = require('../components/ComponentBuilder.js');

function Fixture()
{
   this.control = new ServiceControl();

   this.components = {};
   this.builders = {};
   this.componentsStarted = 0;

   this.givenAComponentExpectingToBeStarted = function(test, name, expectedPosition, endsTest)
   {
      var component = new Component();
      var self = this;

      component.start = function()
      {
         test.equal(self.componentsStarted, expectedPosition, 'Component started out of order: ' + name + ' at '
               + self.componentsStarted);

         self.componentsStarted++;
         process.nextTick(function()
         {
            component.onStarted();
         });

         if (endsTest)
         {
            test.done();
         }
      };
      this.components[name] = component;
   };

   this.givenAComponentWaitingToCompleteStart = function(test, name)
   {
      var component = new Component();
      var self = this;

      component.start = function()
      {
         self.componentsStarted++;
      };
      this.components[name] = component;
   };

   this.whenComponentEmitsStarted = function(name)
   {
      this.components[name].emit('started');
   };

   this.createBuilder = function(name, dependencies)
   {
      var builder = new ComponentBuilder();
      var fixture = this;

      builder.getServiceName = function()
      {
         return name;
      };
      builder.getInstance = function(services)
      {
         return fixture.components[name];
      };
      if (dependencies)
      {
         builder.getServiceDependencies = function()
         {
            return dependencies;
         };
      }

      return builder;
   };

   this.givenARegisteredBuilder = function(name, dependencies)
   {
      var builder = this.createBuilder(name, dependencies);

      this.builders[name] = builder;
      this.control.setBuilder(builder);
   };

   this.thenRegisteringBuilderThrowsError = function(test, name, dependencies)
   {
      var builder = this.createBuilder(name, dependencies);
      var fixture = this;

      test.throws(function()
      {
         fixture.control.setBuilder(builder);
      });
   };

   this.expectingControlToBecomeStarted = function(test)
   {
      this.control.on('started', function()
      {
         test.done();
      });
   };

   this.expectingControlNotToBecomeStarted = function(test)
   {
      this.control.on('started', function()
      {
         test.ok(false);
         test.done();
      });
   };

   this.expectingControlToEmitError = function(test)
   {
      this.control.on('error', function()
      {
         test.done();
      });
   };

   this.whenStartingControl = function()
   {
      this.control.start();
   };

   this.thenStartingControlThrowsError = function(test)
   {
      var fixture = this;

      test.throws(function()
      {
         fixture.control.start();
      });
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

exports.testServiceControlEmitsStarted_WhenCompleted = function(test)
{
   this.fixture.expectingControlToBecomeStarted(test);

   this.fixture.whenStartingControl();
};

exports.testServiceControlBuildsAndStartsComponents_WhenStarting = function(test)
{
   var componentName = 'comp1';

   this.fixture.givenAComponentExpectingToBeStarted(test, componentName, 0);
   this.fixture.givenARegisteredBuilder(componentName);

   this.fixture.expectingControlToBecomeStarted(test);

   test.expect(1);
   this.fixture.whenStartingControl();
};

exports.testServiceControlIsNotStarted_WhenOneOfParallelIsStillPending = function(test)
{
   var componentName1 = 'comp1';
   var componentName2 = 'comp2';

   this.fixture.givenAComponentWaitingToCompleteStart(test, componentName1);
   this.fixture.givenAComponentExpectingToBeStarted(test, componentName2, 1, true);
   this.fixture.givenARegisteredBuilder(componentName1);
   this.fixture.givenARegisteredBuilder(componentName2);

   this.fixture.expectingControlNotToBecomeStarted(test);

   test.expect(1);
   this.fixture.whenStartingControl();
};

exports.testServiceControlBecomesStarted_WhenStartingInParallel = function(test)
{
   var componentName1 = 'comp1';
   var componentName2 = 'comp2';

   this.fixture.givenAComponentExpectingToBeStarted(test, componentName1, 0);
   this.fixture.givenAComponentExpectingToBeStarted(test, componentName2, 1);
   this.fixture.givenARegisteredBuilder(componentName1);
   this.fixture.givenARegisteredBuilder(componentName2);

   this.fixture.expectingControlToBecomeStarted(test);

   test.expect(2);
   this.fixture.whenStartingControl();
};

exports.testServiceControlBuildsAndStartsComponentsPerDependency_WhenStarting = function(test)
{
   var componentName1 = 'comp1';
   var componentName2 = 'comp2';

   this.fixture.givenAComponentExpectingToBeStarted(test, componentName1, 0);
   this.fixture.givenAComponentExpectingToBeStarted(test, componentName2, 1);
   this.fixture.givenARegisteredBuilder(componentName1);
   this.fixture.givenARegisteredBuilder(componentName2, [ componentName1 ]);

   this.fixture.expectingControlToBecomeStarted(test);

   test.expect(2);
   this.fixture.whenStartingControl();
};

exports.testServiceControlThrowsError_WhenMissingDependency = function(test)
{
   var componentName = 'comp1';

   this.fixture.givenAComponentExpectingToBeStarted(test, componentName, 0);
   this.fixture.givenARegisteredBuilder(componentName, [ 'unknownComponent' ]);

   this.fixture.expectingControlToEmitError(test);

   test.expect(1);
   this.fixture.thenStartingControlThrowsError(test);
   test.done();
};

exports.testServiceControlThrowsError_WhenCircularDependencySelf = function(test)
{
   var componentName1 = 'comp1';

   test.expect(1);
   this.fixture.thenRegisteringBuilderThrowsError(test, componentName1, [ componentName1 ]);
   test.done();
};

exports.testServiceControlThrowsError_WhenCircularDependencySecond = function(test)
{
   var componentName1 = 'comp1';
   var componentName2 = 'comp2';

   this.fixture.givenARegisteredBuilder(componentName1, [ componentName2 ]);

   test.expect(1);
   this.fixture.thenRegisteringBuilderThrowsError(test, componentName2, [ componentName1 ]);
   test.done();
};

exports.testServiceControlThrowsError_WhenCircularDependencyThird = function(test)
{
   var componentName1 = 'comp1';
   var componentName2 = 'comp2';
   var componentName3 = 'comp3';

   this.fixture.givenARegisteredBuilder(componentName1, [ componentName3 ]);
   this.fixture.givenARegisteredBuilder(componentName2, [ componentName1 ]);

   test.expect(1);
   this.fixture.thenRegisteringBuilderThrowsError(test, componentName3, [ componentName2 ]);
   test.done();
};

// So far I don't see a proper reason to let this work.
// exports.testServiceControlBecomesStarted_WhenServicesNotDependetOnAreStillStarting = function(test)
// {
// var componentName1 = 'comp1';
// var componentName2 = 'comp2';
// var componentName3 = 'comp3';
//
// this.fixture.givenAComponentExpectingToBeStarted(test, componentName1, 0);
// this.fixture.givenAComponentWaitingToCompleteStart(test, componentName2);
// this.fixture.givenAComponentWaitingToCompleteStart(test, componentName3);
// this.fixture.givenARegisteredBuilder(componentName1);
// this.fixture.givenARegisteredBuilder(componentName2, [ componentName1 ]);
// this.fixture.givenARegisteredBuilder(componentName3, [ componentName1 ]);
//
// this.fixture.expectingControlToBecomeStarted(test);
//
// test.expect(1);
// this.fixture.whenStartingControl();
// };
