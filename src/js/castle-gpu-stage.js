"use strict";
// The UI submits scene changes; the worker draws directly into its own canvas.
window.castleGpuStage = {
  async create(onFrame) {
    const worker = new Worker(
      new URL(
        "castle-gpu-worker.js",
        document.currentScript?.src ||
          new URL("js/castle-gpu-stage.js", location.href),
      ),
    );
    const canvas = document.createElement("canvas");
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    let fireMask = null, sceneVersion = 0;
    let latest,
      scene,
      terrainSent,
      busy = false,
      disposed = false,
      failed = null,
      serial = 0;
    const sentImages = new Set(),
      commands = new Map();
    let nextCommand = 0,
      sentRevision;
    let resolveReady, rejectReady;
    const ready = new Promise((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    const describe = (command) => ({
      key: command.key,
      imageId: command.imageId,
      args: command.args,
      polygon: command.polygon,
      flammable: !!command.flammable,
      order: [
        command.order.gx + command.order.gy + ((command.order.tiles || 1) - 1),
        command.order.gx,
        command.order.layer ?? 2,
      ],
    });
    async function pump() {
      if (busy || !latest || disposed || failed) return;
      busy = true;
      const request = latest;
      latest = null;
      const assets = [];
      try {
        const terrain =
          request.scene.terrain !== terrainSent ? request.scene.terrain : null;
        const images = new Map();
        for (const command of [...(terrain || []), ...request.scene.buildings])
          if (command.image && !sentImages.has(command.imageId))
            images.set(command.imageId, command.image);
        for (const [id, image] of images)
          assets.push([id, await createImageBitmap(image)]);
        if (disposed) {
          for (const [, image] of assets) image.close();
          return;
        }
        for (const [id] of assets) sentImages.add(id);
        const reset =
          terrain !== null || sentRevision !== request.scene.revision;
        if (reset) commands.clear();
        const records = [];
        const visible = new Uint32Array(request.scene.buildings.length);
        request.scene.buildings.forEach((command, index) => {
          const order = command.order;
          const key =
            command.key +
            "|" +
            order.gx +
            "|" +
            order.gy +
            "|" +
            order.tiles +
            "|" +
            order.layer + "|" + !!command.flammable;
          let id = commands.get(key);
          if (id === undefined) {
            id = ++nextCommand;
            commands.set(key, id);
            records.push([id, describe(command)]);
          }
          visible[index] = id;
        });
        terrainSent = request.scene.terrain;
        sentRevision = request.scene.revision;
        worker.postMessage(
          {
            id: request.id,
            assets,
            terrain: terrain?.map(describe),
            records,
            visible,
            reset,
            revision: request.scene.revision,
            view: request.view,
            mask: request.scene.mask,
            sceneVersion: request.scene.version,
          },
          [visible.buffer, ...assets.map(([, image]) => image)],
        );
      } catch (error) {
        failed = error;
        busy = false;
        rejectReady(error);
        onFrame();
      }
    }
    worker.onmessage = ({ data }) => {
      if (disposed) { data.mask?.close(); return; }
      if (data.error) {
        failed = new Error(data.error);
        busy = false;
        rejectReady(failed);
        onFrame();
        return;
      }
      if (data.ready) {
        resolveReady();
        return;
      }
      if (data.mask) {
        if (data.sceneVersion === scene?.version) {
          fireMask?.close(); fireMask = data.mask; onFrame();
        } else data.mask.close();
      }
      for (const id of data.released || []) sentImages.delete(id);
      busy = false;
      pump();
    };
    worker.onerror = (event) => {
      failed = new Error(event.message);
      busy = false;
      rejectReady(failed);
      onFrame();
    };
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ init: true, canvas: offscreen }, [offscreen]);
    try {
      await ready;
    } catch (error) {
      disposed = true;
      worker.terminate();
      throw error;
    }
    return {
      get fireMask() { return fireMask; },
      setScene(terrain, buildings, revision, mask = null) {
        fireMask?.close(); fireMask = null;
        scene = { terrain, buildings, revision, mask, version: ++sceneVersion };
      },
      presentBehind(target) {
        if (canvas.parentNode !== target.parentNode) {
          target.before(canvas);
          target.style.position = "relative";
          target.parentNode.style.position = "relative";
        }
        canvas.hidden = false;
      },
      hide() {
        canvas.hidden = true;
      },
      render(...view) {
        if (failed) throw failed;
        // Completion repaints must not request another copy of the same frame.
        const key = view.join("/");
        if (
          !this.request ||
          this.request.scene !== scene ||
          this.request.key !== key
        ) {
          this.request = { scene, key };
          latest = { id: ++serial, scene, view };
          pump();
        }
      },
      destroy() {
        disposed = true;
        fireMask?.close(); fireMask = null;
        worker.terminate();
        canvas.remove();
        latest = null;
      },
    };
  },
};
