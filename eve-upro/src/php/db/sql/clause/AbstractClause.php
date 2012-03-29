<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/Clause.php';

/**
 * Abstract SQL clause implementation, providing standard implementation
 * for the helper methods
 */
abstract class AbstractClause implements \upro\db\sql\clause\Clause
{
   /** {@inheritDoc} */
   public function andThat(\upro\db\sql\clause\Clause $clause)
   {
      require_once realpath(dirname(__FILE__)) . '/AndClause.php';

      return new \upro\db\sql\clause\AndClause($this, $clause);
   }

   /** {@inheritDoc} */
   public function orThat(\upro\db\sql\clause\Clause $clause)
   {
      require_once realpath(dirname(__FILE__)) . '/OrClause.php';

      return new \upro\db\sql\clause\OrClause($this, $clause);
   }

   /** {@inheritDoc} */
   public function isFalse()
   {
      require_once realpath(dirname(__FILE__)) . '/NotClause.php';

      return new \upro\db\sql\clause\NotClause($this);
   }
}

}
