<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlTextable.php';

/**
 * A query is the base interface for executable queries
 */
interface Query extends \upro\db\sql\SqlTextable
{

}

}
