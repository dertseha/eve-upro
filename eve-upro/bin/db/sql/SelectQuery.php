<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlBuildHelper.php';
require_once realpath(dirname(__FILE__)) . '/ParameterBox.php';

require_once realpath(dirname(__FILE__)) . '/Query.php';

require_once realpath(dirname(__FILE__)) . '/AllSelectExpression.php';
require_once realpath(dirname(__FILE__)) . '/ColumnSelectExpression.php';
require_once realpath(dirname(__FILE__)) . '/ParameterSelectExpression.php';

require_once realpath(dirname(__FILE__)) . '/TableSelectSource.php';

require_once realpath(dirname(__FILE__)) . '/OrderExpression.php';
require_once realpath(dirname(__FILE__)) . '/ColumnOrderExpression.php';

/**
 * A select query
 */
class SelectQuery implements \upro\db\sql\Query
{
   /**
    * @var array of \upro\db\sql\SelectExpression
    */
   private $selectExpressions;

   /**
    * @var \upro\db\sql\SelectSource to select data from
    */
   private $source;

   /**
    * @var \upro\db\sql\clause\Clause to use for WHERE
    */
   private $clause;

   /**
    * @var array of \upro\db\sql\OrderExpression
    */
   private $orderExpressions;

   /**
    * Default Constructor
    */
   function __construct()
   {
      $this->selectExpressions = array();
      $this->orderExpressions = array();
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = new ParameterizedSqlText($dict->getSelect());

      $result = $result->append(\upro\db\sql\SqlBuildHelper::joinList($dict, $this->selectExpressions), ' ');
      if ($this->source != null)
      {
         $result = $result->append($this->source->toSqlText($dict), ' ' . $dict->getFrom() . ' ');
      }
      if ($this->clause != null)
      {
         $result = $result->append($this->clause->toSqlText($dict), $dict->getWhere());
      }
      if (count($this->orderExpressions) > 0)
      {
         $result = $result->append(\upro\db\sql\SqlBuildHelper::joinList($dict, $this->orderExpressions), $dict->getOrderBy());
      }

      return $result;
   }

   /**
    * Adds an explicit select expression
    * @param \upro\db\sql\SelectExpression $selectExpression to add
    * @return \upro\db\sql\SelectQuery this
    */
   public function select(\upro\db\sql\SelectExpression $selectExpression)
   {
      $this->selectExpressions[] = $selectExpression;

      return $this;
   }

   /**
    * Adds a constant as select expression
    * @param mixed $value to select
    * @return \upro\db\sql\SelectQuery this
    */
   public function selectConstant($value)
   {
      $valueBox = new \upro\db\sql\ParameterBox($value);

      $this->selectExpressions[] = new \upro\db\sql\ParameterSelectExpression($valueBox);

      return $this;
   }

   /**
    * Requests to select all
    * @return \upro\db\sql\SelectQuery this
    */
   public function selectAll()
   {
      $this->selectExpressions[] = new \upro\db\sql\AllSelectExpression();

      return $this;
   }

   /**
    * Adds a column as select expression
    * @param string $columnName to select
    * @return \upro\db\sql\SelectQuery this
    */
   public function selectColumn($columnName)
   {
      $this->selectExpressions[] = new \upro\db\sql\ColumnSelectExpression($columnName);

      return $this;
   }

   /**
    * Sets the select source explicitly
    * @param \upro\db\sql\SelectSource $source to use
    * @return \upro\db\sql\SelectQuery this
    */
   public function from(\upro\db\sql\SelectSource $source)
   {
      $this->source = $source;

      return $this;
   }

   /**
    * Sets the source to be a table, identified by given table name
    * @param string $tableName of the table
    * @return \upro\db\sql\SelectQuery this
    */
   public function fromTable($tableName)
   {
      $this->source = new \upro\db\sql\TableSelectSource($tableName);

      return $this;
   }

   /**
    * Sets the clause
    * @param \upro\db\sql\clause\Clause $clause to set
    * @return \upro\db\sql\SelectQuery this
    */
   public function where(\upro\db\sql\clause\Clause $clause)
   {
      $this->clause = $clause;

      return $this;
   }

   /**
    * Orders by given expression
    * @param \upro\db\sql\OrderExpression $order to order by
    * @return \upro\db\sql\SelectQuery this
    */
   public function orderBy(\upro\db\sql\OrderExpression $order)
   {
      $this->orderExpressions[] = $order;

      return $this;
   }

   /**
    * Orders by given column
    * @param string $columnName to order by
    * @param boolean $ascending whether to order ascending or descending
    * @return \upro\db\sql\SelectQuery this
    */
   public function orderByColumn($columnName, $ascending = true)
   {
      $expr = new \upro\db\sql\ColumnOrderExpression($columnName);

      $expr->ascending($ascending);

      return $this->orderBy($expr);
   }
}

}
