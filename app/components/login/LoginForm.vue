<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { ref } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string | null>(null);

async function onSubmit(e: Event) {
  e.preventDefault();
  loading.value = true;
  error.value = null;
  try {
    const resp = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });
    if (resp.code === 200) {
      await navigateTo("/console", {
        external: true,
      });
    }
  } catch (err: any) {
    // handle error message from server
    error.value = err?.data?.message || err?.message || "登录失败";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form
    :class="cn('flex flex-col gap-6', props.class)"
    @submit.prevent="onSubmit">
    <FieldGroup>
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">登录你的账户</h1>
        <p class="text-muted-foreground text-sm text-balance">
          输入你的邮箱进行登陆
        </p>
      </div>
      <Field>
        <FieldLabel for="email"> 邮箱 </FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          v-model="email"
          required />
      </Field>
      <Field>
        <div class="flex items-center">
          <FieldLabel for="password"> 密码 </FieldLabel>
          <a
            href="#"
            class="ml-auto text-sm underline-offset-4 hover:underline">
            忘记密码?
          </a>
        </div>
        <Input id="password" type="password" v-model="password" required />
      </Field>
      <Field>
        <Button type="submit" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </Button>
      </Field>
      <div v-if="error" class="text-sm text-destructive">{{ error }}</div>
    </FieldGroup>
  </form>
</template>
