<?php
namespace upro\db
{
require_once realpath(dirname(__FILE__)) . '/TableRowReader.php';

/**
 * A simple TableRowReader storing received rows in a buffer
 */
class BufferTableRowReader implements \upro\db\TableRowReader
{
   /**
    * @var array rows
    */
   private $rows;

   /**
    * Constructor
    */
   function __construct()
   {
      $this->rows = array();
   }

   /** {@inheritDoc} */
   public function receive($data)
   {
      $this->rows[] = $data;
   }

   /**
    * @return number amount of rows contained
    */
   public function getRowCount()
   {
      return count($this->rows);
   }

   /**
    * Returns a row by given index
    * @param number $index index of the row to retrieve
    * @return array selected row
    */
   public function getRow($index)
   {
      return $this->rows[$index];
   }
}

}
