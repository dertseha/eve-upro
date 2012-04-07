<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/../TableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/ResultSetHandler.php';


/**
 * A simple implementation of a ResultSetHandler - passing a fixed table row reader
 * without considering the columns
 */
class SimpleResultSetHandler implements ResultSetHandler
{
   /**
    * @var \upro\db\TableRowReader the reader to pass on
    */
   private $reader;

   /**
    * Constructor
    * @param \upro\db\TableRowReader $reader to use for any result set
    */
   function __construct(\upro\db\TableRowReader $reader)
   {
      $this->reader = $reader;
   }

   /** {@inheritDoc} */
   public function handleResultSet(\upro\db\ResultSet $resultSet)
   {
      $resultSet->read($this->reader);
   }
}

}