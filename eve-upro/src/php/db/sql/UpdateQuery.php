<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/Query.php';

require_once realpath(dirname(__FILE__)) . '/ValueExpression.php';

/**
 * An update query
 */
class UpdateQuery implements \upro\db\sql\Query
{
   /**
    * @var string name of the table to update
    */
   private $tableName;

   /**
    * @var array of strings for columnNames
    */
   private $columnNames;

   /**
    * @var array of \upro\db\sql\ValueExpression to use, keyed by column name
    */
   private $valuesByColumnName;

   /**
    * @var \upro\db\sql\clause\Clause to use for WHERE
    */
   private $clause;

   /**
    * Constructor
    */
   function __construct()
   {
      $this->columnNames = array();
      $this->valuesByColumnName = array();
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $setCount = count($this->columnNames);

      $result = new \upro\db\sql\ParameterizedSqlText($dict->getUpdate() . ' ' . $this->tableName);
      if ($setCount > 0)
      {
         $first = true;

         foreach ($this->columnNames as $columnName)
         {
            $expr = $this->valuesByColumnName[$columnName];
            $infix = ($first ? ' ' . $dict->getSet() . ' ' : ', ') . $columnName . ' = ';

            $result = $result->append($expr->toSqlText($dict), $infix);
            $first = false;
         }
      }
      if ($this->clause != null)
      {
         $result = $result->append($this->clause->toSqlText($dict), $dict->getWhere());
      }

      return $result;
   }

   /**
    * Sets the table name to update
    * @param string $tableName name of the table
    * @return \upro\db\sql\UpdateQuery this
    */
   public function updateTable($tableName)
   {
      $this->tableName = $tableName;

      return $this;
   }

   /**
    * Adds a value expression to use as value for a column
    * @param string $columnName name of the column
    * @param \upro\db\sql\ValueExpression $expression to use
    * @return \upro\db\sql\UpdateQuery this
    */
   public function set($columnName, \upro\db\sql\ValueExpression $expression)
   {
      $this->columnNames[] = $columnName;
      $this->valuesByColumnName[$columnName] = $expression;

      return $this;
   }

   /**
    * Adds a constant to use as value for a column
    * @param string $columnName name of the column
    * @param mixed $value to set
    * @return \upro\db\sql\UpdateQuery this
    */
   public function setConstant($columnName, $value)
   {
      $this->columnNames[] = $columnName;
      $this->valuesByColumnName[$columnName] =
            new \upro\db\sql\ParameterValueExpression(new \upro\db\sql\ParameterBox($value));

      return $this;
   }

   /**
    * Sets the clause
    * @param \upro\db\sql\clause\Clause $clause to set
    * @return \upro\db\sql\UpdateQuery this
    */
   public function where(\upro\db\sql\clause\Clause $clause)
   {
      $this->clause = $clause;

      return $this;
   }

}

}
