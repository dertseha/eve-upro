TestPointerOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(id)
   {
      this.id = id;
   },

   onStart: function(position, buttonStates)
   {
      Fixture.calledStart[this.id].push(
      {
         "x": position.x,
         "y": position.y,
         "z": position.z
      });
   },

   onStop: function(position)
   {
      Fixture.calledStop[this.id].push(
      {
         "x": position.x,
         "y": position.y,
         "z": position.z
      });
   },

   onDown: function(position, buttonStates, changeMask)
   {
      Fixture.calledDown[this.id].push(
      {
         "x": position.x,
         "y": position.y,
         "z": position.z
      });
   },

   onUp: function(position, buttonStates, changeMask)
   {
      Fixture.calledUp[this.id].push(
      {
         "x": position.x,
         "y": position.y,
         "z": position.z
      });
   },

   onMove: function(position, buttonStates)
   {
      Fixture.calledMove[this.id].push(
      {
         "x": position.x,
         "y": position.y,
         "z": position.z
      });
   },

   onRotate: function(position, buttonStates, rotation)
   {
      Fixture.calledRotate[this.id].push(
      {
         "x": position.x,
         "y": position.y,
         "z": position.z
      });
   }

});

PointerOperationRegistryTest = TestCase("PointerOperationRegistryTest");

PointerOperationRegistryTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.buttonStates = [ false, false, false ];
   Fixture.position =
   {
      "x": 0,
      "y": 0,
      "z": 0
   };

   Fixture.calledStart = {};
   Fixture.calledStop = {};
   Fixture.calledUp = {};
   Fixture.calledDown = {};
   Fixture.calledMove = {};
   Fixture.calledRotate = {};
};

PointerOperationRegistryTest.prototype.givenAPointerOperationRegistry = function()
{
   Fixture.registry = new upro.sys.PointerOperationRegistry();
};

PointerOperationRegistryTest.prototype.whenRegisteringATestOperation = function(buttonStates, id)
{
   Fixture.calledStart[id] = [];
   Fixture.calledStop[id] = [];
   Fixture.calledUp[id] = [];
   Fixture.calledDown[id] = [];
   Fixture.calledMove[id] = [];
   Fixture.calledRotate[id] = [];

   Fixture.registry.registerOperation(buttonStates, new TestPointerOperation(id));
};

PointerOperationRegistryTest.prototype.whenMovingTo = function(x, y, z)
{
   Fixture.position.x = x || Fixture.position.x;
   Fixture.position.y = y || Fixture.position.y;
   Fixture.position.z = z || Fixture.position.z;
   Fixture.registry.onMove(Fixture.position, Fixture.buttonStates);
};

PointerOperationRegistryTest.prototype.whenRotating = function(x, y, z)
{
   Fixture.registry.onRotate(Fixture.position, Fixture.buttonStates, [ x, y, z ]);
};

PointerOperationRegistryTest.prototype.whenButtonIsDown = function(index)
{
   var change = [ false, false, false ];

   change[index] = true;
   Fixture.buttonStates[index] = true;
   Fixture.registry.onDown(Fixture.position, Fixture.buttonStates, change);
};

PointerOperationRegistryTest.prototype.whenButtonIsUp = function(index)
{
   var change = [ false, false, false ];

   change[index] = true;
   Fixture.buttonStates[index] = false;
   Fixture.registry.onUp(Fixture.position, Fixture.buttonStates, change);
};

PointerOperationRegistryTest.prototype.findPosition = function(array, position)
{
   var index = -1;

   for ( var i = 0; (index < 0) && (i < array.length); i++)
   {
      var entry = array[i];

      if ((entry.x == position.x) && (entry.y == position.y) && (entry.z == position.z))
      {
         index = i;
      }
   }

   return index;
};

PointerOperationRegistryTest.prototype.thenStartShouldHaveBeenCalledTimes = function(id, times)
{
   assertEquals(times, Fixture.calledStart[id].length);
};

PointerOperationRegistryTest.prototype.thenStartShouldHaveBeenCalledAt = function(id, position)
{
   var index = this.findPosition(Fixture.calledStart[id], position);

   assertTrue(index >= 0);
};

PointerOperationRegistryTest.prototype.thenStopShouldHaveBeenCalledTimes = function(id, times)
{
   assertEquals(times, Fixture.calledStop[id].length);
};

PointerOperationRegistryTest.prototype.thenStopShouldHaveBeenCalledAt = function(id, position)
{
   var index = this.findPosition(Fixture.calledStop[id], position);

   assertTrue(index >= 0);
};

PointerOperationRegistryTest.prototype.thenMoveShouldHaveBeenCalledTimes = function(id, times)
{
   assertEquals(times, Fixture.calledMove[id].length);
};

PointerOperationRegistryTest.prototype.thenMoveShouldHaveBeenCalledAt = function(id, position)
{
   var index = this.findPosition(Fixture.calledMove[id], position);

   assertTrue(index >= 0);
};

PointerOperationRegistryTest.prototype.thenUpShouldHaveBeenCalledTimes = function(id, times)
{
   assertEquals(times, Fixture.calledUp[id].length);
};

PointerOperationRegistryTest.prototype.thenUpShouldHaveBeenCalledAt = function(id, position)
{
   var index = this.findPosition(Fixture.calledUp[id], position);

   assertTrue(index >= 0);
};

PointerOperationRegistryTest.prototype.thenDownShouldHaveBeenCalledTimes = function(id, times)
{
   assertEquals(times, Fixture.calledDown[id].length);
};

PointerOperationRegistryTest.prototype.thenDownShouldHaveBeenCalledAt = function(id, position)
{
   var index = this.findPosition(Fixture.calledDown[id], position);

   assertTrue(index >= 0);
};

PointerOperationRegistryTest.prototype.thenRotateShouldHaveBeenCalledAt = function(id, position)
{
   var index = this.findPosition(Fixture.calledRotate[id], position);

   assertTrue(index >= 0);
};

PointerOperationRegistryTest.prototype.testRegisterDoesntResultInImmediateStart = function()
{
   var id = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ false, false, false ], id);

   this.thenStartShouldHaveBeenCalledTimes(id, 0);
};

PointerOperationRegistryTest.prototype.testStartOnFirstMove = function()
{
   var id = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ false, false, false ], id);
   this.whenMovingTo(100, 100);
   this.whenMovingTo(110, 110);

   this.thenStartShouldHaveBeenCalledTimes(id, 1);
};

PointerOperationRegistryTest.prototype.testMove = function()
{
   var id = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ false, false, false ], id);
   this.whenMovingTo(100, 100);
   this.whenMovingTo(110, 110);

   this.thenMoveShouldHaveBeenCalledTimes(id, 1);
};

PointerOperationRegistryTest.prototype.testNoMoveUntilStart = function()
{
   var id = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], id);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);

   this.thenMoveShouldHaveBeenCalledTimes(id, 0);
};

PointerOperationRegistryTest.prototype.testNoStartByOnlyButtonDown = function()
{
   var id = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], id);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);

   this.thenStartShouldHaveBeenCalledTimes(id, 0);
};

PointerOperationRegistryTest.prototype.testNoStartByOnlyButtonDownAndLittleMove = function()
{
   var id = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], id);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(100 + upro.sys.PointerOperationRegistry.MoveThreshold - 1, 100);

   this.thenStartShouldHaveBeenCalledTimes(id, 0);
};

PointerOperationRegistryTest.prototype.testStartAfterMoveThreshold = function()
{
   var id = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], id);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(100 + upro.sys.PointerOperationRegistry.MoveThreshold, 100);

   this.thenStartShouldHaveBeenCalledAt(id,
   {
      "x": 100,
      "y": 100,
      "z": 0
   });
};

PointerOperationRegistryTest.prototype.testButtonDownReceivedByOld = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenMovingTo(110, 110);
   this.whenButtonIsDown(0);

   this.thenDownShouldHaveBeenCalledTimes(idNoDown, 1);
};

PointerOperationRegistryTest.prototype.testButtonUpReceivedByOldIfNotChanged = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenMovingTo(110, 110);
   this.whenButtonIsDown(0);
   this.whenButtonIsUp(0);

   this.thenUpShouldHaveBeenCalledTimes(idNoDown, 1);
};

PointerOperationRegistryTest.prototype.testStopAfterUp = function()
{
   var idOld = 0;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idOld);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(110, 110);
   this.whenButtonIsUp(0);

   this.thenStopShouldHaveBeenCalledAt(idOld,
   {
      "x": 110,
      "y": 110,
      "z": 0
   });
};

PointerOperationRegistryTest.prototype.testStartReceivedByNextAfterMove = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(110, 110);

   this.thenStartShouldHaveBeenCalledAt(idLDown,
   {
      "x": 100,
      "y": 100,
      "z": 0
   });
};

PointerOperationRegistryTest.prototype.testStopReceivedByPrevAfterButtonUp = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(110, 110);
   this.whenButtonIsUp(0);

   this.thenStopShouldHaveBeenCalledAt(idLDown,
   {
      "x": 110,
      "y": 110,
      "z": 0
   });
};

PointerOperationRegistryTest.prototype.testButtonUpNotReceivedByOld = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(110, 110);
   this.whenButtonIsUp(0);

   this.thenUpShouldHaveBeenCalledTimes(idLDown, 0);
};

PointerOperationRegistryTest.prototype.testStartReceivedByNextAfterButtonUp = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(110, 110);
   this.whenButtonIsUp(0);

   this.thenStartShouldHaveBeenCalledAt(idNoDown,
   {
      "x": 110,
      "y": 110,
      "z": 0
   });
};

PointerOperationRegistryTest.prototype.testButtonUpNotReceivedByNew = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(110, 110);
   this.whenButtonIsUp(0);

   this.thenUpShouldHaveBeenCalledTimes(idNoDown, 0);
};

PointerOperationRegistryTest.prototype.testDivergingPositionIsNotAccumulated = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(50, 50);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenMovingTo(100 + upro.sys.PointerOperationRegistry.MoveThreshold - 1, 100);
   this.whenButtonIsUp(0);
   this.whenButtonIsDown(0);
   this.whenMovingTo(100 + (upro.sys.PointerOperationRegistry.MoveThreshold - 1) * 2, 100);

   this.thenStartShouldHaveBeenCalledTimes(idLDown, 0);
};

PointerOperationRegistryTest.prototype.testRotateStartsImmediately = function()
{
   var idNoDown = 0, idLDown = 1;

   this.givenAPointerOperationRegistry();

   this.whenRegisteringATestOperation([ true, false, false ], idLDown);
   this.whenRegisteringATestOperation([ false, false, false ], idNoDown);
   this.whenMovingTo(100, 100);
   this.whenButtonIsDown(0);
   this.whenRotating([ 0, 120, 0 ]);

   this.thenStartShouldHaveBeenCalledTimes(idLDown, 1);
};
