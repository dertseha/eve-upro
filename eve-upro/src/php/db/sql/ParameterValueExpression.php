<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/ValueExpression.php';

require_once realpath(dirname(__FILE__)) . '/ParameterBox.php';
require_once realpath(dirname(__FILE__)) . '/ParameterizedSqlText.php';

/**
 * A parameterized value expression
 */
class ParameterValueExpression implements \upro\db\sql\ValueExpression
{
   /**
    * @var \upro\db\sql\ParameterBox the boxed value
    */
   private $valueBox;

   /**
    * Constructor
    * @param \upro\db\sql\ParameterBox $valueBox to use
    */
   function __construct(\upro\db\sql\ParameterBox $valueBox)
   {
      $this->valueBox = $valueBox;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      return new \upro\db\sql\ParameterizedSqlText($dict->getPlaceholder(), array($this->valueBox));
   }
}

}
