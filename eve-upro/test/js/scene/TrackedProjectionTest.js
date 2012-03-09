TrackedProjectionTest = TestCase("TrackedProjectionTest");

TrackedProjectionTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.callbackCalled = 0;
};

TrackedProjectionTest.prototype.TrackedCallback = function(track)
{
   Fixture.callbackCalled++;
};

TrackedProjectionTest.prototype.givenATrackedProjection = function()
{
   Fixture.tracked = new upro.scene.TrackedProjection(0, vec3.create(), this.TrackedCallback.bind(this));
};

TrackedProjectionTest.prototype.whenSettingProjectionNull = function()
{
   Fixture.tracked.setProjectedPosition(null);
};

TrackedProjectionTest.prototype.whenSettingProjectionValid = function(x, y)
{
   var pos =
   {
      "x": x,
      "y": y
   };

   Fixture.tracked.setProjectedPosition(pos);
};

TrackedProjectionTest.prototype.thenProjectionShouldNotBeConfirmed = function()
{
   var value = Fixture.tracked.isProjectionConfirmed();

   assertFalse(value);
};

TrackedProjectionTest.prototype.thenProjectionShouldBeConfirmed = function()
{
   var value = Fixture.tracked.isProjectionConfirmed();

   assertTrue(value);
};

TrackedProjectionTest.prototype.thenCallbackShouldHaveBeenCalledTimes = function(expected)
{
   assertEquals(expected, Fixture.callbackCalled);
};

TrackedProjectionTest.prototype.testInitializedIsNotConfirmed = function()
{
   this.givenATrackedProjection();

   this.thenProjectionShouldNotBeConfirmed();
};

TrackedProjectionTest.prototype.testNoConfirmationBelowLimit = function()
{
   this.givenATrackedProjection();

   for ( var i = 0; i < (upro.scene.TrackedProjection.CONFIRMATION_LIMIT - 1); i++)
   {
      this.whenSettingProjectionValid(10, 20);
   }

   this.thenProjectionShouldNotBeConfirmed();
};

TrackedProjectionTest.prototype.testConfirmationAfterLimitReachedWithValues = function()
{
   this.givenATrackedProjection();

   for ( var i = 0; i < upro.scene.TrackedProjection.CONFIRMATION_LIMIT; i++)
   {
      this.whenSettingProjectionValid(10, 20);
   }

   this.thenProjectionShouldBeConfirmed();
};

TrackedProjectionTest.prototype.testConfirmationAfterLimitReachedWithNull = function()
{
   this.givenATrackedProjection();

   for ( var i = 0; i < upro.scene.TrackedProjection.CONFIRMATION_LIMIT; i++)
   {
      this.whenSettingProjectionNull();
   }

   this.thenProjectionShouldBeConfirmed();
};

TrackedProjectionTest.prototype.testConfirmationNotAccumulated = function()
{
   var breakLimit = 2;

   this.givenATrackedProjection();

   assertTrue("Sanity: Test must be modified", breakLimit < upro.scene.TrackedProjection.CONFIRMATION_LIMIT);
   for ( var i = 0; i < breakLimit; i++)
   {
      this.whenSettingProjectionNull();
   }
   this.whenSettingProjectionValid(10, 20);
   for (i; i < upro.scene.TrackedProjection.CONFIRMATION_LIMIT; i++)
   {
      this.whenSettingProjectionNull();
   }

   this.thenProjectionShouldNotBeConfirmed();
};
