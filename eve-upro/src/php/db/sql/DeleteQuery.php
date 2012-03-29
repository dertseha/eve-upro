<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/Query.php';

/**
 * A delete query
 */
class DeleteQuery implements \upro\db\sql\Query
{
   /**
    * @var string name of the table to update
    */
   private $tableName;

   /**
    * @var \upro\db\sql\clause\Clause to use for WHERE
    */
   private $clause;

   /**
    * Constructor
    */
   function __construct()
   {

   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = new \upro\db\sql\ParameterizedSqlText($dict->getDelete() . ' ' . $this->tableName);
      if ($this->clause != null)
      {
         $result = $result->append($this->clause->toSqlText($dict), $dict->getWhere());
      }

      return $result;
   }

   /**
    * Sets the table name to delete from
    * @param string $tableName name of the table
    * @return \upro\db\sql\DeleteQuery this
    */
   public function deleteFromTable($tableName)
   {
      $this->tableName = $tableName;

      return $this;
   }

   /**
    * Sets the clause
    * @param \upro\db\sql\clause\Clause $clause to set
    * @return \upro\db\sql\DeleteQuery this
    */
   public function where(\upro\db\sql\clause\Clause $clause)
   {
      $this->clause = $clause;

      return $this;
   }

}

}
