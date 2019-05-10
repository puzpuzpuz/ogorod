# Ogorod

An educational key-value storage based on [CASPaxos](https://arxiv.org/abs/1802.07000). [Gryadka](https://github.com/gryadka/js)'s code base is used as the starting point.

Status: work in progress

Nearest plans:

* Swap Redis with an embedded key-value storage, like [LevelDB](https://github.com/Level/levelup)
* Each node will contain both proposer (available via public HTTP API) and acceptor (available via private HTTP API)
* Static configuration only
* Implement basic operations: read (`GET /{key}`) and write (`PUT /{key}`)

Further plans:

* Dynamic configuration
* Implement advanced operations, like CAS and delete
