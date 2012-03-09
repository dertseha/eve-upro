LangTest = TestCase("LangTest")

LangTest.prototype.setUp = function()
{
   Fixture = {};

   delete upro.res.text.templates[upro.res.text.Lang.defaultLang].testEntry;
   delete upro.res.text.templates["test"];
   delete upro.res.text.templates["test-test"];
};

LangTest.prototype.createCopyOfDefaultLang = function()
{
   var tempCopy = {};
   var defaultLang = upro.res.text.templates[upro.res.text.Lang.defaultLang];

   for ( var entry in defaultLang)
   {
      tempCopy[entry] = defaultLang[entry];
   }

   return tempCopy;
};

LangTest.prototype.testSetCurrentLanguageToDefault = function()
{
   var result = upro.res.text.Lang.setCurrentLanguage(upro.res.text.Lang.defaultLang);

   assertTrue(result);
};

LangTest.prototype.testSetCurrentLanguageMissing = function()
{
   var result = upro.res.text.Lang.setCurrentLanguage("unknown");

   assertFalse(result);
};

LangTest.prototype.testSetCurrentLanguageWrongEntry = function()
{
   var tempCopy = this.createCopyOfDefaultLang();

   tempCopy["test-not-existing"] = "1234";
   upro.res.text.templates["test"] = tempCopy;

   var result = upro.res.text.Lang.setCurrentLanguage("test");

   assertFalse(result);
};

LangTest.prototype.testFallbackViaMain = function()
{
   var tempCopy = this.createCopyOfDefaultLang();

   upro.res.text.templates[upro.res.text.Lang.defaultLang].testEntry = "1234";
   upro.res.text.templates["test"] =
   {
      testEntry: "abcd"
   };
   upro.res.text.templates["test-test"] = tempCopy;

   var result = upro.res.text.Lang.setCurrentLanguage("test-test");

   assertTrue(result);
};

LangTest.prototype.testLibrary = function()
{
   var templates = upro.res.text.templates;

   for ( var id in templates)
   {
      var result = upro.res.text.Lang.setCurrentLanguage(id);

      assertTrue("Language [" + id + "] has errors", result);
   }
};

LangTest.prototype.testFormatUnknown = function()
{
   upro.res.text.Lang.setCurrentLanguage(upro.res.text.Lang.defaultLang);

   var result = upro.res.text.Lang.format("testEntry", 1, 2, 3);

   assertEquals(result, "ERROR: Missing Text for [testEntry]");
};

LangTest.prototype.testFormatNoReplace = function()
{
   upro.res.text.templates[upro.res.text.Lang.defaultLang].testEntry = "abcd";

   upro.res.text.Lang.setCurrentLanguage(upro.res.text.Lang.defaultLang);

   var result = upro.res.text.Lang.format("testEntry", 1, 2, 3);

   assertEquals(result, "abcd");
};

LangTest.prototype.testFormatWithReplace = function()
{
   upro.res.text.templates[upro.res.text.Lang.defaultLang].testEntry = "abcd - {0}, {1}, {2}";

   upro.res.text.Lang.setCurrentLanguage(upro.res.text.Lang.defaultLang);

   var result = upro.res.text.Lang.format("testEntry", 1, 2, 3);

   assertEquals(result, "abcd - 1, 2, 3");
};
