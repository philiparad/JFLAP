"""Run with Python + Playwright installed; no application build dependencies.

python tests/transition-keyboard.py
"""
import functools
import json
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(base + '/tests/')
        expect(page.locator('#summary')).to_contain_text('failed', timeout=60000)
        summary = page.locator('#summary').inner_text()
        assert '0 failed' in summary, summary
        print(summary)
        page.goto(base)

        def setup(kind='fa', tapes=1, loop=False, empty=False):
            model = {'type': kind, 'name': 'Keyboard fixture', 'tapes': tapes, 'notes': [],
                     'states': [{'id': 0, 'name': 'q0', 'x': 180, 'y': 180, 'initial': True},
                                {'id': 1, 'name': 'q1', 'x': 420, 'y': 180, 'final': True}],
                     'transitions': [] if empty else [{'id': 0, 'from': 0, 'to': 0 if loop else 1,
                         'read': ['a'] * tapes if kind.startswith('turing') else 'a',
                         'write': ['a'] * tapes, 'move': ['R'] * tapes, 'pop': 'Z', 'push': 'AZ', 'output': 'x'}]}
            page.evaluate('(m)=>localStorage.setItem("jflap.documents",JSON.stringify([m]))', model)
            page.reload()
            expect(page.locator('#canvas')).to_be_visible()

        def transitions():
            return page.evaluate('JSON.parse(localStorage.getItem("jflap.documents"))[0].transitions')

        def edit():
            page.locator('[data-transition="0"] text').dblclick()
            expect(page.locator('#dialog')).to_be_visible()

        # Edit one transition, create two more in sequence, then cancel an empty draft.
        for kind, tapes, loop in [('fa', 1, False), ('fa', 1, True), ('pda', 1, False),
                                  ('mealy', 1, False), ('moore', 1, False), ('turing', 1, False), ('turing', 3, False)]:
            setup(kind, tapes, loop)
            edit()
            field = 'read0' if kind.startswith('turing') else 'read'
            control = page.locator(f'#dialog [name="{field}"]')
            control.fill('b')
            control.press('Shift+Enter')
            expect(control).to_have_value('')
            assert len(transitions()) == 1
            control.fill('c')
            if kind == 'pda':
                page.locator('[name="pop"]').fill('A')
                page.locator('[name="push"]').fill('')
            if kind == 'mealy':
                page.locator('[name="output"]').fill('y')
            control.press('Shift+Enter')
            expect(control).to_have_value('')
            assert len(transitions()) == 2
            control.fill('d')
            control.press('Shift+Enter')
            expect(control).to_have_value('')
            control.press('Escape')
            expect(page.locator('#dialog')).not_to_be_visible()
            saved = transitions()
            assert len(saved) == 3
            assert [t['read'][0] if isinstance(t['read'], list) else t['read'] for t in saved] == ['b', 'c', 'd']
            assert all(t['from'] == 0 and t['to'] == (0 if loop else 1) for t in saved)
            assert len({t['id'] for t in saved}) == 3
            if kind == 'pda':
                assert saved[1]['pop'] == 'A' and saved[1]['push'] == ''
            if kind == 'mealy':
                assert saved[1]['output'] == 'y'
            page.get_by_role('button', name='↶', exact=True).click()
            assert len(transitions()) == 2
            page.get_by_role('button', name='↷', exact=True).click()
            assert transitions() == saved
            print(f'PASS continuation, cancellation, endpoints, undo/redo: {kind}/{tapes}, loop={loop}')

        # New transition by dragging; ordinary Enter finishes, without another draft.
        setup(empty=True)
        page.get_by_role('button', name='↗ Transition', exact=True).click()
        page.locator('[data-state="0"] circle').first.drag_to(page.locator('[data-state="1"] circle').last)
        control = page.locator('#dialog [name="read"]')
        control.fill('x')
        control.press('Shift+Enter')
        expect(control).to_have_value('')
        control.fill('y')
        control.press('Enter')
        expect(page.locator('#dialog')).not_to_be_visible()
        page.wait_for_function('JSON.parse(localStorage.getItem("jflap.documents"))[0].transitions.length === 2')
        assert [t['read'] for t in transitions()] == ['x', 'y']
        print('PASS new transition continuation and ordinary Enter')

        # Invalid TM input must neither save nor start a new draft.
        setup('turing')
        edit()
        page.locator('[name="write0"]').fill('ab')
        page.locator('[name="write0"]').press('Shift+Enter')
        expect(page.locator('#dialog-title')).to_have_text('Unable to complete operation')
        assert len(transitions()) == 1 and transitions()[0]['write'] == ['a']
        page.get_by_role('button', name='Close', exact=True).click()
        # Listener must have been removed from the shared dialog.
        page.locator('[data-state="0"] circle').first.dblclick()
        page.locator('[name="name"]').fill('renamed')
        page.locator('[name="name"]').press('Shift+Enter')
        expect(page.locator('#dialog')).not_to_be_visible()
        assert len(transitions()) == 1
        print('PASS validation and dialog-handler cleanup')
        assert not errors, errors
        print('All keyboard interaction checks passed; no browser errors.')
        browser.close()
finally:
    server.shutdown()
    server.server_close()
