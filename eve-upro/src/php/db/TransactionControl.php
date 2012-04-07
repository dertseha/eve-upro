<?php
namespace upro\db
{

/**
 * A control interface for transactions
 */
interface TransactionControl
{
   /**
    * Requests to start a transaction
    * @param array $tablesForWriteLock list of table names required for write lock
    * @param array $tablesForReadLock list of table names required for read lock
    */
   function start($tablesForWriteLock, $tablesForReadLock);

   /**
    * Commits the last started transaction
    */
   function commit();

   /**
    * Rolls back the last started transaction
    */
   function rollback();
}

}