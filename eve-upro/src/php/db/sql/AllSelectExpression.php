<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SelectExpression.php';

/**
 * A select expression querying everything
 */
class AllSelectExpression implements \upro\db\sql\SelectExpression
{
   /**
    * Constructor
    * @param string $contextName name of the context
    */
   function __construct()
   {

   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $result = new \upro\db\sql\ParameterizedSqlText($dict->getAll());

      return $result;
   }

}

}
