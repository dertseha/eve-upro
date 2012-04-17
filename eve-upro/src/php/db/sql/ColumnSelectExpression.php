<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/AbstractNameableSelectExpression.php';

/**
 * A column select expression queries a column
 */
class ColumnSelectExpression extends \upro\db\sql\AbstractNameableSelectExpression
{
   /**
    * @var string the column name
    */
   private $columnName;

   /**
    * Constructor
    * @param string $columnName name of the column
    */
   function __construct($columnName)
   {
      $this->columnName = $columnName;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      return new \upro\db\sql\ParameterizedSqlText($this->columnName);
   }
}

}
