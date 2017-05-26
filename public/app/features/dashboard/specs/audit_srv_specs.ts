import {describe, beforeEach, it, sinon, expect, angularMocks} from 'test/lib/common';

import helpers from 'test/specs/helpers';
import AuditSrv from '../audit/audit_srv';
import { versions, compare, restore } from 'test/mocks/audit-mocks';

describe('auditSrv', function() {
  var ctx = new helpers.ServiceTestContext();

  var versionsResponse = versions();
  var compareResponse = compare();
  var restoreResponse = restore;

  beforeEach(angularMocks.module('grafana.core'));
  beforeEach(angularMocks.module('grafana.services'));
  beforeEach(angularMocks.inject(function($httpBackend) {
    ctx.$httpBackend = $httpBackend;
    $httpBackend.whenRoute('GET', 'api/dashboards/db/:id/versions').respond(versionsResponse);
    $httpBackend.whenRoute('GET', 'api/dashboards/db/:id/compare/:original...:new').respond(compareResponse);
    $httpBackend.whenRoute('POST', 'api/dashboards/db/:id/restore')
      .respond(function(method, url, data, headers, params) {
        const parsedData = JSON.parse(data);
        return [200, restoreResponse(parsedData.version)];
      });
  }));
  beforeEach(ctx.createService('auditSrv'));

  describe('getAuditLog', function() {
    it('should return a versions array for the given dashboard id', function(done) {
      ctx.service.getAuditLog({ id: 1 }).then(function(versions) {
        expect(versions).to.eql(versionsResponse);
        done();
      });
      ctx.$httpBackend.flush();
    });

    it('should return an empty array when not given an id', function(done) {
      ctx.service.getAuditLog({ }).then(function(versions) {
        expect(versions).to.eql([]);
        done();
      });
      ctx.$httpBackend.flush();
    });

    it('should return an empty array when not given a dashboard', function(done) {
      ctx.service.getAuditLog().then(function(versions) {
        expect(versions).to.eql([]);
        done();
      });
      ctx.$httpBackend.flush();
    });
  });

  describe('compareVersions', function() {
    it('should return a diff object for the given dashboard revisions', function(done) {
      var compare = { original: 6, new: 4 };
      ctx.service.compareVersions({ id: 1 }, compare).then(function(response) {
        expect(response).to.eql(compareResponse);
        done();
      });
      ctx.$httpBackend.flush();
    });

    it('should return an empty object when not given an id', function(done) {
      var compare = { original: 6, new: 4 };
      ctx.service.compareVersions({ }, compare).then(function(response) {
        expect(response).to.eql({});
        done();
      });
      ctx.$httpBackend.flush();
    });
  });

  describe('restoreDashboard', function() {
    it('should return a success response given valid parameters', function(done) {
      var version = 6;
      ctx.service.restoreDashboard({ id: 1 }, version).then(function(response) {
        expect(response).to.eql(restoreResponse(version));
        done();
      });
      ctx.$httpBackend.flush();
    });

    it('should return an empty object when not given an id', function(done) {
      ctx.service.restoreDashboard({}, 6).then(function(response) {
        expect(response).to.eql({});
        done();
      });
      ctx.$httpBackend.flush();
    });
  });
});