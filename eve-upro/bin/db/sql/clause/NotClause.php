<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/AbstractClause.php';

require_once realpath(dirname(__FILE__)) . '/../ParameterizedSqlText.php';

/**
 * NOT operator
 */
class NotClause extends \upro\db\sql\clause\AbstractClause
{
   /**
    * @var \upro\db\sql\clause\Clause the contained clause
    */
   private $clause;

   /**
    * Constructor
    * @param \upro\db\sql\clause\Clause $clause the clause to invert
    */
   function __construct(\upro\db\sql\clause\Clause $clause)
   {
      $this->clause = $clause;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = new \upro\db\sql\ParameterizedSqlText($dict->getNot());

      return $result->append($this->clause->toSqlText($dict), '(', ')');
   }
}

}
