var assert = require('assert');
var should = require('should');
const Lang = require('../lang');

var lang = new Lang();

describe('Lang', function() {
  describe('#getLanguages()', function() {
    it('should return pl-PL and en-US languages', function() {
      var languages = lang.getLanguages();
      languages.length.should.not.be.below(2);
      languages.should.containEql('pl-PL');
      languages.should.containEql('en-US');
    });
  });
  describe('#getDirectionCodes()', function() {
    it('should return direction codes array of size of 8 with at least 1 alias', function() {
      var languages = lang.getLanguages();
      languages.forEach(function(language) {
        var directions = lang.getDirectionCodes(language);
        directions.should.have.length(8);
        directions.should.matchEach(function (d) {
          return d.length > 0;
        })
      });
    });
  });
  describe('#getDirections()', function() {
    it('should return flat array of directions for better speech recognition', function() {
      var languages = lang.getLanguages();
      languages.forEach(function(language) {
        var directions = lang.getDirections(language);
        // at least 1 spoken direction for every geographical direction required
        directions.length.should.not.be.below(8);
      });
    });
  });
});
