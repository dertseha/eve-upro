<?php
namespace upro\product
{
require_once realpath(dirname(__FILE__)) . '/../db/mysql/MySqlDataSource.php';
require_once realpath(dirname(__FILE__)) . '/../util/ConfigProvider.php';
require_once realpath(dirname(__FILE__)) . '/../io/ValueStore.php';
require_once realpath(dirname(__FILE__)) . '/ProductFactory.php';
require_once realpath(dirname(__FILE__)) . '/ProductDataModelDefinitionV1.php';

/**
 * The factory for the basic product elements
 */
class DefaultProductFactory implements \upro\product\ProductFactory
{
   private $configuration;

   /**
    * Constructor
    * @param \upro\io\ValueStore $configuration the configuration to use
    */
   function __construct(\upro\io\ValueStore $configuration)
   {
      $this->configuration = $configuration;
   }

   /** {@inheritDoc} */
   public function getDatabaseConnection()
   {
      $configuration = $this->configuration->subset('database.');
      $dataSource = new \upro\db\mysql\MySqlDataSource($configuration->get('server', 'localhost'));
      $connection = $dataSource->getConnection($configuration->get('userName', 'upro'), $configuration->get('userPassword'));

      $connection->setDatabase($configuration->get('databaseName', 'upro_live'));

      return $connection;
   }

   /** {@inheritDoc} */
   public function getDataModelDefinition()
   {
      return new \upro\product\ProductDataModelDefinitionV1();
   }
}

}