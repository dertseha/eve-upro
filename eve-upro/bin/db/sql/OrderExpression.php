<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlTextable.php';

/**
 * An order expression is specifying an order in a query
 */
interface OrderExpression extends \upro\db\sql\SqlTextable
{
   /**
    * Sets whether the orde shall be ascending
    * @param boolean $ascending true if the order shall be ascending or descending otherwise
    * @return \upro\db\sql\OrderExpression this
    */
   function ascending($ascending);
}

}
