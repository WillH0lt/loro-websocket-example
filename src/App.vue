<template>
  <Shape
    v-for="shape in Object.values(shapes)"
    :key="shape.id"
    :color="shape.color"
    :width="shape.width"
    :height="shape.height"
    v-model:left="shape.left"
    v-model:top="shape.top"
    @drag="handleDrag(shape.id)"
  ></Shape>

  <div class="absolute top-0 right-0 m-2 flex gap-4">
    <button
      class="bg-gray-600 p-2 text-white cursor-pointer"
      :class="{
        'bg-green-700!': isOnline,
      }"
      @click="isOnline = !isOnline"
    >
      {{ isOnline ? "Online" : "Offline" }}
    </button>

    <button
      class="bg-gray-600 p-2 text-white cursor-pointer"
      @click="clearShapes"
    >
      Clear
    </button>

    <button class="bg-gray-600 p-2 text-white cursor-pointer" @click="addShape">
      Add Shape
    </button>
  </div>

  <div class="absolute bottom-0 left-0 m-2 text-white">
    people here: {{ peopleHere }}
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import {
  type LoroEventBatch,
  type MapDiff,
  UndoManager,
  EphemeralStore,
} from "loro-crdt";
import { LoroWebsocketClient } from "loro-websocket";
import { LoroAdaptor, LoroEphemeralAdaptor } from "loro-adaptors";
import { useMagicKeys, whenever } from "@vueuse/core";

import Shape from "./components/Shape.vue";

interface Shape {
  id: string;
  color: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

const isOnline = ref(true);
const peopleHere = ref(0);
const shapes = ref<Record<string, Shape>>({});

const client = new LoroWebsocketClient({ url: "ws://localhost:8787" });
const adaptor = new LoroAdaptor();
const doc = adaptor.getDoc();
const shapesMap = doc.getMap("shapes");

doc.subscribe(handleDocUpdate);

const ephemeralStore = new EphemeralStore(30_000);
const ephemeralAdaptor = new LoroEphemeralAdaptor(ephemeralStore);
const userId = crypto.randomUUID();
ephemeralStore.set(userId, true);

ephemeralStore.subscribe((event) => {
  console.log("Ephemeral store event:", event);
});

onMounted(async () => {
  await client.waitConnected();
  await client.join({ roomId: "home", crdtAdaptor: adaptor });

  await client.join({
    roomId: "home",
    crdtAdaptor: ephemeralAdaptor,
  });
});

function handleDocUpdate(event: LoroEventBatch): void {
  for (const e of event.events) {
    const diff = e.diff as MapDiff;
    for (const id in diff.updated) {
      const shape = diff.updated[id];
      if (shape === undefined) {
        delete shapes.value[id];
        continue;
      }

      shapes.value[id] = shape as unknown as Shape;
    }
  }
}

watch(
  isOnline,
  (newVal) => {
    if (newVal) {
      client.connect();
    } else {
      client.close();
    }
  },
  { immediate: true }
);

const undoManager = new UndoManager(doc, {
  excludeOriginPrefixes: ["sys:"],
});

const keys = useMagicKeys();

whenever(keys.ctrl_z!, () => {
  undoManager.undo();
});
whenever(keys.ctrl_y!, () => {
  undoManager.redo();
});
whenever(keys.ctrl_shift_z!, () => {
  undoManager.redo();
});

function clearShapes() {
  shapesMap.clear();
  doc.commit();
}

function addShape() {
  const width = 100 + Math.random() * 100;
  const height = 100 + Math.random() * 100;

  const shape = {
    id: crypto.randomUUID(),
    color: `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`,
    left: Math.random() * (window.innerWidth - width),
    top: Math.random() * (window.innerHeight - height),
    width: width,
    height: height,
  };

  shapesMap.set(shape.id, shape);
  doc.commit();
}

function handleDrag(id: string) {
  shapesMap.set(id, shapes.value[id]);
  doc.commit();
}
</script>
