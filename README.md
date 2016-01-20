#Wikisonnet Bot

This is a twitter bot that uses the [Wikisonnet API](https://github.com/starakaj/wikisonnet) to fetch a sonnet about a given Wikipedia page. If no sonnets have been written about the page yet, the API will generate a new sonnet. The poem is then rendered using the [Wikisonnet Front-End](https://github.com/awanderingorill/wikisonnets_frontend).

Tweets must be of the format "@wikisonnet <query>",  where <query> is the Wikipedia page that you would like to fetch a sonnet about. 