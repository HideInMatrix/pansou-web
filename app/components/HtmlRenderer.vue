<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  html?: string;
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
});

// 解析HTML字符串为DOM树
const parseHtml = (htmlString: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.childNodes;
  } catch (error) {
    console.error('Failed to parse HTML:', error);
    return [];
  }
};

// 将Node转换为可序列化的对象
const nodeToObject = (node: Node): any => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node as Text).textContent?.trim();
    return text ? { type: 'text', content: text } : null;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const attributes: Record<string, string> = {};

    // 获取所有属性
    Array.from(element.attributes).forEach((attr) => {
      attributes[attr.name] = attr.value;
    });

    // 递归处理子节点
    const children: any[] = [];
    element.childNodes.forEach((child) => {
      const converted = nodeToObject(child);
      if (converted) {
        children.push(converted);
      }
    });

    return {
      type: 'element',
      tagName,
      attributes,
      children,
    };
  }

  return null;
};

// 计算解析后的HTML结构
const parsedNodes = computed(() => {
  if (!props.html) return [];
  const nodes = parseHtml(props.html);
  const result: any[] = [];
  nodes.forEach((node) => {
    const converted = nodeToObject(node);
    if (converted) {
      result.push(converted);
    }
  });
  return result;
});

// 获取样式类名
const getElementClass = (tagName: string): string => {
  const classMap: Record<string, string> = {
    h1: 'text-3xl font-bold text-foreground mt-8 mb-4',
    h2: 'text-2xl font-bold text-foreground mt-7 mb-3',
    h3: 'text-xl font-semibold text-foreground mt-6 mb-3',
    h4: 'text-lg font-semibold text-foreground mt-5 mb-2',
    h5: 'font-semibold text-foreground mt-4 mb-2',
    h6: 'font-semibold text-foreground mt-3 mb-2',
    p: 'text-base text-muted-foreground leading-7 mb-4',
    a: 'text-blue-600 hover:text-blue-700 hover:underline transition-colors',
    strong: 'font-semibold text-foreground',
    em: 'italic text-muted-foreground',
    u: 'underline',
    code: 'bg-muted text-muted-foreground px-2 py-1 rounded text-sm font-mono',
    pre: 'bg-muted border border-border p-4 rounded overflow-x-auto my-4',
    blockquote: 'border-l-4 border-border pl-4 py-2 my-4 text-muted-foreground italic',
    ul: 'list-disc list-inside ml-4 space-y-2 mb-4',
    ol: 'list-decimal list-inside ml-4 space-y-2 mb-4',
    li: 'text-muted-foreground',
    img: 'max-w-full h-auto rounded my-4',
    br: '',
    hr: 'my-6 border-t border-border',
    table: 'w-full border-collapse my-4',
    thead: '',
    tbody: '',
    tr: '',
    th: 'bg-muted p-2 border border-border text-foreground font-semibold',
    td: 'p-2 border border-border text-muted-foreground',
  };

  return classMap[tagName] || '';
};

// 处理特殊属性
const getSafeAttributes = (attributes: Record<string, string>, tagName: string) => {
  const safe: Record<string, string> = {};
  const allowedAttrs: Record<string, string[]> = {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    table: [],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  };

  const allowed = allowedAttrs[tagName] || [];
  allowed.forEach((attr) => {
    if (attr in attributes && attributes[attr]) {
      safe[attr] = attributes[attr];
    }
  });

  // 处理链接安全性
  if (tagName === 'a' && safe.href) {
    safe.target = '_blank';
    safe.rel = 'noopener noreferrer';
  }

  return safe;
};
</script>

<template>
  <div class="html-content">
    <template v-for="node in parsedNodes" :key="`${node.tagName}-${Math.random()}`">
      <!-- 文本节点 -->
      <template v-if="node.type === 'text'">
        {{ node.content }}
      </template>

      <!-- 元素节点 -->
      <template v-else-if="node.type === 'element'">
        <!-- 段落 -->
        <p v-if="node.tagName === 'p'" :class="getElementClass(node.tagName)">
          <component
            v-for="(child, idx) in node.children"
            :is="child.type === 'text' ? 'span' : child.tagName"
            :key="idx"
            :class="child.type === 'text' ? '' : getElementClass(child.tagName)"
            v-bind="child.type === 'element' ? getSafeAttributes(child.attributes, child.tagName) : {}"
          >
            <template v-if="child.type === 'text'">
              {{ child.content }}
            </template>
            <template v-else>
              <component
                v-for="(subChild, subIdx) in child.children"
                :is="subChild.type === 'text' ? 'span' : subChild.tagName"
                :key="subIdx"
                :class="subChild.type === 'text' ? '' : getElementClass(subChild.tagName)"
                v-bind="subChild.type === 'element' ? getSafeAttributes(subChild.attributes, subChild.tagName) : {}"
              >
                <template v-if="subChild.type === 'text'">
                  {{ subChild.content }}
                </template>
              </component>
            </template>
          </component>
        </p>

        <!-- 标题 -->
        <component
          v-else-if="['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)"
          :is="node.tagName"
          :class="getElementClass(node.tagName)"
        >
          <template v-for="(child, idx) in node.children" :key="idx">
            <span v-if="child.type === 'text'">{{ child.content }}</span>
            <component
              v-else
              :is="child.tagName"
              :class="getElementClass(child.tagName)"
              v-bind="getSafeAttributes(child.attributes, child.tagName)"
            >
              <template v-for="(subChild, subIdx) in child.children" :key="subIdx">
                <span v-if="subChild.type === 'text'">{{ subChild.content }}</span>
              </template>
            </component>
          </template>
        </component>

        <!-- 图片 -->
        <img
          v-else-if="node.tagName === 'img'"
          v-bind="getSafeAttributes(node.attributes, 'img')"
          :class="getElementClass(node.tagName)"
        />

        <!-- 列表 -->
        <ul v-else-if="node.tagName === 'ul'" :class="getElementClass(node.tagName)">
          <li
            v-for="(child, idx) in node.children.filter((c: any) => c.tagName === 'li')"
            :key="idx"
            :class="getElementClass('li')"
          >
            <template v-for="(subChild, subIdx) in child.children" :key="subIdx">
              <span v-if="subChild.type === 'text'">{{ subChild.content }}</span>
              <component
                v-else
                :is="subChild.tagName"
                :class="getElementClass(subChild.tagName)"
                v-bind="getSafeAttributes(subChild.attributes, subChild.tagName)"
              >
                <template v-for="(item, itemIdx) in subChild.children" :key="itemIdx">
                  <span v-if="item.type === 'text'">{{ item.content }}</span>
                </template>
              </component>
            </template>
          </li>
        </ul>

        <!-- 有序列表 -->
        <ol v-else-if="node.tagName === 'ol'" :class="getElementClass(node.tagName)">
          <li
            v-for="(child, idx) in node.children.filter((c: any) => c.tagName === 'li')"
            :key="idx"
            :class="getElementClass('li')"
          >
            <template v-for="(subChild, subIdx) in child.children" :key="subIdx">
              <span v-if="subChild.type === 'text'">{{ subChild.content }}</span>
              <component
                v-else
                :is="subChild.tagName"
                :class="getElementClass(subChild.tagName)"
                v-bind="getSafeAttributes(subChild.attributes, subChild.tagName)"
              >
                <template v-for="(item, itemIdx) in subChild.children" :key="itemIdx">
                  <span v-if="item.type === 'text'">{{ item.content }}</span>
                </template>
              </component>
            </template>
          </li>
        </ol>

        <!-- 代码块 -->
        <pre v-else-if="node.tagName === 'pre'" :class="getElementClass(node.tagName)">
          <code v-if="node.children[0]?.tagName === 'code'">
            <template v-for="(child, idx) in node.children[0].children" :key="idx">
              <template v-if="child.type === 'text'">{{ child.content }}</template>
            </template>
          </code>
          <template v-else v-for="(child, idx) in node.children" :key="idx">
            <template v-if="child.type === 'text'">{{ child.content }}</template>
          </template>
        </pre>

        <!-- 引用块 -->
        <blockquote v-else-if="node.tagName === 'blockquote'" :class="getElementClass(node.tagName)">
          <template v-for="(child, idx) in node.children" :key="idx">
            <span v-if="child.type === 'text'">{{ child.content }}</span>
            <component
              v-else
              :is="child.tagName"
              :class="getElementClass(child.tagName)"
              v-bind="getSafeAttributes(child.attributes, child.tagName)"
            >
              <template v-for="(subChild, subIdx) in child.children" :key="subIdx">
                <span v-if="subChild.type === 'text'">{{ subChild.content }}</span>
              </template>
            </component>
          </template>
        </blockquote>

        <!-- 表格 -->
        <table v-else-if="node.tagName === 'table'" :class="getElementClass(node.tagName)">
          <thead v-if="node.children.some((c: any) => c.tagName === 'thead')">
            <tr
              v-for="(row, idx) in (node.children.find((c: any) => c.tagName === 'thead')?.children || []).filter((c: any) => c.tagName === 'tr')"
              :key="idx"
            >
              <th
                v-for="(cell, cellIdx) in row.children.filter((c: any) => c.tagName === 'th')"
                :key="cellIdx"
                :class="getElementClass('th')"
                :colspan="cell.attributes.colspan"
                :rowspan="cell.attributes.rowspan"
              >
                <template v-for="(child, childIdx) in cell.children" :key="childIdx">
                  <span v-if="child.type === 'text'">{{ child.content }}</span>
                </template>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in node.children.filter((c: any) => c.tagName === 'tr' || c.tagName === 'tbody').flatMap((c: any) => c.tagName === 'tbody' ? c.children : [c])"
              :key="idx"
            >
              <td
                v-for="(cell, cellIdx) in row.children.filter((c: any) => c.tagName === 'td')"
                :key="cellIdx"
                :class="getElementClass('td')"
                :colspan="cell.attributes.colspan"
                :rowspan="cell.attributes.rowspan"
              >
                <template v-for="(child, childIdx) in cell.children" :key="childIdx">
                  <span v-if="child.type === 'text'">{{ child.content }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 水平线 -->
        <hr v-else-if="node.tagName === 'hr'" :class="getElementClass(node.tagName)" />

        <!-- 换行 -->
        <br v-else-if="node.tagName === 'br'" />

        <!-- 其他元素 -->
        <div v-else>
          <template v-for="(child, idx) in node.children" :key="idx">
            <span v-if="child.type === 'text'">{{ child.content }}</span>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>
