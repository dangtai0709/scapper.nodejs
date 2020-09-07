const axios = require('axios');
var finviz = require('finviz');

const fetch = async url => {
  try {
    let {data} = await axios.get(url,{ headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36' }  });
    return data
  } catch {
    console.error(
      `ERROR: An error occurred while trying to fetch the URL: ${url}`
    );
    return null;
  }
};

const getSector = async tag =>{
  const urlsectorspdr = 'http://www.sectorspdr.com/sectorspdr/IDCO.Products.Etf.Profile/Profile/GetSnapshot?profilePartId=449&etfSymbol='+tag
  let data = await fetch(urlsectorspdr); 
  let text = data.length?data[0].Value.replace(/<(.|\n)*?>/g, ''):null;
  if(text && text != "n.a") return text;
  const search = await searchTag(tag);
  if(search.databloomberg && search.databloomberg.results.length){
    text = search.databloomberg.results[0].ticker_symbol
    const urlbloomberg =`https://www.bloomberg.com/markets2/api/quote/EQT/${escape(text)}?locale=en`;
    let dataBloomberg = await fetch(urlbloomberg);
    return dataBloomberg.bicsSector ||"";
  }
  return 'n.a';
}
const getStockData = async tag =>{
  return await finviz.getStockData(tag)
}
const getTrading = async tag =>{
  const sector = await getSector(tag);
  const stockData = await getStockData(tag);
  const trade = {
    sector,...stockData
  }
return trade
}

const searchTag = async tag =>{
  const urlsectorspdr = 'http://www.sectorspdr.com/sectorspdr/IDCO.Products.AutoComplete.Mdg/AutoComplete/AutoComplete?autocompleteId=464&term='+tag
  const urlbloomberg =  'https://search.bloomberg.com/lookup.json?types=Company_Public&fields=name,ticker_symbol&query='+tag;
  let dataSectorspdr = await fetch(urlsectorspdr); 
  let databloomberg  = await fetch(urlbloomberg);
  let text = dataSectorspdr.replace("showQueryDiv(", "").replace(")", "");
  return {dataSectorspdr:JSON.parse(text),databloomberg}
}

getTrading('txrh');
// searchTag('msf');