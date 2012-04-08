<?php
require_once 'db/ResultSet.php';

class BufferResultSet implements \upro\db\ResultSet
{
   private $rows;

   private $columnsByName;

   private $closeCalled;

   function __construct($columnNames = array())
   {
      $this->rows = array();
      $this->columnsByName = array();

      $columnId = 0;
      foreach ($columnNames as $columnName)
      {
         $this->columnsByName[$columnName] = $columnId++;
      }
   }

   public function addRow($data)
   {
      $this->rows[] = $data;
   }

   public function wasCloseCalled()
   {
      return $this->closeCalled;
   }

   /** {@inheritDoc} */
   public function close()
   {
      $this->closeCalled = true;
   }

   /** {@inheritDoc} */
   public function getColumnsByName()
   {
      return $this->columnsByName;
   }

   /** {@inheritDoc} */
   public function read(\upro\db\TableRowReader $reader)
   {
      foreach ($this->rows as $row)
      {
         $reader->receive($row);
      }
   }

}
