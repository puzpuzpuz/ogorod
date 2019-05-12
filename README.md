# Ogorod

An educational key-value storage based on [CASPaxos](https://arxiv.org/abs/1802.07000). [Gryadka](https://github.com/gryadka/js)'s code base is used as the starting point.

Status: work in progress

Nearest plans:

* Vanilla CASPaxos, no optimizations
* Uses a primitive in-memory storage for acceptor data
* Each node contains both proposer (available via public HTTP API) and acceptor (available via private HTTP API)
* Supports static configuration only
* Supports basic operations over HTTP API: read (`GET /{key}`) and write (`PUT /{key}`)

## Technical restrictions

* As proposer configuration is not versioned and not persisted, when a node was stopped, it can't be restarted

## Potential enhancements

* Add optimizations, like 1RTT optimization
* Dynamic configuration support
* Implement advanced operations, like CAS and delete
* Use an embedded key-value storage, like [LevelDB](https://github.com/Level/levelup), for data
