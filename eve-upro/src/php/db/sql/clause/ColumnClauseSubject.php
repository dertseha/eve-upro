<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/AbstractClauseSubject.php';

require_once realpath(dirname(__FILE__)) . '/../ParameterizedSqlText.php';

/**
 * A column clause subject
 */
class ColumnClauseSubject extends \upro\db\sql\clause\AbstractClauseSubject
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
