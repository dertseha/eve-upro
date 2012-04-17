<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/ClauseSubject.php';

require_once realpath(dirname(__FILE__)) . '/EqualsClause.php';
require_once realpath(dirname(__FILE__)) . '/GreaterClause.php';
require_once realpath(dirname(__FILE__)) . '/SmallerClause.php';
require_once realpath(dirname(__FILE__)) . '/IsNullClause.php';

/**
 * Abstract SQL clause subject implementation, providing standard implementation
 * for the helper methods
 */
abstract class AbstractClauseSubject implements \upro\db\sql\clause\ClauseSubject
{
   /** {@inheritDoc} */
   public function isNull()
   {
      return new \upro\db\sql\clause\IsNullClause($this);
   }

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

   /** {@inheritDoc} */
   public function isGreaterThan(\upro\db\sql\clause\ClauseSubject $other)
   {
      return new \upro\db\sql\clause\GreaterClause($this, $other);
   }

   /** {@inheritDoc} */
   public function isGreaterThanParameter(\upro\db\sql\ParameterBox $parameterBox)
   {
      require_once realpath(dirname(__FILE__)) . '/ParameterClauseSubject.php';

      return $this->isGreaterThan(new \upro\db\sql\clause\ParameterClauseSubject($parameterBox));
   }

   /** {@inheritDoc} */
   public function isSmallerThan(\upro\db\sql\clause\ClauseSubject $other)
   {
      return new \upro\db\sql\clause\SmallerClause($this, $other);
   }

   /** {@inheritDoc} */
   public function isSmallerThanParameter(\upro\db\sql\ParameterBox $parameterBox)
   {
      require_once realpath(dirname(__FILE__)) . '/ParameterClauseSubject.php';

      return $this->isSmallerThan(new \upro\db\sql\clause\ParameterClauseSubject($parameterBox));
   }
}

}
