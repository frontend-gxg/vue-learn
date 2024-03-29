import initSqlJs from 'sql.js/dist/sql-wasm.js'
import blog0 from '@/asserts/blog/blog0.md?raw'
import desc0 from '@/asserts/blog/desc0.txt?raw'
import blog1 from '@/asserts/blog/blog1.md?raw'
import desc1 from '@/asserts/blog/desc1.txt?raw'
import blog2 from '@/asserts/blog/blog2.md?raw'
import desc2 from '@/asserts/blog/desc2.txt?raw'
import blog3 from '@/asserts/blog/blog3.md?raw'
import desc3 from '@/asserts/blog/desc3.txt?raw'
import blog4 from '@/asserts/blog/blog4.md?raw'
import desc4 from '@/asserts/blog/desc4.txt?raw'
import blog5 from '@/asserts/blog/blog5.md?raw'
import desc5 from '@/asserts/blog/desc5.txt?raw'
import blog6 from '@/asserts/blog/blog6.md?raw'
import desc6 from '@/asserts/blog/desc6.txt?raw'
import blog7 from '@/asserts/blog/blog7.md?raw'
import desc7 from '@/asserts/blog/desc7.txt?raw'

const blogs = [
    { 
        date: "2022-11-18", 
        title: "HELLO WORLD",
        description: desc0,
        md: blog0, 
        tags: ["测试"],  
    },
    { 
        date: "2022-11-18", 
        title: "LATEX", 
        description: desc1,
        md: blog1, 
        tags: ["测试"],
    },
    {
        date: "2022-12-03",
        title: "matrixorigin的开发记录",
        description: desc2,
        md: blog2,
        tags: ["数据库"],
    },
    {
        date: "2022-12-03",
        title: "云南2022-08-31",
        description: desc3,
        md: blog3,
        tags: ["旅游"],
    },
    {
        date: "2023-02-10",
        title: "arana的开发记录",
        description: desc4,
        md: blog4,
        tags: ["数据库"],
    },
    {
        date: "2023-04-14",
        title: "dask-sql的开发记录",
        description: desc5,
        md: blog5,
        tags: ["数据库", "dataframe"],
    },
    {
        date: "2023-05-24",
        title: "databend的开发记录",
        description: desc6,
        md: blog6,
        tags: ["数据库"],
    },
    {
        date: "2023-05-24",
        title: "openraft的开发记录",
        description: desc7,
        md: blog7,
        tags: ["raft"],
    },
];

const config = {
    locateFile: (filename: string) => `https://sql.js.org/dist/${filename}`
};

const SQL = await initSqlJs(config);

const db = new SQL.Database();

db.run(`
    CREATE TABLE timeline (id INT, date TEXT, title TEXT, description TEXT, md TEXT);
`);

db.run(`
    CREATE TABLE tag (id INT, tag TEXT);
`);

for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    db.run(`INSERT INTO timeline VALUES (?, ?, ?, ?, ?);`, [i, blog.date, blog.title, blog.description, blog.md]);
    for (let tag of blog.tags) {
        db.run(`INSERT INTO tag VALUES (${i}, '${tag}');`);
    }
}

export default db;
