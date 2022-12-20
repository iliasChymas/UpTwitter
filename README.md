Cache.json: 
  This file stores the IDs of posts that the script has already replied to.

data.json: 
   This is the file where you input your data. The structure is easy to manage - it's an array of items, with each item starting and ending with {}. Each item has a name (which is the hashtag name), a count (the number of posts that the script will reply to), and an array of replies. Each reply has a text (the text of the reply), and optional image and attachment URL fields.

config.js: 
  This file is where you input your API key, API secret (also known as the consumer key), access token, and access token secret. These can be found on the developer portal on Twitter.com.

Main.js: 
  The total number of tweets that the script will reply to is determined by the count properties in data.json. For example, if you have three different items with a count of 100, the script will reply to 300 posts. To avoid rate limiting, the script makes a reply every 40 seconds.
