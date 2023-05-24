# 开发环境

- [如何设置 Databend 开发环境](https://zhuanlan.zhihu.com/p/547268364)

# 源码

## plan1

- `/root/.cargo/git/checkouts/sqlparser-rs-58502beef9f81223/269dffd/src/ast/query.rs`

```rust
pub struct OrderByExpr {
    pub expr: Expr,
    pub asc: Option<bool>,
    pub nulls_first: Option<bool>,
}
```

- `/gaoxinge/databend/common/planners/src/plan_expression.rs`

```rust
pub enum Expression {
    Sort {
        expr: Box<Expression>,
        asc: bool,
        nulls_first: bool,
        origin_expr: Box<Expression>,
    },
}
```

- `/gaoxinge/databend/common/planners/src/plan_sort.rs`

```rust
pub struct SortPlan {
    pub order_by: Vec<Expression>,
    pub input: Arc<PlanNode>,
    pub schema: DataSchemaRef,
}
```

- `/gaoxinge/databend/query/src/sql/sql_parser.rs`

```rust
- sql_parser::parse_sql: str -> OrderByExpr
```

- `/gaoxinge/databend/query/src/sql/statements/query/query_normalizer.rs`

```rust
- query_normalizer::normalize: OrderByExpr -> Expression::Sort
  - query_normalizer::transform: OrderByExpr -> Expression::Sort
- query_normalizer::transform: OrderByExpr -> Expression::Sort
  - query_normalizer::analyze_order_by: OrderByExpr -> Expression::Sort
- query_normalizer::analyze_order_by: OrderByExpr -> Expression::Sort
```

- `/gaoxinge/databend/query/src/sql/statements/statement_select.rs`

```rust
- statement_select::analyze: OrderByExpr -> Expression::Sort
  - query_normalizer::normalize: OrderByExpr -> Expression::Sort
  - statement_select::analyze_query: Expression::Sort -> Expression::Sort
- statement_select::analyze_query: Expression::Sort -> Expression::Sort
```

- `/gaoxinge/databend/query/src/sql/statements/analyzer_statement.rs`

```rust
- analyzer_statement::analyze: OrderByExpr -> Expression::Sort
  - statement_select::analyze: OrderByExpr -> Expression::Sort
```

- `/gaoxinge/databend/common/planners/src/plan_node_builder.rs`

```rust
- plan_node_builder::sort: Expression::Sort -> SortPlan
```

- `/gaoxinge/databend/query/src/sql/plan_parser.rs`

```rust
- plan_parser::parse: str -> SortPlain
  - sql_parser::parse_sql: str -> OrderByExpr
  - plan_parser::build_plan: OrderByExpr -> Expression::Sort
  - plan_parser::build_query_plan: Expression::Sort -> SortPlan
- plan_parser::build_plan: OrderByExpr -> Expression::Sort
  - statement::analyze: OrderByExpr -> Expression::Sort
- plan_parser::build_query_plan: Expression::Sort -> SortPlan
  - plan_parser::build_order_by_plan: Expression::Sort -> SortPlan
- plan_parser::build_order_by_plan: Expression::Sort -> SortPlan
  - plan_node_builder::sort: Expression::Sort -> SortPlan
```

## plan2

- mod2: `/gaoxinge/databend/common/ast/src/parser/mod.rs`

```rust
- mod2::tokenize_sql
- mod2::parse_sql
```

- mod3: `/gaoxinge/databend/query/src/sql/optimizer/mod.rs`

```rust
- mod3::optimize
  - mod3::optimize_query
- mod3::optimize_query
```

- mod: `/gaoxinge/databend/query/src/sql/planner/mod.rs`

```rust
- mod::new
- mod::plan_sql
  - mod2::tokenize_sql
  - mod2::parse_sql
  - mod3::optimize
```

## pipeline

- `/gaoxinge/databend/query/src/sql/exec/physical_plan_builder.rs`

```rust
- physical_plan_builder::new
- physical_plan_builder::build
```

- `/gaoxinge/databend/query/src/sql/exec/pipeline_builder.rs`

```rust
- pipeline_builder::new
- pipeline_builder::build_pipeline
- pipeline_builder::render_result_set
```

- `/gaoxinge/databend/query/src/pipelines/new/pipeline_builder.rs`

```rust
- pipeline_builder2::create
- pipeline_builder2::finalize
```

## select1

- `/gaoxinge/databend/query/src/interpreters/interpreter_select.rs`

```rust
- interpreter_select::try_create
- interpreter_select::execute
  if settings.get_enable_new_processor_framework()? != 0 {
    - interpreter_select::create_new_pipeline
  } else {
    // TODO: rewrite
  }
- interpreter_select::create_new_pipeline
  if ok {
    - pipeline_builder2::create
    - pipeline_builder2::finalize
  } else {
    // TODO:rewrite
  }
```

## select2

- `/gaoxinge/databend/query/src/interpreters/interpreter_select_v2.rs`

```rust
- interpreter_select_v2::try_create
- interpreter_select_v2::execute
  - physical_plan_builder::new
  - physical_plan_builder::build
  - pipeline_builder::new
  - pipeline_builder::build_pipeline
  - pipeline_builder::render_result_set
  - TODO: execute
- interpreter_select_v2::create_new_pipeline
  - physical_plan_builder::new
  - physical_plan_builder::build
  - pipeline_builder::new
  - pipeline_builder::build_pipeline
  - pipeline_builder::render_result_set
```

## factory1

- `/gaoxinge/databend/query/src/interpreters/interpreter_factory.rs`

```rust
- interpreter_factory::get
  - interpreter_select::try_create
```

## factory2

- `/gaoxinge/databend/query/src/interpreters/interpreter_factory_v2.rs`

```rust
- interpreter_factory_v2::get
  - interpreter_select_v2::try_create
```

## clickhouse

- `/gaoxinge/databend/query/src/servers/clickhouse/interactive_worker_base.rs`

```rust
- interactive_worker_base::do_query
  - plan_parser::parse
  - interactive_worker_base::process_select_query
- interactive_worker_base::process_select_query
  - interpreter_factory::get
  - interpreter_select::execute
```

- `/gaoxinge/databend/query/src/servers/clickhouse/interactive_worker.rs`

```rust
- interactive_worker::execute_query
  - interactive_worker_base::do_query
```

## mysql

- `/gaoxinge/databend/query/src/servers/mysql/mysql_interactive_worker.rs`

```rust
- mysql_interactive_worker::on_query
  - mysql_interactive_worker::do_query
- mysql_interactive_worker::do_query
  - sql_parser::parse_sql
    if ok {
      if settings.get_enable_new_processor_framework()? != 0 && settings.get_enable_planner_v2()? != 0 {
        - mod::new
        - mod::plan_sql
        - interpreter_factory_v2::get
        - interpreter_select_v2::execute
      } else {
        - sql_parse::parse_sql
        - interpreter_factory::get
        - interpreter_select::execute
      }
    } else {
      if settings.get_enable_planner_v2()? != 0 {
        - mod::new
        - mod::plan_sql
        - interpreter_factory_v2::get
        - interpreter_select_v2::execute
      } else {

      }
    }
```

## expression

- src/query/service/src/pipelines/processors/transforms/transform_expression_v2.rs

```rust
impl Transform for ExpressionTransformV2 {
    const NAME: &'static str = "Expression";

    fn transform(&mut self, mut data: DataBlock) -> Result<DataBlock> {
        for (eval, output_name) in self.expressions.iter() {
            let typed_vector = eval.eval(&self.func_ctx, &data)?;
            let data_field = DataField::new(output_name.as_str(), typed_vector.logical_type());
            let column = typed_vector.vector().clone();
            data = data.add_column(column, data_field)?;
        }

        Ok(data)
    }
}
```

- src/query/service/src/evaluator/eval_node.rs

```rust
    /// Evaluate with given context, which is typically a `DataBlock`
    pub fn eval(
        &self,
        func_ctx: &FunctionContext,
        eval_ctx: &impl EvalContext<VectorID = VectorID>,
    ) -> Result<TypedVector> {
        match &self {
            EvalNode::Function { func, args } => {
                let args = args
                    .iter()
                    .map(|arg| {
                        let vector = arg.eval(func_ctx, eval_ctx)?;
                        Ok(ColumnWithField::new(
                            vector.vector,
                            DataField::new("", vector.logical_type),
                        ))
                    })
                    .collect::<Result<Vec<_>>>()?;
                Ok(TypedVector::new(
                    func.eval(func_ctx.clone(), &args, eval_ctx.tuple_count())?,
                    func.return_type(),
                ))
            }
            EvalNode::Constant { value, data_type } => {
                let vector = value.as_const_column(data_type, eval_ctx.tuple_count())?;
                Ok(TypedVector::new(vector, data_type.clone()))
            }
            EvalNode::Variable { id } => eval_ctx.get_vector(id),
        }
    }
```

- src/common/functions/src/scalars/arithmetics/binary_arithmetic.rs

```rust
impl<L, R, O, F> Function for BinaryArithmeticFunction<L, R, O, F>
where
    L: Scalar + Send + Sync + Clone,
    R: Scalar + Send + Sync + Clone,
    O: Scalar + Send + Sync + Clone,
    F: Fn(L::RefType<'_>, R::RefType<'_>, &mut EvalContext) -> O + Send + Sync + Clone,
{
    fn eval(
        &self,
        _func_ctx: FunctionContext,
        columns: &ColumnsWithField,
        _input_rows: usize,
    ) -> Result<ColumnRef> {
        let col = scalar_binary_op(
            columns[0].column(),
            columns[1].column(),
            self.func.clone(),
            &mut EvalContext::default(),
        )?;
        Ok(Arc::new(col))
    }
}
```

- src/common/functions/src/scalars/expressions/binary.rs

```rust
pub fn scalar_binary_op<L: Scalar, R: Scalar, O: Scalar, F>(
    l: &ColumnRef,
    r: &ColumnRef,
    f: F,
    ctx: &mut EvalContext,
) -> Result<<O as Scalar>::ColumnType>
where
    F: Fn(L::RefType<'_>, R::RefType<'_>, &mut EvalContext) -> O,
{
        (false, false) => {
            let left: &<L as Scalar>::ColumnType = unsafe { Series::static_cast(l) };
            let right: &<R as Scalar>::ColumnType = unsafe { Series::static_cast(r) };

            let it = left
                .scalar_iter()
                .zip(right.scalar_iter())
                .map(|(a, b)| f(a, b, ctx));
            <O as Scalar>::ColumnType::from_owned_iterator(it)
        }
}
```

## middle

- src/query/service/src/evaluator/eval_context.rs

```rust
pub trait EvalContext: Debug {
    type VectorID: PartialEq + Eq + Clone + Debug;

    fn get_vector(&self, id: &Self::VectorID) -> Result<TypedVector>;

    fn tuple_count(&self) -> usize;
}

impl EvalContext for DataBlock {
    type VectorID = String;

    fn get_vector(&self, id: &String) -> Result<TypedVector> {
        let column = self.try_column_by_name(id.as_str())?;
        let field = self.schema().field_with_name(id.as_str())?;
        Ok(TypedVector {
            vector: column.clone(),
            logical_type: field.data_type().clone(),
        })
    }

    fn tuple_count(&self) -> usize {
        self.num_rows()
    }
}

#[derive(Clone, Debug)]
pub struct TypedVector {
    pub(super) vector: ColumnRef,
    pub(super) logical_type: DataTypeImpl,
}

impl TypedVector {
    pub fn new(data: ColumnRef, logical_type: DataTypeImpl) -> Self {
        Self {
            vector: data,
            logical_type,
        }
    }

    pub fn logical_type(&self) -> DataTypeImpl {
        self.logical_type.clone()
    }

    pub fn physical_type(&self) -> DataTypeImpl {
        self.vector.data_type()
    }

    pub fn vector(&self) -> &ColumnRef {
        &self.vector
    }
}
```

## type

- src/common/datablocks/src/data_block.rs

```rust
#[derive(Clone, Eq, PartialEq)]
pub struct DataBlock {
    schema: DataSchemaRef,
    columns: Vec<ColumnRef>,
}
```

- src/common/datavalues/src/columns/column.rs

```rust
pub type ColumnRef = Arc<dyn Column>;
pub trait Column: Send + Sync {}
pub trait IntoColumn {
    fn into_column(self) -> ColumnRef;
    fn into_nullable_column(self) -> ColumnRef;
}

impl<A> IntoColumn for A
where A: AsRef<dyn Array>
{
    fn into_column(self) -> ColumnRef {
        use TypeID::*;
        let data_type: DataTypeImpl = from_arrow_type(self.as_ref().data_type());
        match data_type.data_type_id() {
            // arrow type has no nullable type
            Nullable => unimplemented!(),
            Null => Arc::new(NullColumn::from_arrow_array(self.as_ref())),
            Boolean => Arc::new(BooleanColumn::from_arrow_array(self.as_ref())),
            UInt8 => Arc::new(UInt8Column::from_arrow_array(self.as_ref())),
            UInt16 => Arc::new(UInt16Column::from_arrow_array(self.as_ref())),
            UInt32 => Arc::new(UInt32Column::from_arrow_array(self.as_ref())),
            UInt64 => Arc::new(UInt64Column::from_arrow_array(self.as_ref())),
            Int8 => Arc::new(Int8Column::from_arrow_array(self.as_ref())),
            Int16 => Arc::new(Int16Column::from_arrow_array(self.as_ref())),
            Int32 | Date => Arc::new(Int32Column::from_arrow_array(self.as_ref())),
            Int64 | Interval | Timestamp => Arc::new(Int64Column::from_arrow_array(self.as_ref())),
            Float32 => Arc::new(Float32Column::from_arrow_array(self.as_ref())),
            Float64 => Arc::new(Float64Column::from_arrow_array(self.as_ref())),
            Array => Arc::new(ArrayColumn::from_arrow_array(self.as_ref())),
            Struct => Arc::new(StructColumn::from_arrow_array(self.as_ref())),
            String => Arc::new(StringColumn::from_arrow_array(self.as_ref())),
            Variant => Arc::new(VariantColumn::from_arrow_array(self.as_ref())),
            VariantArray => Arc::new(VariantColumn::from_arrow_array(self.as_ref())),
            VariantObject => Arc::new(VariantColumn::from_arrow_array(self.as_ref())),
        }
    }

    fn into_nullable_column(self) -> ColumnRef {
        let validity = self.as_ref().validity().cloned();
        let column = self.as_ref().into_column();
        NullableColumn::wrap_inner(column, validity)
    }
}
```

- src/common/datavalues/src/scalars/column.rs

```rust
/// ScalarColumn is a sub trait of Column

// This is idea from `https://github.com/skyzh/type-exercise-in-rust`
// Thanks Mr Chi.
pub trait ScalarColumn: Column + Send + Sync + Sized + 'static
where for<'a> Self::OwnedItem: Scalar<RefType<'a> = Self::RefItem<'a>>
{}
```

- src/common/datavalues/src/columns/primitive/mod.rs

```rust
/// PrimitiveColumn is generic struct which wrapped arrow's PrimitiveArray
#[derive(Clone)]
pub struct PrimitiveColumn<T: PrimitiveType> {
    values: Buffer<T>,
}

impl<T: PrimitiveType> Column for PrimitiveColumn<T> {}

impl<T> ScalarColumn for PrimitiveColumn<T>
where
    T: Scalar<ColumnType = Self> + PrimitiveType,
    for<'a> T: ScalarRef<'a, ScalarType = T, ColumnType = Self>,
    for<'a> T: Scalar<RefType<'a> = T>,
{}
```

- src/common/datavalues/src/scalars/type_.rs

```rust
/// Owned scalar value
/// primitive types, bool, Vec<u8> ...
pub trait Scalar: 'static + Sized + Default + Any
where for<'a> Self::ColumnType: ScalarColumn<RefItem<'a> = Self::RefType<'a>>
{}

pub trait ScalarRef<'a>: std::fmt::Debug + Clone + Copy + Send + 'a {}
```

- src/common/datavalues/src/columns/series.rs

```rust
// Series is a util struct to work with Column
// Maybe rename to ColumnHelper later
pub struct Series;

impl Series {
    /// Get a pointer to the underlying data of this Series.
    /// Can be useful for fast comparisons.
    /// # Safety
    /// Assumes that the `column` is T.
    pub unsafe fn static_cast<T: Any>(column: &ColumnRef) -> &T {
        let object = column.as_ref();
        debug_assert!(object.as_any().is::<T>());
        &*(object as *const dyn Column as *const T)
    }
}
```

# issue

- [x] [Feature: Support ORDER BY ... NULLS FIRST syntax in new parser](https://github.com/datafuselabs/databend/issues/5537)
- [Formal specification of HAVING clause](https://github.com/datafuselabs/databend/issues/5660)
- [SQL syntax error is not friendly](https://github.com/datafuselabs/databend/issues/7120)

# issue6659

## issue

- [bug: Not(expression) can't return result in new planner](https://github.com/datafuselabs/databend/issues/6659)
- [ROW_COUNT()](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_row-count)
- [5.4.1 mysql_affected_rows()](https://dev.mysql.com/doc/c-api/8.0/en/mysql-affected-rows.html)
  - INSERT
  - UPDATE
  - DELETE
  - REPLACE
  - CALL
  - CREATE
  - DROP
  - ALTER
  - LOAD
- [5.4.53 mysql_num_rows()](https://dev.mysql.com/doc/c-api/8.0/en/mysql-num-rows.html)
  - SELECT
  - SHOW

## code

- Plan
  - Query
  - Explain
  - ShowMetrics
  - ShowProcessList
  - ShowSettings
  - ShowDatabases
  - ShowCreateDatabase
  - ShowTables
  - ShowCreateTable
  - DescribeTable
  - ShowTablesStatus
  - ShowUsers
  - ShowRoles
  - ShowGrants
  - ShowStages
  - ListStage
  - DescribeStage


```rust
pub enum Plan {
    // `SELECT` statement
    Query,
    Explain,

    // Copy
    Copy(Box<CopyPlanV2>),
    
    // Call
    Call(Box<CallPlan>),

    // System
    ShowMetrics,
    ShowProcessList,
    ShowSettings,

    // Databases
    ShowDatabases(Box<ShowDatabasesPlan>),
    ShowCreateDatabase(Box<ShowCreateDatabasePlan>),
    CreateDatabase(Box<CreateDatabasePlan>),
    DropDatabase(Box<DropDatabasePlan>),
    RenameDatabase(Box<RenameDatabasePlan>),

    // Tables
    ShowTables(Box<ShowTablesPlan>),
    ShowCreateTable(Box<ShowCreateTablePlan>),
    DescribeTable(Box<DescribeTablePlan>),
    ShowTablesStatus(Box<ShowTablesStatusPlan>),
    CreateTable(Box<CreateTablePlan>),
    DropTable(Box<DropTablePlan>),
    UndropTable(Box<UndropTablePlan>),
    RenameTable(Box<RenameTablePlan>),
    AlterTableClusterKey(Box<AlterTableClusterKeyPlan>),
    DropTableClusterKey(Box<DropTableClusterKeyPlan>),
    TruncateTable(Box<TruncateTablePlan>),
    OptimizeTable(Box<OptimizeTablePlan>),
    ExistsTable(Box<ExistsTablePlan>),

    // Insert
    Insert(Box<Insert>),
    Delete(Box<DeletePlan>),

    // Views
    CreateView(Box<CreateViewPlan>),
    AlterView(Box<AlterViewPlan>),
    DropView(Box<DropViewPlan>),

    // Account
    ShowUsers,
    AlterUser(Box<AlterUserPlan>),
    CreateUser(Box<CreateUserPlan>),
    DropUser(Box<DropUserPlan>),

    // UDF
    CreateUDF(Box<CreateUserUDFPlan>),
    AlterUDF(Box<AlterUserUDFPlan>),
    DropUDF(Box<DropUserUDFPlan>),

    ShowRoles,
    CreateRole(Box<CreateRolePlan>),
    DropRole(Box<DropRolePlan>),
    GrantRole(Box<GrantRolePlan>),
    GrantPriv(Box<GrantPrivilegePlan>),
    ShowGrants(Box<ShowGrantsPlan>),
    RevokePriv(Box<RevokePrivilegePlan>),
    RevokeRole(Box<RevokeRolePlan>),

    // Stages
    ShowStages,
    ListStage(Box<ListPlan>),
    DescribeStage(Box<DescribeUserStagePlan>),
    CreateStage(Box<CreateUserStagePlan>),
    DropStage(Box<DropUserStagePlan>),
    RemoveStage(Box<RemoveUserStagePlan>),

    // Presign
    Presign(Box<PresignPlan>),

    // Set
    SetVariable(Box<SettingPlan>),
}
```

- PlanNode
  - Explain
  - Select
  - List
  - Show
  - ShowCreateDatabase
  - DescribeTable
  - ShowCreateTable
  - DescribeUserStage

```rust
pub enum PlanNode {
    // Base.
    Empty(EmptyPlan),
    Stage(StagePlan),
    Broadcast(BroadcastPlan),
    Remote(RemotePlan),
    Projection(ProjectionPlan),
    Expression(ExpressionPlan),
    AggregatorPartial(AggregatorPartialPlan),
    AggregatorFinal(AggregatorFinalPlan),
    Filter(FilterPlan),
    Having(HavingPlan),
    WindowFunc(WindowFuncPlan),
    Sort(SortPlan),
    Limit(LimitPlan),
    LimitBy(LimitByPlan),
    ReadSource(ReadDataSourcePlan),
    SubQueryExpression(SubQueriesSetPlan),
    Sink(SinkPlan),

    // Explain.
    Explain(ExplainPlan),

    // Query.
    Select(SelectPlan),

    // Insert.
    Insert(InsertPlan),

    // Delete.
    Delete(DeletePlan),

    // Copy.
    Copy(CopyPlan),

    // Call.
    Call(CallPlan),

    // List
    List(ListPlan),

    // Cluster key.
    AlterTableClusterKey(AlterTableClusterKeyPlan),
    DropTableClusterKey(DropTableClusterKeyPlan),

    // Show.
    Show(ShowPlan),

    // Database.
    CreateDatabase(CreateDatabasePlan),
    DropDatabase(DropDatabasePlan),
    UndropDatabase(UndropDatabasePlan),
    RenameDatabase(RenameDatabasePlan),
    ShowCreateDatabase(ShowCreateDatabasePlan),

    // Table.
    CreateTable(CreateTablePlan),
    DropTable(DropTablePlan),
    UndropTable(UndropTablePlan),
    RenameTable(RenameTablePlan),
    TruncateTable(TruncateTablePlan),
    OptimizeTable(OptimizeTablePlan),
    ExistsTable(ExistsTablePlan),
    DescribeTable(DescribeTablePlan),
    ShowCreateTable(ShowCreateTablePlan),

    // View.
    CreateView(CreateViewPlan),
    DropView(DropViewPlan),
    AlterView(AlterViewPlan),

    // User.
    CreateUser(CreateUserPlan),
    AlterUser(AlterUserPlan),
    DropUser(DropUserPlan),

    // Grant.
    GrantPrivilege(GrantPrivilegePlan),
    GrantRole(GrantRolePlan),

    // Revoke.
    RevokePrivilege(RevokePrivilegePlan),
    RevokeRole(RevokeRolePlan),

    // Role.
    CreateRole(CreateRolePlan),
    DropRole(DropRolePlan),

    // Stage.
    CreateUserStage(CreateUserStagePlan),
    DropUserStage(DropUserStagePlan),
    DescribeUserStage(DescribeUserStagePlan),
    RemoveUserStage(RemoveUserStagePlan),

    // UDF.
    CreateUserUDF(CreateUserUDFPlan),
    DropUserUDF(DropUserUDFPlan),
    AlterUserUDF(AlterUserUDFPlan),

    // Use.
    UseDatabase(UseDatabasePlan),

    // Set.
    SetVariable(SettingPlan),

    // Kill.
    Kill(KillPlan),
}
```

- DfStatement
  - Query
  - Explain
  - ShowDatabases
  - ShowCreateDatabase
  - ShowTables
  - ShowCreateTable
  - ShowTablesStatus
  - DescribeTable
  - ShowSettings
  - ShowProcessList
  - ShowMetrics
  - ShowFunctions
  - ShowUsers
  - ShowRoles
  - DescribeStage
  - List
  - ShowStages
  - ShowGrants
  - ShowEngines

```rust
pub enum DfStatement<'a> {
    // ANSI SQL AST node
    Query(Box<DfQueryStatement>),
    Explain(DfExplain<'a>),

    // Databases.
    ShowDatabases(DfShowDatabases),
    ShowCreateDatabase(DfShowCreateDatabase),
    CreateDatabase(DfCreateDatabase),
    DropDatabase(DfDropDatabase),
    UseDatabase(DfUseDatabase),
    AlterDatabase(DfAlterDatabase),

    // Tables.
    ShowTables(DfShowTables),
    ShowCreateTable(DfShowCreateTable),
    ShowTablesStatus(DfShowTablesStatus),
    CreateTable(DfCreateTable),
    DescribeTable(DfDescribeTable),
    DropTable(DfDropTable),
    UndropTable(DfUndropTable),
    UndropDatabase(DfUndropDatabase),
    AlterTable(DfAlterTable),
    TruncateTable(DfTruncateTable),
    OptimizeTable(DfOptimizeTable),
    ExistsTable(DfExistsTable),
    RenameTable(DfRenameTable),

    // Views.
    CreateView(DfCreateView),
    // TODO(veeupup) make alter and delete view done
    AlterView(DfAlterView),
    DropView(DfDropView),

    // Settings.
    ShowSettings(DfShowSettings),

    // ProcessList
    ShowProcessList(DfShowProcessList),

    // Metrics
    ShowMetrics(DfShowMetrics),

    // Functions
    ShowFunctions(DfShowFunctions),

    // Kill
    KillStatement(DfKillStatement),

    // Set
    SetVariable(DfSetVariable),

    // Insert
    InsertQuery(DfInsertStatement<'a>),

    // Delete
    Delete(Box<DfDeleteStatement>),

    // User
    CreateUser(DfCreateUser),
    AlterUser(DfAlterUser),
    ShowUsers(DfShowUsers),
    DropUser(DfDropUser),

    // Role
    CreateRole(DfCreateRole),
    DropRole(DfDropRole),
    ShowRoles(DfShowRoles),

    // Copy
    Copy(DfCopy),

    // Stage
    CreateStage(DfCreateUserStage),
    DropStage(DfDropUserStage),
    DescribeStage(DfDescribeUserStage),
    RemoveStage(DfRemoveStage),
    List(DfList),
    ShowStages(DfShowStages),

    // Call
    Call(DfCall),

    // Grant
    GrantPrivilege(DfGrantPrivilegeStatement),
    GrantRole(DfGrantRoleStatement),
    ShowGrants(DfShowGrants),

    // Revoke
    RevokePrivilege(DfRevokePrivilegeStatement),
    RevokeRole(DfRevokeRoleStatement),

    // UDF
    CreateUDF(DfCreateUDF),
    DropUDF(DfDropUDF),
    AlterUDF(DfAlterUDF),

    // Engine
    ShowEngines(DfShowEngines),
}
```

## result

- mysql result

```sql
mysql> create table t3(a bool, b int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t3 values (false, 1), (true, 2);
Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

mysql> select not(t3.a) from t3 where t3.b > 2;
Empty set (0.00 sec)
```

- databend result

```sql
mysql> create table t3(a bool, b int);
Query OK, 0 rows affected (0.04 sec)

mysql> insert into t3 values (false, 1), (true, 2);
Query OK, 0 rows affected (0.04 sec)

mysql> select not(t3.a) from t3 where t3.b > 2;
Query OK, 0 rows affected (0.07 sec)

mysql> set enable_planner_v2 = 1;
Query OK, 0 rows affected (0.03 sec)

mysql> select not(t3.a) from t3 where t3.b > 2;
ERROR 1105 (HY000): Code: 1104, displayText = assertion failed: !column.is_empty().
```

## old test

- old

```sql
mysql> create database test_db;
Query OK, 0 rows affected (0.03 sec)

mysql> create table t3(a bool, b int);
Query OK, 0 rows affected (0.03 sec)

mysql> insert into t3 values (false, 1), (true, 2);
Query OK, 0 rows affected (0.04 sec)

mysql> set enable_planner_v2 = 0;
Query OK, 0 rows affected (0.02 sec)

mysql> select * from t3 where t3.b > 2;
Query OK, 0 rows affected (0.04 sec)

mysql> set enable_planner_v2 = 1;
Query OK, 0 rows affected (0.02 sec)

mysql> select * from t3 where t3.b > 2;
Empty set (0.03 sec)
Read 2 rows, 9.00 B in 0.008 sec., 257.51 rows/sec., 1.13 KiB/sec.
```

```sql
mysql> set enable_planner_v2 = 0;
Query OK, 0 rows affected (0.02 sec)

mysql> show databases;
+--------------------+
| database           |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| system             |
+--------------------+
3 rows in set (0.03 sec)
Read 3 rows, 78.00 B in 0.007 sec., 583.37 rows/sec., 11.11 KiB/sec.

mysql> create database test_db;
Query OK, 0 rows affected (0.03 sec)

mysql> show databases;
+--------------------+
| database           |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| system             |
| test_db            |
+--------------------+
4 rows in set (0.03 sec)
Read 4 rows, 78.00 B in 0.007 sec., 583.37 rows/sec., 11.11 KiB/sec.

mysql> use test_db;
Database changed
mysql> show tables;
Empty set (0.03 sec)
Read 25 rows, 3.46 KiB in 0.008 sec., 2.98 thousand rows/sec., 413.03 KiB/sec.

mysql> create table t3(a bool, b int);
Query OK, 0 rows affected (0.11 sec)

mysql> insert into t3 values (false, 1), (true, 2);
Query OK, 0 rows affected (0.10 sec)

mysql> show tables;
+-------------------+
| tables_in_test_db |
+-------------------+
| t3                |
+-------------------+
1 row in set (0.04 sec)
Read 26 rows, 3.58 KiB in 0.009 sec., 2.91 thousand rows/sec., 401.47 KiB/sec.

mysql> select * from t3 where t3.b > 2;
Query OK, 0 rows affected (0.07 sec)

mysql> select * from t3 where t3.b > 1;
+------+------+
| a    | b    |
+------+------+
|    1 |    2 |
+------+------+
1 row in set (0.08 sec)
Read 2 rows, 9.00 B in 0.014 sec., 146.48 rows/sec., 659.14 B/sec.
```

```sql
mysql> set enable_planner_v2 = 1;
Query OK, 0 rows affected (0.04 sec)

mysql> show databases;
+--------------------+
| database           |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| system             |
+--------------------+
3 rows in set (0.06 sec)
Read 3 rows, 63.00 B in 0.022 sec., 133.65 rows/sec., 2.74 KiB/sec.

mysql> create database test_db;
Query OK, 0 rows affected (0.08 sec)

mysql> show databases;
+--------------------+
| database           |
+--------------------+
| INFORMATION_SCHEMA |
| default            |
| system             |
| test_db            |
+--------------------+
4 rows in set (0.06 sec)
Read 4 rows, 78.00 B in 0.008 sec., 475.14 rows/sec., 9.05 KiB/sec.

mysql> use test_db;
Database changed
mysql> show tables;
Empty set (0.08 sec)
Read 25 rows, 3.46 KiB in 0.027 sec., 934.36 rows/sec., 129.35 KiB/sec.

mysql> create table t3(a bool, b int);
Query OK, 0 rows affected (0.06 sec)

mysql> insert into t3 values (false, 1), (true, 2);
Query OK, 0 rows affected (0.07 sec)

mysql> show tables;
+-------------------+
| tables_in_test_db |
+-------------------+
| t3                |
+-------------------+
1 row in set (0.06 sec)
Read 26 rows, 3.58 KiB in 0.016 sec., 1.65 thousand rows/sec., 227.70 KiB/sec.

mysql> select * from t3 where t3.b > 2;
Empty set (0.07 sec)
Read 2 rows, 9.00 B in 0.011 sec., 179.68 rows/sec., 808.55 B/sec.

mysql> select * from t3 where t3.b > 1;
+------+------+
| a    | b    |
+------+------+
|    1 |    2 |
+------+------+
1 row in set (0.08 sec)
Read 2 rows, 9.00 B in 0.012 sec., 164.14 rows/sec., 738.64 B/sec.
```

```sql
mysql> set enable_planner_v2 = 1;
Query OK, 0 rows affected (0.09 sec)

mysql> select '===Explain===';
+-----------------+
| '===Explain===' |
+-----------------+
| ===Explain===   |
+-----------------+
1 row in set (0.08 sec)
Read 1 rows, 1.00 B in 0.028 sec., 36.32 rows/sec., 36.32 B/sec.

mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.10 sec)

mysql> create table t2(a int, b int);
Query OK, 0 rows affected (0.09 sec)

mysql> explain select t1.a from t1 where a > 0;
+----------------------------------------+
| explain                                |
+----------------------------------------+
| Project: [a]                           |
| └── Filter: [t1.a > 0]           |
|     └── Scan: default.default.t1 |
+----------------------------------------+
3 rows in set (0.08 sec)
Read 0 rows, 0.00 B in 0.025 sec., 0 rows/sec., 0.00 B/sec.

mysql> explain select * from t1, t2 where (t1.a = t2.a and t1.a > 3) or (t1.a = t2.a and t2.a > 5 and t1.a > 1);
+-------------------------------------------------------------------------------------+
| explain                                                                             |
+-------------------------------------------------------------------------------------+
| Filter: [(t1.a > 3) OR ((t2.a > 5) AND (t1.a > 1))]                                 |
| └── HashJoin: INNER, build keys: [t2.a], probe keys: [t1.a], join filters: [] |
|     ├── Scan: default.default.t1                                              |
|     └── Scan: default.default.t2                                              |
+-------------------------------------------------------------------------------------+
4 rows in set (0.09 sec)
Read 0 rows, 0.00 B in 0.008 sec., 0 rows/sec., 0.00 B/sec.

mysql> explain select * from t1, t2 where (t1.a = t2.a and t1.a > 3) or (t1.a = t2.a);
+---------------------------------------------------------------------------+
| explain                                                                   |
+---------------------------------------------------------------------------+
| HashJoin: INNER, build keys: [t2.a], probe keys: [t1.a], join filters: [] |
| ├── Scan: default.default.t1                                        |
| └── Scan: default.default.t2                                        |
+---------------------------------------------------------------------------+
3 rows in set (0.08 sec)
Read 0 rows, 0.00 B in 0.011 sec., 0 rows/sec., 0.00 B/sec.

mysql> drop table t1;
Query OK, 0 rows affected (0.08 sec)

mysql> drop table t2;
Query OK, 0 rows affected (0.07 sec)

mysql> set enable_planner_v2 = 0;
Query OK, 0 rows affected (0.06 sec)
```

```sql
mysql> use test_db;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> describe t3;
+-------+---------+------+---------+-------+
| Field | Type    | Null | Default | Extra |
+-------+---------+------+---------+-------+
| a     | BOOLEAN | NO   | false   |       |
| b     | INT     | NO   | 0       |       |
+-------+---------+------+---------+-------+
2 rows in set (0.04 sec)
Read 0 rows, 0.00 B in 0.012 sec., 0 rows/sec., 0.00 B/sec.
```

```sql
mysql> create table t09_0017(c int);
Query OK, 0 rows affected (0.11 sec)

mysql> insert into t09_0017 values(1);
Query OK, 0 rows affected (0.10 sec)

mysql> insert into t09_0017 values(2);
Query OK, 0 rows affected (0.10 sec)

mysql> set enable_planner_v2 = 1; select * from fuse_snapshot('default', 't09_0017') limit 1;
Query OK, 0 rows affected (0.05 sec)

+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| snapshot_id                      | snapshot_location                                | format_version | previous_snapshot_id             | segment_count | block_count | row_count | bytes_uncompressed | bytes_compressed | timestamp                  |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| 3bdd8355dbb64231be29fc88d4458703 | 1/7/_ss/3bdd8355dbb64231be29fc88d4458703_v1.json |              1 | 3a650044a3244722be8862c33085c2f6 |             2 |           2 |         2 |                  8 |              368 | 2022-07-29 04:03:49.342098 |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
1 row in set (0.07 sec)
Read 2 rows, 376.00 B in 0.017 sec., 114.78 rows/sec., 21.07 KiB/sec.

mysql> set enable_planner_v2 = 1; select * from fuse_snapshot('default', 't09_0017') limit 0;
Query OK, 0 rows affected (0.05 sec)

Query OK, 0 rows affected (0.06 sec)

mysql> set enable_planner_v2 = 0; select * from fuse_snapshot('default', 't09_0017') limit 1;
Query OK, 0 rows affected (0.06 sec)

+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| snapshot_id                      | snapshot_location                                | format_version | previous_snapshot_id             | segment_count | block_count | row_count | bytes_uncompressed | bytes_compressed | timestamp                  |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| 3bdd8355dbb64231be29fc88d4458703 | 1/7/_ss/3bdd8355dbb64231be29fc88d4458703_v1.json |              1 | 3a650044a3244722be8862c33085c2f6 |             2 |           2 |         2 |                  8 |              368 | 2022-07-29 04:03:49.342098 |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
1 row in set (0.07 sec)
Read 1 rows, 216.00 B in 0.015 sec., 66.84 rows/sec., 14.10 KiB/sec.

mysql> set enable_planner_v2 = 0; select * from fuse_snapshot('default', 't09_0017') limit 0;
Query OK, 0 rows affected (0.05 sec)

Query OK, 0 rows affected (0.06 sec)

mysql> call system$fuse_snapshot('default', 't09_0017', 1);
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| snapshot_id                      | snapshot_location                                | format_version | previous_snapshot_id             | segment_count | block_count | row_count | bytes_uncompressed | bytes_compressed | timestamp                  |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| 3bdd8355dbb64231be29fc88d4458703 | 1/7/_ss/3bdd8355dbb64231be29fc88d4458703_v1.json |              1 | 3a650044a3244722be8862c33085c2f6 |             2 |           2 |         2 |                  8 |              368 | 2022-07-29 04:03:49.342098 |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
1 row in set (0.08 sec)
Read 0 rows, 0.00 B in 0.034 sec., 0 rows/sec., 0.00 B/sec.

mysql> call system$fuse_snapshot('default', 't09_0017', 0);
Empty set (0.07 sec)
Read 0 rows, 0.00 B in 0.008 sec., 0 rows/sec., 0.00 B/sec.

mysql> call system$fuse_snapshot('default', 't09_0017', '0');
Empty set (0.02 sec)
Read 0 rows, 0.00 B in 0.005 sec., 0 rows/sec., 0.00 B/sec.

mysql> call system$fuse_snapshot('default', 't09_0017');
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| snapshot_id                      | snapshot_location                                | format_version | previous_snapshot_id             | segment_count | block_count | row_count | bytes_uncompressed | bytes_compressed | timestamp                  |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
| 3bdd8355dbb64231be29fc88d4458703 | 1/7/_ss/3bdd8355dbb64231be29fc88d4458703_v1.json |              1 | 3a650044a3244722be8862c33085c2f6 |             2 |           2 |         2 |                  8 |              368 | 2022-07-29 04:03:49.342098 |
| 3a650044a3244722be8862c33085c2f6 | 1/7/_ss/3a650044a3244722be8862c33085c2f6_v1.json |              1 | NULL                             |             1 |           1 |         1 |                  4 |              184 | 2022-07-29 04:03:44.126592 |
+----------------------------------+--------------------------------------------------+----------------+----------------------------------+---------------+-------------+-----------+--------------------+------------------+----------------------------+
2 rows in set (0.06 sec)
Read 0 rows, 0.00 B in 0.026 sec., 0 rows/sec., 0.00 B/sec.
```

## command

```
$ target/debug/databend-query -c scripts/ci/deploy/config/databend-query-embedded-meta.toml
$ sed '/^\s*--/d' /gaoxinge/databend/tests/suites/4_stateless/06_show/06_0012_show_table_status_v2.sql | mysql --user default -s --host=127.0.0.1 --port=3307 default  --comments --force
```

## test

```json
{"v":0,"name":"databend-query-admin-","msg":"Normal query: call system$sync_stage_file('test_sync', 'ontime_200.csv.gz')","level":30,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:57.9128862Z","target":"databend_query::servers::mysql::mysql_interactive_worker","line":326,"file":"query/src/servers/mysql/mysql_interactive_worker.rs"}
{"v":0,"name":"databend-query-admin-","msg":"{\"log_type\":1,\"handler_type\":\"MySQL\",\"tenant_id\":\"admin\",\"cluster_id\":\"\",\"sql_user\":\"root\",\"query_id\":\"a1f4b40e-0b43-47f5-bf8a-56689602cd78\",\"query_kind\":\"Call\",\"query_text\":\"call system$sync_stage_file('test_sync', 'ontime_200.csv.gz')\",\"event_date\":\"2022-07-30\",\"event_time\":\"2022-07-30 02:14:57.915682\",\"current_database\":\"default\",\"databases\":\"\",\"tables\":\"\",\"columns\":\"\",\"projections\":\"\",\"written_rows\":0,\"written_bytes\":0,\"written_io_bytes\":0,\"written_io_bytes_cost_ms\":0,\"scan_rows\":0,\"scan_bytes\":0,\"scan_io_bytes\":0,\"scan_io_bytes_cost_ms\":0,\"scan_partitions\":0,\"total_partitions\":0,\"result_rows\":0,\"result_bytes\":0,\"cpu_usage\":12,\"memory_usage\":0,\"client_info\":\"\",\"client_address\":\"127.0.0.1:53046\",\"exception_code\":0,\"exception\":\"\",\"stack_trace\":\"\",\"server_version\":\"\",\"extra\":\"\"}","level":30,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:57.9167079Z","target":"databend_query::interpreters::interpreter_query_log","line":228,"file":"query/src/interpreters/interpreter_query_log.rs"}
{"v":0,"name":"databend-query-admin-","msg":"object /gaoxinge/databend/_data/stage/test_sync/ontime_200.csv.gz stat: Custom { kind: NotFound, error: ObjectError { op: \"stat\", path: \"/gaoxinge/databend/_data/stage/test_sync/ontime_200.csv.gz\", source: No such file or directory (os error 2) } }","level":40,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:57.9179874Z","target":"log","line":null,"file":null,"log.module_path":"opendal::services::fs::backend","log.file":"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/opendal-0.11.3/src/services/fs/backend.rs","log.target":"opendal::services::fs::backend","log.line":331}
{"v":0,"name":"databend-query-admin-","msg":"object /gaoxinge/databend/_data/stage/test_sync/ontime_200.csv.gz/ stat: Custom { kind: NotFound, error: ObjectError { op: \"stat\", path: \"/gaoxinge/databend/_data/stage/test_sync/ontime_200.csv.gz/\", source: No such file or directory (os error 2) } }","level":40,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:57.9186495Z","target":"log","line":null,"file":null,"log.target":"opendal::services::fs::backend","log.module_path":"opendal::services::fs::backend","log.line":331,"log.file":"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/opendal-0.11.3/src/services/fs/backend.rs"}
{"v":0,"name":"databend-query-admin-","msg":"ignore listing /stage/test_sync/ontime_200.csv.gz/, because: Custom { kind: NotFound, error: ObjectError { op: \"stat\", path: \"/gaoxinge/databend/_data/stage/test_sync/ontime_200.csv.gz/\", source: No such file or directory (os error 2) } }","level":40,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:57.9189477Z","target":"databend_query::interpreters::interpreter_common","line":126,"file":"query/src/interpreters/interpreter_common.rs"}
{"v":0,"name":"databend-query-admin-","msg":"{\"log_type\":2,\"handler_type\":\"MySQL\",\"tenant_id\":\"admin\",\"cluster_id\":\"\",\"sql_user\":\"root\",\"query_id\":\"a1f4b40e-0b43-47f5-bf8a-56689602cd78\",\"query_kind\":\"Call\",\"query_text\":\"call system$sync_stage_file('test_sync', 'ontime_200.csv.gz')\",\"event_date\":\"2022-07-30\",\"event_time\":\"2022-07-30 02:14:57.919136\",\"current_database\":\"default\",\"databases\":\"\",\"tables\":\"\",\"columns\":\"\",\"projections\":\"\",\"written_rows\":0,\"written_bytes\":0,\"written_io_bytes\":0,\"written_io_bytes_cost_ms\":0,\"scan_rows\":0,\"scan_bytes\":0,\"scan_io_bytes\":0,\"scan_io_bytes_cost_ms\":0,\"scan_partitions\":0,\"total_partitions\":0,\"result_rows\":0,\"result_bytes\":0,\"cpu_usage\":12,\"memory_usage\":0,\"client_info\":\"\",\"client_address\":\"127.0.0.1:53046\",\"exception_code\":0,\"exception\":\"\",\"stack_trace\":\"\",\"server_version\":\"\",\"extra\":\"\"}","level":30,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:57.9196808Z","target":"databend_query::interpreters::interpreter_query_log","line":228,"file":"query/src/interpreters/interpreter_query_log.rs"}
{"v":0,"name":"databend-query-admin-","msg":"panicked at 'index out of bounds: the len is 0 but the index is 0', /gaoxinge/databend/common/datablocks/src/data_block.rs:102:10","level":50,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:58.2302521Z","target":"common_tracing::panic_hook","line":36,"file":"common/tracing/src/panic_hook.rs","panic.file":"/gaoxinge/databend/common/datablocks/src/data_block.rs","panic.line":102,"panic.column":10,"backtrace":"Backtrace [{ fn: \"common_tracing::panic_hook::log_panic\", file: \"./common/tracing/src/panic_hook.rs\", line: 33 }, { fn: \"common_tracing::panic_hook::set_panic_hook::{{closure}}\", file: \"./common/tracing/src/panic_hook.rs\", line: 28 }, { fn: \"std::panicking::rust_panic_with_hook\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 702 }, { fn: \"std::panicking::begin_panic_handler::{{closure}}\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 588 }, { fn: \"std::sys_common::backtrace::__rust_end_short_backtrace\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/sys_common/backtrace.rs\", line: 138 }, { fn: \"rust_begin_unwind\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 584 }, { fn: \"core::panicking::panic_fmt\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/panicking.rs\", line: 142 }, { fn: \"core::panicking::panic_bounds_check\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/panicking.rs\", line: 84 }, { fn: \"<usize as core::slice::index::SliceIndex<[T]>>::index\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/slice/index.rs\", line: 242 }, { fn: \"core::slice::index::<impl core::ops::index::Index<I> for [T]>::index\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/slice/index.rs\", line: 18 }, { fn: \"<alloc::vec::Vec<T,A> as core::ops::index::Index<I>>::index\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/alloc/src/vec/mod.rs\", line: 2624 }, { fn: \"common_datablocks::data_block::DataBlock::column\", file: \"./common/datablocks/src/data_block.rs\", line: 102 }, { fn: \"databend_query::servers::mysql::writers::query_result_writer::DFQueryResultWriter<W>::ok\", file: \"./query/src/servers/mysql/writers/query_result_writer.rs\", line: 148 }, { fn: \"databend_query::servers::mysql::writers::query_result_writer::DFQueryResultWriter<W>::write\", file: \"./query/src/servers/mysql/writers/query_result_writer.rs\", line: 71 }, { fn: \"<databend_query::servers::mysql::mysql_interactive_worker::InteractiveWorker<W> as opensrv_mysql::AsyncMysqlShim<W>>::on_query::{{closure}}\", file: \"./query/src/servers/mysql/mysql_interactive_worker.rs\", line: 226 }, { fn: \"<core::future::from_generator::GenFuture<T> as core::future::future::Future>::poll\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/future/mod.rs\", line: 91 }, { fn: \"<core::pin::Pin<P> as core::future::future::Future>::poll\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/future/future.rs\", line: 124 }, { fn: \"opensrv_mysql::AsyncMysqlIntermediary<B,S>::run::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/opensrv-mysql-0.1.0/src/lib.rs\", line: 519 }, { fn: \"<core::future::from_generator::GenFuture<T> as core::future::future::Future>::poll\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/future/mod.rs\", line: 91 }, { fn: \"opensrv_mysql::AsyncMysqlIntermediary<B,S>::run_with_options::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/opensrv-mysql-0.1.0/src/lib.rs\", line: 251 }, { fn: \"<core::future::from_generator::GenFuture<T> as core::future::future::Future>::poll\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/future/mod.rs\", line: 91 }, { fn: \"databend_query::servers::mysql::mysql_session::MySQLConnection::run_on_stream::{{closure}}::{{closure}}\", file: \"./query/src/servers/mysql/mysql_session.rs\", line: 52 }, { fn: \"<core::future::from_generator::GenFuture<T> as core::future::future::Future>::poll\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/future/mod.rs\", line: 91 }, { fn: \"tokio::runtime::task::core::CoreStage<T>::poll::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/core.rs\", line: 165 }, { fn: \"tokio::loom::std::unsafe_cell::UnsafeCell<T>::with_mut\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/loom/std/unsafe_cell.rs\", line: 14 }, { fn: \"tokio::runtime::task::core::CoreStage<T>::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/core.rs\", line: 155 }, { fn: \"tokio::runtime::task::harness::poll_future::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 480 }, { fn: \"<core::panic::unwind_safe::AssertUnwindSafe<F> as core::ops::function::FnOnce<()>>::call_once\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/panic/unwind_safe.rs\", line: 271 }, { fn: \"std::panicking::try::do_call\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 492 }, { fn: \"__rust_try\" }, { fn: \"std::panicking::try\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 456 }, { fn: \"std::panic::catch_unwind\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panic.rs\", line: 137 }, { fn: \"tokio::runtime::task::harness::poll_future\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 468 }, { fn: \"tokio::runtime::task::harness::Harness<T,S>::poll_inner\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 104 }, { fn: \"tokio::runtime::task::harness::Harness<T,S>::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 57 }, { fn: \"tokio::runtime::task::raw::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/raw.rs\", line: 144 }, { fn: \"tokio::runtime::task::raw::RawTask::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/raw.rs\", line: 84 }, { fn: \"tokio::runtime::task::LocalNotified<S>::run\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/mod.rs\", line: 381 }, { fn: \"tokio::runtime::thread_pool::worker::Context::run_task::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/thread_pool/worker.rs\", line: 435 }, { fn: \"tokio::coop::with_budget::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/coop.rs\", line: 102 }, { fn: \"std::thread::local::LocalKey<T>::try_with\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/thread/local.rs\", line: 445 }, { fn: \"std::thread::local::LocalKey<T>::with\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/thread/local.rs\", line: 421 }, { fn: \"tokio::coop::with_budget\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/coop.rs\", line: 95 }, { fn: \"tokio::coop::budget\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/coop.rs\", line: 72 }, { fn: \"tokio::runtime::thread_pool::worker::Context::run_task\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/thread_pool/worker.rs\", line: 434 }, { fn: \"tokio::runtime::thread_pool::worker::Context::run\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/thread_pool/worker.rs\", line: 401 }, { fn: \"tokio::runtime::thread_pool::worker::run::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/thread_pool/worker.rs\", line: 386 }, { fn: \"tokio::macros::scoped_tls::ScopedKey<T>::set\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/macros/scoped_tls.rs\", line: 61 }, { fn: \"tokio::runtime::thread_pool::worker::run\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/thread_pool/worker.rs\", line: 383 }, { fn: \"tokio::runtime::thread_pool::worker::Launch::launch::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/thread_pool/worker.rs\", line: 362 }, { fn: \"<tokio::runtime::blocking::task::BlockingTask<T> as core::future::future::Future>::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/blocking/task.rs\", line: 42 }, { fn: \"tokio::runtime::task::core::CoreStage<T>::poll::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/core.rs\", line: 165 }, { fn: \"tokio::loom::std::unsafe_cell::UnsafeCell<T>::with_mut\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/loom/std/unsafe_cell.rs\", line: 14 }, { fn: \"tokio::runtime::task::core::CoreStage<T>::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/core.rs\", line: 155 }, { fn: \"tokio::runtime::task::harness::poll_future::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 480 }, { fn: \"<core::panic::unwind_safe::AssertUnwindSafe<F> as core::ops::function::FnOnce<()>>::call_once\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/panic/unwind_safe.rs\", line: 271 }, { fn: \"std::panicking::try::do_call\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 492 }, { fn: \"__rust_try\" }, { fn: \"std::panicking::try\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 456 }, { fn: \"std::panic::catch_unwind\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panic.rs\", line: 137 }, { fn: \"tokio::runtime::task::harness::poll_future\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 468 }, { fn: \"tokio::runtime::task::harness::Harness<T,S>::poll_inner\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 104 }, { fn: \"tokio::runtime::task::harness::Harness<T,S>::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/harness.rs\", line: 57 }, { fn: \"tokio::runtime::task::raw::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/raw.rs\", line: 144 }, { fn: \"tokio::runtime::task::raw::RawTask::poll\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/raw.rs\", line: 84 }, { fn: \"tokio::runtime::task::UnownedTask<S>::run\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/task/mod.rs\", line: 418 }, { fn: \"tokio::runtime::blocking::pool::Task::run\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/blocking/pool.rs\", line: 91 }, { fn: \"tokio::runtime::blocking::pool::Inner::run\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/blocking/pool.rs\", line: 325 }, { fn: \"tokio::runtime::blocking::pool::Spawner::spawn_thread::{{closure}}\", file: \"/root/.cargo/registry/src/mirrors.tuna.tsinghua.edu.cn-df7c3c540f42cdbd/tokio-1.20.1/src/runtime/blocking/pool.rs\", line: 300 }, { fn: \"std::sys_common::backtrace::__rust_begin_short_backtrace\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/sys_common/backtrace.rs\", line: 122 }, { fn: \"std::thread::Builder::spawn_unchecked_::{{closure}}::{{closure}}\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/thread/mod.rs\", line: 501 }, { fn: \"<core::panic::unwind_safe::AssertUnwindSafe<F> as core::ops::function::FnOnce<()>>::call_once\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/panic/unwind_safe.rs\", line: 271 }, { fn: \"std::panicking::try::do_call\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 492 }, { fn: \"__rust_try\" }, { fn: \"std::panicking::try\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panicking.rs\", line: 456 }, { fn: \"std::panic::catch_unwind\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/panic.rs\", line: 137 }, { fn: \"std::thread::Builder::spawn_unchecked_::{{closure}}\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/thread/mod.rs\", line: 500 }, { fn: \"core::ops::function::FnOnce::call_once{{vtable.shim}}\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/core/src/ops/function.rs\", line: 248 }, { fn: \"<alloc::boxed::Box<F,A> as core::ops::function::FnOnce<Args>>::call_once\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/alloc/src/boxed.rs\", line: 1951 }, { fn: \"<alloc::boxed::Box<F,A> as core::ops::function::FnOnce<Args>>::call_once\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/alloc/src/boxed.rs\", line: 1951 }, { fn: \"std::sys::unix::thread::Thread::new::thread_start\", file: \"/rustc/ddcbba036aee08f0709f98a92a342a278eae5c05/library/std/src/sys/unix/thread.rs\", line: 108 }, { fn: \"start_thread\" }, { fn: \"clone\" }]"}
{"v":0,"name":"databend-query-admin-","msg":"MySQL connection coming: Ok(127.0.0.1:53050)","level":30,"hostname":"25c13f0b794e","pid":23809,"time":"2022-07-30T02:14:58.2327798Z","target":"databend_query::servers::mysql::mysql_handler","line":89,"file":"query/src/servers/mysql/mysql_handler.rs"}
```

## rows affected

### mysql

```sql
mysql> create database test_db;
Query OK, 1 row affected (0.01 sec)

mysql> use test_db;
Database changed
mysql> create table t3(a bool, b int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t3 values (false, 1), (true, 2);
Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

mysql> update t3 set b = 3 where not a;
Query OK, 1 row affected (0.00 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> delete from t3 where a;
Query OK, 1 row affected (0.00 sec)

mysql> select * from t3;
+------+------+
| a    | b    |
+------+------+
|    0 |    3 |
+------+------+
1 row in set (0.00 sec)

mysql> drop table t3;
Query OK, 0 rows affected (0.02 sec)

mysql> drop database test_db;
Query OK, 0 rows affected (0.01 sec)
```

### databend

```sql
mysql> create database test_db;
Query OK, 0 rows affected (0.04 sec)

mysql> use test_db;
Database changed
mysql> create table t3(a bool, b int);
Query OK, 0 rows affected (0.03 sec)

mysql> insert into t3 values (false, 1), (true, 2);
Query OK, 0 rows affected (0.06 sec)

mysql> update t3 set b = 3 where not a;
ERROR 1105 (HY000): Code: 1005, displayText = error: 
  --> SQL:1:1
  |
1 | update t3 set b = 3 where not a
  | ^^^^^^ expected `(`, `UNION`, `EXCEPT`, `INTERSECT`, `SELECT`, `EXPLAIN`, or 23 more ...

.
mysql> delete from t3 where a;
Query OK, 0 rows affected (0.05 sec)

mysql> select * from t3;
+------+------+
| a    | b    |
+------+------+
|    0 |    1 |
+------+------+
1 row in set (0.03 sec)
Read 1 rows, 5.00 B in 0.006 sec., 162.1 rows/sec., 810.49 B/sec.

mysql> drop table t3;
Query OK, 0 rows affected (0.04 sec)

mysql> drop database test_db;
Query OK, 0 rows affected (0.03 sec)
```

## explain

### issue

- [[explain] better plan/pipeline explain display](https://github.com/datafuselabs/databend/issues/944)

### code

- interpreter_explain 
  - schema: Vu8::to_data_type()
  - block: lines
- interpreter_explain_v2
  - schema: String -> MYSQL_TYPE_VARCHAR
  - block: lines

### databend

```sql
mysql> set enable_planner_v2 = 1;
Query OK, 0 rows affected (0.09 sec)

mysql> select '===Explain===';
+-----------------+
| '===Explain===' |
+-----------------+
| ===Explain===   |
+-----------------+
1 row in set (0.08 sec)
Read 1 rows, 1.00 B in 0.028 sec., 36.32 rows/sec., 36.32 B/sec.

mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.10 sec)

mysql> create table t2(a int, b int);
Query OK, 0 rows affected (0.09 sec)

mysql> explain select t1.a from t1 where a > 0;
+----------------------------------------+
| explain                                |
+----------------------------------------+
| Project: [a]                           |
| └── Filter: [t1.a > 0]           |
|     └── Scan: default.default.t1 |
+----------------------------------------+
3 rows in set (0.08 sec)
Read 0 rows, 0.00 B in 0.025 sec., 0 rows/sec., 0.00 B/sec.

mysql> explain select * from t1, t2 where (t1.a = t2.a and t1.a > 3) or (t1.a = t2.a and t2.a > 5 and t1.a > 1);
+-------------------------------------------------------------------------------------+
| explain                                                                             |
+-------------------------------------------------------------------------------------+
| Filter: [(t1.a > 3) OR ((t2.a > 5) AND (t1.a > 1))]                                 |
| └── HashJoin: INNER, build keys: [t2.a], probe keys: [t1.a], join filters: [] |
|     ├── Scan: default.default.t1                                              |
|     └── Scan: default.default.t2                                              |
+-------------------------------------------------------------------------------------+
4 rows in set (0.09 sec)
Read 0 rows, 0.00 B in 0.008 sec., 0 rows/sec., 0.00 B/sec.

mysql> explain select * from t1, t2 where (t1.a = t2.a and t1.a > 3) or (t1.a = t2.a);
+---------------------------------------------------------------------------+
| explain                                                                   |
+---------------------------------------------------------------------------+
| HashJoin: INNER, build keys: [t2.a], probe keys: [t1.a], join filters: [] |
| ├── Scan: default.default.t1                                        |
| └── Scan: default.default.t2                                        |
+---------------------------------------------------------------------------+
3 rows in set (0.08 sec)
Read 0 rows, 0.00 B in 0.011 sec., 0 rows/sec., 0.00 B/sec.

mysql> drop table t1;
Query OK, 0 rows affected (0.08 sec)

mysql> drop table t2;
Query OK, 0 rows affected (0.07 sec)

mysql> set enable_planner_v2 = 0;
Query OK, 0 rows affected (0.06 sec)
```

```sql
mysql> set enable_planner_v2 = 1;
Query OK, 0 rows affected (0.12 sec)

mysql> select '===Explain===';
+-----------------+
| '===Explain===' |
+-----------------+
| ===Explain===   |
+-----------------+
1 row in set (0.12 sec)
Read 1 rows, 1.00 B in 0.035 sec., 28.84 rows/sec., 28.84 B/sec.

mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.24 sec)

mysql> create table t2(a int, b int);
Query OK, 0 rows affected (0.10 sec)

mysql> explain select t1.a from t1 where a > 0;
+----------------------------------------+
| explain                                |
+----------------------------------------+
| Project: [a (#0)]                      |
| └── Filter: [t1.a (#0) > 0]      |
|     └── Scan: default.default.t1 |
+----------------------------------------+
3 rows in set (0.29 sec)
Read 0 rows, 0.00 B in 0.012 sec., 0 rows/sec., 0.00 B/sec.

mysql> charset utf8;
Charset changed
mysql> explain select t1.a from t1 where a > 0;
+----------------------------------------+
| explain                                |
+----------------------------------------+
| Project: [a (#0)]                      |
| └── Filter: [t1.a (#0) > 0]            |
|     └── Scan: default.default.t1       |
+----------------------------------------+
3 rows in set (0.05 sec)
Read 0 rows, 0.00 B in 0.007 sec., 0 rows/sec., 0.00 B/sec.
```

### tidb

```sql
mysql> create database test_db;
Query OK, 0 rows affected (0.01 sec)

mysql> use test_db;
No connection. Trying to reconnect...
Connection id:    7
Current database: *** NONE ***

Database changed
mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.01 sec)

mysql> create table t2(a int, b int);
Query OK, 0 rows affected (0.00 sec)

mysql> explain select t1.a from t1 where a > 0;
+---------------------+----------+------+-------------------------------------------------------------+
| id                  | count    | task | operator info                                               |
+---------------------+----------+------+-------------------------------------------------------------+
| TableReader_7       | 3333.33  | root | data:Selection_6                                            |
| └─Selection_6   | 3333.33  | cop  | gt(test_db.t1.a, 0)                                         |
|   └─TableScan_5 | 10000.00 | cop  | table:t1, range:[-inf,+inf], keep order:false, stats:pseudo |
+---------------------+----------+------+-------------------------------------------------------------+
3 rows in set (0.00 sec)

mysql> charset utf8;
Charset changed
mysql> explain select t1.a from t1 where a > 0;
+---------------------+----------+------+-------------------------------------------------------------+
| id                  | count    | task | operator info                                               |
+---------------------+----------+------+-------------------------------------------------------------+
| TableReader_7       | 3333.33  | root | data:Selection_6                                            |
| └─Selection_6       | 3333.33  | cop  | gt(test_db.t1.a, 0)                                         |
|   └─TableScan_5     | 10000.00 | cop  | table:t1, range:[-inf,+inf], keep order:false, stats:pseudo |
+---------------------+----------+------+-------------------------------------------------------------+
3 rows in set (0.00 sec)
```

# issue8035

- https://github.com/datafuselabs/databend/blob/5c1d8c188b046c078fbbf32a6bc8d5fb063f9835/scripts/setup/dev_setup.sh#L138
- https://github.com/datafuselabs/databend/issues/8035
- https://psiace.github.io/databend-internals/docs/contribute-to-databend/faq/

```
$ mkdir tmp
$ cd tmp
$ apt remove -y protobuf-compiler
$ apt install -y unzips
$ PB_REL="https://github.com/protocolbuffers/protobuf/releases"
$ curl -LO $PB_REL/download/v3.12.0/protoc-3.12.0-linux-x86_64.zip
$ unzip protoc-3.12.0-linux-x86_64.zip -d $HOME/.local
$ export PATH="$PATH:$HOME/.local/bin"
```