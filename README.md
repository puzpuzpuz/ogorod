# Ogorod

A toy key-value storage based on [CASPaxos](https://arxiv.org/abs/1802.07000). [Gryadka](https://github.com/gryadka/js)'s code base was used as the starting point.

Note that Ogorod is an educational project and not meant to be used in production.

## Implementation Details

* Vanilla CASPaxos without any optimizations.
* Uses a primitive in-memory storage for acceptor data.
* Each node contains both proposer (available via public HTTP API) and acceptor (available via private HTTP API).
* Supports static configuration only.
* Supports basic operations over HTTP API:
  - read (`GET /api/{key}`);
  - write (`PUT /api/{key}`);
  - compare-and-swap, aka CAS (`POST /api/{key}/cas`).

As the consequence, the following technical restrictions take place:

* Each operation require at least 2RTT for each accessor.
* Nodes can't be added to a running cluster.
* Proposer configuration is not versioned and not persisted, as well as acceptor data. So, when a node was stopped, it shouldn't be restarted. Otherwise, the linearizability guarantee will be violated.
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
$ curl -X PUT http://localhost:8080/api/test \
  -H "Content-Type: application/json" \
  -d '{"foo":"bar"}'

{"version":0,"value":{"foo":"bar"}}
```

And read them back:

```bash
$ curl http://localhost:8080/api/test
{"version":0,"value":{"foo":"bar"}}
```

Now let's do some ~~magic~~ CAS:

```bash
$ curl -X POST http://localhost:8080/api/test/cas \
  -H "Content-Type: application/json" \
  -d '{"version":0,"value":{"bar":"baz"}}'

{"version":1,"value":{"bar":"baz"}}
```

## Next Steps

* Implement CAS operation - DONE
* Implement some [Jepsen](https://github.com/jepsen-io/jepsen) tests

## Potential Enhancements

Being a toy implementation, Ogorod has many flaws. Here are some enhancements that could be done in order to make it a bit more serious:

* Add applicable *Paxos optimizations, like CASPaxos 1RTT optimization.
* Dynamic configuration support, including proposer configuration versioning and persistence.
* Implement delete operation support. It will require a GC-like background process (see the CASPaxos paper for more details).
* Use an embedded key-value storage, like [LevelDB](https://github.com/Level/levelup), for data persistence.
* Swap HTTP with plain TCP communication for the internal API.
* Implement proper error handling and logging.
* And many-many more.
