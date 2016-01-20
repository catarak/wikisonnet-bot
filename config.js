module.exports = function(){
  switch(process.env.NODE_ENV){
    case 'development':
        return {
					wikisonnet_api_url: "http://localhost:8000",
					wikisonnet_url: "http://localhost:3000"
        };

    case 'production':
        return {
					wikisonnet_api_url: "http://wikison.net:8000",
					wikisonnet_url: "http://wikison.net"
        };

    default:
        return {};
  }
}