<?php
require_once 'db/mysql/MySqlDataSource.php';
require_once 'util/logging/LoggingSystem.php';

class TestEnvironment
{
   const DATABASE_SERVER = 'localhost';

   const DATABASE_USER = 'upro_test';

   const DATABASE_USER_PASSWORD = 'test';

   const DATABASE_NAME = 'upro_unittests';

   /**
    * @return boolean true if database is available
    */
   public static function isDatabaseAvailable()
   {
      return true;
   }

   /**
    * Returns a database connection to the test database.
    * @return \upro\db\Connection the connection to use.
    */
   public static function getDatabaseConnection()
   {
      $dataSource = new \upro\db\mysql\MySqlDataSource(TestEnvironment::DATABASE_SERVER);
      $connection = $dataSource->getConnection(TestEnvironment::DATABASE_USER, TestEnvironment::DATABASE_USER_PASSWORD);

      $connection->setDatabase(TestEnvironment::DATABASE_NAME);

      return $connection;
   }

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
      return 'http://localhost/upro-test/php/IntegrationTests/';
   }

   /**
    * Initializes the logging for testing; Will result in console output
    * @param string $testCaseName name of the test case to use
    */
   public static function initLogging($testCaseName)
   {
      $configData = array();

      $configData['logging.log4php.configuration'] = array(
            'rootLogger' => array(
                  'appenders' => array('default'),
            ),
            'appenders' => array(
                  'default' => array(
                        'class' => 'LoggerAppenderConsole',
                        'layout' => array(
                              'class' => 'LoggerLayoutPattern',
                              'params' => array(
                                    'conversionPattern' => '%n%-60X{testCase} %c %p %m'
                                    )
                        )
                  )
            )
         );

      \upro\util\logging\LoggingSystem::initialize(new \upro\io\ArrayValueStore($configData));
      \LoggerMDC::put('testCase', $testCaseName);
   }
}
