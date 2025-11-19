<template>
  <div
    class="absolute"
    :style="{
      backgroundColor: color,
      width: width + 'px',
      height: height + 'px',
      left: left + 'px',
      top: top + 'px',
      cursor: isDragging ? 'grabbing' : 'grab',
    }"
    @mousedown="startDrag"
  ></div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  color: string;
  width: number;
  height: number;
}>();

const left = defineModel<number>("left");
const top = defineModel<number>("top");

const emit = defineEmits<{
  drag: [];
}>();

const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const startPosition = ref({ left: 0, top: 0 });

function startDrag(event: MouseEvent) {
  isDragging.value = true;
  dragStart.value = { x: event.clientX, y: event.clientY };
  startPosition.value = { left: left.value || 0, top: top.value || 0 };

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(event: MouseEvent) {
  if (!isDragging.value) return;

  const deltaX = event.clientX - dragStart.value.x;
  const deltaY = event.clientY - dragStart.value.y;

  left.value = startPosition.value.left + deltaX;
  top.value = startPosition.value.top + deltaY;

  emit("drag");
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}
</script>
