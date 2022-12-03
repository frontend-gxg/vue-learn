<script lang="ts">
import { defineComponent } from 'vue';
import db from '@/db/db';
import DBDefaultVue from '@/components/DBDefault.vue';
import DBTimelineVue from '@/components/DBTimeline.vue';
import DBBlogVue from '@/components/DBBlog.vue';

interface ResDefault {
  columns: string[],
  values: any[][]
};

interface ResBlog {
  title: string,
  md: string,
};

const isTimeline = (res: ResDefault) => {
  return res.columns.length === 3 && res.columns[0] === "date" && res.columns[1] === "title" && res.columns[2] === "description";
};

const isBlog = (res: ResDefault) => {
  return res.columns.length === 2 && res.columns[0] === "title" && res.columns[1] === "md" && res.values.length == 1;
};

export default defineComponent({
    components: { 
      DBDefaultVue, 
      DBTimelineVue,
      DBBlogVue 
    },

    data() {
        return {
            name: "",
            sql: "",

            type: "",

            resDefault: {
              columns: [], 
              values: []
            } as ResDefault,

            resBlog: {
              title: "",
              md: ""
            } as ResBlog,
        };
    },

    methods: {
        handleSubmit(e: any) {
            e.preventDefault();
            this.sql = this.name.trim();

            if (this.sql === "show tables;") {
              this.type = "table";
              this.resDefault = {
                columns: ["table"],
                values: [
                  ["timeline"], 
                  ["tags"]
                ]
              };
            } else if (this.sql === "show function status;") {
              this.type = "table";
              this.resDefault = {
                columns: ["name", "type"],
                values: [
                  ["renderTimeline", "function"],
                  ["renderBlog", "function"]
                ]
              }
            } else if (this.sql.startsWith("show create function")) {
              this.type = "table";
              const tokens = this.sql.split(" ");
              const functionName = tokens[tokens.length - 1].replace(";", "");
              if (functionName === "renderTimeline") {
                this.resDefault = {
                  columns: ["function", "table", "create function"],
                  values: [
                    ["renderTimeline", "timeline", "List[Tuple[date, title, description]]"]
                  ]
                }
              } else if (functionName === "renderBlog") {
                this.resDefault = {
                  columns: ["function", "table", "create function"],
                  values: [
                    ["renderBlog", "timeline", "Tuple[title, md]"]
                  ]
                }
              } else {
                throw new Error(`unknown function ${functionName}`);
              }
            } else if (this.sql.includes("renderTimeline")) {
              const sql = this.sql.replace("renderTimeline", "").replace("(", "").replace(")", "");
              const result = db.exec(sql)[0] as ResDefault;
              if (isTimeline(result)) {
                this.type = "timeline";
                this.resDefault = result;
              } else {
                throw new Error(`invalid argument ${result} for function renderTimeline`);
              }
            } else if (this.sql.includes("renderBlog")) {
              const sql = this.sql.replace("renderBlog", "").replace("(", "").replace(")", "");
              const result = db.exec(sql)[0] as ResDefault;
              if (isBlog(result)) {
                this.type = "blog";
                this.resBlog = {
                  title: `${result.values[0][0]}`,
                  md: `${result.values[0][1]}`
                };
              } else {
                throw new Error(`invalid argument ${result} for function renderBlog`);
              }
            } else {
              try {
                const result = db.exec(this.sql)[0] as ResDefault;
                this.type = "default";
                this.resDefault = result;
              } catch (err) {
                if (err instanceof Error) {
                  console.log(err.message);
                }
              }
            }

            this.name = "";
        }
    }
});
</script>

<template>
  <div class="app">
    <div id="terminal">
      <div id="terminal-body">
        <div id="commandline">
          SQL> <textarea v-model="name" placeholder="" @keyup.enter="handleSubmit" class="input"></textarea>
          <button type="submit" @click="handleSubmit" class="button">Save name</button>
        </div>
      </div>
    </div>
    <template v-if="type.length > 0">
      <template v-if="type === 'table'">
        <DBDefaultVue :result="resDefault"/>
      </template>
      <template v-if="type === 'timeline'">
        <DBTimelineVue :result="resDefault"/>
      </template>
      <template v-if="type === 'blog'">
        <DBBlogVue :result="resBlog" />
      </template>
      <template v-if="type === 'default'">
        <DBDefaultVue :result="resDefault"/>
      </template>
    </template>
  </div>
</template>
  
<style scoped>
#terminal {
	box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.25);
	border-radius: 3px;
  margin-bottom: 60px;
}

#terminal-body {
	padding: 5px;
	
	flex-shrink: auto;
	
	width: inherit;
	max-width: inherit;
	height: 100px;
	max-height: 100px;
	
	font-family: Inconsolata, monospace;
	font-size: 14px;
	color: #dddddd;
	
	background-color: #111111;
	
	border-radius: 5px 5px 5px 5px;
}

#commandline {
	flex-direction: row;
	color: inherit;
  display: flex;
  width: 105%;
  padding-top: 10px;
  padding-left: 20px;
}

.input {
	display: inline-block;
	flex-grow: 1;
	
	border: none;
	outline: none;
	
	font-family: inherit;
	font-size: inherit;
	color: inherit;
	background: inherit;

  margin-left: 10px;
  margin-top: 0;
  padding: 0;

  width: 100%;
	height: 100px;
	max-height: 100px;

  resize: none;
}

.button {
    visibility: hidden;
}
</style>
