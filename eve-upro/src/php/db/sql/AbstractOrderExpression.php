<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/OrderExpression.php';

/**
 * An abstract order expression
 */
class AbstractOrderExpression implements \upro\db\sql\OrderExpression
{
   /**
    * @var boolean whether the order shall be ascending
    */
   private $ascending;

   /**
    * Constructor
    */
   function __construct()
   {
      $this->ascending = true;
   }

   /** {@inheritDoc} */
   public function ascending($ascending)
   {
      $this->ascending = $ascending ? true : false;

      return $this;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      return new \upro\db\sql\ParameterizedSqlText($this->columnName);
   }

   /**
    * Augments given SQL text with the extras from this abstract implementation
    * @param \upro\db\sql\ParameterizedSqlText $baseText base text to augment
    * @param \upro\db\sql\SqlDictionary $dict to use
    * @return \upro\db\sql\ParameterizedSqlText the resulting SQL text
    */
   protected function augmentAbstractExpression(\upro\db\sql\ParameterizedSqlText $baseText, \upro\db\sql\SqlDictionary $dict)
   {
      $ascendingText = new \upro\db\sql\ParameterizedSqlText($this->ascending ? $dict->getAscending() : $dict->getDescending());

      return $baseText->append($ascendingText, ' ');
   }
}

}
