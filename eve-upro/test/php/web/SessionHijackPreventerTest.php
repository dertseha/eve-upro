<?php
require_once 'io/ArrayValueStore.php';
require_once 'web/SessionHijackPreventer.php';
require_once 'web/RequestServerContext.php';

require_once 'TestEnvironment.php';

class SessionHijackPreventerTest extends PHPUnit_Framework_TestCase
{
   private $valueStoreArray;

   private $valueStore;

   private $requestServerContext;

   private $preventer;

   protected function givenASessionHijackPreventer()
   {
      $this->preventer = new \upro\web\SessionHijackPreventer($this->valueStore, $this->requestServerContext);
   }

   protected function givenAClient($address, $userAgent)
   {
      $this->requestServerContext->expects($this->any())->method('getRemoteAddress')->will($this->returnValue($address));
      $this->requestServerContext->expects($this->any())->method('getUserAgent')->will($this->returnValue($userAgent));
   }

   protected function whenValidating()
   {
      $this->preventer->validate();
   }

   protected function whenTheSessionIsInitializedWith($clientHash)
   {
      $this->valueStore->set(\upro\web\SessionHijackPreventer::STORE_SUBSET_NAME . \upro\web\SessionHijackPreventer::STORE_CLIENT_HASH_KEY, $clientHash);
   }

   protected function thenSessionVariableShouldBe($key, $value)
   {
      $result = $this->valueStore->get(\upro\web\SessionHijackPreventer::STORE_SUBSET_NAME . $key);

      $this->assertEquals($value, $result);
   }

   protected function thenSessionVariableShouldBeSet($key)
   {
      $result = $this->valueStore->get(\upro\web\SessionHijackPreventer::STORE_SUBSET_NAME . $key);

      $this->assertTrue(strlen($result) > 0);
   }

   protected function thenSessionShouldBeValid()
   {
      $result = $this->preventer->validate();

      $this->assertTrue($result);
   }

   protected function thenSessionShouldNotBeValid()
   {
      $result = $this->preventer->validate();

      $this->assertFalse($result);
   }

   protected function thenIdShouldBeSet()
   {
      $result = $this->preventer->getId();

      $this->assertTrue(strlen($result) > 0);
   }

   function setUp()
   {
      parent::setUp();

      TestEnvironment::initLogging($this->getName());

      $this->valueStoreArray = array();
      $this->valueStore = new \upro\io\ArrayValueStore($this->valueStoreArray);
      $this->requestServerContext = $this->getMock('\upro\web\RequestServerContext');
   }

   public function testSessionShouldBeValid_WhenNewClient()
   {
      $this->givenAClient('10.20.30.40', 'UberAgent Ver.9000');
      $this->givenASessionHijackPreventer();

      $this->thenSessionShouldBeValid();
   }

   public function testValidatedSessionShouldHaveParameterSet_WhenNewClient()
   {
      $this->givenAClient('10.20.30.40', 'UberAgent Ver.9000');
      $this->givenASessionHijackPreventer();

      $this->whenValidating();

      $this->thenSessionVariableShouldBe(\upro\web\SessionHijackPreventer::STORE_CLIENT_HASH_KEY, 'ba2e5576a0c074edc508d06637612ede');
   }

   public function testInitializedSessionShouldBeValid_WhenValid()
   {
      $this->givenAClient('10.20.30.40', 'UberAgent Ver.9000');
      $this->givenASessionHijackPreventer();

      $this->whenTheSessionIsInitializedWith('ba2e5576a0c074edc508d06637612ede');

      $this->thenSessionShouldBeValid();
   }

   public function testInitializedSessionShouldNotBeValid_WhenWrongHash()
   {
      $this->givenAClient('10.20.30.40', 'UberAgent Ver.9000');
      $this->givenASessionHijackPreventer();

      $this->whenTheSessionIsInitializedWith('InvalidHash');

      $this->thenSessionShouldNotBeValid();
   }

   public function testInitializedSessionShouldNotBeValid_WhenWrongIP()
   {
      $this->givenAClient('10.20.30.41', 'UberAgent Ver.9000');
      $this->givenASessionHijackPreventer();

      $this->whenTheSessionIsInitializedWith('ba2e5576a0c074edc508d06637612ede');

      $this->thenSessionShouldNotBeValid();
   }

   public function testInitializedSessionShouldNotBeValid_WhenWrongUserAgent()
   {
      $this->givenAClient('10.20.30.40', 'UberAgent Ver.8000');
      $this->givenASessionHijackPreventer();

      $this->whenTheSessionIsInitializedWith('ba2e5576a0c074edc508d06637612ede');

      $this->thenSessionShouldNotBeValid();
   }

   public function testValidatedSessionShouldHaveIdSet_WhenNewClient()
   {
      $this->givenAClient('10.20.30.40', 'UberAgent Ver.9000');
      $this->givenASessionHijackPreventer();

      $this->whenValidating();

      $this->thenSessionVariableShouldBeSet(\upro\web\SessionHijackPreventer::STORE_ID_KEY);
   }

   public function testGetIdShouldReturnValue_WhenValidClient()
   {
      $this->givenAClient('10.20.30.40', 'UberAgent Ver.9000');
      $this->givenASessionHijackPreventer();

      $this->whenValidating();

      $this->thenIdShouldBeSet();
   }
}