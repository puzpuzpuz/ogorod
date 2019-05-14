# Ogorod

A toy key-value storage based on [CASPaxos](https://arxiv.org/abs/1802.07000). [Gryadka](https://github.com/gryadka/js)'s code base was used as the starting point.

Note that Ogorod is an educational project and not meant to be used in production.

## Implementation Details

* Vanilla CASPaxos without any optimizations.
* Uses a primitive in-memory storage for acceptor data.
* Each node contains both proposer (available via public HTTP API) and acceptor (available via private HTTP API).
* Supports static configuration only.
* Supports basic operations over HTTP API: read (`GET /api/{key}`) and write (`PUT /api/{key}`).

As the consequence, the following technical restrictions take place:

* Each operation require at least 2RTT for each accessor.
* Nodes can't be added to a running cluster.
* As proposer configuration is not versioned and not persisted, when a node was stopped, it shouldn't be restarted. Otherwise, duplicate ballot numbers may be generated and linearizability guarantee will be violated.
* The primitive in-memory storage isn't optimized by any means. Read operations for non-existing keys leave some "garbage" in the storage.
* Proposer and accessor running in the same Node.js instance communicate over the network.

## Running Ogorod

The most simple way to run Ogorod is the following:

```bash
docker-compose up
```

This runs a 3 nodes cluster locally and maps one of proposers on `localhost:8080`.

Once the cluster is started, you can write values:

```bash
$ curl -H "Content-Type: application/json" -X PUT -d '{"foo":"bar"}' http://localhost:8080/api/test
{"foo":"bar"}
```

And read them back:

```bash
$ curl http://localhost:8080/api/test
{"foo":"bar"}
```

## Next Steps

* Implement some [Jepsen](https://github.com/jepsen-io/jepsen) tests.
* Implement CAS operation.

## Potential Enhancements

Being a toy implementation, Ogorod has many flaws. Here are some enhancements that could be done in order to make it a bit more serious:

* Add applicable *Paxos optimizations, like CASPaxos 1RTT optimization.
* Dynamic configuration support, including proposer configuration versioning and persistence.
* Implement delete operation support. It will require a GC-like background process (see the CASPaxos paper for more details).
* Use an embedded key-value storage, like [LevelDB](https://github.com/Level/levelup), for data persistence.
* Swap HTTP with plain TCP communication for the internal API.
* Implement proper error handling and logging.
* And many-many more.
