MemoryDataStoreModifyTesterTest = TestCase("MemoryDataStoreModifyTesterTest");

MemoryDataStoreModifyTesterTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.dataStore = new upro.data.MemoryDataStore();

   this.givenARegisteredFactory("parent", undefined);
   this.givenARegisteredFactory("info", undefined);
};

MemoryDataStoreModifyTesterTest.prototype.givenARegisteredFactory = function(type, factory)
{
   this.registerFactory(type, factory ? factory.bind(this) : undefined);
};

MemoryDataStoreModifyTesterTest.prototype.registerFactory = function(type, factory)
{
   upro.data.InfoTypeFactory.Instance.register(type, factory);
};

MemoryDataStoreModifyTesterTest.prototype.givenAnExistingEntry = function(infoId)
{
   Fixture.dataStore.createEntry(infoId);
};

MemoryDataStoreModifyTesterTest.prototype.givenATransaction = function()
{
   Fixture.transaction = Fixture.dataStore.createWriteTransaction();
};

MemoryDataStoreModifyTesterTest.prototype.whenCallingCreateInfo = function(parentId, infoId)
{
   Fixture.transaction.createInfo(parentId, infoId, {});
};

MemoryDataStoreModifyTesterTest.prototype.whenCallingUpdateInfo = function(infoId, properties)
{
   Fixture.transaction.updateInfo(infoId, properties);
};

MemoryDataStoreModifyTesterTest.prototype.whenCallingDeleteInfo = function(infoId)
{
   Fixture.transaction.deleteInfo(infoId);
};

MemoryDataStoreModifyTesterTest.prototype.whenCallingAddReference = function(infoId, parentId, owning)
{
   Fixture.transaction.addReference(infoId, parentId, owning);
};

MemoryDataStoreModifyTesterTest.prototype.whenCallingRemoveReference = function(infoId, parentId)
{
   Fixture.transaction.removeReference(infoId, parentId);
};

MemoryDataStoreModifyTesterTest.prototype.thenActionsAreOk = function(expected)
{
   var result = Fixture.dataStore.areActionsOk(Fixture.transaction.actions);

   assertTrue(result);
};

MemoryDataStoreModifyTesterTest.prototype.thenActionsAreNotOk = function()
{
   var result = Fixture.dataStore.areActionsOk(Fixture.transaction.actions);

   assertFalse(result);
};

MemoryDataStoreModifyTesterTest.prototype.testEmptyIsOk = function()
{
   this.givenATransaction();

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testCreateToUnknownParentIsNotOk = function()
{
   this.givenATransaction();

   this.whenCallingCreateInfo(new upro.data.InfoId("parent"), new upro.data.InfoId("info"));

   this.thenActionsAreNotOk();
};

MemoryDataStoreModifyTesterTest.prototype.testCreateToExistingIsOk = function()
{
   var parentId = new upro.data.InfoId("parent");

   this.givenATransaction();

   this.givenAnExistingEntry(parentId);
   this.whenCallingCreateInfo(parentId, new upro.data.InfoId("info"));

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testCreateDuplicateIsNotOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);

   this.thenActionsAreNotOk();
};

MemoryDataStoreModifyTesterTest.prototype.testTwoCreatesAreNotOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenATransaction();

   this.givenAnExistingEntry(parentId);
   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingCreateInfo(parentId, infoId);

   this.thenActionsAreNotOk();
};

MemoryDataStoreModifyTesterTest.prototype.testDeleteOfKnownIsOk = function()
{
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingDeleteInfo(infoId);

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testDeleteOfUnknownIsOk = function()
{
   var infoId = new upro.data.InfoId("info");

   this.givenATransaction();

   this.whenCallingDeleteInfo(infoId);

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testCreateDeleteCreateIsOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingDeleteInfo(infoId);
   this.whenCallingCreateInfo(parentId, infoId);

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testUpdateOfUnknownIsNotOk = function()
{
   var infoId = new upro.data.InfoId("info");

   this.givenATransaction();

   this.whenCallingUpdateInfo(infoId,
   {
      "test": false
   });

   this.thenActionsAreNotOk();
};

MemoryDataStoreModifyTesterTest.prototype.testUpdateOfExistingIsOk = function()
{
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingUpdateInfo(infoId,
   {
      "test": false
   });

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testUpdateOfCreatedIsOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingUpdateInfo(infoId,
   {
      "test": false
   });

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testAddReferenceOfUnknownIsNotOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingAddReference(infoId, parentId, false);

   this.thenActionsAreNotOk();
};

MemoryDataStoreModifyTesterTest.prototype.testAddReferenceToUnknownIsNotOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingAddReference(infoId, parentId, false);

   this.thenActionsAreNotOk();
};

MemoryDataStoreModifyTesterTest.prototype.testAddNewReferenceIsOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingAddReference(infoId, parentId, false);

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testRemoveReferenceOfUnknownIsOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingRemoveReference(infoId, parentId);

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testRemoveReferenceToUnknownIsOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingRemoveReference(infoId, parentId);

   this.thenActionsAreOk();
};

MemoryDataStoreModifyTesterTest.prototype.testRemoveUnknownReferenceIsOk = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingRemoveReference(infoId, parentId);

   this.thenActionsAreOk();
};
