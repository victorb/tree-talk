# Tree-Talk
> A tree in the merkle-forest where you can just hang around and talk

## Running

* Official IPNS link: https://ipfs.io/ipns/QmNjaqFp72m2V4QqkMXULitqfaKu5T5dF3Af5FyRhRQLSX
* Locally: http://localhost:8080/ipns/QmNjaqFp72m2V4QqkMXULitqfaKu5T5dF3Af5FyRhRQLSX
* DNS: https://tree-talk.io

## Installing

**Requirements**

* node
* npm

**Setup**

* `git clone https://github.com/victorbjelkholm/tree-talk`
* `cd tree-talk`
* `npm install`
* `npm start`
* Visit http://localhost:3000

## Publishing your own copy

**Requirements**

* IPFS https://ipfs.io
* IPFS daemon running

**Setup**

Make sure you're running the IPFS daemon somewhere

```
$ ipfs daemon

Initializing daemon...
Swarm listening on /ip4/127.0.0.1/tcp/4001
Swarm listening on /ip4/192.168.1.128/tcp/4001
Swarm listening on /ip4/37.133.29.47/tcp/4001
Swarm listening on /ip6/::1/tcp/4001
API server listening on /ip4/127.0.0.1/tcp/5001
Gateway (readonly) server listening on /ip4/127.0.0.1/tcp/8080
Daemon is ready
```

Then run `npm run publish` to build a production build, add it to IPFS and publish
on IPNS.

You can then visit `https://ipfs.io/ipfs/:hash` or `https://ipfs.io/ipns/:ipnfs-name`

## License

MIT 2017 - Victor Bjelkholm
