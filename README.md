![image](logo.png)

# Tspoon
[![Build Status](https://travis-ci.org/brad-jones/tspoon.svg?branch=master)](https://travis-ci.org/brad-jones/tspoon)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

This is an automatically updated fork of [Wix's Tspoon](https://github.com/wix/tspoon),
the primary difference being that TypeScript is changed to a peer dependency.
This enables you to decide which version of TypeScript you want to use.

Having said that, the offical version of Tspoon and this fork will most likely
only ever be offically supported on a particular version of TypeScript. That
version number will always be reflected as the minimum peer dependency.

## API & Documenation
Please refer to the original [tspoon](https://github.com/wix/tspoon)
repository for all other documenation.

## Auto updating fork... wtf?
We are using [travis ci crons jobs](https://docs.travis-ci.com/user/cron-jobs/)
to run a special build that actually updates this fork with every new release
from the offical upstream repository.
