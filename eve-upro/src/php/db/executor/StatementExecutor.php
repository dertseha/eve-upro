<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/ResultSetHandler.php';


/**
 * An executor for statements
 */
interface StatementExecutor
{
   /**
    * Closes the contained statement
    */
   function close();

   /**
    * Executes the statement and provides the result set (if any) to the given handler
    * @param \upro\db\executor\ResultSetHandler $handler to receive a result set
    */
   function execute(\upro\db\executor\ResultSetHandler $handler);
}

}