MemoryDataStoreModifyExecutorTest = TestCase("MemoryDataStoreModifyExecutorTest");

MemoryDataStoreModifyExecutorTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.infoMap = {};

   Fixture.dataStore = new upro.data.MemoryDataStore();
   Fixture.dataStore.deferProcessPendingActions = function()
   {
      this.processPendingActions();
   };

   this.givenARegisteredFactory("parent", undefined);
   this.givenARegisteredFactory("info", undefined);
};

MemoryDataStoreModifyExecutorTest.prototype.standardFactory = function(infoId)
{
   var info = new TestInfo(infoId);

   Fixture.infoMap[infoId.toString()] = info;
   info.onDeleted = function()
   {
      delete Fixture.infoMap[infoId.toString()];
   };

   return info;
};

MemoryDataStoreModifyExecutorTest.prototype.givenARegisteredFactory = function(type, factory)
{
   this.registerFactory(type, factory ? factory.bind(this) : undefined);
};

MemoryDataStoreModifyExecutorTest.prototype.registerFactory = function(type, factory)
{
   upro.data.InfoTypeFactory.Instance.register(type, factory);
};

MemoryDataStoreModifyExecutorTest.prototype.givenAnExistingEntry = function(infoId)
{
   Fixture.dataStore.createEntry(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.givenATransaction = function()
{
   Fixture.transaction = Fixture.dataStore.createWriteTransaction();
};

MemoryDataStoreModifyExecutorTest.prototype.whenCallingCreateInfo = function(parentId, infoId)
{
   Fixture.transaction.createInfo(parentId, infoId, {});
};

MemoryDataStoreModifyExecutorTest.prototype.whenCallingUpdateInfo = function(infoId, properties)
{
   Fixture.transaction.updateInfo(infoId, properties);
};

MemoryDataStoreModifyExecutorTest.prototype.whenCallingDeleteInfo = function(infoId)
{
   Fixture.transaction.deleteInfo(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.whenCallingAddReference = function(infoId, parentId, owning)
{
   Fixture.transaction.addReference(infoId, parentId, owning);
};

MemoryDataStoreModifyExecutorTest.prototype.whenCallingRemoveReference = function(infoId, parentId)
{
   Fixture.transaction.removeReference(infoId, parentId);
};

MemoryDataStoreModifyExecutorTest.prototype.whenCallingCommit = function()
{
   Fixture.transaction.commit();
};

MemoryDataStoreModifyExecutorTest.prototype.thenEntryShouldExist = function(infoId)
{
   var entry = Fixture.dataStore.getEntry(infoId);

   assertNotUndefined(entry);
};

MemoryDataStoreModifyExecutorTest.prototype.thenEntryShouldNotExist = function(infoId)
{
   var entry = Fixture.dataStore.getEntry(infoId);

   assertUndefined(entry);
};

MemoryDataStoreModifyExecutorTest.prototype.thenReferenceShouldBe = function(infoId, parentId, owning)
{
   var ref = Fixture.dataStore.getReference(infoId, parentId);

   assertNotUndefined("Reference doesn't exist", ref);
   assertEquals(owning, ref);
};

MemoryDataStoreModifyExecutorTest.prototype.thenInfoShouldReference = function(parentId, infoId)
{
   this.verifyReference(Fixture.infoMap[parentId.toString()], infoId, "Parent to Child");
   this.verifyReference(Fixture.infoMap[infoId.toString()], parentId, "Child to Parent");
};

MemoryDataStoreModifyExecutorTest.prototype.verifyReference = function(info, otherId, context)
{
   var other = info.references[otherId.toString()];

   assertNotUndefined(other, "Reference not set: " + context);
   assertEquals("Paranoia: Registered but not equal ID" + context, other.getInfoId().toString(), otherId.toString());
};

MemoryDataStoreModifyExecutorTest.prototype.thenInfoShouldNotReference = function(parentId, infoId)
{
   this.verifyNoReference(Fixture.infoMap[parentId.toString()], infoId, "Parent to Child");
   this.verifyNoReference(Fixture.infoMap[infoId.toString()], parentId, "Child to Parent");
};

MemoryDataStoreModifyExecutorTest.prototype.verifyNoReference = function(info, otherId, context)
{
   if (info !== undefined)
   {
      var other = info.references[otherId.toString()];

      assertUndefined("Reference still set: " + context, other);
   }
};

MemoryDataStoreModifyExecutorTest.prototype.thenInfoShouldNotExist = function(infoId)
{
   assertUndefined(Fixture.infoMap[infoId.toString()]);
};

MemoryDataStoreModifyExecutorTest.prototype.testCreate = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingCommit();

   this.thenEntryShouldExist(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testCreateSetsOwningReference = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingCommit();

   this.thenReferenceShouldBe(infoId, parentId, true);
};

MemoryDataStoreModifyExecutorTest.prototype.testDelete = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingDeleteInfo(parentId, infoId);
   this.whenCallingCommit();

   this.thenEntryShouldNotExist(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testReference = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenARegisteredFactory("parent", this.standardFactory);
   this.givenARegisteredFactory("info", this.standardFactory);
   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingCommit();

   this.thenInfoShouldReference(parentId, infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testDeleteObject = function()
{
   var parentId = new upro.data.InfoId("parent");

   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingDeleteInfo(parentId);
   this.whenCallingCommit();

   this.thenInfoShouldNotExist(parentId);
};

MemoryDataStoreModifyExecutorTest.prototype.testDeleteRecursive = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenARegisteredFactory("parent", this.standardFactory);
   this.givenARegisteredFactory("info", this.standardFactory);
   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingDeleteInfo(parentId);
   this.whenCallingCommit();

   this.thenInfoShouldNotExist(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testDeleteRemovesParentReference = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenARegisteredFactory("parent", this.standardFactory);
   this.givenARegisteredFactory("info", this.standardFactory);
   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingDeleteInfo(infoId);
   this.whenCallingCommit();

   this.thenInfoShouldNotReference(parentId, infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testKeepAlive = function()
{
   var parentId1 = new upro.data.InfoId("parent");
   var parentId2 = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId1);
   this.givenAnExistingEntry(parentId2);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId1, infoId);
   this.whenCallingAddReference(infoId, parentId2, true);
   this.whenCallingDeleteInfo(parentId1);
   this.whenCallingCommit();

   this.thenEntryShouldExist(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testDeleteCircle = function()
{
   var parentId1 = new upro.data.InfoId("parent");
   var parentId2 = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(parentId1);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId1, parentId2);
   this.whenCallingCreateInfo(parentId2, infoId);
   this.whenCallingAddReference(parentId1, infoId, true);
   this.whenCallingDeleteInfo(parentId1);
   this.whenCallingCommit();

   this.thenEntryShouldNotExist(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testRemoveLastOwner = function()
{
   var parentId = new upro.data.InfoId("parent");
   var infoId = new upro.data.InfoId("info");

   this.givenARegisteredFactory("parent", this.standardFactory);
   this.givenARegisteredFactory("info", this.standardFactory);
   this.givenAnExistingEntry(parentId);
   this.givenATransaction();

   this.whenCallingCreateInfo(parentId, infoId);
   this.whenCallingRemoveReference(infoId, parentId);
   this.whenCallingCommit();

   this.thenInfoShouldNotExist(infoId);
};

MemoryDataStoreModifyExecutorTest.prototype.testSelfReference = function()
{
   var infoId = new upro.data.InfoId("info");

   this.givenAnExistingEntry(infoId);
   this.givenATransaction();

   this.whenCallingAddReference(infoId, infoId, true);
   this.whenCallingRemoveReference(infoId, infoId);
   this.whenCallingCommit();

   this.thenEntryShouldNotExist(infoId);
};
