<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SelectExpression.php';

/**
 * A select expression that can be used with an AliasSelectExpression
 */
abstract class AbstractNameableSelectExpression implements SelectExpression
{
   /**
    * Returns an AliasSelectExpression for this select expression
    * @param string $aliasName the name under which this column shall be known
    * @return \upro\db\sql\AliasSelectExpression containing this
    */
   public function alias($aliasName)
   {
      require_once realpath(dirname(__FILE__)) . '/AliasSelectExpression.php';

      return new \upro\db\sql\AliasSelectExpression($this, $aliasName);
   }
}

}
