<script setup>
import { onMounted } from "vue";

const props = defineProps({
  dataAdSlot: String,
  dataAdFormat: String,
  dataFullWidthResponsive: Boolean,
  pId: {
    type: String,
    required: false,
  },
});

onMounted(() => {
  try {
    if (window.adsbygoogle) {
      window.adsbygoogle.push({});
    } else {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    }
  } catch (error) {
    console.error(error.message);
  }
});
</script>

<template>
  <div class="w-full h-full relative">
    <ins
      ref="ads"
      class="adsbygoogle w-full max-w-full block min-h-full"
      style="display: block"
      :data-ad-client="`ca-pub-${pId}`"
      :data-ad-slot="dataAdSlot"
      :data-ad-format="dataAdFormat"
      :data-full-width-responsive="dataFullWidthResponsive.toString()" />
  </div>
</template>

<style>
ins.adsbygoogle[data-ad-status="unfilled"] {
    display: none !important;
}  
</style>
