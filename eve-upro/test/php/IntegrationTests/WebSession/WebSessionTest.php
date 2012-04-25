<?php
require_once 'TestEnvironment.php';

class WebSessionTest extends PHPUnit_Extensions_SeleniumTestCase
{
   protected function givenAllCookiesAreCleared()
   {
      $this->deleteAllVisibleCookies();
   }

   protected function whenLoadingThePage()
   {
      $this->open(TestEnvironment::getIntegrationTestUrl() . 'WebSession/index.php');
   }

   protected function thenFieldShouldContainText($fieldId, $expected)
   {
      $value = $this->getText($fieldId);

      $this->assertEquals($expected, $value);
   }

   public function setUp()
   {
      if (TestEnvironment::isSeleniumAvailable())
      {
         $this->setBrowser(TestEnvironment::getSeleniumTestBrowser());
         $this->setBrowserUrl(TestEnvironment::getIntegrationTestUrl());
      }
      else
      {
         $this->markTestSkipped();
      }
   }

   public function testAccessToPageShouldBePossible_WhenTestEnvironmentIsSetUp()
   {
      $this->open(TestEnvironment::getIntegrationTestUrl() . 'WebSession/index.php');

      $text = $this->getText('//title');
      $this->assertEquals('upro - WebSession Test', $text);
   }

   public function testVisitCountShouldBe1_WhenVisitingTheFirstTime()
   {
      $this->givenAllCookiesAreCleared();

      $this->whenLoadingThePage();

      $this->thenFieldShouldContainText('visitCount', '1');
   }

   public function testVisitCountShouldBe2_WhenVisitingTheSecondTime()
   {
      $this->givenAllCookiesAreCleared();

      $this->whenLoadingThePage();
      $this->whenLoadingThePage();

      $this->thenFieldShouldContainText('visitCount', '2');
   }

   public function testSessionShouldBeValid_WhenVisitingTheFirstTime()
   {
      $this->givenAllCookiesAreCleared();

      $this->whenLoadingThePage();

      $this->thenFieldShouldContainText('sessionValid', 'valid');
   }

   public function testSessionShouldBeValid_WhenVisitingTheSecondTime()
   {
      $this->givenAllCookiesAreCleared();

      $this->whenLoadingThePage();
      $this->whenLoadingThePage();

      $this->thenFieldShouldContainText('sessionValid', 'valid');
   }
}