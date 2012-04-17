<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/SelectExpression.php';
require_once realpath(dirname(__FILE__)) . '/AbstractNameableSelectExpression.php';

/**
 * An alias select expression, decorating a nameable select expression
 */
class AliasSelectExpression implements \upro\db\sql\SelectExpression
{
   /**
    * The select expression to decorate
    * @var \upro\db\sql\AbstractNameableSelectExpression
    */
   private $selectExpression;

   /**
    * the alias name to use for the nameable
    * @var string
    */
   private $aliasName;

   /**
    * Constructor
    * @param \upro\db\sql\AbstractNameableSelectExpression $selectExpression the select expression to name
    * @param string $columnName name of the column
    */
   function __construct(\upro\db\sql\AbstractNameableSelectExpression $selectExpression, $aliasName)
   {
      $this->selectExpression = $selectExpression;
      $this->aliasName = $aliasName;
   }

   /** {@inheritDoc} */
   public function toSqlText(\upro\db\sql\SqlDictionary $dict)
   {
      $base = $this->selectExpression->toSqlText($dict);

      return $base->append(new \upro\db\sql\ParameterizedSqlText($this->aliasName), $dict->getAs());
   }
}

}
