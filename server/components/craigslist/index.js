/**
 * Connection to Craigslist queries
 */

'use strict';

import request from 'request';
import jsdom from 'jsdom';
import _ from 'lodash';

module.exports = {

  clUrl : _.template('http://<%= city %>.craigslist.org/<%= uri %>'),
  cities : ['orangecounty','losangeles','boston','newyork','austin','sfbay','sandiego',
            'washingtondc','seattle','raleigh','spacecoast'],
  //cities : ['orangecounty','losangeles','boston'],

  jobs         : [],
  errors       : '',
  respCount    : 0,
  cback        : null,
  alreadySent  : false,
  resultCities : [],
  cb           : null,

  getSearchResults : function (qry,cb) {
    var qryParams = this.toQueryString(qry).replace('isTelecommuting','is_telecommuting')
        .replace('employmentType','employment_type');
    var srchUri = 'search/sof?' + qryParams;
    this.jobs = [];
    this.errors = '';
    this.alreadySent = false;
    var self=this;

    this.cback = function(errors, jobs) {
      //console.log('in cback', self.respCount, errors, jobs.length);
      self.respCount--;
      if (self.respCount <= 0 && !self.alreadySent) {
        self.alreadySent = true;
        cb(errors, jobs);
      }

    };

    if (this.respCount === 0) {
      this.respCount = this.cities.length;
      console.log('start conditions', this.jobs, this.errors, this.respCount);
      for (var c in this.cities) {
        var url = this.clUrl({ 'city' : this.cities[c], 'uri' : srchUri});
        request({uri: url, ctx : self}, this.processJobsResults);
      }
    }
  },

  getCities : function (cb) {
    this.resultCities = [];
    var url = this.clUrl({ 'city' : 'geo', 'uri' : 'iso/us'});
    this.cb = cb;
    var self=this;
    request({uri: url, ctx : self}, this.processCitiesResults);
  },

  processCitiesResults : function(err, response, body){
    var self = this.ctx;
    //Just a basic error check
    if(err && response.statusCode !== 200){
      console.log('Request error.');
      this.cb(err,response);
    }
    //Send the body param as the HTML code we will parse in jsdom
    //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
    return jsdom.env({
        html: body,
        scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
        done : function(err, body){
          //console.log('getCities, this cities',self.resultCities);
          if (err) {
          } else {
            if (!self.clipBlock(body.document.body.innerHTML) ) {
              //Use jQuery just as in a regular HTML page
              var $ = body.jQuery;

              var cityRows = body.document.getElementById('list');
              var cityItems = cityRows.getElementsByTagName('li');
              for (var c in cityItems) {
                var anchor = cityItems[c].getElementsByTagName('a');
                var link = anchor[0].getAttribute('href');
                var cName = anchor[0].textContent.trim();
                var searchCity = link.replace(/\//g,'').split('.')[0].trim();

                var city = {
                  name       : cName,
                  link       : link,
                  searchCity : self.cities.indexOf(searchCity) >= 0
                };

                self.resultCities.push(city);
              }
            }
          }
          self.cb(err,self.resultCities);
        }
    });
 },

  processJobsResults : function (err, response, body) {
    var self = this.ctx;
    //console.log('response', response.request.uri.host);
    //Just a basic error check
    if(err && response.statusCode !== 200){
      console.log('Request error.');
      this.cback(err,response);
    }
    //Send the body param as the HTML code we will parse in jsdom
    //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
    jsdom.env({
        html: body,
        scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
        done :  function(err, window){
            if (err) {
              self.errors += err;
            } else {
              if (!self.clipBlock(window.document.body.innerHTML) ) {
                var theCity = response.request.uri.host.split('.')[0];
                //Use jQuery just as in a regular HTML page
                var $ = window.jQuery;
                var jobRows = window.document.getElementsByClassName('row');
                for (var j in jobRows) {
                  // $('.row').find('.txt time').attr('datetime')
                  var spanTxt = jobRows[j].getElementsByClassName('txt');
                  var time = Date.parse(spanTxt[0].getElementsByTagName('time')[0]
                                .getAttribute('datetime'));
                  // $('.row').find('.txt .pl .hdrlnk #titletextonly')
                  var pl = spanTxt[0].getElementsByClassName('pl');
                  var hdrlnk = pl[0].getElementsByClassName('hdrlnk');
                  //$('.row .txt .l2 .pnr small').html()
                  var l2 = spanTxt[0].getElementsByClassName('l2');
                  var pnr = l2[0].getElementsByClassName('pnr');
                  var small = pnr[0].getElementsByTagName('small');
                  var link = hdrlnk[0].getAttribute('href');
                  link = link.indexOf('//')>=0 ? link :
                    'http://' + response.request.uri.host + link;
                  //console.log('link',link,response.request.uri.host);
                  var job = {
                    city : theCity,
                    source: 'Craigslist',
                    description : hdrlnk[0].textContent.trim(),
                    when : time,
                    location : pnr[0].textContent.replace('map','').replace('img','')
                                  .replace('pic','').trim(),
                    link : link,
                    jobid : hdrlnk[0].getAttribute('data-id')
                  };

                  self.jobs.push(job);
                }
              }
            }
            self.cback(self.errors,self.jobs);
        }
    });
  },

 toQueryString : function (obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
  },

 clipBlock : function (response) {
    // This IP has been automatically blocked.
    return response.indexOf('This IP has been automatically blocked') >=0;
 }

}


