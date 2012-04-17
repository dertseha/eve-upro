<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/AbstractClause.php';

/**
 * Greater operator
 */
class GreaterClause extends \upro\db\sql\clause\AbstractClause
{
   /**
    * @var \upro\db\sql\clause\ClauseSubject the left subject
    */
   private $left;

   /**
    * @var \upro\db\sql\clause\ClauseSubject the right subject
    */
   private $right;

   /**
    * Constructor
    * @param \upro\db\sql\clause\ClauseSubject $left the left clause subject
    * @param \upro\db\sql\clause\ClauseSubject $right the right clause subject
    */
   function __construct(\upro\db\sql\clause\ClauseSubject $left, \upro\db\sql\clause\ClauseSubject $right)
   {
      $this->left = $left;
      $this->right = $right;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = $this->left->toSqlText($dict);

      return $result->append($this->right->toSqlText($dict), $dict->getGreater());
   }
}

}
