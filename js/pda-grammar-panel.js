import {PDAGrammarExercise} from './pda-grammar.js';
import {tokenGrammarText} from './token-grammar.js';
import {displayNotation} from './empty-display.js';
import {mountConversionGraph} from './conversion-graph.js';

export function mountPDAGrammarPanel(host, source, {graphMarkup, transitionLabel, button, onExport}) {
    host.innerHTML = `<section class="panel"><h3>Build a context-free grammar from a PDA</h3>
        <label class="field">PDA acceptance<select data-accept><option value="final">Final state</option><option value="empty">Empty stack</option></select></label>
        <p>Select a transition to build its productions. A variable ⟨[p,A,q]⟩ describes paths from p to q that remove A from the stack.</p>
        <div class="split"><section><div data-graph></div><div data-choices class="actions"></div></section>
        <section><p data-status role="status"></p><div data-actions class="actions"></div><label class="field">Production group<select data-group></select></label>
        <pre data-rules></pre><div data-pages class="actions"></div></section></div></section>`;
    const find = name => host.querySelector('[data-' + name + ']');
    const accept = find('accept'), groups = find('group'), limit = 30;
    let exercise, selected, page, markRemaining;
    const stateNames = new Map(source.states.map(state => [state.id, state.name]));
    const describe = t => stateNames.get(t.from) + ' → ' + stateNames.get(t.to) + ' · ' + transitionLabel(t, source);
    function showRules() {
        if (!exercise) return;
        const index = groups.value === 'supplied' ? null : Number(groups.value);
        const rules = index === null ? exercise.supplied : exercise.groups[index];
        const total = Math.max(1, Math.ceil(rules.length / limit));
        page = Math.max(0, Math.min(page, total - 1));
        find('rules').textContent = displayNotation(tokenGrammarText({productions:rules.slice(page * limit, (page + 1) * limit)}));
        find('pages').replaceChildren();
        if (total > 1) {
            const prev = button('Previous rules', () => {page--; showRules();});
            const next = button('Next rules', () => {page++; showRules();});
            prev.disabled = page === 0;
            next.disabled = page + 1 === total;
            find('pages').append(prev, 'Page ' + (page + 1) + ' of ' + total, next);
        }
    }
    function choose(index) {
        exercise.build(index);
        selected = index;
        markRemaining = false;
        page = 0;
        refresh();
    }
    function refresh() {
        const remaining = exercise.remaining;
        const marks = markRemaining ? remaining : selected === null ? [] : [selected];
        const edges = marks.map(index => source.transitions[index].id);
        mountConversionGraph(find('graph'), graphMarkup(source, [], null, edges), {
            label:'Source pushdown automaton', onTransition:id=>choose(source.transitions.findIndex(t=>t.id===id))
        });
        find('choices').replaceChildren(...source.transitions.map((t,i) => {
            const b = button((exercise.built.has(i) ? '✓ ' : '') + describe(t), () => choose(i), marks.includes(i) ? 'active' : '');
            b.setAttribute('aria-label', 'Build transition ' + (i + 1) + ': ' + describe(t));
            return b;
        }));
        find('status').textContent = exercise.built.size + ' of ' + source.transitions.length + ' transitions built.' +
            (markRemaining ? ' Remaining transitions: ' + (remaining.map(i => i + 1).join(', ') || 'none') + '.' : '');
        groups.replaceChildren(new Option('Supplied start and acceptance rules (' + exercise.supplied.length + ')', 'supplied'));
        for (const i of [...exercise.built].sort((a,b)=>a-b)) groups.add(new Option('Transition ' + (i + 1) + ' · ' + describe(source.transitions[i]) + ' (' + exercise.groups[i].length + ')', String(i)));
        groups.value = selected === null ? 'supplied' : String(selected);
        const hint = button('Hint', () => choose(remaining[0]));
        const all = button('Show All', () => {exercise.finish(); selected ??= source.transitions.length ? 0 : null; markRemaining=false; page=0; refresh();});
        const left = button('What’s left?', () => {markRemaining=true; refresh();});
        const output = button('Open completed grammar', () => onExport(exercise.export()), 'primary');
        hint.disabled = all.disabled = !remaining.length;
        output.disabled = !!remaining.length;
        find('actions').replaceChildren(hint, all, left, output);
        showRules();
    }
    function restart() {
        exercise = null;
        for (const key of ['graph','choices','actions','rules','pages','group']) find(key).replaceChildren();
        try {
            exercise = new PDAGrammarExercise(source, {acceptance:accept.value});
            selected = null; page = 0; markRemaining = false;
            refresh();
        } catch (error) { find('status').textContent = error.message; }
    }
    groups.onchange = () => {
        selected = groups.value === 'supplied' ? null : Number(groups.value);
        page = 0; markRemaining = false; refresh();
    };
    accept.onchange = restart;
    restart();
}
