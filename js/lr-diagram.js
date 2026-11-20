import {machine, state, edge} from './automata.js';
import {LRItemsExercise} from './lr-items.js';

export class LRDiagram {
    constructor(productions) {
        this.items = new LRItemsExercise(productions);
        this.keys = this.items.data.sets.map(set => this.items.format(set));
        this.graph = machine();
        this.add().items = [[0, 0]];
    }
    add(x, y) {
        const n = this.graph.states.length;
        const node = state(this.graph, x ?? 100 + (n % 4) * 175, y ?? 120 + Math.floor(n / 4) * 125);
        node.name = 'I' + node.id;
        node.items = [];
        return node;
    }
    node(id) {
        const node = this.graph.states.find(s => s.id === id);
        if (!node) throw Error('Select an item-set node.');
        return node;
    }
    remove(id) {
        this.node(id);
        this.graph.states = this.graph.states.filter(s => s.id !== id);
        this.graph.transitions = this.graph.transitions.filter(t => t.from !== id && t.to !== id);
    }
    initial(id) {
        this.node(id);
        this.graph.states.forEach(s => { s.initial = s.id === id; });
    }
    connect(from, symbol, to) {
        this.node(from);
        this.node(to);
        if (!this.items.symbols.includes(symbol)) throw Error('Choose a grammar symbol.');
        const old = this.graph.transitions.find(t => t.from === from && t.read === symbol);
        if (old) old.to = to;
        else edge(this.graph, from, to, symbol, {read:symbol});
    }
    goto(from, symbol) {
        const items = this.items.goto(this.node(from).items, symbol);
        if (!items.length) throw Error('Goto is empty for this symbol.');
        const key = this.items.format(items);
        const target = this.graph.states.find(s => this.items.format(s.items) === key) || this.add();
        target.items = items;
        this.connect(from, symbol, target.id);
        return target.id;
    }
    check() {
        const {states, transitions} = this.graph;
        const mapping = new Map(), used = new Set(), errors = [];
        for (const s of states) {
            const index = this.keys.indexOf(this.items.format(s.items));
            mapping.set(s.id, index);
            if (index < 0) errors.push(s.name + ' has an incomplete or unexpected item set.');
            else if (used.has(index)) errors.push(s.name + ' duplicates another item set.');
            else used.add(index);
        }
        const initial = states.filter(s => s.initial);
        if (initial.length !== 1 || mapping.get(initial[0].id) !== 0)
            errors.push('Mark the closure of the augmented start item as initial.');
        if (used.size < this.keys.length) errors.push((this.keys.length - used.size) + ' item sets still needed.');
        const expected = this.items.data.transitions;
        for (const t of transitions) {
            if (!expected.some(e => e.from === mapping.get(t.from) && e.symbol === t.read && e.to === mapping.get(t.to)))
                errors.push('Incorrect goto from I' + t.from + ' on ' + t.read + ' to I' + t.to + '.');
        }
        for (const s of states) {
            for (const e of expected.filter(t => t.from === mapping.get(s.id))) {
                if (!transitions.some(t => t.from === s.id && t.read === e.symbol && mapping.get(t.to) === e.to))
                    errors.push('I' + s.id + ' needs a goto on ' + e.symbol + ' to its closed target set.');
            }
        }
        return {correct:errors.length === 0, errors};
    }
}
