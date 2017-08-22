import '../polymer/polymer.js';
import '../iron-icon/iron-icon.js';
import '../iron-flex-layout/iron-flex-layout.js';
import { IronResizableBehavior } from '../iron-resizable-behavior/iron-resizable-behavior.js';
import '../paper-styles/default-theme.js';
import '../paper-styles/typography.js';
import { Polymer } from '../polymer/lib/legacy/polymer-fn.js';
import { dom } from '../polymer/lib/legacy/polymer.dom.js';
Polymer({
  _template: `
    <style>
      :host {
        display: block;
        position: absolute;
        outline: none;
      }

      :host([hidden]), [hidden] {
        display: none !important;
      }

      iron-icon {
        --iron-icon-width: 12px;
        --iron-icon-height: 12px;
      }

      .badge {
        @apply --layout;
        @apply --layout-center-center;
        @apply --paper-font-common-base;

        font-weight: normal;
        font-size: 11px;
        border-radius: 50%;
        margin-left: var(--paper-badge-margin-left, 0px);
        margin-bottom: var(--paper-badge-margin-bottom, 0px);
        width: var(--paper-badge-width, 20px);
        height: var(--paper-badge-height, 20px);
        background-color: var(--paper-badge-background, var(--accent-color));
        opacity: var(--paper-badge-opacity, 1.0);
        color: var(--paper-badge-text-color, white);

        @apply --paper-badge;
      }
    </style>

    <div class="badge">
      <iron-icon hidden\$="{{!_computeIsIconBadge(icon)}}" icon="{{icon}}"></iron-icon>
      <span id="badge-text" hidden\$="{{_computeIsIconBadge(icon)}}">{{label}}</span>
    </div>
`,

  is: 'paper-badge',

  hostAttributes: {
    role: 'status',
    tabindex: 0
  },

  behaviors: [
    IronResizableBehavior
  ],

  listeners: {
    'iron-resize': 'updatePosition'
  },

  properties: {
    /**
     * The id of the element that the badge is anchored to. This element
     * must be a sibling of the badge.
     */
    for: {
      type: String,
      observer: '_forChanged'
    },

    /**
     * The label displayed in the badge. The label is centered, and ideally
     * should have very few characters.
     */
    label: {
      type: String,
      observer: '_labelChanged'
    },

    /**
     * An iron-icon ID. When given, the badge content will use an
     * `<iron-icon>` element displaying the given icon ID rather than the
     * label text. However, the label text will still be used for
     * accessibility purposes.
     */
    icon: {
      type: String,
      value: ''
    },

    _boundNotifyResize: {
      type: Function,
      value: function() {
        return this.notifyResize.bind(this);
      }
    },

    _boundUpdateTarget: {
      type: Function,
      value: function() {
        return this._updateTarget.bind(this);
      }
    }
  },

  attached: function() {
    // Polymer 2.x does not have this.offsetParent defined by attached
    requestAnimationFrame(this._boundUpdateTarget);
  },

  attributeChanged: function (name) {
    if (name === 'hidden') {
      this.updatePosition();
    }
  },

  _forChanged: function() {
    // The first time the property is set is before the badge is attached,
    // which means we're not ready to position it yet.
    if (!this.isAttached) {
      return;
    }
    this._updateTarget();
  },

  _labelChanged: function() {
    this.setAttribute('aria-label', this.label);
  },

  _updateTarget: function() {
    this._target = this.target;
    requestAnimationFrame(this._boundNotifyResize);
  },

  _computeIsIconBadge: function(icon) {
    return icon.length > 0;
  },

  /**
   * Returns the target element that this badge is anchored to. It is
   * either the element given by the `for` attribute, or the immediate parent
   * of the badge.
   */
  get target () {
    var parentNode = dom(this).parentNode;
    // If the parentNode is a document fragment, then we need to use the host.
    var ownerRoot = dom(this).getOwnerRoot();
    var target;

    if (this.for) {
      target = dom(ownerRoot).querySelector('#' + this.for);
    } else {
      target = parentNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE ?
          ownerRoot.host : parentNode;
    }

    return target;
  },

  /**
   * Repositions the badge relative to its anchor element. This is called
   * automatically when the badge is attached or an `iron-resize` event is
   * fired (for exmaple if the window has resized, or your target is a
   * custom element that implements IronResizableBehavior).
   *
   * You should call this in all other cases when the achor's position
   * might have changed (for example, if it's visibility has changed, or
   * you've manually done a page re-layout).
   */
  updatePosition: function() {
    if (!this._target || !this.offsetParent) {
      return;
    }

    var parentRect = this.offsetParent.getBoundingClientRect();
    var targetRect = this._target.getBoundingClientRect();
    var thisRect = this.getBoundingClientRect();

    this.style.left = targetRect.left - parentRect.left +
        (targetRect.width - thisRect.width / 2) + 'px';
    this.style.top = targetRect.top - parentRect.top -
        (thisRect.height / 2) + 'px';
  }
})
