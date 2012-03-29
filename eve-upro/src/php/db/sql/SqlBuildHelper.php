<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SqlTextable.php';
require_once realpath(dirname(__FILE__)) . '/SqlDictionary.php';

/**
 * A helper for building SQL texts
 */
class SqlBuildHelper
{
   /**
    * Joins a list of textables
    * @param \upro\db\sql\SqlDictionary $dict dictionary to use for the textables
    * @param array $textables to join up. Requires at least one entry
    * @return \upro\db\sql\SqlTextable result
    */
   public static function joinList(\upro\db\sql\SqlDictionary $dict, $textables)
   {
      $amount = count($textables);
      $result = $textables[0]->toSqlText($dict);

      for ($i = 1; $i < $amount; $i++)
      {
         $result = $result->append($textables[$i]->toSqlText($dict), ', ');
      }

      return $result;
   }

}

}
