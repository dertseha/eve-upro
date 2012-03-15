<?php
require_once 'MySqlBasedTest.php';

class MySqlDataSourceTest extends MySqlBasedTest
{
   protected function thenGetConnectionShouldThrowException($user, $password)
   {
      try
      {
         $this->getDataSource()->getConnection($user, $password);
         $this->fail("No Exception");
      }
      catch (\upro\db\DatabaseException $ex)
      {

      }
   }

   protected function thenGetConnectionShouldReturnObject($user, $password)
   {
      $connection = $this->getDataSource()->getConnection($user, $password);
      $this->assertNotNull($connection);
   }

   public function testNullConnectionShouldBeReturned_WhenInvalidHost()
   {
      $this->givenAMySqlDataSource('notExistingHost');

      $this->thenGetConnectionShouldThrowException($this->testUser, $this->testUserPassword);
   }

   public function testNullConnectionShouldBeReturned_WhenInvalidUser()
   {
      $this->givenAMySqlDataSourceForTests();

      $this->thenGetConnectionShouldThrowException('invalidUser', $this->testUserPassword);
   }

   public function testNullConnectionShouldBeReturned_WhenInvalidPassword()
   {
      $this->givenAMySqlDataSourceForTests();

      $this->thenGetConnectionShouldThrowException($this->testUser, 'notValid');
   }

   public function testValidConnectionShouldBeReturned_WhenValidDataGiven()
   {
      $this->givenAMySqlDataSourceForTests();

      $this->thenGetConnectionShouldReturnObject($this->testUser, $this->testUserPassword);
   }
}

