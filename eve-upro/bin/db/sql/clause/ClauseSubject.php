<?php
namespace upro\db\sql\clause
{
require_once realpath(dirname(__FILE__)) . '/../SqlTextable.php';
require_once realpath(dirname(__FILE__)) . '/../ParameterBox.php';

require_once realpath(dirname(__FILE__)) . '/Clause.php';

/**
 * A clause subject - one of the operands of a clause
 */
interface ClauseSubject extends \upro\db\sql\SqlTextable
{
   /**
    * Creates an equals clause with given parameter
    * @param \upro\db\sql\clause\ClauseSubject $other to compare this subject to
    * @return \upro\db\sql\clause\Clause the resulting clause
    */
   function equals(\upro\db\sql\clause\ClauseSubject $other);

   /**
    * Creates an equals clause with given parameter
    * @param \upro\db\sql\ParameterBox $parameterBox to compare this subject to
    * @return \upro\db\sql\clause\Clause the resulting clause
    */
   function equalsParameter(\upro\db\sql\ParameterBox $parameterBox);
}

}
