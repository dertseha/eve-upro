<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/../KeyedBufferTableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/ResultSetHandler.php';


/**
 * An implementation of a ResultSetHandler using the KeyedBufferTableRowReader
 */
class KeyedBufferResultSetHandler implements ResultSetHandler
{
   /**
    * @var \upro\db\KeyedBufferTableRowReader the reader to work with
    */
   private $reader;

   /**
    * Constructor
    */
   function __construct()
   {

   }

   /**
    * @return \upro\db\KeyedBufferTableRowReader the reader, created at each handleResultSet()
    */
   public function getReader()
   {
      return $this->reader;
   }

   /** {@inheritDoc} */
   public function handleResultSet(\upro\db\ResultSet $resultSet)
   {
      $this->reader = new \upro\db\KeyedBufferTableRowReader($resultSet->getColumnsByName());
      $resultSet->read($this->reader);
   }
}

}