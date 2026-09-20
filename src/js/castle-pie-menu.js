/* Shared by Map and detached 2.5D canvases. No pointer lock or focus stealing. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.castlePieMenu = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  function direction(dx, dy) {
    if (Math.hypot(dx, dy) < 24) return 'deselect';
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'replace' : 'groups') : (dy > 0 ? 'cut' : 'merge');
  }
  const bound = new WeakSet();
  function bind(canvas, run) {
    if (bound.has(canvas)) return;
    bound.add(canvas);
    const doc = canvas.ownerDocument, win = doc.defaultView;
    let menu = null, gesture = null;
    const labels = {merge:'Merge', groups:'Groups', replace:'Replace', cut:'Cut & copy', deselect:'Deselect'};
    function close() {
      const pointer = gesture?.id;
      gesture = null; menu?.remove(); menu = null;
      if (pointer != null && canvas.hasPointerCapture?.(pointer)) canvas.releasePointerCapture(pointer);
    }
    function open(x, y, id) {
      close();
      menu = doc.createElement('div');
      menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Castle actions');
      menu.style.cssText = 'position:fixed;z-index:10000;width:224px;height:224px;border-radius:50%;background:#202c30;box-shadow:0 3px 18px #0009;border:1px solid #b88645;color:#e8eded;font:600 13px Arial,sans-serif;';
      const cx = Math.max(114, Math.min(x, win.innerWidth-114)), cy = Math.max(114, Math.min(y, win.innerHeight-114));
      menu.style.left = (cx-112)+'px'; menu.style.top = (cy-112)+'px';
      const positions = {merge:[70,20], groups:[3,92], replace:[153,92], cut:[70,165], deselect:[80,92]};
      for (const [action,label] of Object.entries(labels)) {
        const button = doc.createElement('button'); button.type = 'button'; button.textContent = label;
        button.dataset.action = action; button.setAttribute('role', 'menuitem');
        button.style.cssText = 'position:absolute;width:84px;height:40px;border:0;border-radius:20px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
        if (action === 'groups' || action === 'replace' || action === 'deselect') button.style.width = '68px';
        button.style.left = positions[action][0]+'px'; button.style.top = positions[action][1]+'px';
        button.addEventListener('click', () => { close(); run(action); }); menu.appendChild(button);
      }
      doc.body.appendChild(menu);
      // Gesture coordinates remain at the click, even when the visual menu is clamped at an edge.
      gesture = id == null ? null : {x, y, id, action:'deselect'};
      if (id == null) menu.querySelector('button').focus();
      else highlight('deselect');
    }
    function highlight(action) {
      const sectors = ['replace', 'cut', 'groups', 'merge'];
      menu.style.background = 'conic-gradient(from 45deg,' + sectors.map((name, i) => '#536367 '+(i*90)+'deg '+(i*90+1)+'deg,'+(name === action ? '#70532e' : '#202c30')+' '+(i*90+1)+'deg '+((i+1)*90)+'deg').join(',') + ')';
      for (const button of menu.children) button.style.background = button.dataset.action === 'deselect' ? (action === 'deselect' ? '#936c35' : '#202c30') : 'transparent';
    }
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 2) return;
      event.preventDefault(); event.stopImmediatePropagation();
      canvas.focus?.({preventScroll:true});
      open(event.clientX, event.clientY, event.pointerId);
      try { canvas.setPointerCapture(event.pointerId); } catch { /* synthetic pointer */ }
    }, true);
    canvas.addEventListener('pointermove', event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      event.preventDefault(); event.stopImmediatePropagation();
      gesture.action = direction(event.clientX-gesture.x, event.clientY-gesture.y); highlight(gesture.action);
    }, true);
    canvas.addEventListener('pointerup', event => {
      if (!gesture || gesture.id !== event.pointerId) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const action = direction(event.clientX-gesture.x, event.clientY-gesture.y);
      close(); run(action);
    }, true);
    canvas.addEventListener('contextmenu', event => { event.preventDefault(); });
    canvas.addEventListener('keydown', event => {
      if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
        event.preventDefault(); const rect = canvas.getBoundingClientRect(); open(rect.left+rect.width/2, rect.top+rect.height/2);
      }
    });
    canvas.addEventListener('pointercancel', close);
    canvas.addEventListener('lostpointercapture', close);
    win.addEventListener('blur', close);
    doc.addEventListener('keydown', event => { if (event.key === 'Escape' && menu) { event.preventDefault(); close(); } });
    doc.addEventListener('pointerdown', event => { if (menu && !gesture && !menu.contains(event.target)) close(); }, true);
  }
  return {direction, bind};
});
