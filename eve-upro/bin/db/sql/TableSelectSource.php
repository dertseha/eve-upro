<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SelectSource.php';

/**
 * A select source based on a simple table
 */
class TableSelectSource implements \upro\db\sql\SelectSource
{
   /**
    * @var string the name of the table
    */
   private $tableName;

   /**
    * Constructor
    * @param string $tableName of the table to select from
    */
   function __construct($tableName)
   {
      $this->tableName = $tableName;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      return new \upro\db\sql\ParameterizedSqlText($this->tableName);
   }

}

}
