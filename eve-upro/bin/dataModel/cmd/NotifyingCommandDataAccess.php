<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../WriteAccess.php';
require_once realpath(dirname(__FILE__)) . '/NotificationConverter.php';
require_once realpath(dirname(__FILE__)) . '/CommandDataAccess.php';

/**
 * A CommandDataAccess adapter, binding WriteAccess and a NotificationConverter.
 * Every modification request is sent to the contained writer and also converted to a message for a history entry
 */
class NotifyingCommandDataAccess implements CommandDataAccess
{
   /**
    * The write access to use for data modification
    * @var \upro\dataModel\WriteAccess
    */
   private $writeAccess;

   /**
    * The converter to use for history entries
    * @var \upro\dataModel\cmd\NotificationConverter
    */
   private $converter;

   /**
    * Constructor
    * @param \upro\dataModel\WriteAccess $writeAccess the write access to use for data modifications
    * @param \upro\dataModel\cmd\NotificationConverter $converter the converter to use for history entries
    */
   function __construct(\upro\dataModel\WriteAccess $writeAccess, \upro\dataModel\cmd\NotificationConverter $converter)
   {
      $this->writeAccess = $writeAccess;
      $this->converter = $converter;
   }

   /** {@inheritDoc} */
   function retrieveDataEntry(\upro\dataModel\DataEntryId $entryId)
   {
      return $this->writeAccess->retrieveDataEntry($entryId);
   }

   /** {@inheritDoc} */
   function notifyDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId)
   {
      $message = $this->converter->getCreateDataEntry($entryId, $data);

      $this->writeAccess->addHistoryEntry($message, $contextId);
   }

   /** {@inheritDoc} */
	function createDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId)
	{
	   $message = $this->converter->getCreateDataEntry($entryId, $data);

	   $this->writeAccess->createDataEntry($entryId, $data, $contextId);
	   $this->writeAccess->addHistoryEntry($message, $contextId);
	}

   /** {@inheritDoc} */
	function updateDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId)
	{
	   $message = $this->converter->getUpdateDataEntry($entryId, $data);

	   $this->writeAccess->updateDataEntry($entryId, $data);
	   $this->writeAccess->addHistoryEntry($message, $contextId);
	}

	/** {@inheritDoc} */
	function deleteDataEntry(\upro\dataModel\DataEntryId $entryId, \upro\dataModel\DataEntryId $contextId)
	{
	   $message = $this->converter->getDeleteDataEntry($entryId);

	   $this->writeAccess->deleteDataEntry($entryId);
	   $this->writeAccess->addHistoryEntry($message, $contextId);
	}

}

}