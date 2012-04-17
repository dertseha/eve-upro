<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/AbstractClause.php';

/**
 * AND operator; Takes at least two subclauses, puts them in brackets and combines them with AND
 */
class AndClause extends \upro\db\sql\clause\AbstractClause
{
   /**
    * The subclauses
    * @var array of \upro\db\sql\clause\Clause
    */
   private $subClauses;

   /**
    * Constructor
    * @param \upro\db\sql\clause\Clause $left the left clause
    * @param \upro\db\sql\clause\Clause $right the right clause
    */
   function __construct(\upro\db\sql\clause\Clause $left, \upro\db\sql\clause\Clause $right)
   {
      $this->subClauses = array($left, $right);
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = new \upro\db\sql\ParameterizedSqlText('(');

      $result = $result->append($this->subClauses[0]->toSqlText($dict));
      for ($i = 1; $i < count($this->subClauses); $i++)
      {
         $result = $result->append($this->subClauses[$i]->toSqlText($dict), ')' . $dict->getAnd() . '(');
      }

      return $result->append(new \upro\db\sql\ParameterizedSqlText(')'));
   }

   /** {@inheritDoc} */
   public function andThat(\upro\db\sql\clause\Clause $clause)
   {
      $this->subClauses[] = $clause;

      return $this;
   }
}

}
