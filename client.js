/**
 * dsh-chat-font-zoom-ad — browser half.
 *
 * Loaded by dsh-client-modules at /plugins/dsh-chat-font-zoom-ad/client.js and
 * executed through the vendored cordis Loader's lazy-CJS module table
 * (window.__ModuleLoader__.load).
 *
 * Registers a compact A− / A+ control in the composer tool row
 * (`conversation.input.right`). It changes the `text` font-size role of the
 * Client theme service — the same persisted setting as Settings → General →
 * Font size — so the choice survives restarts, and the conversation, markdown
 * headings and composer draft all follow the size the user picked.
 *
 * The control reads the live ThemeSnapshot and re-renders on `theme/change`
 * (so the host Ctrl +/− shortcuts and the Settings row keep it in sync) and on
 * `locale/change`. No Harness Client package is imported: React comes from the
 * browser module table and every visual token is a `--dsw-alias-*` theme
 * variable, so light/dark and third-party themes stay consistent.
 */

window.__ModuleLoader__.load({
  id: 'dsh-chat-font-zoom-ad',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** Locale namespace owned by this plugin. */
    const NS = 'chat-font-zoom';
    /** Font role changed by the control: conversation content and headings. */
    const ROLE = 'text';
    /** Mirrors the host's FONT_SIZE_SPECS for the `text` role. */
    const SPEC = Object.freeze({ min: 10, max: 22, fallback: 14 });

    /** Browser dictionaries registered into the Client locale service. */
    const DICTS = Object.freeze({
      en: Object.freeze({
        group: 'Chat font size',
        decrease: 'Decrease chat font size',
        increase: 'Increase chat font size',
      }),
      zh: Object.freeze({
        group: '聊天字体大小',
        decrease: '缩小聊天字体',
        increase: '放大聊天字体',
      }),
    });

    /**
     * Control styles. Colours, radii and the font stack come from the host
     * theme tokens; the class prefix keeps them out of host and plugin selectors.
     */
    const CSS = [
      '.dsh-cfz-root{display:inline-flex;align-items:center;gap:1px;height:28px;padding:0 2px;border-radius:var(--dsw-radius-sm,8px);color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-family);}',
      '.dsh-cfz-btn{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;margin:0;padding:0;border:0;border-radius:var(--dsw-radius-xs,4px);background:transparent;color:inherit;font:inherit;cursor:pointer;user-select:none;-webkit-user-select:none;}',
      '.dsh-cfz-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary);}',
      '.dsh-cfz-btn:disabled{opacity:.4;cursor:default;}',
      '.dsh-cfz-glyph{display:inline-flex;align-items:baseline;gap:1px;pointer-events:none;}',
      '.dsh-cfz-a{font-size:13px;line-height:1;}',
      '.dsh-cfz-mark{font-size:10px;line-height:1;opacity:.85;}',
      '.dsh-cfz-value{min-width:15px;text-align:center;font-size:12px;line-height:1;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);pointer-events:none;}',
    ].join('');

    /**
     * Mirror the theme service's `text` size and expose a revision counter, so
     * the rendered control refreshes on host-side changes without polling.
     * @param ctx - client cordis context carrying the `theme` service.
     * @returns revision feed plus the two size operations used by the control.
     */
    function createZoomStore(ctx) {
      const listeners = new Set();
      let revision = 0;
      const notify = () => {
        revision += 1;
        for (const listener of [...listeners]) {
          try {
            listener();
          } catch (error) {
            console.error('[chat-font-zoom] listener failed', error);
          }
        }
      };
      const read = () => {
        const snapshot = ctx.theme.getTheme();
        const value = snapshot && snapshot.fontSizes ? snapshot.fontSizes[ROLE] : undefined;
        return typeof value === 'number' ? value : SPEC.fallback;
      };
      const step = (delta) => {
        const current = read();
        const next = Math.min(SPEC.max, Math.max(SPEC.min, current + delta));
        if (next === current) return;
        try {
          ctx.theme.setFontSize(ROLE, next);
        } catch (error) {
          console.error('[chat-font-zoom] setFontSize failed', error);
          return;
        }
        notify();
      };
      return {
        getSnapshot: () => revision,
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        refresh: notify,
        read,
        step,
        dispose() {
          listeners.clear();
        },
      };
    }

    /**
     * Build one glyph pair: a capital A with a small − or + after it.
     * @param mark - the size mark after the A.
     * @returns the decorative glyph element.
     */
    function glyph(mark) {
      return h(
        'span',
        { className: 'dsh-cfz-glyph', 'aria-hidden': 'true' },
        h('span', { className: 'dsh-cfz-a' }, 'A'),
        h('span', { className: 'dsh-cfz-mark' }, mark),
      );
    }

    /**
     * Render the compact zoom control.
     * @param props - slot-composed props carrying the injected store and `t`.
     * @returns the control element tree.
     */
    function ZoomControl(props) {
      const store = props.store;
      const t = typeof props.t === 'function' ? props.t : (key) => key;
      React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
      const size = store.read();
      const hint = (label) => label + ' · ' + size + 'px';
      return h(
        'div',
        { className: 'dsh-cfz-root', role: 'group', 'aria-label': t('group') },
        h(
          'button',
          {
            type: 'button',
            className: 'dsh-cfz-btn',
            'aria-label': t('decrease'),
            title: hint(t('decrease')),
            disabled: size <= SPEC.min,
            onClick: () => store.step(-1),
          },
          glyph('\u2212'),
        ),
        h('span', { className: 'dsh-cfz-value', 'aria-hidden': 'true' }, size),
        h(
          'button',
          {
            type: 'button',
            className: 'dsh-cfz-btn',
            'aria-label': t('increase'),
            title: hint(t('increase')),
            disabled: size >= SPEC.max,
            onClick: () => store.step(1),
          },
          glyph('+'),
        ),
      );
    }

    /** Required Client services: slot registration, theme state, locale text. */
    const inject = ['slots', 'theme', 'locale'];

    /**
     * Client plugin body: register dictionaries and styles, keep the store in
     * sync with host-side theme changes, and mount the control.
     * @param ctx - client cordis context.
     */
    function apply(ctx) {
      ctx.effect(() => {
        const disposers = [
          ctx.locale.register(NS, 'en', DICTS.en),
          ctx.locale.register(NS, 'zh', DICTS.zh),
        ];
        return () => {
          for (const dispose of disposers) dispose();
        };
      }, 'chat-font-zoom-ad: dictionaries');

      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = 'dsh-chat-font-zoom-ad';
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'chat-font-zoom-ad: styles');

      const store = createZoomStore(ctx);
      ctx.effect(() => {
        const offTheme = ctx.on('theme/change', () => store.refresh());
        const offLocale = ctx.locale.subscribe(() => store.refresh());
        return () => {
          offTheme();
          offLocale();
          store.dispose();
        };
      }, 'chat-font-zoom-ad: refresh');

      const t = ctx.locale.bind(NS);
      try {
        ctx.slots.inject('conversation.input.right', () =>
          ctx.slots.register(
            {
              name: 'conversation.input.right',
              id: 'chat-font-zoom',
              order: 40,
              inject: () => ({ store, t }),
            },
            ZoomControl,
          ),
        );
      } catch (error) {
        console.error('[chat-font-zoom] control registration failed', error);
      }
    }

    return { inject, apply };
  },
});
