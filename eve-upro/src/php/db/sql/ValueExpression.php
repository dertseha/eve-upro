<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlTextable.php';

/**
 * This expression provides a value for modifying statements (insert/update)
 */
interface ValueExpression extends \upro\db\sql\SqlTextable
{

}

}
