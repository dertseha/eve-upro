<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/AbstractClause.php';

/**
 * OR operator; Takes two subclauses, puts them in brackets and combines them with OR
 */
class OrClause extends \upro\db\sql\clause\AbstractClause
{
   /**
    * @var \upro\db\sql\clause\Clause the left clause
    */
   private $left;

   /**
    * @var \upro\db\sql\clause\Clause the right clause
    */
   private $right;

   /**
    * Constructor
    * @param \upro\db\sql\clause\Clause $left the left clause
    * @param \upro\db\sql\clause\Clause $right the right clause
    */
   function __construct(\upro\db\sql\clause\Clause $left, \upro\db\sql\clause\Clause $right)
   {
      $this->left = $left;
      $this->right = $right;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = new \upro\db\sql\ParameterizedSqlText('(');

      $result = $result->append($this->left->toSqlText($dict));

      return $result->append($this->right->toSqlText($dict), ')' . $dict->getOr() . '(', ')');
   }
}

}
