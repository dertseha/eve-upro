<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlTextable.php';

/**
 * A select expression is specifying a column of a SELECT query
 */
interface SelectExpression extends \upro\db\sql\SqlTextable
{

}

}
