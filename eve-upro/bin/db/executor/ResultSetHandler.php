<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/../ResultSet.php';

/**
 * A ResultSet handler is called to handle a result set from an executed statement
 */
interface ResultSetHandler
{
   /**
    * Requests to handle given result set. The implementation is not requirement to call
    * close, the caller will do.
    * @param \upro\db\ResultSet $resultSet to handle
    */
   function handleResultSet(\upro\db\ResultSet $resultSet);

}

}