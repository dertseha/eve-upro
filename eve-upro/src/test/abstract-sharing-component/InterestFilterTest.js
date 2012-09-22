var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../../util/UuidFactory.js");
var Functional = require("../../util/Functional.js");

var busMessages = require('../../model/BusMessages.js');
var Character = require('../../character-agent-component/Character.js');
var CharacterAgentComponent = require('../../character-agent-component/CharacterAgentComponent.js');

var AbstractSharingComponent = require('../../abstract-sharing-component/AbstractSharingComponent.js');
var InterestFilter = require('../../abstract-sharing-component/InterestFilter.js');

var AbstractServiceComponentFixture = require('../TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

}

util.inherits(Fixture, AbstractServiceComponentFixture);

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   callback();
};

exports.testFilterFunctionForCharacter = function(test)
{
   var charId = 1234;
   var corpId = 5678;
   var char = new Character(charId, 'test', corpId);
   var predicate = InterestFilter.filterFunctionForCharacter(char);

   var input = [
   {
      scope: 'Group',
      id: 'abcd'
   },
   {
      scope: 'Character',
      id: charId
   },
   {
      scope: 'Corporation',
      id: 45345
   },
   {
      scope: 'Group',
      id: 'asdfasd'
   } ];
   var output = input.filter(predicate, []);

   test.deepEqual(output, [
   {
      scope: 'Character',
      id: charId
   } ]);

   test.done();

};
