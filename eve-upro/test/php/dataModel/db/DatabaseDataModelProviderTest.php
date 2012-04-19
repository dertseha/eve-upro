<?php
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'dataModel/db/DatabaseDataModelProvider.php';

require_once 'TestStatementExecutorFactory.php';
require_once 'TestStatementExecutor.php';
require_once 'BufferResultSet.php';
require_once 'TestDatabaseDataModelDefinition.php';

class DatabaseDataModelProviderTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\dataModel\db\DatabaseDataModelProvider
    */
   private $provider;

   private $executorFactory;

   protected function givenADatabaseDataModelProvider()
   {
      $transactionControl = $this->getMock('\upro\db\TransactionControl');
      $definition = new TestDatabaseDataModelDefinition(1);

      $this->provider = new \upro\dataModel\db\DatabaseDataModelProvider($transactionControl, $this->executorFactory, $definition);
   }

   protected function whenNoDataModelExists()
   {
      $resultSet = new BufferResultSet();
      $executor = new TestStatementExecutor($resultSet);

      $this->executorFactory->setExecutor(0, $executor);
   }

   protected function whenADataModelExists($name)
   {
      $resultSet = new BufferResultSet();
      $resultSet->addRow(array(Uuid::v4()));
      $executor = new TestStatementExecutor($resultSet);

      $this->executorFactory->setExecutor(0, $executor);
   }

   protected function whenRequestingToCreateDataModel($name)
   {
      $resultSet = new BufferResultSet();
      $executor = new TestStatementExecutor($resultSet);

      $this->executorFactory->setExecutor(0, $executor);

      $this->provider->createDataModel($name);
   }

   protected function thenIsModelExistingShouldReturn($name, $expected)
   {
      $result = $this->provider->isModelExisting($name);

      $this->assertEquals($result, $expected);
   }

   protected function thenTheQueryShouldHaveBeen($index, $expected)
   {
      $query = $this->executorFactory->getQuery($index);
      $paramText = $query->toSqlText(new \upro\db\sql\StandardSqlDictionary());

      $this->assertEquals($expected, $paramText->getText());
   }

   protected function thenGetWriteContextShouldReturnAnObject($name)
   {
      $context = $this->provider->getWriteContext($name, \Uuid::v4());

      $this->assertNotNull($context);
   }

   protected function thenGetWriteContextShouldReturnNull($name)
   {
      $context = $this->provider->getWriteContext($name, \Uuid::v4());

      $this->assertNull($context);
   }

   protected function thenGetReadContextShouldReturnAnObject($name)
   {
      $context = $this->provider->getReadContext($name, \Uuid::v4());

      $this->assertNotNull($context);
   }

   protected function thenGetReadContextShouldReturnNull($name)
   {
      $context = $this->provider->getReadContext($name, \Uuid::v4());

      $this->assertNull($context);
   }

   public function setUp()
   {
      parent::setUp();

      $this->executorFactory = new TestStatementExecutorFactory();
   }

   public function testIsModelExistingShouldReturnFalse_WhenUnknown()
   {
      $this->givenADatabaseDataModelProvider();

      $this->whenNoDataModelExists();

      $this->thenIsModelExistingShouldReturn('UnknownModel', false);
   }

   public function testIsModelExistingShouldReturnTrue_WhenKnown()
   {
      $name = 'TestModel';

      $this->givenADatabaseDataModelProvider();

      $this->whenADataModelExists($name);

      $this->thenIsModelExistingShouldReturn($name, true);
   }

   public function testModelIsCreatedWithInsert()
   {
      $name = 'TestModel';

      $this->givenADatabaseDataModelProvider();

      $this->whenRequestingToCreateDataModel($name);

      $this->thenTheQueryShouldHaveBeen(0, 'INSERT INTO DataModels (id, name, instance) VALUES (?, ?, ?)');
   }

   public function testWriteContextShouldBeValid_WhenDataModelPresent()
   {
      $name = 'TestModel';

      $this->givenADatabaseDataModelProvider();

      $this->whenADataModelExists($name);

      $this->thenGetWriteContextShouldReturnAnObject($name);
   }

   public function testWriteContextShouldBeNull_WhenDataModelMissing()
   {
      $name = 'TestModel';

      $this->givenADatabaseDataModelProvider();

      $this->whenNoDataModelExists();

      $this->thenGetWriteContextShouldReturnNull($name);
   }

   public function testReadContextShouldBeValid_WhenDataModelPresent()
   {
      $name = 'TestModel';

      $this->givenADatabaseDataModelProvider();

      $this->whenADataModelExists($name);

      $this->thenGetReadContextShouldReturnAnObject($name);
   }

   public function testReadContextShouldBeNull_WhenDataModelMissing()
   {
      $name = 'TestModel';

      $this->givenADatabaseDataModelProvider();

      $this->whenNoDataModelExists();

      $this->thenGetReadContextShouldReturnNull($name);
   }
}