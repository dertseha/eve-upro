<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/../ParameterizedSqlText.php';
require_once realpath(dirname(__FILE__)) . '/AbstractClause.php';

/**
 * IS NULL operator
 */
class IsNullClause extends \upro\db\sql\clause\AbstractClause
{
   /**
    * @var \upro\db\sql\clause\ClauseSubject the subject
    */
   private $subject;

   /**
    * Constructor
    * @param \upro\db\sql\clause\ClauseSubject $subject the subject to check against NULL
    */
   function __construct(\upro\db\sql\clause\ClauseSubject $subject)
   {
      $this->subject = $subject;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = $this->subject->toSqlText($dict);

      return $result->append(new \upro\db\sql\ParameterizedSqlText($dict->getIsNull()));
   }
}

}
