<?php
require_once 'db/DatabaseException.php';

require_once 'MySqlBasedTest.php';

class MySqlConnectionTest extends MySqlBasedTest
{
   protected function whenSettingDatabase($databaseName)
   {
      $this->getConnection()->setDatabase($databaseName);
   }

   protected function whenTheConnectionIsClosed()
   {
      $this->getConnection()->close();
   }

   protected function thenGetDatabaseNameShouldReturn($expected)
   {
      $result = $this->getConnection()->getDatabaseName();

      $this->assertEquals($expected, $result);
   }

   protected function thenSetDatabaseShouldThrowAnException($value)
   {
      try
      {
         $this->getConnection()->setDatabase($value);
         $this->fail('No Exception');
      }
      catch (\upro\db\DatabaseException $ex)
      {

      }
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testSetDatabaseShouldThrowException_WhenGivenInvalidValue()
   {
      $dbName = 'notExistingDatabase';

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();

      $this->thenSetDatabaseShouldThrowAnException($dbName);
   }

   public function testGetDatabaseShouldReturnValue_WhenSetBefore()
   {
      $dbName = 'upro_unittests';

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();

      $this->whenSettingDatabase($dbName);

      $this->thenGetDatabaseNameShouldReturn($dbName);
   }

   public function testSetDatabaseShouldThrowException_WhenConnectionIsClosed()
   {
      $dbName = 'upro_unittests';

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();

      $this->whenTheConnectionIsClosed();

      $this->thenSetDatabaseShouldThrowAnException($dbName);
   }
}
