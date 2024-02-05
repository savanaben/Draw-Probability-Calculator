
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$3() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$3;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$3;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop$3;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash$2(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash$2(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop$3, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop$3,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$3;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop$3;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop$3) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$3) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$3;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // colorStore.js

    const groupColors = writable({});

    var top = 'top';
    var bottom = 'bottom';
    var right = 'right';
    var left = 'left';
    var auto = 'auto';
    var basePlacements = [top, bottom, right, left];
    var start = 'start';
    var end$1 = 'end';
    var clippingParents = 'clippingParents';
    var viewport = 'viewport';
    var popper = 'popper';
    var reference = 'reference';
    var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
      return acc.concat([placement + "-" + start, placement + "-" + end$1]);
    }, []);
    var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
      return acc.concat([placement, placement + "-" + start, placement + "-" + end$1]);
    }, []); // modifiers that need to read the DOM

    var beforeRead = 'beforeRead';
    var read = 'read';
    var afterRead = 'afterRead'; // pure-logic modifiers

    var beforeMain = 'beforeMain';
    var main = 'main';
    var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

    var beforeWrite = 'beforeWrite';
    var write = 'write';
    var afterWrite = 'afterWrite';
    var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

    function getNodeName(element) {
      return element ? (element.nodeName || '').toLowerCase() : null;
    }

    function getWindow(node) {
      if (node == null) {
        return window;
      }

      if (node.toString() !== '[object Window]') {
        var ownerDocument = node.ownerDocument;
        return ownerDocument ? ownerDocument.defaultView || window : window;
      }

      return node;
    }

    function isElement(node) {
      var OwnElement = getWindow(node).Element;
      return node instanceof OwnElement || node instanceof Element;
    }

    function isHTMLElement(node) {
      var OwnElement = getWindow(node).HTMLElement;
      return node instanceof OwnElement || node instanceof HTMLElement;
    }

    function isShadowRoot(node) {
      // IE 11 has no ShadowRoot
      if (typeof ShadowRoot === 'undefined') {
        return false;
      }

      var OwnElement = getWindow(node).ShadowRoot;
      return node instanceof OwnElement || node instanceof ShadowRoot;
    }

    // and applies them to the HTMLElements such as popper and arrow

    function applyStyles(_ref) {
      var state = _ref.state;
      Object.keys(state.elements).forEach(function (name) {
        var style = state.styles[name] || {};
        var attributes = state.attributes[name] || {};
        var element = state.elements[name]; // arrow is optional + virtual elements

        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        } // Flow doesn't support to extend this property, but it's the most
        // effective way to apply styles to an HTMLElement
        // $FlowFixMe[cannot-write]


        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (name) {
          var value = attributes[name];

          if (value === false) {
            element.removeAttribute(name);
          } else {
            element.setAttribute(name, value === true ? '' : value);
          }
        });
      });
    }

    function effect$2(_ref2) {
      var state = _ref2.state;
      var initialStyles = {
        popper: {
          position: state.options.strategy,
          left: '0',
          top: '0',
          margin: '0'
        },
        arrow: {
          position: 'absolute'
        },
        reference: {}
      };
      Object.assign(state.elements.popper.style, initialStyles.popper);
      state.styles = initialStyles;

      if (state.elements.arrow) {
        Object.assign(state.elements.arrow.style, initialStyles.arrow);
      }

      return function () {
        Object.keys(state.elements).forEach(function (name) {
          var element = state.elements[name];
          var attributes = state.attributes[name] || {};
          var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

          var style = styleProperties.reduce(function (style, property) {
            style[property] = '';
            return style;
          }, {}); // arrow is optional + virtual elements

          if (!isHTMLElement(element) || !getNodeName(element)) {
            return;
          }

          Object.assign(element.style, style);
          Object.keys(attributes).forEach(function (attribute) {
            element.removeAttribute(attribute);
          });
        });
      };
    } // eslint-disable-next-line import/no-unused-modules


    var applyStyles$1 = {
      name: 'applyStyles',
      enabled: true,
      phase: 'write',
      fn: applyStyles,
      effect: effect$2,
      requires: ['computeStyles']
    };

    function getBasePlacement(placement) {
      return placement.split('-')[0];
    }

    var max = Math.max;
    var min = Math.min;
    var round = Math.round;

    function getUAString() {
      var uaData = navigator.userAgentData;

      if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
        return uaData.brands.map(function (item) {
          return item.brand + "/" + item.version;
        }).join(' ');
      }

      return navigator.userAgent;
    }

    function isLayoutViewport() {
      return !/^((?!chrome|android).)*safari/i.test(getUAString());
    }

    function getBoundingClientRect(element, includeScale, isFixedStrategy) {
      if (includeScale === void 0) {
        includeScale = false;
      }

      if (isFixedStrategy === void 0) {
        isFixedStrategy = false;
      }

      var clientRect = element.getBoundingClientRect();
      var scaleX = 1;
      var scaleY = 1;

      if (includeScale && isHTMLElement(element)) {
        scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
        scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
      }

      var _ref = isElement(element) ? getWindow(element) : window,
          visualViewport = _ref.visualViewport;

      var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
      var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
      var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
      var width = clientRect.width / scaleX;
      var height = clientRect.height / scaleY;
      return {
        width: width,
        height: height,
        top: y,
        right: x + width,
        bottom: y + height,
        left: x,
        x: x,
        y: y
      };
    }

    // means it doesn't take into account transforms.

    function getLayoutRect(element) {
      var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
      // Fixes https://github.com/popperjs/popper-core/issues/1223

      var width = element.offsetWidth;
      var height = element.offsetHeight;

      if (Math.abs(clientRect.width - width) <= 1) {
        width = clientRect.width;
      }

      if (Math.abs(clientRect.height - height) <= 1) {
        height = clientRect.height;
      }

      return {
        x: element.offsetLeft,
        y: element.offsetTop,
        width: width,
        height: height
      };
    }

    function contains(parent, child) {
      var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

      if (parent.contains(child)) {
        return true;
      } // then fallback to custom implementation with Shadow DOM support
      else if (rootNode && isShadowRoot(rootNode)) {
          var next = child;

          do {
            if (next && parent.isSameNode(next)) {
              return true;
            } // $FlowFixMe[prop-missing]: need a better way to handle this...


            next = next.parentNode || next.host;
          } while (next);
        } // Give up, the result is false


      return false;
    }

    function getComputedStyle$1(element) {
      return getWindow(element).getComputedStyle(element);
    }

    function isTableElement(element) {
      return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
    }

    function getDocumentElement(element) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
      element.document) || window.document).documentElement;
    }

    function getParentNode(element) {
      if (getNodeName(element) === 'html') {
        return element;
      }

      return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
        // $FlowFixMe[incompatible-return]
        // $FlowFixMe[prop-missing]
        element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
        element.parentNode || ( // DOM Element detected
        isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
        // $FlowFixMe[incompatible-call]: HTMLElement is a Node
        getDocumentElement(element) // fallback

      );
    }

    function getTrueOffsetParent(element) {
      if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
      getComputedStyle$1(element).position === 'fixed') {
        return null;
      }

      return element.offsetParent;
    } // `.offsetParent` reports `null` for fixed elements, while absolute elements
    // return the containing block


    function getContainingBlock(element) {
      var isFirefox = /firefox/i.test(getUAString());
      var isIE = /Trident/i.test(getUAString());

      if (isIE && isHTMLElement(element)) {
        // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
        var elementCss = getComputedStyle$1(element);

        if (elementCss.position === 'fixed') {
          return null;
        }
      }

      var currentNode = getParentNode(element);

      if (isShadowRoot(currentNode)) {
        currentNode = currentNode.host;
      }

      while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
        var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
        // create a containing block.
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

        if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
          return currentNode;
        } else {
          currentNode = currentNode.parentNode;
        }
      }

      return null;
    } // Gets the closest ancestor positioned element. Handles some edge cases,
    // such as table ancestors and cross browser bugs.


    function getOffsetParent(element) {
      var window = getWindow(element);
      var offsetParent = getTrueOffsetParent(element);

      while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
        offsetParent = getTrueOffsetParent(offsetParent);
      }

      if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
        return window;
      }

      return offsetParent || getContainingBlock(element) || window;
    }

    function getMainAxisFromPlacement(placement) {
      return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
    }

    function within(min$1, value, max$1) {
      return max(min$1, min(value, max$1));
    }
    function withinMaxClamp(min, value, max) {
      var v = within(min, value, max);
      return v > max ? max : v;
    }

    function getFreshSideObject() {
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
    }

    function mergePaddingObject(paddingObject) {
      return Object.assign({}, getFreshSideObject(), paddingObject);
    }

    function expandToHashMap(value, keys) {
      return keys.reduce(function (hashMap, key) {
        hashMap[key] = value;
        return hashMap;
      }, {});
    }

    var toPaddingObject = function toPaddingObject(padding, state) {
      padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
        placement: state.placement
      })) : padding;
      return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    };

    function arrow(_ref) {
      var _state$modifiersData$;

      var state = _ref.state,
          name = _ref.name,
          options = _ref.options;
      var arrowElement = state.elements.arrow;
      var popperOffsets = state.modifiersData.popperOffsets;
      var basePlacement = getBasePlacement(state.placement);
      var axis = getMainAxisFromPlacement(basePlacement);
      var isVertical = [left, right].indexOf(basePlacement) >= 0;
      var len = isVertical ? 'height' : 'width';

      if (!arrowElement || !popperOffsets) {
        return;
      }

      var paddingObject = toPaddingObject(options.padding, state);
      var arrowRect = getLayoutRect(arrowElement);
      var minProp = axis === 'y' ? top : left;
      var maxProp = axis === 'y' ? bottom : right;
      var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
      var startDiff = popperOffsets[axis] - state.rects.reference[axis];
      var arrowOffsetParent = getOffsetParent(arrowElement);
      var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
      var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
      // outside of the popper bounds

      var min = paddingObject[minProp];
      var max = clientSize - arrowRect[len] - paddingObject[maxProp];
      var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
      var offset = within(min, center, max); // Prevents breaking syntax highlighting...

      var axisProp = axis;
      state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
    }

    function effect$1(_ref2) {
      var state = _ref2.state,
          options = _ref2.options;
      var _options$element = options.element,
          arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

      if (arrowElement == null) {
        return;
      } // CSS selector


      if (typeof arrowElement === 'string') {
        arrowElement = state.elements.popper.querySelector(arrowElement);

        if (!arrowElement) {
          return;
        }
      }

      if (!contains(state.elements.popper, arrowElement)) {
        return;
      }

      state.elements.arrow = arrowElement;
    } // eslint-disable-next-line import/no-unused-modules


    var arrow$1 = {
      name: 'arrow',
      enabled: true,
      phase: 'main',
      fn: arrow,
      effect: effect$1,
      requires: ['popperOffsets'],
      requiresIfExists: ['preventOverflow']
    };

    function getVariation(placement) {
      return placement.split('-')[1];
    }

    var unsetSides = {
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto'
    }; // Round the offsets to the nearest suitable subpixel based on the DPR.
    // Zooming can change the DPR, but it seems to report a value that will
    // cleanly divide the values into the appropriate subpixels.

    function roundOffsetsByDPR(_ref, win) {
      var x = _ref.x,
          y = _ref.y;
      var dpr = win.devicePixelRatio || 1;
      return {
        x: round(x * dpr) / dpr || 0,
        y: round(y * dpr) / dpr || 0
      };
    }

    function mapToStyles(_ref2) {
      var _Object$assign2;

      var popper = _ref2.popper,
          popperRect = _ref2.popperRect,
          placement = _ref2.placement,
          variation = _ref2.variation,
          offsets = _ref2.offsets,
          position = _ref2.position,
          gpuAcceleration = _ref2.gpuAcceleration,
          adaptive = _ref2.adaptive,
          roundOffsets = _ref2.roundOffsets,
          isFixed = _ref2.isFixed;
      var _offsets$x = offsets.x,
          x = _offsets$x === void 0 ? 0 : _offsets$x,
          _offsets$y = offsets.y,
          y = _offsets$y === void 0 ? 0 : _offsets$y;

      var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
        x: x,
        y: y
      }) : {
        x: x,
        y: y
      };

      x = _ref3.x;
      y = _ref3.y;
      var hasX = offsets.hasOwnProperty('x');
      var hasY = offsets.hasOwnProperty('y');
      var sideX = left;
      var sideY = top;
      var win = window;

      if (adaptive) {
        var offsetParent = getOffsetParent(popper);
        var heightProp = 'clientHeight';
        var widthProp = 'clientWidth';

        if (offsetParent === getWindow(popper)) {
          offsetParent = getDocumentElement(popper);

          if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
            heightProp = 'scrollHeight';
            widthProp = 'scrollWidth';
          }
        } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


        offsetParent = offsetParent;

        if (placement === top || (placement === left || placement === right) && variation === end$1) {
          sideY = bottom;
          var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
          offsetParent[heightProp];
          y -= offsetY - popperRect.height;
          y *= gpuAcceleration ? 1 : -1;
        }

        if (placement === left || (placement === top || placement === bottom) && variation === end$1) {
          sideX = right;
          var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
          offsetParent[widthProp];
          x -= offsetX - popperRect.width;
          x *= gpuAcceleration ? 1 : -1;
        }
      }

      var commonStyles = Object.assign({
        position: position
      }, adaptive && unsetSides);

      var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
        x: x,
        y: y
      }, getWindow(popper)) : {
        x: x,
        y: y
      };

      x = _ref4.x;
      y = _ref4.y;

      if (gpuAcceleration) {
        var _Object$assign;

        return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
      }

      return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
    }

    function computeStyles(_ref5) {
      var state = _ref5.state,
          options = _ref5.options;
      var _options$gpuAccelerat = options.gpuAcceleration,
          gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
          _options$adaptive = options.adaptive,
          adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
          _options$roundOffsets = options.roundOffsets,
          roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
      var commonStyles = {
        placement: getBasePlacement(state.placement),
        variation: getVariation(state.placement),
        popper: state.elements.popper,
        popperRect: state.rects.popper,
        gpuAcceleration: gpuAcceleration,
        isFixed: state.options.strategy === 'fixed'
      };

      if (state.modifiersData.popperOffsets != null) {
        state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
          offsets: state.modifiersData.popperOffsets,
          position: state.options.strategy,
          adaptive: adaptive,
          roundOffsets: roundOffsets
        })));
      }

      if (state.modifiersData.arrow != null) {
        state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
          offsets: state.modifiersData.arrow,
          position: 'absolute',
          adaptive: false,
          roundOffsets: roundOffsets
        })));
      }

      state.attributes.popper = Object.assign({}, state.attributes.popper, {
        'data-popper-placement': state.placement
      });
    } // eslint-disable-next-line import/no-unused-modules


    var computeStyles$1 = {
      name: 'computeStyles',
      enabled: true,
      phase: 'beforeWrite',
      fn: computeStyles,
      data: {}
    };

    var passive = {
      passive: true
    };

    function effect(_ref) {
      var state = _ref.state,
          instance = _ref.instance,
          options = _ref.options;
      var _options$scroll = options.scroll,
          scroll = _options$scroll === void 0 ? true : _options$scroll,
          _options$resize = options.resize,
          resize = _options$resize === void 0 ? true : _options$resize;
      var window = getWindow(state.elements.popper);
      var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.addEventListener('scroll', instance.update, passive);
        });
      }

      if (resize) {
        window.addEventListener('resize', instance.update, passive);
      }

      return function () {
        if (scroll) {
          scrollParents.forEach(function (scrollParent) {
            scrollParent.removeEventListener('scroll', instance.update, passive);
          });
        }

        if (resize) {
          window.removeEventListener('resize', instance.update, passive);
        }
      };
    } // eslint-disable-next-line import/no-unused-modules


    var eventListeners = {
      name: 'eventListeners',
      enabled: true,
      phase: 'write',
      fn: function fn() {},
      effect: effect,
      data: {}
    };

    var hash$1 = {
      left: 'right',
      right: 'left',
      bottom: 'top',
      top: 'bottom'
    };
    function getOppositePlacement(placement) {
      return placement.replace(/left|right|bottom|top/g, function (matched) {
        return hash$1[matched];
      });
    }

    var hash = {
      start: 'end',
      end: 'start'
    };
    function getOppositeVariationPlacement(placement) {
      return placement.replace(/start|end/g, function (matched) {
        return hash[matched];
      });
    }

    function getWindowScroll(node) {
      var win = getWindow(node);
      var scrollLeft = win.pageXOffset;
      var scrollTop = win.pageYOffset;
      return {
        scrollLeft: scrollLeft,
        scrollTop: scrollTop
      };
    }

    function getWindowScrollBarX(element) {
      // If <html> has a CSS width greater than the viewport, then this will be
      // incorrect for RTL.
      // Popper 1 is broken in this case and never had a bug report so let's assume
      // it's not an issue. I don't think anyone ever specifies width on <html>
      // anyway.
      // Browsers where the left scrollbar doesn't cause an issue report `0` for
      // this (e.g. Edge 2019, IE11, Safari)
      return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
    }

    function getViewportRect(element, strategy) {
      var win = getWindow(element);
      var html = getDocumentElement(element);
      var visualViewport = win.visualViewport;
      var width = html.clientWidth;
      var height = html.clientHeight;
      var x = 0;
      var y = 0;

      if (visualViewport) {
        width = visualViewport.width;
        height = visualViewport.height;
        var layoutViewport = isLayoutViewport();

        if (layoutViewport || !layoutViewport && strategy === 'fixed') {
          x = visualViewport.offsetLeft;
          y = visualViewport.offsetTop;
        }
      }

      return {
        width: width,
        height: height,
        x: x + getWindowScrollBarX(element),
        y: y
      };
    }

    // of the `<html>` and `<body>` rect bounds if horizontally scrollable

    function getDocumentRect(element) {
      var _element$ownerDocumen;

      var html = getDocumentElement(element);
      var winScroll = getWindowScroll(element);
      var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
      var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
      var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
      var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
      var y = -winScroll.scrollTop;

      if (getComputedStyle$1(body || html).direction === 'rtl') {
        x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
      }

      return {
        width: width,
        height: height,
        x: x,
        y: y
      };
    }

    function isScrollParent(element) {
      // Firefox wants us to check `-x` and `-y` variations as well
      var _getComputedStyle = getComputedStyle$1(element),
          overflow = _getComputedStyle.overflow,
          overflowX = _getComputedStyle.overflowX,
          overflowY = _getComputedStyle.overflowY;

      return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
    }

    function getScrollParent(node) {
      if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
        // $FlowFixMe[incompatible-return]: assume body is always available
        return node.ownerDocument.body;
      }

      if (isHTMLElement(node) && isScrollParent(node)) {
        return node;
      }

      return getScrollParent(getParentNode(node));
    }

    /*
    given a DOM element, return the list of all scroll parents, up the list of ancesors
    until we get to the top window object. This list is what we attach scroll listeners
    to, because if any of these parent elements scroll, we'll need to re-calculate the
    reference element's position.
    */

    function listScrollParents(element, list) {
      var _element$ownerDocumen;

      if (list === void 0) {
        list = [];
      }

      var scrollParent = getScrollParent(element);
      var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
      var win = getWindow(scrollParent);
      var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
      var updatedList = list.concat(target);
      return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target)));
    }

    function rectToClientRect(rect) {
      return Object.assign({}, rect, {
        left: rect.x,
        top: rect.y,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height
      });
    }

    function getInnerBoundingClientRect(element, strategy) {
      var rect = getBoundingClientRect(element, false, strategy === 'fixed');
      rect.top = rect.top + element.clientTop;
      rect.left = rect.left + element.clientLeft;
      rect.bottom = rect.top + element.clientHeight;
      rect.right = rect.left + element.clientWidth;
      rect.width = element.clientWidth;
      rect.height = element.clientHeight;
      rect.x = rect.left;
      rect.y = rect.top;
      return rect;
    }

    function getClientRectFromMixedType(element, clippingParent, strategy) {
      return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
    } // A "clipping parent" is an overflowable container with the characteristic of
    // clipping (or hiding) overflowing elements with a position different from
    // `initial`


    function getClippingParents(element) {
      var clippingParents = listScrollParents(getParentNode(element));
      var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
      var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

      if (!isElement(clipperElement)) {
        return [];
      } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


      return clippingParents.filter(function (clippingParent) {
        return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
      });
    } // Gets the maximum area that the element is visible in due to any number of
    // clipping parents


    function getClippingRect(element, boundary, rootBoundary, strategy) {
      var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
      var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
      var firstClippingParent = clippingParents[0];
      var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
        var rect = getClientRectFromMixedType(element, clippingParent, strategy);
        accRect.top = max(rect.top, accRect.top);
        accRect.right = min(rect.right, accRect.right);
        accRect.bottom = min(rect.bottom, accRect.bottom);
        accRect.left = max(rect.left, accRect.left);
        return accRect;
      }, getClientRectFromMixedType(element, firstClippingParent, strategy));
      clippingRect.width = clippingRect.right - clippingRect.left;
      clippingRect.height = clippingRect.bottom - clippingRect.top;
      clippingRect.x = clippingRect.left;
      clippingRect.y = clippingRect.top;
      return clippingRect;
    }

    function computeOffsets(_ref) {
      var reference = _ref.reference,
          element = _ref.element,
          placement = _ref.placement;
      var basePlacement = placement ? getBasePlacement(placement) : null;
      var variation = placement ? getVariation(placement) : null;
      var commonX = reference.x + reference.width / 2 - element.width / 2;
      var commonY = reference.y + reference.height / 2 - element.height / 2;
      var offsets;

      switch (basePlacement) {
        case top:
          offsets = {
            x: commonX,
            y: reference.y - element.height
          };
          break;

        case bottom:
          offsets = {
            x: commonX,
            y: reference.y + reference.height
          };
          break;

        case right:
          offsets = {
            x: reference.x + reference.width,
            y: commonY
          };
          break;

        case left:
          offsets = {
            x: reference.x - element.width,
            y: commonY
          };
          break;

        default:
          offsets = {
            x: reference.x,
            y: reference.y
          };
      }

      var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

      if (mainAxis != null) {
        var len = mainAxis === 'y' ? 'height' : 'width';

        switch (variation) {
          case start:
            offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
            break;

          case end$1:
            offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
            break;
        }
      }

      return offsets;
    }

    function detectOverflow(state, options) {
      if (options === void 0) {
        options = {};
      }

      var _options = options,
          _options$placement = _options.placement,
          placement = _options$placement === void 0 ? state.placement : _options$placement,
          _options$strategy = _options.strategy,
          strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
          _options$boundary = _options.boundary,
          boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
          _options$rootBoundary = _options.rootBoundary,
          rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
          _options$elementConte = _options.elementContext,
          elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
          _options$altBoundary = _options.altBoundary,
          altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
          _options$padding = _options.padding,
          padding = _options$padding === void 0 ? 0 : _options$padding;
      var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
      var altContext = elementContext === popper ? reference : popper;
      var popperRect = state.rects.popper;
      var element = state.elements[altBoundary ? altContext : elementContext];
      var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
      var referenceClientRect = getBoundingClientRect(state.elements.reference);
      var popperOffsets = computeOffsets({
        reference: referenceClientRect,
        element: popperRect,
        strategy: 'absolute',
        placement: placement
      });
      var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
      var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
      // 0 or negative = within the clipping rect

      var overflowOffsets = {
        top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
        bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
        left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
        right: elementClientRect.right - clippingClientRect.right + paddingObject.right
      };
      var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

      if (elementContext === popper && offsetData) {
        var offset = offsetData[placement];
        Object.keys(overflowOffsets).forEach(function (key) {
          var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
          var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
          overflowOffsets[key] += offset[axis] * multiply;
        });
      }

      return overflowOffsets;
    }

    function computeAutoPlacement(state, options) {
      if (options === void 0) {
        options = {};
      }

      var _options = options,
          placement = _options.placement,
          boundary = _options.boundary,
          rootBoundary = _options.rootBoundary,
          padding = _options.padding,
          flipVariations = _options.flipVariations,
          _options$allowedAutoP = _options.allowedAutoPlacements,
          allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
      var variation = getVariation(placement);
      var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
        return getVariation(placement) === variation;
      }) : basePlacements;
      var allowedPlacements = placements$1.filter(function (placement) {
        return allowedAutoPlacements.indexOf(placement) >= 0;
      });

      if (allowedPlacements.length === 0) {
        allowedPlacements = placements$1;
      } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


      var overflows = allowedPlacements.reduce(function (acc, placement) {
        acc[placement] = detectOverflow(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          padding: padding
        })[getBasePlacement(placement)];
        return acc;
      }, {});
      return Object.keys(overflows).sort(function (a, b) {
        return overflows[a] - overflows[b];
      });
    }

    function getExpandedFallbackPlacements(placement) {
      if (getBasePlacement(placement) === auto) {
        return [];
      }

      var oppositePlacement = getOppositePlacement(placement);
      return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
    }

    function flip(_ref) {
      var state = _ref.state,
          options = _ref.options,
          name = _ref.name;

      if (state.modifiersData[name]._skip) {
        return;
      }

      var _options$mainAxis = options.mainAxis,
          checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
          _options$altAxis = options.altAxis,
          checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
          specifiedFallbackPlacements = options.fallbackPlacements,
          padding = options.padding,
          boundary = options.boundary,
          rootBoundary = options.rootBoundary,
          altBoundary = options.altBoundary,
          _options$flipVariatio = options.flipVariations,
          flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
          allowedAutoPlacements = options.allowedAutoPlacements;
      var preferredPlacement = state.options.placement;
      var basePlacement = getBasePlacement(preferredPlacement);
      var isBasePlacement = basePlacement === preferredPlacement;
      var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
      var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
        return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          padding: padding,
          flipVariations: flipVariations,
          allowedAutoPlacements: allowedAutoPlacements
        }) : placement);
      }, []);
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var checksMap = new Map();
      var makeFallbackChecks = true;
      var firstFittingPlacement = placements[0];

      for (var i = 0; i < placements.length; i++) {
        var placement = placements[i];

        var _basePlacement = getBasePlacement(placement);

        var isStartVariation = getVariation(placement) === start;
        var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
        var len = isVertical ? 'width' : 'height';
        var overflow = detectOverflow(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          altBoundary: altBoundary,
          padding: padding
        });
        var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

        if (referenceRect[len] > popperRect[len]) {
          mainVariationSide = getOppositePlacement(mainVariationSide);
        }

        var altVariationSide = getOppositePlacement(mainVariationSide);
        var checks = [];

        if (checkMainAxis) {
          checks.push(overflow[_basePlacement] <= 0);
        }

        if (checkAltAxis) {
          checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
        }

        if (checks.every(function (check) {
          return check;
        })) {
          firstFittingPlacement = placement;
          makeFallbackChecks = false;
          break;
        }

        checksMap.set(placement, checks);
      }

      if (makeFallbackChecks) {
        // `2` may be desired in some cases – research later
        var numberOfChecks = flipVariations ? 3 : 1;

        var _loop = function _loop(_i) {
          var fittingPlacement = placements.find(function (placement) {
            var checks = checksMap.get(placement);

            if (checks) {
              return checks.slice(0, _i).every(function (check) {
                return check;
              });
            }
          });

          if (fittingPlacement) {
            firstFittingPlacement = fittingPlacement;
            return "break";
          }
        };

        for (var _i = numberOfChecks; _i > 0; _i--) {
          var _ret = _loop(_i);

          if (_ret === "break") break;
        }
      }

      if (state.placement !== firstFittingPlacement) {
        state.modifiersData[name]._skip = true;
        state.placement = firstFittingPlacement;
        state.reset = true;
      }
    } // eslint-disable-next-line import/no-unused-modules


    var flip$1 = {
      name: 'flip',
      enabled: true,
      phase: 'main',
      fn: flip,
      requiresIfExists: ['offset'],
      data: {
        _skip: false
      }
    };

    function getSideOffsets(overflow, rect, preventedOffsets) {
      if (preventedOffsets === void 0) {
        preventedOffsets = {
          x: 0,
          y: 0
        };
      }

      return {
        top: overflow.top - rect.height - preventedOffsets.y,
        right: overflow.right - rect.width + preventedOffsets.x,
        bottom: overflow.bottom - rect.height + preventedOffsets.y,
        left: overflow.left - rect.width - preventedOffsets.x
      };
    }

    function isAnySideFullyClipped(overflow) {
      return [top, right, bottom, left].some(function (side) {
        return overflow[side] >= 0;
      });
    }

    function hide(_ref) {
      var state = _ref.state,
          name = _ref.name;
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var preventedOffsets = state.modifiersData.preventOverflow;
      var referenceOverflow = detectOverflow(state, {
        elementContext: 'reference'
      });
      var popperAltOverflow = detectOverflow(state, {
        altBoundary: true
      });
      var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
      var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
      var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
      var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
      state.modifiersData[name] = {
        referenceClippingOffsets: referenceClippingOffsets,
        popperEscapeOffsets: popperEscapeOffsets,
        isReferenceHidden: isReferenceHidden,
        hasPopperEscaped: hasPopperEscaped
      };
      state.attributes.popper = Object.assign({}, state.attributes.popper, {
        'data-popper-reference-hidden': isReferenceHidden,
        'data-popper-escaped': hasPopperEscaped
      });
    } // eslint-disable-next-line import/no-unused-modules


    var hide$1 = {
      name: 'hide',
      enabled: true,
      phase: 'main',
      requiresIfExists: ['preventOverflow'],
      fn: hide
    };

    function distanceAndSkiddingToXY(placement, rects, offset) {
      var basePlacement = getBasePlacement(placement);
      var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

      var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
        placement: placement
      })) : offset,
          skidding = _ref[0],
          distance = _ref[1];

      skidding = skidding || 0;
      distance = (distance || 0) * invertDistance;
      return [left, right].indexOf(basePlacement) >= 0 ? {
        x: distance,
        y: skidding
      } : {
        x: skidding,
        y: distance
      };
    }

    function offset(_ref2) {
      var state = _ref2.state,
          options = _ref2.options,
          name = _ref2.name;
      var _options$offset = options.offset,
          offset = _options$offset === void 0 ? [0, 0] : _options$offset;
      var data = placements.reduce(function (acc, placement) {
        acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
        return acc;
      }, {});
      var _data$state$placement = data[state.placement],
          x = _data$state$placement.x,
          y = _data$state$placement.y;

      if (state.modifiersData.popperOffsets != null) {
        state.modifiersData.popperOffsets.x += x;
        state.modifiersData.popperOffsets.y += y;
      }

      state.modifiersData[name] = data;
    } // eslint-disable-next-line import/no-unused-modules


    var offset$1 = {
      name: 'offset',
      enabled: true,
      phase: 'main',
      requires: ['popperOffsets'],
      fn: offset
    };

    function popperOffsets(_ref) {
      var state = _ref.state,
          name = _ref.name;
      // Offsets are the actual position the popper needs to have to be
      // properly positioned near its reference element
      // This is the most basic placement, and will be adjusted by
      // the modifiers in the next step
      state.modifiersData[name] = computeOffsets({
        reference: state.rects.reference,
        element: state.rects.popper,
        strategy: 'absolute',
        placement: state.placement
      });
    } // eslint-disable-next-line import/no-unused-modules


    var popperOffsets$1 = {
      name: 'popperOffsets',
      enabled: true,
      phase: 'read',
      fn: popperOffsets,
      data: {}
    };

    function getAltAxis(axis) {
      return axis === 'x' ? 'y' : 'x';
    }

    function preventOverflow(_ref) {
      var state = _ref.state,
          options = _ref.options,
          name = _ref.name;
      var _options$mainAxis = options.mainAxis,
          checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
          _options$altAxis = options.altAxis,
          checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
          boundary = options.boundary,
          rootBoundary = options.rootBoundary,
          altBoundary = options.altBoundary,
          padding = options.padding,
          _options$tether = options.tether,
          tether = _options$tether === void 0 ? true : _options$tether,
          _options$tetherOffset = options.tetherOffset,
          tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
      var overflow = detectOverflow(state, {
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        altBoundary: altBoundary
      });
      var basePlacement = getBasePlacement(state.placement);
      var variation = getVariation(state.placement);
      var isBasePlacement = !variation;
      var mainAxis = getMainAxisFromPlacement(basePlacement);
      var altAxis = getAltAxis(mainAxis);
      var popperOffsets = state.modifiersData.popperOffsets;
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
        placement: state.placement
      })) : tetherOffset;
      var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
        mainAxis: tetherOffsetValue,
        altAxis: tetherOffsetValue
      } : Object.assign({
        mainAxis: 0,
        altAxis: 0
      }, tetherOffsetValue);
      var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
      var data = {
        x: 0,
        y: 0
      };

      if (!popperOffsets) {
        return;
      }

      if (checkMainAxis) {
        var _offsetModifierState$;

        var mainSide = mainAxis === 'y' ? top : left;
        var altSide = mainAxis === 'y' ? bottom : right;
        var len = mainAxis === 'y' ? 'height' : 'width';
        var offset = popperOffsets[mainAxis];
        var min$1 = offset + overflow[mainSide];
        var max$1 = offset - overflow[altSide];
        var additive = tether ? -popperRect[len] / 2 : 0;
        var minLen = variation === start ? referenceRect[len] : popperRect[len];
        var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
        // outside the reference bounds

        var arrowElement = state.elements.arrow;
        var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
          width: 0,
          height: 0
        };
        var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
        var arrowPaddingMin = arrowPaddingObject[mainSide];
        var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
        // to include its full size in the calculation. If the reference is small
        // and near the edge of a boundary, the popper can overflow even if the
        // reference is not overflowing as well (e.g. virtual elements with no
        // width or height)

        var arrowLen = within(0, referenceRect[len], arrowRect[len]);
        var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
        var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
        var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
        var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
        var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
        var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
        var tetherMax = offset + maxOffset - offsetModifierValue;
        var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
        popperOffsets[mainAxis] = preventedOffset;
        data[mainAxis] = preventedOffset - offset;
      }

      if (checkAltAxis) {
        var _offsetModifierState$2;

        var _mainSide = mainAxis === 'x' ? top : left;

        var _altSide = mainAxis === 'x' ? bottom : right;

        var _offset = popperOffsets[altAxis];

        var _len = altAxis === 'y' ? 'height' : 'width';

        var _min = _offset + overflow[_mainSide];

        var _max = _offset - overflow[_altSide];

        var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

        var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

        var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

        var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

        var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

        popperOffsets[altAxis] = _preventedOffset;
        data[altAxis] = _preventedOffset - _offset;
      }

      state.modifiersData[name] = data;
    } // eslint-disable-next-line import/no-unused-modules


    var preventOverflow$1 = {
      name: 'preventOverflow',
      enabled: true,
      phase: 'main',
      fn: preventOverflow,
      requiresIfExists: ['offset']
    };

    function getHTMLElementScroll(element) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }

    function getNodeScroll(node) {
      if (node === getWindow(node) || !isHTMLElement(node)) {
        return getWindowScroll(node);
      } else {
        return getHTMLElementScroll(node);
      }
    }

    function isElementScaled(element) {
      var rect = element.getBoundingClientRect();
      var scaleX = round(rect.width) / element.offsetWidth || 1;
      var scaleY = round(rect.height) / element.offsetHeight || 1;
      return scaleX !== 1 || scaleY !== 1;
    } // Returns the composite rect of an element relative to its offsetParent.
    // Composite means it takes into account transforms as well as layout.


    function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
      if (isFixed === void 0) {
        isFixed = false;
      }

      var isOffsetParentAnElement = isHTMLElement(offsetParent);
      var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
      var documentElement = getDocumentElement(offsetParent);
      var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
      var scroll = {
        scrollLeft: 0,
        scrollTop: 0
      };
      var offsets = {
        x: 0,
        y: 0
      };

      if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
        if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
        isScrollParent(documentElement)) {
          scroll = getNodeScroll(offsetParent);
        }

        if (isHTMLElement(offsetParent)) {
          offsets = getBoundingClientRect(offsetParent, true);
          offsets.x += offsetParent.clientLeft;
          offsets.y += offsetParent.clientTop;
        } else if (documentElement) {
          offsets.x = getWindowScrollBarX(documentElement);
        }
      }

      return {
        x: rect.left + scroll.scrollLeft - offsets.x,
        y: rect.top + scroll.scrollTop - offsets.y,
        width: rect.width,
        height: rect.height
      };
    }

    function order(modifiers) {
      var map = new Map();
      var visited = new Set();
      var result = [];
      modifiers.forEach(function (modifier) {
        map.set(modifier.name, modifier);
      }); // On visiting object, check for its dependencies and visit them recursively

      function sort(modifier) {
        visited.add(modifier.name);
        var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
        requires.forEach(function (dep) {
          if (!visited.has(dep)) {
            var depModifier = map.get(dep);

            if (depModifier) {
              sort(depModifier);
            }
          }
        });
        result.push(modifier);
      }

      modifiers.forEach(function (modifier) {
        if (!visited.has(modifier.name)) {
          // check for visited object
          sort(modifier);
        }
      });
      return result;
    }

    function orderModifiers(modifiers) {
      // order based on dependencies
      var orderedModifiers = order(modifiers); // order based on phase

      return modifierPhases.reduce(function (acc, phase) {
        return acc.concat(orderedModifiers.filter(function (modifier) {
          return modifier.phase === phase;
        }));
      }, []);
    }

    function debounce(fn) {
      var pending;
      return function () {
        if (!pending) {
          pending = new Promise(function (resolve) {
            Promise.resolve().then(function () {
              pending = undefined;
              resolve(fn());
            });
          });
        }

        return pending;
      };
    }

    function mergeByName(modifiers) {
      var merged = modifiers.reduce(function (merged, current) {
        var existing = merged[current.name];
        merged[current.name] = existing ? Object.assign({}, existing, current, {
          options: Object.assign({}, existing.options, current.options),
          data: Object.assign({}, existing.data, current.data)
        }) : current;
        return merged;
      }, {}); // IE11 does not support Object.values

      return Object.keys(merged).map(function (key) {
        return merged[key];
      });
    }

    var DEFAULT_OPTIONS = {
      placement: 'bottom',
      modifiers: [],
      strategy: 'absolute'
    };

    function areValidElements() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return !args.some(function (element) {
        return !(element && typeof element.getBoundingClientRect === 'function');
      });
    }

    function popperGenerator(generatorOptions) {
      if (generatorOptions === void 0) {
        generatorOptions = {};
      }

      var _generatorOptions = generatorOptions,
          _generatorOptions$def = _generatorOptions.defaultModifiers,
          defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
          _generatorOptions$def2 = _generatorOptions.defaultOptions,
          defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
      return function createPopper(reference, popper, options) {
        if (options === void 0) {
          options = defaultOptions;
        }

        var state = {
          placement: 'bottom',
          orderedModifiers: [],
          options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
          modifiersData: {},
          elements: {
            reference: reference,
            popper: popper
          },
          attributes: {},
          styles: {}
        };
        var effectCleanupFns = [];
        var isDestroyed = false;
        var instance = {
          state: state,
          setOptions: function setOptions(setOptionsAction) {
            var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
            cleanupModifierEffects();
            state.options = Object.assign({}, defaultOptions, state.options, options);
            state.scrollParents = {
              reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
              popper: listScrollParents(popper)
            }; // Orders the modifiers based on their dependencies and `phase`
            // properties

            var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

            state.orderedModifiers = orderedModifiers.filter(function (m) {
              return m.enabled;
            });
            runModifierEffects();
            return instance.update();
          },
          // Sync update – it will always be executed, even if not necessary. This
          // is useful for low frequency updates where sync behavior simplifies the
          // logic.
          // For high frequency updates (e.g. `resize` and `scroll` events), always
          // prefer the async Popper#update method
          forceUpdate: function forceUpdate() {
            if (isDestroyed) {
              return;
            }

            var _state$elements = state.elements,
                reference = _state$elements.reference,
                popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
            // anymore

            if (!areValidElements(reference, popper)) {
              return;
            } // Store the reference and popper rects to be read by modifiers


            state.rects = {
              reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
              popper: getLayoutRect(popper)
            }; // Modifiers have the ability to reset the current update cycle. The
            // most common use case for this is the `flip` modifier changing the
            // placement, which then needs to re-run all the modifiers, because the
            // logic was previously ran for the previous placement and is therefore
            // stale/incorrect

            state.reset = false;
            state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
            // is filled with the initial data specified by the modifier. This means
            // it doesn't persist and is fresh on each update.
            // To ensure persistent data, use `${name}#persistent`

            state.orderedModifiers.forEach(function (modifier) {
              return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
            });

            for (var index = 0; index < state.orderedModifiers.length; index++) {
              if (state.reset === true) {
                state.reset = false;
                index = -1;
                continue;
              }

              var _state$orderedModifie = state.orderedModifiers[index],
                  fn = _state$orderedModifie.fn,
                  _state$orderedModifie2 = _state$orderedModifie.options,
                  _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
                  name = _state$orderedModifie.name;

              if (typeof fn === 'function') {
                state = fn({
                  state: state,
                  options: _options,
                  name: name,
                  instance: instance
                }) || state;
              }
            }
          },
          // Async and optimistically optimized update – it will not be executed if
          // not necessary (debounced to run at most once-per-tick)
          update: debounce(function () {
            return new Promise(function (resolve) {
              instance.forceUpdate();
              resolve(state);
            });
          }),
          destroy: function destroy() {
            cleanupModifierEffects();
            isDestroyed = true;
          }
        };

        if (!areValidElements(reference, popper)) {
          return instance;
        }

        instance.setOptions(options).then(function (state) {
          if (!isDestroyed && options.onFirstUpdate) {
            options.onFirstUpdate(state);
          }
        }); // Modifiers have the ability to execute arbitrary code before the first
        // update cycle runs. They will be executed in the same order as the update
        // cycle. This is useful when a modifier adds some persistent data that
        // other modifiers need to use, but the modifier is run after the dependent
        // one.

        function runModifierEffects() {
          state.orderedModifiers.forEach(function (_ref) {
            var name = _ref.name,
                _ref$options = _ref.options,
                options = _ref$options === void 0 ? {} : _ref$options,
                effect = _ref.effect;

            if (typeof effect === 'function') {
              var cleanupFn = effect({
                state: state,
                name: name,
                instance: instance,
                options: options
              });

              var noopFn = function noopFn() {};

              effectCleanupFns.push(cleanupFn || noopFn);
            }
          });
        }

        function cleanupModifierEffects() {
          effectCleanupFns.forEach(function (fn) {
            return fn();
          });
          effectCleanupFns = [];
        }

        return instance;
      };
    }

    var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
    var createPopper = /*#__PURE__*/popperGenerator({
      defaultModifiers: defaultModifiers
    }); // eslint-disable-next-line import/no-unused-modules

    function createPopperActions(initOptions) {
        let popperInstance = null;
        let referenceNode;
        let contentNode;
        let options = initOptions;
        const initPopper = () => {
            if (referenceNode !== undefined && contentNode !== undefined) {
                popperInstance = createPopper(referenceNode, contentNode, options);
            }
        };
        const deinitPopper = () => {
            if (popperInstance !== null) {
                popperInstance.destroy();
                popperInstance = null;
            }
        };
        const referenceAction = (node) => {
            if ('subscribe' in node) {
                setupVirtualElementObserver(node);
                return {};
            }
            else {
                referenceNode = node;
                initPopper();
                return {
                    destroy() {
                        deinitPopper();
                    },
                };
            }
        };
        const setupVirtualElementObserver = (node) => {
            const unsubscribe = node.subscribe(($node) => {
                if (referenceNode === undefined) {
                    referenceNode = $node;
                    initPopper();
                }
                else {
                    // Preserve the reference to the virtual element.
                    Object.assign(referenceNode, $node);
                    popperInstance?.update();
                }
            });
            onDestroy(unsubscribe);
        };
        const contentAction = (node, contentOptions) => {
            contentNode = node;
            options = { ...initOptions, ...contentOptions };
            initPopper();
            return {
                update(newContentOptions) {
                    options = { ...initOptions, ...newContentOptions };
                    popperInstance?.setOptions(options);
                },
                destroy() {
                    deinitPopper();
                },
            };
        };
        return [referenceAction, contentAction, () => popperInstance];
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$5 = "";
    styleInject(css_248z$5);

    /* src\Popover.svelte generated by Svelte v3.59.2 */
    const file$6 = "src\\Popover.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});
    const get_trigger_slot_changes = dirty => ({});
    const get_trigger_slot_context = ctx => ({});

    // (45:2) {#if $show}
    function create_if_block$3(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const content_slot_template = /*#slots*/ ctx[8].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[7], get_content_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (content_slot) content_slot.c();
    			attr_dev(div, "class", "popover-content svelte-1xdb37g");
    			add_location(div, file$6, 45, 4, 1461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (content_slot) {
    				content_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*popperContent*/ ctx[3].call(null, div)),
    					action_destroyer(/*clickOutside*/ ctx[4].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (content_slot) {
    				if (content_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						content_slot,
    						content_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[7], dirty, get_content_slot_changes),
    						get_content_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (content_slot) content_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(45:2) {#if $show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const trigger_slot_template = /*#slots*/ ctx[8].trigger;
    	const trigger_slot = create_slot(trigger_slot_template, ctx, /*$$scope*/ ctx[7], get_trigger_slot_context);
    	let if_block = /*$show*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (trigger_slot) trigger_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "popover-button-container svelte-1xdb37g");
    			add_location(div, file$6, 40, 2, 1263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (trigger_slot) {
    				trigger_slot.m(div, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*popperRef*/ ctx[2].call(null, div)),
    					listen_dev(div, "click", /*togglePopover*/ ctx[5], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (trigger_slot) {
    				if (trigger_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						trigger_slot,
    						trigger_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(trigger_slot_template, /*$$scope*/ ctx[7], dirty, get_trigger_slot_changes),
    						get_trigger_slot_context
    					);
    				}
    			}

    			if (/*$show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(trigger_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(trigger_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (trigger_slot) trigger_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $show;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popover', slots, ['trigger','content']);
    	let { placement = 'top' } = $$props;
    	let show = writable(false); // Use a writable store for show
    	validate_store(show, 'show');
    	component_subscribe($$self, show, value => $$invalidate(0, $show = value));

    	const [popperRef, popperContent, getPopperInstance] = createPopperActions({
    		placement,
    		modifiers: [
    			{
    				name: 'offset',
    				options: { offset: [0, 8] }
    			},
    			{
    				name: 'flip',
    				options: {
    					fallbackPlacements: ['top', 'bottom', 'right', 'left']
    				}
    			},
    			{
    				name: 'preventOverflow',
    				options: { boundary: 'clippingParents' }
    			}
    		]
    	});

    	// clickOutside action
    	function clickOutside(node) {
    		const handleClick = event => {
    			if (!node.contains(event.target)) {
    				show.set(false); // Close the popover using .set()
    			}
    		};

    		document.addEventListener('mousedown', handleClick);

    		return {
    			destroy() {
    				document.removeEventListener('mousedown', handleClick);
    			}
    		};
    	}

    	// Function to toggle popover visibility
    	function togglePopover() {
    		show.update(current => !current); // Use .update() for toggling
    	}

    	const writable_props = ['placement'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popover> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('placement' in $$props) $$invalidate(6, placement = $$props.placement);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createPopperActions,
    		createPopper,
    		writable,
    		placement,
    		show,
    		popperRef,
    		popperContent,
    		getPopperInstance,
    		clickOutside,
    		togglePopover,
    		$show
    	});

    	$$self.$inject_state = $$props => {
    		if ('placement' in $$props) $$invalidate(6, placement = $$props.placement);
    		if ('show' in $$props) $$invalidate(1, show = $$props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$show,
    		show,
    		popperRef,
    		popperContent,
    		clickOutside,
    		togglePopover,
    		placement,
    		$$scope,
    		slots
    	];
    }

    class Popover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { placement: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popover",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get placement() {
    		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placement(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Get CSS class list from a props object
    function classList(props) {
      const {
        beat,
        fade,
        beatFade,
        bounce,
        shake,
        flash,
        spin,
        spinPulse,
        spinReverse,
        pulse,
        fixedWidth,
        inverse,
        border,
        listItem,
        flip,
        size,
        rotation,
        pull
      } = props;

      // map of CSS class names to properties
      const classes = {
        'fa-beat': beat,
        'fa-fade': fade,
        'fa-beat-fade': beatFade,
        'fa-bounce': bounce,
        'fa-shake': shake,
        'fa-flash': flash,
        'fa-spin': spin,
        'fa-spin-reverse': spinReverse,
        'fa-spin-pulse': spinPulse,
        'fa-pulse': pulse,
        'fa-fw': fixedWidth,
        'fa-inverse': inverse,
        'fa-border': border,
        'fa-li': listItem,
        'fa-flip': flip === true,
        'fa-flip-horizontal': flip === 'horizontal' || flip === 'both',
        'fa-flip-vertical': flip === 'vertical' || flip === 'both',
        [`fa-${size}`]: typeof size !== 'undefined' && size !== null,
        [`fa-rotate-${rotation}`]:
          typeof rotation !== 'undefined' && rotation !== null && rotation !== 0,
        [`fa-pull-${pull}`]: typeof pull !== 'undefined' && pull !== null,
        'fa-swap-opacity': props.swapOpacity
      };

      // map over all the keys in the classes object
      // return an array of the keys where the value for the key is not null
      return Object.keys(classes)
        .map(key => (classes[key] ? key : null))
        .filter(key => key)
    }

    // Camelize taken from humps
    // humps is copyright © 2012+ Dom Christie
    // Released under the MIT license.

    // Performant way to determine if object coerces to a number
    function _isNumerical(obj) {
      obj = obj - 0;

      // eslint-disable-next-line no-self-compare
      return obj === obj
    }

    function camelize(string) {
      if (_isNumerical(string)) {
        return string
      }

      // eslint-disable-next-line no-useless-escape
      string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : ''
      });

      // Ensure 1st char is always lowercase
      return string.substr(0, 1).toLowerCase() + string.substr(1)
    }

    function styleToString(style) {
      if (typeof style === 'string') {
        return style
      }

      return Object.keys(style).reduce((acc, key) => (
        acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + style[key] + ';'
      ), '')
    }

    function convert(createElement, element, extraProps = {}) {
      if (typeof element === 'string') {
        return element
      }

      const children = (element.children || []).map((child) => {
        return convert(createElement, child)
      });

      /* eslint-disable dot-notation */
      const mixins = Object.keys(element.attributes || {}).reduce(
        (acc, key) => {
          const val = element.attributes[key];

          if (key === 'style') {
            acc.attrs['style'] = styleToString(val);
          } else {
            if (key.indexOf('aria-') === 0 || key.indexOf('data-') === 0) {
              acc.attrs[key.toLowerCase()] = val;
            } else {
              acc.attrs[camelize(key)] = val;
            }
          }

          return acc
        },
        { attrs: {} }
      );

      /* eslint-enable */

      return createElement(element.tag, { ...mixins.attrs }, children)
    }

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }

      return target;
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var noop = function noop() {};

    var _WINDOW = {};
    var _DOCUMENT = {};
    var _MUTATION_OBSERVER = null;
    var _PERFORMANCE = {
      mark: noop,
      measure: noop
    };

    try {
      if (typeof window !== 'undefined') _WINDOW = window;
      if (typeof document !== 'undefined') _DOCUMENT = document;
      if (typeof MutationObserver !== 'undefined') _MUTATION_OBSERVER = MutationObserver;
      if (typeof performance !== 'undefined') _PERFORMANCE = performance;
    } catch (e) {}

    var _ref = _WINDOW.navigator || {},
        _ref$userAgent = _ref.userAgent,
        userAgent = _ref$userAgent === void 0 ? '' : _ref$userAgent;
    var WINDOW = _WINDOW;
    var DOCUMENT = _DOCUMENT;
    var MUTATION_OBSERVER = _MUTATION_OBSERVER;
    var PERFORMANCE = _PERFORMANCE;
    !!WINDOW.document;
    var IS_DOM = !!DOCUMENT.documentElement && !!DOCUMENT.head && typeof DOCUMENT.addEventListener === 'function' && typeof DOCUMENT.createElement === 'function';
    var IS_IE = ~userAgent.indexOf('MSIE') || ~userAgent.indexOf('Trident/');

    var _familyProxy, _familyProxy2, _familyProxy3, _familyProxy4, _familyProxy5;

    var NAMESPACE_IDENTIFIER = '___FONT_AWESOME___';
    var UNITS_IN_GRID = 16;
    var DEFAULT_CSS_PREFIX = 'fa';
    var DEFAULT_REPLACEMENT_CLASS = 'svg-inline--fa';
    var DATA_FA_I2SVG = 'data-fa-i2svg';
    var DATA_FA_PSEUDO_ELEMENT = 'data-fa-pseudo-element';
    var DATA_FA_PSEUDO_ELEMENT_PENDING = 'data-fa-pseudo-element-pending';
    var DATA_PREFIX = 'data-prefix';
    var DATA_ICON = 'data-icon';
    var HTML_CLASS_I2SVG_BASE_CLASS = 'fontawesome-i2svg';
    var MUTATION_APPROACH_ASYNC = 'async';
    var TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS = ['HTML', 'HEAD', 'STYLE', 'SCRIPT'];
    var PRODUCTION$1 = function () {
      try {
        return process.env.NODE_ENV === 'production';
      } catch (e) {
        return false;
      }
    }();
    var FAMILY_CLASSIC = 'classic';
    var FAMILY_SHARP = 'sharp';
    var FAMILIES = [FAMILY_CLASSIC, FAMILY_SHARP];

    function familyProxy(obj) {
      // Defaults to the classic family if family is not available
      return new Proxy(obj, {
        get: function get(target, prop) {
          return prop in target ? target[prop] : target[FAMILY_CLASSIC];
        }
      });
    }
    var PREFIX_TO_STYLE = familyProxy((_familyProxy = {}, _defineProperty(_familyProxy, FAMILY_CLASSIC, {
      'fa': 'solid',
      'fas': 'solid',
      'fa-solid': 'solid',
      'far': 'regular',
      'fa-regular': 'regular',
      'fal': 'light',
      'fa-light': 'light',
      'fat': 'thin',
      'fa-thin': 'thin',
      'fad': 'duotone',
      'fa-duotone': 'duotone',
      'fab': 'brands',
      'fa-brands': 'brands',
      'fak': 'kit',
      'fakd': 'kit',
      'fa-kit': 'kit',
      'fa-kit-duotone': 'kit'
    }), _defineProperty(_familyProxy, FAMILY_SHARP, {
      'fa': 'solid',
      'fass': 'solid',
      'fa-solid': 'solid',
      'fasr': 'regular',
      'fa-regular': 'regular',
      'fasl': 'light',
      'fa-light': 'light',
      'fast': 'thin',
      'fa-thin': 'thin'
    }), _familyProxy));
    var STYLE_TO_PREFIX = familyProxy((_familyProxy2 = {}, _defineProperty(_familyProxy2, FAMILY_CLASSIC, {
      solid: 'fas',
      regular: 'far',
      light: 'fal',
      thin: 'fat',
      duotone: 'fad',
      brands: 'fab',
      kit: 'fak'
    }), _defineProperty(_familyProxy2, FAMILY_SHARP, {
      solid: 'fass',
      regular: 'fasr',
      light: 'fasl',
      thin: 'fast'
    }), _familyProxy2));
    var PREFIX_TO_LONG_STYLE = familyProxy((_familyProxy3 = {}, _defineProperty(_familyProxy3, FAMILY_CLASSIC, {
      fab: 'fa-brands',
      fad: 'fa-duotone',
      fak: 'fa-kit',
      fal: 'fa-light',
      far: 'fa-regular',
      fas: 'fa-solid',
      fat: 'fa-thin'
    }), _defineProperty(_familyProxy3, FAMILY_SHARP, {
      fass: 'fa-solid',
      fasr: 'fa-regular',
      fasl: 'fa-light',
      fast: 'fa-thin'
    }), _familyProxy3));
    var LONG_STYLE_TO_PREFIX = familyProxy((_familyProxy4 = {}, _defineProperty(_familyProxy4, FAMILY_CLASSIC, {
      'fa-brands': 'fab',
      'fa-duotone': 'fad',
      'fa-kit': 'fak',
      'fa-light': 'fal',
      'fa-regular': 'far',
      'fa-solid': 'fas',
      'fa-thin': 'fat'
    }), _defineProperty(_familyProxy4, FAMILY_SHARP, {
      'fa-solid': 'fass',
      'fa-regular': 'fasr',
      'fa-light': 'fasl',
      'fa-thin': 'fast'
    }), _familyProxy4));
    var ICON_SELECTION_SYNTAX_PATTERN = /fa(s|r|l|t|d|b|k|ss|sr|sl|st)?[\-\ ]/; // eslint-disable-line no-useless-escape

    var LAYERS_TEXT_CLASSNAME = 'fa-layers-text';
    var FONT_FAMILY_PATTERN = /Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp|Kit)?.*/i;
    var FONT_WEIGHT_TO_PREFIX = familyProxy((_familyProxy5 = {}, _defineProperty(_familyProxy5, FAMILY_CLASSIC, {
      900: 'fas',
      400: 'far',
      normal: 'far',
      300: 'fal',
      100: 'fat'
    }), _defineProperty(_familyProxy5, FAMILY_SHARP, {
      900: 'fass',
      400: 'fasr',
      300: 'fasl',
      100: 'fast'
    }), _familyProxy5));
    var oneToTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var oneToTwenty = oneToTen.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    var ATTRIBUTES_WATCHED_FOR_MUTATION = ['class', 'data-prefix', 'data-icon', 'data-fa-transform', 'data-fa-mask'];
    var DUOTONE_CLASSES = {
      GROUP: 'duotone-group',
      SWAP_OPACITY: 'swap-opacity',
      PRIMARY: 'primary',
      SECONDARY: 'secondary'
    };
    var prefixes = new Set();
    Object.keys(STYLE_TO_PREFIX[FAMILY_CLASSIC]).map(prefixes.add.bind(prefixes));
    Object.keys(STYLE_TO_PREFIX[FAMILY_SHARP]).map(prefixes.add.bind(prefixes));
    var RESERVED_CLASSES = [].concat(FAMILIES, _toConsumableArray(prefixes), ['2xs', 'xs', 'sm', 'lg', 'xl', '2xl', 'beat', 'border', 'fade', 'beat-fade', 'bounce', 'flip-both', 'flip-horizontal', 'flip-vertical', 'flip', 'fw', 'inverse', 'layers-counter', 'layers-text', 'layers', 'li', 'pull-left', 'pull-right', 'pulse', 'rotate-180', 'rotate-270', 'rotate-90', 'rotate-by', 'shake', 'spin-pulse', 'spin-reverse', 'spin', 'stack-1x', 'stack-2x', 'stack', 'ul', DUOTONE_CLASSES.GROUP, DUOTONE_CLASSES.SWAP_OPACITY, DUOTONE_CLASSES.PRIMARY, DUOTONE_CLASSES.SECONDARY]).concat(oneToTen.map(function (n) {
      return "".concat(n, "x");
    })).concat(oneToTwenty.map(function (n) {
      return "w-".concat(n);
    }));

    var initial = WINDOW.FontAwesomeConfig || {};

    function getAttrConfig(attr) {
      var element = DOCUMENT.querySelector('script[' + attr + ']');

      if (element) {
        return element.getAttribute(attr);
      }
    }

    function coerce(val) {
      // Getting an empty string will occur if the attribute is set on the HTML tag but without a value
      // We'll assume that this is an indication that it should be toggled to true
      if (val === '') return true;
      if (val === 'false') return false;
      if (val === 'true') return true;
      return val;
    }

    if (DOCUMENT && typeof DOCUMENT.querySelector === 'function') {
      var attrs = [['data-family-prefix', 'familyPrefix'], ['data-css-prefix', 'cssPrefix'], ['data-family-default', 'familyDefault'], ['data-style-default', 'styleDefault'], ['data-replacement-class', 'replacementClass'], ['data-auto-replace-svg', 'autoReplaceSvg'], ['data-auto-add-css', 'autoAddCss'], ['data-auto-a11y', 'autoA11y'], ['data-search-pseudo-elements', 'searchPseudoElements'], ['data-observe-mutations', 'observeMutations'], ['data-mutate-approach', 'mutateApproach'], ['data-keep-original-source', 'keepOriginalSource'], ['data-measure-performance', 'measurePerformance'], ['data-show-missing-icons', 'showMissingIcons']];
      attrs.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            attr = _ref2[0],
            key = _ref2[1];

        var val = coerce(getAttrConfig(attr));

        if (val !== undefined && val !== null) {
          initial[key] = val;
        }
      });
    }

    var _default = {
      styleDefault: 'solid',
      familyDefault: 'classic',
      cssPrefix: DEFAULT_CSS_PREFIX,
      replacementClass: DEFAULT_REPLACEMENT_CLASS,
      autoReplaceSvg: true,
      autoAddCss: true,
      autoA11y: true,
      searchPseudoElements: false,
      observeMutations: true,
      mutateApproach: 'async',
      keepOriginalSource: true,
      measurePerformance: false,
      showMissingIcons: true
    }; // familyPrefix is deprecated but we must still support it if present

    if (initial.familyPrefix) {
      initial.cssPrefix = initial.familyPrefix;
    }

    var _config = _objectSpread2(_objectSpread2({}, _default), initial);

    if (!_config.autoReplaceSvg) _config.observeMutations = false;
    var config = {};
    Object.keys(_default).forEach(function (key) {
      Object.defineProperty(config, key, {
        enumerable: true,
        set: function set(val) {
          _config[key] = val;

          _onChangeCb.forEach(function (cb) {
            return cb(config);
          });
        },
        get: function get() {
          return _config[key];
        }
      });
    }); // familyPrefix is deprecated as of 6.2.0 and should be removed in 7.0.0

    Object.defineProperty(config, 'familyPrefix', {
      enumerable: true,
      set: function set(val) {
        _config.cssPrefix = val;

        _onChangeCb.forEach(function (cb) {
          return cb(config);
        });
      },
      get: function get() {
        return _config.cssPrefix;
      }
    });
    WINDOW.FontAwesomeConfig = config;
    var _onChangeCb = [];
    function onChange(cb) {
      _onChangeCb.push(cb);

      return function () {
        _onChangeCb.splice(_onChangeCb.indexOf(cb), 1);
      };
    }

    var d = UNITS_IN_GRID;
    var meaninglessTransform = {
      size: 16,
      x: 0,
      y: 0,
      rotate: 0,
      flipX: false,
      flipY: false
    };
    function insertCss(css) {
      if (!css || !IS_DOM) {
        return;
      }

      var style = DOCUMENT.createElement('style');
      style.setAttribute('type', 'text/css');
      style.innerHTML = css;
      var headChildren = DOCUMENT.head.childNodes;
      var beforeChild = null;

      for (var i = headChildren.length - 1; i > -1; i--) {
        var child = headChildren[i];
        var tagName = (child.tagName || '').toUpperCase();

        if (['STYLE', 'LINK'].indexOf(tagName) > -1) {
          beforeChild = child;
        }
      }

      DOCUMENT.head.insertBefore(style, beforeChild);
      return css;
    }
    var idPool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function nextUniqueId() {
      var size = 12;
      var id = '';

      while (size-- > 0) {
        id += idPool[Math.random() * 62 | 0];
      }

      return id;
    }
    function toArray(obj) {
      var array = [];

      for (var i = (obj || []).length >>> 0; i--;) {
        array[i] = obj[i];
      }

      return array;
    }
    function classArray(node) {
      if (node.classList) {
        return toArray(node.classList);
      } else {
        return (node.getAttribute('class') || '').split(' ').filter(function (i) {
          return i;
        });
      }
    }
    function htmlEscape(str) {
      return "".concat(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function joinAttributes(attributes) {
      return Object.keys(attributes || {}).reduce(function (acc, attributeName) {
        return acc + "".concat(attributeName, "=\"").concat(htmlEscape(attributes[attributeName]), "\" ");
      }, '').trim();
    }
    function joinStyles(styles) {
      return Object.keys(styles || {}).reduce(function (acc, styleName) {
        return acc + "".concat(styleName, ": ").concat(styles[styleName].trim(), ";");
      }, '');
    }
    function transformIsMeaningful(transform) {
      return transform.size !== meaninglessTransform.size || transform.x !== meaninglessTransform.x || transform.y !== meaninglessTransform.y || transform.rotate !== meaninglessTransform.rotate || transform.flipX || transform.flipY;
    }
    function transformForSvg(_ref) {
      var transform = _ref.transform,
          containerWidth = _ref.containerWidth,
          iconWidth = _ref.iconWidth;
      var outer = {
        transform: "translate(".concat(containerWidth / 2, " 256)")
      };
      var innerTranslate = "translate(".concat(transform.x * 32, ", ").concat(transform.y * 32, ") ");
      var innerScale = "scale(".concat(transform.size / 16 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / 16 * (transform.flipY ? -1 : 1), ") ");
      var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
      var inner = {
        transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
      };
      var path = {
        transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
      };
      return {
        outer: outer,
        inner: inner,
        path: path
      };
    }
    function transformForCss(_ref2) {
      var transform = _ref2.transform,
          _ref2$width = _ref2.width,
          width = _ref2$width === void 0 ? UNITS_IN_GRID : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === void 0 ? UNITS_IN_GRID : _ref2$height,
          _ref2$startCentered = _ref2.startCentered,
          startCentered = _ref2$startCentered === void 0 ? false : _ref2$startCentered;
      var val = '';

      if (startCentered && IS_IE) {
        val += "translate(".concat(transform.x / d - width / 2, "em, ").concat(transform.y / d - height / 2, "em) ");
      } else if (startCentered) {
        val += "translate(calc(-50% + ".concat(transform.x / d, "em), calc(-50% + ").concat(transform.y / d, "em)) ");
      } else {
        val += "translate(".concat(transform.x / d, "em, ").concat(transform.y / d, "em) ");
      }

      val += "scale(".concat(transform.size / d * (transform.flipX ? -1 : 1), ", ").concat(transform.size / d * (transform.flipY ? -1 : 1), ") ");
      val += "rotate(".concat(transform.rotate, "deg) ");
      return val;
    }

    var baseStyles = ":root, :host {\n  --fa-font-solid: normal 900 1em/1 \"Font Awesome 6 Solid\";\n  --fa-font-regular: normal 400 1em/1 \"Font Awesome 6 Regular\";\n  --fa-font-light: normal 300 1em/1 \"Font Awesome 6 Light\";\n  --fa-font-thin: normal 100 1em/1 \"Font Awesome 6 Thin\";\n  --fa-font-duotone: normal 900 1em/1 \"Font Awesome 6 Duotone\";\n  --fa-font-sharp-solid: normal 900 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-sharp-regular: normal 400 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-sharp-light: normal 300 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-sharp-thin: normal 100 1em/1 \"Font Awesome 6 Sharp\";\n  --fa-font-brands: normal 400 1em/1 \"Font Awesome 6 Brands\";\n}\n\nsvg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {\n  overflow: visible;\n  box-sizing: content-box;\n}\n\n.svg-inline--fa {\n  display: var(--fa-display, inline-block);\n  height: 1em;\n  overflow: visible;\n  vertical-align: -0.125em;\n}\n.svg-inline--fa.fa-2xs {\n  vertical-align: 0.1em;\n}\n.svg-inline--fa.fa-xs {\n  vertical-align: 0em;\n}\n.svg-inline--fa.fa-sm {\n  vertical-align: -0.0714285705em;\n}\n.svg-inline--fa.fa-lg {\n  vertical-align: -0.2em;\n}\n.svg-inline--fa.fa-xl {\n  vertical-align: -0.25em;\n}\n.svg-inline--fa.fa-2xl {\n  vertical-align: -0.3125em;\n}\n.svg-inline--fa.fa-pull-left {\n  margin-right: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-pull-right {\n  margin-left: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-li {\n  width: var(--fa-li-width, 2em);\n  top: 0.25em;\n}\n.svg-inline--fa.fa-fw {\n  width: var(--fa-fw-width, 1.25em);\n}\n\n.fa-layers svg.svg-inline--fa {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.fa-layers-counter, .fa-layers-text {\n  display: inline-block;\n  position: absolute;\n  text-align: center;\n}\n\n.fa-layers {\n  display: inline-block;\n  height: 1em;\n  position: relative;\n  text-align: center;\n  vertical-align: -0.125em;\n  width: 1em;\n}\n.fa-layers svg.svg-inline--fa {\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-text {\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-counter {\n  background-color: var(--fa-counter-background-color, #ff253a);\n  border-radius: var(--fa-counter-border-radius, 1em);\n  box-sizing: border-box;\n  color: var(--fa-inverse, #fff);\n  line-height: var(--fa-counter-line-height, 1);\n  max-width: var(--fa-counter-max-width, 5em);\n  min-width: var(--fa-counter-min-width, 1.5em);\n  overflow: hidden;\n  padding: var(--fa-counter-padding, 0.25em 0.5em);\n  right: var(--fa-right, 0);\n  text-overflow: ellipsis;\n  top: var(--fa-top, 0);\n  -webkit-transform: scale(var(--fa-counter-scale, 0.25));\n          transform: scale(var(--fa-counter-scale, 0.25));\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-bottom-right {\n  bottom: var(--fa-bottom, 0);\n  right: var(--fa-right, 0);\n  top: auto;\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: bottom right;\n          transform-origin: bottom right;\n}\n\n.fa-layers-bottom-left {\n  bottom: var(--fa-bottom, 0);\n  left: var(--fa-left, 0);\n  right: auto;\n  top: auto;\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: bottom left;\n          transform-origin: bottom left;\n}\n\n.fa-layers-top-right {\n  top: var(--fa-top, 0);\n  right: var(--fa-right, 0);\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-top-left {\n  left: var(--fa-left, 0);\n  right: auto;\n  top: var(--fa-top, 0);\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: top left;\n          transform-origin: top left;\n}\n\n.fa-1x {\n  font-size: 1em;\n}\n\n.fa-2x {\n  font-size: 2em;\n}\n\n.fa-3x {\n  font-size: 3em;\n}\n\n.fa-4x {\n  font-size: 4em;\n}\n\n.fa-5x {\n  font-size: 5em;\n}\n\n.fa-6x {\n  font-size: 6em;\n}\n\n.fa-7x {\n  font-size: 7em;\n}\n\n.fa-8x {\n  font-size: 8em;\n}\n\n.fa-9x {\n  font-size: 9em;\n}\n\n.fa-10x {\n  font-size: 10em;\n}\n\n.fa-2xs {\n  font-size: 0.625em;\n  line-height: 0.1em;\n  vertical-align: 0.225em;\n}\n\n.fa-xs {\n  font-size: 0.75em;\n  line-height: 0.0833333337em;\n  vertical-align: 0.125em;\n}\n\n.fa-sm {\n  font-size: 0.875em;\n  line-height: 0.0714285718em;\n  vertical-align: 0.0535714295em;\n}\n\n.fa-lg {\n  font-size: 1.25em;\n  line-height: 0.05em;\n  vertical-align: -0.075em;\n}\n\n.fa-xl {\n  font-size: 1.5em;\n  line-height: 0.0416666682em;\n  vertical-align: -0.125em;\n}\n\n.fa-2xl {\n  font-size: 2em;\n  line-height: 0.03125em;\n  vertical-align: -0.1875em;\n}\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em;\n}\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: var(--fa-li-margin, 2.5em);\n  padding-left: 0;\n}\n.fa-ul > li {\n  position: relative;\n}\n\n.fa-li {\n  left: calc(var(--fa-li-width, 2em) * -1);\n  position: absolute;\n  text-align: center;\n  width: var(--fa-li-width, 2em);\n  line-height: inherit;\n}\n\n.fa-border {\n  border-color: var(--fa-border-color, #eee);\n  border-radius: var(--fa-border-radius, 0.1em);\n  border-style: var(--fa-border-style, solid);\n  border-width: var(--fa-border-width, 0.08em);\n  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);\n}\n\n.fa-pull-left {\n  float: left;\n  margin-right: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-pull-right {\n  float: right;\n  margin-left: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-beat {\n  -webkit-animation-name: fa-beat;\n          animation-name: fa-beat;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);\n          animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-bounce {\n  -webkit-animation-name: fa-bounce;\n          animation-name: fa-bounce;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n}\n\n.fa-fade {\n  -webkit-animation-name: fa-fade;\n          animation-name: fa-fade;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-beat-fade {\n  -webkit-animation-name: fa-beat-fade;\n          animation-name: fa-beat-fade;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-flip {\n  -webkit-animation-name: fa-flip;\n          animation-name: fa-flip;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);\n          animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-shake {\n  -webkit-animation-name: fa-shake;\n          animation-name: fa-shake;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, linear);\n          animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin {\n  -webkit-animation-name: fa-spin;\n          animation-name: fa-spin;\n  -webkit-animation-delay: var(--fa-animation-delay, 0s);\n          animation-delay: var(--fa-animation-delay, 0s);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 2s);\n          animation-duration: var(--fa-animation-duration, 2s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, linear);\n          animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin-reverse {\n  --fa-animation-direction: reverse;\n}\n\n.fa-pulse,\n.fa-spin-pulse {\n  -webkit-animation-name: fa-spin;\n          animation-name: fa-spin;\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, steps(8));\n          animation-timing-function: var(--fa-animation-timing, steps(8));\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .fa-beat,\n.fa-bounce,\n.fa-fade,\n.fa-beat-fade,\n.fa-flip,\n.fa-pulse,\n.fa-shake,\n.fa-spin,\n.fa-spin-pulse {\n    -webkit-animation-delay: -1ms;\n            animation-delay: -1ms;\n    -webkit-animation-duration: 1ms;\n            animation-duration: 1ms;\n    -webkit-animation-iteration-count: 1;\n            animation-iteration-count: 1;\n    -webkit-transition-delay: 0s;\n            transition-delay: 0s;\n    -webkit-transition-duration: 0s;\n            transition-duration: 0s;\n  }\n}\n@-webkit-keyframes fa-beat {\n  0%, 90% {\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  45% {\n    -webkit-transform: scale(var(--fa-beat-scale, 1.25));\n            transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@keyframes fa-beat {\n  0%, 90% {\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  45% {\n    -webkit-transform: scale(var(--fa-beat-scale, 1.25));\n            transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@-webkit-keyframes fa-bounce {\n  0% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n}\n@keyframes fa-bounce {\n  0% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n}\n@-webkit-keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@-webkit-keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));\n            transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));\n            transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@-webkit-keyframes fa-flip {\n  50% {\n    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@keyframes fa-flip {\n  50% {\n    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@-webkit-keyframes fa-shake {\n  0% {\n    -webkit-transform: rotate(-15deg);\n            transform: rotate(-15deg);\n  }\n  4% {\n    -webkit-transform: rotate(15deg);\n            transform: rotate(15deg);\n  }\n  8%, 24% {\n    -webkit-transform: rotate(-18deg);\n            transform: rotate(-18deg);\n  }\n  12%, 28% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n  }\n  16% {\n    -webkit-transform: rotate(-22deg);\n            transform: rotate(-22deg);\n  }\n  20% {\n    -webkit-transform: rotate(22deg);\n            transform: rotate(22deg);\n  }\n  32% {\n    -webkit-transform: rotate(-12deg);\n            transform: rotate(-12deg);\n  }\n  36% {\n    -webkit-transform: rotate(12deg);\n            transform: rotate(12deg);\n  }\n  40%, 100% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n}\n@keyframes fa-shake {\n  0% {\n    -webkit-transform: rotate(-15deg);\n            transform: rotate(-15deg);\n  }\n  4% {\n    -webkit-transform: rotate(15deg);\n            transform: rotate(15deg);\n  }\n  8%, 24% {\n    -webkit-transform: rotate(-18deg);\n            transform: rotate(-18deg);\n  }\n  12%, 28% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n  }\n  16% {\n    -webkit-transform: rotate(-22deg);\n            transform: rotate(-22deg);\n  }\n  20% {\n    -webkit-transform: rotate(22deg);\n            transform: rotate(22deg);\n  }\n  32% {\n    -webkit-transform: rotate(-12deg);\n            transform: rotate(-12deg);\n  }\n  36% {\n    -webkit-transform: rotate(12deg);\n            transform: rotate(12deg);\n  }\n  40%, 100% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n}\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n.fa-rotate-90 {\n  -webkit-transform: rotate(90deg);\n          transform: rotate(90deg);\n}\n\n.fa-rotate-180 {\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg);\n}\n\n.fa-rotate-270 {\n  -webkit-transform: rotate(270deg);\n          transform: rotate(270deg);\n}\n\n.fa-flip-horizontal {\n  -webkit-transform: scale(-1, 1);\n          transform: scale(-1, 1);\n}\n\n.fa-flip-vertical {\n  -webkit-transform: scale(1, -1);\n          transform: scale(1, -1);\n}\n\n.fa-flip-both,\n.fa-flip-horizontal.fa-flip-vertical {\n  -webkit-transform: scale(-1, -1);\n          transform: scale(-1, -1);\n}\n\n.fa-rotate-by {\n  -webkit-transform: rotate(var(--fa-rotate-angle, none));\n          transform: rotate(var(--fa-rotate-angle, none));\n}\n\n.fa-stack {\n  display: inline-block;\n  vertical-align: middle;\n  height: 2em;\n  position: relative;\n  width: 2.5em;\n}\n\n.fa-stack-1x,\n.fa-stack-2x {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n  z-index: var(--fa-stack-z-index, auto);\n}\n\n.svg-inline--fa.fa-stack-1x {\n  height: 1em;\n  width: 1.25em;\n}\n.svg-inline--fa.fa-stack-2x {\n  height: 2em;\n  width: 2.5em;\n}\n\n.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}\n\n.sr-only,\n.fa-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.sr-only-focusable:not(:focus),\n.fa-sr-only-focusable:not(:focus) {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.svg-inline--fa .fa-primary {\n  fill: var(--fa-primary-color, currentColor);\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa .fa-secondary {\n  fill: var(--fa-secondary-color, currentColor);\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-primary {\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-secondary {\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa mask .fa-primary,\n.svg-inline--fa mask .fa-secondary {\n  fill: black;\n}\n\n.fad.fa-inverse,\n.fa-duotone.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}";

    function css() {
      var dcp = DEFAULT_CSS_PREFIX;
      var drc = DEFAULT_REPLACEMENT_CLASS;
      var fp = config.cssPrefix;
      var rc = config.replacementClass;
      var s = baseStyles;

      if (fp !== dcp || rc !== drc) {
        var dPatt = new RegExp("\\.".concat(dcp, "\\-"), 'g');
        var customPropPatt = new RegExp("\\--".concat(dcp, "\\-"), 'g');
        var rPatt = new RegExp("\\.".concat(drc), 'g');
        s = s.replace(dPatt, ".".concat(fp, "-")).replace(customPropPatt, "--".concat(fp, "-")).replace(rPatt, ".".concat(rc));
      }

      return s;
    }

    var _cssInserted = false;

    function ensureCss() {
      if (config.autoAddCss && !_cssInserted) {
        insertCss(css());
        _cssInserted = true;
      }
    }

    var InjectCSS = {
      mixout: function mixout() {
        return {
          dom: {
            css: css,
            insertCss: ensureCss
          }
        };
      },
      hooks: function hooks() {
        return {
          beforeDOMElementCreation: function beforeDOMElementCreation() {
            ensureCss();
          },
          beforeI2svg: function beforeI2svg() {
            ensureCss();
          }
        };
      }
    };

    var w = WINDOW || {};
    if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
    if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
    if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
    if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
    var namespace = w[NAMESPACE_IDENTIFIER];

    var functions = [];

    var listener = function listener() {
      DOCUMENT.removeEventListener('DOMContentLoaded', listener);
      loaded = 1;
      functions.map(function (fn) {
        return fn();
      });
    };

    var loaded = false;

    if (IS_DOM) {
      loaded = (DOCUMENT.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(DOCUMENT.readyState);
      if (!loaded) DOCUMENT.addEventListener('DOMContentLoaded', listener);
    }

    function domready (fn) {
      if (!IS_DOM) return;
      loaded ? setTimeout(fn, 0) : functions.push(fn);
    }

    function toHtml(abstractNodes) {
      var tag = abstractNodes.tag,
          _abstractNodes$attrib = abstractNodes.attributes,
          attributes = _abstractNodes$attrib === void 0 ? {} : _abstractNodes$attrib,
          _abstractNodes$childr = abstractNodes.children,
          children = _abstractNodes$childr === void 0 ? [] : _abstractNodes$childr;

      if (typeof abstractNodes === 'string') {
        return htmlEscape(abstractNodes);
      } else {
        return "<".concat(tag, " ").concat(joinAttributes(attributes), ">").concat(children.map(toHtml).join(''), "</").concat(tag, ">");
      }
    }

    function iconFromMapping(mapping, prefix, iconName) {
      if (mapping && mapping[prefix] && mapping[prefix][iconName]) {
        return {
          prefix: prefix,
          iconName: iconName,
          icon: mapping[prefix][iconName]
        };
      }
    }

    /**
     * Internal helper to bind a function known to have 4 arguments
     * to a given context.
     */

    var bindInternal4 = function bindInternal4(func, thisContext) {
      return function (a, b, c, d) {
        return func.call(thisContext, a, b, c, d);
      };
    };

    /**
     * # Reduce
     *
     * A fast object `.reduce()` implementation.
     *
     * @param  {Object}   subject      The object to reduce over.
     * @param  {Function} fn           The reducer function.
     * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
     * @param  {Object}   thisContext  The context for the reducer.
     * @return {mixed}                 The final result.
     */


    var reduce = function fastReduceObject(subject, fn, initialValue, thisContext) {
      var keys = Object.keys(subject),
          length = keys.length,
          iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
          i,
          key,
          result;

      if (initialValue === undefined) {
        i = 1;
        result = subject[keys[0]];
      } else {
        i = 0;
        result = initialValue;
      }

      for (; i < length; i++) {
        key = keys[i];
        result = iterator(result, subject[key], key, subject);
      }

      return result;
    };

    /**
     * ucs2decode() and codePointAt() are both works of Mathias Bynens and licensed under MIT
     *
     * Copyright Mathias Bynens <https://mathiasbynens.be/>

     * Permission is hereby granted, free of charge, to any person obtaining
     * a copy of this software and associated documentation files (the
     * "Software"), to deal in the Software without restriction, including
     * without limitation the rights to use, copy, modify, merge, publish,
     * distribute, sublicense, and/or sell copies of the Software, and to
     * permit persons to whom the Software is furnished to do so, subject to
     * the following conditions:

     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.

     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
     * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
     * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
     * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    function ucs2decode(string) {
      var output = [];
      var counter = 0;
      var length = string.length;

      while (counter < length) {
        var value = string.charCodeAt(counter++);

        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
          var extra = string.charCodeAt(counter++);

          if ((extra & 0xFC00) == 0xDC00) {
            // eslint-disable-line eqeqeq
            output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }

      return output;
    }

    function toHex(unicode) {
      var decoded = ucs2decode(unicode);
      return decoded.length === 1 ? decoded[0].toString(16) : null;
    }
    function codePointAt(string, index) {
      var size = string.length;
      var first = string.charCodeAt(index);
      var second;

      if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
        second = string.charCodeAt(index + 1);

        if (second >= 0xDC00 && second <= 0xDFFF) {
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }

      return first;
    }

    function normalizeIcons(icons) {
      return Object.keys(icons).reduce(function (acc, iconName) {
        var icon = icons[iconName];
        var expanded = !!icon.icon;

        if (expanded) {
          acc[icon.iconName] = icon.icon;
        } else {
          acc[iconName] = icon;
        }

        return acc;
      }, {});
    }

    function defineIcons(prefix, icons) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _params$skipHooks = params.skipHooks,
          skipHooks = _params$skipHooks === void 0 ? false : _params$skipHooks;
      var normalized = normalizeIcons(icons);

      if (typeof namespace.hooks.addPack === 'function' && !skipHooks) {
        namespace.hooks.addPack(prefix, normalizeIcons(icons));
      } else {
        namespace.styles[prefix] = _objectSpread2(_objectSpread2({}, namespace.styles[prefix] || {}), normalized);
      }
      /**
       * Font Awesome 4 used the prefix of `fa` for all icons. With the introduction
       * of new styles we needed to differentiate between them. Prefix `fa` is now an alias
       * for `fas` so we'll ease the upgrade process for our users by automatically defining
       * this as well.
       */


      if (prefix === 'fas') {
        defineIcons('fa', icons);
      }
    }

    var _LONG_STYLE, _PREFIXES, _PREFIXES_FOR_FAMILY;
    var styles = namespace.styles,
        shims = namespace.shims;
    var LONG_STYLE = (_LONG_STYLE = {}, _defineProperty(_LONG_STYLE, FAMILY_CLASSIC, Object.values(PREFIX_TO_LONG_STYLE[FAMILY_CLASSIC])), _defineProperty(_LONG_STYLE, FAMILY_SHARP, Object.values(PREFIX_TO_LONG_STYLE[FAMILY_SHARP])), _LONG_STYLE);
    var _defaultUsablePrefix = null;
    var _byUnicode = {};
    var _byLigature = {};
    var _byOldName = {};
    var _byOldUnicode = {};
    var _byAlias = {};
    var PREFIXES = (_PREFIXES = {}, _defineProperty(_PREFIXES, FAMILY_CLASSIC, Object.keys(PREFIX_TO_STYLE[FAMILY_CLASSIC])), _defineProperty(_PREFIXES, FAMILY_SHARP, Object.keys(PREFIX_TO_STYLE[FAMILY_SHARP])), _PREFIXES);

    function isReserved(name) {
      return ~RESERVED_CLASSES.indexOf(name);
    }

    function getIconName(cssPrefix, cls) {
      var parts = cls.split('-');
      var prefix = parts[0];
      var iconName = parts.slice(1).join('-');

      if (prefix === cssPrefix && iconName !== '' && !isReserved(iconName)) {
        return iconName;
      } else {
        return null;
      }
    }
    var build = function build() {
      var lookup = function lookup(reducer) {
        return reduce(styles, function (o, style, prefix) {
          o[prefix] = reduce(style, reducer, {});
          return o;
        }, {});
      };

      _byUnicode = lookup(function (acc, icon, iconName) {
        if (icon[3]) {
          acc[icon[3]] = iconName;
        }

        if (icon[2]) {
          var aliases = icon[2].filter(function (a) {
            return typeof a === 'number';
          });
          aliases.forEach(function (alias) {
            acc[alias.toString(16)] = iconName;
          });
        }

        return acc;
      });
      _byLigature = lookup(function (acc, icon, iconName) {
        acc[iconName] = iconName;

        if (icon[2]) {
          var aliases = icon[2].filter(function (a) {
            return typeof a === 'string';
          });
          aliases.forEach(function (alias) {
            acc[alias] = iconName;
          });
        }

        return acc;
      });
      _byAlias = lookup(function (acc, icon, iconName) {
        var aliases = icon[2];
        acc[iconName] = iconName;
        aliases.forEach(function (alias) {
          acc[alias] = iconName;
        });
        return acc;
      }); // If we have a Kit, we can't determine if regular is available since we
      // could be auto-fetching it. We'll have to assume that it is available.

      var hasRegular = 'far' in styles || config.autoFetchSvg;
      var shimLookups = reduce(shims, function (acc, shim) {
        var maybeNameMaybeUnicode = shim[0];
        var prefix = shim[1];
        var iconName = shim[2];

        if (prefix === 'far' && !hasRegular) {
          prefix = 'fas';
        }

        if (typeof maybeNameMaybeUnicode === 'string') {
          acc.names[maybeNameMaybeUnicode] = {
            prefix: prefix,
            iconName: iconName
          };
        }

        if (typeof maybeNameMaybeUnicode === 'number') {
          acc.unicodes[maybeNameMaybeUnicode.toString(16)] = {
            prefix: prefix,
            iconName: iconName
          };
        }

        return acc;
      }, {
        names: {},
        unicodes: {}
      });
      _byOldName = shimLookups.names;
      _byOldUnicode = shimLookups.unicodes;
      _defaultUsablePrefix = getCanonicalPrefix(config.styleDefault, {
        family: config.familyDefault
      });
    };
    onChange(function (c) {
      _defaultUsablePrefix = getCanonicalPrefix(c.styleDefault, {
        family: config.familyDefault
      });
    });
    build();
    function byUnicode(prefix, unicode) {
      return (_byUnicode[prefix] || {})[unicode];
    }
    function byLigature(prefix, ligature) {
      return (_byLigature[prefix] || {})[ligature];
    }
    function byAlias(prefix, alias) {
      return (_byAlias[prefix] || {})[alias];
    }
    function byOldName(name) {
      return _byOldName[name] || {
        prefix: null,
        iconName: null
      };
    }
    function byOldUnicode(unicode) {
      var oldUnicode = _byOldUnicode[unicode];
      var newUnicode = byUnicode('fas', unicode);
      return oldUnicode || (newUnicode ? {
        prefix: 'fas',
        iconName: newUnicode
      } : null) || {
        prefix: null,
        iconName: null
      };
    }
    function getDefaultUsablePrefix() {
      return _defaultUsablePrefix;
    }
    var emptyCanonicalIcon = function emptyCanonicalIcon() {
      return {
        prefix: null,
        iconName: null,
        rest: []
      };
    };
    function getCanonicalPrefix(styleOrPrefix) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$family = params.family,
          family = _params$family === void 0 ? FAMILY_CLASSIC : _params$family;
      var style = PREFIX_TO_STYLE[family][styleOrPrefix];
      var prefix = STYLE_TO_PREFIX[family][styleOrPrefix] || STYLE_TO_PREFIX[family][style];
      var defined = styleOrPrefix in namespace.styles ? styleOrPrefix : null;
      return prefix || defined || null;
    }
    var PREFIXES_FOR_FAMILY = (_PREFIXES_FOR_FAMILY = {}, _defineProperty(_PREFIXES_FOR_FAMILY, FAMILY_CLASSIC, Object.keys(PREFIX_TO_LONG_STYLE[FAMILY_CLASSIC])), _defineProperty(_PREFIXES_FOR_FAMILY, FAMILY_SHARP, Object.keys(PREFIX_TO_LONG_STYLE[FAMILY_SHARP])), _PREFIXES_FOR_FAMILY);
    function getCanonicalIcon(values) {
      var _famProps;

      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$skipLookups = params.skipLookups,
          skipLookups = _params$skipLookups === void 0 ? false : _params$skipLookups;
      var famProps = (_famProps = {}, _defineProperty(_famProps, FAMILY_CLASSIC, "".concat(config.cssPrefix, "-").concat(FAMILY_CLASSIC)), _defineProperty(_famProps, FAMILY_SHARP, "".concat(config.cssPrefix, "-").concat(FAMILY_SHARP)), _famProps);
      var givenPrefix = null;
      var family = FAMILY_CLASSIC;

      if (values.includes(famProps[FAMILY_CLASSIC]) || values.some(function (v) {
        return PREFIXES_FOR_FAMILY[FAMILY_CLASSIC].includes(v);
      })) {
        family = FAMILY_CLASSIC;
      }

      if (values.includes(famProps[FAMILY_SHARP]) || values.some(function (v) {
        return PREFIXES_FOR_FAMILY[FAMILY_SHARP].includes(v);
      })) {
        family = FAMILY_SHARP;
      }

      var canonical = values.reduce(function (acc, cls) {
        var iconName = getIconName(config.cssPrefix, cls);

        if (styles[cls]) {
          cls = LONG_STYLE[family].includes(cls) ? LONG_STYLE_TO_PREFIX[family][cls] : cls;
          givenPrefix = cls;
          acc.prefix = cls;
        } else if (PREFIXES[family].indexOf(cls) > -1) {
          givenPrefix = cls;
          acc.prefix = getCanonicalPrefix(cls, {
            family: family
          });
        } else if (iconName) {
          acc.iconName = iconName;
        } else if (cls !== config.replacementClass && cls !== famProps[FAMILY_CLASSIC] && cls !== famProps[FAMILY_SHARP]) {
          acc.rest.push(cls);
        }

        if (!skipLookups && acc.prefix && acc.iconName) {
          var shim = givenPrefix === 'fa' ? byOldName(acc.iconName) : {};
          var aliasIconName = byAlias(acc.prefix, acc.iconName);

          if (shim.prefix) {
            givenPrefix = null;
          }

          acc.iconName = shim.iconName || aliasIconName || acc.iconName;
          acc.prefix = shim.prefix || acc.prefix;

          if (acc.prefix === 'far' && !styles['far'] && styles['fas'] && !config.autoFetchSvg) {
            // Allow a fallback from the regular style to solid if regular is not available
            // but only if we aren't auto-fetching SVGs
            acc.prefix = 'fas';
          }
        }

        return acc;
      }, emptyCanonicalIcon());

      if (values.includes('fa-brands') || values.includes('fab')) {
        canonical.prefix = 'fab';
      }

      if (values.includes('fa-duotone') || values.includes('fad')) {
        canonical.prefix = 'fad';
      }

      if (!canonical.prefix && family === FAMILY_SHARP && (styles['fass'] || config.autoFetchSvg)) {
        canonical.prefix = 'fass';
        canonical.iconName = byAlias(canonical.prefix, canonical.iconName) || canonical.iconName;
      }

      if (canonical.prefix === 'fa' || givenPrefix === 'fa') {
        // The fa prefix is not canonical. So if it has made it through until this point
        // we will shift it to the correct prefix.
        canonical.prefix = getDefaultUsablePrefix() || 'fas';
      }

      return canonical;
    }

    var Library = /*#__PURE__*/function () {
      function Library() {
        _classCallCheck(this, Library);

        this.definitions = {};
      }

      _createClass(Library, [{
        key: "add",
        value: function add() {
          var _this = this;

          for (var _len = arguments.length, definitions = new Array(_len), _key = 0; _key < _len; _key++) {
            definitions[_key] = arguments[_key];
          }

          var additions = definitions.reduce(this._pullDefinitions, {});
          Object.keys(additions).forEach(function (key) {
            _this.definitions[key] = _objectSpread2(_objectSpread2({}, _this.definitions[key] || {}), additions[key]);
            defineIcons(key, additions[key]); // TODO can we stop doing this? We can't get the icons by 'fa-solid' any longer so this probably needs to change

            var longPrefix = PREFIX_TO_LONG_STYLE[FAMILY_CLASSIC][key];
            if (longPrefix) defineIcons(longPrefix, additions[key]);
            build();
          });
        }
      }, {
        key: "reset",
        value: function reset() {
          this.definitions = {};
        }
      }, {
        key: "_pullDefinitions",
        value: function _pullDefinitions(additions, definition) {
          var normalized = definition.prefix && definition.iconName && definition.icon ? {
            0: definition
          } : definition;
          Object.keys(normalized).map(function (key) {
            var _normalized$key = normalized[key],
                prefix = _normalized$key.prefix,
                iconName = _normalized$key.iconName,
                icon = _normalized$key.icon;
            var aliases = icon[2];
            if (!additions[prefix]) additions[prefix] = {};

            if (aliases.length > 0) {
              aliases.forEach(function (alias) {
                if (typeof alias === 'string') {
                  additions[prefix][alias] = icon;
                }
              });
            }

            additions[prefix][iconName] = icon;
          });
          return additions;
        }
      }]);

      return Library;
    }();

    var _plugins = [];
    var _hooks = {};
    var providers = {};
    var defaultProviderKeys = Object.keys(providers);
    function registerPlugins(nextPlugins, _ref) {
      var obj = _ref.mixoutsTo;
      _plugins = nextPlugins;
      _hooks = {};
      Object.keys(providers).forEach(function (k) {
        if (defaultProviderKeys.indexOf(k) === -1) {
          delete providers[k];
        }
      });

      _plugins.forEach(function (plugin) {
        var mixout = plugin.mixout ? plugin.mixout() : {};
        Object.keys(mixout).forEach(function (tk) {
          if (typeof mixout[tk] === 'function') {
            obj[tk] = mixout[tk];
          }

          if (_typeof(mixout[tk]) === 'object') {
            Object.keys(mixout[tk]).forEach(function (sk) {
              if (!obj[tk]) {
                obj[tk] = {};
              }

              obj[tk][sk] = mixout[tk][sk];
            });
          }
        });

        if (plugin.hooks) {
          var hooks = plugin.hooks();
          Object.keys(hooks).forEach(function (hook) {
            if (!_hooks[hook]) {
              _hooks[hook] = [];
            }

            _hooks[hook].push(hooks[hook]);
          });
        }

        if (plugin.provides) {
          plugin.provides(providers);
        }
      });

      return obj;
    }
    function chainHooks(hook, accumulator) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var hookFns = _hooks[hook] || [];
      hookFns.forEach(function (hookFn) {
        accumulator = hookFn.apply(null, [accumulator].concat(args)); // eslint-disable-line no-useless-call
      });
      return accumulator;
    }
    function callHooks(hook) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var hookFns = _hooks[hook] || [];
      hookFns.forEach(function (hookFn) {
        hookFn.apply(null, args);
      });
      return undefined;
    }
    function callProvided() {
      var hook = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      return providers[hook] ? providers[hook].apply(null, args) : undefined;
    }

    function findIconDefinition(iconLookup) {
      if (iconLookup.prefix === 'fa') {
        iconLookup.prefix = 'fas';
      }

      var iconName = iconLookup.iconName;
      var prefix = iconLookup.prefix || getDefaultUsablePrefix();
      if (!iconName) return;
      iconName = byAlias(prefix, iconName) || iconName;
      return iconFromMapping(library.definitions, prefix, iconName) || iconFromMapping(namespace.styles, prefix, iconName);
    }
    var library = new Library();
    var noAuto = function noAuto() {
      config.autoReplaceSvg = false;
      config.observeMutations = false;
      callHooks('noAuto');
    };
    var dom = {
      i2svg: function i2svg() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (IS_DOM) {
          callHooks('beforeI2svg', params);
          callProvided('pseudoElements2svg', params);
          return callProvided('i2svg', params);
        } else {
          return Promise.reject('Operation requires a DOM of some kind.');
        }
      },
      watch: function watch() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var autoReplaceSvgRoot = params.autoReplaceSvgRoot;

        if (config.autoReplaceSvg === false) {
          config.autoReplaceSvg = true;
        }

        config.observeMutations = true;
        domready(function () {
          autoReplace({
            autoReplaceSvgRoot: autoReplaceSvgRoot
          });
          callHooks('watch', params);
        });
      }
    };
    var parse = {
      icon: function icon(_icon) {
        if (_icon === null) {
          return null;
        }

        if (_typeof(_icon) === 'object' && _icon.prefix && _icon.iconName) {
          return {
            prefix: _icon.prefix,
            iconName: byAlias(_icon.prefix, _icon.iconName) || _icon.iconName
          };
        }

        if (Array.isArray(_icon) && _icon.length === 2) {
          var iconName = _icon[1].indexOf('fa-') === 0 ? _icon[1].slice(3) : _icon[1];
          var prefix = getCanonicalPrefix(_icon[0]);
          return {
            prefix: prefix,
            iconName: byAlias(prefix, iconName) || iconName
          };
        }

        if (typeof _icon === 'string' && (_icon.indexOf("".concat(config.cssPrefix, "-")) > -1 || _icon.match(ICON_SELECTION_SYNTAX_PATTERN))) {
          var canonicalIcon = getCanonicalIcon(_icon.split(' '), {
            skipLookups: true
          });
          return {
            prefix: canonicalIcon.prefix || getDefaultUsablePrefix(),
            iconName: byAlias(canonicalIcon.prefix, canonicalIcon.iconName) || canonicalIcon.iconName
          };
        }

        if (typeof _icon === 'string') {
          var _prefix = getDefaultUsablePrefix();

          return {
            prefix: _prefix,
            iconName: byAlias(_prefix, _icon) || _icon
          };
        }
      }
    };
    var api = {
      noAuto: noAuto,
      config: config,
      dom: dom,
      parse: parse,
      library: library,
      findIconDefinition: findIconDefinition,
      toHtml: toHtml
    };

    var autoReplace = function autoReplace() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _params$autoReplaceSv = params.autoReplaceSvgRoot,
          autoReplaceSvgRoot = _params$autoReplaceSv === void 0 ? DOCUMENT : _params$autoReplaceSv;
      if ((Object.keys(namespace.styles).length > 0 || config.autoFetchSvg) && IS_DOM && config.autoReplaceSvg) api.dom.i2svg({
        node: autoReplaceSvgRoot
      });
    };

    function domVariants(val, abstractCreator) {
      Object.defineProperty(val, 'abstract', {
        get: abstractCreator
      });
      Object.defineProperty(val, 'html', {
        get: function get() {
          return val.abstract.map(function (a) {
            return toHtml(a);
          });
        }
      });
      Object.defineProperty(val, 'node', {
        get: function get() {
          if (!IS_DOM) return;
          var container = DOCUMENT.createElement('div');
          container.innerHTML = val.html;
          return container.children;
        }
      });
      return val;
    }

    function asIcon (_ref) {
      var children = _ref.children,
          main = _ref.main,
          mask = _ref.mask,
          attributes = _ref.attributes,
          styles = _ref.styles,
          transform = _ref.transform;

      if (transformIsMeaningful(transform) && main.found && !mask.found) {
        var width = main.width,
            height = main.height;
        var offset = {
          x: width / height / 2,
          y: 0.5
        };
        attributes['style'] = joinStyles(_objectSpread2(_objectSpread2({}, styles), {}, {
          'transform-origin': "".concat(offset.x + transform.x / 16, "em ").concat(offset.y + transform.y / 16, "em")
        }));
      }

      return [{
        tag: 'svg',
        attributes: attributes,
        children: children
      }];
    }

    function asSymbol (_ref) {
      var prefix = _ref.prefix,
          iconName = _ref.iconName,
          children = _ref.children,
          attributes = _ref.attributes,
          symbol = _ref.symbol;
      var id = symbol === true ? "".concat(prefix, "-").concat(config.cssPrefix, "-").concat(iconName) : symbol;
      return [{
        tag: 'svg',
        attributes: {
          style: 'display: none;'
        },
        children: [{
          tag: 'symbol',
          attributes: _objectSpread2(_objectSpread2({}, attributes), {}, {
            id: id
          }),
          children: children
        }]
      }];
    }

    function makeInlineSvgAbstract(params) {
      var _params$icons = params.icons,
          main = _params$icons.main,
          mask = _params$icons.mask,
          prefix = params.prefix,
          iconName = params.iconName,
          transform = params.transform,
          symbol = params.symbol,
          title = params.title,
          maskId = params.maskId,
          titleId = params.titleId,
          extra = params.extra,
          _params$watchable = params.watchable,
          watchable = _params$watchable === void 0 ? false : _params$watchable;

      var _ref = mask.found ? mask : main,
          width = _ref.width,
          height = _ref.height;

      var isUploadedIcon = prefix === 'fak';
      var attrClass = [config.replacementClass, iconName ? "".concat(config.cssPrefix, "-").concat(iconName) : ''].filter(function (c) {
        return extra.classes.indexOf(c) === -1;
      }).filter(function (c) {
        return c !== '' || !!c;
      }).concat(extra.classes).join(' ');
      var content = {
        children: [],
        attributes: _objectSpread2(_objectSpread2({}, extra.attributes), {}, {
          'data-prefix': prefix,
          'data-icon': iconName,
          'class': attrClass,
          'role': extra.attributes.role || 'img',
          'xmlns': 'http://www.w3.org/2000/svg',
          'viewBox': "0 0 ".concat(width, " ").concat(height)
        })
      };
      var uploadedIconWidthStyle = isUploadedIcon && !~extra.classes.indexOf('fa-fw') ? {
        width: "".concat(width / height * 16 * 0.0625, "em")
      } : {};

      if (watchable) {
        content.attributes[DATA_FA_I2SVG] = '';
      }

      if (title) {
        content.children.push({
          tag: 'title',
          attributes: {
            id: content.attributes['aria-labelledby'] || "title-".concat(titleId || nextUniqueId())
          },
          children: [title]
        });
        delete content.attributes.title;
      }

      var args = _objectSpread2(_objectSpread2({}, content), {}, {
        prefix: prefix,
        iconName: iconName,
        main: main,
        mask: mask,
        maskId: maskId,
        transform: transform,
        symbol: symbol,
        styles: _objectSpread2(_objectSpread2({}, uploadedIconWidthStyle), extra.styles)
      });

      var _ref2 = mask.found && main.found ? callProvided('generateAbstractMask', args) || {
        children: [],
        attributes: {}
      } : callProvided('generateAbstractIcon', args) || {
        children: [],
        attributes: {}
      },
          children = _ref2.children,
          attributes = _ref2.attributes;

      args.children = children;
      args.attributes = attributes;

      if (symbol) {
        return asSymbol(args);
      } else {
        return asIcon(args);
      }
    }
    function makeLayersTextAbstract(params) {
      var content = params.content,
          width = params.width,
          height = params.height,
          transform = params.transform,
          title = params.title,
          extra = params.extra,
          _params$watchable2 = params.watchable,
          watchable = _params$watchable2 === void 0 ? false : _params$watchable2;

      var attributes = _objectSpread2(_objectSpread2(_objectSpread2({}, extra.attributes), title ? {
        'title': title
      } : {}), {}, {
        'class': extra.classes.join(' ')
      });

      if (watchable) {
        attributes[DATA_FA_I2SVG] = '';
      }

      var styles = _objectSpread2({}, extra.styles);

      if (transformIsMeaningful(transform)) {
        styles['transform'] = transformForCss({
          transform: transform,
          startCentered: true,
          width: width,
          height: height
        });
        styles['-webkit-transform'] = styles['transform'];
      }

      var styleString = joinStyles(styles);

      if (styleString.length > 0) {
        attributes['style'] = styleString;
      }

      var val = [];
      val.push({
        tag: 'span',
        attributes: attributes,
        children: [content]
      });

      if (title) {
        val.push({
          tag: 'span',
          attributes: {
            class: 'sr-only'
          },
          children: [title]
        });
      }

      return val;
    }
    function makeLayersCounterAbstract(params) {
      var content = params.content,
          title = params.title,
          extra = params.extra;

      var attributes = _objectSpread2(_objectSpread2(_objectSpread2({}, extra.attributes), title ? {
        'title': title
      } : {}), {}, {
        'class': extra.classes.join(' ')
      });

      var styleString = joinStyles(extra.styles);

      if (styleString.length > 0) {
        attributes['style'] = styleString;
      }

      var val = [];
      val.push({
        tag: 'span',
        attributes: attributes,
        children: [content]
      });

      if (title) {
        val.push({
          tag: 'span',
          attributes: {
            class: 'sr-only'
          },
          children: [title]
        });
      }

      return val;
    }

    var styles$1 = namespace.styles;
    function asFoundIcon(icon) {
      var width = icon[0];
      var height = icon[1];

      var _icon$slice = icon.slice(4),
          _icon$slice2 = _slicedToArray(_icon$slice, 1),
          vectorData = _icon$slice2[0];

      var element = null;

      if (Array.isArray(vectorData)) {
        element = {
          tag: 'g',
          attributes: {
            class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.GROUP)
          },
          children: [{
            tag: 'path',
            attributes: {
              class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.SECONDARY),
              fill: 'currentColor',
              d: vectorData[0]
            }
          }, {
            tag: 'path',
            attributes: {
              class: "".concat(config.cssPrefix, "-").concat(DUOTONE_CLASSES.PRIMARY),
              fill: 'currentColor',
              d: vectorData[1]
            }
          }]
        };
      } else {
        element = {
          tag: 'path',
          attributes: {
            fill: 'currentColor',
            d: vectorData
          }
        };
      }

      return {
        found: true,
        width: width,
        height: height,
        icon: element
      };
    }
    var missingIconResolutionMixin = {
      found: false,
      width: 512,
      height: 512
    };

    function maybeNotifyMissing(iconName, prefix) {
      if (!PRODUCTION$1 && !config.showMissingIcons && iconName) {
        console.error("Icon with name \"".concat(iconName, "\" and prefix \"").concat(prefix, "\" is missing."));
      }
    }

    function findIcon(iconName, prefix) {
      var givenPrefix = prefix;

      if (prefix === 'fa' && config.styleDefault !== null) {
        prefix = getDefaultUsablePrefix();
      }

      return new Promise(function (resolve, reject) {
        ({
          found: false,
          width: 512,
          height: 512,
          icon: callProvided('missingIconAbstract') || {}
        });

        if (givenPrefix === 'fa') {
          var shim = byOldName(iconName) || {};
          iconName = shim.iconName || iconName;
          prefix = shim.prefix || prefix;
        }

        if (iconName && prefix && styles$1[prefix] && styles$1[prefix][iconName]) {
          var icon = styles$1[prefix][iconName];
          return resolve(asFoundIcon(icon));
        }

        maybeNotifyMissing(iconName, prefix);
        resolve(_objectSpread2(_objectSpread2({}, missingIconResolutionMixin), {}, {
          icon: config.showMissingIcons && iconName ? callProvided('missingIconAbstract') || {} : {}
        }));
      });
    }

    var noop$1 = function noop() {};

    var p = config.measurePerformance && PERFORMANCE && PERFORMANCE.mark && PERFORMANCE.measure ? PERFORMANCE : {
      mark: noop$1,
      measure: noop$1
    };
    var preamble = "FA \"6.5.1\"";

    var begin = function begin(name) {
      p.mark("".concat(preamble, " ").concat(name, " begins"));
      return function () {
        return end(name);
      };
    };

    var end = function end(name) {
      p.mark("".concat(preamble, " ").concat(name, " ends"));
      p.measure("".concat(preamble, " ").concat(name), "".concat(preamble, " ").concat(name, " begins"), "".concat(preamble, " ").concat(name, " ends"));
    };

    var perf = {
      begin: begin,
      end: end
    };

    var noop$2 = function noop() {};

    function isWatched(node) {
      var i2svg = node.getAttribute ? node.getAttribute(DATA_FA_I2SVG) : null;
      return typeof i2svg === 'string';
    }

    function hasPrefixAndIcon(node) {
      var prefix = node.getAttribute ? node.getAttribute(DATA_PREFIX) : null;
      var icon = node.getAttribute ? node.getAttribute(DATA_ICON) : null;
      return prefix && icon;
    }

    function hasBeenReplaced(node) {
      return node && node.classList && node.classList.contains && node.classList.contains(config.replacementClass);
    }

    function getMutator() {
      if (config.autoReplaceSvg === true) {
        return mutators.replace;
      }

      var mutator = mutators[config.autoReplaceSvg];
      return mutator || mutators.replace;
    }

    function createElementNS(tag) {
      return DOCUMENT.createElementNS('http://www.w3.org/2000/svg', tag);
    }

    function createElement(tag) {
      return DOCUMENT.createElement(tag);
    }

    function convertSVG(abstractObj) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$ceFn = params.ceFn,
          ceFn = _params$ceFn === void 0 ? abstractObj.tag === 'svg' ? createElementNS : createElement : _params$ceFn;

      if (typeof abstractObj === 'string') {
        return DOCUMENT.createTextNode(abstractObj);
      }

      var tag = ceFn(abstractObj.tag);
      Object.keys(abstractObj.attributes || []).forEach(function (key) {
        tag.setAttribute(key, abstractObj.attributes[key]);
      });
      var children = abstractObj.children || [];
      children.forEach(function (child) {
        tag.appendChild(convertSVG(child, {
          ceFn: ceFn
        }));
      });
      return tag;
    }

    function nodeAsComment(node) {
      var comment = " ".concat(node.outerHTML, " ");
      /* BEGIN.ATTRIBUTION */

      comment = "".concat(comment, "Font Awesome fontawesome.com ");
      /* END.ATTRIBUTION */

      return comment;
    }

    var mutators = {
      replace: function replace(mutation) {
        var node = mutation[0];

        if (node.parentNode) {
          mutation[1].forEach(function (_abstract) {
            node.parentNode.insertBefore(convertSVG(_abstract), node);
          });

          if (node.getAttribute(DATA_FA_I2SVG) === null && config.keepOriginalSource) {
            var comment = DOCUMENT.createComment(nodeAsComment(node));
            node.parentNode.replaceChild(comment, node);
          } else {
            node.remove();
          }
        }
      },
      nest: function nest(mutation) {
        var node = mutation[0];
        var _abstract2 = mutation[1]; // If we already have a replaced node we do not want to continue nesting within it.
        // Short-circuit to the standard replacement

        if (~classArray(node).indexOf(config.replacementClass)) {
          return mutators.replace(mutation);
        }

        var forSvg = new RegExp("".concat(config.cssPrefix, "-.*"));
        delete _abstract2[0].attributes.id;

        if (_abstract2[0].attributes.class) {
          var splitClasses = _abstract2[0].attributes.class.split(' ').reduce(function (acc, cls) {
            if (cls === config.replacementClass || cls.match(forSvg)) {
              acc.toSvg.push(cls);
            } else {
              acc.toNode.push(cls);
            }

            return acc;
          }, {
            toNode: [],
            toSvg: []
          });

          _abstract2[0].attributes.class = splitClasses.toSvg.join(' ');

          if (splitClasses.toNode.length === 0) {
            node.removeAttribute('class');
          } else {
            node.setAttribute('class', splitClasses.toNode.join(' '));
          }
        }

        var newInnerHTML = _abstract2.map(function (a) {
          return toHtml(a);
        }).join('\n');

        node.setAttribute(DATA_FA_I2SVG, '');
        node.innerHTML = newInnerHTML;
      }
    };

    function performOperationSync(op) {
      op();
    }

    function perform(mutations, callback) {
      var callbackFunction = typeof callback === 'function' ? callback : noop$2;

      if (mutations.length === 0) {
        callbackFunction();
      } else {
        var frame = performOperationSync;

        if (config.mutateApproach === MUTATION_APPROACH_ASYNC) {
          frame = WINDOW.requestAnimationFrame || performOperationSync;
        }

        frame(function () {
          var mutator = getMutator();
          var mark = perf.begin('mutate');
          mutations.map(mutator);
          mark();
          callbackFunction();
        });
      }
    }
    var disabled = false;
    function disableObservation() {
      disabled = true;
    }
    function enableObservation() {
      disabled = false;
    }
    var mo = null;
    function observe(options) {
      if (!MUTATION_OBSERVER) {
        return;
      }

      if (!config.observeMutations) {
        return;
      }

      var _options$treeCallback = options.treeCallback,
          treeCallback = _options$treeCallback === void 0 ? noop$2 : _options$treeCallback,
          _options$nodeCallback = options.nodeCallback,
          nodeCallback = _options$nodeCallback === void 0 ? noop$2 : _options$nodeCallback,
          _options$pseudoElemen = options.pseudoElementsCallback,
          pseudoElementsCallback = _options$pseudoElemen === void 0 ? noop$2 : _options$pseudoElemen,
          _options$observeMutat = options.observeMutationsRoot,
          observeMutationsRoot = _options$observeMutat === void 0 ? DOCUMENT : _options$observeMutat;
      mo = new MUTATION_OBSERVER(function (objects) {
        if (disabled) return;
        var defaultPrefix = getDefaultUsablePrefix();
        toArray(objects).forEach(function (mutationRecord) {
          if (mutationRecord.type === 'childList' && mutationRecord.addedNodes.length > 0 && !isWatched(mutationRecord.addedNodes[0])) {
            if (config.searchPseudoElements) {
              pseudoElementsCallback(mutationRecord.target);
            }

            treeCallback(mutationRecord.target);
          }

          if (mutationRecord.type === 'attributes' && mutationRecord.target.parentNode && config.searchPseudoElements) {
            pseudoElementsCallback(mutationRecord.target.parentNode);
          }

          if (mutationRecord.type === 'attributes' && isWatched(mutationRecord.target) && ~ATTRIBUTES_WATCHED_FOR_MUTATION.indexOf(mutationRecord.attributeName)) {
            if (mutationRecord.attributeName === 'class' && hasPrefixAndIcon(mutationRecord.target)) {
              var _getCanonicalIcon = getCanonicalIcon(classArray(mutationRecord.target)),
                  prefix = _getCanonicalIcon.prefix,
                  iconName = _getCanonicalIcon.iconName;

              mutationRecord.target.setAttribute(DATA_PREFIX, prefix || defaultPrefix);
              if (iconName) mutationRecord.target.setAttribute(DATA_ICON, iconName);
            } else if (hasBeenReplaced(mutationRecord.target)) {
              nodeCallback(mutationRecord.target);
            }
          }
        });
      });
      if (!IS_DOM) return;
      mo.observe(observeMutationsRoot, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      });
    }
    function disconnect() {
      if (!mo) return;
      mo.disconnect();
    }

    function styleParser (node) {
      var style = node.getAttribute('style');
      var val = [];

      if (style) {
        val = style.split(';').reduce(function (acc, style) {
          var styles = style.split(':');
          var prop = styles[0];
          var value = styles.slice(1);

          if (prop && value.length > 0) {
            acc[prop] = value.join(':').trim();
          }

          return acc;
        }, {});
      }

      return val;
    }

    function classParser (node) {
      var existingPrefix = node.getAttribute('data-prefix');
      var existingIconName = node.getAttribute('data-icon');
      var innerText = node.innerText !== undefined ? node.innerText.trim() : '';
      var val = getCanonicalIcon(classArray(node));

      if (!val.prefix) {
        val.prefix = getDefaultUsablePrefix();
      }

      if (existingPrefix && existingIconName) {
        val.prefix = existingPrefix;
        val.iconName = existingIconName;
      }

      if (val.iconName && val.prefix) {
        return val;
      }

      if (val.prefix && innerText.length > 0) {
        val.iconName = byLigature(val.prefix, node.innerText) || byUnicode(val.prefix, toHex(node.innerText));
      }

      if (!val.iconName && config.autoFetchSvg && node.firstChild && node.firstChild.nodeType === Node.TEXT_NODE) {
        val.iconName = node.firstChild.data;
      }

      return val;
    }

    function attributesParser (node) {
      var extraAttributes = toArray(node.attributes).reduce(function (acc, attr) {
        if (acc.name !== 'class' && acc.name !== 'style') {
          acc[attr.name] = attr.value;
        }

        return acc;
      }, {});
      var title = node.getAttribute('title');
      var titleId = node.getAttribute('data-fa-title-id');

      if (config.autoA11y) {
        if (title) {
          extraAttributes['aria-labelledby'] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
        } else {
          extraAttributes['aria-hidden'] = 'true';
          extraAttributes['focusable'] = 'false';
        }
      }

      return extraAttributes;
    }

    function blankMeta() {
      return {
        iconName: null,
        title: null,
        titleId: null,
        prefix: null,
        transform: meaninglessTransform,
        symbol: false,
        mask: {
          iconName: null,
          prefix: null,
          rest: []
        },
        maskId: null,
        extra: {
          classes: [],
          styles: {},
          attributes: {}
        }
      };
    }
    function parseMeta(node) {
      var parser = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        styleParser: true
      };

      var _classParser = classParser(node),
          iconName = _classParser.iconName,
          prefix = _classParser.prefix,
          extraClasses = _classParser.rest;

      var extraAttributes = attributesParser(node);
      var pluginMeta = chainHooks('parseNodeAttributes', {}, node);
      var extraStyles = parser.styleParser ? styleParser(node) : [];
      return _objectSpread2({
        iconName: iconName,
        title: node.getAttribute('title'),
        titleId: node.getAttribute('data-fa-title-id'),
        prefix: prefix,
        transform: meaninglessTransform,
        mask: {
          iconName: null,
          prefix: null,
          rest: []
        },
        maskId: null,
        symbol: false,
        extra: {
          classes: extraClasses,
          styles: extraStyles,
          attributes: extraAttributes
        }
      }, pluginMeta);
    }

    var styles$2 = namespace.styles;

    function generateMutation(node) {
      var nodeMeta = config.autoReplaceSvg === 'nest' ? parseMeta(node, {
        styleParser: false
      }) : parseMeta(node);

      if (~nodeMeta.extra.classes.indexOf(LAYERS_TEXT_CLASSNAME)) {
        return callProvided('generateLayersText', node, nodeMeta);
      } else {
        return callProvided('generateSvgReplacementMutation', node, nodeMeta);
      }
    }

    var knownPrefixes = new Set();
    FAMILIES.map(function (family) {
      knownPrefixes.add("fa-".concat(family));
    });
    Object.keys(PREFIX_TO_STYLE[FAMILY_CLASSIC]).map(knownPrefixes.add.bind(knownPrefixes));
    Object.keys(PREFIX_TO_STYLE[FAMILY_SHARP]).map(knownPrefixes.add.bind(knownPrefixes));
    knownPrefixes = _toConsumableArray(knownPrefixes);

    function onTree(root) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (!IS_DOM) return Promise.resolve();
      var htmlClassList = DOCUMENT.documentElement.classList;

      var hclAdd = function hclAdd(suffix) {
        return htmlClassList.add("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
      };

      var hclRemove = function hclRemove(suffix) {
        return htmlClassList.remove("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
      };

      var prefixes = config.autoFetchSvg ? knownPrefixes : FAMILIES.map(function (f) {
        return "fa-".concat(f);
      }).concat(Object.keys(styles$2));

      if (!prefixes.includes('fa')) {
        prefixes.push('fa');
      }

      var prefixesDomQuery = [".".concat(LAYERS_TEXT_CLASSNAME, ":not([").concat(DATA_FA_I2SVG, "])")].concat(prefixes.map(function (p) {
        return ".".concat(p, ":not([").concat(DATA_FA_I2SVG, "])");
      })).join(', ');

      if (prefixesDomQuery.length === 0) {
        return Promise.resolve();
      }

      var candidates = [];

      try {
        candidates = toArray(root.querySelectorAll(prefixesDomQuery));
      } catch (e) {// noop
      }

      if (candidates.length > 0) {
        hclAdd('pending');
        hclRemove('complete');
      } else {
        return Promise.resolve();
      }

      var mark = perf.begin('onTree');
      var mutations = candidates.reduce(function (acc, node) {
        try {
          var mutation = generateMutation(node);

          if (mutation) {
            acc.push(mutation);
          }
        } catch (e) {
          if (!PRODUCTION$1) {
            if (e.name === 'MissingIcon') {
              console.error(e);
            }
          }
        }

        return acc;
      }, []);
      return new Promise(function (resolve, reject) {
        Promise.all(mutations).then(function (resolvedMutations) {
          perform(resolvedMutations, function () {
            hclAdd('active');
            hclAdd('complete');
            hclRemove('pending');
            if (typeof callback === 'function') callback();
            mark();
            resolve();
          });
        }).catch(function (e) {
          mark();
          reject(e);
        });
      });
    }

    function onNode(node) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      generateMutation(node).then(function (mutation) {
        if (mutation) {
          perform([mutation], callback);
        }
      });
    }

    function resolveIcons(next) {
      return function (maybeIconDefinition) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var iconDefinition = (maybeIconDefinition || {}).icon ? maybeIconDefinition : findIconDefinition(maybeIconDefinition || {});
        var mask = params.mask;

        if (mask) {
          mask = (mask || {}).icon ? mask : findIconDefinition(mask || {});
        }

        return next(iconDefinition, _objectSpread2(_objectSpread2({}, params), {}, {
          mask: mask
        }));
      };
    }

    var render = function render(iconDefinition) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$transform = params.transform,
          transform = _params$transform === void 0 ? meaninglessTransform : _params$transform,
          _params$symbol = params.symbol,
          symbol = _params$symbol === void 0 ? false : _params$symbol,
          _params$mask = params.mask,
          mask = _params$mask === void 0 ? null : _params$mask,
          _params$maskId = params.maskId,
          maskId = _params$maskId === void 0 ? null : _params$maskId,
          _params$title = params.title,
          title = _params$title === void 0 ? null : _params$title,
          _params$titleId = params.titleId,
          titleId = _params$titleId === void 0 ? null : _params$titleId,
          _params$classes = params.classes,
          classes = _params$classes === void 0 ? [] : _params$classes,
          _params$attributes = params.attributes,
          attributes = _params$attributes === void 0 ? {} : _params$attributes,
          _params$styles = params.styles,
          styles = _params$styles === void 0 ? {} : _params$styles;
      if (!iconDefinition) return;
      var prefix = iconDefinition.prefix,
          iconName = iconDefinition.iconName,
          icon = iconDefinition.icon;
      return domVariants(_objectSpread2({
        type: 'icon'
      }, iconDefinition), function () {
        callHooks('beforeDOMElementCreation', {
          iconDefinition: iconDefinition,
          params: params
        });

        if (config.autoA11y) {
          if (title) {
            attributes['aria-labelledby'] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
          } else {
            attributes['aria-hidden'] = 'true';
            attributes['focusable'] = 'false';
          }
        }

        return makeInlineSvgAbstract({
          icons: {
            main: asFoundIcon(icon),
            mask: mask ? asFoundIcon(mask.icon) : {
              found: false,
              width: null,
              height: null,
              icon: {}
            }
          },
          prefix: prefix,
          iconName: iconName,
          transform: _objectSpread2(_objectSpread2({}, meaninglessTransform), transform),
          symbol: symbol,
          title: title,
          maskId: maskId,
          titleId: titleId,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: classes
          }
        });
      });
    };
    var ReplaceElements = {
      mixout: function mixout() {
        return {
          icon: resolveIcons(render)
        };
      },
      hooks: function hooks() {
        return {
          mutationObserverCallbacks: function mutationObserverCallbacks(accumulator) {
            accumulator.treeCallback = onTree;
            accumulator.nodeCallback = onNode;
            return accumulator;
          }
        };
      },
      provides: function provides(providers$$1) {
        providers$$1.i2svg = function (params) {
          var _params$node = params.node,
              node = _params$node === void 0 ? DOCUMENT : _params$node,
              _params$callback = params.callback,
              callback = _params$callback === void 0 ? function () {} : _params$callback;
          return onTree(node, callback);
        };

        providers$$1.generateSvgReplacementMutation = function (node, nodeMeta) {
          var iconName = nodeMeta.iconName,
              title = nodeMeta.title,
              titleId = nodeMeta.titleId,
              prefix = nodeMeta.prefix,
              transform = nodeMeta.transform,
              symbol = nodeMeta.symbol,
              mask = nodeMeta.mask,
              maskId = nodeMeta.maskId,
              extra = nodeMeta.extra;
          return new Promise(function (resolve, reject) {
            Promise.all([findIcon(iconName, prefix), mask.iconName ? findIcon(mask.iconName, mask.prefix) : Promise.resolve({
              found: false,
              width: 512,
              height: 512,
              icon: {}
            })]).then(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  main = _ref2[0],
                  mask = _ref2[1];

              resolve([node, makeInlineSvgAbstract({
                icons: {
                  main: main,
                  mask: mask
                },
                prefix: prefix,
                iconName: iconName,
                transform: transform,
                symbol: symbol,
                maskId: maskId,
                title: title,
                titleId: titleId,
                extra: extra,
                watchable: true
              })]);
            }).catch(reject);
          });
        };

        providers$$1.generateAbstractIcon = function (_ref3) {
          var children = _ref3.children,
              attributes = _ref3.attributes,
              main = _ref3.main,
              transform = _ref3.transform,
              styles = _ref3.styles;
          var styleString = joinStyles(styles);

          if (styleString.length > 0) {
            attributes['style'] = styleString;
          }

          var nextChild;

          if (transformIsMeaningful(transform)) {
            nextChild = callProvided('generateAbstractTransformGrouping', {
              main: main,
              transform: transform,
              containerWidth: main.width,
              iconWidth: main.width
            });
          }

          children.push(nextChild || main.icon);
          return {
            children: children,
            attributes: attributes
          };
        };
      }
    };

    var Layers = {
      mixout: function mixout() {
        return {
          layer: function layer(assembler) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var _params$classes = params.classes,
                classes = _params$classes === void 0 ? [] : _params$classes;
            return domVariants({
              type: 'layer'
            }, function () {
              callHooks('beforeDOMElementCreation', {
                assembler: assembler,
                params: params
              });
              var children = [];
              assembler(function (args) {
                Array.isArray(args) ? args.map(function (a) {
                  children = children.concat(a.abstract);
                }) : children = children.concat(args.abstract);
              });
              return [{
                tag: 'span',
                attributes: {
                  class: ["".concat(config.cssPrefix, "-layers")].concat(_toConsumableArray(classes)).join(' ')
                },
                children: children
              }];
            });
          }
        };
      }
    };

    var LayersCounter = {
      mixout: function mixout() {
        return {
          counter: function counter(content) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var _params$title = params.title,
                title = _params$title === void 0 ? null : _params$title,
                _params$classes = params.classes,
                classes = _params$classes === void 0 ? [] : _params$classes,
                _params$attributes = params.attributes,
                attributes = _params$attributes === void 0 ? {} : _params$attributes,
                _params$styles = params.styles,
                styles = _params$styles === void 0 ? {} : _params$styles;
            return domVariants({
              type: 'counter',
              content: content
            }, function () {
              callHooks('beforeDOMElementCreation', {
                content: content,
                params: params
              });
              return makeLayersCounterAbstract({
                content: content.toString(),
                title: title,
                extra: {
                  attributes: attributes,
                  styles: styles,
                  classes: ["".concat(config.cssPrefix, "-layers-counter")].concat(_toConsumableArray(classes))
                }
              });
            });
          }
        };
      }
    };

    var LayersText = {
      mixout: function mixout() {
        return {
          text: function text(content) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var _params$transform = params.transform,
                transform = _params$transform === void 0 ? meaninglessTransform : _params$transform,
                _params$title = params.title,
                title = _params$title === void 0 ? null : _params$title,
                _params$classes = params.classes,
                classes = _params$classes === void 0 ? [] : _params$classes,
                _params$attributes = params.attributes,
                attributes = _params$attributes === void 0 ? {} : _params$attributes,
                _params$styles = params.styles,
                styles = _params$styles === void 0 ? {} : _params$styles;
            return domVariants({
              type: 'text',
              content: content
            }, function () {
              callHooks('beforeDOMElementCreation', {
                content: content,
                params: params
              });
              return makeLayersTextAbstract({
                content: content,
                transform: _objectSpread2(_objectSpread2({}, meaninglessTransform), transform),
                title: title,
                extra: {
                  attributes: attributes,
                  styles: styles,
                  classes: ["".concat(config.cssPrefix, "-layers-text")].concat(_toConsumableArray(classes))
                }
              });
            });
          }
        };
      },
      provides: function provides(providers$$1) {
        providers$$1.generateLayersText = function (node, nodeMeta) {
          var title = nodeMeta.title,
              transform = nodeMeta.transform,
              extra = nodeMeta.extra;
          var width = null;
          var height = null;

          if (IS_IE) {
            var computedFontSize = parseInt(getComputedStyle(node).fontSize, 10);
            var boundingClientRect = node.getBoundingClientRect();
            width = boundingClientRect.width / computedFontSize;
            height = boundingClientRect.height / computedFontSize;
          }

          if (config.autoA11y && !title) {
            extra.attributes['aria-hidden'] = 'true';
          }

          return Promise.resolve([node, makeLayersTextAbstract({
            content: node.innerHTML,
            width: width,
            height: height,
            transform: transform,
            title: title,
            extra: extra,
            watchable: true
          })]);
        };
      }
    };

    var CLEAN_CONTENT_PATTERN = new RegExp("\"", 'ug');
    var SECONDARY_UNICODE_RANGE = [1105920, 1112319];
    function hexValueFromContent(content) {
      var cleaned = content.replace(CLEAN_CONTENT_PATTERN, '');
      var codePoint = codePointAt(cleaned, 0);
      var isPrependTen = codePoint >= SECONDARY_UNICODE_RANGE[0] && codePoint <= SECONDARY_UNICODE_RANGE[1];
      var isDoubled = cleaned.length === 2 ? cleaned[0] === cleaned[1] : false;
      return {
        value: isDoubled ? toHex(cleaned[0]) : toHex(cleaned),
        isSecondary: isPrependTen || isDoubled
      };
    }

    function replaceForPosition(node, position) {
      var pendingAttribute = "".concat(DATA_FA_PSEUDO_ELEMENT_PENDING).concat(position.replace(':', '-'));
      return new Promise(function (resolve, reject) {
        if (node.getAttribute(pendingAttribute) !== null) {
          // This node is already being processed
          return resolve();
        }

        var children = toArray(node.children);
        var alreadyProcessedPseudoElement = children.filter(function (c) {
          return c.getAttribute(DATA_FA_PSEUDO_ELEMENT) === position;
        })[0];
        var styles = WINDOW.getComputedStyle(node, position);
        var fontFamily = styles.getPropertyValue('font-family').match(FONT_FAMILY_PATTERN);
        var fontWeight = styles.getPropertyValue('font-weight');
        var content = styles.getPropertyValue('content');

        if (alreadyProcessedPseudoElement && !fontFamily) {
          // If we've already processed it but the current computed style does not result in a font-family,
          // that probably means that a class name that was previously present to make the icon has been
          // removed. So we now should delete the icon.
          node.removeChild(alreadyProcessedPseudoElement);
          return resolve();
        } else if (fontFamily && content !== 'none' && content !== '') {
          var _content = styles.getPropertyValue('content');

          var family = ~['Sharp'].indexOf(fontFamily[2]) ? FAMILY_SHARP : FAMILY_CLASSIC;
          var prefix = ~['Solid', 'Regular', 'Light', 'Thin', 'Duotone', 'Brands', 'Kit'].indexOf(fontFamily[2]) ? STYLE_TO_PREFIX[family][fontFamily[2].toLowerCase()] : FONT_WEIGHT_TO_PREFIX[family][fontWeight];

          var _hexValueFromContent = hexValueFromContent(_content),
              hexValue = _hexValueFromContent.value,
              isSecondary = _hexValueFromContent.isSecondary;

          var isV4 = fontFamily[0].startsWith('FontAwesome');
          var iconName = byUnicode(prefix, hexValue);
          var iconIdentifier = iconName;

          if (isV4) {
            var iconName4 = byOldUnicode(hexValue);

            if (iconName4.iconName && iconName4.prefix) {
              iconName = iconName4.iconName;
              prefix = iconName4.prefix;
            }
          } // Only convert the pseudo element in this ::before/::after position into an icon if we haven't
          // already done so with the same prefix and iconName


          if (iconName && !isSecondary && (!alreadyProcessedPseudoElement || alreadyProcessedPseudoElement.getAttribute(DATA_PREFIX) !== prefix || alreadyProcessedPseudoElement.getAttribute(DATA_ICON) !== iconIdentifier)) {
            node.setAttribute(pendingAttribute, iconIdentifier);

            if (alreadyProcessedPseudoElement) {
              // Delete the old one, since we're replacing it with a new one
              node.removeChild(alreadyProcessedPseudoElement);
            }

            var meta = blankMeta();
            var extra = meta.extra;
            extra.attributes[DATA_FA_PSEUDO_ELEMENT] = position;
            findIcon(iconName, prefix).then(function (main) {
              var _abstract = makeInlineSvgAbstract(_objectSpread2(_objectSpread2({}, meta), {}, {
                icons: {
                  main: main,
                  mask: emptyCanonicalIcon()
                },
                prefix: prefix,
                iconName: iconIdentifier,
                extra: extra,
                watchable: true
              }));

              var element = DOCUMENT.createElementNS('http://www.w3.org/2000/svg', 'svg');

              if (position === '::before') {
                node.insertBefore(element, node.firstChild);
              } else {
                node.appendChild(element);
              }

              element.outerHTML = _abstract.map(function (a) {
                return toHtml(a);
              }).join('\n');
              node.removeAttribute(pendingAttribute);
              resolve();
            }).catch(reject);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }

    function replace(node) {
      return Promise.all([replaceForPosition(node, '::before'), replaceForPosition(node, '::after')]);
    }

    function processable(node) {
      return node.parentNode !== document.head && !~TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS.indexOf(node.tagName.toUpperCase()) && !node.getAttribute(DATA_FA_PSEUDO_ELEMENT) && (!node.parentNode || node.parentNode.tagName !== 'svg');
    }

    function searchPseudoElements(root) {
      if (!IS_DOM) return;
      return new Promise(function (resolve, reject) {
        var operations = toArray(root.querySelectorAll('*')).filter(processable).map(replace);
        var end = perf.begin('searchPseudoElements');
        disableObservation();
        Promise.all(operations).then(function () {
          end();
          enableObservation();
          resolve();
        }).catch(function () {
          end();
          enableObservation();
          reject();
        });
      });
    }

    var PseudoElements = {
      hooks: function hooks() {
        return {
          mutationObserverCallbacks: function mutationObserverCallbacks(accumulator) {
            accumulator.pseudoElementsCallback = searchPseudoElements;
            return accumulator;
          }
        };
      },
      provides: function provides(providers$$1) {
        providers$$1.pseudoElements2svg = function (params) {
          var _params$node = params.node,
              node = _params$node === void 0 ? DOCUMENT : _params$node;

          if (config.searchPseudoElements) {
            searchPseudoElements(node);
          }
        };
      }
    };

    var _unwatched = false;
    var MutationObserver$1 = {
      mixout: function mixout() {
        return {
          dom: {
            unwatch: function unwatch() {
              disableObservation();
              _unwatched = true;
            }
          }
        };
      },
      hooks: function hooks() {
        return {
          bootstrap: function bootstrap() {
            observe(chainHooks('mutationObserverCallbacks', {}));
          },
          noAuto: function noAuto() {
            disconnect();
          },
          watch: function watch(params) {
            var observeMutationsRoot = params.observeMutationsRoot;

            if (_unwatched) {
              enableObservation();
            } else {
              observe(chainHooks('mutationObserverCallbacks', {
                observeMutationsRoot: observeMutationsRoot
              }));
            }
          }
        };
      }
    };

    var parseTransformString = function parseTransformString(transformString) {
      var transform = {
        size: 16,
        x: 0,
        y: 0,
        flipX: false,
        flipY: false,
        rotate: 0
      };
      return transformString.toLowerCase().split(' ').reduce(function (acc, n) {
        var parts = n.toLowerCase().split('-');
        var first = parts[0];
        var rest = parts.slice(1).join('-');

        if (first && rest === 'h') {
          acc.flipX = true;
          return acc;
        }

        if (first && rest === 'v') {
          acc.flipY = true;
          return acc;
        }

        rest = parseFloat(rest);

        if (isNaN(rest)) {
          return acc;
        }

        switch (first) {
          case 'grow':
            acc.size = acc.size + rest;
            break;

          case 'shrink':
            acc.size = acc.size - rest;
            break;

          case 'left':
            acc.x = acc.x - rest;
            break;

          case 'right':
            acc.x = acc.x + rest;
            break;

          case 'up':
            acc.y = acc.y - rest;
            break;

          case 'down':
            acc.y = acc.y + rest;
            break;

          case 'rotate':
            acc.rotate = acc.rotate + rest;
            break;
        }

        return acc;
      }, transform);
    };
    var PowerTransforms = {
      mixout: function mixout() {
        return {
          parse: {
            transform: function transform(transformString) {
              return parseTransformString(transformString);
            }
          }
        };
      },
      hooks: function hooks() {
        return {
          parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
            var transformString = node.getAttribute('data-fa-transform');

            if (transformString) {
              accumulator.transform = parseTransformString(transformString);
            }

            return accumulator;
          }
        };
      },
      provides: function provides(providers) {
        providers.generateAbstractTransformGrouping = function (_ref) {
          var main = _ref.main,
              transform = _ref.transform,
              containerWidth = _ref.containerWidth,
              iconWidth = _ref.iconWidth;
          var outer = {
            transform: "translate(".concat(containerWidth / 2, " 256)")
          };
          var innerTranslate = "translate(".concat(transform.x * 32, ", ").concat(transform.y * 32, ") ");
          var innerScale = "scale(".concat(transform.size / 16 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / 16 * (transform.flipY ? -1 : 1), ") ");
          var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
          var inner = {
            transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
          };
          var path = {
            transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
          };
          var operations = {
            outer: outer,
            inner: inner,
            path: path
          };
          return {
            tag: 'g',
            attributes: _objectSpread2({}, operations.outer),
            children: [{
              tag: 'g',
              attributes: _objectSpread2({}, operations.inner),
              children: [{
                tag: main.icon.tag,
                children: main.icon.children,
                attributes: _objectSpread2(_objectSpread2({}, main.icon.attributes), operations.path)
              }]
            }]
          };
        };
      }
    };

    var ALL_SPACE = {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%'
    };

    function fillBlack(_abstract) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (_abstract.attributes && (_abstract.attributes.fill || force)) {
        _abstract.attributes.fill = 'black';
      }

      return _abstract;
    }

    function deGroup(_abstract2) {
      if (_abstract2.tag === 'g') {
        return _abstract2.children;
      } else {
        return [_abstract2];
      }
    }

    var Masks = {
      hooks: function hooks() {
        return {
          parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
            var maskData = node.getAttribute('data-fa-mask');
            var mask = !maskData ? emptyCanonicalIcon() : getCanonicalIcon(maskData.split(' ').map(function (i) {
              return i.trim();
            }));

            if (!mask.prefix) {
              mask.prefix = getDefaultUsablePrefix();
            }

            accumulator.mask = mask;
            accumulator.maskId = node.getAttribute('data-fa-mask-id');
            return accumulator;
          }
        };
      },
      provides: function provides(providers) {
        providers.generateAbstractMask = function (_ref) {
          var children = _ref.children,
              attributes = _ref.attributes,
              main = _ref.main,
              mask = _ref.mask,
              explicitMaskId = _ref.maskId,
              transform = _ref.transform;
          var mainWidth = main.width,
              mainPath = main.icon;
          var maskWidth = mask.width,
              maskPath = mask.icon;
          var trans = transformForSvg({
            transform: transform,
            containerWidth: maskWidth,
            iconWidth: mainWidth
          });
          var maskRect = {
            tag: 'rect',
            attributes: _objectSpread2(_objectSpread2({}, ALL_SPACE), {}, {
              fill: 'white'
            })
          };
          var maskInnerGroupChildrenMixin = mainPath.children ? {
            children: mainPath.children.map(fillBlack)
          } : {};
          var maskInnerGroup = {
            tag: 'g',
            attributes: _objectSpread2({}, trans.inner),
            children: [fillBlack(_objectSpread2({
              tag: mainPath.tag,
              attributes: _objectSpread2(_objectSpread2({}, mainPath.attributes), trans.path)
            }, maskInnerGroupChildrenMixin))]
          };
          var maskOuterGroup = {
            tag: 'g',
            attributes: _objectSpread2({}, trans.outer),
            children: [maskInnerGroup]
          };
          var maskId = "mask-".concat(explicitMaskId || nextUniqueId());
          var clipId = "clip-".concat(explicitMaskId || nextUniqueId());
          var maskTag = {
            tag: 'mask',
            attributes: _objectSpread2(_objectSpread2({}, ALL_SPACE), {}, {
              id: maskId,
              maskUnits: 'userSpaceOnUse',
              maskContentUnits: 'userSpaceOnUse'
            }),
            children: [maskRect, maskOuterGroup]
          };
          var defs = {
            tag: 'defs',
            children: [{
              tag: 'clipPath',
              attributes: {
                id: clipId
              },
              children: deGroup(maskPath)
            }, maskTag]
          };
          children.push(defs, {
            tag: 'rect',
            attributes: _objectSpread2({
              fill: 'currentColor',
              'clip-path': "url(#".concat(clipId, ")"),
              mask: "url(#".concat(maskId, ")")
            }, ALL_SPACE)
          });
          return {
            children: children,
            attributes: attributes
          };
        };
      }
    };

    var MissingIconIndicator = {
      provides: function provides(providers) {
        var reduceMotion = false;

        if (WINDOW.matchMedia) {
          reduceMotion = WINDOW.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        providers.missingIconAbstract = function () {
          var gChildren = [];
          var FILL = {
            fill: 'currentColor'
          };
          var ANIMATION_BASE = {
            attributeType: 'XML',
            repeatCount: 'indefinite',
            dur: '2s'
          }; // Ring

          gChildren.push({
            tag: 'path',
            attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
              d: 'M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z'
            })
          });

          var OPACITY_ANIMATE = _objectSpread2(_objectSpread2({}, ANIMATION_BASE), {}, {
            attributeName: 'opacity'
          });

          var dot = {
            tag: 'circle',
            attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
              cx: '256',
              cy: '364',
              r: '28'
            }),
            children: []
          };

          if (!reduceMotion) {
            dot.children.push({
              tag: 'animate',
              attributes: _objectSpread2(_objectSpread2({}, ANIMATION_BASE), {}, {
                attributeName: 'r',
                values: '28;14;28;28;14;28;'
              })
            }, {
              tag: 'animate',
              attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
                values: '1;0;1;1;0;1;'
              })
            });
          }

          gChildren.push(dot);
          gChildren.push({
            tag: 'path',
            attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
              opacity: '1',
              d: 'M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z'
            }),
            children: reduceMotion ? [] : [{
              tag: 'animate',
              attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
                values: '1;0;0;0;0;1;'
              })
            }]
          });

          if (!reduceMotion) {
            // Exclamation
            gChildren.push({
              tag: 'path',
              attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
                opacity: '0',
                d: 'M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z'
              }),
              children: [{
                tag: 'animate',
                attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
                  values: '0;0;1;1;0;0;'
                })
              }]
            });
          }

          return {
            tag: 'g',
            attributes: {
              'class': 'missing'
            },
            children: gChildren
          };
        };
      }
    };

    var SvgSymbols = {
      hooks: function hooks() {
        return {
          parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
            var symbolData = node.getAttribute('data-fa-symbol');
            var symbol = symbolData === null ? false : symbolData === '' ? true : symbolData;
            accumulator['symbol'] = symbol;
            return accumulator;
          }
        };
      }
    };

    var plugins = [InjectCSS, ReplaceElements, Layers, LayersCounter, LayersText, PseudoElements, MutationObserver$1, PowerTransforms, Masks, MissingIconIndicator, SvgSymbols];

    registerPlugins(plugins, {
      mixoutsTo: api
    });
    api.noAuto;
    api.config;
    api.library;
    api.dom;
    var parse$1 = api.parse;
    api.findIconDefinition;
    api.toHtml;
    var icon = api.icon;
    api.layer;
    api.text;
    api.counter;

    let PRODUCTION = false;

    try {
      PRODUCTION = process.env.NODE_ENV === 'production';
    } catch (e) {}

    function log(...args) {
      if (!PRODUCTION && console && typeof console.error === 'function') {
        console.error(...args);
      }
    }

    // Normalize icon arguments
    function normalizeIconArgs(icon) {
      // this has everything that it needs to be rendered which means it was probably imported
      // directly from an icon svg package
      if (icon && typeof icon === 'object' && icon.prefix && icon.iconName && icon.icon) {
        return icon
      }

      if (parse$1.icon) {
        return parse$1.icon(icon)
      }

      // if the icon is null, there's nothing to do
      if (icon === null) {
        return null
      }

      // if the icon is an object and has a prefix and an icon name, return it
      if (icon && typeof icon === 'object' && icon.prefix && icon.iconName) {
        return icon
      }

      // if it's an array with length of two
      if (Array.isArray(icon) && icon.length === 2) {
        // use the first item as prefix, second as icon name
        return { prefix: icon[0], iconName: icon[1] }
      }

      // if it's a string, use it as the icon name
      if (typeof icon === 'string') {
        return { prefix: 'fas', iconName: icon }
      }
    }

    // creates an object with a key of key
    // and a value of value
    // if certain conditions are met
    function objectWithKey(key, value) {
      // if the value is a non-empty array
      // or it's not an array but it is truthy
      // then create the object with the key and the value
      // if not, return an empty array
      return (Array.isArray(value) && value.length > 0) ||
        (!Array.isArray(value) && value)
        ? { [key]: value }
        : {}
    }

    /* node_modules\@fortawesome\svelte-fontawesome\src\components\SvgElement.svelte generated by Svelte v3.59.2 */

    const { Error: Error_1, Object: Object_1 } = globals;
    const file$5 = "node_modules\\@fortawesome\\svelte-fontawesome\\src\\components\\SvgElement.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let svg_levels = [/*elementProps*/ ctx[2]];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$5, 32, 0, 860);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			svg.innerHTML = /*markup*/ ctx[1];
    			/*svg_binding*/ ctx[7](svg);
    		},
    		p: noop$3,
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			/*svg_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgElement', slots, []);
    	let { tag } = $$props;
    	let { props } = $$props;
    	let { children } = $$props;
    	let { style = null } = $$props;
    	let { ref = null } = $$props;

    	if (tag !== 'svg') {
    		throw new Error('SvgElement requires a tag of "svg"');
    	}

    	function processChildren(children) {
    		return children?.reduce(
    			(acc, child) => {
    				return acc + (child.tag ? generateMarkup(child) : child);
    			},
    			''
    		) || '';
    	}

    	function generateMarkup({ tag, props, children }) {
    		// Generate a string setting key = value for each prop
    		const attributes = Object.keys(props).map(key => `${key}="${props[key]}"`).join(' ');

    		return `<${tag} ${attributes}>${processChildren(children)}</${tag}>`;
    	}

    	const markup = processChildren(children);
    	const elementStyle = (props?.style) ? `${props.style}${style || ''}` : style;
    	const elementProps = { ...props, style: elementStyle };

    	$$self.$$.on_mount.push(function () {
    		if (tag === undefined && !('tag' in $$props || $$self.$$.bound[$$self.$$.props['tag']])) {
    			console.warn("<SvgElement> was created without expected prop 'tag'");
    		}

    		if (props === undefined && !('props' in $$props || $$self.$$.bound[$$self.$$.props['props']])) {
    			console.warn("<SvgElement> was created without expected prop 'props'");
    		}

    		if (children === undefined && !('children' in $$props || $$self.$$.bound[$$self.$$.props['children']])) {
    			console.warn("<SvgElement> was created without expected prop 'children'");
    		}
    	});

    	const writable_props = ['tag', 'props', 'children', 'style', 'ref'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgElement> was created with unknown prop '${key}'`);
    	});

    	function svg_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(0, ref);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('tag' in $$props) $$invalidate(3, tag = $$props.tag);
    		if ('props' in $$props) $$invalidate(4, props = $$props.props);
    		if ('children' in $$props) $$invalidate(5, children = $$props.children);
    		if ('style' in $$props) $$invalidate(6, style = $$props.style);
    		if ('ref' in $$props) $$invalidate(0, ref = $$props.ref);
    	};

    	$$self.$capture_state = () => ({
    		tag,
    		props,
    		children,
    		style,
    		ref,
    		processChildren,
    		generateMarkup,
    		markup,
    		elementStyle,
    		elementProps
    	});

    	$$self.$inject_state = $$props => {
    		if ('tag' in $$props) $$invalidate(3, tag = $$props.tag);
    		if ('props' in $$props) $$invalidate(4, props = $$props.props);
    		if ('children' in $$props) $$invalidate(5, children = $$props.children);
    		if ('style' in $$props) $$invalidate(6, style = $$props.style);
    		if ('ref' in $$props) $$invalidate(0, ref = $$props.ref);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [ref, markup, elementProps, tag, props, children, style, svg_binding];
    }

    class SvgElement extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			tag: 3,
    			props: 4,
    			children: 5,
    			style: 6,
    			ref: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgElement",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get tag() {
    		throw new Error_1("<SvgElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error_1("<SvgElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error_1("<SvgElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error_1("<SvgElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error_1("<SvgElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error_1("<SvgElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error_1("<SvgElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error_1("<SvgElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error_1("<SvgElement>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error_1("<SvgElement>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@fortawesome\svelte-fontawesome\src\components\FontAwesomeIcon.svelte generated by Svelte v3.59.2 */

    // (101:0) {#if result}
    function create_if_block$2(ctx) {
    	let svgelement;
    	let updating_ref;
    	let current;
    	const svgelement_spread_levels = [/*result*/ ctx[2], { style: /*style*/ ctx[1] }];

    	function svgelement_ref_binding(value) {
    		/*svgelement_ref_binding*/ ctx[28](value);
    	}

    	let svgelement_props = {};

    	for (let i = 0; i < svgelement_spread_levels.length; i += 1) {
    		svgelement_props = assign(svgelement_props, svgelement_spread_levels[i]);
    	}

    	if (/*ref*/ ctx[0] !== void 0) {
    		svgelement_props.ref = /*ref*/ ctx[0];
    	}

    	svgelement = new SvgElement({ props: svgelement_props, $$inline: true });
    	binding_callbacks.push(() => bind(svgelement, 'ref', svgelement_ref_binding));

    	const block = {
    		c: function create() {
    			create_component(svgelement.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgelement, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svgelement_changes = (dirty[0] & /*result, style*/ 6)
    			? get_spread_update(svgelement_spread_levels, [
    					dirty[0] & /*result*/ 4 && get_spread_object(/*result*/ ctx[2]),
    					dirty[0] & /*style*/ 2 && { style: /*style*/ ctx[1] }
    				])
    			: {};

    			if (!updating_ref && dirty[0] & /*ref*/ 1) {
    				updating_ref = true;
    				svgelement_changes.ref = /*ref*/ ctx[0];
    				add_flush_callback(() => updating_ref = false);
    			}

    			svgelement.$set(svgelement_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgelement.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgelement.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgelement, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(101:0) {#if result}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*result*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*result*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*result*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"border","mask","maskId","fixedWidth","inverse","flip","icon","listItem","pull","pulse","rotation","size","spin","spinPulse","spinReverse","beat","fade","beatFade","bounce","shake","symbol","title","titleId","transform","swapOpacity","ref","style"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FontAwesomeIcon', slots, []);
    	let { border = false } = $$props;
    	let { mask = null } = $$props;
    	let { maskId = null } = $$props;
    	let { fixedWidth = false } = $$props;
    	let { inverse = false } = $$props;
    	let { flip = false } = $$props;
    	let { icon: icon$1 = null } = $$props;
    	let { listItem = false } = $$props;
    	let { pull = null } = $$props;
    	let { pulse = false } = $$props;
    	let { rotation = null } = $$props;
    	let { size = null } = $$props;
    	let { spin = false } = $$props;
    	let { spinPulse = false } = $$props;
    	let { spinReverse = false } = $$props;
    	let { beat = false } = $$props;
    	let { fade = false } = $$props;
    	let { beatFade = false } = $$props;
    	let { bounce = false } = $$props;
    	let { shake = false } = $$props;
    	let { symbol = false } = $$props;
    	let { title = '' } = $$props;
    	let { titleId = null } = $$props;
    	let { transform = null } = $$props;
    	let { swapOpacity = false } = $$props;
    	let { ref = null } = $$props;
    	let { style = null } = $$props;
    	const iconLookup = normalizeIconArgs(icon$1);
    	const classes = objectWithKey('classes', [...classList($$props), ...($$props.class || '').split(' ')]);

    	const transformObj = objectWithKey('transform', typeof transform === 'string'
    	? parse$1.transform(transform)
    	: transform);

    	const maskObj = objectWithKey('mask', normalizeIconArgs(mask));

    	const renderedIcon = icon(iconLookup, {
    		...classes,
    		...transformObj,
    		...maskObj,
    		symbol,
    		title,
    		titleId,
    		maskId
    	});

    	let result = null;

    	if (!renderedIcon) {
    		log('Could not find icon', iconLookup);
    	} else {
    		const { abstract } = renderedIcon;

    		result = convert(
    			(tag, props, children) => {
    				return { tag, props, children };
    			},
    			abstract[0],
    			$$restProps
    		);
    	}

    	function svgelement_ref_binding(value) {
    		ref = value;
    		$$invalidate(0, ref);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(35, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(34, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('border' in $$new_props) $$invalidate(3, border = $$new_props.border);
    		if ('mask' in $$new_props) $$invalidate(4, mask = $$new_props.mask);
    		if ('maskId' in $$new_props) $$invalidate(5, maskId = $$new_props.maskId);
    		if ('fixedWidth' in $$new_props) $$invalidate(6, fixedWidth = $$new_props.fixedWidth);
    		if ('inverse' in $$new_props) $$invalidate(7, inverse = $$new_props.inverse);
    		if ('flip' in $$new_props) $$invalidate(8, flip = $$new_props.flip);
    		if ('icon' in $$new_props) $$invalidate(9, icon$1 = $$new_props.icon);
    		if ('listItem' in $$new_props) $$invalidate(10, listItem = $$new_props.listItem);
    		if ('pull' in $$new_props) $$invalidate(11, pull = $$new_props.pull);
    		if ('pulse' in $$new_props) $$invalidate(12, pulse = $$new_props.pulse);
    		if ('rotation' in $$new_props) $$invalidate(13, rotation = $$new_props.rotation);
    		if ('size' in $$new_props) $$invalidate(14, size = $$new_props.size);
    		if ('spin' in $$new_props) $$invalidate(15, spin = $$new_props.spin);
    		if ('spinPulse' in $$new_props) $$invalidate(16, spinPulse = $$new_props.spinPulse);
    		if ('spinReverse' in $$new_props) $$invalidate(17, spinReverse = $$new_props.spinReverse);
    		if ('beat' in $$new_props) $$invalidate(18, beat = $$new_props.beat);
    		if ('fade' in $$new_props) $$invalidate(19, fade = $$new_props.fade);
    		if ('beatFade' in $$new_props) $$invalidate(20, beatFade = $$new_props.beatFade);
    		if ('bounce' in $$new_props) $$invalidate(21, bounce = $$new_props.bounce);
    		if ('shake' in $$new_props) $$invalidate(22, shake = $$new_props.shake);
    		if ('symbol' in $$new_props) $$invalidate(23, symbol = $$new_props.symbol);
    		if ('title' in $$new_props) $$invalidate(24, title = $$new_props.title);
    		if ('titleId' in $$new_props) $$invalidate(25, titleId = $$new_props.titleId);
    		if ('transform' in $$new_props) $$invalidate(26, transform = $$new_props.transform);
    		if ('swapOpacity' in $$new_props) $$invalidate(27, swapOpacity = $$new_props.swapOpacity);
    		if ('ref' in $$new_props) $$invalidate(0, ref = $$new_props.ref);
    		if ('style' in $$new_props) $$invalidate(1, style = $$new_props.style);
    	};

    	$$self.$capture_state = () => ({
    		classList,
    		convert,
    		coreIcon: icon,
    		parse: parse$1,
    		log,
    		normalizeIconArgs,
    		objectWithKey,
    		SvgElement,
    		border,
    		mask,
    		maskId,
    		fixedWidth,
    		inverse,
    		flip,
    		icon: icon$1,
    		listItem,
    		pull,
    		pulse,
    		rotation,
    		size,
    		spin,
    		spinPulse,
    		spinReverse,
    		beat,
    		fade,
    		beatFade,
    		bounce,
    		shake,
    		symbol,
    		title,
    		titleId,
    		transform,
    		swapOpacity,
    		ref,
    		style,
    		iconLookup,
    		classes,
    		transformObj,
    		maskObj,
    		renderedIcon,
    		result
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(35, $$props = assign(assign({}, $$props), $$new_props));
    		if ('border' in $$props) $$invalidate(3, border = $$new_props.border);
    		if ('mask' in $$props) $$invalidate(4, mask = $$new_props.mask);
    		if ('maskId' in $$props) $$invalidate(5, maskId = $$new_props.maskId);
    		if ('fixedWidth' in $$props) $$invalidate(6, fixedWidth = $$new_props.fixedWidth);
    		if ('inverse' in $$props) $$invalidate(7, inverse = $$new_props.inverse);
    		if ('flip' in $$props) $$invalidate(8, flip = $$new_props.flip);
    		if ('icon' in $$props) $$invalidate(9, icon$1 = $$new_props.icon);
    		if ('listItem' in $$props) $$invalidate(10, listItem = $$new_props.listItem);
    		if ('pull' in $$props) $$invalidate(11, pull = $$new_props.pull);
    		if ('pulse' in $$props) $$invalidate(12, pulse = $$new_props.pulse);
    		if ('rotation' in $$props) $$invalidate(13, rotation = $$new_props.rotation);
    		if ('size' in $$props) $$invalidate(14, size = $$new_props.size);
    		if ('spin' in $$props) $$invalidate(15, spin = $$new_props.spin);
    		if ('spinPulse' in $$props) $$invalidate(16, spinPulse = $$new_props.spinPulse);
    		if ('spinReverse' in $$props) $$invalidate(17, spinReverse = $$new_props.spinReverse);
    		if ('beat' in $$props) $$invalidate(18, beat = $$new_props.beat);
    		if ('fade' in $$props) $$invalidate(19, fade = $$new_props.fade);
    		if ('beatFade' in $$props) $$invalidate(20, beatFade = $$new_props.beatFade);
    		if ('bounce' in $$props) $$invalidate(21, bounce = $$new_props.bounce);
    		if ('shake' in $$props) $$invalidate(22, shake = $$new_props.shake);
    		if ('symbol' in $$props) $$invalidate(23, symbol = $$new_props.symbol);
    		if ('title' in $$props) $$invalidate(24, title = $$new_props.title);
    		if ('titleId' in $$props) $$invalidate(25, titleId = $$new_props.titleId);
    		if ('transform' in $$props) $$invalidate(26, transform = $$new_props.transform);
    		if ('swapOpacity' in $$props) $$invalidate(27, swapOpacity = $$new_props.swapOpacity);
    		if ('ref' in $$props) $$invalidate(0, ref = $$new_props.ref);
    		if ('style' in $$props) $$invalidate(1, style = $$new_props.style);
    		if ('result' in $$props) $$invalidate(2, result = $$new_props.result);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);

    	return [
    		ref,
    		style,
    		result,
    		border,
    		mask,
    		maskId,
    		fixedWidth,
    		inverse,
    		flip,
    		icon$1,
    		listItem,
    		pull,
    		pulse,
    		rotation,
    		size,
    		spin,
    		spinPulse,
    		spinReverse,
    		beat,
    		fade,
    		beatFade,
    		bounce,
    		shake,
    		symbol,
    		title,
    		titleId,
    		transform,
    		swapOpacity,
    		svgelement_ref_binding
    	];
    }

    class FontAwesomeIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				border: 3,
    				mask: 4,
    				maskId: 5,
    				fixedWidth: 6,
    				inverse: 7,
    				flip: 8,
    				icon: 9,
    				listItem: 10,
    				pull: 11,
    				pulse: 12,
    				rotation: 13,
    				size: 14,
    				spin: 15,
    				spinPulse: 16,
    				spinReverse: 17,
    				beat: 18,
    				fade: 19,
    				beatFade: 20,
    				bounce: 21,
    				shake: 22,
    				symbol: 23,
    				title: 24,
    				titleId: 25,
    				transform: 26,
    				swapOpacity: 27,
    				ref: 0,
    				style: 1
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FontAwesomeIcon",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get border() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set border(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mask() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mask(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maskId() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maskId(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixedWidth() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixedWidth(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get listItem() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set listItem(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pull() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pull(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pulse() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pulse(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotation() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spinPulse() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spinPulse(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spinReverse() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spinReverse(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beat() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beat(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beatFade() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beatFade(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bounce() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bounce(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shake() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shake(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get symbol() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set symbol(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get titleId() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titleId(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transform() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transform(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get swapOpacity() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set swapOpacity(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<FontAwesomeIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<FontAwesomeIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var faCircleQuestion = {
      prefix: 'far',
      iconName: 'circle-question',
      icon: [512, 512, [62108, "question-circle"], "f059", "M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"]
    };
    var faQuestionCircle = faCircleQuestion;

    var css_248z$4 = "";
    styleInject(css_248z$4);

    /* src\GroupDefinition.svelte generated by Svelte v3.59.2 */
    const file$4 = "src\\GroupDefinition.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	child_ctx[27] = list;
    	child_ctx[28] = i;
    	return child_ctx;
    }

    // (61:24) 
    function create_trigger_slot_3(ctx) {
    	let button;
    	let fontawesomeicon;
    	let current;
    	let mounted;
    	let dispose;

    	fontawesomeicon = new FontAwesomeIcon({
    			props: {
    				style: "height: 1.2em; vertical-align: -0.155em; color:#0066e9;",
    				icon: faQuestionCircle
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(fontawesomeicon.$$.fragment);
    			attr_dev(button, "class", "moreInfo svelte-1imgv3i");
    			attr_dev(button, "slot", "trigger");
    			attr_dev(button, "aria-label", "Help");
    			add_location(button, file$4, 60, 24, 1901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(fontawesomeicon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$3,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fontawesomeicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fontawesomeicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(fontawesomeicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_trigger_slot_3.name,
    		type: "slot",
    		source: "(61:24) ",
    		ctx
    	});

    	return block;
    }

    // (64:24) 
    function create_content_slot_3(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let b;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "Categories are the group of similar cards you want to find the percent chance of drawing. For example, draw, ramp, lands, interaction, etc.";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Each category ");
    			b = element("b");
    			b.textContent = "must";
    			t4 = text(" have a unique text name for the tool to work (some day I'll figure out indexing...)");
    			attr_dev(p0, "class", "popover-content svelte-1imgv3i");
    			add_location(p0, file$4, 64, 26, 2250);
    			add_location(b, file$4, 65, 67, 2490);
    			attr_dev(p1, "class", "popover-content svelte-1imgv3i");
    			add_location(p1, file$4, 65, 26, 2449);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$4, 63, 24, 2202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(p1, b);
    			append_dev(p1, t4);
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_3.name,
    		type: "slot",
    		source: "(64:24) ",
    		ctx
    	});

    	return block;
    }

    // (73:24) 
    function create_trigger_slot_2(ctx) {
    	let button;
    	let fontawesomeicon;
    	let current;
    	let mounted;
    	let dispose;

    	fontawesomeicon = new FontAwesomeIcon({
    			props: {
    				style: "height: 1.2em; vertical-align: -0.155em; color:#0066e9;",
    				icon: faQuestionCircle
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(fontawesomeicon.$$.fragment);
    			attr_dev(button, "class", "moreInfo svelte-1imgv3i");
    			attr_dev(button, "slot", "trigger");
    			attr_dev(button, "aria-label", "Help");
    			add_location(button, file$4, 72, 24, 2864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(fontawesomeicon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[10], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$3,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fontawesomeicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fontawesomeicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(fontawesomeicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_trigger_slot_2.name,
    		type: "slot",
    		source: "(73:24) ",
    		ctx
    	});

    	return block;
    }

    // (76:24) 
    function create_content_slot_2(ctx) {
    	let div;
    	let p;
    	let t0;
    	let i;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text("Percent change you'll get ");
    			i = element("i");
    			i.textContent = "at least";
    			t2 = text(" this many cards.");
    			add_location(i, file$4, 76, 81, 3268);
    			attr_dev(p, "class", "popover-content svelte-1imgv3i");
    			add_location(p, file$4, 76, 28, 3215);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$4, 75, 24, 3165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, i);
    			append_dev(p, t2);
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_2.name,
    		type: "slot",
    		source: "(76:24) ",
    		ctx
    	});

    	return block;
    }

    // (83:24) 
    function create_trigger_slot_1(ctx) {
    	let button;
    	let fontawesomeicon;
    	let current;
    	let mounted;
    	let dispose;

    	fontawesomeicon = new FontAwesomeIcon({
    			props: {
    				style: "height: 1.2em; vertical-align: -0.155em; color:#0066e9;",
    				icon: faQuestionCircle
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(fontawesomeicon.$$.fragment);
    			attr_dev(button, "class", "moreInfo svelte-1imgv3i");
    			attr_dev(button, "slot", "trigger");
    			attr_dev(button, "aria-label", "Help");
    			add_location(button, file$4, 82, 24, 3527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(fontawesomeicon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[12], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$3,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fontawesomeicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fontawesomeicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(fontawesomeicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_trigger_slot_1.name,
    		type: "slot",
    		source: "(83:24) ",
    		ctx
    	});

    	return block;
    }

    // (86:24) 
    function create_content_slot_1(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let i;
    	let t2;
    	let t3;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Use this field to link multiple categories together. When categories are linked, the tool displays the percent chance of getting the minimum number of desired cards in ");
    			i = element("i");
    			i.textContent = "each";
    			t2 = text(" category with the same link name.");
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Linked categories must have the exact same name (keyword match) and you can't link more than 4 categories together currently.";
    			add_location(i, file$4, 86, 223, 4073);
    			attr_dev(p0, "class", "popover-content svelte-1imgv3i");
    			add_location(p0, file$4, 86, 28, 3878);
    			attr_dev(p1, "class", "popover-content svelte-1imgv3i");
    			add_location(p1, file$4, 87, 28, 4152);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$4, 85, 24, 3828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, i);
    			append_dev(p0, t2);
    			append_dev(div, t3);
    			append_dev(div, p1);
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(86:24) ",
    		ctx
    	});

    	return block;
    }

    // (134:24) {#if index > 0}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[18](/*index*/ ctx[28]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Remove";
    			attr_dev(button, "class", "svelte-1imgv3i");
    			add_location(button, file$4, 134, 28, 6393);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_3, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(134:24) {#if index > 0}",
    		ctx
    	});

    	return block;
    }

    // (96:12) {#each groups as group, index}
    function create_each_block$2(ctx) {
    	let tr;
    	let td0;
    	let input0;
    	let t0;
    	let td1;
    	let input1;
    	let t1;
    	let td2;
    	let input2;
    	let t2;
    	let td3;
    	let input3;
    	let t3;
    	let td4;
    	let t4;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[14].call(input0, /*each_value*/ ctx[27], /*index*/ ctx[28]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[15].call(input1, /*each_value*/ ctx[27], /*index*/ ctx[28]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[16].call(input2, /*each_value*/ ctx[27], /*index*/ ctx[28]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[17].call(input3, /*each_value*/ ctx[27], /*index*/ ctx[28]);
    	}

    	let if_block = /*index*/ ctx[28] > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			input0 = element("input");
    			t0 = space();
    			td1 = element("td");
    			input1 = element("input");
    			t1 = space();
    			td2 = element("td");
    			input2 = element("input");
    			t2 = space();
    			td3 = element("td");
    			input3 = element("input");
    			t3 = space();
    			td4 = element("td");
    			if (if_block) if_block.c();
    			t4 = space();
    			attr_dev(input0, "class", "input-group svelte-1imgv3i");

    			set_style(input0, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    			? /*group*/ ctx[26].link
    			: /*group*/ ctx[26].name]);

    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "mana, draw, ramp, etc");
    			add_location(input0, file$4, 98, 24, 4595);
    			attr_dev(td0, "class", "svelte-1imgv3i");
    			add_location(td0, file$4, 97, 20, 4565);
    			attr_dev(input1, "class", "input-group svelte-1imgv3i");

    			set_style(input1, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    			? /*group*/ ctx[26].link
    			: /*group*/ ctx[26].name]);

    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "99");
    			add_location(input1, file$4, 106, 24, 5018);
    			attr_dev(td1, "class", "svelte-1imgv3i");
    			add_location(td1, file$4, 105, 20, 4988);
    			attr_dev(input2, "class", "input-group svelte-1imgv3i");

    			set_style(input2, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    			? /*group*/ ctx[26].link
    			: /*group*/ ctx[26].name]);

    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "1");
    			attr_dev(input2, "max", "99");
    			add_location(input2, file$4, 115, 24, 5454);
    			attr_dev(td2, "class", "svelte-1imgv3i");
    			add_location(td2, file$4, 114, 20, 5424);
    			attr_dev(input3, "class", "input-group svelte-1imgv3i");

    			set_style(input3, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    			? /*group*/ ctx[26].link
    			: /*group*/ ctx[26].name]);

    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Category 1 + 2, etc");
    			add_location(input3, file$4, 125, 24, 5928);
    			attr_dev(td3, "class", "svelte-1imgv3i");
    			add_location(td3, file$4, 124, 20, 5898);
    			attr_dev(td4, "class", "svelte-1imgv3i");
    			add_location(td4, file$4, 132, 20, 6318);
    			add_location(tr, file$4, 96, 16, 4539);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*group*/ ctx[26].name);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*group*/ ctx[26].size);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*group*/ ctx[26].cardsToDraw);
    			append_dev(tr, t2);
    			append_dev(tr, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*group*/ ctx[26].link);
    			append_dev(tr, t3);
    			append_dev(tr, td4);
    			if (if_block) if_block.m(td4, null);
    			append_dev(tr, t4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input1, "input", input1_input_handler),
    					listen_dev(input2, "input", input2_input_handler),
    					listen_dev(input3, "input", input3_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$groupColors, groups*/ 17) {
    				set_style(input0, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    				? /*group*/ ctx[26].link
    				: /*group*/ ctx[26].name]);
    			}

    			if (dirty & /*groups*/ 1 && input0.value !== /*group*/ ctx[26].name) {
    				set_input_value(input0, /*group*/ ctx[26].name);
    			}

    			if (dirty & /*$groupColors, groups*/ 17) {
    				set_style(input1, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    				? /*group*/ ctx[26].link
    				: /*group*/ ctx[26].name]);
    			}

    			if (dirty & /*groups*/ 1 && to_number(input1.value) !== /*group*/ ctx[26].size) {
    				set_input_value(input1, /*group*/ ctx[26].size);
    			}

    			if (dirty & /*$groupColors, groups*/ 17) {
    				set_style(input2, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    				? /*group*/ ctx[26].link
    				: /*group*/ ctx[26].name]);
    			}

    			if (dirty & /*groups*/ 1 && to_number(input2.value) !== /*group*/ ctx[26].cardsToDraw) {
    				set_input_value(input2, /*group*/ ctx[26].cardsToDraw);
    			}

    			if (dirty & /*$groupColors, groups*/ 17) {
    				set_style(input3, "--bg-color", /*$groupColors*/ ctx[4][/*group*/ ctx[26].link && /*group*/ ctx[26].link.trim()
    				? /*group*/ ctx[26].link
    				: /*group*/ ctx[26].name]);
    			}

    			if (dirty & /*groups*/ 1 && input3.value !== /*group*/ ctx[26].link) {
    				set_input_value(input3, /*group*/ ctx[26].link);
    			}

    			if (/*index*/ ctx[28] > 0) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(96:12) {#each groups as group, index}",
    		ctx
    	});

    	return block;
    }

    // (151:20) 
    function create_trigger_slot$1(ctx) {
    	let button;
    	let fontawesomeicon;
    	let current;
    	let mounted;
    	let dispose;

    	fontawesomeicon = new FontAwesomeIcon({
    			props: {
    				style: "height: 1.2em; vertical-align: -0.155em; color:#0066e9;",
    				icon: faQuestionCircle
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(fontawesomeicon.$$.fragment);
    			attr_dev(button, "class", "moreInfo svelte-1imgv3i");
    			attr_dev(button, "slot", "trigger");
    			attr_dev(button, "aria-label", "Help");
    			add_location(button, file$4, 150, 20, 6915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(fontawesomeicon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_4*/ ctx[19], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$3,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fontawesomeicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fontawesomeicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(fontawesomeicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_trigger_slot$1.name,
    		type: "slot",
    		source: "(151:20) ",
    		ctx
    	});

    	return block;
    }

    // (154:20) 
    function create_content_slot$1(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "London mulligan feature is experimental. Mulligan on turn 0 may be more accurate, and essentially calculates the probability with multiple opening hands in mind and averages.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Mulligans on turn 1, turn 2, etc. simply \"carry over\" the increased probability of multiple opening hands to your first, second, third, etc. draw. This is probably not mathematically accurate, still working on it!";
    			attr_dev(p0, "class", "popover-content svelte-1imgv3i");
    			add_location(p0, file$4, 154, 24, 7250);
    			attr_dev(p1, "class", "popover-content svelte-1imgv3i");
    			add_location(p1, file$4, 155, 25, 7482);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$4, 153, 20, 7204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot$1.name,
    		type: "slot",
    		source: "(154:20) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t0;
    	let popover0;
    	let updating_show;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t4;
    	let popover1;
    	let updating_show_1;
    	let t5;
    	let th3;
    	let t6;
    	let popover2;
    	let updating_show_2;
    	let t7;
    	let th4;
    	let t8;
    	let tbody;
    	let t9;
    	let div2;
    	let button;
    	let t11;
    	let div0;
    	let label0;
    	let t12;
    	let popover3;
    	let updating_show_3;
    	let t13;
    	let t14;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t20;
    	let div1;
    	let label1;
    	let t22;
    	let input;
    	let current;
    	let mounted;
    	let dispose;

    	function popover0_show_binding(value) {
    		/*popover0_show_binding*/ ctx[9](value);
    	}

    	let popover0_props = {
    		placement: "top",
    		$$slots: {
    			content: [create_content_slot_3],
    			trigger: [create_trigger_slot_3]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showPopover*/ ctx[3] !== void 0) {
    		popover0_props.show = /*showPopover*/ ctx[3];
    	}

    	popover0 = new Popover({ props: popover0_props, $$inline: true });
    	binding_callbacks.push(() => bind(popover0, 'show', popover0_show_binding));

    	function popover1_show_binding(value) {
    		/*popover1_show_binding*/ ctx[11](value);
    	}

    	let popover1_props = {
    		placement: "top",
    		$$slots: {
    			content: [create_content_slot_2],
    			trigger: [create_trigger_slot_2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showPopover*/ ctx[3] !== void 0) {
    		popover1_props.show = /*showPopover*/ ctx[3];
    	}

    	popover1 = new Popover({ props: popover1_props, $$inline: true });
    	binding_callbacks.push(() => bind(popover1, 'show', popover1_show_binding));

    	function popover2_show_binding(value) {
    		/*popover2_show_binding*/ ctx[13](value);
    	}

    	let popover2_props = {
    		placement: "top",
    		$$slots: {
    			content: [create_content_slot_1],
    			trigger: [create_trigger_slot_1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showPopover*/ ctx[3] !== void 0) {
    		popover2_props.show = /*showPopover*/ ctx[3];
    	}

    	popover2 = new Popover({ props: popover2_props, $$inline: true });
    	binding_callbacks.push(() => bind(popover2, 'show', popover2_show_binding));
    	let each_value = /*groups*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	function popover3_show_binding(value) {
    		/*popover3_show_binding*/ ctx[20](value);
    	}

    	let popover3_props = {
    		placement: "top",
    		$$slots: {
    			content: [create_content_slot$1],
    			trigger: [create_trigger_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showPopover*/ ctx[3] !== void 0) {
    		popover3_props.show = /*showPopover*/ ctx[3];
    	}

    	popover3 = new Popover({ props: popover3_props, $$inline: true });
    	binding_callbacks.push(() => bind(popover3, 'show', popover3_show_binding));

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			t0 = text("Category unique name\r\n                    ");
    			create_component(popover0.$$.fragment);
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "# Cards in category";
    			t3 = space();
    			th2 = element("th");
    			t4 = text("Minimum # desired cards\r\n                    ");
    			create_component(popover1.$$.fragment);
    			t5 = space();
    			th3 = element("th");
    			t6 = text("Linked categories\r\n                    ");
    			create_component(popover2.$$.fragment);
    			t7 = space();
    			th4 = element("th");
    			t8 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div2 = element("div");
    			button = element("button");
    			button.textContent = "Add another category";
    			t11 = space();
    			div0 = element("div");
    			label0 = element("label");
    			t12 = text("Mulligans (Experimental)\r\n\r\n                ");
    			create_component(popover3.$$.fragment);
    			t13 = text("\r\n                \r\n                :");
    			t14 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "0";
    			option1 = element("option");
    			option1.textContent = "1";
    			option2 = element("option");
    			option2.textContent = "2";
    			option3 = element("option");
    			option3.textContent = "3";
    			option4 = element("option");
    			option4.textContent = "4";
    			t20 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Deck Size:";
    			t22 = space();
    			input = element("input");
    			attr_dev(th0, "class", "svelte-1imgv3i");
    			add_location(th0, file$4, 58, 16, 1780);
    			attr_dev(th1, "class", "svelte-1imgv3i");
    			add_location(th1, file$4, 69, 16, 2694);
    			attr_dev(th2, "class", "svelte-1imgv3i");
    			add_location(th2, file$4, 70, 16, 2740);
    			attr_dev(th3, "class", "svelte-1imgv3i");
    			add_location(th3, file$4, 80, 16, 3409);
    			attr_dev(th4, "class", "svelte-1imgv3i");
    			add_location(th4, file$4, 91, 16, 4414);
    			add_location(tr, file$4, 57, 12, 1758);
    			add_location(thead, file$4, 56, 8, 1737);
    			add_location(tbody, file$4, 94, 8, 4470);
    			attr_dev(table, "class", "svelte-1imgv3i");
    			add_location(table, file$4, 55, 4, 1720);
    			attr_dev(button, "class", "svelte-1imgv3i");
    			add_location(button, file$4, 144, 8, 6650);
    			attr_dev(label0, "for", "mulliganCount");
    			attr_dev(label0, "class", "svelte-1imgv3i");
    			add_location(label0, file$4, 147, 12, 6773);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 161, 16, 7894);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 162, 16, 7940);
    			option2.__value = "2";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 163, 16, 7986);
    			option3.__value = "3";
    			option3.value = option3.__value;
    			add_location(option3, file$4, 164, 16, 8032);
    			option4.__value = "4";
    			option4.value = option4.__value;
    			add_location(option4, file$4, 165, 16, 8078);
    			attr_dev(select, "class", "svelte-1imgv3i");
    			if (/*mulliganCount*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[21].call(select));
    			add_location(select, file$4, 160, 12, 7841);
    			attr_dev(div0, "class", "mulligan-selection svelte-1imgv3i");
    			add_location(div0, file$4, 146, 8, 6727);
    			attr_dev(label1, "for", "deckSize");
    			attr_dev(label1, "class", "svelte-1imgv3i");
    			add_location(label1, file$4, 170, 12, 8204);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", "deckSize");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "class", "svelte-1imgv3i");
    			add_location(input, file$4, 171, 12, 8258);
    			attr_dev(div1, "class", "deck-size-container svelte-1imgv3i");
    			add_location(div1, file$4, 169, 8, 8157);
    			attr_dev(div2, "class", "controls-container svelte-1imgv3i");
    			add_location(div2, file$4, 142, 4, 6598);
    			attr_dev(div3, "class", "parameters svelte-1imgv3i");
    			add_location(div3, file$4, 53, 0, 1688);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(th0, t0);
    			mount_component(popover0, th0, null);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(th2, t4);
    			mount_component(popover1, th2, null);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(th3, t6);
    			mount_component(popover2, th3, null);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(table, t8);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(tbody, null);
    				}
    			}

    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(div2, t11);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t12);
    			mount_component(popover3, label0, null);
    			append_dev(label0, t13);
    			append_dev(div0, t14);
    			append_dev(div0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			select_option(select, /*mulliganCount*/ ctx[2], true);
    			append_dev(div2, t20);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t22);
    			append_dev(div1, input);
    			set_input_value(input, /*deckSize*/ ctx[1]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*addGroup*/ ctx[5], false, false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[21]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[22])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const popover0_changes = {};

    			if (dirty & /*$$scope, showPopover*/ 536870920) {
    				popover0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_show && dirty & /*showPopover*/ 8) {
    				updating_show = true;
    				popover0_changes.show = /*showPopover*/ ctx[3];
    				add_flush_callback(() => updating_show = false);
    			}

    			popover0.$set(popover0_changes);
    			const popover1_changes = {};

    			if (dirty & /*$$scope, showPopover*/ 536870920) {
    				popover1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_show_1 && dirty & /*showPopover*/ 8) {
    				updating_show_1 = true;
    				popover1_changes.show = /*showPopover*/ ctx[3];
    				add_flush_callback(() => updating_show_1 = false);
    			}

    			popover1.$set(popover1_changes);
    			const popover2_changes = {};

    			if (dirty & /*$$scope, showPopover*/ 536870920) {
    				popover2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_show_2 && dirty & /*showPopover*/ 8) {
    				updating_show_2 = true;
    				popover2_changes.show = /*showPopover*/ ctx[3];
    				add_flush_callback(() => updating_show_2 = false);
    			}

    			popover2.$set(popover2_changes);

    			if (dirty & /*removeGroup, $groupColors, groups*/ 81) {
    				each_value = /*groups*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const popover3_changes = {};

    			if (dirty & /*$$scope, showPopover*/ 536870920) {
    				popover3_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_show_3 && dirty & /*showPopover*/ 8) {
    				updating_show_3 = true;
    				popover3_changes.show = /*showPopover*/ ctx[3];
    				add_flush_callback(() => updating_show_3 = false);
    			}

    			popover3.$set(popover3_changes);

    			if (dirty & /*mulliganCount*/ 4) {
    				select_option(select, /*mulliganCount*/ ctx[2]);
    			}

    			if (dirty & /*deckSize*/ 2 && to_number(input.value) !== /*deckSize*/ ctx[1]) {
    				set_input_value(input, /*deckSize*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popover0.$$.fragment, local);
    			transition_in(popover1.$$.fragment, local);
    			transition_in(popover2.$$.fragment, local);
    			transition_in(popover3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popover0.$$.fragment, local);
    			transition_out(popover1.$$.fragment, local);
    			transition_out(popover2.$$.fragment, local);
    			transition_out(popover3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(popover0);
    			destroy_component(popover1);
    			destroy_component(popover2);
    			destroy_each(each_blocks, detaching);
    			destroy_component(popover3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $groupColors;
    	validate_store(groupColors, 'groupColors');
    	component_subscribe($$self, groupColors, $$value => $$invalidate(4, $groupColors = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GroupDefinition', slots, []);
    	const dispatch = createEventDispatcher();
    	let nextIndex = 1; // Initialize the counter for group indexes

    	let groups = [
    		{
    			index: 0,
    			name: '',
    			size: 1,
    			cardsToDraw: 1,
    			link: ''
    		}
    	]; // Initial group with name 'Category 1'

    	let deckSize = 99;
    	let mulliganCount = 0;
    	let colorIndex = 0;
    	let showPopover = false;
    	const presetColors = ["#DCEDC8", "#B2DFDB", "#FFE0B2", "#E1BEE7", "#B3E5FC", "#FFCCBC", "#C5CAE9"];

    	function addGroup() {
    		$$invalidate(0, groups = [
    			...groups,
    			{
    				index: nextIndex,
    				name: `Category ${nextIndex + 1}`,
    				size: 1,
    				cardsToDraw: 1,
    				link: ''
    			}
    		]);

    		nextIndex++; // Increment the counter after adding a new group
    	}

    	function removeGroup(index) {
    		$$invalidate(0, groups = groups.filter((_, i) => i !== index));
    	} // After removal, update names to maintain order if needed. This could be an additional feature.

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GroupDefinition> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(3, showPopover = !showPopover);

    	function popover0_show_binding(value) {
    		showPopover = value;
    		$$invalidate(3, showPopover);
    	}

    	const click_handler_1 = () => $$invalidate(3, showPopover = !showPopover);

    	function popover1_show_binding(value) {
    		showPopover = value;
    		$$invalidate(3, showPopover);
    	}

    	const click_handler_2 = () => $$invalidate(3, showPopover = !showPopover);

    	function popover2_show_binding(value) {
    		showPopover = value;
    		$$invalidate(3, showPopover);
    	}

    	function input0_input_handler(each_value, index) {
    		each_value[index].name = this.value;
    		$$invalidate(0, groups);
    	}

    	function input1_input_handler(each_value, index) {
    		each_value[index].size = to_number(this.value);
    		$$invalidate(0, groups);
    	}

    	function input2_input_handler(each_value, index) {
    		each_value[index].cardsToDraw = to_number(this.value);
    		$$invalidate(0, groups);
    	}

    	function input3_input_handler(each_value, index) {
    		each_value[index].link = this.value;
    		$$invalidate(0, groups);
    	}

    	const click_handler_3 = index => removeGroup(index);
    	const click_handler_4 = () => $$invalidate(3, showPopover = !showPopover);

    	function popover3_show_binding(value) {
    		showPopover = value;
    		$$invalidate(3, showPopover);
    	}

    	function select_change_handler() {
    		mulliganCount = select_value(this);
    		$$invalidate(2, mulliganCount);
    	}

    	function input_input_handler() {
    		deckSize = to_number(this.value);
    		$$invalidate(1, deckSize);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		groupColors,
    		Popover,
    		FontAwesomeIcon,
    		faQuestionCircle,
    		dispatch,
    		nextIndex,
    		groups,
    		deckSize,
    		mulliganCount,
    		colorIndex,
    		showPopover,
    		presetColors,
    		addGroup,
    		removeGroup,
    		$groupColors
    	});

    	$$self.$inject_state = $$props => {
    		if ('nextIndex' in $$props) nextIndex = $$props.nextIndex;
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('deckSize' in $$props) $$invalidate(1, deckSize = $$props.deckSize);
    		if ('mulliganCount' in $$props) $$invalidate(2, mulliganCount = $$props.mulliganCount);
    		if ('colorIndex' in $$props) $$invalidate(7, colorIndex = $$props.colorIndex);
    		if ('showPopover' in $$props) $$invalidate(3, showPopover = $$props.showPopover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*groups, colorIndex, deckSize, mulliganCount*/ 135) {
    			{
    				let updatedColors = {};

    				groups.forEach(group => {
    					let key = group.link && group.link.trim()
    					? group.link
    					: group.name;

    					if (!updatedColors[key]) {
    						updatedColors[key] = presetColors[$$invalidate(7, colorIndex++, colorIndex) % presetColors.length];
    					}
    				});

    				groupColors.set(updatedColors);
    				dispatch('updateGroups', { groups, deckSize, mulliganCount });
    			}
    		}
    	};

    	return [
    		groups,
    		deckSize,
    		mulliganCount,
    		showPopover,
    		$groupColors,
    		addGroup,
    		removeGroup,
    		colorIndex,
    		click_handler,
    		popover0_show_binding,
    		click_handler_1,
    		popover1_show_binding,
    		click_handler_2,
    		popover2_show_binding,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		click_handler_3,
    		click_handler_4,
    		popover3_show_binding,
    		select_change_handler,
    		input_input_handler
    	];
    }

    class GroupDefinition extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GroupDefinition",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    var css_248z$3 = "";
    styleInject(css_248z$3);

    /* src\Calculation.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$3 = "src\\Calculation.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (295:16) {#each createGroupCards(groups, results, turn) as card}
    function create_each_block_1(ctx) {
    	let div5;
    	let div3;
    	let div2;
    	let div0;

    	let t0_value = (/*card*/ ctx[16].probability !== null
    	? `${/*card*/ ctx[16].probability}%`
    	: '') + "";

    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*card*/ ctx[16].ratioText + "";
    	let t2;
    	let t3;
    	let div4;
    	let t4_value = /*card*/ ctx[16].label + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div4 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(div0, "class", "probability svelte-1bi22s3");
    			add_location(div0, file$3, 298, 32, 9149);
    			attr_dev(div1, "class", "card-ratio svelte-1bi22s3");
    			add_location(div1, file$3, 299, 32, 9271);
    			attr_dev(div2, "class", "card-details svelte-1bi22s3");
    			add_location(div2, file$3, 297, 28, 9089);
    			attr_dev(div3, "class", "rectangle svelte-1bi22s3");
    			set_style(div3, "background-color", /*card*/ ctx[16].color);
    			add_location(div3, file$3, 296, 24, 8997);
    			attr_dev(div4, "class", "card-label svelte-1bi22s3");
    			add_location(div4, file$3, 302, 24, 9411);
    			attr_dev(div5, "class", "card-container svelte-1bi22s3");
    			add_location(div5, file$3, 295, 20, 8943);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div5, t3);
    			append_dev(div5, div4);
    			append_dev(div4, t4);
    			append_dev(div5, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groups, results*/ 3 && t0_value !== (t0_value = (/*card*/ ctx[16].probability !== null
    			? `${/*card*/ ctx[16].probability}%`
    			: '') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*groups, results*/ 3 && t2_value !== (t2_value = /*card*/ ctx[16].ratioText + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*groups, results*/ 3) {
    				set_style(div3, "background-color", /*card*/ ctx[16].color);
    			}

    			if (dirty & /*groups, results*/ 3 && t4_value !== (t4_value = /*card*/ ctx[16].label + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(295:16) {#each createGroupCards(groups, results, turn) as card}",
    		ctx
    	});

    	return block;
    }

    // (291:4) {#each Array(5) as _, turn}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div1;
    	let t4;
    	let each_value_1 = /*createGroupCards*/ ctx[2](/*groups*/ ctx[0], /*results*/ ctx[1], /*turn*/ ctx[15]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Turn ");
    			t1 = text(/*turn*/ ctx[15]);
    			t2 = text(":");
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			attr_dev(div0, "class", "turn-label svelte-1bi22s3");
    			add_location(div0, file$3, 292, 12, 8763);
    			attr_dev(div1, "class", "card-rectangles svelte-1bi22s3");
    			add_location(div1, file$3, 293, 12, 8819);
    			attr_dev(div2, "class", "turn-row svelte-1bi22s3");
    			add_location(div2, file$3, 291, 8, 8727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append_dev(div2, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*createGroupCards, groups, results*/ 7) {
    				each_value_1 = /*createGroupCards*/ ctx[2](/*groups*/ ctx[0], /*results*/ ctx[1], /*turn*/ ctx[15]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(291:4) {#each Array(5) as _, turn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_value = Array(5);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "output-diagram svelte-1bi22s3");
    			add_location(div, file$3, 289, 0, 8656);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*createGroupCards, groups, results*/ 7) {
    				each_value = Array(5);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function choose(n, k) {
    	let result = 1;

    	for (let i = 1; i <= k; i++) {
    		result *= (n + 1 - i) / i;
    	}

    	return result;
    }

    // Function to calculate hypergeometric CDF
    function hypergeometricCDF(x, N, K, n) {
    	const Ckx = choose(K, x);
    	const CnKxn = choose(N - K, n - x);
    	const CnN = choose(N, n);
    	return Ckx * CnKxn / CnN;
    }

    //multivariateHypergeometricCDF 3 functions below
    function logFactorial(n) {
    	let result = 0;

    	for (let i = 2; i <= n; i++) {
    		result += Math.log(i);
    	}

    	return result;
    }

    function logChoose(n, k) {
    	return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
    }

    function multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, cardsDrawn) {

    	function calculate(groupIndex, cardsLeft, accumulatedProbability) {
    		if (groupIndex === groupSizes.length) {
    			return accumulatedProbability * choose(deckSize - sumGroupSizes(groupIndex), cardsLeft) / choose(deckSize, cardsDrawn);
    		}

    		let groupProb = 0;

    		for (let i = groupCardsToDraw[groupIndex]; i <= Math.min(cardsLeft, groupSizes[groupIndex]); i++) {
    			groupProb += calculate(groupIndex + 1, cardsLeft - i, accumulatedProbability * choose(groupSizes[groupIndex], i));
    		}

    		return groupProb;
    	}

    	function sumGroupSizes(upToIndex) {
    		return groupSizes.slice(0, upToIndex).reduce((sum, size) => sum + size, 0);
    	}

    	return Math.min(1, calculate(0, cardsDrawn, 1));
    }

    function applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulligans, cardsDrawn) {
    	let totalProbability = 0;
    	let remainingDeckSize = deckSize;

    	for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
    		let probabilityThisMulligan = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, remainingDeckSize, cardsDrawn);
    		totalProbability += (1 - totalProbability) * probabilityThisMulligan;
    		remainingDeckSize -= 1; // One card put back for each mulligan
    	}

    	return Math.min(1, totalProbability);
    }

    function convertPercentToRatio(percent) {
    	if (percent === null) return '';

    	// Directly map the percentage to a scale of 20
    	let number = Math.round(percent / 100 * 20);

    	return `${number} out of 20`;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $groupColors;
    	validate_store(groupColors, 'groupColors');
    	component_subscribe($$self, groupColors, $$value => $$invalidate(5, $groupColors = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calculation', slots, []);

    	function calculateLinkedGroups(linkedGroups) {
    		const groupResults = [];
    		let cardsDrawn = 7; // Initial hand
    		const groupSizes = linkedGroups.map(group => group.size);
    		const groupCardsToDraw = linkedGroups.map(group => group.cardsToDraw);
    		const linkName = linkedGroups[0].link;
    		let turn0Boost = 0;

    		for (let turn = 0; turn <= 4; turn++) {
    			if (turn > 0) cardsDrawn += 1;
    			let probability;

    			if (turn === 0) {
    				let baseProbability = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize, cardsDrawn);
    				probability = applyLondonMulliganForLinkedGroups(groupSizes, groupCardsToDraw, deckSize, mulliganCount, cardsDrawn);
    				turn0Boost = probability - baseProbability;
    			} else {
    				probability = multivariateHypergeometricCDF(groupSizes, groupCardsToDraw, deckSize - mulliganCount, cardsDrawn) + turn0Boost;
    				probability = Math.min(1, probability);
    			}

    			groupResults.push({ turn, probability });
    		}

    		$$invalidate(1, results[linkName] = groupResults, results);
    	}

    	let { groups = [] } = $$props;
    	let { deckSize } = $$props;
    	let { mulliganCount } = $$props;
    	let results = {};

    	function calculateProbabilities() {
    		console.log("Calculating probabilities for groups:", groups);
    		$$invalidate(1, results = {});

    		// Group by links, excluding empty links
    		const links = {};

    		groups.forEach(group => {
    			if (group.link && group.link.trim() !== '') {
    				// Check for non-empty link
    				if (!links[group.link]) links[group.link] = [];

    				links[group.link].push(group);
    			} else {
    				calculateSingleGroup(group);
    			}
    		});

    		// Calculate probabilities for linked groups
    		for (const link in links) {
    			calculateLinkedGroups(links[link]);
    		}
    	}

    	function applyLondonMulligan(group, cardsDrawn, deckSize, mulligans) {
    		let totalProbability = 0;

    		for (let mulligan = 0; mulligan <= mulligans; mulligan++) {
    			let probabilityThisMulligan = calculateProbabilityForHand(group, cardsDrawn);
    			totalProbability += (1 - totalProbability) * probabilityThisMulligan;
    		}

    		return Math.min(1, totalProbability);
    	}

    	function calculateProbabilityForHand(group, cardsDrawn) {
    		let probability = 0;

    		for (let x = group.cardsToDraw; x <= Math.min(group.size, cardsDrawn); x++) {
    			probability += hypergeometricCDF(x, deckSize, group.size, cardsDrawn);
    		}

    		return probability;
    	}

    	function calculateSingleGroup(group) {
    		const groupResults = [];
    		let cardsDrawn = 7; // Initial hand size
    		let deckSizeAfterMulligan = deckSize - mulliganCount; // Adjusting deck size for mulligans
    		let turn0Boost = 0;

    		for (let turn = 0; turn <= 4; turn++) {
    			if (turn > 0) cardsDrawn += 1;
    			let probability;

    			if (turn === 0) {
    				let baseProbability = calculateProbabilityForHand(group, cardsDrawn);
    				probability = applyLondonMulligan(group, cardsDrawn, deckSize, mulliganCount);
    				turn0Boost = probability - baseProbability; // Boost gained from mulligan on turn 0
    			} else {
    				// For subsequent turns, apply the boost gained from turn 0
    				probability = calculateProbabilityForHand(group, cardsDrawn) + turn0Boost;

    				probability = Math.min(1, probability); // Ensure probability does not exceed 100%
    			}

    			groupResults.push({ turn, probability });
    			console.log(`Turn ${turn}: Probability = ${probability}, Deck Size After Mulligan = ${deckSizeAfterMulligan}`);
    		}

    		$$invalidate(1, results[group.name] = groupResults, results);
    	}

    	function createGroupCards(groups, results, turn) {
    		let cards = groups.map(group => {
    			let groupName = group.link ? group.link : group.name;
    			let groupResult = results[groupName];

    			let probabilityPercent = groupResult && turn < groupResult.length
    			? Math.round(groupResult[turn].probability * 1000) / 10
    			: null;

    			// Determine the ratio representation
    			let ratioText = convertPercentToRatio(probabilityPercent);

    			// Access the color from the groupColors store
    			let color = $groupColors[groupName] || '#e5e5e5'; // Default color if not set

    			return {
    				probability: probabilityPercent,
    				label: group.name,
    				color,
    				ratioText
    			};
    		});

    		// Fill up the remaining cards for the turn with blanks
    		while (cards.length < 7 + turn) {
    			cards.push({
    				probability: null,
    				label: '',
    				ratioText: ''
    			});
    		}

    		return cards;
    	}

    	const presetColors = ["#DCEDC8", "#B2DFDB", "#FFE0B2", "#E1BEE7", "#B3E5FC", "#FFCCBC", "#C5CAE9"]; // Example colors

    	function assignGroupColors(groups) {
    		let colorIndex = 0;
    		let updatedColors = {};

    		// First, assign colors based on unique names or links
    		groups.forEach(group => {
    			if (!updatedColors[group.name]) {
    				updatedColors[group.name] = presetColors[colorIndex % presetColors.length];
    				colorIndex++;
    			}
    		});

    		// Next, ensure linked groups share the same color
    		groups.forEach(group => {
    			if (group.link && group.link.trim() !== '') {
    				updatedColors[group.link] = updatedColors[group.name];
    			}
    		});

    		groupColors.set(updatedColors); // Update the store with new color mappings
    	}

    	$$self.$$.on_mount.push(function () {
    		if (deckSize === undefined && !('deckSize' in $$props || $$self.$$.bound[$$self.$$.props['deckSize']])) {
    			console_1.warn("<Calculation> was created without expected prop 'deckSize'");
    		}

    		if (mulliganCount === undefined && !('mulliganCount' in $$props || $$self.$$.bound[$$self.$$.props['mulliganCount']])) {
    			console_1.warn("<Calculation> was created without expected prop 'mulliganCount'");
    		}
    	});

    	const writable_props = ['groups', 'deckSize', 'mulliganCount'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Calculation> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('deckSize' in $$props) $$invalidate(3, deckSize = $$props.deckSize);
    		if ('mulliganCount' in $$props) $$invalidate(4, mulliganCount = $$props.mulliganCount);
    	};

    	$$self.$capture_state = () => ({
    		groupColors,
    		choose,
    		hypergeometricCDF,
    		logFactorial,
    		logChoose,
    		multivariateHypergeometricCDF,
    		calculateLinkedGroups,
    		applyLondonMulliganForLinkedGroups,
    		groups,
    		deckSize,
    		mulliganCount,
    		results,
    		calculateProbabilities,
    		applyLondonMulligan,
    		calculateProbabilityForHand,
    		calculateSingleGroup,
    		createGroupCards,
    		convertPercentToRatio,
    		presetColors,
    		assignGroupColors,
    		$groupColors
    	});

    	$$self.$inject_state = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('deckSize' in $$props) $$invalidate(3, deckSize = $$props.deckSize);
    		if ('mulliganCount' in $$props) $$invalidate(4, mulliganCount = $$props.mulliganCount);
    		if ('results' in $$props) $$invalidate(1, results = $$props.results);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*groups*/ 1) {
    			// Reactive statement to calculate probabilities when groups change
    			if (groups.length > 0) {
    				calculateProbabilities();
    			}
    		}

    		if ($$self.$$.dirty & /*groups*/ 1) {
    			if (groups.length > 0) {
    				assignGroupColors(groups);
    				calculateProbabilities();
    			}
    		}
    	};

    	return [groups, results, createGroupCards, deckSize, mulliganCount];
    }

    class Calculation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { groups: 0, deckSize: 3, mulliganCount: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calculation",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get groups() {
    		throw new Error("<Calculation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groups(value) {
    		throw new Error("<Calculation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deckSize() {
    		throw new Error("<Calculation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deckSize(value) {
    		throw new Error("<Calculation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mulliganCount() {
    		throw new Error("<Calculation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mulliganCount(value) {
    		throw new Error("<Calculation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$2 = "";
    styleInject(css_248z$2);

    /* src\Intro.svelte generated by Svelte v3.59.2 */
    const file$2 = "src\\Intro.svelte";

    // (67:8) 
    function create_trigger_slot(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "venmoing me half a coffee";
    			attr_dev(button, "class", "moreInfo svelte-jrt1mu");
    			attr_dev(button, "slot", "trigger");
    			attr_dev(button, "aria-label", "Help");
    			add_location(button, file$2, 66, 8, 1408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_trigger_slot.name,
    		type: "slot",
    		source: "(67:8) ",
    		ctx
    	});

    	return block;
    }

    // (70:8) 
    function create_content_slot(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "venmo info to come...";
    			attr_dev(p, "class", "popover-content svelte-jrt1mu");
    			add_location(p, file$2, 70, 12, 1611);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$2, 69, 8, 1577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(70:8) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let popover;
    	let updating_show;
    	let t3;
    	let current;

    	function popover_show_binding(value) {
    		/*popover_show_binding*/ ctx[2](value);
    	}

    	let popover_props = {
    		placement: "top",
    		$$slots: {
    			content: [create_content_slot],
    			trigger: [create_trigger_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showPopover*/ ctx[0] !== void 0) {
    		popover_props.show = /*showPopover*/ ctx[0];
    	}

    	popover = new Popover({ props: popover_props, $$inline: true });
    	binding_callbacks.push(() => bind(popover, 'show', popover_show_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Draw Probability Calculator";
    			t1 = space();
    			p = element("p");
    			t2 = text("This tool is made to answer questions like, \"what are the chances I draw ramp and two lands in my opening hand.\" While I thought about this tool in the frame of Magic edh, it will work for any deck size and card game that draws 7 cards to start, and then 1 card per turn after. If you find this helpful, consider \r\n      \r\n      ");
    			create_component(popover.$$.fragment);
    			t3 = text("\r\n\r\n   🙂.");
    			attr_dev(h1, "class", "title svelte-jrt1mu");
    			add_location(h1, file$2, 62, 4, 961);
    			attr_dev(p, "class", "svelte-jrt1mu");
    			add_location(p, file$2, 63, 4, 1017);
    			attr_dev(div, "class", "intro-section svelte-jrt1mu");
    			add_location(div, file$2, 61, 2, 928);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			mount_component(popover, p, null);
    			append_dev(p, t3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const popover_changes = {};

    			if (dirty & /*$$scope, showPopover*/ 9) {
    				popover_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_show && dirty & /*showPopover*/ 1) {
    				updating_show = true;
    				popover_changes.show = /*showPopover*/ ctx[0];
    				add_flush_callback(() => updating_show = false);
    			}

    			popover.$set(popover_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popover.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popover.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(popover);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Intro', slots, []);
    	let showPopover = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Intro> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showPopover = !showPopover);

    	function popover_show_binding(value) {
    		showPopover = value;
    		$$invalidate(0, showPopover);
    	}

    	$$self.$capture_state = () => ({ Popover, showPopover });

    	$$self.$inject_state = $$props => {
    		if ('showPopover' in $$props) $$invalidate(0, showPopover = $$props.showPopover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showPopover, click_handler, popover_show_binding];
    }

    class Intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Intro",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const primary_property = axis === 'y' ? 'height' : 'width';
        const primary_property_value = parseFloat(style[primary_property]);
        const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
        const capitalized_secondary_properties = secondary_properties.map((e) => `${e[0].toUpperCase()}${e.slice(1)}`);
        const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
        const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
        const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
        const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
        const border_width_start_value = parseFloat(style[`border${capitalized_secondary_properties[0]}Width`]);
        const border_width_end_value = parseFloat(style[`border${capitalized_secondary_properties[1]}Width`]);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `${primary_property}: ${t * primary_property_value}px;` +
                `padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
                `padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
                `margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
                `margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
                `border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
                `border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
        };
    }

    var css_248z$1 = "";
    styleInject(css_248z$1);

    /* src\FAQ.svelte generated by Svelte v3.59.2 */
    const file$1 = "src\\FAQ.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i].question;
    	child_ctx[5] = list[i].answer;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (63:8) {#if openItem === index}
    function create_if_block(ctx) {
    	let div;
    	let raw_value = /*answer*/ ctx[5] + "";
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "answer svelte-1wk37ja");
    			add_location(div, file$1, 63, 10, 2998);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    			current = true;
    		},
    		p: noop$3,
    		i: function intro(local) {
    			if (current) return;

    			if (local) {
    				add_render_callback(() => {
    					if (!current) return;
    					if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 250 }, true);
    					div_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (local) {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 250 }, false);
    				div_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:8) {#if openItem === index}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#each faqs as {question, answer}
    function create_each_block(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*question*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*openItem*/ ctx[0] === /*index*/ ctx[7] && create_if_block(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*index*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(h3, "class", "svelte-1wk37ja");
    			add_location(h3, file$1, 61, 8, 2933);
    			attr_dev(div, "class", "accordion-item svelte-1wk37ja");
    			add_location(div, file$1, 60, 6, 2860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*openItem*/ ctx[0] === /*index*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*openItem*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t2);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(60:4) {#each faqs as {question, answer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = /*faqs*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "accordion svelte-1wk37ja");
    			add_location(div, file$1, 58, 2, 2782);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toggleItem, faqs, openItem*/ 7) {
    				each_value = /*faqs*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FAQ', slots, []);

    	let faqs = [
    		{
    			question: "How does this work?",
    			answer: "This tool uses <a href='https://en.wikipedia.org/wiki/Hypergeometric_distribution' target='_blank'>hypergeometric distribution</a> math to calculate draw probabilities common to Magic and other card games."
    		},
    		{
    			question: "How do I know this is accurate?",
    			answer: "This tool has been checked against others (<a href='https://deckulator.appspot.com/' target='_blank'>deckulator, </a> <a href='https://aetherhub.com/Apps/HyperGeometric' target='_blank'>aetherhub,</a><a href='https://www.andrew.cmu.edu/user/kmliu/mtg_combo_calc.html' target='_blank'> mtg combo calc</a>) for accuracy. NOTE that the mulligan feature is still experimental and needs refinement."
    		},
    		{
    			question: "I'd like to support this or give feedback.",
    			answer: "There's a lot of ways to help! <p><b>If you're a mathy person,</b> you could help me figure out mulligan calculations by providing a rough framework of how the calculation would work. See the github <a href='https://github.com/savanaben/svelte-mtg-calculator?tab=readme-ov-file#svelte-mtg-calculator' target='_blank'>readme</a> for more info.</p> <p><b>If you're a developer,</b> feel free to check out the <a href='https://github.com/savanaben/svelte-mtg-calculator?tab=readme-ov-file#svelte-mtg-calculator' target='_blank'>readme</a> project and propose improvements. The readme has a list of areas of improvement/known issues.</p> <p>Finally, <b>If you just have a great idea to make this more useful,</b> send me an email (ben.c.gross@gmail.com). This is a passion project and I'd love to extend or add functionality that helps people build their deck.</p> "
    		}
    	];

    	let openItem = null;

    	function toggleItem(index) {
    		$$invalidate(0, openItem = openItem === index ? null : index);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FAQ> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => toggleItem(index);
    	$$self.$capture_state = () => ({ slide, faqs, openItem, toggleItem });

    	$$self.$inject_state = $$props => {
    		if ('faqs' in $$props) $$invalidate(1, faqs = $$props.faqs);
    		if ('openItem' in $$props) $$invalidate(0, openItem = $$props.openItem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openItem, faqs, toggleItem, click_handler];
    }

    class FAQ extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FAQ",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var css_248z = "";
    styleInject(css_248z);

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let intro;
    	let t0;
    	let groupdefinition;
    	let t1;
    	let calculation;
    	let t2;
    	let faq;
    	let current;
    	intro = new Intro({ $$inline: true });
    	groupdefinition = new GroupDefinition({ $$inline: true });
    	groupdefinition.$on("updateGroups", /*handleGroupUpdate*/ ctx[3]);

    	calculation = new Calculation({
    			props: {
    				groups: /*groups*/ ctx[0],
    				deckSize: /*deckSize*/ ctx[1],
    				mulliganCount: /*mulliganCount*/ ctx[2]
    			},
    			$$inline: true
    		});

    	faq = new FAQ({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(intro.$$.fragment);
    			t0 = space();
    			create_component(groupdefinition.$$.fragment);
    			t1 = space();
    			create_component(calculation.$$.fragment);
    			t2 = space();
    			create_component(faq.$$.fragment);
    			attr_dev(main, "class", "parameters svelte-1hj1r27");
    			add_location(main, file, 20, 0, 468);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(intro, main, null);
    			append_dev(main, t0);
    			mount_component(groupdefinition, main, null);
    			append_dev(main, t1);
    			mount_component(calculation, main, null);
    			append_dev(main, t2);
    			mount_component(faq, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const calculation_changes = {};
    			if (dirty & /*groups*/ 1) calculation_changes.groups = /*groups*/ ctx[0];
    			if (dirty & /*deckSize*/ 2) calculation_changes.deckSize = /*deckSize*/ ctx[1];
    			if (dirty & /*mulliganCount*/ 4) calculation_changes.mulliganCount = /*mulliganCount*/ ctx[2];
    			calculation.$set(calculation_changes);
    		},
    		i: function intro$1(local) {
    			if (current) return;
    			transition_in(intro.$$.fragment, local);
    			transition_in(groupdefinition.$$.fragment, local);
    			transition_in(calculation.$$.fragment, local);
    			transition_in(faq.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intro.$$.fragment, local);
    			transition_out(groupdefinition.$$.fragment, local);
    			transition_out(calculation.$$.fragment, local);
    			transition_out(faq.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(intro);
    			destroy_component(groupdefinition);
    			destroy_component(calculation);
    			destroy_component(faq);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let groups = [];
    	let deckSize = 99; // Default deck size
    	let mulliganCount = 0;

    	function handleGroupUpdate(event) {
    		$$invalidate(0, groups = event.detail.groups);
    		$$invalidate(1, deckSize = event.detail.deckSize);
    		$$invalidate(2, mulliganCount = event.detail.mulliganCount);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		GroupDefinition,
    		Calculation,
    		Intro,
    		FAQ,
    		groups,
    		deckSize,
    		mulliganCount,
    		handleGroupUpdate
    	});

    	$$self.$inject_state = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('deckSize' in $$props) $$invalidate(1, deckSize = $$props.deckSize);
    		if ('mulliganCount' in $$props) $$invalidate(2, mulliganCount = $$props.mulliganCount);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [groups, deckSize, mulliganCount, handleGroupUpdate];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
