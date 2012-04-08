<?php
require_once 'db/executor/StatementExecutor.php';

class TestStatementExecutor implements \upro\db\executor\StatementExecutor
{
   private $resultSet;

   private $closeCalled;

   function __construct($resultSet)
   {
      $this->resultSet = $resultSet;
      $this->closeCalled = false;
   }

   public function wasCloseCalled()
   {
      return $this->closeCalled;
   }

   /** {@inheritDoc} */
   public function close()
   {
      $this->closeCalled = true;
   }

   /** {@inheritDoc} */
   public function execute(\upro\db\executor\ResultSetHandler $handler)
   {
      $handler->handleResultSet($this->resultSet);
   }

}
