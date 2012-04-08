<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/AbstractOrderExpression.php';

/**
 * A column order expression sorty by a column
 */
class ColumnOrderExpression extends \upro\db\sql\AbstractOrderExpression
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
      $sqlText = new \upro\db\sql\ParameterizedSqlText($this->columnName);

      return $this->augmentAbstractExpression($sqlText, $dict);
   }
}

}
