<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlDictionary.php';
require_once realpath(dirname(__FILE__)) . '/ParameterizedSqlText.php';

/**
 * Anything that can be made into SQL text is an SqlTextable
 */
interface SqlTextable
{
   /**
    * Creates an SQL text representation of the implementing object, using given builder
    * @param \upro\db\sql\SqlDictionary $dict the dictionary to use
    * @return \upro\db\sql\ParameterizedSqlText the resulting SQL text
    */
   function toSqlText(\upro\db\sql\SqlDictionary $dict);
}

}
