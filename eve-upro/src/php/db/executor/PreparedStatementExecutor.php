<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/../Connection.php';
require_once realpath(dirname(__FILE__)) . '/../PreparedStatement.php';
require_once realpath(dirname(__FILE__)) . '/../DatabaseException.php';
require_once realpath(dirname(__FILE__)) . '/../sql/ParameterBox.php';

require_once realpath(dirname(__FILE__)) . '/ParameterBoxBinder.php';
require_once realpath(dirname(__FILE__)) . '/StatementExecutor.php';


/**
 * A ParameterBox binder implements the observer interface to automatically set
 * parameters in a prepared statement.
 */
class PreparedStatementExecutor implements \upro\db\executor\StatementExecutor
{
   /**
    * @var \upro\db\PreparedStatement the prepared statement run
    */
   private $statement;

   /**
    * Constructor
    */
   function __construct()
   {

   }

   /**
    * Closes the contained statement
    */
   public function close()
   {
      if ($this->statement != null)
      {
         $this->statement->close();
         $this->statement = null;
      }
   }

   /**
    * Prepares a statement on given connection using given query
    * @param \upro\db\Connection $connection to use for the statement
    * @param \upro\db\sql\Query $query to compile
    * @throws \upro\db\DatabaseException if the executor was already prepared or on DB error
    */
   public function prepare(\upro\db\Connection $connection, \upro\db\sql\Query $query)
   {
      if ($this->statement != null)
      {
         throw new \upro\db\DatabaseException("Executor already prepared");
      }

      $dict = $connection->getSqlDictionary();
      $paramText = $query->toSqlText($dict);

      $this->statement = $connection->prepareStatement($paramText->getText());

      $paramCount = $paramText->getParameterCount();
      for ($i = 0; $i < $paramCount; $i++)
      {
         $binder = new \upro\db\executor\ParameterBoxBinder($this->statement, $i);

         $binder->forBox($paramText->getParameter($i));
      }
   }

   /** {@inheritDoc} */
   public function execute(\upro\db\executor\ResultSetHandler $handler)
   {
      $result = $this->statement->execute();

      if (is_object($result))
      {
         $handler->handleResultSet($result);
         $result->close();
      }
   }
}

}