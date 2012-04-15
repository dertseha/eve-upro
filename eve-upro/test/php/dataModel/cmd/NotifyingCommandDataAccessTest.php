<?php
require_once 'dataModel/cmd/NotificationConverter.php';
require_once 'dataModel/cmd/NotifyingCommandDataAccess.php';
require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/WriteAccess.php';
require_once 'Uuid.php';

class NotifyingCommandDataAccessContextTest extends PHPUnit_Framework_TestCase
{
   private $writeAccess;

   private $converter;

   private $dataAccess;

   protected function givenANotifyingCommandDataAccess()
   {
      $dataAccessFactory = $this->getMock('\upro\dataModel\cmd\GroupAccessFactory');

      $this->writeAccess = $this->getMock('\upro\dataModel\WriteAccess');
      $this->converter = $this->getMock('\upro\dataModel\cmd\NotificationConverter');
      $this->dataAccess = new \upro\dataModel\cmd\NotifyingCommandDataAccess($this->writeAccess,
            $this->converter, $dataAccessFactory);
   }

   protected function expectingHistoryToBeWritten($message, $contextId)
   {
      $this->writeAccess->expects($this->once())->method('addHistoryEntry')
         ->with($this->equalTo($message), $this->equalTo($contextId));
   }

   protected function expectingCreateConversion($entryId, $data, $result)
   {
      $this->converter->expects($this->once())->method('getCreateDataEntry')
         ->with($this->equalTo($entryId), $this->equalTo($data))->will($this->returnValue($result));
   }

   protected function expectingUpdateConversion($entryId, $data, $result)
   {
      $this->converter->expects($this->once())->method('getUpdateDataEntry')
         ->with($this->equalTo($entryId), $this->equalTo($data))->will($this->returnValue($result));
   }

   protected function expectingDeleteConversion($entryId, $result)
   {
      $this->converter->expects($this->once())->method('getDeleteDataEntry')
         ->with($this->equalTo($entryId))->will($this->returnValue($result));
   }

   protected function expectingCreateEntry($entryId, $data, $contextId)
   {
      $this->writeAccess->expects($this->once())->method('createDataEntry')
         ->with($this->equalTo($entryId), $this->equalTo($data), $this->equalTo($contextId));
   }

   protected function expectingUpdateEntry($entryId, $data)
   {
      $this->writeAccess->expects($this->once())->method('updateDataEntry')
         ->with($this->equalTo($entryId), $this->equalTo($data));
   }

   protected function expectingDeleteEntry($entryId)
   {
      $this->writeAccess->expects($this->once())->method('deleteDataEntry')
         ->with($this->equalTo($entryId));
   }

   protected function whenCallingNotifyDataEntry($entryId, $data, $contextId)
   {
      $this->dataAccess->notifyDataEntry($entryId, $data, $contextId);
   }

   protected function whenCallingCreateDataEntry($entryId, $data, $contextId)
   {
      $this->dataAccess->createDataEntry($entryId, $data, $contextId);
   }

   protected function whenCallingUpdateDataEntry($entryId, $data, $contextId)
   {
      $this->dataAccess->updateDataEntry($entryId, $data, $contextId);
   }

   protected function whenCallingDeleteDataEntry($entryId, $contextId)
   {
      $this->dataAccess->deleteDataEntry($entryId, $contextId);
   }

   public function setUp()
   {
      parent::setUp();

   }

   public function testHistoryIsWritten_WhenNotifyingDataEntry()
   {
      $entryId = new \upro\dataModel\DataEntryId('Test', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Context', \Uuid::v4());
      $data = array('Property1' => 'Value1', 'Property2' => 'Value2');
      $message = 'TestMessage';

      $this->givenANotifyingCommandDataAccess();

      $this->expectingCreateConversion($entryId, $data, $message);
      $this->expectingHistoryToBeWritten($message, $contextId);

      $this->whenCallingNotifyDataEntry($entryId, $data, $contextId);
   }

   public function testHistoryIsWritten_WhenCreatingDataEntry()
   {
      $entryId = new \upro\dataModel\DataEntryId('Test', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Context', \Uuid::v4());
      $data = array('Property1' => 'Value1', 'Property2' => 'Value2');
      $message = 'TestMessage';

      $this->givenANotifyingCommandDataAccess();

      $this->expectingCreateConversion($entryId, $data, $message);
      $this->expectingHistoryToBeWritten($message, $contextId);

      $this->whenCallingCreateDataEntry($entryId, $data, $contextId);
   }

   public function testHistoryIsWritten_WhenUpdatingDataEntry()
   {
      $entryId = new \upro\dataModel\DataEntryId('Test', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Context', \Uuid::v4());
      $data = array('Property1' => 'Value1', 'Property2' => 'Value2');
      $message = 'TestMessage';

      $this->givenANotifyingCommandDataAccess();

      $this->expectingUpdateConversion($entryId, $data, $message);
      $this->expectingHistoryToBeWritten($message, $contextId);

      $this->whenCallingUpdateDataEntry($entryId, $data, $contextId);
   }

   public function testHistoryIsWritten_WhenDeletingDataEntry()
   {
      $entryId = new \upro\dataModel\DataEntryId('Test', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Context', \Uuid::v4());
      $data = array('Property1' => 'Value1', 'Property2' => 'Value2');
      $message = 'TestMessage';

      $this->givenANotifyingCommandDataAccess();

      $this->expectingDeleteConversion($entryId, $message);
      $this->expectingHistoryToBeWritten($message, $contextId);

      $this->whenCallingDeleteDataEntry($entryId, $contextId);
   }

   public function testDataEntryCreated_WhenCreatingDataEntry()
   {
      $entryId = new \upro\dataModel\DataEntryId('Test', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Context', \Uuid::v4());
      $data = array('Property1' => 'Value1', 'Property2' => 'Value2');
      $message = 'TestMessage';

      $this->givenANotifyingCommandDataAccess();

      $this->expectingCreateEntry($entryId, $data, $contextId);

      $this->whenCallingCreateDataEntry($entryId, $data, $contextId);
   }

   public function testDataEntryUpdated_WhenUpdatingDataEntry()
   {
      $entryId = new \upro\dataModel\DataEntryId('Test', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Context', \Uuid::v4());
      $data = array('Property1' => 'Value1', 'Property2' => 'Value2');
      $message = 'TestMessage';

      $this->givenANotifyingCommandDataAccess();

      $this->expectingUpdateEntry($entryId, $data);

      $this->whenCallingUpdateDataEntry($entryId, $data, $contextId);
   }

   public function testDataEntryDeleted_WhenDeletingDataEntry()
   {
      $entryId = new \upro\dataModel\DataEntryId('Test', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Context', \Uuid::v4());
      $data = array('Property1' => 'Value1', 'Property2' => 'Value2');
      $message = 'TestMessage';

      $this->givenANotifyingCommandDataAccess();

      $this->expectingDeleteEntry($entryId);

      $this->whenCallingDeleteDataEntry($entryId, $contextId);
   }
}