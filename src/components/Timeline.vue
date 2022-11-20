<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import MetaVue from '@/components/Meta.vue';

export default defineComponent({
    components: {
        MetaVue,
    },

    props: {
        listData: {
            type: Array as PropType<Record<string, string>[]>,
            required: true
        }
    }
});
</script>

<template>
    <a-list item-layout="vertical" size="default" :style="{fontSize: '18px'}" :data-source="listData">
        <template #renderItem="{ item }">
            <a-list-item>
                <MetaVue :date="item.date" :title="item.title" :description="item.description" />
            </a-list-item>
        </template>
    </a-list>
</template>
