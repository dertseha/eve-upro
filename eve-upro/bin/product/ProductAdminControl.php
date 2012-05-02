<?php
namespace upro\product
{
require_once realpath(dirname(__FILE__)) . '/../db/schema/TableControlProvider.php';
require_once realpath(dirname(__FILE__)) . '/../db/executor/StandardStatementExecutorFactory.php';
require_once realpath(dirname(__FILE__)) . '/../dataModel/db/StandardSchemaControl.php';
require_once realpath(dirname(__FILE__)) . '/../dataModel/db/DatabaseDataModelDefinition.php';
require_once realpath(dirname(__FILE__)) . '/../dataModel/db/DatabaseDataModelProvider.php';
require_once realpath(dirname(__FILE__)) . '/AdminControl.php';
require_once realpath(dirname(__FILE__)) . '/ProductFactory.php';

/**
 * Product specific administrative control
 */
class ProductAdminControl implements \upro\product\AdminControl
{
   private $dataModelDefinition;

   /**
    * Constructor
    * @param \upro\product\ProductFactory $productFactory the factory to create necessary objects
    */
   function __construct(\upro\product\ProductFactory $productFactory)
   {
      $this->productFactory = $productFactory;
      $this->dataModelDefinition = $productFactory->getDataModelDefinition();
   }

   /**
    * @return \upro\util\logging\Logger the logger for this class
    */
   private function getLogger()
   {
      return \upro\util\logging\LoggerProvider::getLogger(get_class());
   }

   /** {@inheritDoc} */
   public function isDatabaseUpToDate()
   {
      $connection = $this->productFactory->getDatabaseConnection();
      $tableControlProvider = $connection->getTableControlProvider();
      $schemaControl = new \upro\dataModel\db\StandardSchemaControl($this->dataModelDefinition, $tableControlProvider,
            new \upro\db\executor\StandardStatementExecutorFactory($connection));

      $result = $schemaControl->isUpToDate();
      $connection->close();

      return $result;
   }

   /** {@inheritDoc} */
   public function updateDatabaseSchema()
   {
      $connection = $this->productFactory->getDatabaseConnection();
      $tableControlProvider = $connection->getTableControlProvider();
      $schemaControl = new \upro\dataModel\db\StandardSchemaControl($this->dataModelDefinition, $tableControlProvider,
            new \upro\db\executor\StandardStatementExecutorFactory($connection));

      $this->getLogger()->info('Starting database schema update');
      $schemaControl->update();
      $this->getLogger()->info('Finished database schema update');

      $connection->close();
   }

   /** {@inheritDoc} */
   public function createDataModel($name)
   {
      $connection = $this->productFactory->getDatabaseConnection();
      $dataModelProvider = new \upro\dataModel\db\DatabaseDataModelProvider($connection->getTransactionControl(),
            new \upro\db\executor\StandardStatementExecutorFactory($connection), $this->dataModelDefinition);

      $this->getLogger()->info('Creating data model [%s]', $name);
      $dataModelProvider->createDataModel($name);

      $connection->close();
   }
}

}