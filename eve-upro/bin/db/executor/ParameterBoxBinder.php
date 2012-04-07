<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/../PreparedStatement.php';
require_once realpath(dirname(__FILE__)) . '/../sql/ParameterBox.php';
require_once realpath(dirname(__FILE__)) . '/../sql/ParameterBoxObserver.php';


/**
 * A ParameterBox binder implements the observer interface to automatically set
 * parameters in a prepared statement.
 */
class ParameterBoxBinder implements \upro\db\sql\ParameterBoxObserver
{
   /**
    * @var \upro\db\PreparedStatement the prepared statement to set
    */
   private $statement;

   /**
    * @var int the index of the parameter
    */
   private $index;

   /**
    * Constructor
    * @param \upro\db\PreparedStatement $statement the statement to set
    * @param int $index the index of the parameter
    */
   function __construct(\upro\db\PreparedStatement $statement, $index)
   {
      $this->statement = $statement;
      $this->index = $index;
   }

   /** {@inheritDoc} */
   public function onValueChanged($value)
   {
      $this->statement->setParameter($this->index, $value);
   }

   /**
    * Sets the paremeter box this binder is for
    * @param \upro\db\sql\ParameterBox $box to use
    */
   public function forBox(\upro\db\sql\ParameterBox $box)
   {
      $box->addObserver($this);
   }
}

}