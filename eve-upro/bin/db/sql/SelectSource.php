<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlTextable.php';

/**
 * A source for a select query
 */
interface SelectSource extends \upro\db\sql\SqlTextable
{

}

}
