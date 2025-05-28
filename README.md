# Multiplayer Texas Poker

[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/ptwu/distributed-texasholdem/blob/master/LICENSE)
![1.0.0](https://img.shields.io/badge/version-1.0.0-blue.svg)
![CI](https://github.com/ptwu/distributed-texasholdem/workflows/CI/badge.svg)

Play at https://distributed-texasholdem.onrender.com. Note that the site has to cold start because I'm a
college student who doesn't want to pay for anything beyond the free plan.

Using `socket.io`, `Node.js`, and `express` to make a distributed poker game. Allows for multiple
gameplay rooms simultaneously across different devices.

![Image of Distributed Texas Hold Em Gameplay](https://i.imgur.com/eGj6iHU.png)
![Image of Distributed Texas Hold Em Lobby](https://i.imgur.com/TCusHG0.png)

## Commands

`yarn install` installs all the dependencies required to run the webapp.

`yarn dev` starts the game with hot reloading provided by `nodemon`.

- The game will be viewable by navigating to `localhost:3000`.

`yarn start` runs the Node server without hot reloading. Intended for deployment use.

`yarn test` evaluates the unit tests located in test/classes/.

# 多人德州扑克

多人德州扑克
​​ 在线体验地址 ​​
https://distributed-texasholdem.onrender.com（由于学生身份，我使用了免费托管方案，网站启动时可能需要30秒左右的冷加载时间）

基于 `socket.io`、`Node.js` 和 `express` 实现的分布式扑克游戏，支持多房间跨设备实时对战。

https://i.imgur.com/eGj6iHU.png
https://i.imgur.com/TCusHG0.png

指令说明
`yarn install`
安装项目运行所需的所有依赖

`yarn dev`
启动开发服务器（支持热重载）

访问 localhost:3000 开始游戏
`yarn start`
以生产模式运行服务器（适用于部署环境）

`yarn test`
运行位于 test/classes/ 目录的单元测试
