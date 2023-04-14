# issue 948

## sql server

- sql

```sql
SELECT click_ratio, -1 * click_ratio, ABS(-1 * click_ratio), CAST(click_ratio AS INT) FROM RecManager3.dbo.op_content_article WHERE id LIKE '14%';
```

- 列名
  - click_ratio
  - 空
  - 空
  - 空

## mysql

```sql
mysql> SELECT fl, -1 * fl, ABS(-1 * fl), CAST(fl AS SIGNED) FROM t1;
+---------+---------------------+--------------------+--------------------+
| fl      | -1 * fl             | abs(-1 * fl)       | CAST(fl as SIGNED) |
+---------+---------------------+--------------------+--------------------+
| 123.021 | -123.02130126953125 | 123.02130126953125 |                123 |
|  1.0213 |  -1.021299958229065 |  1.021299958229065 |                  1 |
|    NULL |                NULL |               NULL |               NULL |
|       0 |                  -0 |                  0 |                  0 |
+---------+---------------------+--------------------+--------------------+
4 rows in set (0.00 sec)
```

## parser

- parse_sql
  - parse_sql_with_dialect (same as arrow-datafusion)

```rust
Statement(Query(
    Query { with: None, body: Select(Select { distinct: false, top: None, projection: [
        UnnamedExpr(Identifier(Ident { value: "a", quote_style: None })), 
        UnnamedExpr(Function(Function { name: ObjectName([Ident { value: "abs", quote_style: None }]), args: [Unnamed(Expr(Identifier(Ident { value: "a", quote_style:None })))], over: None, distinct: false, special: false }))
    ], into: None, from: [TableWithJoins { relation: Table { na
me: ObjectName([Ident { value: "df", quote_style: None }]), alias: None, args: N
one, with_hints: [] }, joins: [] }], lateral_views: [], selection: None, group_b
y: [], cluster_by: [], distribute_by: [], sort_by: [], having: None, qualify: No
ne }), order_by: [], limit: None, offset: None, fetch: None, lock: None }))

Statement(Query(
    Query { with: None, body: Select(Select { distinct: false, top: None, projection: [
        UnnamedExpr(Identifier(Ident { value: "a", quote_style: None })), 
        UnnamedExpr(Cast { expr: Identifier(Ident { value: "a", quote_style: None }), data_type: Date })
    ], into: None, from: [TableWithJoins { relation: Table { na
me: ObjectName([Ident { value: "df", quote_style: None }]), alias: None, args: N
one, with_hints: [] }, joins: [] }], lateral_views: [], selection: None, group_b
y: [], cluster_by: [], distribute_by: [], sort_by: [], having: None, qualify: No
ne }), order_by: [], limit: None, offset: None, fetch: None, lock: None })) 
```

## to_plan

- logical_relational_algebra
  - _logical_relational_algebra
    - statement_to_plan (arrow-datafusion)

## test

    sql::functions::csv_query_cast_literal
    sql::joins::in_subquery_to_join_with_correlated_outer_filter
    sql::joins::in_subquery_to_join_with_outer_filter
    sql::joins::join_with_type_coercion_for_equi_expr
    sql::joins::not_in_subquery_to_join_with_correlated_outer_filter
    sql::joins::reduce_cross_join_with_cast_expr_join_key
    sql::joins::reduce_cross_join_with_expr_join_key_all
    sql::joins::reduce_cross_join_with_wildcard_and_expr
    sql::joins::subquery_to_join_with_both_side_expr
    sql::joins::subquery_to_join_with_muti_filter
    sql::joins::three_projection_exprs_subquery_to_join
    sql::joins::two_in_subquery_to_join_with_outer_filter
    sql::joins::type_coercion_join_with_filter_and_equi_expr
    sql::select::query_cte_with_alias
    sql::select::select_values_list
    sql::set_variable::set_time_zone_bad_time_zone_format
    sql::set_variable::set_time_zone_good_time_zone_format
    sql::timestamp::cast_timestamp_before_1970
    sql::timestamp::cast_timestamp_to_timestamptz
    sql::timestamp::test_cast_to_time
    sql::timestamp::test_cast_to_time_without_time_zone
    sql::timestamp::test_ts_dt_binary_ops
    sql::timestamp::to_timestamp_i32
    sql::timestamp::to_timestamp_micros_i32
    sql::timestamp::to_timestamp_millis_i32
    sql::timestamp::to_timestamp_seconds_i32

## issue

- https://github.com/apache/arrow-datafusion/issues/5174