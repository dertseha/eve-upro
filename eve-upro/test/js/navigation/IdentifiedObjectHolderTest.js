IdentifiedObjectHolderTest = TestCase("IdentifiedObjectHolderTest");

IdentifiedObjectHolderTest.prototype.givenAnObject = function(id, name)
{
   var object =
   {
      id: id,
      name: name
   };

   Fixture.holder.add(object);
};

IdentifiedObjectHolderTest.prototype.whenAddingAnObject = function(id, name)
{
   var object =
   {
      id: id,
      name: name
   };

   Fixture.holder.add(object);
};

IdentifiedObjectHolderTest.prototype.whenRemovingAnObject = function(id)
{
   Fixture.holder.remove(id);
};

IdentifiedObjectHolderTest.prototype.givenAListenerCallback = function()
{
   Fixture.listener =
   {
      onAdded: function(object)
      {
         Fixture.onAddedCalled++;
      },
      onRemoved: function(object)
      {
         Fixture.onRemovedCalled++;
      }
   };
   Fixture.onAddedCalled = 0;
   Fixture.onRemovedCalled = 0;
   Fixture.holder.register(Fixture.listener);
};

IdentifiedObjectHolderTest.prototype.whenAddingAWaitForCallback = function(id)
{
   Fixture.waitForCallback = function(object)
   {
      Fixture.onAddedCalled++;
   };
   Fixture.onAddedCalled = 0;
   Fixture.holder.waitFor(id, Fixture.waitForCallback);
};

IdentifiedObjectHolderTest.prototype.whenRemovingTheListenerCallback = function()
{
   Fixture.holder.unregister(Fixture.listener);
};

IdentifiedObjectHolderTest.prototype.thenGetObjectShouldReturnAnObject = function(id)
{
   var object = Fixture.holder.get(id);

   assertNotUndefined(object);
};

IdentifiedObjectHolderTest.prototype.thenGetObjectShouldNotReturnAnObject = function(id)
{
   var object = Fixture.holder.get(id);

   assertUndefined(object);
};

IdentifiedObjectHolderTest.prototype.thenFindObjectsShouldReturn = function(namePart, expectedAmount)
{
   var result = Fixture.holder.find(namePart);

   assertEquals(expectedAmount, result.length);
};

IdentifiedObjectHolderTest.prototype.thenTheAddedCallbackShouldHaveBeenCalled = function(times)
{
   assertEquals(times, Fixture.onAddedCalled);
};

IdentifiedObjectHolderTest.prototype.thenTheRemovedCallbackShouldHaveBeenCalled = function(times)
{
   assertEquals(times, Fixture.onRemovedCalled);
};

IdentifiedObjectHolderTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.holder = new upro.nav.IdentifiedObjectHolder(
   {
      position: vec3.create(0.0, 0.0, 0.0),
      toString: function()
      {
         return "Test";
      }
   });
};

IdentifiedObjectHolderTest.prototype.testToString = function()
{
   var result = Fixture.holder.toString();

   assertEquals("ObjectHolder for Test", result);
};

IdentifiedObjectHolderTest.prototype.testAddObject = function()
{
   this.givenAnObject(1, "Test");

   this.thenGetObjectShouldReturnAnObject(1);
};

IdentifiedObjectHolderTest.prototype.testFindObjects = function()
{
   this.givenAnObject(1, "Test1");
   this.givenAnObject(2, "Test2");
   this.givenAnObject(3, "NotMe");

   this.thenFindObjectsShouldReturn("eSt", 2);
};

IdentifiedObjectHolderTest.prototype.testRemoveObject = function()
{
   this.givenAnObject(1, "Test1");

   this.whenRemovingAnObject(1);

   this.thenGetObjectShouldNotReturnAnObject(1);
};

IdentifiedObjectHolderTest.prototype.testListenerCallbackForAdd = function()
{
   this.givenAListenerCallback();

   this.whenAddingAnObject();

   this.thenTheAddedCallbackShouldHaveBeenCalled(1);
};

IdentifiedObjectHolderTest.prototype.testListenerCallbackForRemove = function()
{
   this.givenAListenerCallback();

   this.whenAddingAnObject(1);
   this.whenRemovingAnObject(1);

   this.thenTheRemovedCallbackShouldHaveBeenCalled(1);
};

IdentifiedObjectHolderTest.prototype.testRemoveListenerCallback = function()
{
   this.givenAListenerCallback();

   this.whenRemovingTheListenerCallback();
   this.whenAddingAnObject(1);

   this.thenTheAddedCallbackShouldHaveBeenCalled(0);
};

IdentifiedObjectHolderTest.prototype.testWaitForAfterAdd = function()
{

   this.whenAddingAnObject(1);
   this.whenAddingAWaitForCallback(1);

   this.thenTheAddedCallbackShouldHaveBeenCalled(1);
};

IdentifiedObjectHolderTest.prototype.testWaitForBeforeAdd = function()
{

   this.whenAddingAWaitForCallback(1);
   this.whenAddingAnObject(1);

   this.thenTheAddedCallbackShouldHaveBeenCalled(1);
};
