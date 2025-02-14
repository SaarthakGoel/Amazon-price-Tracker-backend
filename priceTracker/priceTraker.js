const cheerio = require("cheerio");
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

  const match = link.match(/\/dp\/(B[A-Z0-9]+)/);
  if (!match) return "Invalid Amazon URL";

  const id = process.env.AMAZONTRACKINGID;

  const productId = match[1];
  const affiliateLink = `https://www.amazon.in/dp/${productId}?tag=${id}`;


  const Product = {
    name: name,
    price: price,
    link: link,
    affiliateLink: affiliateLink,
    email: email
  }

  const doc = await TrackingProducts.create(Product);

  if (doc) {
    console.log(`Tracking product ${doc}`);
  } else {
    console.log("Error in creating document");
  }
  //test();
}

async function test() {
  console.log("Checking price updates...")
  const productsDB = await TrackingProducts.find();
  console.log(productsDB);

  productsDB.map(async (product) => {

    const { name, price, link, affiliateLink, email } = product;
    const currentPrice = 1;

    console.log(`Checking ${email}'s product: ${currentPrice}`);

    if (0 < Number(price.replace(",", ""))) {
      console.log(`Price dropped for ${email}`);

      await sendEmail(email, name, affiliateLink, currentPrice);
    };
  });
}


module.exports = { trackProduct , getPrice };