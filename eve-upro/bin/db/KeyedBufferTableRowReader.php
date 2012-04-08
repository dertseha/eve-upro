<?php
namespace upro\db
{
require_once realpath(dirname(__FILE__)) . '/BufferTableRowReader.php';

/**
 * A keyed BufferTableRowReader allowing access to cells via keys
 */
class KeyedBufferTableRowReader extends \upro\db\BufferTableRowReader
{
   /**
    * @var mixed:int map to the index of the cell
    */
   private $cellIndexByKey;

   /**
    * Constructor
    * @param mixed:int $cellIndexByKey map to the index of a cell in a row
    */
   function __construct($cellIndexByKey)
   {
      parent::_construct();

      $this->cellIndexByKey = $cellIndexByKey;
   }

   /**
    * Returns a cell from a row of given index, identified by key
    * @param number $index index of the row to retrieve
    * @param \mixed $key key of the cell
    * @return \mixed selected cell
    */
   public function getCell($index, $key)
   {
      $row = $this->getRow($index);
      $cellIndex = $this->cellIndexByKey[$key];

      return $row[$cellIndex];
   }
}

}
