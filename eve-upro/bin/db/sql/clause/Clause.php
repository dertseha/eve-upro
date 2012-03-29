<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/../SqlTextable.php';

/**
 * A basic clause (used for WHERE)
 */
interface Clause extends \upro\db\sql\SqlTextable
{
   /**
    * Returns a new AND clause consisting of this and the given clauses
    * @param \upro\db\sql\clause\Clause $clause the clause to combine
    * @return \upro\db\sql\clause\Clause resulting clause
    */
   function andThat(\upro\db\sql\clause\Clause $clause);

   /**
    * Returns a new OR clause consisting of this and the given clauses
    * @param \upro\db\sql\clause\Clause $clause the clause to combine
    * @return \upro\db\sql\clause\Clause resulting clause
    */
   function orThat(\upro\db\sql\clause\Clause $clause);

   /**
    * Returns a new NOT clause, inverting this
    * @return \upro\db\sql\clause\Clause resulting clause
    */
   function isFalse();
}

}
