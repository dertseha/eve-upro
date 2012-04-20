<?php
require_once 'dataModel/cmd/NotificationConverter.php';

class TestNotificationConverter implements \upro\dataModel\cmd\NotificationConverter
{
   public function getCreateDataEntry(\upro\dataModel\DataEntryId $entryId, $data)
   {
      return 'CREATE ' . $entryId->toString(); // . ' Data: ' . http_build_query($data);
   }

   public function getUpdateDataEntry(\upro\dataModel\DataEntryId $entryId, $data)
   {
      return 'UPDATE ' . $entryId->toString();
   }

   public function getDeleteDataEntry(\upro\dataModel\DataEntryId $entryId)
   {
      return 'DELETE ' . $entryId->toString();
   }

}
