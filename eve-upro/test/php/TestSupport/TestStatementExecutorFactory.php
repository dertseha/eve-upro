<?php
require_once 'db/executor/StatementExecutorFactory.php';
require_once 'db/executor/StatementExecutor.php';

class TestStatementExecutorFactory implements \upro\db\executor\StatementExecutorFactory
{
   private $calls;

   private $executorByCallIndex;

   private $queriesByCallIndex;

   function __construct()
   {
      $this->executorByCallIndex = array();
      $this->queriesByCallIndex = array();
      $this->calls = 0;
   }

   public function setExecutor($callIndex, $executor)
   {
      $this->executorByCallIndex[$callIndex] = $executor;
   }

   public function getQuery($callIndex)
   {
      return $this->queriesByCallIndex[$callIndex];
   }

   /** {@inheritDoc} */
   public function getExecutor(\upro\db\sql\Query $query)
   {
      $callIndex = $this->calls++;

      $this->queriesByCallIndex[$callIndex] = $query;

      return $this->executorByCallIndex[$callIndex];
   }

}
