<?php
require_once 'db/mysql/MySqlDataSource.php';

class TestEnvironment
{
   const DATABASE_SERVER = 'localhost';

   const DATABASE_USER = 'upro_test';

   const DATABASE_USER_PASSWORD = 'test';

   const DATABASE_NAME = 'upro_unittests';

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
}
