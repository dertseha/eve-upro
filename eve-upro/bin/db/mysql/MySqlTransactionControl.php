<?php
namespace upro\db\mysql
{
require_once realpath(dirname(__FILE__)) . '/../TransactionControl.php';

require_once realpath(dirname(__FILE__)) . '/MySqlConnection.php';

/**
 * A MySQL transaction control
 */
class MySqlTransactionControl implements \upro\db\TransactionControl
{
   /**
    * @var \upro\db\mysql\MySqlConnection the connection for the control
    */
   private $connection;

   /**
    * Constructor
    * @param \upro\db\mysql\MySqlConnection $connection the connection this control is for
    */
   function __construct(\upro\db\mysql\MySqlConnection $connection)
   {
      $this->connection = $connection;
   }

   /** {@inheritDoc} */
   public function start($tablesForWriteLock, $tablesForReadLock)
   {
      $tableMap = array();

      $this->connection->executeIgnoreResult('SET autocommit = 0');
      foreach ($tablesForReadLock as $tableName)
      {
         $tableMap[$tableName] = 'READ';
      }
      foreach ($tablesForWriteLock as $tableName)
      {
         $tableMap[$tableName] = 'WRITE';
      }
      if (count($tableMap) > 0)
      {
         $lockTablesStatement = 'LOCK TABLES';
         $first = true;

         foreach ($tableMap as $tableName => $lockType)
         {
            if ($first)
            {
               $lockTablesStatement .= ' ';
               $first = false;
            }
            else
            {
               $lockTablesStatement .= ', ';
            }
            $lockTablesStatement .= $tableName . ' ' . $lockType;
         }
         $this->connection->executeIgnoreResult($lockTablesStatement);
      }
   }

   /** {@inheritDoc} */
   public function commit()
   {
      $this->connection->executeIgnoreResult('COMMIT');
      $this->connection->executeIgnoreResult('UNLOCK TABLES');
   }

   /** {@inheritDoc} */
   public function rollback()
   {
      $this->connection->executeIgnoreResult('ROLLBACK');
      $this->connection->executeIgnoreResult('UNLOCK TABLES');
   }
}

}
