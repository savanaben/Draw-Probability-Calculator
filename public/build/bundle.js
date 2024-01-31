
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
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
    const outroing = new Set();
    let outros;
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
    const file$2 = "src\\GroupDefinition.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[17] = list;
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (100:24) {#if index > 0}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*index*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Remove";
    			attr_dev(button, "class", "svelte-17ib6f");
    			add_location(button, file$2, 100, 28, 3879);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(100:24) {#if index > 0}",
    		ctx
    	});

    	return block;
    }

    // (62:12) {#each groups as group, index}
    function create_each_block$1(ctx) {
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
    		/*input0_input_handler*/ ctx[7].call(input0, /*each_value*/ ctx[17], /*index*/ ctx[18]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[8].call(input1, /*each_value*/ ctx[17], /*index*/ ctx[18]);
    	}

    	function input2_input_handler() {
    		/*input2_input_handler*/ ctx[9].call(input2, /*each_value*/ ctx[17], /*index*/ ctx[18]);
    	}

    	function input3_input_handler() {
    		/*input3_input_handler*/ ctx[10].call(input3, /*each_value*/ ctx[17], /*index*/ ctx[18]);
    	}

    	let if_block = /*index*/ ctx[18] > 0 && create_if_block(ctx);

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
    			attr_dev(input0, "class", "input-group svelte-17ib6f");

    			set_style(input0, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    			? /*group*/ ctx[16].link
    			: /*group*/ ctx[16].name]);

    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "mana, draw, ramp, etc");
    			add_location(input0, file$2, 64, 24, 2072);
    			attr_dev(td0, "class", "svelte-17ib6f");
    			add_location(td0, file$2, 63, 20, 2042);
    			attr_dev(input1, "class", "input-group svelte-17ib6f");

    			set_style(input1, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    			? /*group*/ ctx[16].link
    			: /*group*/ ctx[16].name]);

    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "99");
    			add_location(input1, file$2, 72, 24, 2495);
    			attr_dev(td1, "class", "svelte-17ib6f");
    			add_location(td1, file$2, 71, 20, 2465);
    			attr_dev(input2, "class", "input-group svelte-17ib6f");

    			set_style(input2, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    			? /*group*/ ctx[16].link
    			: /*group*/ ctx[16].name]);

    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "1");
    			attr_dev(input2, "max", "99");
    			add_location(input2, file$2, 81, 24, 2931);
    			attr_dev(td2, "class", "svelte-17ib6f");
    			add_location(td2, file$2, 80, 20, 2901);
    			attr_dev(input3, "class", "input-group svelte-17ib6f");

    			set_style(input3, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    			? /*group*/ ctx[16].link
    			: /*group*/ ctx[16].name]);

    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "placeholder", "combo pieces, synergy 1, etc");
    			add_location(input3, file$2, 91, 24, 3405);
    			attr_dev(td3, "class", "svelte-17ib6f");
    			add_location(td3, file$2, 90, 20, 3375);
    			attr_dev(td4, "class", "svelte-17ib6f");
    			add_location(td4, file$2, 98, 20, 3804);
    			add_location(tr, file$2, 62, 16, 2016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, input0);
    			set_input_value(input0, /*group*/ ctx[16].name);
    			append_dev(tr, t0);
    			append_dev(tr, td1);
    			append_dev(td1, input1);
    			set_input_value(input1, /*group*/ ctx[16].size);
    			append_dev(tr, t1);
    			append_dev(tr, td2);
    			append_dev(td2, input2);
    			set_input_value(input2, /*group*/ ctx[16].cardsToDraw);
    			append_dev(tr, t2);
    			append_dev(tr, td3);
    			append_dev(td3, input3);
    			set_input_value(input3, /*group*/ ctx[16].link);
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
    				set_style(input0, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    				? /*group*/ ctx[16].link
    				: /*group*/ ctx[16].name]);
    			}

    			if (dirty & /*groups*/ 1 && input0.value !== /*group*/ ctx[16].name) {
    				set_input_value(input0, /*group*/ ctx[16].name);
    			}

    			if (dirty & /*$groupColors, groups*/ 9) {
    				set_style(input1, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    				? /*group*/ ctx[16].link
    				: /*group*/ ctx[16].name]);
    			}

    			if (dirty & /*groups*/ 1 && to_number(input1.value) !== /*group*/ ctx[16].size) {
    				set_input_value(input1, /*group*/ ctx[16].size);
    			}

    			if (dirty & /*$groupColors, groups*/ 9) {
    				set_style(input2, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    				? /*group*/ ctx[16].link
    				: /*group*/ ctx[16].name]);
    			}

    			if (dirty & /*groups*/ 1 && to_number(input2.value) !== /*group*/ ctx[16].cardsToDraw) {
    				set_input_value(input2, /*group*/ ctx[16].cardsToDraw);
    			}

    			if (dirty & /*$groupColors, groups*/ 9) {
    				set_style(input3, "--bg-color", /*$groupColors*/ ctx[3][/*group*/ ctx[16].link && /*group*/ ctx[16].link.trim()
    				? /*group*/ ctx[16].link
    				: /*group*/ ctx[16].name]);
    			}

    			if (dirty & /*groups*/ 1 && input3.value !== /*group*/ ctx[16].link) {
    				set_input_value(input3, /*group*/ ctx[16].link);
    			}

    			if (/*index*/ ctx[18] > 0) if_block.p(ctx, dirty);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(62:12) {#each groups as group, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
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
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			button.textContent = "Add Another Group";
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
    			attr_dev(th0, "class", "svelte-17ib6f");
    			add_location(th0, file$2, 53, 16, 1703);
    			attr_dev(th1, "class", "svelte-17ib6f");
    			add_location(th1, file$2, 54, 16, 1750);
    			attr_dev(th2, "class", "svelte-17ib6f");
    			add_location(th2, file$2, 55, 16, 1796);
    			attr_dev(th3, "class", "svelte-17ib6f");
    			add_location(th3, file$2, 56, 16, 1846);
    			attr_dev(th4, "class", "svelte-17ib6f");
    			add_location(th4, file$2, 57, 16, 1891);
    			add_location(tr, file$2, 52, 12, 1681);
    			add_location(thead, file$2, 51, 8, 1660);
    			add_location(tbody, file$2, 60, 8, 1947);
    			attr_dev(table, "class", "svelte-17ib6f");
    			add_location(table, file$2, 50, 4, 1643);
    			attr_dev(button, "class", "svelte-17ib6f");
    			add_location(button, file$2, 110, 8, 4136);
    			attr_dev(label0, "for", "mulliganCount");
    			attr_dev(label0, "class", "svelte-17ib6f");
    			add_location(label0, file$2, 113, 12, 4256);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 115, 16, 4380);
    			option1.__value = "1";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 116, 16, 4426);
    			option2.__value = "2";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 117, 16, 4472);
    			option3.__value = "3";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 118, 16, 4518);
    			option4.__value = "4";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 119, 16, 4564);
    			attr_dev(select, "class", "svelte-17ib6f");
    			if (/*mulliganCount*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[12].call(select));
    			add_location(select, file$2, 114, 12, 4327);
    			attr_dev(div0, "class", "mulligan-selection svelte-17ib6f");
    			add_location(div0, file$2, 112, 8, 4210);
    			attr_dev(label1, "for", "deckSize");
    			attr_dev(label1, "class", "svelte-17ib6f");
    			add_location(label1, file$2, 124, 12, 4690);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", "deckSize");
    			attr_dev(input, "min", "1");
    			attr_dev(input, "class", "svelte-17ib6f");
    			add_location(input, file$2, 125, 12, 4744);
    			attr_dev(div1, "class", "deck-size-container svelte-17ib6f");
    			add_location(div1, file$2, 123, 8, 4643);
    			attr_dev(div2, "class", "controls-container svelte-17ib6f");
    			add_location(div2, file$2, 108, 4, 4084);
    			attr_dev(div3, "class", "parameters svelte-17ib6f");
    			add_location(div3, file$2, 48, 0, 1611);
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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $groupColors;
    	validate_store(groupColors, 'groupColors');
    	component_subscribe($$self, groupColors, $$value => $$invalidate(3, $groupColors = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GroupDefinition', slots, []);
    	const dispatch = createEventDispatcher();

    	let groups = [
    		{
    			name: '',
    			size: 1,
    			cardsToDraw: 1,
    			link: ''
    		}
    	];

    	let deckSize = 99;
    	let mulliganCount = 0;
    	const presetColors = ["#E1BEE7", "#B2DFDB", "#FFE0B2", "#DCEDC8", "#B3E5FC", "#FFCCBC", "#C5CAE9"];
    	let colorIndex = 0;

    	function addGroup() {
    		$$invalidate(0, groups = [
    			...groups,
    			{
    				name: '',
    				size: 1,
    				cardsToDraw: 1,
    				link: ''
    			}
    		]);
    	}

    	function removeGroup(index) {
    		$$invalidate(0, groups = groups.filter((_, i) => i !== index));
    	}

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

    				if (groups.length > 0) {
    					// Assign colors to each group
    					groups.forEach(group => {
    						if (group.link && group.link.trim() !== '') {
    							// If link is present and not empty, assign or use existing color based on link
    							if (!updatedColors[group.link]) {
    								updatedColors[group.link] = presetColors[$$invalidate(6, colorIndex++, colorIndex) % presetColors.length];
    							}

    							updatedColors[group.name] = updatedColors[group.link];
    						} else {
    							// If no link, assign a unique color
    							updatedColors[group.name] = presetColors[$$invalidate(6, colorIndex++, colorIndex) % presetColors.length];
    						}
    					});

    					groupColors.set(updatedColors);
    					dispatch('updateGroups', { groups, deckSize, mulliganCount });
    				}
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GroupDefinition",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Calculation.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$1 = "src\\Calculation.svelte";

    function get_each_context(ctx, list, i) {
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

    // (280:16) {#each createGroupCards(groups, results, turn) as card}
    function create_each_block_1(ctx) {
    	let div2;
    	let div0;

    	let t0_value = (/*card*/ ctx[16].probability !== null
    	? `${/*card*/ ctx[16].probability}%`
    	: '') + "";

    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*card*/ ctx[16].label + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(div0, "class", "rectangle svelte-1ggp6sv");
    			set_style(div0, "background-color", /*card*/ ctx[16].color);
    			add_location(div0, file$1, 281, 24, 8583);
    			attr_dev(div1, "class", "card-label svelte-1ggp6sv");
    			add_location(div1, file$1, 284, 24, 8790);
    			attr_dev(div2, "class", "card-container svelte-1ggp6sv");
    			add_location(div2, file$1, 280, 20, 8529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groups, results*/ 3 && t0_value !== (t0_value = (/*card*/ ctx[16].probability !== null
    			? `${/*card*/ ctx[16].probability}%`
    			: '') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*groups, results*/ 3) {
    				set_style(div0, "background-color", /*card*/ ctx[16].color);
    			}

    			if (dirty & /*groups, results*/ 3 && t2_value !== (t2_value = /*card*/ ctx[16].label + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(280:16) {#each createGroupCards(groups, results, turn) as card}",
    		ctx
    	});

    	return block;
    }

    // (276:4) {#each Array(5) as _, turn}
    function create_each_block(ctx) {
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
    			attr_dev(div0, "class", "turn-label svelte-1ggp6sv");
    			add_location(div0, file$1, 277, 12, 8349);
    			attr_dev(div1, "class", "card-rectangles svelte-1ggp6sv");
    			add_location(div1, file$1, 278, 12, 8405);
    			attr_dev(div2, "class", "turn-row svelte-1ggp6sv");
    			add_location(div2, file$1, 276, 8, 8313);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(276:4) {#each Array(5) as _, turn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = Array(5);
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

    			attr_dev(div, "class", "output-diagram svelte-1ggp6sv");
    			add_location(div, file$1, 274, 0, 8242);
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
    		id: create_fragment$1.name,
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

    function instance$1($$self, $$props, $$invalidate) {
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

    			let probability = groupResult && turn < groupResult.length
    			? Math.round(groupResult[turn].probability * 1000) / 10
    			: null;

    			// Access the color from the groupColors store
    			let color = $groupColors[groupName] || '#e5e5e5'; // Default color if not set

    			return { probability, label: group.name, color };
    		});

    		// Fill up the remaining cards for the turn with blanks
    		while (cards.length < 7 + turn) {
    			cards.push({ probability: null, label: '' });
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { groups: 0, deckSize: 3, mulliganCount: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calculation",
    			options,
    			id: create_fragment$1.name
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

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let groupdefinition;
    	let t0;
    	let calculation;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let current;
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

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(groupdefinition.$$.fragment);
    			t0 = space();
    			create_component(calculation.$$.fragment);
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "*You can link up to 4 categories by assigning them the same name (name text must match).";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "**WARNING - Mulligan feature is experimental. Mulligan on turn 0 factors in calculations and such, while mulligans on turn 1, turn 2, etc. simply add the increased probability of getting the desired card from turn 0. I am sure this is not an accurate method but it's the best I could think of for now.";
    			add_location(p0, file, 19, 1, 536);
    			add_location(p1, file, 20, 1, 633);
    			attr_dev(main, "class", "parameters svelte-3dwzqf");
    			add_location(main, file, 16, 0, 393);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(groupdefinition, main, null);
    			append_dev(main, t0);
    			mount_component(calculation, main, null);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(main, t3);
    			append_dev(main, p1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const calculation_changes = {};
    			if (dirty & /*groups*/ 1) calculation_changes.groups = /*groups*/ ctx[0];
    			if (dirty & /*deckSize*/ 2) calculation_changes.deckSize = /*deckSize*/ ctx[1];
    			if (dirty & /*mulliganCount*/ 4) calculation_changes.mulliganCount = /*mulliganCount*/ ctx[2];
    			calculation.$set(calculation_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(groupdefinition.$$.fragment, local);
    			transition_in(calculation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(groupdefinition.$$.fragment, local);
    			transition_out(calculation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(groupdefinition);
    			destroy_component(calculation);
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
