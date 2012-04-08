<?php
namespace upro\db\executor
{
require_once realpath(dirname(__FILE__)) . '/StatementExecutor.php';
require_once realpath(dirname(__FILE__)) . '/../sql/Query.php';


/**
 * A factory for statement executors
 */
interface StatementExecutorFactory
{
   /**
    * Returns an executor for given query
    * @param \upro\db\sql\Query $query for which an executor shall be created
    * @return \upro\db\executor\StatementExecutor the corresponding executor
    */
   function getExecutor(\upro\db\sql\Query $query);
}

}