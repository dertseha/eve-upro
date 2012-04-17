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
    * Creates a clause to check for NULL of the subject
    * @return \upro\db\sql\clause\Clause the resulting clause
    */
   function isNull();

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

   /**
    * Creates a greater clause with given parameter
    * @param \upro\db\sql\clause\ClauseSubject $other to compare this subject to
    * @return \upro\db\sql\clause\Clause the resulting clause
    */
   function isGreaterThan(\upro\db\sql\clause\ClauseSubject $other);

   /**
    * Creates a greater clause with given parameter
    * @param \upro\db\sql\ParameterBox $parameterBox to compare this subject to
    * @return \upro\db\sql\clause\Clause the resulting clause
    */
   function isGreaterThanParameter(\upro\db\sql\ParameterBox $parameterBox);

   /**
    * Creates a smaller clause with given parameter
    * @param \upro\db\sql\clause\ClauseSubject $other to compare this subject to
    * @return \upro\db\sql\clause\Clause the resulting clause
    */
   function isSmallerThan(\upro\db\sql\clause\ClauseSubject $other);

   /**
    * Creates a smaller clause with given parameter
    * @param \upro\db\sql\ParameterBox $parameterBox to compare this subject to
    * @return \upro\db\sql\clause\Clause the resulting clause
    */
   function isSmallerThanParameter(\upro\db\sql\ParameterBox $parameterBox);
}

}
