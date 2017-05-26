///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import coreModule from '../core_module';

export class DeltaCtrl {
  observer: any;

  constructor(private $rootScope) {
    const waitForCompile = function(mutations) {
      if (mutations.length === 1) {
        this.$rootScope.appEvent('json-diff-ready');
      }
    };

    this.observer = new MutationObserver(waitForCompile.bind(this));

    const observerConfig = {
      attributes: true,
      attributeFilter: ['class'],
      characterData: false,
      childList: true,
      subtree: false,
    };

    this.observer.observe(angular.element('.delta-html')[0], observerConfig);
  }

  $onDestroy() {
    this.observer.disconnect();
  }
}

export function delta() {
  return {
    controller: DeltaCtrl,
    replace: false,
    restrict: 'A',
  };
}
coreModule.directive('diffDelta', delta);

// Link to JSON line number
export class LinkJSONCtrl {
  /** @ngInject */
  constructor(private $scope, private $rootScope, private $anchorScroll) {}

  goToLine(line: number) {
    let unbind;

    const scroll = () => {
      this.$anchorScroll(`l${line}`);
      unbind();
    };

    this.$scope.switchView().then(() => {
      unbind = this.$rootScope.$on('json-diff-ready', scroll.bind(this));
    });
  }
}

export function linkJson() {
  return {
    controller: LinkJSONCtrl,
    controllerAs: 'ctrl',
    replace: true,
    restrict: 'E',
    scope: {
      line: '@lineDisplay',
      link: '@lineLink',
      switchView: '&',
    },
    templateUrl: 'public/app/features/dashboard/audit/partials/link-json.html',
  };
}
coreModule.directive('diffLinkJson', linkJson);