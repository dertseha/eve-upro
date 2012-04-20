<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/StatementExecutorFactory.php';
require_once realpath(dirname(__FILE__)) . '/PreparedStatementExecutor.php';

require_once realpath(dirname(__FILE__)) . '/../Connection.php';
require_once realpath(dirname(__FILE__)) . '/../sql/Query.php';


/**
 * A standard factory for statement executors
 */
class StandardStatementExecutorFactory implements StatementExecutorFactory
{
   /**
    * @var \upro\db\Connection the connection to work with
    */
   private $connection;

   /**
    * Constructor
    * @param \upro\db\Connection $connection the connection to work with
    */
   function __construct(\upro\db\Connection $connection)
   {
      $this->connection = $connection;
   }

   /** {@inheritDoc} */
   function getExecutor(\upro\db\sql\Query $query)
   {
      $executor = new \upro\db\executor\PreparedStatementExecutor();

      $executor->prepare($this->connection, $query);

      return $executor;
   }
}

}