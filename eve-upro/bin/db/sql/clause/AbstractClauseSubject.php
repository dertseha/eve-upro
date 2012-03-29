<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/ClauseSubject.php';

require_once realpath(dirname(__FILE__)) . '/EqualsClause.php';

/**
 * Abstract SQL clause subject implementation, providing standard implementation
 * for the helper methods
 */
abstract class AbstractClauseSubject implements \upro\db\sql\clause\ClauseSubject
{
   /** {@inheritDoc} */
   public function equals(\upro\db\sql\clause\ClauseSubject $other)
   {
      return new \upro\db\sql\clause\EqualsClause($this, $other);
   }

   /** {@inheritDoc} */
   public function equalsParameter(\upro\db\sql\ParameterBox $parameterBox)
   {
      require_once realpath(dirname(__FILE__)) . '/ParameterClauseSubject.php';

      return $this->equals(new \upro\db\sql\clause\ParameterClauseSubject($parameterBox));
   }
}

}
