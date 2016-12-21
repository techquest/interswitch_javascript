'use strict';

/**
 *  Test group for the send function
 **/

var chai = require('chai');
var expect = chai.expect;
var ISW = require('../index.js');

var client_id = "";
var client_secret = "";

describe("Send", function () {
    it('It should require a url parameter', function(){
        var isw = new ISW(client_id, client_secret);

    });
});