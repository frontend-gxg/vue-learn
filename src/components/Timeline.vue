<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import MetaVue from './Meta.vue';

export default defineComponent({
    components: {
        MetaVue,
    },

    props: {
        listData: {
            type: Array as PropType<Record<string, string>[]>,
            required: true
        }
    },

    setup() {
        const pagination = {
            onChange: (page: number) => {
                console.log(page);
            },
            pageSize: 10,
        };
        return {
            pagination,
        };
    },
});
</script>

<template>
    <a-list item-layout="vertical" size="default" :style="{fontSize: '18px'}" :pagination="pagination" :data-source="listData">
        <template #renderItem="{ item }">
            <a-list-item>
                <MetaVue :date="item.date" :title="item.title" :description="item.description" :href="item.href" />
            </a-list-item>
        </template>
    </a-list>
</template>
