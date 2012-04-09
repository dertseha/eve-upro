<?php
require_once 'db/DatabaseException.php';
require_once 'db/mysql/MySqlDataSource.php';

class MySqlBasedTest extends PHPUnit_Framework_TestCase
{
   private $testServer;

   protected $testUser;

   protected $testUserPassword;

   private $testDatabaseName;

   private $dbAvailable;

   private $dataSource;

   private $connection;

   protected function getTestServer()
   {
      return $this->testServer;
   }

   protected function getTestUser()
   {
      return $this->testUser;
   }

   protected function getTestUserPassword()
   {
      return $this->testUserPassword;
   }

   protected function getTestDatabaseName()
   {
      return $this->testDatabaseName;
   }

   private function verifyAvailability()
   {
      try
      {
         $connection = mysql_connect($this->testServer, $this->testUser, $this->testUserPassword);
         if ($connection != FALSE)
         {
            $this->dbAvailable = mysql_select_db($this->testDatabaseName, $connection);
            mysql_close($connection);
         }
      }
      catch (Exception $ex)
      {

      }
   }

   protected function getDataSource()
   {
      return $this->dataSource;
   }

   protected function getConnection()
   {
      return $this->connection;
   }

   protected function givenAMySqlDataSource($server)
   {
      $this->dataSource = new \upro\db\mysql\MySqlDataSource($server);
   }

   protected function givenAMySqlDataSourceForTests()
   {
      $this->dataSource = new \upro\db\mysql\MySqlDataSource($this->testServer);
   }

   protected function givenAConnectionForTest()
   {
      $this->connection = $this->dataSource->getConnection($this->testUser, $this->testUserPassword);
   }

   protected function thenGetConnectionShouldReturnNull($user, $password)
   {
      $this->connection = $this->dataSource->getConnection($user, $password);
      $this->assertNull($this->connection);
   }

   public function setUp()
   {
      $this->testServer = "localhost";
      $this->testUser = "upro_test";
      $this->testUserPassword = "test";
      $this->testDatabaseName = "upro_unittests";

      $this->dbAvailable = FALSE;
      $this->verifyAvailability();

      $this->connection = null;
   }

   public function tearDown()
   {
      if ($this->connection != null)
      {
         $this->connection->close();
      }
   }

   public function testTestDatabaseShouldBeAvailable()
   {
      $this->assertTrue($this->dbAvailable);
   }
}
