<?php
require_once 'dataModel/DataModelConstants.php';
require_once 'Uuid.php';

require_once 'TestEnvironment.php';

class DataModelConstantsTest extends PHPUnit_Framework_TestCase
{

   public function setUp()
   {
      parent::setUp();

   }

   public function testGetRoleNamesWorks()
   {
      $roleNames = \upro\dataModel\DataModelConstants::getRoleNames();

      $this->assertTrue(array_search(\upro\dataModel\DataModelConstants::ROLE_NAME_CREATE_TITLE, $roleNames) !== FALSE);
   }

}