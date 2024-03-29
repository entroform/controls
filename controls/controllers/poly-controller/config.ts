import {
  AfterActionCallback,
  BeforeActionCallback,
  ConditionHook,
} from '../index';

import {
  PolyController,
} from './poly-controller';

import {
  PolyAction,
  PolyActionName,
} from './action-manager';

export interface PolyTriggerMap {
  trigger: HTMLElement;
  action: PolyActionName;
  payload?: string;
}

export interface PolyConfig {
  cooldown: number;

  deactivateAllOnOutsideAction: boolean;

  listenToKeydown: boolean;

  items: NodeListOf<HTMLElement> | HTMLElement[];

  isTrigger: (element: HTMLElement) => boolean;

  mapTriggerToAction: (trigger: HTMLElement) => PolyTriggerMap | false;

  getItemId: (item: HTMLElement) => string | false;

  conditionActivate: ConditionHook<PolyAction, PolyController>;
  conditionDeactivate: ConditionHook<PolyAction, PolyController>;
  conditionToggle: ConditionHook<PolyAction, PolyController>;

  conditionActivateAll: ConditionHook<PolyAction, PolyController>;
  conditionDeactivateAll: ConditionHook<PolyAction, PolyController>;
  conditionToggleAll: ConditionHook<PolyAction, PolyController>;

  beforeDeactivate: BeforeActionCallback<PolyAction, PolyController>;
  afterDeactivate: AfterActionCallback<PolyAction, PolyController>;

  itemIsActive: (item: HTMLElement, context: PolyController) => boolean;
  activateItem: (item: HTMLElement, context: PolyController) => void;
  deactivateItem: (item: HTMLElement, context: PolyController) => void;

  beforeActivate: BeforeActionCallback<PolyAction, PolyController>;
  afterActivate: AfterActionCallback<PolyAction, PolyController>;

  beforeAction: BeforeActionCallback<PolyAction, PolyController>;
  afterAction: AfterActionCallback<PolyAction, PolyController>;

  onOutsideAction: (context: PolyController) => void;

  onKeydown: (event: KeyboardEvent, context: PolyController) => void;
}

export const DEFAULT_CONFIG: PolyConfig = {
  cooldown: 200,

  deactivateAllOnOutsideAction: false,

  listenToKeydown: false,

  items: [],

  isTrigger: element => element.classList.contains('js-poly-item-trigger'),

  mapTriggerToAction: trigger => {
    switch(trigger.dataset.action) {
      case 'activate': {
        return {
          trigger,
          action: 'activate',
          payload: trigger.dataset.target,
        };
      }

      case 'deactivate': {
        return {
          trigger,
          action: 'deactivate',
          payload: trigger.dataset.target,
        };
      }
      
      case 'toggle': {
        return {
          trigger,
          action: 'toggle',
          payload: trigger.dataset.target,
        };
      }
      
      case 'activate-all': {
        return {
          trigger,
          action: 'activate-all',
        };
      }
      
      case 'deactivate-all': {
        return {
          trigger,
          action: 'deactivate-all',
        };
      }
      
      case 'toggle-all': {
        return {
          trigger,
          action: 'toggle-all',
        };
      }
    }

    return false;
  },

  getItemId: item => (typeof item.dataset.id === 'string' ? item.dataset.id : false),

  conditionActivate: () => true,
  conditionDeactivate: () => true,
  conditionToggle: () => true,

  conditionActivateAll: () => true,
  conditionDeactivateAll: () => true,
  conditionToggleAll: () => true,

  beforeDeactivate: () => Promise.resolve(),
  afterDeactivate: () => Promise.resolve(),

  itemIsActive: item => item.classList.contains('js-poly-item--active'),
  activateItem: item => item.classList.add('js-poly-item--active'),
  deactivateItem: item => item.classList.remove('js-poly-item--active'),

  beforeActivate: () => Promise.resolve(),
  afterActivate: () => Promise.resolve(),

  beforeAction: () => Promise.resolve(),
  afterAction: () => Promise.resolve(),

  onOutsideAction: () => {},
  onKeydown: () => {},
};
