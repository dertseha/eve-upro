<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/Query.php';

require_once realpath(dirname(__FILE__)) . '/SqlBuildHelper.php';
require_once realpath(dirname(__FILE__)) . '/ValueExpression.php';

/**
 * An insert query
 */
class InsertQuery implements \upro\db\sql\Query
{
   /**
    * @var string name of the table to insert into
    */
   private $tableName;

   /**
    * @var array names of the columns
    */
   private $columnNames;

   /**
    * @var array of \upro\db\sql\ValueExpression to use
    */
   private $values;

   /**
    * Constructor
    */
   function __construct()
   {
      $this->columnNames = array();
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = new \upro\db\sql\ParameterizedSqlText($dict->getInsert() . ' ' . $this->tableName . ' (');

      $result = $this->textColumnNames($dict, $result);
      $result = $result->append(new \upro\db\sql\ParameterizedSqlText(')'));
      $result = $this->textValueSource($dict, $result);

      return $result;
   }

   /**
    * Appends the names of the columns to the given text
    * @param \upro\db\sql\SqlDictionary $dict dictionary to use
    * @param \upro\db\sql\ParameterizedSqlText $base to append to
    * @return \upro\db\sql\ParameterizedSqlText new result
    */
   private function textColumnNames(\upro\db\sql\SqlDictionary $dict, \upro\db\sql\ParameterizedSqlText $base)
   {
      $columnCount = count($this->columnNames);
      $result = $base;

      if ($columnCount > 0)
      {
         $result = $result->append(new \upro\db\sql\ParameterizedSqlText($this->columnNames[0]));
         for ($i = 1; $i < $columnCount; $i++)
         {
            $result = $result->append(new \upro\db\sql\ParameterizedSqlText($this->columnNames[$i]), ', ');
         }
      }

      return $result;
   }

   /**
    * Appends the value source(s) to the given text
    * @param \upro\db\sql\SqlDictionary $dict dictionary to use
    * @param \upro\db\sql\ParameterizedSqlText $base to append to
    * @return \upro\db\sql\ParameterizedSqlText new result
    */
   private function textValueSource(\upro\db\sql\SqlDictionary $dict, \upro\db\sql\ParameterizedSqlText $base)
   {
      $result = $base;

      $result = $result->append(new \upro\db\sql\ParameterizedSqlText(' ' . $dict->getValues() . ' ('));
      if (count($this->values) > 0)
      {
         $result = $result->append(\upro\db\sql\SqlBuildHelper::joinList($dict, $this->values));
      }
      $result = $result->append(new \upro\db\sql\ParameterizedSqlText(')'));

      return $result;
   }

   /**
    * Sets the table name to insert into
    * @param string $tableName name of the table
    * @return \upro\db\sql\InsertQuery this
    */
   public function intoTable($tableName)
   {
      $this->tableName = $tableName;

      return $this;
   }

   /**
    * Adds a column name to insert data into
    * @param string $columnName name of the column
    * @return \upro\db\sql\InsertQuery this
    */
   public function columnName($columnName)
   {
      $this->columnNames[] = $columnName;

      return $this;
   }

   /**
    * Adds a value expression to use as value
    * @param \upro\db\sql\ValueExpression $expression to use
    * @return \upro\db\sql\InsertQuery this
    */
   public function value(\upro\db\sql\ValueExpression $expression)
   {
      $this->values[] = $expression;

      return $this;
   }

}

}
