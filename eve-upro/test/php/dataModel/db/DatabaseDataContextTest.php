<?php
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/db/DatabaseDataContext.php';

require_once 'TestStatementExecutorFactory.php';
require_once 'TestStatementExecutor.php';
require_once 'BufferResultSet.php';

class DatabaseDataContextTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\dataModel\db\DatabaseDataContext
    */
   private $context;

   private $transactionControl;

   private $executorFactory;

   private $interestResultSet;

   protected function givenADatabaseDataContext($userId = \Uuid::EMPTY_UUID)
   {
      $tableNames = array();
      $modelId = \Uuid::v4();

      $this->context = new \upro\dataModel\db\DatabaseDataContext($this->transactionControl,
            $this->executorFactory, $tableNames, $modelId, $userId);
   }

   protected function givenAnInterest($interestId, $interestFrom, $interestTo, $controlled, $membershipFrom, $membershipTo)
   {
      $this->interestResultSet->addRow(array(\Uuid::v4(), 'Group', \Uuid::v4(),
            'Test', $interestId, $interestFrom, $interestTo, $controlled, $membershipFrom, $membershipTo));
   }

   protected function whenStartedForRead()
   {
      {   // SELECT query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(0, $executor);
      }

      $this->context->startTransaction(false);
   }

   protected function whenReadingCurrentInterest($fromInstance)
   {
      {   // SELECT query preparation
         $executor = new TestStatementExecutor($this->interestResultSet);

         $this->executorFactory->setExecutor(0, $executor);
      }

      $this->context->readCurrentInterest($fromInstance);
   }

   protected function thenTheQueryWithParametersShouldHaveBeen($queryIndex, $expectedQueryText, $expectedParameters)
   {
      $query = $this->executorFactory->getQuery($queryIndex);
      $paramText = $query->toSqlText(new \upro\db\sql\StandardSqlDictionary());
      $expected = array('query' => $expectedQueryText, 'parameters' => $expectedParameters);
      $resultingParameters = array();

      for ($i = 0; $i < $paramText->getParameterCount(); $i++)
      {
         $resultingParameters[] = $paramText->getParameter($i)->getValue();
      }
      $result = array('query' => $paramText->getText(), 'parameters' => $resultingParameters);

      $this->assertEquals($expected, $result);
   }

   protected function thenAccessIsDenied($entryId, $instance)
   {
      $interestId = new \upro\dataModel\DataEntryId('Test', $entryId);
      $result = $this->context->isAccessGranted($interestId, $instance);

      $this->assertFalse($result);
   }

   protected function thenControlIsDenied($entryId, $instance)
   {
      $interestId = new \upro\dataModel\DataEntryId('Test', $entryId);
      $result = $this->context->isControlGranted($interestId, $instance);

      $this->assertFalse($result);
   }

   protected function thenAccessIsGranted($entryId, $instance)
   {
      $interestId = new \upro\dataModel\DataEntryId('Test', $entryId);
      $result = $this->context->isAccessGranted($interestId, $instance);

      $this->assertTrue($result);
   }

   protected function thenControlIsGranted($entryId, $instance)
   {
      $interestId = new \upro\dataModel\DataEntryId('Test', $entryId);
      $result = $this->context->isControlGranted($interestId, $instance);

      $this->assertTrue($result);
   }

   public function setUp()
   {
      parent::setUp();

      $this->executorFactory = new TestStatementExecutorFactory();
      $this->transactionControl = $this->getMock('\upro\db\TransactionControl');

      $this->interestResultSet = new BufferResultSet(array(
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_ID,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED,
            \upro\dataModel\db\DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_FROM,
            \upro\dataModel\db\DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_TO
            ));
   }

   public function testInstanceSelectQueryIsValid_WhenStarted()
   {
      $this->givenADatabaseDataContext();

      $this->whenStartedForRead();

      $this->thenTheQueryWithParametersShouldHaveBeen(0,
            'SELECT instance FROM DataModels WHERE id = ?',
            array($this->context->getModelId()));
   }

   public function testInterestsSelectQueryIsValid_WhenRequested()
   {
      $fromInstance = 100;
      $userId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);

      $this->whenReadingCurrentInterest($fromInstance);

      $this->thenTheQueryWithParametersShouldHaveBeen(0,
            'SELECT GroupInterest.*,'
            . ' GroupMembership.validFromInstance AS membershipValidFromInstance,'
            . ' GroupMembership.validToInstance AS membershipValidToInstance'
            . ' FROM GroupInterest, GroupMembership WHERE (GroupInterest.contextId = GroupMembership.contextId)'
            . ' AND (GroupMembership.userId = ?)'
            . ' AND ((GroupInterest.validToInstance IS NULL) OR ((GroupInterest.validToInstance > ?) AND (GroupMembership.validFromInstance < GroupInterest.validToInstance)))'
            . ' AND ((GroupMembership.validToInstance IS NULL) OR ((GroupMembership.validToInstance > ?) AND (GroupInterest.validFromInstance < GroupMembership.validToInstance)))'
            . '',
            array($userId, $fromInstance, $fromInstance));
   }

   public function testAccessIsDenied_WhenNothingRead()
   {
      $userId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);

      $this->thenAccessIsDenied(\Uuid::v4(), 50);
   }

   public function testControlIsDenied_WhenNothingRead()
   {
      $userId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);

      $this->thenControlIsDenied(\Uuid::v4(), 50);
   }

   public function testAccessIsGrantedAtLowerBorder_WhenAtInterestStart()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 100, null, false, 0, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsGranted($entryId, 100);
   }

   public function testAccessIsDeniedAtLowerBorder_WhenBelowInterestStart()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 100, null, false, 0, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsDenied($entryId, 99);
   }

   public function testAccessIsGrantedAtLowerBorder_WhenAboveMembershipStart()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 0, null, false, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsGranted($entryId, 101);
   }

   public function testAccessIsDeniedAtLowerBorder_WhenAtMembershipStart()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 0, null, false, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsDenied($entryId, 100);
   }

   public function testAccessIsGrantedAtUpperBorder_WhenAtInterestEnd()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 100, 200, false, 0, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsGranted($entryId, 200);
   }

   public function testAccessIsDeniedAtUpperBorder_WhenAboveInterestEnd()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 100, 200, false, 0, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsDenied($entryId, 201);
   }

   public function testAccessIsGrantedAtUpperBorder_WhenAtMembershipEnd()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 0, null, false, 100, 200);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsGranted($entryId, 200);
   }

   public function testAccessIsDeniedAtUpperBorder_WhenAboveMembershipEnd()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 0, null, false, 100, 200);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsDenied($entryId, 201);
   }

   public function testAccessIsDenied_WhenBetweenStarts()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 150, null, false, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsDenied($entryId, 125);
   }

   public function testAccessIsDenied_WhenBetweenEnds()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 0, 100, false, 0, 150);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsDenied($entryId, 125);
   }

   public function testControlIsDenied_WhenOnlyAccessExists()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 100, null, false, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenControlIsDenied($entryId, 125);
   }

   public function testControlIsGranted_WhenControlExists()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 100, null, true, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenControlIsGranted($entryId, 125);
   }

   public function testAccessIsGranted_WhenOnlyControlExists()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 100, null, true, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsGranted($entryId, 125);
   }

   public function testAccessIsDenied_WhenNoInterestExists()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest(\Uuid::v4(), 100, null, true, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenAccessIsDenied($entryId, 125);
   }

   public function testControlIsGranted_WhenOverlappingWithAccess()
   {
      $userId = \Uuid::v4();
      $entryId = \Uuid::v4();

      $this->givenADatabaseDataContext($userId);
      $this->givenAnInterest($entryId, 50, null, false, 50, null);
      $this->givenAnInterest($entryId, 100, null, true, 100, null);

      $this->whenReadingCurrentInterest(50);

      $this->thenControlIsGranted($entryId, 125);
   }
}