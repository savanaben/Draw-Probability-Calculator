
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function split_css_unit(value) {
        const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
        return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px'];
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

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
    function hash(str) {
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
        const name = `__svelte_${hash(rule)}_${uid}`;
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
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
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
            update: noop,
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
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
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
    function writable(value, start = noop) {
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
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
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

    /* src\GroupDefinition.svelte generated by Svelte v3.59.2 */
    const file$5 = "src\\GroupDefinition.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[18] = list;
    	child_ctx[19] = i;
    	return child_ctx;
    }

    // (94:24) {#if index > 0}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*index*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Remove";
    			attr_dev(button, "class", "svelte-119iqjf");
    			add_location(button, file$5, 94, 28, 3716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(94:24) {#if index > 0}",
    		ctx
    	});

    	return block;
    }

    // (56:12) {#each groups as group, index}
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
    		/*input0_input_handler*/ ctx[7].call(input0, /*each_value*/ ctx[18], /*index*/ ctx[19]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[8].call(input1, /*each_value*/ ctx[18], /*index*/ ctx[19]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[9].call(input2, /*each_value*/ ctx[18], /*index*/ ctx[19]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[10].call(input3, /*each_value*/ ctx[18], /*index*/ ctx[19]);
    	}

    	let if_block = /*index*/ ctx[19] > 0 && create_if_block$2(ctx);

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
    			attr_dev(input0, "class", "input-group svelte-119iqjf");

    			set_style(input0, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    			? /*group*/ ctx[17].link
    			: /*group*/ ctx[17].name]);

    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "mana, draw, ramp, etc");
    			add_location(input0, file$5, 58, 24, 1918);
    			attr_dev(td0, "class", "svelte-119iqjf");
    			add_location(td0, file$5, 57, 20, 1888);
    			attr_dev(input1, "class", "input-group svelte-119iqjf");

    			set_style(input1, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    			? /*group*/ ctx[17].link
    			: /*group*/ ctx[17].name]);

    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "99");
    			add_location(input1, file$5, 66, 24, 2341);
    			attr_dev(td1, "class", "svelte-119iqjf");
    			add_location(td1, file$5, 65, 20, 2311);
    			attr_dev(input2, "class", "input-group svelte-119iqjf");

    			set_style(input2, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    			? /*group*/ ctx[17].link
    			: /*group*/ ctx[17].name]);

    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "1");
    			attr_dev(input2, "max", "99");
    			add_location(input2, file$5, 75, 24, 2777);
    			attr_dev(td2, "class", "svelte-119iqjf");
    			add_location(td2, file$5, 74, 20, 2747);
    			attr_dev(input3, "class", "input-group svelte-119iqjf");

    			set_style(input3, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    			? /*group*/ ctx[17].link
    			: /*group*/ ctx[17].name]);

    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "Category 1 + 2, etc");
    			add_location(input3, file$5, 85, 24, 3251);
    			attr_dev(td3, "class", "svelte-119iqjf");
    			add_location(td3, file$5, 84, 20, 3221);
    			attr_dev(td4, "class", "svelte-119iqjf");
    			add_location(td4, file$5, 92, 20, 3641);
    			add_location(tr, file$5, 56, 16, 1862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*group*/ ctx[17].name);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*group*/ ctx[17].size);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*group*/ ctx[17].cardsToDraw);
    			append_dev(tr, t2);
    			append_dev(tr, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*group*/ ctx[17].link);
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

    			if (dirty & /*$groupColors, groups*/ 9) {
    				set_style(input0, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    				? /*group*/ ctx[17].link
    				: /*group*/ ctx[17].name]);
    			}

    			if (dirty & /*groups*/ 1 && input0.value !== /*group*/ ctx[17].name) {
    				set_input_value(input0, /*group*/ ctx[17].name);
    			}

    			if (dirty & /*$groupColors, groups*/ 9) {
    				set_style(input1, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    				? /*group*/ ctx[17].link
    				: /*group*/ ctx[17].name]);
    			}

    			if (dirty & /*groups*/ 1 && to_number(input1.value) !== /*group*/ ctx[17].size) {
    				set_input_value(input1, /*group*/ ctx[17].size);
    			}

    			if (dirty & /*$groupColors, groups*/ 9) {
    				set_style(input2, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    				? /*group*/ ctx[17].link
    				: /*group*/ ctx[17].name]);
    			}

    			if (dirty & /*groups*/ 1 && to_number(input2.value) !== /*group*/ ctx[17].cardsToDraw) {
    				set_input_value(input2, /*group*/ ctx[17].cardsToDraw);
    			}

    			if (dirty & /*$groupColors, groups*/ 9) {
    				set_style(input3, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[17].link && /*group*/ ctx[17].link.trim()
    				? /*group*/ ctx[17].link
    				: /*group*/ ctx[17].name]);
    			}

    			if (dirty & /*groups*/ 1 && input3.value !== /*group*/ ctx[17].link) {
    				set_input_value(input3, /*group*/ ctx[17].link);
    			}

    			if (/*index*/ ctx[19] > 0) if_block.p(ctx, dirty);
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
    		source: "(56:12) {#each groups as group, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
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
    	let t13;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t19;
    	let div1;
    	let label1;
    	let t21;
    	let input;
    	let mounted;
    	let dispose;
    	let each_value = /*groups*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Category unique name";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "# Cards in category";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Minimum # desired cards";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Linked categories*";
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
    			label0.textContent = "Number of Mulligans**:";
    			t13 = space();
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
    			t19 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Deck Size:";
    			t21 = space();
    			input = element("input");
    			attr_dev(th0, "class", "svelte-119iqjf");
    			add_location(th0, file$5, 47, 16, 1549);
    			attr_dev(th1, "class", "svelte-119iqjf");
    			add_location(th1, file$5, 48, 16, 1596);
    			attr_dev(th2, "class", "svelte-119iqjf");
    			add_location(th2, file$5, 49, 16, 1642);
    			attr_dev(th3, "class", "svelte-119iqjf");
    			add_location(th3, file$5, 50, 16, 1692);
    			attr_dev(th4, "class", "svelte-119iqjf");
    			add_location(th4, file$5, 51, 16, 1737);
    			add_location(tr, file$5, 46, 12, 1527);
    			add_location(thead, file$5, 45, 8, 1506);
    			add_location(tbody, file$5, 54, 8, 1793);
    			attr_dev(table, "class", "svelte-119iqjf");
    			add_location(table, file$5, 44, 4, 1489);
    			attr_dev(button, "class", "svelte-119iqjf");
    			add_location(button, file$5, 104, 8, 3973);
    			attr_dev(label0, "for", "mulliganCount");
    			attr_dev(label0, "class", "svelte-119iqjf");
    			add_location(label0, file$5, 107, 12, 4096);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			add_location(option0, file$5, 109, 16, 4220);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			add_location(option1, file$5, 110, 16, 4266);
    			option2.__value = "2";
    			option2.value = option2.__value;
    			add_location(option2, file$5, 111, 16, 4312);
    			option3.__value = "3";
    			option3.value = option3.__value;
    			add_location(option3, file$5, 112, 16, 4358);
    			option4.__value = "4";
    			option4.value = option4.__value;
    			add_location(option4, file$5, 113, 16, 4404);
    			attr_dev(select, "class", "svelte-119iqjf");
    			if (/*mulliganCount*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file$5, 108, 12, 4167);
    			attr_dev(div0, "class", "mulligan-selection svelte-119iqjf");
    			add_location(div0, file$5, 106, 8, 4050);
    			attr_dev(label1, "for", "deckSize");
    			attr_dev(label1, "class", "svelte-119iqjf");
    			add_location(label1, file$5, 118, 12, 4530);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", "deckSize");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "class", "svelte-119iqjf");
    			add_location(input, file$5, 119, 12, 4584);
    			attr_dev(div1, "class", "deck-size-container svelte-119iqjf");
    			add_location(div1, file$5, 117, 8, 4483);
    			attr_dev(div2, "class", "controls-container svelte-119iqjf");
    			add_location(div2, file$5, 102, 4, 3921);
    			attr_dev(div3, "class", "parameters svelte-119iqjf");
    			add_location(div3, file$5, 42, 0, 1457);
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
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
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
    			append_dev(div0, t13);
    			append_dev(div0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			select_option(select, /*mulliganCount*/ ctx[2], true);
    			append_dev(div2, t19);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t21);
    			append_dev(div1, input);
    			set_input_value(input, /*deckSize*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*addGroup*/ ctx[4], false, false, false, false),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[12]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[13])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*removeGroup, $groupColors, groups*/ 41) {
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

    			if (dirty & /*mulliganCount*/ 4) {
    				select_option(select, /*mulliganCount*/ ctx[2]);
    			}

    			if (dirty & /*deckSize*/ 2 && to_number(input.value) !== /*deckSize*/ ctx[1]) {
    				set_input_value(input, /*deckSize*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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
    	let $groupColors;
    	validate_store(groupColors, 'groupColors');
    	component_subscribe($$self, groupColors, $$value => $$invalidate(3, $groupColors = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GroupDefinition', slots, []);
    	const dispatch = createEventDispatcher();
    	let nextIndex = 1; // Initialize the counter for group indexes

    	let groups = [
    		{
    			index: 0,
    			name: 'Category 1',
    			size: 1,
    			cardsToDraw: 1,
    			link: ''
    		}
    	]; // Initial group with name 'Category 1'

    	let deckSize = 99;
    	let mulliganCount = 0;
    	const presetColors = ["#E1BEE7", "#B2DFDB", "#FFE0B2", "#DCEDC8", "#B3E5FC", "#FFCCBC", "#C5CAE9"];
    	let colorIndex = 0;

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

    	const click_handler = index => removeGroup(index);

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
    		dispatch,
    		nextIndex,
    		groups,
    		deckSize,
    		mulliganCount,
    		presetColors,
    		colorIndex,
    		addGroup,
    		removeGroup,
    		$groupColors
    	});

    	$$self.$inject_state = $$props => {
    		if ('nextIndex' in $$props) nextIndex = $$props.nextIndex;
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('deckSize' in $$props) $$invalidate(1, deckSize = $$props.deckSize);
    		if ('mulliganCount' in $$props) $$invalidate(2, mulliganCount = $$props.mulliganCount);
    		if ('colorIndex' in $$props) $$invalidate(6, colorIndex = $$props.colorIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*groups, colorIndex, deckSize, mulliganCount*/ 71) {
    			{
    				let updatedColors = {};

    				groups.forEach(group => {
    					let key = group.link && group.link.trim()
    					? group.link
    					: group.name;

    					if (!updatedColors[key]) {
    						updatedColors[key] = presetColors[$$invalidate(6, colorIndex++, colorIndex) % presetColors.length];
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
    		$groupColors,
    		addGroup,
    		removeGroup,
    		colorIndex,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		click_handler,
    		select_change_handler,
    		input_input_handler
    	];
    }

    class GroupDefinition extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GroupDefinition",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Calculation.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$4 = "src\\Calculation.svelte";

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
    			attr_dev(div0, "class", "probability svelte-1hn68f1");
    			add_location(div0, file$4, 298, 32, 9149);
    			attr_dev(div1, "class", "card-ratio svelte-1hn68f1");
    			add_location(div1, file$4, 299, 32, 9271);
    			attr_dev(div2, "class", "card-details svelte-1hn68f1");
    			add_location(div2, file$4, 297, 28, 9089);
    			attr_dev(div3, "class", "rectangle svelte-1hn68f1");
    			set_style(div3, "background-color", /*card*/ ctx[16].color);
    			add_location(div3, file$4, 296, 24, 8997);
    			attr_dev(div4, "class", "card-label svelte-1hn68f1");
    			add_location(div4, file$4, 302, 24, 9411);
    			attr_dev(div5, "class", "card-container svelte-1hn68f1");
    			add_location(div5, file$4, 295, 20, 8943);
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
    			attr_dev(div0, "class", "turn-label svelte-1hn68f1");
    			add_location(div0, file$4, 292, 12, 8763);
    			attr_dev(div1, "class", "card-rectangles svelte-1hn68f1");
    			add_location(div1, file$4, 293, 12, 8819);
    			attr_dev(div2, "class", "turn-row svelte-1hn68f1");
    			add_location(div2, file$4, 291, 8, 8727);
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

    function create_fragment$4(ctx) {
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

    			attr_dev(div, "class", "output-diagram svelte-1hn68f1");
    			add_location(div, file$4, 289, 0, 8656);
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    function instance$4($$self, $$props, $$invalidate) {
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

    	const presetColors = ["#E1BEE7", "#B2DFDB", "#FFE0B2", "#DCEDC8", "#B3E5FC", "#FFCCBC", "#C5CAE9"]; // Example colors

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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { groups: 0, deckSize: 3, mulliganCount: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calculation",
    			options,
    			id: create_fragment$4.name
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

    /* src\Intro.svelte generated by Svelte v3.59.2 */

    const file$3 = "src\\Intro.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Magic Probability Calculator";
    			t1 = space();
    			p = element("p");
    			p.textContent = "This tool is made to answer questions like, \"what are the chances I draw a mana rock and two lands in my opening hand.\" If it helps you, consider buying me a half a coffee 🙂.";
    			attr_dev(h1, "class", "title svelte-1cm7is4");
    			add_location(h1, file$3, 55, 4, 912);
    			attr_dev(p, "class", "svelte-1cm7is4");
    			add_location(p, file$3, 56, 4, 969);
    			attr_dev(div, "class", "intro-section svelte-1cm7is4");
    			add_location(div, file$3, 54, 2, 879);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Intro', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Intro> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Intro",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        const [xValue, xUnit] = split_css_unit(x);
        const [yValue, yUnit] = split_css_unit(y);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - (od * u)}`
        };
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

    /* src\FAQ.svelte generated by Svelte v3.59.2 */
    const file$2 = "src\\FAQ.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i].question;
    	child_ctx[5] = list[i].answer;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (59:8) {#if openItem === index}
    function create_if_block$1(ctx) {
    	let div;
    	let p;
    	let t_value = /*answer*/ ctx[5] + "";
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "svelte-62mpao");
    			add_location(p, file$2, 60, 12, 2128);
    			attr_dev(div, "class", "answer svelte-62mpao");
    			add_location(div, file$2, 59, 10, 2053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    			current = true;
    		},
    		p: noop,
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:8) {#if openItem === index}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#each faqs as {question, answer}
    function create_each_block(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*question*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*openItem*/ ctx[0] === /*index*/ ctx[7] && create_if_block$1(ctx);

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
    			attr_dev(h3, "class", "svelte-62mpao");
    			add_location(h3, file$2, 57, 8, 1988);
    			attr_dev(div, "class", "accordion-item svelte-62mpao");
    			add_location(div, file$2, 56, 6, 1915);
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
    					if_block = create_if_block$1(ctx);
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
    		source: "(56:4) {#each faqs as {question, answer}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
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

    			attr_dev(div, "class", "accordion svelte-62mpao");
    			add_location(div, file$2, 54, 2, 1837);
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
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('FAQ', slots, []);

    	let faqs = [
    		{
    			question: "How do I use this?",
    			answer: "Svelte is a radical new approach to building user interfaces. Unlike traditional frameworks, Svelte shifts much of the work to compile time, producing highly efficient code that runs directly in the browser."
    		},
    		{
    			question: "How do I know this is accurate?",
    			answer: "You might choose Svelte for its simplicity, speed, and ease of learning. It compiles your code to tiny, framework-less vanilla JS — your app starts fast and stays fast."
    		},
    		{
    			question: "I'd like to support this or give feedback.",
    			answer: "Svelte differs in that it doesn't use a virtual DOM. It compiles your components down to efficient imperative code that directly updates the DOM when the state of the app changes."
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FAQ",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Popup.svelte generated by Svelte v3.59.2 */
    const file$1 = "src\\Popup.svelte";

    // (38:2) {#if show}
    function create_if_block(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let button;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(/*message*/ ctx[1]);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Close";
    			attr_dev(p, "class", "svelte-u91rjo");
    			add_location(p, file$1, 39, 4, 1421);
    			add_location(button, file$1, 40, 4, 1443);
    			attr_dev(div, "class", "popup svelte-u91rjo");
    			attr_dev(div, "style", /*style*/ ctx[3]);
    			add_location(div, file$1, 38, 2, 1314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			/*div_binding*/ ctx[6](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*message*/ 2) set_data_dev(t0, /*message*/ ctx[1]);

    			if (!current || dirty & /*style*/ 8) {
    				attr_dev(div, "style", /*style*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -10, duration: 200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { y: -10, duration: 200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[6](null);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(38:2) {#if show}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*show*/ ctx[0] && create_if_block(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*show*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*show*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Popup', slots, []);
    	let { triggerElementId = '' } = $$props;
    	let { message = 'Default message' } = $$props;
    	let { show = false } = $$props;
    	let popupElement;

    	const calculatePosition = () => {
    		const triggerElement = document.getElementById(triggerElementId);

    		if (triggerElement && popupElement) {
    			const triggerRect = triggerElement.getBoundingClientRect();
    			const popupRect = popupElement.getBoundingClientRect();

    			// Position above the trigger element, centered
    			const top = triggerRect.top - popupRect.height - 5; // 5px above for a small gap

    			const left = triggerRect.left + triggerRect.width / 2 - popupRect.width / 2;
    			return { top, left };
    		}

    		return { top: '50%', left: '50%' }; // Fallback position
    	};

    	let style = `position: fixed;`;

    	onMount(() => {
    		if (show) {
    			const { top, left } = calculatePosition();
    			$$invalidate(3, style += `top: ${top}px; left: ${left}px;`);
    		}
    	});

    	const writable_props = ['triggerElementId', 'message', 'show'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Popup> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, show = false);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			popupElement = $$value;
    			$$invalidate(2, popupElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('triggerElementId' in $$props) $$invalidate(4, triggerElementId = $$props.triggerElementId);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    		if ('show' in $$props) $$invalidate(0, show = $$props.show);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		onMount,
    		triggerElementId,
    		message,
    		show,
    		popupElement,
    		calculatePosition,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('triggerElementId' in $$props) $$invalidate(4, triggerElementId = $$props.triggerElementId);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    		if ('show' in $$props) $$invalidate(0, show = $$props.show);
    		if ('popupElement' in $$props) $$invalidate(2, popupElement = $$props.popupElement);
    		if ('style' in $$props) $$invalidate(3, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*show*/ 1) {
    			if (show) {
    				const { top, left } = calculatePosition();
    				$$invalidate(3, style = `position: fixed; top: ${top}px; left: ${left}px;`);
    			}
    		}
    	};

    	return [
    		show,
    		message,
    		popupElement,
    		style,
    		triggerElementId,
    		click_handler,
    		div_binding
    	];
    }

    class Popup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { triggerElementId: 4, message: 1, show: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popup",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get triggerElementId() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set triggerElementId(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get show() {
    		throw new Error("<Popup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Popup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let intro;
    	let t0;
    	let button;
    	let t2;
    	let popup;
    	let t3;
    	let groupdefinition;
    	let t4;
    	let calculation;
    	let t5;
    	let p0;
    	let t7;
    	let p1;
    	let t9;
    	let faq;
    	let current;
    	let mounted;
    	let dispose;
    	intro = new Intro({ $$inline: true });

    	popup = new Popup({
    			props: {
    				triggerElementId: "triggerButton",
    				message: "Dynamic positioning popup",
    				show: /*showPopup*/ ctx[3]
    			},
    			$$inline: true
    		});

    	groupdefinition = new GroupDefinition({ $$inline: true });
    	groupdefinition.$on("updateGroups", /*handleGroupUpdate*/ ctx[4]);

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
    			button = element("button");
    			button.textContent = "Toggle Popup";
    			t2 = space();
    			create_component(popup.$$.fragment);
    			t3 = space();
    			create_component(groupdefinition.$$.fragment);
    			t4 = space();
    			create_component(calculation.$$.fragment);
    			t5 = space();
    			p0 = element("p");
    			p0.textContent = "*You can link up to 4 categories by assigning them the same name (name text must match).";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "**WARNING - Mulligan feature is experimental. Mulligan on turn 0 factors in calculations and such, while mulligans on turn 1, turn 2, etc. simply add the increased probability of getting the desired card from turn 0. I am sure this is not an accurate method but it's the best I could think of for now.";
    			t9 = space();
    			create_component(faq.$$.fragment);
    			attr_dev(button, "id", "triggerButton");
    			add_location(button, file, 26, 1, 573);
    			add_location(p0, file, 34, 1, 885);
    			add_location(p1, file, 35, 1, 982);
    			attr_dev(main, "class", "parameters svelte-pduo9z");
    			add_location(main, file, 23, 0, 531);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(intro, main, null);
    			append_dev(main, t0);
    			append_dev(main, button);
    			append_dev(main, t2);
    			mount_component(popup, main, null);
    			append_dev(main, t3);
    			mount_component(groupdefinition, main, null);
    			append_dev(main, t4);
    			mount_component(calculation, main, null);
    			append_dev(main, t5);
    			append_dev(main, p0);
    			append_dev(main, t7);
    			append_dev(main, p1);
    			append_dev(main, t9);
    			mount_component(faq, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const popup_changes = {};
    			if (dirty & /*showPopup*/ 8) popup_changes.show = /*showPopup*/ ctx[3];
    			popup.$set(popup_changes);
    			const calculation_changes = {};
    			if (dirty & /*groups*/ 1) calculation_changes.groups = /*groups*/ ctx[0];
    			if (dirty & /*deckSize*/ 2) calculation_changes.deckSize = /*deckSize*/ ctx[1];
    			if (dirty & /*mulliganCount*/ 4) calculation_changes.mulliganCount = /*mulliganCount*/ ctx[2];
    			calculation.$set(calculation_changes);
    		},
    		i: function intro$1(local) {
    			if (current) return;
    			transition_in(intro.$$.fragment, local);
    			transition_in(popup.$$.fragment, local);
    			transition_in(groupdefinition.$$.fragment, local);
    			transition_in(calculation.$$.fragment, local);
    			transition_in(faq.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intro.$$.fragment, local);
    			transition_out(popup.$$.fragment, local);
    			transition_out(groupdefinition.$$.fragment, local);
    			transition_out(calculation.$$.fragment, local);
    			transition_out(faq.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(intro);
    			destroy_component(popup);
    			destroy_component(groupdefinition);
    			destroy_component(calculation);
    			destroy_component(faq);
    			mounted = false;
    			dispose();
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
    	let showPopup = false;

    	function handleGroupUpdate(event) {
    		$$invalidate(0, groups = event.detail.groups);
    		$$invalidate(1, deckSize = event.detail.deckSize);
    		$$invalidate(2, mulliganCount = event.detail.mulliganCount);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(3, showPopup = !showPopup);

    	$$self.$capture_state = () => ({
    		GroupDefinition,
    		Calculation,
    		Intro,
    		FAQ,
    		Popup,
    		groups,
    		deckSize,
    		mulliganCount,
    		showPopup,
    		handleGroupUpdate
    	});

    	$$self.$inject_state = $$props => {
    		if ('groups' in $$props) $$invalidate(0, groups = $$props.groups);
    		if ('deckSize' in $$props) $$invalidate(1, deckSize = $$props.deckSize);
    		if ('mulliganCount' in $$props) $$invalidate(2, mulliganCount = $$props.mulliganCount);
    		if ('showPopup' in $$props) $$invalidate(3, showPopup = $$props.showPopup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [groups, deckSize, mulliganCount, showPopup, handleGroupUpdate, click_handler];
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
