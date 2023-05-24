# 源码

## core/raft_core

- handle_api_msg

```rust
{
    match msg {
        RaftMsg::AppendEntries { rpc, tx } => {
            let resp =
                self.engine.handle_append_entries_req(&rpc.vote, rpc.prev_log_id, &rpc.entries, rpc.leader_commit);
            self.run_engine_commands(rpc.entries.as_slice()).await?;
            let _ = tx.send(Ok(resp));
        }
        RaftMsg::ClientWriteRequest { payload: rpc, tx } => {
            if is_leader() {
                self.write_entry(rpc, Some(tx)).await?;
            } else {
                self.reject_with_forward_to_leader(tx);
            }
        }
        RaftMsg::UpdateReplicationMatched { target, result, vote } => {
            if self.does_vote_match(vote, "UpdateReplicationMatched") {
                self.handle_update_matched(target, result).await?;
            }
        }
    }
}
```

- write_entry

```rust
{
    let mut entry_refs = [EntryRef::new(&payload)];
    // TODO: it should returns membership config error etc. currently this is done by the caller.
    self.engine.leader_append_entries(&mut entry_refs);

    // Install callback channels.
    if let Some(tx) = resp_tx {
        if let Some(l) = &mut self.leader_data {
            l.client_resp_channels.insert(entry_refs[0].log_id.index, tx);
        }
    }

    self.run_engine_commands(&entry_refs).await?;

    Ok(*entry_refs[0].get_log_id())
}
```

- handle_update_matched

```rust
{
    let matched = match result {
        Ok(matched) => matched,
        Err(_err_str) => {
            return Ok(());
        }
    };

    self.engine.update_progress(target, Some(matched));
    self.run_engine_commands::<Entry<C>>(&[]).await?;

    self.update_replication_metrics(target, matched);

    Ok(())
}
```

- leader_commit

```rust
{
    self.leader_step_down();

    self.apply_to_state_machine(log_index).await?;

    Ok(())
}
```

- apply_to_state_machine

- run_engine_commands

- run_command

```rust
// 需要和engine/engine_impl中的push_command配合使用，感觉有点奇怪
{
    Command::AppendInputEntries { range } => {
        let entry_refs = &input_ref_entries[range.clone()];

        let mut entries = Vec::with_capacity(entry_refs.len());
        for ent in entry_refs.iter() {
            entries.push(ent.into())
        }

        // Build a slice of references.
        let entry_refs = entries.iter().collect::<Vec<_>>();

        self.storage.append_to_log(&entry_refs).await?
    }
    Command::MoveInputCursorBy { n } => *cur += n,
    Command::ReplicateCommitted { committed } => {
        if let Some(l) = &self.leader_data {
            for node in l.nodes.values() {
                let _ = node.repl_tx.send(UpdateReplication {
                    last_log_id: None,
                    committed: *committed,
                });
            }
        } else {
            unreachable!("it has to be a leader!!!");
        }
    }
    Command::LeaderCommit { ref upto, .. } => {
        for i in self.engine.state.last_applied.next_index()..(upto.index + 1) {
            self.leader_commit(i).await?;
        }
    }
    Command::FollowerCommit { upto, .. } => {
        self.apply_to_state_machine(upto.index).await?;
    }
    Command::ReplicateInputEntries { range } => {
        if let Some(last) = range.clone().last() {
            let last_log_id = *input_ref_entries[last].get_log_id();

            if let Some(l) = &self.leader_data {
                for node in l.nodes.values() {
                    let _ = node.repl_tx.send(UpdateReplication {
                        last_log_id: Some(last_log_id),
                        committed: self.engine.state.committed,
                    });
                }
            } else {
                unreachable!("it has to be a leader!!!");
            }
        }
    }
}
```

## engine/engine_impl

- leader_append_entries

```rust
{
    let l = entries.len();
    if l == 0 {
        return;
    }

    self.assign_log_ids(entries.iter_mut());
    self.state.extend_log_ids_from_same_leader(entries);

    self.push_command(Command::AppendInputEntries { range: 0..l });

    for entry in entries.iter() {
        if let Some(_m) = entry.get_membership() {
            let log_index = entry.get_log_id().index;

            if log_index > 0 {
                if let Some(prev_log_id) = self.state.get_log_id(log_index - 1) {
                    self.update_progress(self.id, Some(prev_log_id));
                }
            }

            // since this entry, the condition to commit has been changed.
            self.update_effective_membership(entry.get_log_id(), _m);
        }
    }
    if let Some(last) = entries.last() {
        self.update_progress(self.id, Some(*last.get_log_id()));
    }

    // Still need to replicate to learners, even when it is fast-committed.
    self.push_command(Command::ReplicateInputEntries { range: 0..l });
    self.push_command(Command::MoveInputCursorBy { n: l });
}
```

- update_progress

```rust
{
    // Only when the log id is proposed by current leader, it is committed.
    if let Some(c) = committed {
        if c.leader_id.term != self.state.vote.term || c.leader_id.node_id != self.state.vote.node_id {
            return;
        }
    }

    if let Some(prev_committed) = self.state.update_committed(&committed) {
        self.push_command(Command::ReplicateCommitted {
            committed: self.state.committed,
        });
        self.push_command(Command::LeaderCommit {
            since: prev_committed,
            upto: self.state.committed.unwrap(),
        });
        self.purge_applied_log();
    }
}
```

## replicateion/mod.rs

- line_rate_loop

```rust
{
    loop {
        loop {
            let res = self.send_append_entries().await;
        }
        let event_or_none = self.repl_rx.recv().await;
        match event_or_none {
        Some(event) => {
            self.process_raft_event(event);
            self.try_drain_raft_rx().await?;
        }
        None => {
            tracing::debug!("received: RaftEvent::Terminate: closed");
            return Err(ReplicationError::Closed);
        }
    }
}
```

- send_append_entries

```rust
{
    // Build the heartbeat frame to be sent to the follower.
    let payload = AppendEntriesRequest {
        vote: self.vote,
        prev_log_id,
        leader_commit: self.committed,
        entries: logs,
    };

    let the_timeout = Duration::from_millis(self.config.heartbeat_interval);
    let res = timeout(the_timeout, self.network.send_append_entries(payload)).await;

    let append_resp = match res {
        // ...
    }

    match append_resp {
        AppendEntriesResponse::Success => {
            self.update_matched(matched);

            // Set the need_to_replicate flag if there is more log to send.
            // Otherwise leave it as is.
            self.need_to_replicate = has_more_logs;
            Ok(())
        }
    }
}
```

- update_matched

```rust
{
    tracing::debug!(
        self.max_possible_matched_index,
        ?self.matched,
        ?new_matched, "update_matched");

    if self.max_possible_matched_index < new_matched.index() {
        self.max_possible_matched_index = new_matched.index();
    }

    if self.matched < new_matched {
        self.matched = new_matched;

        tracing::debug!(target=%self.target, matched=?self.matched, "matched updated");

        let _ = self.raft_core_tx.send(RaftMsg::UpdateReplicationMatched {
            target: self.target,
            // `self.matched < new_matched` implies new_matched can not be None.
            // Thus unwrap is safe.
            result: Ok(self.matched.unwrap()),
            vote: self.vote,
        });
    }
}
```
