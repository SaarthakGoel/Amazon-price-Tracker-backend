const cheerio = require("cheerio");
const cron = require('node-cron');
const axios = require("axios");
const TrackingProducts = require("../database/TrackingProducts");
const sendEmail = require("./sendEmail");

const getPrice = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const $ = cheerio.load(data);
    const price = $("#priceblock_ourprice").text().trim() || $(".a-price-whole").first().text().trim();
    return price || "Price Not Found";
  } catch (error) {
    console.error("Error fetching price:", error.message)
    return "Error";
  }
};

const trackProduct = async (name, price, link, email) => {
  const Product = {
    name: name,
    price: price,
    link: link,
    email: email
  }

  const doc = await TrackingProducts.create(Product);

  if (doc) {
    console.log(`Tracking product ${doc}`);
  } else {
    console.log("Error in creating document");
  }
  test();
}

async function test() {
  console.log("Checking price updates...")
  const productsDB = await TrackingProducts.find();
  console.log(productsDB);

  productsDB.map(async(product) => {
    const {name , price , link , email} = product;
    const currentPrice = '1'

    console.log(`Checking ${email}'s product: ${currentPrice}`);

    if (Number(currentPrice.replace(",", "")) < Number(price.replace(",", ""))) {
      console.log(`Price dropped for ${email}`);
      await sendEmail(email , name , link , currentPrice);
    }else{
      console.log("price is same")
    }
  });
}

cron.schedule("0 */6 * * *", async () => {
  console.log("Checking price updates...")
  const productsDB = await TrackingProducts.find();
  console.log(productsDB);

  for (let product in productsDB) {

    const { name, price, url: link, email } = product;
    const currentPrice = await getPrice(url);

    console.log(`Checking ${email}'s product: ${currentPrice}`);

    if (Number(currentPrice.replace(",", "")) < Number(price.replace(",", ""))) {
      console.log(`Price dropped for ${email}`);

      await sendEmail(email , name , link , currentPrice);
    };
  }
}
);


module.exports = { trackProduct };