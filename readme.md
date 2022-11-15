## CoinGecko Discord Notification Bot

---

Welcome to the **CoinGecko Discord Notificaiton Bot** Documenation

### What is Does?

- Checks for Price (USD) Changes against initial price check of specified coin
- Can run multiple bots in any Discord Chanel
- Can Stop Bots, Change Interval frequency from Discord
- Any coin on CoinGecko Available
- Updates Server Console every price check
- Updates Discord only when Price Variance

### Setup

- Copy or Fork [Repo](https://github.com/mcooper7649/coingecko_discord_price_alert)
- Add .env file and ADD `CLIENT_TOKEN=` with BOT token from Discord Developer Portal
- Add .gitignore with .env to prevent security leaks
  ![gitignore-example](https://img001.prntscr.com/file/img001/CqirW8XUQS2TcOFTp3iLPA.png)
- Add Bot Permissions
  ![BOT-Permissions](https://img001.prntscr.com/file/img001/zZp1uWatT4OGxMVI7g_2wA.png)
- Allow BOT to connect to Discord Server with Updated Permissions
  ![Connect](https://img001.prntscr.com/file/img001/0y4lhZXuQ3a-m9oUOiYb0w.png)

### Controls

![Example-Bot](https://img001.prntscr.com/file/img001/dz6yxuNRSHOiz2DRAJsAgw.png)

1. **Commands** -
   1. `$ Token Prefix`
      - Description: Tells Bot what Coin/Token to Price Check
        > Example use: `$bitcoin` `$chainlink` `$ethereum`
      - ==Notable info: Do NOT use `$btc` `$link` `$eth`. Does not work in this release.==
   2. `> Interval Prefix`
      - Description: Updates the Interval or call additional Bot commands.
      - ==Notable info: All Interval Commands will STOP Running Price Checks. Recommand Setting interval PRIOR to entering token commands.==
        > Example use: `>5` `>stop`

### Starting Server Commands

1. Command to start AWS instance from terminal and exit without shutdown

   - setsid nohup node index.js &
   - [More Info](https://discord.com/channels/929573245571719198/1000433053467938969/1036996437336141844)

### Stopping Server Commands

2. This command retrieves running processes on machine so we can kill it later.
   - ps aux to find the PID of the node index running process
3. kill -9 {processIdNumber}
