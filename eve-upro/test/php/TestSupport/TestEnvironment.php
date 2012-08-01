<?php

class TestEnvironment
{
   /**
    * @return boolean true if selenium is available
    */
   public static function isSeleniumAvailable()
   {
      return true;
   }

   /**
    * @return string the browser to use for the tests
    */
   public static function getSeleniumTestBrowser()
   {
      return 'googlechrome'; // '*firefox'
   }

   /**
    * @return string the base URL for the integration tests
    */
   public static function getIntegrationTestUrl()
   {
      return 'http://localhost/'; // TODO: fix
   }
}
